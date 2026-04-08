import { useEffect, useCallback, useState } from 'react';
import { PersistenceService, SessionData } from '@/lib/services/persistence';
import { StoreCleanupManager } from '@/lib/state/cleanup';
import { LocalStorageManager } from '@/lib/utils/localStorage';
import { ReportFilters } from '@/lib/types';

export interface PersistenceHookOptions {
  autoTrackPageViews?: boolean;
  autoSaveFilters?: boolean;
  sessionTimeout?: number; // minutes
  enableActivityTracking?: boolean;
}

export function usePersistence(options: PersistenceHookOptions = {}) {
  const {
    autoTrackPageViews = true,
    autoSaveFilters = true,
    sessionTimeout = 60, // 1 hour
    enableActivityTracking = true,
  } = options;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [storageHealth, setStorageHealth] = useState<ReturnType<typeof PersistenceService.getStorageHealth> | null>(null);

  // Initialize persistence on mount
  useEffect(() => {
    const initData = PersistenceService.getSessionData();
    setSessionData(initData);
    
    const health = PersistenceService.getStorageHealth();
    setStorageHealth(health);

    // Track page view if enabled
    if (autoTrackPageViews && enableActivityTracking) {
      PersistenceService.trackActivity('page_view', {
        page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        timestamp: new Date(),
      });
    }
  }, [autoTrackPageViews, enableActivityTracking]);

  // Session management
  const extendSession = useCallback(() => {
    const updated = PersistenceService.updateSession({
      lastActivity: new Date(),
    });
    setSessionData(updated);
  }, []);

  const checkSessionTimeout = useCallback(() => {
    const session = PersistenceService.getSessionData();
    if (session) {
      const now = new Date();
      const lastActivity = new Date(session.lastActivity);
      const minutesSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
      
      return minutesSinceActivity > sessionTimeout;
    }
    return false;
  }, [sessionTimeout]);

  // Activity tracking
  const trackActivity = useCallback((
    type: 'page_view' | 'filter_applied' | 'report_viewed' | 'download_initiated' | 'link_shared',
    details: Record<string, unknown> = {}
  ) => {
    if (enableActivityTracking) {
      PersistenceService.trackActivity(type, details);
      extendSession();
    }
  }, [enableActivityTracking, extendSession]);

  // Filter management
  const saveFilterPreset = useCallback((name: string, filters: ReportFilters, userId?: string) => {
    const preset = PersistenceService.saveFilterPreset(name, filters, userId);
    trackActivity('filter_applied', { action: 'preset_saved', presetName: name });
    return preset;
  }, [trackActivity]);

  const getFilterPresets = useCallback((userId?: string) => {
    return PersistenceService.getFilterPresets(userId);
  }, []);

  const applyFilterPreset = useCallback((presetId: string) => {
    const filters = PersistenceService.getFilterPresets().find(p => p.id === presetId)?.filters;
    if (filters) {
      trackActivity('filter_applied', { action: 'preset_used', presetId });
    }
    return filters;
  }, [trackActivity]);

  // Storage management
  const getStorageInfo = useCallback(() => {
    return LocalStorageManager.getStorageUsage();
  }, []);

  const performMaintenance = useCallback(() => {
    PersistenceService.performMaintenance();
    const health = PersistenceService.getStorageHealth();
    setStorageHealth(health);
  }, []);

  const validateIntegrity = useCallback(() => {
    return StoreCleanupManager.validateDataIntegrity();
  }, []);

  const autoFixIssues = useCallback(() => {
    return StoreCleanupManager.autoFixIntegrityIssues();
  }, []);

  // Data export/import
  const exportData = useCallback((includeActivities = false) => {
    return PersistenceService.exportUserData(includeActivities);
  }, []);

  const importData = useCallback((data: { data: Record<string, unknown>; version: string }) => {
    const success = PersistenceService.importUserData(data);
    if (success) {
      // Re-initialize stores after import
      StoreCleanupManager.syncStoresWithStorage();
    }
    return success;
  }, []);

  // Backup management
  const createBackup = useCallback(() => {
    return PersistenceService.createBackup();
  }, []);

  const restoreFromBackup = useCallback(() => {
    const success = PersistenceService.restoreFromBackup();
    if (success) {
      StoreCleanupManager.syncStoresWithStorage();
    }
    return success;
  }, []);

  // Cleanup
  const resetAllData = useCallback(() => {
    StoreCleanupManager.resetAllStores();
    setSessionData(null);
    setStorageHealth(null);
  }, []);

  return {
    // Session data
    sessionData,
    storageHealth,
    
    // Session management
    extendSession,
    checkSessionTimeout,
    
    // Activity tracking
    trackActivity,
    
    // Filter management
    saveFilterPreset,
    getFilterPresets,
    applyFilterPreset,
    
    // Storage management
    getStorageInfo,
    performMaintenance,
    validateIntegrity,
    autoFixIssues,
    
    // Data management
    exportData,
    importData,
    createBackup,
    restoreFromBackup,
    resetAllData,
  };
}

// Specialized hooks for common use cases
export function useSessionManagement() {
  const { sessionData, extendSession, checkSessionTimeout } = usePersistence();
  
  // Auto-extend session on activity
  useEffect(() => {
    const handleActivity = () => {
      extendSession();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [extendSession]);

  return {
    sessionData,
    extendSession,
    checkSessionTimeout,
    isSessionActive: !!sessionData,
  };
}

export function useFilterPersistence(userId?: string) {
  const { saveFilterPreset, getFilterPresets, applyFilterPreset, trackActivity } = usePersistence();
  
  const [presets, setPresets] = useState(() => getFilterPresets(userId));

  const refreshPresets = useCallback(() => {
    setPresets(getFilterPresets(userId));
  }, [getFilterPresets, userId]);

  const savePreset = useCallback(async (name: string, filters: ReportFilters) => {
    const preset = saveFilterPreset(name, filters, userId);
    refreshPresets();
    return preset;
  }, [saveFilterPreset, userId, refreshPresets]);

  const applyPreset = useCallback((presetId: string) => {
    const filters = applyFilterPreset(presetId);
    refreshPresets(); // Refresh to update usage count
    return filters;
  }, [applyFilterPreset, refreshPresets]);

  const trackFilterApplication = useCallback((filters: ReportFilters) => {
    trackActivity('filter_applied', { filters });
  }, [trackActivity]);

  return {
    presets,
    savePreset,
    applyPreset,
    refreshPresets,
    trackFilterApplication,
  };
}

export function useStorageHealth() {
  const { getStorageInfo, performMaintenance, validateIntegrity, autoFixIssues } = usePersistence();
  
  const [health, setHealth] = useState(() => PersistenceService.getStorageHealth());

  const refreshHealth = useCallback(() => {
    setHealth(PersistenceService.getStorageHealth());
  }, []);

  const runMaintenance = useCallback(() => {
    performMaintenance();
    refreshHealth();
  }, [performMaintenance, refreshHealth]);

  const runValidation = useCallback(() => {
    const validation = validateIntegrity();
    refreshHealth();
    return validation;
  }, [validateIntegrity, refreshHealth]);

  const runAutoFix = useCallback(() => {
    const result = autoFixIssues();
    refreshHealth();
    return result;
  }, [autoFixIssues, refreshHealth]);

  // Auto-refresh health periodically
  useEffect(() => {
    const interval = setInterval(refreshHealth, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [refreshHealth]);

  return {
    health,
    refreshHealth,
    runMaintenance,
    runValidation,
    runAutoFix,
    storageInfo: getStorageInfo(),
  };
}