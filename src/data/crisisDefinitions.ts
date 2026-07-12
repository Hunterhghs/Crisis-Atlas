import { CrisisId, CrisisDefinition } from '../types';

const CRISIS_DEFINITIONS: CrisisDefinition[] = [
  {
    id: 'climate',
    label: 'Climate Change',
    shortLabel: 'Climate',
    description: 'Rising temperatures, extreme weather, and carbon emissions threatening planetary boundaries.',
    icon: '',
    color: '#e3120b',
    category: 'environmental',
    metrics: [
      { id: 'co2-per-capita', label: 'CO₂ per Capita', unit: 'tonnes', description: 'Annual CO₂ emissions per person', higherIsWorse: true },
      { id: 'temperature-anomaly', label: 'Temperature Anomaly', unit: '°C', description: 'Deviation from pre-industrial average', higherIsWorse: true },
      { id: 'climate-vulnerability-index', label: 'Climate Vulnerability', unit: 'index', description: 'ND-GAIN vulnerability score (0-100)', higherIsWorse: true },
    ],
    dataSources: [
      { name: 'World Bank Climate Data', url: 'https://data.worldbank.org/topic/climate-change', description: 'CO₂ emissions, climate indicators', lastUpdated: '2024' },
      { name: 'ND-GAIN Country Index', url: 'https://gain.nd.edu/our-work/country-index/', description: 'Climate vulnerability and readiness', lastUpdated: '2024' },
    ],
  },
  {
    id: 'pollution',
    label: 'Pollution',
    shortLabel: 'Pollution',
    description: 'Air, water, and plastic pollution degrading environmental health and human wellbeing.',
    icon: '',
    color: '#8b5cf6',
    category: 'environmental',
    metrics: [
      { id: 'pm25-annual', label: 'PM2.5 Annual Mean', unit: 'μg/m³', description: 'Annual mean fine particulate matter concentration', higherIsWorse: true },
      { id: 'air-quality-index', label: 'Air Quality Index', unit: 'AQI', description: 'Composite air quality score (0-500)', higherIsWorse: true },
      { id: 'plastic-waste-per-capita', label: 'Plastic Waste', unit: 'kg/capita', description: 'Annual plastic waste generated per person', higherIsWorse: true },
    ],
    dataSources: [
      { name: 'WHO Air Quality Database', url: 'https://www.who.int/data/gho/data/themes/air-pollution', description: 'Global air quality measurements', lastUpdated: '2024' },
      { name: 'Our World in Data — Plastic Pollution', url: 'https://ourworldindata.org/plastic-pollution', description: 'Plastic waste and pollution data', lastUpdated: '2024' },
    ],
  },
  {
    id: 'poverty',
    label: 'Poverty & Inequality',
    shortLabel: 'Poverty',
    description: 'Extreme poverty, wealth concentration, and structural barriers to economic opportunity.',
    icon: '',
    color: '#f59e0b',
    category: 'social',
    metrics: [
      { id: 'poverty-headcount', label: 'Poverty Rate', unit: '%', description: 'Population below $2.15/day (2017 PPP)', higherIsWorse: true },
      { id: 'gini-coefficient', label: 'Gini Coefficient', unit: 'index', description: 'Income inequality (0=perfect equality, 100=max inequality)', higherIsWorse: true },
      { id: 'multidimensional-poverty-index', label: 'Multidimensional Poverty', unit: 'index', description: 'MPI combining health, education, living standards', higherIsWorse: true },
    ],
    dataSources: [
      { name: 'World Bank Poverty & Inequality', url: 'https://data.worldbank.org/topic/poverty', description: 'Poverty headcount, Gini, shared prosperity', lastUpdated: '2024' },
      { name: 'UNDP Human Development Reports', url: 'https://hdr.undp.org/', description: 'Multidimensional Poverty Index', lastUpdated: '2024' },
    ],
  },
  {
    id: 'cybercrime',
    label: 'Cybercrime',
    shortLabel: 'Cybercrime',
    description: 'Ransomware, data breaches, and digital infrastructure attacks rising globally.',
    icon: '',
    color: '#06b6d4',
    category: 'technological',
    metrics: [
      { id: 'cyber-attacks-per-million', label: 'Cyber Attacks', unit: 'per million', description: 'Reported cyber attacks per million population', higherIsWorse: true },
      { id: 'ransomware-incidents', label: 'Ransomware Incidents', unit: 'count', description: 'Annual ransomware attack incidents', higherIsWorse: true },
      { id: 'cyber-security-index', label: 'Cybersecurity Index', unit: 'index', description: 'ITU Global Cybersecurity Index (0-100)', higherIsWorse: false },
    ],
    dataSources: [
      { name: 'ITU Global Cybersecurity Index', url: 'https://www.itu.int/en/ITU-D/Cybersecurity/Pages/global-cybersecurity-index.aspx', description: 'National cybersecurity capabilities', lastUpdated: '2024' },
      { name: 'ENISA Threat Landscape', url: 'https://www.enisa.europa.eu/topics/cyber-threats', description: 'European cyber threat intelligence', lastUpdated: '2024' },
    ],
  },
  {
    id: 'food-security',
    label: 'Food & Water Security',
    shortLabel: 'Food Security',
    description: 'Hunger, malnutrition, water scarcity, and food system fragility under climate stress.',
    icon: '',
    color: '#84cc16',
    category: 'social',
    metrics: [
      { id: 'food-insecurity-prevalence', label: 'Food Insecurity', unit: '%', description: 'Population facing moderate or severe food insecurity', higherIsWorse: true },
      { id: 'undernourishment', label: 'Undernourishment', unit: '%', description: 'Population with insufficient caloric intake', higherIsWorse: true },
      { id: 'food-price-index', label: 'Food Price Index', unit: 'index', description: 'FAO Food Price Index relative to baseline', higherIsWorse: true },
    ],
    dataSources: [
      { name: 'FAO Food Security Indicators', url: 'https://www.fao.org/faostat/en/#data/FS', description: 'Food insecurity, undernourishment data', lastUpdated: '2024' },
      { name: 'FAO Food Price Index', url: 'https://www.fao.org/worldfoodsituation/foodpricesindex/en/', description: 'Global food commodity prices', lastUpdated: '2024' },
    ],
  },
  {
    id: 'conflict',
    label: 'Conflict & Displacement',
    shortLabel: 'Conflict',
    description: 'Armed conflict, forced displacement, and political violence reshaping populations.',
    icon: '',
    color: '#ef4444',
    category: 'political',
    metrics: [
      { id: 'conflict-deaths-per-100k', label: 'Conflict Deaths', unit: 'per 100k', description: 'Conflict-related fatalities per 100,000 population', higherIsWorse: true },
      { id: 'displaced-persons', label: 'Displaced Persons', unit: 'millions', description: 'Internally displaced + refugees', higherIsWorse: true },
      { id: 'global-peace-index', label: 'Peace Index', unit: 'score', description: 'Global Peace Index (1=most peaceful, 5=least)', higherIsWorse: true },
    ],
    dataSources: [
      { name: 'UCDP/PRIO Armed Conflict Dataset', url: 'https://ucdp.uu.se/', description: 'Conflict fatalities and events', lastUpdated: '2024' },
      { name: 'UNHCR Refugee Data', url: 'https://www.unhcr.org/refugee-statistics/', description: 'Forced displacement statistics', lastUpdated: '2024' },
      { name: 'Global Peace Index', url: 'https://www.visionofhumanity.org/', description: 'Institute for Economics & Peace', lastUpdated: '2024' },
    ],
  },
  {
    id: 'pandemic',
    label: 'Pandemic Preparedness',
    shortLabel: 'Pandemics',
    description: 'Health system resilience, vaccine coverage, and readiness for the next global outbreak.',
    icon: '',
    color: '#ec4899',
    category: 'social',
    metrics: [
      { id: 'pandemic-preparedness-index', label: 'Preparedness Index', unit: 'score', description: 'GHS Index for pandemic preparedness (0-100)', higherIsWorse: false },
      { id: 'health-expenditure-per-capita', label: 'Health Expenditure', unit: 'USD/capita', description: 'Annual health spending per person', higherIsWorse: false },
      { id: 'vaccine-coverage', label: 'Vaccine Coverage', unit: '%', description: 'DTP3 vaccination coverage among 1-year-olds', higherIsWorse: false },
    ],
    dataSources: [
      { name: 'GHS Index', url: 'https://www.ghsindex.org/', description: 'Global Health Security Index', lastUpdated: '2024' },
      { name: 'WHO Immunization Data', url: 'https://immunizationdata.who.int/', description: 'Vaccine coverage statistics', lastUpdated: '2024' },
    ],
  },
  {
    id: 'biodiversity',
    label: 'Biodiversity Loss',
    shortLabel: 'Biodiversity',
    description: 'Species extinction, habitat destruction, and ecosystem collapse at accelerating rates.',
    icon: '',
    color: '#10b981',
    category: 'environmental',
    metrics: [
      { id: 'biodiversity-intactness-index', label: 'Biodiversity Intactness', unit: '%', description: 'BII — remaining biodiversity relative to intact ecosystem', higherIsWorse: false },
      { id: 'species-at-risk', label: 'Species at Risk', unit: 'count', description: 'IUCN Red List threatened species', higherIsWorse: true },
      { id: 'forest-loss-rate', label: 'Forest Loss Rate', unit: '%/year', description: 'Annual forest cover loss percentage', higherIsWorse: true },
    ],
    dataSources: [
      { name: 'IUCN Red List', url: 'https://www.iucnredlist.org/', description: 'Threatened species database', lastUpdated: '2024' },
      { name: 'Global Forest Watch', url: 'https://www.globalforestwatch.org/', description: 'Forest cover change data', lastUpdated: '2024' },
    ],
  },
  {
    id: 'democracy',
    label: 'Democratic Backsliding',
    shortLabel: 'Democracy',
    description: 'Erosion of democratic institutions, press freedom, and rule of law worldwide.',
    icon: '',
    color: '#6366f1',
    category: 'political',
    metrics: [
      { id: 'democracy-index', label: 'Democracy Index', unit: 'score', description: 'EIU Democracy Index (0=authoritarian, 10=full democracy)', higherIsWorse: false },
      { id: 'press-freedom-score', label: 'Press Freedom', unit: 'score', description: 'RSF World Press Freedom Index (0=best)', higherIsWorse: true },
      { id: 'corruption-perception-index', label: 'Corruption Perception', unit: 'score', description: 'Transparency International CPI (0=highly corrupt, 100=very clean)', higherIsWorse: false },
    ],
    dataSources: [
      { name: 'EIU Democracy Index', url: 'https://www.eiu.com/n/campaigns/democracy-index-2024/', description: 'Economist Intelligence Unit', lastUpdated: '2024' },
      { name: 'RSF Press Freedom Index', url: 'https://rsf.org/en/index', description: 'Reporters Without Borders', lastUpdated: '2024' },
      { name: 'Transparency International CPI', url: 'https://www.transparency.org/en/cpi/', description: 'Corruption Perceptions Index', lastUpdated: '2024' },
    ],
  },
];

export function getCrisisDefinition(id: CrisisId): CrisisDefinition {
  return CRISIS_DEFINITIONS.find(c => c.id === id)!;
}

export function getAllCrisisDefinitions(): CrisisDefinition[] {
  return CRISIS_DEFINITIONS;
}

export function getCrisisColor(id: CrisisId): string {
  return CRISIS_DEFINITIONS.find(c => c.id === id)?.color ?? '#6b7280';
}
