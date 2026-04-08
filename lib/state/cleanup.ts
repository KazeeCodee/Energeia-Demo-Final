import { useAuthStore } from './auth';
import { useReportsStore } from './reports';
import { useUIStore } from './ui';
import { PersistenceService } from '../services/persistence';
import { LocalStorageManager } from '../utils/localStorage';

export interface CleanupOptions {
  clearFilters?: boolean;
  clearPreferences?: boolean;
  clearHistory?: boolean;
  clearSharedLinks?: boolean;
  performMaintenance?: boolean;
}

export class StoreCleanupManager {
  /**
   * Comprehensive cleanup on user logout
   */
  static cleanupOnLogout(options: CleanupOptions = {}) {
    const {
      clearFilters = false,
      clearPreferences = false,
      clearHistory = true,
      clearSharedLinks = false,
      performMaintenance = true,
    } = options;

    try {
      // Track logout activity
      PersistenceService.trackActivity('page_view', { action: 'logout' });

      // Clear auth state (this will trigger localStorage cleanup)
      useAuthStore.getState().logout();

      // Reset reports state but preserve filters if requested
      const reportsStore = useReportsStore.getState();
      if (clearFilters) {
        reportsStore.resetReports();
      } else {
        // Keep filters but clear current data
        reportsStore.clearError();
        useReportsStore.setState({
          currentReport: null,
          filteredReports: [],
          isLoading: false,
          error: null,
        });
      }

      // Handle UI preferences
      const uiStore = useUIStore.getState();
      if (clearPreferences) {
        uiStore.resetPreferences();
      } else {
        // Keep preferences but clear notifications
        uiStore.clearAllNotifications();
      }

      // Clear session-specific data
      if (clearHistory) {
        LocalStorageManager.remove('energeia_filter_history');
        LocalStorageManager.remove('energeia_download_history');
        LocalStorageManager.remove('user_activities');
      }

      // Clear shared links if requested
      if (clearSharedLinks) {
        LocalStorageManager.remove('energeia_shared_links');
        LocalStorageManager.remove('shared_links_access_log');
      }

      // Perform maintenance
      if (performMaintenance) {
        PersistenceService.performMaintenance();
      }

      console.log('Store cleanup completed successfully');
    } catch (error) {
      console.error('Error during store cleanup:', error);
    }
  }

  /**
   * Initialize all stores with persisted data
   */
  static initializeStores() {
    try {
      // Initialize auth first
      useAuthStore.getState().initializeAuth();

      // Initialize UI preferences
      useUIStore.getState().initializeUI();

      // Initialize reports filters
      useReportsStore.getState().initializeFilters();

      // Initialize session if user is authenticated
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated && authState.user) {
        PersistenceService.initializeSession(authState.user);
      }

      console.log('Stores initialized successfully');
    } catch (error) {
      console.error('Error during store initialization:', error);
    }
  }

  /**
   * Reset all stores to default state
   */
  static resetAllStores() {
    try {
      // Reset auth
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      // Reset reports
      useReportsStore.getState().resetReports();

      // Reset UI
      useUIStore.getState().resetAllData();

      // Clear all localStorage
      LocalStorageManager.clear();

      console.log('All stores reset successfully');
    } catch (error) {
      console.error('Error during store reset:', error);
    }
  }

  /**
   * Sync stores with localStorage after external changes
   */
  static syncStoresWithStorage() {
    try {
      // Re-initialize all stores
      this.initializeStores();

      console.log('Stores synced with storage');
    } catch (error) {
      console.error('Error syncing stores with storage:', error);
    }
  }

  /**
   * Get comprehensive state snapshot for debugging
   */
  static getStateSnapshot() {
    return {
      auth: {
        isAuthenticated: useAuthStore.getState().isAuthenticated,
        user: useAuthStore.getState().user,
        sessionInfo: useAuthStore.getState().getSessionInfo(),
      },
      reports: {
        hasCurrentReport: !!useReportsStore.getState().currentReport,
        filtersApplied: useReportsStore.getState().filters,
        isLoading: useReportsStore.getState().isLoading,
      },
      ui: {
        sidebarCollapsed: useUIStore.getState().sidebarCollapsed,
        preferences: useUIStore.getState().preferences,
        notificationCount: useUIStore.getState().notifications.length,
      },
      persistence: {
        storageHealth: PersistenceService.getStorageHealth(),
        sessionData: PersistenceService.getSessionData(),
      },
      localStorage: {
        usage: LocalStorageManager.getStorageUsage(),
        keys: typeof window !== 'undefined' ? Object.keys(localStorage) : [],
      },
    };
  }

  /**
   * Validate data integrity across stores and localStorage
   */
  static validateDataIntegrity() {
    const issues: string[] = [];

    try {
      // Check auth consistency
      const authState = useAuthStore.getState();
      const storedSession = LocalStorageManager.getAuthSession();
      
      if (authState.isAuthenticated && !storedSession) {
        issues.push('Auth state inconsistent: authenticated but no stored session');
      }

      if (!authState.isAuthenticated && storedSession) {
        issues.push('Auth state inconsistent: not authenticated but session exists');
      }

      // Check preferences consistency
      const uiState = useUIStore.getState();
      const storedPreferences = LocalStorageManager.getUserPreferences();
      
      if (storedPreferences && uiState.preferences.sidebarCollapsed !== (storedPreferences as { sidebarCollapsed?: boolean }).sidebarCollapsed) {
        issues.push('UI preferences inconsistent between store and localStorage');
      }

      // Check filter consistency
      const reportsState = useReportsStore.getState();
      const storedFilters = LocalStorageManager.getReportFilters();
      
      if (storedFilters && JSON.stringify(reportsState.filters) !== JSON.stringify(storedFilters)) {
        issues.push('Report filters inconsistent between store and localStorage');
      }

      // Check storage health
      const storageHealth = PersistenceService.getStorageHealth();
      if (storageHealth.usage.percentage > 90) {
        issues.push('localStorage usage critically high (>90%)');
      }

      if (storageHealth.maintenanceNeeded) {
        issues.push('Storage maintenance needed');
      }

    } catch (error) {
      issues.push(`Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      checkedAt: new Date(),
    };
  }

  /**
   * Auto-fix common data integrity issues
   */
  static autoFixIntegrityIssues() {
    const validation = this.validateDataIntegrity();
    let fixedIssues = 0;

    if (!validation.isValid) {
      validation.issues.forEach(issue => {
        try {
          if (issue.includes('Auth state inconsistent')) {
            // Re-initialize auth
            useAuthStore.getState().initializeAuth();
            fixedIssues++;
          }

          if (issue.includes('UI preferences inconsistent')) {
            // Re-sync UI preferences
            useUIStore.getState().initializeUI();
            fixedIssues++;
          }

          if (issue.includes('Report filters inconsistent')) {
            // Re-sync report filters
            useReportsStore.getState().initializeFilters();
            fixedIssues++;
          }

          if (issue.includes('Storage maintenance needed')) {
            // Perform maintenance
            PersistenceService.performMaintenance();
            fixedIssues++;
          }
        } catch (error) {
          console.warn(`Failed to auto-fix issue: ${issue}`, error);
        }
      });
    }

    return {
      issuesFound: validation.issues.length,
      issuesFixed: fixedIssues,
      remainingIssues: validation.issues.length - fixedIssues,
    };
  }
}

// Export convenience functions
export const cleanupOnLogout = StoreCleanupManager.cleanupOnLogout;
export const initializeStores = StoreCleanupManager.initializeStores;
export const resetAllStores = StoreCleanupManager.resetAllStores;
export const validateDataIntegrity = StoreCleanupManager.validateDataIntegrity;
export const autoFixIntegrityIssues = StoreCleanupManager.autoFixIntegrityIssues;