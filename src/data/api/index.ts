import { CrisisId, CrisisDataPoint, GlobalSummary, CrisisCountrySummary, CorrelationData } from '../../types';
import { getCrisisDefinition } from '../crisisDefinitions';
import { getFallbackData } from '../static/fallbackData';
import { countries } from '../static/countries';
import { getCrisisDataFromWB } from './worldBank';

// ============================================================
// Main data fetching with API-first, static-fallback strategy
// ============================================================

// Map crisis metric IDs to World Bank indicator IDs
const METRIC_TO_WB: Record<string, string> = {
  'co2-per-capita': 'co2-per-capita',
  'poverty-headcount': 'poverty-headcount',
  'gini-coefficient': 'gini-coefficient',
  'pm25-annual': 'pm25-annual',
  'health-expenditure-per-capita': 'health-expenditure',
};

/**
 * Fetch data for a specific crisis metric.
 * Tries live World Bank API first, falls back to static data.
 */
export async function fetchCrisisData(
  crisisId: CrisisId,
  metricId: string
): Promise<CrisisDataPoint[]> {
  // Try live API if it's a World Bank metric
  if (METRIC_TO_WB[metricId]) {
    try {
      const liveData = await getCrisisDataFromWB(metricId, 2023);
      if (liveData.length > 0) {
        console.log(`Live data: ${crisisId}/${metricId} (${liveData.length} points)`);
        return liveData;
      }
    } catch (err) {
      console.warn(`Live API failed for ${crisisId}/${metricId}, using fallback`);
    }
  }

  // Fall back to static data
  const data = getFallbackData(crisisId).filter(d => d.metricId === metricId);
  console.log(`Static data: ${crisisId}/${metricId} (${data.length} points)`);
  return data;
}

/**
 * Compute a composite score (0-100) for each country for a given crisis.
 * Higher = worse for "higherIsWorse" metrics, normalized and averaged.
 */
function computeCountrySummaries(
  crisisId: CrisisId,
  dataPoints: CrisisDataPoint[]
): CrisisCountrySummary[] {
  const crisis = getCrisisDefinition(crisisId);
  const countryMap = new Map<string, Record<string, number>>();

  // Group data by country
  for (const dp of dataPoints) {
    if (!countryMap.has(dp.countryIso3)) {
      countryMap.set(dp.countryIso3, {});
    }
    countryMap.get(dp.countryIso3)![dp.metricId] = dp.value;
  }

  const summaries: CrisisCountrySummary[] = [];

  for (const [iso3, metrics] of countryMap) {
    const country = countries.find(c => c.iso3 === iso3);
    if (!country) continue;

    // Normalize each metric to 0-100 scale
    const allValues = Object.entries(metrics);
    if (allValues.length === 0) continue;

    // Collect all values for each metric across all countries for min-max normalization
    let compositeScore = 0;
    let metricCount = 0;

    for (const [metricId, value] of allValues) {
      const metricDef = crisis.metrics.find(m => m.id === metricId);
      if (!metricDef) continue;

      const allMetricValues = dataPoints
        .filter(d => d.metricId === metricId)
        .map(d => d.value);
      const minVal = Math.min(...allMetricValues);
      const maxVal = Math.max(...allMetricValues);
      const range = maxVal - minVal || 1;

      // Normalize to 0-100 (0 = best, 100 = worst)
      let normalized = ((value - minVal) / range) * 100;
      if (!metricDef.higherIsWorse) {
        normalized = 100 - normalized; // Invert so higher is always worse
      }

      compositeScore += normalized;
      metricCount++;
    }

    compositeScore = metricCount > 0 ? compositeScore / metricCount : 0;

    // Determine trend (simplified: based on composite score percentile)
    let trend: CrisisCountrySummary['trend'] = 'stable';
    if (compositeScore > 70) trend = 'critical';
    else if (compositeScore > 50) trend = 'worsening';
    else if (compositeScore < 30) trend = 'improving';

    summaries.push({
      countryIso3: iso3,
      countryName: country.name,
      metrics,
      compositeScore: parseFloat(compositeScore.toFixed(1)),
      trend,
    });
  }

  // Sort by composite score (highest = worst)
  summaries.sort((a, b) => b.compositeScore - a.compositeScore);
  return summaries;
}

/**
 * Fetch a global summary for a specific crisis dimension.
 */
export async function fetchGlobalSummary(crisisId: CrisisId): Promise<GlobalSummary> {
  const crisis = getCrisisDefinition(crisisId);
  const allData: CrisisDataPoint[] = [];

  // Fetch data for each metric
  for (const metric of crisis.metrics) {
    try {
      const data = await fetchCrisisData(crisisId, metric.id);
      allData.push(...data);
    } catch {
      console.warn(`No data for ${crisisId}/${metric.id}`);
    }
  }

  const summaries = computeCountrySummaries(crisisId, allData);

  if (summaries.length === 0) {
    // Emergency fallback: return empty summary
    return {
      totalCountries: 0,
      crisisId,
      averageScore: 0,
      worstCountries: [],
      bestCountries: [],
      globalTrend: 'stable',
      yearRange: [2023, 2023],
    };
  }

  const avgScore = summaries.reduce((sum, s) => sum + s.compositeScore, 0) / summaries.length;

  let globalTrend: GlobalSummary['globalTrend'] = 'stable';
  if (avgScore > 55) globalTrend = 'worsening';
  else if (avgScore > 70) globalTrend = 'critical';
  else if (avgScore < 35) globalTrend = 'improving';

  return {
    totalCountries: summaries.length,
    crisisId,
    averageScore: parseFloat(avgScore.toFixed(1)),
    worstCountries: summaries.slice(0, 10),
    bestCountries: [...summaries].reverse().slice(0, 10),
    globalTrend,
    yearRange: [2023, 2023],
  };
}

/**
 * Fetch all crisis summaries in parallel.
 */
export async function fetchAllCrisisSummaries(): Promise<Record<CrisisId, GlobalSummary>> {
  const crisisIds: CrisisId[] = [
    'climate', 'pollution', 'poverty', 'cybercrime',
    'food-security', 'conflict', 'pandemic', 'biodiversity', 'democracy',
  ];

  const results = await Promise.all(
    crisisIds.map(async (id) => {
      try {
        return { id, summary: await fetchGlobalSummary(id) };
      } catch (err) {
        console.error(`Failed to fetch summary for ${id}:`, err);
        return { id, summary: createEmptySummary(id) };
      }
    })
  );

  const record = {} as Record<CrisisId, GlobalSummary>;
  for (const { id, summary } of results) {
    record[id] = summary;
  }
  return record;
}

function createEmptySummary(crisisId: CrisisId): GlobalSummary {
  return {
    totalCountries: 0,
    crisisId,
    averageScore: 0,
    worstCountries: [],
    bestCountries: [],
    globalTrend: 'stable',
    yearRange: [2023, 2023],
  };
}

/**
 * Fetch cross-crisis correlation data.
 * Computes Pearson correlations between crisis composite scores.
 */
export async function fetchCorrelationData(): Promise<CorrelationData[]> {
  const crisisIds: CrisisId[] = [
    'climate', 'pollution', 'poverty', 'cybercrime',
    'food-security', 'conflict', 'pandemic', 'biodiversity', 'democracy',
  ];

  // Get country-level composite scores for all crises
  const allSummaries = await fetchAllCrisisSummaries();
  const countryScores: Record<string, Record<CrisisId, number>> = {};

  for (const crisisId of crisisIds) {
    const summary = allSummaries[crisisId];
    for (const cs of [...summary.worstCountries, ...summary.bestCountries]) {
      if (!countryScores[cs.countryIso3]) {
        countryScores[cs.countryIso3] = {} as Record<CrisisId, number>;
      }
      countryScores[cs.countryIso3][crisisId] = cs.compositeScore;
    }
  }

  // Compute correlations between each pair
  const correlations: CorrelationData[] = [];
  const commonCountries = Object.keys(countryScores).filter(
    iso3 => Object.keys(countryScores[iso3]).length >= 4
  );

  for (let i = 0; i < crisisIds.length; i++) {
    for (let j = i + 1; j < crisisIds.length; j++) {
      const a = crisisIds[i];
      const b = crisisIds[j];

      // Collect paired data
      const pairs: [number, number][] = [];
      for (const iso3 of commonCountries) {
        const scoreA = countryScores[iso3]?.[a];
        const scoreB = countryScores[iso3]?.[b];
        if (scoreA !== undefined && scoreB !== undefined) {
          pairs.push([scoreA, scoreB]);
        }
      }

      if (pairs.length < 5) continue;

      const { r, pValue } = pearsonCorrelation(pairs);

      // Generate description
      const defA = getCrisisDefinition(a);
      const defB = getCrisisDefinition(b);
      let description = '';
      const absR = Math.abs(r);

      if (absR > 0.6) {
        description = r > 0
          ? `Strong positive link: countries with worse ${defA.shortLabel.toLowerCase()} tend to have worse ${defB.shortLabel.toLowerCase()}.`
          : `Strong negative link: countries with worse ${defA.shortLabel.toLowerCase()} tend to have better ${defB.shortLabel.toLowerCase()}.`;
      } else if (absR > 0.3) {
        description = r > 0
          ? `Moderate positive association between ${defA.shortLabel.toLowerCase()} and ${defB.shortLabel.toLowerCase()}.`
          : `Moderate negative association between ${defA.shortLabel.toLowerCase()} and ${defB.shortLabel.toLowerCase()}.`;
      } else {
        description = `Weak relationship between ${defA.shortLabel.toLowerCase()} and ${defB.shortLabel.toLowerCase()}.`;
      }

      correlations.push({
        crisisA: a,
        crisisB: b,
        pearsonR: parseFloat(r.toFixed(4)),
        pValue: parseFloat(pValue.toFixed(6)),
        description,
      });
    }
  }

  // Sort by absolute correlation strength
  correlations.sort((a, b) => Math.abs(b.pearsonR) - Math.abs(a.pearsonR));
  return correlations;
}

/**
 * Compute Pearson correlation coefficient and p-value.
 */
function pearsonCorrelation(pairs: [number, number][]): { r: number; pValue: number } {
  const n = pairs.length;
  if (n < 3) return { r: 0, pValue: 1 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const [x, y] of pairs) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return { r: 0, pValue: 1 };

  const r = numerator / denominator;

  // t-statistic for p-value
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  // Simplified p-value approximation (two-tailed)
  const pValue = 2 * (1 - tCDF(Math.abs(t), n - 2));

  return { r, pValue: Math.min(pValue, 1) };
}

// Student's t CDF approximation
function tCDF(t: number, df: number): number {
  const x = df / (df + t * t);
  return 0.5 * (1 + regularizedIncompleteBeta(df / 2, 0.5, x));
}

// Regularized incomplete beta function (simplified)
function regularizedIncompleteBeta(a: number, b: number, x: number): number {
  if (x < 0 || x > 1) return 0;
  // Simpson's rule integration
  const steps = 200;
  const h = x / steps;
  let sum = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i * h;
    const f = Math.pow(t, a - 1) * Math.pow(1 - t, b - 1);
    if (i === 0 || i === steps) sum += f;
    else if (i % 2 === 0) sum += 2 * f;
    else sum += 4 * f;
  }
  const betaAB = betaFunction(a, b);
  return (h / 3) * sum / betaAB;
}

function betaFunction(a: number, b: number): number {
  // Stirling's approximation
  return Math.exp(logGamma(a) + logGamma(b) - logGamma(a + b));
}

function logGamma(z: number): number {
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}
