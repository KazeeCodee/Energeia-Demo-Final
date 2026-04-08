// Central store exports and initialization

import { useAuthStore } from './auth';
import { useReportsStore } from './reports';
import { useUIStore } from './ui';

export { useAuthStore, useUser, useIsAuthenticated, useAuthLoading, useAuthError } from './auth';

export { 
  useReportsStore, 
  useCurrentReport, 
  useFilteredReports, 
  useReportFilters, 
  useReportsLoading, 
  useReportsError,
  useLatestReport,
  useReportNavigation
} from './reports';

export { 
  useUIStore, 
  useSidebarCollapsed, 
  useNotifications, 
  useUserPreferences, 
  useGlobalLoading,
  useNotificationActions,
  useTheme,
  useLanguage
} from './ui';

export {
  useConstructorStore,
  useCurrentConfig,
  useSelectedClient,
  useConstructorLoading,
  useConstructorSaving,
  useConstructorError,
  useValidationErrors,
  useAvailableDataSources
} from './constructor';

// Export cleanup utilities
export * from './cleanup';

// Export persistence service
export { PersistenceService } from '../services/persistence';

// Store initialization function (deprecated - use StoreCleanupManager.initializeStores)
export function initializeStores() {
  // Initialize auth store
  const { initializeAuth } = useAuthStore.getState();
  initializeAuth();
  
  // Initialize reports store
  const { initializeFilters } = useReportsStore.getState();
  initializeFilters();
  
  // Initialize UI store
  const { initializeUI } = useUIStore.getState();
  initializeUI();
}

// Store cleanup function (deprecated - use StoreCleanupManager.cleanupOnLogout)
export function cleanupStores() {
  // Reset reports store
  const { resetReports } = useReportsStore.getState();
  resetReports();
  
  // Clear notifications but keep preferences
  const { clearAllNotifications } = useUIStore.getState();
  clearAllNotifications();
}

// Helper function to get all store states (for debugging)
export function getStoreStates() {
  return {
    auth: useAuthStore.getState(),
    reports: useReportsStore.getState(),
    ui: useUIStore.getState(),
  };
}