import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { CrisisId, GlobalSummary } from '../../types';
import { getCrisisDefinition } from '../../data/crisisDefinitions';
import { CrisisDot } from '../shared/CrisisDot';
import KpiCard from '../shared/KpiCard';
import DataSources from '../shared/DataSources';
import LoadingSpinner from '../shared/LoadingSpinner';

interface CrisisPanelProps {
  crisisId: CrisisId;
  summary: GlobalSummary | null;
  loading: boolean;
}

export default function CrisisPanel({ crisisId, summary, loading }: CrisisPanelProps) {
  const crisis = getCrisisDefinition(crisisId);

  if (loading) return <LoadingSpinner message={`Loading ${crisis.label} data...`} />;
  if (!summary) return <div className="py-20 text-center text-economist-muted">No data available for {crisis.label}</div>;

  const worst10 = summary.worstCountries.slice(0, 10);

  const barData = worst10.map(c => ({
    name: c.countryName,
    score: parseFloat(c.compositeScore.toFixed(1)),
    fill: crisis.color,
  })).reverse();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex-shrink-0 mt-1"><CrisisDot color={crisis.color} size={14} /></span>
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] mb-0.5"
               style={{ color: crisis.color }}>
              {crisis.category}
            </p>
            <h2 className="font-serif text-3xl font-bold text-economist-navy leading-tight">
              {crisis.label}
            </h2>
          </div>
        </div>
        <p className="font-sans text-base text-economist-slate leading-relaxed max-w-3xl">
          {crisis.description}
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Global Average Score"
          value={summary.averageScore.toFixed(1)}
          subtitle="Composite index across all metrics"
          color={crisis.color}
          trend={summary.globalTrend}
        />
        <KpiCard
          label="Countries Assessed"
          value={summary.totalCountries}
          subtitle="With sufficient data"
          color={crisis.color}
        />
        <KpiCard
          label="Most Affected"
          value={summary.worstCountries[0]?.countryName ?? 'N/A'}
          subtitle={summary.worstCountries[0] ? `Score: ${summary.worstCountries[0].compositeScore.toFixed(1)}` : ''}
          color="#e3120b"
        />
        <KpiCard
          label="Least Affected"
          value={summary.bestCountries[0]?.countryName ?? 'N/A'}
          subtitle={summary.bestCountries[0] ? `Score: ${summary.bestCountries[0].compositeScore.toFixed(1)}` : ''}
          color="#10b981"
        />
      </div>

      {/* Bar Chart: Worst 10 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-economist-muted mb-4">
          10 Most Affected Countries
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}
              axisLine={false}
              tickLine={false}
              width={140}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={22}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={crisis.color} fillOpacity={0.85 - index * 0.03} />
              ))}
              <LabelList dataKey="score" position="right" style={{ fontSize: 11, fill: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics Overview */}
      <div className="mb-6">
        <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-economist-muted mb-4">
          Key Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {crisis.metrics.map(metric => (
            <div key={metric.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-sans text-sm font-semibold text-economist-navy">{metric.label}</h4>
                <span className={`font-sans text-[10px] px-1.5 py-0.5 rounded-full ${
                  metric.higherIsWorse ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {metric.higherIsWorse ? '↓ better' : '↑ better'}
                </span>
              </div>
              <p className="font-sans text-xs text-economist-muted mb-2">{metric.description}</p>
              <p className="font-mono text-xs text-economist-slate">
                Unit: <span className="font-medium">{metric.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top 10 Best & Worst Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3 bg-red-50 border-b border-red-100">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-red-700">
              Most Affected
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {summary.worstCountries.slice(0, 10).map((c, i) => (
              <div key={c.countryIso3} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-economist-muted w-5 text-right">{i + 1}</span>
                  <div>
                    <span className="font-sans text-sm font-medium text-economist-navy">{c.countryName}</span>
                    <div className="flex gap-2 mt-0.5">
                      {Object.entries(c.metrics).slice(0, 3).map(([key, val]) => (
                        <span key={key} className="font-mono text-[10px] text-economist-muted">
                          {key}: {typeof val === 'number' ? val.toFixed(1) : val}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg font-bold" style={{ color: crisis.color }}>
                    {c.compositeScore.toFixed(1)}
                  </span>
                  <span className={`ml-2 font-sans text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    c.trend === 'critical' ? 'bg-red-100 text-red-700' :
                    c.trend === 'worsening' ? 'bg-amber-100 text-amber-700' :
                    c.trend === 'improving' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {c.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3 bg-green-50 border-b border-green-100">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-green-700">
              Least Affected
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {summary.bestCountries.slice(0, 10).map((c, i) => (
              <div key={c.countryIso3} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-economist-muted w-5 text-right">{i + 1}</span>
                  <div>
                    <span className="font-sans text-sm font-medium text-economist-navy">{c.countryName}</span>
                    <div className="flex gap-2 mt-0.5">
                      {Object.entries(c.metrics).slice(0, 3).map(([key, val]) => (
                        <span key={key} className="font-mono text-[10px] text-economist-muted">
                          {key}: {typeof val === 'number' ? val.toFixed(1) : val}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg font-bold text-green-600">
                    {c.compositeScore.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Sources */}
      <DataSources sources={crisis.dataSources} />
    </div>
  );
}
