import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CrisisId, GlobalSummary, CrisisCountrySummary } from '../../types';
import { getAllCrisisDefinitions, getCrisisColor } from '../../data/crisisDefinitions';
import { CrisisDot } from '../shared/CrisisDot';
import KpiCard from '../shared/KpiCard';
import LoadingSpinner from '../shared/LoadingSpinner';

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
  const crisisDef = crises.find(c => c.id === selectedCrisis)!;
  const crisisColor = getCrisisColor(selectedCrisis);

  const mapCenter: LatLngExpression = [20, 0];

  // Build full country score map from all available summary data
  const countryScoreMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!summary) return map;
    for (const c of summary.allCountries) map.set(c.countryIso3, c.compositeScore);
    return map;
  }, [summary]);

  const allScores = useMemo(() => Array.from(countryScoreMap.values()), [countryScoreMap]);
  const minScore = allScores.length > 0 ? Math.min(...allScores) : 0;
  const maxScore = allScores.length > 0 ? Math.max(...allScores) : 100;

  // Generate a gradient color between light grey and the crisis color based on score
  const scoreToColor = (score: number): string => {
    const ratio = maxScore > minScore ? (score - minScore) / (maxScore - minScore) : 0.5;
    // Interpolate from pale tint to full crisis color
    const rLight = 0xe8, gLight = 0xec, bLight = 0xef;
    const r2 = parseInt(crisisColor.slice(1, 3), 16);
    const g2 = parseInt(crisisColor.slice(3, 5), 16);
    const b2 = parseInt(crisisColor.slice(5, 7), 16);
    const r = Math.round(rLight + (r2 - rLight) * ratio);
    const g = Math.round(gLight + (g2 - gLight) * ratio);
    const b = Math.round(bLight + (b2 - bLight) * ratio);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const getCountryStyle = (feature: any) => {
    const iso3 = feature?.properties?.['ISO3166-1-Alpha-3'];
    if (!iso3 || !summary) {
      return { fillColor: '#e5e7eb', weight: 0.5, color: '#d1d5db', fillOpacity: 0.6 };
    }
    const score = countryScoreMap.get(iso3);
    if (score === undefined) {
      return { fillColor: '#e5e7eb', weight: 0.3, color: '#d1d5db', fillOpacity: 0.45 };
    }
    return {
      fillColor: scoreToColor(score),
      weight: 0.5,
      color: '#ffffff',
      fillOpacity: 0.9,
    };
  };

  // Legend gradient stops (5 levels)
  const legendStops = [0, 0.25, 0.5, 0.75, 1.0];

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
      <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden mb-6" style={{ height: '420px' }}>
        {geoData ? (
          <>
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
                  const iso3 = feature?.properties?.['ISO3166-1-Alpha-3'];
                  const name = feature?.properties?.name || '';
                  const score = iso3 ? countryScoreMap.get(iso3) : undefined;
                  if (iso3 && score !== undefined) {
                    layer.bindTooltip(
                      `<div style="font-family:Inter,sans-serif;font-size:12px;">
                        <strong>${name}</strong><br/>
                        Composite score: ${score.toFixed(1)}
                      </div>`,
                      { sticky: true }
                    );
                  } else if (name) {
                    layer.bindTooltip(
                      `<div style="font-family:Inter,sans-serif;font-size:12px;">
                        <strong>${name}</strong><br/>
                        <span style="color:#9ca3af;">No data</span>
                      </div>`,
                      { sticky: true, opacity: 0.8 }
                    );
                  }
                }}
              />
            </MapContainer>

            {/* Map Overlay: Title */}
            <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded shadow-sm border border-gray-200 pointer-events-none">
              <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-economist-muted leading-none mb-0.5">
                {crisisDef.category}
              </p>
              <p className="font-serif text-sm font-bold text-economist-navy leading-tight">
                {crisisDef.label}
              </p>
            </div>

            {/* Map Overlay: Gradient Legend */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2.5 rounded shadow-sm border border-gray-200">
              <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-economist-muted mb-2 leading-none">
                Composite Score
              </p>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-economist-muted w-7 text-right">
                  {minScore.toFixed(0)}
                </span>
                <div className="flex h-3 rounded-sm overflow-hidden border border-gray-200">
                  {legendStops.map((stop, i) => {
                    const score = minScore + (maxScore - minScore) * stop;
                    return (
                      <div
                        key={i}
                        className="w-7 h-full"
                        style={{ backgroundColor: scoreToColor(score) }}
                        title={score.toFixed(0)}
                      />
                    );
                  })}
                </div>
                <span className="font-mono text-[10px] text-economist-muted w-7">
                  {maxScore.toFixed(0)}
                </span>
              </div>
              <div className="flex justify-between mt-1 px-[34px]">
                <span className="font-sans text-[9px] text-economist-muted">Lower concern</span>
                <span className="font-sans text-[9px] text-economist-muted">Higher concern</span>
              </div>
            </div>
          </>
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
            <div className="space-y-1.5">
              {summary.worstCountries.slice(0, 10).map((c, i) => {
                const barPct = Math.min((c.compositeScore / 100) * 100, 100);
                return (
                  <div key={c.countryIso3} className="flex items-center gap-2 group">
                    <span className="font-mono text-[10px] text-economist-muted w-4 text-right">{i + 1}</span>
                    <span className="font-sans text-xs text-economist-navy w-32 truncate">{c.countryName}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${barPct}%`,
                          backgroundColor: crisisColor,
                          opacity: 0.3 + (i / 10) * 0.5,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] font-medium w-10 text-right" style={{ color: crisisColor }}>
                      {c.compositeScore.toFixed(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-green-600 mb-3">
              Least Affected Countries
            </h3>
            <div className="space-y-1.5">
              {summary.bestCountries.slice(0, 10).map((c, i) => {
                const barPct = Math.min((c.compositeScore / 100) * 100, 100);
                return (
                  <div key={c.countryIso3} className="flex items-center gap-2 group">
                    <span className="font-mono text-[10px] text-economist-muted w-4 text-right">{i + 1}</span>
                    <span className="font-sans text-xs text-economist-navy w-32 truncate">{c.countryName}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${barPct}%`,
                          backgroundColor: '#10b981',
                          opacity: 0.3 + ((9 - i) / 10) * 0.5,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] font-medium w-10 text-right text-green-600">
                      {c.compositeScore.toFixed(1)}
                    </span>
                  </div>
                );
              })}
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
            const scorePct = s ? Math.min((s.averageScore / 100) * 100, 100) : 0;
            const trendColor =
              s?.globalTrend === 'critical' ? '#e3120b' :
              s?.globalTrend === 'worsening' ? '#f59e0b' :
              s?.globalTrend === 'improving' ? '#10b981' : '#6b7280';
            return (
              <button
                key={crisis.id}
                onClick={() => setSelectedCrisis(crisis.id)}
                className={`text-left p-3.5 rounded-lg border transition-all duration-200 ${
                  selectedCrisis === crisis.id
                    ? 'border-gray-400 shadow-sm bg-white'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="flex-shrink-0"><CrisisDot color={crisis.color} size={9} /></span>
                  <span className="font-sans text-xs font-semibold text-economist-navy leading-tight">{crisis.shortLabel}</span>
                </div>

                {/* Color-coded severity bar */}
                <div className="mb-2">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-serif text-xl font-bold leading-none" style={{ color: crisis.color }}>
                      {s ? s.averageScore.toFixed(0) : '—'}
                    </span>
                    <span className="font-mono text-[9px] text-economist-muted">/100</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${scorePct}%`,
                        background: `linear-gradient(to right, #10b981, ${crisis.color}, #e3120b)`,
                      }}
                    />
                  </div>
                </div>

                {/* Trend + country count */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: trendColor }} />
                    <span className="font-sans text-[10px] text-economist-muted capitalize">
                      {s?.globalTrend ?? '—'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-economist-muted">
                    {s ? `${s.totalCountries} countries` : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
