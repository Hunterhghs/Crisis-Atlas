/* ============================================================
   Crisis Atlas — Type Definitions
   ============================================================ */

/** The nine tracked crisis dimensions. */
export type CrisisId =
  | 'climate'
  | 'pollution'
  | 'poverty'
  | 'cybercrime'
  | 'food-security'
  | 'conflict'
  | 'pandemic'
  | 'biodiversity'
  | 'democracy';

/** Broad classification for grouping crises. */
export type CrisisCategory = 'environmental' | 'social' | 'technological' | 'political';

/** A single tracked metric within a crisis dimension. */
export interface CrisisMetric {
  id: string;
  label: string;
  unit: string;
  description: string;
  /** `true` means a higher numeric value indicates a worse situation. */
  higherIsWorse: boolean;
}

/** Provenance information for one external data source. */
export interface DataSource {
  name: string;
  url: string;
  description: string;
  lastUpdated: string;
}

/** Complete definition of a crisis dimension. */
export interface CrisisDefinition {
  id: CrisisId;
  label: string;
  shortLabel: string;
  description: string;
  icon: string; // emoji or icon-name
  color: string;
  category: CrisisCategory;
  metrics: CrisisMetric[];
  dataSources: DataSource[];
}

/** A country record (static reference data). */
export interface CountryData {
  iso3: string;
  iso2: string;
  name: string;
  region: string;
  subregion: string;
  population: number;
  gdpPerCapita: number;
}

/** One data point for a country × metric × year. */
export interface CrisisDataPoint {
  countryIso3: string;
  year: number;
  value: number;
  metricId: string;
}

/** Aggregated view of a single country for one crisis dimension. */
export interface CrisisCountrySummary {
  countryIso3: string;
  countryName: string;
  /** metricId → latest value */
  metrics: Record<string, number>;
  /** Normalised composite score (0 = best, 1 = worst). */
  compositeScore: number;
  trend: 'improving' | 'stable' | 'worsening' | 'critical';
}

/** Global snapshot for a single crisis dimension. */
export interface GlobalSummary {
  totalCountries: number;
  crisisId: CrisisId;
  averageScore: number;
  worstCountries: CrisisCountrySummary[];
  bestCountries: CrisisCountrySummary[];
  allCountries: CrisisCountrySummary[];
  globalTrend: 'improving' | 'stable' | 'worsening' | 'critical';
  /** Inclusive year range of the underlying data. */
  yearRange: [number, number];
}

/** Pearson correlation between two crisis dimensions. */
export interface CorrelationData {
  crisisA: CrisisId;
  crisisB: CrisisId;
  /** Pearson r ∈ [-1, 1]. */
  pearsonR: number;
  pValue: number;
  description: string;
}

/** Which content panel is currently visible. */
export type PanelView = 'overview' | CrisisId | 'correlations';

/** A feature ready to render on the choropleth map. */
export interface MapFeature {
  iso3: string;
  value: number;
  rank: number;
}
