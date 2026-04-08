import { LocalStorageManager } from '@/lib/utils/localStorage';
import { ReportFilters, User, SharedLink } from '@/lib/types';

export interface PersistenceConfig {
  autoSave: boolean;
  cleanupInterval: number; // minutes
  maxHistoryItems: number;
  compressionEnabled: boolean;
}

export interface SessionData {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  pageViews: number;
  actionsPerformed: number;
  filtersApplied: number;
  reportsViewed: number;
  downloadsInitiated: number;
  [key: string]: unknown;
}

export interface UserActivity {
  type: 'page_view' | 'filter_applied' | 'report_viewed' | 'download_initiated' | 'link_shared';
  timestamp: Date;
  details: Record<string, unknown>;
  userId?: string;
  companyId?: string;
}

export class PersistenceService {
  private static config: PersistenceConfig = {
    autoSave: true,
    cleanupInterval: 60, // 1 hour
    maxHistoryItems: 50,
    compressionEnabled: false,
  };

  private static cleanupTimer: NodeJS.Timeout | null = null;

  static initialize(config?: Partial<PersistenceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Start cleanup timer
    this.startCleanupTimer();

    // Perform initial cleanup
    this.performMaintenance();
  }

  static shutdown() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private static startCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.performMaintenance();
    }, this.config.cleanupInterval * 60 * 1000);
  }

  static performMaintenance() {
    try {
      // Clean expired data
      LocalStorageManager.cleanupExpiredData();

      // Check storage usage and clean if necessary
      const usage = LocalStorageManager.getStorageUsage();
      if (usage.percentage > 80) {
        this.performAggressiveCleanup();
      }

      // Update maintenance timestamp
      LocalStorageManager.set('last_maintenance', new Date());
    } catch (error) {
      console.warn('Error during persistence maintenance:', error);
    }
  }

  private static performAggressiveCleanup() {
    // Remove older filter history
    const filterHistory = LocalStorageManager.getFilterHistory();
    if (filterHistory.length > 10) {
      const recent = filterHistory.slice(-10);
      LocalStorageManager.set('energeia_filter_history', recent);
    }

    // Remove older download history
    const downloadHistory = LocalStorageManager.getDownloadHistory();
    if (downloadHistory.length > 25) {
      const recent = downloadHistory.slice(-25);
      LocalStorageManager.set('energeia_download_history', recent);
    }

    // Clean old processing jobs
    const jobs = LocalStorageManager.getProcessingJobs();
    if (jobs.length > 5) {
      const recent = jobs.slice(-5);
      LocalStorageManager.setProcessingJobs(recent);
    }
  }

  // Session Management
  static initializeSession(user?: User): SessionData {
    const sessionId = this.generateSessionId();
    const sessionData: SessionData = {
      sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      pageViews: 0,
      actionsPerformed: 0,
      filtersApplied: 0,
      reportsViewed: 0,
      downloadsInitiated: 0,
    };

    LocalStorageManager.updateSessionMetadata(sessionData as unknown as Record<string, unknown>);

    if (user) {
      this.trackActivity('page_view', { page: 'login', userId: user.id });
    }

    return sessionData;
  }

  static updateSession(updates: Partial<SessionData>) {
    const current = this.getSessionData() || {
      sessionId: '',
      startTime: new Date(),
      lastActivity: new Date(),
      pageViews: 0,
      actionsPerformed: 0,
      filtersApplied: 0,
      reportsViewed: 0,
      downloadsInitiated: 0,
    };
    const updated = { ...current, ...updates, lastActivity: new Date() };
    LocalStorageManager.updateSessionMetadata(updated as unknown as Record<string, unknown>);
    return updated;
  }

  static getSessionData(): SessionData | null {
    const metadata = LocalStorageManager.getSessionMetadata() as Record<string, unknown> | null;
    if (!metadata) return null;

    // Convert to SessionData format
    return {
      sessionId: metadata.sessionId as string || '',
      startTime: metadata.sessionStart as Date || metadata.startTime as Date || new Date(),
      lastActivity: metadata.lastActivity as Date || new Date(),
      pageViews: metadata.pageViews as number || 0,
      actionsPerformed: metadata.actionsPerformed as number || 0,
      filtersApplied: metadata.filtersApplied as number || 0,
      reportsViewed: metadata.reportsViewed as number || 0,
      downloadsInitiated: metadata.downloadsInitiated as number || 0,
    };
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  // Activity Tracking
  static trackActivity(type: UserActivity['type'], details: Record<string, unknown>) {
    if (!this.config.autoSave) return;

    const activity: UserActivity = {
      type,
      timestamp: new Date(),
      details,
    };

    // Add to activity log
    const activities = LocalStorageManager.get('user_activities', []) as UserActivity[];
    activities.push(activity);

    // Keep only recent activities
    if (activities.length > this.config.maxHistoryItems) {
      activities.splice(0, activities.length - this.config.maxHistoryItems);
    }

    LocalStorageManager.set('user_activities', activities);

    // Update session counters
    const sessionUpdates: Partial<SessionData> = {};
    switch (type) {
      case 'page_view':
        sessionUpdates.pageViews = (this.getSessionData()?.pageViews || 0) + 1;
        break;
      case 'filter_applied':
        sessionUpdates.filtersApplied = (this.getSessionData()?.filtersApplied || 0) + 1;
        break;
      case 'report_viewed':
        sessionUpdates.reportsViewed = (this.getSessionData()?.reportsViewed || 0) + 1;
        break;
      case 'download_initiated':
        sessionUpdates.downloadsInitiated = (this.getSessionData()?.downloadsInitiated || 0) + 1;
        break;
    }

    if (Object.keys(sessionUpdates).length > 0) {
      this.updateSession(sessionUpdates);
    }
  }

  static getActivityLog(): UserActivity[] {
    return LocalStorageManager.get('user_activities', []) as UserActivity[];
  }

  // Filter Persistence Enhancement
  static saveFilterPreset(name: string, filters: ReportFilters, userId?: string) {
    const presets = LocalStorageManager.get('filter_presets', []) as Array<{
      id: string;
      name: string;
      filters: ReportFilters;
      userId?: string;
      createdAt: Date;
      usageCount: number;
    }>;

    const preset = {
      id: `preset_${Date.now()}`,
      name,
      filters,
      userId,
      createdAt: new Date(),
      usageCount: 0,
    };

    presets.push(preset);
    LocalStorageManager.set('filter_presets', presets);

    this.trackActivity('filter_applied', { action: 'preset_saved', presetName: name });
    return preset;
  }

  static getFilterPresets(userId?: string) {
    const presets = LocalStorageManager.get('filter_presets', []) as Array<{
      id: string;
      name: string;
      filters: ReportFilters;
      userId?: string;
      createdAt: Date;
      usageCount: number;
    }>;

    return userId ? presets.filter(p => !p.userId || p.userId === userId) : presets;
  }

  static useFilterPreset(presetId: string) {
    const presets = LocalStorageManager.get('filter_presets', []) as Array<{
      id: string;
      name: string;
      filters: ReportFilters;
      userId?: string;
      createdAt: Date;
      usageCount: number;
    }>;

    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      preset.usageCount += 1;
      LocalStorageManager.set('filter_presets', presets);
      this.trackActivity('filter_applied', { action: 'preset_used', presetId });
      return preset.filters;
    }
    return null;
  }

  // Shared Links Enhancement
  static trackSharedLinkAccess(linkId: string, origin: string) {
    const accessLog = LocalStorageManager.get('shared_links_access_log', []) as Array<{
      linkId: string;
      accessedAt: Date;
      origin: string;
      userAgent?: string;
    }>;

    accessLog.push({
      linkId,
      accessedAt: new Date(),
      origin,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });

    // Keep only last 200 access logs
    if (accessLog.length > 200) {
      accessLog.splice(0, accessLog.length - 200);
    }

    LocalStorageManager.set('shared_links_access_log', accessLog);
    this.trackActivity('link_shared', { action: 'link_accessed', linkId, origin });
  }

  static getSharedLinkAnalytics(linkId?: string) {
    const accessLog = LocalStorageManager.get('shared_links_access_log', []) as Array<{
      linkId: string;
      accessedAt: Date;
      origin: string;
      userAgent?: string;
    }>;

    const filteredLog = linkId ? accessLog.filter(log => log.linkId === linkId) : accessLog;

    return {
      totalAccesses: filteredLog.length,
      uniqueAccesses: new Set(filteredLog.map(log => log.userAgent)).size,
      accessesByOrigin: filteredLog.reduce((acc, log) => {
        acc[log.origin] = (acc[log.origin] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentAccesses: filteredLog
        .sort((a, b) => new Date(b.accessedAt).getTime() - new Date(a.accessedAt).getTime())
        .slice(0, 10),
    };
  }

  // Data Export/Import
  static exportUserData(includeActivities = false) {
    const data = LocalStorageManager.exportData();

    if (!includeActivities && data) {
      delete data.user_activities;
      delete data.shared_links_access_log;
    }

    return {
      exportedAt: new Date(),
      version: '1.0',
      data,
    };
  }

  static importUserData(exportedData: { data: Record<string, unknown>; version: string }) {
    try {
      if (exportedData.version !== '1.0') {
        throw new Error('Unsupported data version');
      }

      const success = LocalStorageManager.importData(exportedData.data);

      if (success) {
        this.trackActivity('page_view', { action: 'data_imported' });
      }

      return success;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }

  // Storage Health
  static getStorageHealth() {
    const usage = LocalStorageManager.getStorageUsage();
    const lastMaintenance = LocalStorageManager.get('last_maintenance') as Date | null;
    const sessionData = this.getSessionData();

    return {
      usage,
      lastMaintenance,
      sessionActive: !!sessionData,
      sessionDuration: sessionData ?
        new Date().getTime() - new Date(sessionData.startTime).getTime() : 0,
      maintenanceNeeded: usage.percentage > 80 ||
        (lastMaintenance && new Date().getTime() - new Date(lastMaintenance).getTime() > 24 * 60 * 60 * 1000),
    };
  }

  // Backup and Recovery
  static createBackup() {
    const backup = {
      timestamp: new Date(),
      data: LocalStorageManager.exportData(),
      sessionInfo: this.getSessionData(),
    };

    // Store backup in a separate key
    LocalStorageManager.set('data_backup', backup);
    return backup;
  }

  static restoreFromBackup() {
    const backup = LocalStorageManager.get('data_backup') as {
      timestamp: Date;
      data: Record<string, unknown>;
      sessionInfo: SessionData;
    } | null;

    if (backup && backup.data) {
      const success = LocalStorageManager.importData(backup.data);
      if (success) {
        this.trackActivity('page_view', { action: 'backup_restored', backupTimestamp: backup.timestamp });
      }
      return success;
    }

    return false;
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  PersistenceService.initialize();
}