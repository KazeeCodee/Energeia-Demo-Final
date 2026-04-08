// Integration test for report configuration and client dashboard
import { ReportPersistenceService } from '../report-persistence';
import { ReportSyncService } from '../report-sync';
import { ReportConfig } from '../../types/constructor';

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: jest.fn(() => {
    mockLocalStorage.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window events
const mockEventListeners: Record<string, EventListener[]> = {};
Object.defineProperty(window, 'addEventListener', {  
  value: jest.fn((event: string, callback: EventListener) => {
    if (!mockEventListeners[event]) {
      mockEventListeners[event] = [];
    }
    mockEventListeners[event].push(callback);
  }),
});

Object.defineProperty(window, 'removeEventListener', {
  value: jest.fn((event: string, callback: EventListener) => {
    if (mockEventListeners[event]) {
      const index = mockEventListeners[event].indexOf(callback);
      if (index > -1) {
        mockEventListeners[event].splice(index, 1);
      }
    }
  }),
});

Object.defineProperty(window, 'dispatchEvent', {
  value: jest.fn((event: Event) => {
    const eventType = event.type;
    if (mockEventListeners[eventType]) {
      mockEventListeners[eventType].forEach(callback => callback(event));
    }
  }),
});

describe('Report Integration Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    Object.keys(mockEventListeners).forEach(key => {
      mockEventListeners[key] = [];
    });
    jest.clearAllMocks();
  });

  describe('Configuration Persistence and Loading', () => {
    const mockConfig: ReportConfig = {
      id: 'test-config-1',
      name: 'Test Report Configuration',
      clientId: 'test-client',
      spaces: [
        {
          id: 'space-1',
          columns: 2,
          order: 0,
          components: [
            {
              id: 'component-1',
              type: 'generation-mix',
              columnIndex: 0,
              config: {
                title: 'Test Chart',
                height: 300,
                colors: ['#FF7A00'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: {
                id: 'energy-generation',
                name: 'Test Data Source',
                type: 'energy-generation',
                fields: [],
                sampleData: [],
              },
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    it('should save and load client-specific configuration', async () => {
      // Save configuration
      const saveResult = await ReportPersistenceService.saveConfig(mockConfig);
      expect(saveResult.success).toBe(true);

      // Load configuration
      const loadResult = await ReportPersistenceService.loadConfig('test-client');
      expect(loadResult.success).toBe(true);
      expect(loadResult.config?.id).toBe(mockConfig.id);
      expect(loadResult.config?.clientId).toBe('test-client');
    });

    it('should fall back to global configuration when client config does not exist', async () => {
      // Save global configuration
      const globalConfig = { ...mockConfig, clientId: undefined, name: 'Global Config' };
      await ReportPersistenceService.saveConfig(globalConfig);

      // Try to load client config (should not exist)
      const clientResult = await ReportPersistenceService.loadConfig('non-existent-client');
      expect(clientResult.success).toBe(false);

      // Load global config as fallback
      const globalResult = await ReportPersistenceService.loadConfig(undefined);
      expect(globalResult.success).toBe(true);
      expect(globalResult.config?.name).toBe('Global Config');
    });

    it('should validate configuration before saving', async () => {
      // Create invalid configuration (no components)
      const invalidConfig = {
        ...mockConfig,
        spaces: [
          {
            id: 'empty-space',
            columns: 1 as const,
            order: 0,
            components: [],
          },
        ],
      };

      const result = await ReportPersistenceService.saveConfig(invalidConfig);
      expect(result.success).toBe(false);
      expect(result.message).toContain('al menos un componente');
    });
  });

  describe('Real-time Synchronization', () => {
    it('should broadcast configuration updates', () => {
      const mockConfig: ReportConfig = {
        id: 'sync-test',
        name: 'Sync Test Config',
        clientId: 'sync-client',
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      // Initialize sync service
      ReportSyncService.initialize();

      // Mock listener
      const mockListener = jest.fn();
      ReportSyncService.addListener('test-listener', mockListener);

      // Broadcast update
      ReportSyncService.broadcastConfigUpdate(mockConfig, 'config_updated');

      // Verify event was dispatched
      expect(window.dispatchEvent).toHaveBeenCalled();
    });

    it('should handle sync notifications correctly', () => {
      ReportSyncService.initialize();

      const mockListener = jest.fn();
      ReportSyncService.addListener('test-listener', mockListener);

      // Simulate custom event
      const notification = {
        type: 'config_updated' as const,
        clientId: 'test-client',
        configId: 'test-config',
        timestamp: new Date(),
        message: 'Test update',
      };

      const customEvent = new CustomEvent('report-config-sync', { detail: notification });
      window.dispatchEvent(customEvent);

      // Verify listener was called
      expect(mockListener).toHaveBeenCalledWith(notification);
    });

    it('should clean up listeners properly', () => {
      ReportSyncService.initialize();

      const mockListener = jest.fn();
      ReportSyncService.addListener('cleanup-test', mockListener);

      // Remove listener
      ReportSyncService.removeListener('cleanup-test');

      // Broadcast update
      const mockConfig: ReportConfig = {
        id: 'cleanup-config',
        name: 'Cleanup Test',
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      ReportSyncService.broadcastConfigUpdate(mockConfig);

      // Listener should not be called
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache when configuration is updated', () => {
      const clientId = 'cache-test-client';
      
      // Set some cache data
      mockLocalStorage.setItem(`report_cache_${clientId}`, 'cached-data');
      mockLocalStorage.setItem('report_list_cache', 'cached-list');

      // Invalidate cache
      ReportSyncService.invalidateCache(clientId);

      // Verify cache was cleared
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`report_cache_${clientId}`);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('report_list_cache');
    });

    it('should trigger cache invalidation events', () => {
      const clientId = 'event-test-client';
      
      ReportSyncService.invalidateCache(clientId);

      // Verify cache invalidation event was dispatched
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'report-cache-invalidated',
        })
      );
    });
  });

  describe('Configuration Migration and Compatibility', () => {
    it('should maintain compatibility with existing reports', async () => {
      // This test ensures that when no custom configuration exists,
      // the system falls back gracefully to default behavior
      
      const loadResult = await ReportPersistenceService.loadConfig('new-client');
      expect(loadResult.success).toBe(false);
      
      // This should not throw an error and should be handled gracefully
      // by the CustomizableEnergyReport component
    });

    it('should handle configuration export and import', async () => {
      // Save multiple configurations
      const config1 = { ...mockConfig, clientId: 'client-1', name: 'Config 1' };
      const config2 = { ...mockConfig, clientId: undefined, name: 'Global Config' };

      await ReportPersistenceService.saveConfig(config1);
      await ReportPersistenceService.saveConfig(config2);

      // Export configurations
      const exportData = await ReportPersistenceService.exportConfigurations();
      expect(exportData).toContain('Config 1');
      expect(exportData).toContain('Global Config');

      // Clear storage
      mockLocalStorage.clear();

      // Import configurations
      const importResult = await ReportPersistenceService.importConfigurations(exportData);
      expect(importResult.success).toBe(true);

      // Verify configurations were restored
      const loadResult1 = await ReportPersistenceService.loadConfig('client-1');
      const loadResult2 = await ReportPersistenceService.loadConfig(undefined);

      expect(loadResult1.success).toBe(true);
      expect(loadResult2.success).toBe(true);
      expect(loadResult1.config?.name).toBe('Config 1');
      expect(loadResult2.config?.name).toBe('Global Config');
    });
  });
});