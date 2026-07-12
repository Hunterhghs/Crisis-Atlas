interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'improving' | 'stable' | 'worsening' | 'critical';
  subtitle?: string;
  color?: string;
}

export default function KpiCard({ label, value, unit, trend, subtitle, color }: KpiCardProps) {
  const trendColors: Record<string, string> = {
    improving: '#10b981',
    stable: '#6b7280',
    worsening: '#f59e0b',
    critical: '#e3120b',
  };

  const trendIcons: Record<string, string> = {
    improving: '↓',
    stable: '→',
    worsening: '↑',
    critical: '⚠',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-2">
        <p className="font-sans text-xs font-medium text-economist-muted uppercase tracking-wider leading-tight">
          {label}
        </p>
        {trend && (
          <span
            className="font-mono text-xs font-bold px-1.5 py-0.5 rounded"
            style={{ color: trendColors[trend], backgroundColor: `${trendColors[trend]}10` }}
          >
            {trendIcons[trend]}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="font-serif text-3xl font-bold leading-none"
          style={{ color: color ?? '#0d1b2a' }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && (
          <span className="font-sans text-xs text-economist-muted">{unit}</span>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 font-sans text-[11px] text-economist-muted leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
