import React, { useEffect, useMemo, useState } from 'react';
import ReminderChecker from './components/ReminderChecker';
import Header from './components/Header';
import ScheduleDashboard from './components/ScheduleDashboard';
import LoadingOverlay from './components/LoadingOverlay';
import AllocationSummary from './components/AllocationSummary';
import PieChartComponent from './components/charts/PieChart';
import StockLevelAnalysis from './components/StockLevelAnalysis';
import UnfinishedVanTracking from './components/UnfinishedVanTracking';
import Reallocation from './components/Reallocation';
import CampervanSchedule from './pages/CampervanSchedule';
import InternalSnowyPage from './pages/InternalSnowy';
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

  const currentPage = useMemo(
    () => pageItems.find((item) => item.id === activePage) ?? pageItems[0],
    [activePage]
  );

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
    <div className="flex min-h-screen bg-[#f7f7f8] text-slate-900">
      <aside className="hidden w-[280px] flex-shrink-0 flex-col bg-[#171717] text-[#ececec] md:flex">
        <div className="border-b border-white/10 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Workspace</p>
          <h2 className="mt-2 text-base font-semibold">Planning Integration</h2>
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
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                activePage === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="truncate">{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
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

        <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1600px] rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h1 className="text-lg font-semibold text-slate-900">{currentPage.name}</h1>
              <p className="mt-1 text-xs text-slate-500">Each page keeps visible navigation via sidebar and top quick menu.</p>
            </div>

            <div className="border-b border-slate-100 px-4 py-3">
              <nav className="flex flex-wrap gap-2">
                {pageItems.map((item) => (
                  <a
                    key={`${item.id}-chip`}
                    href={item.path}
                    onClick={(event) => {
                      event.preventDefault();
                      navigateTo(item);
                    }}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      activePage === item.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>

            <div className="p-4 md:p-6">
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
