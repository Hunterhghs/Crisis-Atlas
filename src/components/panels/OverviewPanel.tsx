import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CrisisId, GlobalSummary } from '../../types';
import { getAllCrisisDefinitions, getCrisisColor } from '../../data/crisisDefinitions';
import { CrisisDot } from '../shared/CrisisDot';
import KpiCard from '../shared/KpiCard';
import LoadingSpinner from '../shared/LoadingSpinner';

// Simplified world country geometries (low-res for performance)
// We'll load GeoJSON dynamically
const WORLD_GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

interface OverviewPanelProps {
  summaries: Record<CrisisId, GlobalSummary>;
  loading: boolean;
}

export default function OverviewPanel({ summaries, loading }: OverviewPanelProps) {
  const [selectedCrisis, setSelectedCrisis] = useState<CrisisId>('climate');
  const [geoData, setGeoData] = useState<any>(null);
  const crises = getAllCrisisDefinitions();

  useEffect(() => {
    fetch(WORLD_GEOJSON_URL)
      .then(r => r.json())
      .then(data => setGeoData(data))
      .catch(() => console.warn('Failed to load GeoJSON'));
  }, []);

  const summary = summaries[selectedCrisis];
  const crisisColor = getCrisisColor(selectedCrisis);

  const mapCenter: LatLngExpression = [20, 0];

  const getCountryStyle = (feature: any) => {
    const iso3 = feature?.properties?.ISO_A3;
    if (!iso3 || !summary) return { fillColor: '#f3f4f6', weight: 0.5, color: '#d1d5db', fillOpacity: 0.5 };

    const countrySummary = summary.worstCountries.find(c => c.countryIso3 === iso3) ??
                           summary.bestCountries.find(c => c.countryIso3 === iso3);
    const opacity = countrySummary ? 0.8 : 0.3;
    const fillColor = countrySummary
      ? crisisColor
      : '#e5e7eb';

    return {
      fillColor,
      weight: 0.5,
      color: '#ffffff',
      fillOpacity: opacity,
    };
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Header */}
      <div className="mb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-economist-red mb-2">
          Crisis Atlas
        </p>
        <h2 className="font-serif text-4xl font-bold text-economist-navy leading-tight mb-3">
          Mapping the 21st Century's<br />Interconnected Crises
        </h2>
        <p className="font-sans text-base text-economist-slate leading-relaxed max-w-2xl">
          Climate change, pollution, poverty, cybercrime, food insecurity, conflict, pandemics, 
          biodiversity loss, and democratic erosion are not separate emergencies — they are 
          different expressions of structural stress on a planet with uneven absorptive capacity. 
          This atlas maps them together.
        </p>
      </div>

      {/* Crisis Selector Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {crises.map(crisis => (
          <button
            key={crisis.id}
            onClick={() => setSelectedCrisis(crisis.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-xs font-medium transition-all duration-200 border ${
              selectedCrisis === crisis.id
                ? 'text-white border-transparent shadow-sm'
                : 'text-economist-slate border-gray-200 hover:border-gray-300 bg-white'
            }`}
            style={
              selectedCrisis === crisis.id
                ? { backgroundColor: crisis.color, borderColor: crisis.color }
                : {}
            }
          >
            <span className="flex-shrink-0"><CrisisDot color={crisis.color} size={10} /></span>
            {crisis.shortLabel}
          </button>
        ))}
      </div>

      {/* World Map */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6" style={{ height: '420px' }}>
        {geoData ? (
          <MapContainer
            center={mapCenter}
            zoom={2}
            style={{ height: '100%', width: '100%', backgroundColor: '#f8faf9' }}
            zoomControl={true}
            scrollWheelZoom={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <GeoJSON
              data={geoData}
              style={getCountryStyle}
              onEachFeature={(feature: any, layer: any) => {
                const iso3 = feature?.properties?.ISO_A3;
                const name = feature?.properties?.ADMIN || feature?.properties?.NAME || '';
                if (iso3 && summary) {
                  const cs = summary.worstCountries.find(c => c.countryIso3 === iso3) ??
                           summary.bestCountries.find(c => c.countryIso3 === iso3);
                  const metricVal = cs?.compositeScore;
                  layer.bindTooltip(
                    `<div style="font-family:Inter,sans-serif;font-size:12px;">
                      <strong>${name}</strong><br/>
                      ${metricVal !== undefined ? `Composite: ${metricVal.toFixed(1)}` : 'No data'}
                    </div>`,
                    { sticky: true }
                  );
                }
              }}
            />
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <LoadingSpinner message="Loading world map..." />
          </div>
        )}
      </div>

      {/* KPI Cards Row */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Countries Assessed"
            value={summary.totalCountries}
            subtitle="With available data for this dimension"
            color={crisisColor}
          />
          <KpiCard
            label="Global Average"
            value={summary.averageScore.toFixed(1)}
            subtitle="Composite score across all countries"
            color={crisisColor}
            trend={summary.globalTrend}
          />
          <KpiCard
            label="Most Affected"
            value={summary.worstCountries[0]?.countryName ?? 'N/A'}
            subtitle={`Score: ${summary.worstCountries[0]?.compositeScore.toFixed(1) ?? '—'}`}
            color="#e3120b"
          />
          <KpiCard
            label="Least Affected"
            value={summary.bestCountries[0]?.countryName ?? 'N/A'}
            subtitle={`Score: ${summary.bestCountries[0]?.compositeScore.toFixed(1) ?? '—'}`}
            color="#10b981"
          />
        </div>
      )}

      {/* Top 10 Worst / Best */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-economist-red mb-3">
              Most Affected Countries
            </h3>
            <div className="space-y-2">
              {summary.worstCountries.slice(0, 10).map((c, i) => (
                <div key={c.countryIso3} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-economist-muted w-5">{i + 1}</span>
                    <span className="font-sans text-sm text-economist-navy">{c.countryName}</span>
                  </div>
                  <span className="font-mono text-xs font-medium" style={{ color: crisisColor }}>
                    {c.compositeScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-green-600 mb-3">
              Least Affected Countries
            </h3>
            <div className="space-y-2">
              {summary.bestCountries.slice(0, 10).map((c, i) => (
                <div key={c.countryIso3} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-economist-muted w-5">{i + 1}</span>
                    <span className="font-sans text-sm text-economist-navy">{c.countryName}</span>
                  </div>
                  <span className="font-mono text-xs font-medium text-green-600">
                    {c.compositeScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Crises At-a-Glance */}
      <div className="mt-8">
        <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-economist-muted mb-4">
          All Crises at a Glance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {crises.map(crisis => {
            const s = summaries[crisis.id];
            return (
              <button
                key={crisis.id}
                onClick={() => setSelectedCrisis(crisis.id)}
                className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                  selectedCrisis === crisis.id
                    ? 'border-gray-400 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex-shrink-0"><CrisisDot color={crisis.color} size={8} /></span>
                  <span className="font-sans text-xs font-semibold text-economist-navy">{crisis.shortLabel}</span>
                </div>
                <div className="font-serif text-xl font-bold" style={{ color: crisis.color }}>
                  {s ? s.averageScore.toFixed(1) : '—'}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      s?.globalTrend === 'worsening' ? 'bg-red-500' :
                      s?.globalTrend === 'improving' ? 'bg-green-500' :
                      s?.globalTrend === 'critical' ? 'bg-red-700' : 'bg-gray-400'
                    }`}
                  />
                  <span className="font-sans text-[10px] text-economist-muted capitalize">{s?.globalTrend ?? 'loading...'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
