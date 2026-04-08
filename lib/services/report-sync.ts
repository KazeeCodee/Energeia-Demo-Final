// Real-time Report Configuration Synchronization Service
import { ReportConfig } from '../types/constructor';
import { toast } from 'sonner';

export interface SyncNotification {
  type: 'config_updated' | 'config_deleted' | 'config_created';
  clientId?: string;
  configId: string;
  timestamp: Date;
  message: string;
}

/**
 * Service for handling real-time synchronization of report configurations
 * between the constructor and client dashboards
 */
export class ReportSyncService {
  private static listeners: Map<string, (notification: SyncNotification) => void> = new Map();
  private static isInitialized = false;

  /**
   * Initialize the sync service
   */
  static initialize() {
    if (this.isInitialized) return;

    // Listen for storage events (cross-tab communication)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
      
      // Listen for custom events (same-tab communication)
      window.addEventListener('report-config-sync', this.handleCustomEvent.bind(this) as EventListener);
    }

    this.isInitialized = true;
  }

  /**
   * Handle localStorage changes from other tabs
   */
  private static handleStorageChange(event: StorageEvent) {
    if (!event.key || !event.newValue) return;

    // Check if it's a report configuration change
    if (event.key === 'constructor_config_global') {
      this.notifyListeners({
        type: 'config_updated',
        configId: 'global',
        timestamp: new Date(),
        message: 'Configuración global actualizada',
      });
    } else if (event.key.startsWith('constructor_config_client_')) {
      const clientId = event.key.replace('constructor_config_client_', '');
      this.notifyListeners({
        type: 'config_updated',
        clientId,
        configId: clientId,
        timestamp: new Date(),
        message: `Configuración del cliente ${clientId} actualizada`,
      });
    }
  }

  /**
   * Handle custom events from the same tab
   */
  private static handleCustomEvent(event: Event) {
    const customEvent = event as CustomEvent<SyncNotification>;
    this.notifyListeners(customEvent.detail);
  }

  /**
   * Notify all registered listeners
   */
  private static notifyListeners(notification: SyncNotification) {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  /**
   * Register a listener for sync notifications
   */
  static addListener(id: string, callback: (notification: SyncNotification) => void) {
    this.initialize();
    this.listeners.set(id, callback);
  }

  /**
   * Remove a listener
   */
  static removeListener(id: string) {
    this.listeners.delete(id);
  }

  /**
   * Broadcast a configuration update (for same-tab communication)
   */
  static broadcastConfigUpdate(config: ReportConfig, type: SyncNotification['type'] = 'config_updated') {
    if (typeof window === 'undefined') return;

    const notification: SyncNotification = {
      type,
      clientId: config.clientId,
      configId: config.id,
      timestamp: new Date(),
      message: this.getUpdateMessage(config, type),
    };

    // Dispatch custom event for same-tab listeners
    window.dispatchEvent(new CustomEvent('report-config-sync', { detail: notification }));

    // Show toast notification
    this.showUpdateNotification(notification);
  }

  /**
   * Broadcast a configuration deletion
   */
  static broadcastConfigDeletion(clientId?: string) {
    if (typeof window === 'undefined') return;

    const notification: SyncNotification = {
      type: 'config_deleted',
      clientId,
      configId: clientId || 'global',
      timestamp: new Date(),
      message: clientId 
        ? `Configuración del cliente ${clientId} eliminada`
        : 'Configuración global eliminada',
    };

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('report-config-sync', { detail: notification }));

    // Show toast notification
    this.showUpdateNotification(notification);
  }

  /**
   * Invalidate cache for a specific configuration
   */
  static invalidateCache(clientId?: string) {
    // Clear any cached data related to the configuration
    const cacheKeys = [
      `report_cache_${clientId || 'global'}`,
      `report_data_${clientId || 'global'}`,
      'report_list_cache',
    ];

    cacheKeys.forEach(key => {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    });

    // Force refresh of any cached components
    this.triggerCacheInvalidation(clientId);
  }

  /**
   * Trigger cache invalidation event
   */
  private static triggerCacheInvalidation(clientId?: string) {
    if (typeof window === 'undefined') return;

    window.dispatchEvent(new CustomEvent('report-cache-invalidated', {
      detail: { clientId }
    }));
  }

  /**
   * Show update notification to user
   */
  private static showUpdateNotification(notification: SyncNotification) {
    const isConstructorPage = window.location.pathname.includes('/constructor-informes');
    
    // Don't show notifications on the constructor page (user is already aware)
    if (isConstructorPage) return;

    switch (notification.type) {
      case 'config_updated':
        toast.success('Informe actualizado', {
          description: notification.message,
          action: {
            label: 'Actualizar',
            onClick: () => window.location.reload(),
          },
        });
        break;
      
      case 'config_created':
        toast.info('Nuevo informe disponible', {
          description: notification.message,
          action: {
            label: 'Ver',
            onClick: () => window.location.reload(),
          },
        });
        break;
      
      case 'config_deleted':
        toast.warning('Informe eliminado', {
          description: notification.message,
        });
        break;
    }
  }

  /**
   * Get appropriate message for update type
   */
  private static getUpdateMessage(config: ReportConfig, type: SyncNotification['type']): string {
    const scope = config.clientId ? `cliente ${config.clientId}` : 'global';
    
    switch (type) {
      case 'config_created':
        return `Nuevo informe "${config.name}" creado para ${scope}`;
      case 'config_updated':
        return `Informe "${config.name}" actualizado para ${scope}`;
      case 'config_deleted':
        return `Informe "${config.name}" eliminado para ${scope}`;
      default:
        return `Configuración de ${scope} modificada`;
    }
  }

  /**
   * Check if there are pending updates for a configuration
   */
  static async checkForUpdates(clientId?: string): Promise<boolean> {
    try {
      // In a real implementation, this would check with a server
      // For now, we'll check localStorage timestamps
      
      const storageKey = clientId 
        ? `constructor_config_client_${clientId}`
        : 'constructor_config_global';
      
      const lastCheckKey = `last_check_${clientId || 'global'}`;
      const lastCheck = localStorage.getItem(lastCheckKey);
      const configData = localStorage.getItem(storageKey);
      
      if (!configData) return false;
      
      try {
        const config = JSON.parse(configData);
        const configUpdated = new Date(config.updatedAt);
        const lastCheckTime = lastCheck ? new Date(lastCheck) : new Date(0);
        
        // Update last check time
        localStorage.setItem(lastCheckKey, new Date().toISOString());
        
        return configUpdated > lastCheckTime;
      } catch {
        return false;
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }

  /**
   * Force refresh of all report views
   */
  static forceRefresh() {
    if (typeof window === 'undefined') return;

    // Clear all report-related cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('report_') || key.startsWith('constructor_')) {
        localStorage.removeItem(key);
      }
    });

    // Trigger global refresh event
    window.dispatchEvent(new CustomEvent('report-force-refresh'));
    
    // Show notification
    toast.success('Informes actualizados', {
      description: 'Todas las vistas han sido refrescadas',
    });
  }

  /**
   * Get sync status for debugging
   */
  static getSyncStatus() {
    return {
      isInitialized: this.isInitialized,
      listenersCount: this.listeners.size,
      listeners: Array.from(this.listeners.keys()),
    };
  }

  /**
   * Clean up resources
   */
  static cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageChange);
      window.removeEventListener('report-config-sync', this.handleCustomEvent as EventListener);
    }
    
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// Auto-initialize when imported in browser environment
if (typeof window !== 'undefined') {
  ReportSyncService.initialize();
}