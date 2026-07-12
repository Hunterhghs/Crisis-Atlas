import { useState, useEffect, useCallback } from 'react';
import { CrisisId, PanelView, GlobalSummary, CorrelationData } from './types';
import Sidebar from './components/layout/Sidebar';
import OverviewPanel from './components/panels/OverviewPanel';
import CrisisPanel from './components/panels/CrisisPanel';
import CorrelationsPanel from './components/panels/CorrelationsPanel';
import { fetchAllCrisisSummaries, fetchCorrelationData } from './data/api';

export default function App() {
  const [activePanel, setActivePanel] = useState<PanelView>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [summaries, setSummaries] = useState<Record<CrisisId, GlobalSummary>>({} as Record<CrisisId, GlobalSummary>);
  const [correlations, setCorrelations] = useState<CorrelationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data on mount
  useEffect(() => {
    let cancelled = false;
    
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, correlationData] = await Promise.all([
          fetchAllCrisisSummaries(),
          fetchCorrelationData(),
        ]);
        if (!cancelled) {
          setSummaries(summaryData);
          setCorrelations(correlationData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load crisis data:', err);
          setError('Failed to load data. Using cached fallback values where available.');
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const handlePanelChange = useCallback((panel: PanelView) => {
    setActivePanel(panel);
  }, []);

  return (
    <div className="min-h-screen bg-economist-cream">
      <Sidebar
        activePanel={activePanel}
        onPanelChange={handlePanelChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(p => !p)}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 min-h-screen ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
          {error && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="font-sans text-sm text-amber-800">{error}</p>
            </div>
          )}

          {activePanel === 'overview' && (
            <OverviewPanel summaries={summaries} loading={loading} />
          )}

          {activePanel === 'correlations' && (
            <CorrelationsPanel correlations={correlations} loading={loading} />
          )}

          {activePanel !== 'overview' && activePanel !== 'correlations' && (
            <CrisisPanel
              crisisId={activePanel as CrisisId}
              summary={summaries[activePanel as CrisisId] ?? null}
              loading={loading}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white mt-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-bold text-economist-navy">Crisis Atlas</span>
                <span className="font-sans text-[10px] text-economist-muted">by H Heuristics</span>
              </div>
              <p className="font-sans text-[11px] text-economist-muted">
                Data sourced from World Bank, WHO, FAO, ITU, IUCN, EIU, UNHCR, and others.
                Updated quarterly. © {new Date().getFullYear()} H Heuristics.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
