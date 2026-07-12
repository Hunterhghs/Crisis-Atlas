import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { CrisisId, CorrelationData } from '../../types';
import { getAllCrisisDefinitions, getCrisisColor, getCrisisDefinition } from '../../data/crisisDefinitions';
import LoadingSpinner from '../shared/LoadingSpinner';

interface CorrelationsPanelProps {
  correlations: CorrelationData[];
  loading: boolean;
}

export default function CorrelationsPanel({ correlations, loading }: CorrelationsPanelProps) {
  const crises = getAllCrisisDefinitions();

  if (loading) return <LoadingSpinner message="Analyzing cross-crisis correlations..." />;

  // Build correlation matrix
  const crisisIds: CrisisId[] = crises.map(c => c.id);
  const matrix: Record<string, Record<string, CorrelationData | null>> = {};
  crisisIds.forEach(a => {
    matrix[a] = {};
    crisisIds.forEach(b => {
      matrix[a][b] = correlations.find(c =>
        (c.crisisA === a && c.crisisB === b) || (c.crisisA === b && c.crisisB === a)
      ) ?? null;
    });
  });

  // Build scatter data for selected pair
  const scatterData = correlations.map((c) => ({
    x: c.pearsonR,
    y: -Math.log10(Math.max(c.pValue, 1e-10)),
    z: Math.abs(c.pearsonR) * 50 + 10,
    name: `${getCrisisDefinition(c.crisisA).shortLabel} ↔ ${getCrisisDefinition(c.crisisB).shortLabel}`,
    crisisA: c.crisisA,
    crisisB: c.crisisB,
    color: getCrisisColor(c.crisisA),
  }));

  // Network data for chord-like visualization
  const significantCorrelations = correlations
    .filter(c => Math.abs(c.pearsonR) > 0.3)
    .sort((a, b) => Math.abs(b.pearsonR) - Math.abs(a.pearsonR));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-economist-red mb-2">
          Cross-Crisis Analysis
        </p>
        <h2 className="font-serif text-3xl font-bold text-economist-navy leading-tight mb-3">
          How Crises Interconnect
        </h2>
        <p className="font-sans text-base text-economist-slate leading-relaxed max-w-3xl">
          Crises do not unfold in isolation. Climate change drives food insecurity, which fuels conflict, 
          which displaces populations, which strains health systems — cascading feedback loops that 
          amplify each other. This analysis quantifies those connections.
        </p>
      </div>

      {/* Correlation Matrix */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 overflow-x-auto">
        <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-economist-muted mb-4">
          Correlation Matrix (Pearson's r)
        </h3>
        <table className="w-full text-xs font-sans">
          <thead>
            <tr>
              <th className="text-left p-2 font-medium text-economist-muted"></th>
              {crisisIds.map(id => (
                <th key={id} className="p-2 font-medium text-economist-navy whitespace-nowrap">
                  {getCrisisDefinition(id).shortLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {crisisIds.map(rowId => (
              <tr key={rowId} className="border-t border-gray-100">
                <td className="p-2 font-medium text-economist-navy whitespace-nowrap">
                  {getCrisisDefinition(rowId).shortLabel}
                </td>
                {crisisIds.map(colId => {
                  const c = matrix[rowId][colId];
                  if (rowId === colId) {
                    return <td key={colId} className="p-2 text-center text-gray-300">—</td>;
                  }
                  if (!c) {
                    return <td key={colId} className="p-2 text-center text-gray-300">·</td>;
                  }
                  const r = c.pearsonR;
                  const intensity = Math.abs(r);
                  const isPositive = r > 0;
                  const bgColor = isPositive
                    ? `rgba(227, 18, 11, ${intensity * 0.3})`
                    : `rgba(16, 185, 129, ${intensity * 0.3})`;
                  return (
                    <td key={colId} className="p-2 text-center" style={{ backgroundColor: bgColor }}>
                      <span className={`font-mono font-medium ${Math.abs(r) > 0.5 ? 'text-economist-navy' : 'text-economist-slate'}`}>
                        {r.toFixed(2)}
                      </span>
                      {c.pValue < 0.05 && <span className="ml-0.5 text-[10px]">*</span>}
                      {c.pValue < 0.01 && <span className="text-[10px]">*</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 font-sans text-[10px] text-economist-muted">
          * p &lt; 0.05 &nbsp;&nbsp; ** p &lt; 0.01 &nbsp;&nbsp; Color intensity = correlation strength. Red = positive, Green = negative.
        </p>
      </div>

      {/* Significant Correlations Detail */}
      <div className="mb-6">
        <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-economist-muted mb-4">
          Strongest Crisis Connections (|r| &gt; 0.3)
        </h3>
        <div className="space-y-3">
          {significantCorrelations.map((c, i) => {
            const defA = getCrisisDefinition(c.crisisA);
            const defB = getCrisisDefinition(c.crisisB);
            const absR = Math.abs(c.pearsonR);
            const barWidth = `${absR * 100}%`;
            const isPositive = c.pearsonR > 0;

            return (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{defA.icon}</span>
                    <span className="font-sans text-sm font-medium text-economist-navy">{defA.shortLabel}</span>
                    <span className="text-economist-muted">↔</span>
                    <span className="text-lg">{defB.icon}</span>
                    <span className="font-sans text-sm font-medium text-economist-navy">{defB.shortLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm font-bold ${isPositive ? 'text-economist-red' : 'text-green-600'}`}>
                      r = {c.pearsonR.toFixed(3)}
                    </span>
                    <span className="font-mono text-[10px] text-economist-muted">
                      p = {c.pValue.toFixed(4)}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: barWidth,
                      backgroundColor: isPositive ? '#e3120b' : '#10b981',
                    }}
                  />
                </div>
                <p className="mt-2 font-sans text-xs text-economist-slate leading-relaxed">
                  {c.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Correlation Scatter Plot */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-economist-muted mb-4">
          Correlation Significance Map
        </h3>
        <p className="font-sans text-xs text-economist-muted mb-4">
          Each point is a crisis pair. X-axis = correlation strength (Pearson's r), Y-axis = statistical significance (-log₁₀ p-value). Larger points = stronger evidence of connection.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              type="number"
              dataKey="x"
              name="Pearson's r"
              domain={[-1, 1]}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              label={{ value: "Pearson's r", position: 'bottom', offset: 0, style: { fontSize: 11, fill: '#6b7280' } }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="-log₁₀(p)"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              label={{ value: '-log₁₀(p-value)', angle: -90, position: 'left', style: { fontSize: 11, fill: '#6b7280' } }}
            />
            <ZAxis type="number" dataKey="z" range={[30, 200]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
              }}
              formatter={(value: any, name: any) => [typeof value === 'number' ? value.toFixed(3) : value, name]}
            />
            <Scatter data={scatterData} fill="#8884d8">
              {scatterData.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.7} stroke={entry.color} strokeWidth={1} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
