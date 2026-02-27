import React, { useEffect, useState } from 'react';
import ReminderChecker from './components/ReminderChecker';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ScheduleDashboard from './components/ScheduleDashboard';
import DealerColorAdmin from './components/DealerColorAdmin';
import AICharts from './pages/AICharts';
import LoadingOverlay from './components/LoadingOverlay';
import AllocationSummary from './components/AllocationSummary';
import PieChartComponent from './components/charts/PieChart';
import StockLevelAnalysis from './components/StockLevelAnalysis';
import UnfinishedVanTracking from './components/UnfinishedVanTracking';
import { fetchScheduleData, mockScheduleData } from './data/scheduleData';

const INTERNAL_SNOWY_PATH = '/xxx/internal-snowy-2487';

const pageItems = [
  { id: 'schedule', name: 'Schedule', path: '/schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'stock-level', name: 'Stock Level Analysis', path: '/stock-level', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
  { id: 'van-tracking', name: 'Unfinished Van Date Tracking', path: '/van-tracking', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'allocation-summary', name: 'Allocation Summary', path: '/allocation-summary', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { id: 'reallocation', name: 'Reallocation', path: '/reallocation', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { id: 'campervan-schedule', name: 'Campervan Schedule', path: '/campervan-schedule', icon: 'M3 7h18M3 12h18M3 17h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z' },
  { id: 'internal-snowy', name: 'Yard Cards', path: INTERNAL_SNOWY_PATH, icon: 'M12 8v8m4-4H8m4-6a9 9 0 100 18 9 9 0 000-18z' }
];

const getActivePage = (pathname) => {
  if (pathname === '/') return 'schedule';
  if (pathname === '/internal-snowy') return 'internal-snowy';

  const page = pageItems.find((item) => item.path === pathname);
  return page?.id ?? 'schedule';
};

function App() {
  const [activePage, setActivePage] = useState(() => getActivePage(window.location.pathname));
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const menuItems = [
    { id: 'schedule', name: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'stock-level', name: 'Stock Level Analysis', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
    { id: 'van-tracking', name: 'Unfinished Van Date Tracking', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'ai-charts', name: 'AI Charts', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'schedule-admin', name: 'Schedule Admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'allocation-summary', name: 'Allocation Summary', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' }
  ];

  useEffect(() => {
    document.body.style.zoom = '125%';
    return () => {
      document.body.style.zoom = '100%';
    };
  }, []);

  useEffect(() => {
    const getScheduleData = async () => {
      try {
        setLoading(true);
        try {
          const firebaseData = await fetchScheduleData();
          setScheduleData(firebaseData);
        } catch (firebaseError) {
          console.error('Error fetching from Firebase, using mock data:', firebaseError);
          setScheduleData(mockScheduleData);
        }
      } catch (err) {
        console.error('Fatal error fetching schedule data:', err);
        setError('Failed to load schedule data. Please try again later.');
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    };

    getScheduleData();
  }, []);

  useEffect(() => {
    const normalizedPage = getActivePage(window.location.pathname);
    const normalizedPath = pageItems.find((item) => item.id === normalizedPage)?.path;

    if (window.location.pathname === '/' && normalizedPath) {
      window.history.replaceState({}, '', normalizedPath);
    }

    const handleLocationChange = () => {
      setActivePage(getActivePage(window.location.pathname));
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (item) => {
    if (window.location.pathname !== item.path) {
      window.history.pushState({}, '', item.path);
    }
    setActivePage(item.id);
  };

  const renderCurrentPage = () => {
    if (activePage === 'schedule') return <ScheduleDashboard data={scheduleData} />;
    if (activePage === 'stock-level') return <StockLevelAnalysis data={scheduleData} />;
    if (activePage === 'van-tracking') return <UnfinishedVanTracking />;
    if (activePage === 'allocation-summary') {
      return (
        <>
          <AllocationSummary data={scheduleData} />
          <div className="mt-8">
            <PieChartComponent scheduleData={scheduleData} />
          </div>
        </>
      );
    }
    if (activePage === 'reallocation') return <Reallocation data={scheduleData} />;
    if (activePage === 'campervan-schedule') return <CampervanSchedule />;
    if (activePage === 'internal-snowy') return <InternalSnowyPage />;

    return <ScheduleDashboard data={scheduleData} />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7f8] text-slate-900">
      <aside className="hidden h-screen w-[150px] flex-shrink-0 flex-col border-r border-[#2a2a2a] bg-[#1f1f1f] text-[#ececec] md:flex">
        <div className="border-b border-white/10 px-3 py-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Workspace</p>
          <h2 className="mt-2 text-sm font-semibold text-zinc-100">Planning</h2>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {pageItems.map((item) => (
            <a
              key={item.id}
              href={item.path}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(item);
              }}
              className={`flex items-center gap-2 rounded-md px-2 py-2 text-xs transition-colors ${
                activePage === item.id
                  ? 'bg-[#2d2d2d] text-white'
                  : 'text-zinc-300 hover:bg-[#272727] hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="truncate">{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={activePage}
            onChange={(event) => {
              const selected = pageItems.find((item) => item.id === event.target.value);
              if (selected) navigateTo(selected);
            }}
          >
            {pageItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <LoadingOverlay isLoading={loading} message="Loading dashboard data..." />
          {error ? (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-700">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <ReminderChecker data={scheduleData} />
              {renderCurrentPage()}
            </>
          )}
        </main>
      </div>
      <main className="flex-1 p-4 overflow-auto">
        <LoadingOverlay isLoading={loading} message="Loading dashboard data..." />
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <ReminderChecker data={scheduleData} />
            {activeView === 'schedule' && <ScheduleDashboard data={scheduleData} />}
            {activeView === 'stock-level' && <StockLevelAnalysis data={scheduleData} />}
            {activeView === 'van-tracking' && <UnfinishedVanTracking />}
            {activeView === 'ai-charts' && <AICharts data={scheduleData} />}
            {activeView === 'schedule-admin' && <DealerColorAdmin data={scheduleData} />}
            {activeView === 'allocation-summary' && (
              <>
                <AllocationSummary data={scheduleData} />
                <div className="mt-8">
                  <PieChartComponent scheduleData={scheduleData} />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
