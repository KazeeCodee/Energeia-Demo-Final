import { create } from 'zustand';
import { ReportData, ReportFilters } from '../types';
import { LocalStorageManager } from '../utils/localStorage';
import { SimulationService } from '../services/simulation';
import { getReportsByCompany, getReportsByFilters } from '../mock/data/seeds';
import { SimulationManager } from '../mock';

interface ReportsState {
  currentReport: ReportData | null;
  filteredReports: ReportData[];
  filters: ReportFilters;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setFilters: (filters: ReportFilters) => void;
  loadReport: (companyId: string, period: string) => Promise<void>;
  loadFilteredReports: (filters: ReportFilters) => Promise<void>;
  clearError: () => void;
  resetReports: () => void;
  initializeFilters: () => void;
  getFilterHistory: () => Array<{ id: string; filters: ReportFilters; timestamp: Date }>;
  applyFilterFromHistory: (filterId: string) => void;
}

const defaultFilters: ReportFilters = {
  period: {
    type: 'month',
    value: new Date().toISOString().slice(0, 7), // Current month YYYY-MM
  },
  mode: 'compare',
  scope: 'all',
  viewMode: 'aggregated',
};

export const useReportsStore = create<ReportsState>((set, _get) => ({
  currentReport: null,
  filteredReports: [],
  filters: defaultFilters,
  isLoading: false,
  error: null,

  setFilters: (filters: ReportFilters) => {
    set({ filters });
    
    // Persist filters to localStorage
    LocalStorageManager.setReportFilters(filters);
    
    // Add to filter history for quick access
    LocalStorageManager.addFilterToHistory(filters);
    
    // Update session metadata
    LocalStorageManager.updateSessionMetadata({
      actionsPerformed: (LocalStorageManager.getSessionMetadata() as Record<string, unknown>).actionsPerformed as number + 1
    });
  },

  loadReport: async (companyId: string, period: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Use simulation service for data fetching
      await SimulationService.simulateDataFetch(async () => {
        // Simulate data loading
        return true;
      }, 'load_report');
      
      // Get reports for the company
      const reports = getReportsByCompany(companyId);
      
      // Find the specific report for the period
      const report = reports.find(r => r.period === period);
      
      if (!report) {
        throw new Error(`No se encontró informe para el período ${period}`);
      }
      
      set({ 
        currentReport: report, 
        isLoading: false,
        error: null 
      });
      
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Error al cargar informe' 
      });
      throw error;
    }
  },

  loadFilteredReports: async (filters: ReportFilters) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate network delay
      await SimulationManager.delay();
      
      // Get filtered reports based on criteria
      const reports = getReportsByFilters(filters);
      
      set({ 
        filteredReports: reports,
        filters,
        isLoading: false,
        error: null 
      });
      
      // Persist filters
      LocalStorageManager.setReportFilters(filters);
      
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Error al cargar informes filtrados' 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetReports: () => {
    set({ 
      currentReport: null,
      filteredReports: [],
      filters: defaultFilters,
      error: null 
    });
  },

  initializeFilters: () => {
    const savedFilters = LocalStorageManager.getReportFilters() as ReportFilters | null;
    
    if (savedFilters) {
      set({ filters: savedFilters });
    } else {
      set({ filters: defaultFilters });
    }
    
    // Initialize session metadata
    const sessionData = LocalStorageManager.getSessionMetadata() as Record<string, unknown>;
    LocalStorageManager.updateSessionMetadata({
      ...sessionData,
      pageViews: (sessionData.pageViews as number || 0) + 1
    });
  },

  getFilterHistory: () => {
    return LocalStorageManager.getFilterHistory() as Array<{
      id: string;
      filters: ReportFilters;
      timestamp: Date;
    }>;
  },

  applyFilterFromHistory: (filterId: string) => {
    const history = LocalStorageManager.getFilterHistory() as Array<{
      id: string;
      filters: ReportFilters;
      timestamp: Date;
    }>;
    
    const historicalFilter = history.find(h => h.id === filterId);
    if (historicalFilter) {
      set({ filters: historicalFilter.filters });
      LocalStorageManager.setReportFilters(historicalFilter.filters);
    }
  },
}));

// Helper hooks for specific report states
export const useCurrentReport = () => useReportsStore(state => state.currentReport);
export const useFilteredReports = () => useReportsStore(state => state.filteredReports);
export const useReportFilters = () => useReportsStore(state => state.filters);
export const useReportsLoading = () => useReportsStore(state => state.isLoading);
export const useReportsError = () => useReportsStore(state => state.error);

// Helper function to get latest report for a company
export const useLatestReport = (companyId: string) => {
  const { loadReport } = useReportsStore();
  
  const loadLatest = async () => {
    try {
      const reports = getReportsByCompany(companyId);
      if (reports.length === 0) {
        throw new Error('No hay informes disponibles');
      }
      
      // Sort by period descending and get the latest
      const sortedReports = reports.sort((a, b) => b.period.localeCompare(a.period));
      const latestPeriod = sortedReports[0].period;
      
      await loadReport(companyId, latestPeriod);
    } catch (error) {
      throw error;
    }
  };
  
  return { loadLatest };
};

// Helper function to navigate between report periods
export const useReportNavigation = () => {
  const { currentReport, loadReport } = useReportsStore();
  
  const navigateToMonth = async (direction: 'previous' | 'next') => {
    if (!currentReport) return;
    
    const currentDate = new Date(currentReport.period + '-01');
    const targetDate = new Date(currentDate);
    
    if (direction === 'previous') {
      targetDate.setMonth(targetDate.getMonth() - 1);
    } else {
      targetDate.setMonth(targetDate.getMonth() + 1);
    }
    
    const targetPeriod = targetDate.toISOString().slice(0, 7);
    
    try {
      await loadReport(currentReport.companyId, targetPeriod);
    } catch (error) {
      // If report doesn't exist for that period, we could show a message
      throw error;
    }
  };
  
  return { navigateToMonth };
};