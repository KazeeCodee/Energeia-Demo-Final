import { create } from 'zustand';
import { Notification } from '../types';
import { LocalStorageManager } from '../utils/localStorage';

interface UserPreferences {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  notificationDuration: number;
  autoSaveFilters: boolean;
}

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // User preferences
  preferences: UserPreferences;
  
  // Loading states
  globalLoading: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Preference actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  
  // Global loading
  setGlobalLoading: (loading: boolean) => void;
  
  // Initialization
  initializeUI: () => void;
  
  // Data management
  getStorageInfo: () => { used: number; available: number; percentage: number };
  exportUserData: () => Record<string, unknown> | null;
  importUserData: (data: Record<string, unknown>) => boolean;
  resetAllData: () => void;
}

const defaultPreferences: UserPreferences = {
  sidebarCollapsed: false,
  theme: 'light',
  language: 'es',
  notificationDuration: 5000, // 5 seconds
  autoSaveFilters: true,
};

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  notifications: [],
  preferences: defaultPreferences,
  globalLoading: false,

  toggleSidebar: () => {
    const newCollapsed = !get().sidebarCollapsed;
    set({ sidebarCollapsed: newCollapsed });
    
    // Persist sidebar state
    LocalStorageManager.setSidebarState({ collapsed: newCollapsed });
    
    // Also update preferences
    const currentPreferences = get().preferences;
    const updatedPreferences = { ...currentPreferences, sidebarCollapsed: newCollapsed };
    set({ preferences: updatedPreferences });
    LocalStorageManager.setUserPreferences(updatedPreferences);
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
    
    // Persist sidebar state
    LocalStorageManager.setSidebarState({ collapsed });
    
    // Also update preferences
    const currentPreferences = get().preferences;
    const updatedPreferences = { ...currentPreferences, sidebarCollapsed: collapsed };
    set({ preferences: updatedPreferences });
    LocalStorageManager.setUserPreferences(updatedPreferences);
  },

  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateNotificationId(),
      createdAt: new Date(),
      duration: notification.duration || get().preferences.notificationDuration,
    };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id: string) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  updatePreferences: (newPreferences: Partial<UserPreferences>) => {
    const currentPreferences = get().preferences;
    const updatedPreferences = { ...currentPreferences, ...newPreferences };
    
    set({ preferences: updatedPreferences });
    
    // Persist preferences
    LocalStorageManager.setUserPreferences(updatedPreferences);
    
    // Update sidebar state if it changed
    if ('sidebarCollapsed' in newPreferences) {
      set({ sidebarCollapsed: newPreferences.sidebarCollapsed! });
      LocalStorageManager.setSidebarState({ collapsed: newPreferences.sidebarCollapsed! });
    }
  },

  resetPreferences: () => {
    set({ preferences: defaultPreferences });
    LocalStorageManager.setUserPreferences(defaultPreferences);
    
    // Reset sidebar state
    set({ sidebarCollapsed: defaultPreferences.sidebarCollapsed });
    LocalStorageManager.setSidebarState({ collapsed: defaultPreferences.sidebarCollapsed });
  },

  setGlobalLoading: (loading: boolean) => {
    set({ globalLoading: loading });
  },

  initializeUI: () => {
    // Load saved preferences
    const savedPreferences = LocalStorageManager.getUserPreferences() as UserPreferences | null;
    const preferences = savedPreferences ? { ...defaultPreferences, ...savedPreferences } : defaultPreferences;
    
    // Load saved sidebar state
    const sidebarState = LocalStorageManager.getSidebarState() as { collapsed: boolean } | null;
    const sidebarCollapsed = sidebarState?.collapsed ?? preferences.sidebarCollapsed;
    
    set({ 
      preferences,
      sidebarCollapsed,
      notifications: [] // Always start with empty notifications
    });
    
    // Clean up expired data on UI initialization
    LocalStorageManager.cleanupExpiredData();
  },

  getStorageInfo: () => {
    return LocalStorageManager.getStorageUsage();
  },

  exportUserData: () => {
    return LocalStorageManager.exportData();
  },

  importUserData: (data: Record<string, unknown>) => {
    return LocalStorageManager.importData(data);
  },

  resetAllData: () => {
    LocalStorageManager.clear();
    set({
      sidebarCollapsed: defaultPreferences.sidebarCollapsed,
      notifications: [],
      preferences: defaultPreferences,
      globalLoading: false,
    });
  },
}));

// Helper function to generate unique notification IDs
function generateNotificationId(): string {
  return `notification_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Helper hooks for specific UI states
export const useSidebarCollapsed = () => useUIStore(state => state.sidebarCollapsed);
export const useNotifications = () => useUIStore(state => state.notifications);
export const useUserPreferences = () => useUIStore(state => state.preferences);
export const useGlobalLoading = () => useUIStore(state => state.globalLoading);

// Notification helper hooks
export const useNotificationActions = () => {
  const { addNotification, removeNotification, clearAllNotifications } = useUIStore();
  
  const showSuccess = (title: string, message?: string, duration?: number) => {
    addNotification({ type: 'success', title, message, duration });
  };
  
  const showError = (title: string, message?: string, duration?: number) => {
    addNotification({ type: 'error', title, message, duration });
  };
  
  const showWarning = (title: string, message?: string, duration?: number) => {
    addNotification({ type: 'warning', title, message, duration });
  };
  
  const showInfo = (title: string, message?: string, duration?: number) => {
    addNotification({ type: 'info', title, message, duration });
  };
  
  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearAllNotifications,
  };
};

// Theme helper hook
export const useTheme = () => {
  const { preferences, updatePreferences } = useUIStore();
  
  const setTheme = (theme: 'light' | 'dark') => {
    updatePreferences({ theme });
  };
  
  const toggleTheme = () => {
    const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  return {
    theme: preferences.theme,
    setTheme,
    toggleTheme,
  };
};

// Language helper hook
export const useLanguage = () => {
  const { preferences, updatePreferences } = useUIStore();
  
  const setLanguage = (language: 'es' | 'en') => {
    updatePreferences({ language });
  };
  
  return {
    language: preferences.language,
    setLanguage,
  };
};