import { DataSource } from '../../types';

interface DataSourcesProps {
  sources: DataSource[];
}

export default function DataSources({ sources }: DataSourcesProps) {
  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <h4 className="font-sans text-[10px] font-semibold uppercase tracking-[0.15em] text-economist-muted mb-2">
        Data Sources
      </h4>
      <div className="space-y-1.5">
        {sources.map((source, i) => (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-sans text-xs text-economist-slate hover:text-economist-red transition-colors"
          >
            {source.name}
            <span className="text-economist-muted ml-1">— {source.description}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
