import { CrisisDataPoint } from '../../types';

const BASE_URL = 'https://api.worldbank.org/v2';
const TIMEOUT_MS = 5000;

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

async function fetchWithTimeout(url: string, timeoutMs: number = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function cachedFetch(url: string): Promise<any> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error(`World Bank API error: ${response.status}`);
  const data = await response.json();
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

// World Bank indicators
const INDICATORS: Record<string, string> = {
  'co2-per-capita': 'EN.ATM.CO2E.PC',        // CO2 emissions (metric tons per capita)
  'poverty-headcount': 'SI.POV.DDAY',         // Poverty headcount ratio at $2.15/day
  'gini-coefficient': 'SI.POV.GINI',          // Gini index
  'gdp-per-capita': 'NY.GDP.PCAP.PP.KD',      // GDP per capita, PPP
  'population': 'SP.POP.TOTL',                 // Population, total
  'pm25-annual': 'EN.ATM.PM25.MC.M3',         // PM2.5 air pollution, mean annual exposure
  'forest-area': 'AG.LND.FRST.ZS',            // Forest area (% of land area)
  'health-expenditure': 'SH.XPD.CHEX.PC.CD',  // Current health expenditure per capita
};

interface WorldBankResponse {
  page: number;
  pages: number;
  per_page: number;
  total: number;
}

interface WorldBankDataPoint {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
}

export async function getWorldBankIndicator(
  indicatorId: string,
  year: number = 2023
): Promise<Map<string, number>> {
  const wbCode = INDICATORS[indicatorId];
  if (!wbCode) throw new Error(`Unknown indicator: ${indicatorId}`);

  const url = `${BASE_URL}/country/all/indicator/${wbCode}?format=json&per_page=300&date=${year}&mrnev=1`;
  const data: [WorldBankResponse, WorldBankDataPoint[]] = await cachedFetch(url);

  if (!data || !Array.isArray(data) || data.length < 2) {
    throw new Error(`Invalid World Bank response for ${indicatorId}`);
  }

  const result = new Map<string, number>();
  for (const dp of data[1]) {
    if (dp.value !== null && dp.countryiso3code) {
      result.set(dp.countryiso3code, dp.value);
    }
  }
  return result;
}

// Map World Bank data to our CrisisDataPoint format
export async function getCrisisDataFromWB(
  metricId: string,
  year: number = 2023
): Promise<CrisisDataPoint[]> {
  try {
    const wbData = await getWorldBankIndicator(metricId, year);
    const points: CrisisDataPoint[] = [];
    wbData.forEach((value, iso3) => {
      points.push({
        countryIso3: iso3,
        year,
        value,
        metricId,
      });
    });
    return points;
  } catch (err) {
    console.warn(`World Bank API failed for ${metricId}:`, err);
    throw err;
  }
}

// Fetch multiple indicators
export async function getMultipleIndicators(
  indicatorIds: string[],
  year: number = 2023
): Promise<Record<string, Map<string, number>>> {
  const results: Record<string, Map<string, number>> = {};
  await Promise.all(
    indicatorIds.map(async (id) => {
      try {
        results[id] = await getWorldBankIndicator(id, year);
      } catch {
        results[id] = new Map();
      }
    })
  );
  return results;
}
