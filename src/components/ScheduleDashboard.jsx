import React, { useState, useEffect, useCallback } from 'react';
import ScheduleTable from './ScheduleTable';
import ScheduleFilters from './ScheduleFilters';
import StagesByClassChart from './charts/StagesByClassChart';
import LoadingOverlay from './LoadingOverlay';

const ScheduleDashboard = ({ data }) => {
  const [filteredData, setFilteredData] = useState(data);
  const [filters, setFilters] = useState({});
  const [showCharts, setShowCharts] = useState(true);
  const [isFilteringData, setIsFilteringData] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    if (!data) {
      setFilteredData([]);
      return;
    }

    if (data.length > 100) {
      setIsFilteringData(true);
    }

    const filterTimeout = setTimeout(() => {
      const newFilteredData = data.filter((item) => {
        try {
          if (filters.dealer && filters.dealer !== 'all' && item.Dealer !== filters.dealer) {
            return false;
          }
          if (filters.model && item.Model !== filters.model) {
            return false;
          }
          if (filters.modelYear && item['Model Year'] !== filters.modelYear) {
            return false;
          }
          if (filters.forecastYear && item['Forecast Production Date']) {
            const dateParts = item['Forecast Production Date'].split('/');
            if (dateParts.length >= 3 && dateParts[2] !== filters.forecastYear) {
              return false;
            }
          }
          if (filters.forecastYearMonth && item['Forecast Production Date']) {
            const dateParts = item['Forecast Production Date'].split('/');
            if (dateParts.length >= 3) {
              const itemYearMonth = `${dateParts[2]}-${dateParts[1]}`;
              if (itemYearMonth !== filters.forecastYearMonth) return false;
            }
          }
          if (filters.modelRange && item.Chassis && !item.Chassis.startsWith(filters.modelRange)) {
            return false;
          }

          const dateFields = [
            { filter: 'OrderSentToLongtreeYearMonth', field: 'Order Sent to Longtree' },
            { filter: 'PlansSentToDealerYearMonth', field: 'Plans Sent to Dealer' },
            { filter: 'SignedPlansReceivedYearMonth', field: 'Signed Plans Received' }
          ];

          for (const { filter, field } of dateFields) {
            if (filters[filter] && item[field]) {
              const dateParts = item[field].split('/');
              if (dateParts.length >= 3) {
                const itemYearMonth = `${dateParts[2]}-${dateParts[1]}`;
                if (itemYearMonth !== filters[filter]) {
                  return false;
                }
              }
            }
          }
          return true;
        } catch (error) {
          console.error('Error filtering item:', item, error);
          return false;
        }
      });

      setFilteredData(newFilteredData);
      setIsFilteringData(false);
    }, 300);

    return () => clearTimeout(filterTimeout);
  }, [data, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleStageSelection = useCallback((stages) => {
    if (stages && stages.length > 0) {
      setFilters((prev) => ({
        ...prev,
        selectedStages: stages,
        allStagesSelected: false
      }));
    }
  }, []);

  return (
    <div className="relative flex flex-col gap-6" style={{ scrollBehavior: 'smooth' }}>
      <LoadingOverlay isLoading={isFilteringData} message="Updating filters..." />

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-700"
          title="Back to Top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {showCharts ? 'Hide Stage Chart' : 'Show Stage Chart'}
        </button>
      </div>

      {showCharts && (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <StagesByClassChart selectedStages={handleStageSelection} />
        </div>
      )}

      <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <ScheduleFilters data={data} onFilterChange={handleFilterChange} />
        <ScheduleTable data={filteredData} filters={filters} />
      </div>
    </div>
  );
};

export default ScheduleDashboard;
