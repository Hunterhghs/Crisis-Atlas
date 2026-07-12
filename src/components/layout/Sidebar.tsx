import { CrisisId, PanelView } from '../../types';

interface SidebarProps {
  activePanel: PanelView;
  onPanelChange: (panel: PanelView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const CRISIS_LIST: { id: CrisisId; label: string; icon: string; color: string }[] = [
  { id: 'climate', label: 'Climate Change', icon: '🌡️', color: '#e3120b' },
  { id: 'pollution', label: 'Pollution', icon: '🏭', color: '#8b5cf6' },
  { id: 'poverty', label: 'Poverty & Inequality', icon: '🪙', color: '#f59e0b' },
  { id: 'cybercrime', label: 'Cybercrime', icon: '🔐', color: '#06b6d4' },
  { id: 'food-security', label: 'Food & Water', icon: '🌾', color: '#84cc16' },
  { id: 'conflict', label: 'Conflict', icon: '🕊️', color: '#ef4444' },
  { id: 'pandemic', label: 'Pandemics', icon: '🦠', color: '#ec4899' },
  { id: 'biodiversity', label: 'Biodiversity', icon: '🌿', color: '#10b981' },
  { id: 'democracy', label: 'Democracy', icon: '🗳️', color: '#6366f1' },
];

export default function Sidebar({ activePanel, onPanelChange, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-serif text-lg font-bold text-economist-navy leading-tight tracking-tight">
              Crisis Atlas
            </h1>
            <p className="text-[10px] uppercase tracking-[0.15em] text-economist-muted mt-0.5">
              H Heuristics
            </p>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-md hover:bg-gray-100 text-economist-muted hover:text-economist-navy transition-colors ${
            collapsed ? 'mx-auto' : ''
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {collapsed ? (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="14" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {/* Overview */}
        <button
          onClick={() => onPanelChange('overview')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 group ${
            activePanel === 'overview'
              ? 'bg-economist-navy text-white'
              : 'text-economist-slate hover:bg-gray-50'
          }`}
        >
          <span className="text-lg flex-shrink-0">🌐</span>
          {!collapsed && (
            <span className="font-sans text-sm font-medium leading-none">Overview</span>
          )}
        </button>

        {/* Divider */}
        <div className="mx-4 my-3 border-t border-gray-100" />

        {/* Crisis Items */}
        {CRISIS_LIST.map(crisis => (
          <button
            key={crisis.id}
            onClick={() => onPanelChange(crisis.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 group relative ${
              activePanel === crisis.id
                ? 'bg-gray-100 text-economist-navy'
                : 'text-economist-slate hover:bg-gray-50'
            }`}
          >
            {/* Color indicator */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-6 transition-all duration-200 rounded-r-full"
              style={{ backgroundColor: activePanel === crisis.id ? crisis.color : 'transparent' }}
            />
            <span className="text-lg flex-shrink-0">{crisis.icon}</span>
            {!collapsed && (
              <div className="min-w-0">
                <span className="font-sans text-sm font-medium leading-tight block truncate">
                  {crisis.label}
                </span>
              </div>
            )}
          </button>
        ))}

        {/* Divider */}
        <div className="mx-4 my-3 border-t border-gray-100" />

        {/* Correlations */}
        <button
          onClick={() => onPanelChange('correlations')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 ${
            activePanel === 'correlations'
              ? 'bg-economist-navy text-white'
              : 'text-economist-slate hover:bg-gray-50'
          }`}
        >
          <span className="text-lg flex-shrink-0">🔗</span>
          {!collapsed && (
            <span className="font-sans text-sm font-medium leading-none">Cross-Crisis Links</span>
          )}
        </button>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-4 border-t border-gray-100">
          <p className="font-sans text-[10px] text-economist-muted leading-relaxed">
            Data from World Bank, WHO, FAO, ITU, IUCN, EIU & more. Updated quarterly.
          </p>
          <p className="font-sans text-[10px] text-economist-muted mt-1">
            © H Heuristics {new Date().getFullYear()}
          </p>
        </div>
      )}
    </aside>
  );
}
