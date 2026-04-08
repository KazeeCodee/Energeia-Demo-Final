// localStorage utilities for data persistence simulation

const STORAGE_KEYS = {
  AUTH_SESSION: 'energeia_auth_session',
  USER_PREFERENCES: 'energeia_user_preferences',
  REPORT_FILTERS: 'energeia_report_filters',
  SIDEBAR_STATE: 'energeia_sidebar_state',
  SHARED_LINKS: 'energeia_shared_links',
  MOCK_DATA: 'energeia_mock_data',
  PROCESSING_JOBS: 'energeia_processing_jobs',
  FILTER_HISTORY: 'energeia_filter_history',
  SESSION_METADATA: 'energeia_session_metadata',
  DOWNLOAD_HISTORY: 'energeia_download_history',
  SHARED_LINKS_ACCESS_LOG: 'energeia_shared_links_access_log',
} as const;

export class LocalStorageManager {
  private static isClient = typeof window !== 'undefined';

  // Generic get/set methods with type safety
  static get<T>(key: string, defaultValue?: T): T | null {
    if (!this.isClient) return defaultValue || null;
    
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue || null;
      
      const parsed = JSON.parse(item);
      
      // Handle Date objects
      return this.reviveDates(parsed) as T;
    } catch (error) {
      console.warn(`Error reading from localStorage key "${key}":`, error);
      return defaultValue || null;
    }
  }

  static set<T>(key: string, value: T): boolean {
    if (!this.isClient) return false;
    
    try {
      const serialized = JSON.stringify(value, this.dateReplacer);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  }

  static remove(key: string): boolean {
    if (!this.isClient) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }

  static clear(): boolean {
    if (!this.isClient) return false;
    
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
      return false;
    }
  }

  // Date handling helpers
  private static dateReplacer(key: string, value: unknown): unknown {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  }

  private static reviveDates(obj: unknown): unknown {
    if (obj && typeof obj === 'object') {
      const objRecord = obj as Record<string, unknown>;
      
      if (objRecord.__type === 'Date') {
        return new Date(objRecord.value as string);
      }
      
      if (Array.isArray(obj)) {
        return obj.map(item => this.reviveDates(item));
      }
      
      const result: Record<string, unknown> = {};
      for (const key in objRecord) {
        result[key] = this.reviveDates(objRecord[key]);
      }
      return result;
    }
    return obj;
  }

  // Specific storage methods for different data types
  static getAuthSession() {
    return this.get(STORAGE_KEYS.AUTH_SESSION);
  }

  static setAuthSession(session: unknown) {
    return this.set(STORAGE_KEYS.AUTH_SESSION, session);
  }

  static clearAuthSession() {
    return this.remove(STORAGE_KEYS.AUTH_SESSION);
  }

  static getUserPreferences() {
    return this.get(STORAGE_KEYS.USER_PREFERENCES, {
      sidebarCollapsed: false,
      theme: 'light',
      language: 'es',
    });
  }

  static setUserPreferences(preferences: unknown) {
    return this.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  static getReportFilters() {
    return this.get(STORAGE_KEYS.REPORT_FILTERS);
  }

  static setReportFilters(filters: unknown) {
    return this.set(STORAGE_KEYS.REPORT_FILTERS, filters);
  }

  static getSidebarState() {
    return this.get(STORAGE_KEYS.SIDEBAR_STATE, { collapsed: false });
  }

  static setSidebarState(state: unknown) {
    return this.set(STORAGE_KEYS.SIDEBAR_STATE, state);
  }

  static getSharedLinks(): unknown[] {
    return this.get(STORAGE_KEYS.SHARED_LINKS, []) || [];
  }

  static setSharedLinks(links: unknown[]) {
    return this.set(STORAGE_KEYS.SHARED_LINKS, links);
  }

  static addSharedLink(link: Record<string, unknown>) {
    const links = this.getSharedLinks();
    links.push(link);
    return this.setSharedLinks(links);
  }

  static updateSharedLink(linkId: string, updates: Record<string, unknown>) {
    const links = this.getSharedLinks();
    const index = links.findIndex((link: unknown) => (link as Record<string, unknown>).id === linkId);
    
    if (index !== -1) {
      const currentLink = links[index] as Record<string, unknown>;
      links[index] = { ...currentLink, ...updates };
      return this.setSharedLinks(links);
    }
    return false;
  }

  static getMockData() {
    return this.get(STORAGE_KEYS.MOCK_DATA);
  }

  static setMockData(data: unknown) {
    return this.set(STORAGE_KEYS.MOCK_DATA, data);
  }

  static getProcessingJobs(): unknown[] {
    return this.get(STORAGE_KEYS.PROCESSING_JOBS, []) || [];
  }

  static setProcessingJobs(jobs: unknown[]) {
    return this.set(STORAGE_KEYS.PROCESSING_JOBS, jobs);
  }

  static addProcessingJob(job: Record<string, unknown>) {
    const jobs = this.getProcessingJobs();
    jobs.push(job);
    return this.setProcessingJobs(jobs);
  }

  static updateProcessingJob(jobId: string, updates: Record<string, unknown>) {
    const jobs = this.getProcessingJobs();
    const index = jobs.findIndex((job: unknown) => (job as Record<string, unknown>).id === jobId);
    
    if (index !== -1) {
      const currentJob = jobs[index] as Record<string, unknown>;
      jobs[index] = { ...currentJob, ...updates };
      return this.setProcessingJobs(jobs);
    }
    return false;
  }

  // Enhanced filter persistence methods
  static getFilterHistory(): unknown[] {
    return this.get(STORAGE_KEYS.FILTER_HISTORY, []) || [];
  }

  static addFilterToHistory(filters: unknown) {
    const history = this.getFilterHistory();
    const timestamp = new Date();
    
    // Add new filter with timestamp
    history.push({
      filters,
      timestamp,
      id: `filter_${timestamp.getTime()}`
    });
    
    // Keep only last 20 filter combinations
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    return this.set(STORAGE_KEYS.FILTER_HISTORY, history);
  }

  static getSessionMetadata() {
    return this.get(STORAGE_KEYS.SESSION_METADATA, {
      sessionStart: new Date(),
      lastActivity: new Date(),
      pageViews: 0,
      actionsPerformed: 0,
    });
  }

  static updateSessionMetadata(updates: Record<string, unknown>) {
    const current = this.getSessionMetadata() as Record<string, unknown>;
    const updated = { ...current, ...updates, lastActivity: new Date() };
    return this.set(STORAGE_KEYS.SESSION_METADATA, updated);
  }

  static getDownloadHistory(): unknown[] {
    return this.get(STORAGE_KEYS.DOWNLOAD_HISTORY, []) || [];
  }

  static addDownloadToHistory(download: Record<string, unknown>) {
    const history = this.getDownloadHistory();
    history.push({
      ...download,
      timestamp: new Date(),
      id: `download_${Date.now()}`
    });
    
    // Keep only last 50 downloads
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    return this.set(STORAGE_KEYS.DOWNLOAD_HISTORY, history);
  }

  // Cleanup methods
  static cleanupExpiredData() {
    const now = new Date();
    
    // Clean expired shared links
    const links = this.getSharedLinks() || [];
    const validLinks = links.filter((link: unknown) => {
      const linkObj = link as Record<string, unknown>;
      const expiresAt = new Date(linkObj.expiresAt as string);
      return expiresAt > now && linkObj.status !== 'revoked';
    });
    this.setSharedLinks(validLinks);

    // Clean old processing jobs (keep last 10)
    const jobs = this.getProcessingJobs() || [];
    if (jobs.length > 10) {
      const sortedJobs = jobs.sort((a: unknown, b: unknown) => {
        const aObj = a as Record<string, unknown>;
        const bObj = b as Record<string, unknown>;
        return new Date(bObj.startedAt as string).getTime() - new Date(aObj.startedAt as string).getTime();
      });
      this.setProcessingJobs(sortedJobs.slice(0, 10));
    }

    // Clean old filter history (keep last 20)
    const filterHistory = this.getFilterHistory();
    if (filterHistory.length > 20) {
      const sortedHistory = filterHistory.sort((a: unknown, b: unknown) => {
        const aObj = a as Record<string, unknown>;
        const bObj = b as Record<string, unknown>;
        return new Date(bObj.timestamp as string).getTime() - new Date(aObj.timestamp as string).getTime();
      });
      this.set(STORAGE_KEYS.FILTER_HISTORY, sortedHistory.slice(0, 20));
    }

    // Clean old download history (keep last 50)
    const downloadHistory = this.getDownloadHistory();
    if (downloadHistory.length > 50) {
      const sortedDownloads = downloadHistory.sort((a: unknown, b: unknown) => {
        const aObj = a as Record<string, unknown>;
        const bObj = b as Record<string, unknown>;
        return new Date(bObj.timestamp as string).getTime() - new Date(aObj.timestamp as string).getTime();
      });
      this.set(STORAGE_KEYS.DOWNLOAD_HISTORY, sortedDownloads.slice(0, 50));
    }

    // Clean old access logs (keep last 100)
    const accessLog = this.get(STORAGE_KEYS.SHARED_LINKS_ACCESS_LOG, []) as unknown[];
    if (accessLog.length > 100) {
      const sortedLog = accessLog.sort((a: unknown, b: unknown) => {
        const aObj = a as Record<string, unknown>;
        const bObj = b as Record<string, unknown>;
        return new Date(bObj.accessedAt as string).getTime() - new Date(aObj.accessedAt as string).getTime();
      });
      this.set(STORAGE_KEYS.SHARED_LINKS_ACCESS_LOG, sortedLog.slice(0, 100));
    }
  }

  static cleanupOnLogout() {
    // Clear session-specific data but keep user preferences
    this.clearAuthSession();
    this.remove(STORAGE_KEYS.SESSION_METADATA);
    
    // Clean up expired data
    this.cleanupExpiredData();
    
    // Reset sidebar to default state but keep user preference
    const preferences = this.getUserPreferences() as Record<string, unknown>;
    if (preferences && typeof preferences.sidebarCollapsed === 'boolean') {
      this.setSidebarState({ collapsed: preferences.sidebarCollapsed });
    } else {
      this.setSidebarState({ collapsed: false });
    }
  }

  static getStorageUsage(): { used: number; available: number; percentage: number } {
    if (!this.isClient) return { used: 0, available: 0, percentage: 0 };
    
    try {
      let totalSize = 0;
      
      // Calculate size of all stored data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      }
      
      // Estimate available space (most browsers have ~5-10MB limit)
      const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (totalSize / estimatedLimit) * 100;
      
      return {
        used: totalSize,
        available: estimatedLimit - totalSize,
        percentage: Math.min(percentage, 100)
      };
    } catch (error) {
      console.warn('Error calculating storage usage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Development helpers
  static exportData() {
    if (!this.isClient) return null;
    
    const data: Record<string, unknown> = {};
    Object.values(STORAGE_KEYS).forEach(key => {
      const value = this.get(key);
      if (value !== null) {
        data[key] = value;
      }
    });
    return data;
  }

  static importData(data: Record<string, unknown>) {
    if (!this.isClient) return false;
    
    try {
      Object.entries(data).forEach(([key, value]) => {
        this.set(key, value);
      });
      return true;
    } catch (error) {
      console.warn('Error importing data:', error);
      return false;
    }
  }
}

export { STORAGE_KEYS };