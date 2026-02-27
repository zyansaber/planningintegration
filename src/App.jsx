import React, { useEffect, useState } from 'react';
import ReminderChecker from './components/ReminderChecker';
import Header from './components/Header';
import ScheduleDashboard from './components/ScheduleDashboard';
import LoadingOverlay from './components/LoadingOverlay';
import StockLevelAnalysis from './components/StockLevelAnalysis';
import UnfinishedVanTracking from './components/UnfinishedVanTracking';
import Reallocation from './components/Reallocation';
import CampervanSchedule from './pages/CampervanSchedule';
import InternalSnowyPage from './pages/InternalSnowy';
import AppSidebar from './components/AppSidebar';
import { fetchScheduleData, mockScheduleData } from './data/scheduleData';

const INTERNAL_SNOWY_PATH = '/xxx/internal-snowy-2487';

const pageItems = [
  { id: 'schedule', name: 'Schedule', path: '/schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'stock-level', name: 'Semi Van Stock', path: '/stock-level', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
  { id: 'van-tracking', name: 'Date Track', path: '/van-tracking', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'reallocation', name: 'Reallocation', path: '/reallocation', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { id: 'campervan-schedule', name: 'Campervan', path: '/campervan-schedule', icon: 'M3 7h18M3 12h18M3 17h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z' },
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    if (activePage === 'reallocation') return <Reallocation data={scheduleData} />;
    if (activePage === 'campervan-schedule') return <CampervanSchedule />;
    if (activePage === 'internal-snowy') return <InternalSnowyPage />;

    return <ScheduleDashboard data={scheduleData} />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900">
      <AppSidebar
        activePage={activePage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onNavigate={navigateTo}
        items={pageItems}
      />

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

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-7">
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
    </div>
  );
}

export default App;
