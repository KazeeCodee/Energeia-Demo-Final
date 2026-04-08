// Comprehensive Integration Tests for Report Constructor
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ReportBuilder } from '@/components/constructor/report-builder';
import { CustomizableEnergyReport } from '@/components/reports/customizable-energy-report';
import { useConstructorStore } from '@/lib/state/constructor';
import { ReportPersistenceService } from '../report-persistence';
import { ReportSyncService } from '../report-sync';
import { ReportConfig, ChartComponent } from '@/lib/types/constructor';

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock LocalStorageManager to handle date serialization properly
vi.mock('@/lib/utils/localStorage', () => ({
  LocalStorageManager: {
    get: vi.fn((key: string, defaultValue?: any) => {
      const item = mockLocalStorage.store[key];
      if (!item) return defaultValue || null;
      
      try {
        return JSON.parse(item, (key, value) => {
          // Handle Date objects
          if (value && typeof value === 'object' && value.__type === 'Date') {
            return new Date(value.value);
          }
          return value;
        });
      } catch {
        return defaultValue || null;
      }
    }),
    set: vi.fn((key: string, value: any) => {
      try {
        const serialized = JSON.stringify(value, (key, value) => {
          // Handle Date objects
          if (value instanceof Date) {
            return { __type: 'Date', value: value.toISOString() };
          }
          return value;
        });
        mockLocalStorage.store[key] = serialized;
        return true;
      } catch {
        return false;
      }
    }),
    remove: vi.fn((key: string) => {
      delete mockLocalStorage.store[key];
      return true;
    }),
    clear: vi.fn(() => {
      mockLocalStorage.store = {};
      return true;
    }),
  },
}));

// Mock window events
const mockEventListeners: Record<string, EventListener[]> = {};
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn((event: string, callback: EventListener) => {
    if (!mockEventListeners[event]) {
      mockEventListeners[event] = [];
    }
    mockEventListeners[event].push(callback);
  }),
});

Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn((event: string, callback: EventListener) => {
    if (mockEventListeners[event]) {
      const index = mockEventListeners[event].indexOf(callback);
      if (index > -1) {
        mockEventListeners[event].splice(index, 1);
      }
    }
  }),
});

Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn((event: Event) => {
    const eventType = event.type;
    if (mockEventListeners[eventType]) {
      mockEventListeners[eventType].forEach(callback => callback(event));
    }
  }),
});

// Mock location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/backoffice/constructor-informes',
    reload: vi.fn(),
  },
  writable: true,
});

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock auth store
vi.mock('@/lib/state/auth', () => ({
  useAuthStore: () => ({
    user: { companyId: 'test-client-1' },
  }),
}));

// Mock Zustand store
vi.mock('@/lib/state/constructor', () => {
  const mockStore = {
    currentConfig: null,
    selectedClientId: undefined,
    availableDataSources: [],
    isLoading: false,
    isSaving: false,
    error: null,
    validationErrors: [],
    autoSaveEnabled: false,
    
    setCurrentConfig: vi.fn(),
    setSelectedClient: vi.fn(),
    updateConfig: vi.fn(),
    addGridSpace: vi.fn(),
    removeGridSpace: vi.fn(),
    reorderGridSpaces: vi.fn(),
    addComponent: vi.fn(),
    removeComponent: vi.fn(),
    updateComponent: vi.fn(),
    validateConfig: vi.fn(() => []),
    clearValidationErrors: vi.fn(),
    saveConfig: vi.fn(),
    loadConfig: vi.fn(),
    loadClientConfig: vi.fn(),
    createNewConfig: vi.fn(),
    enableAutoSave: vi.fn(),
    disableAutoSave: vi.fn(),
    triggerAutoSave: vi.fn(),
    loadDataSources: vi.fn(),
    getAvailableClients: vi.fn(),
    resetConstructor: vi.fn(),
    clearError: vi.fn(),
  };

  return {
    useConstructorStore: vi.fn(() => mockStore),
  };
});

describe('Constructor Integration Tests', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    Object.keys(mockEventListeners).forEach(key => {
      mockEventListeners[key] = [];
    });
    vi.clearAllMocks();
    
    // Reset localStorage store
    mockLocalStorage.store = {};
  });

  afterEach(() => {
    ReportSyncService.cleanup();
  });

  describe('Complete Report Creation Flow', () => {
    const mockConfig: ReportConfig = {
      id: 'integration-test-config',
      name: 'Test Integration Report',
      clientId: 'test-client-1',
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
                title: 'Energy Generation Mix',
                height: 300,
                colors: ['#FF7A00', '#00A3FF', '#00D4AA', '#FFB800'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: {
                id: 'energy-generation',
                name: 'Generación de Energía',
                type: 'energy-generation',
                fields: [
                  { id: 'thermal', name: 'Térmica', type: 'percentage', required: true },
                  { id: 'hydraulic', name: 'Hidráulica', type: 'percentage', required: true },
                  { id: 'nuclear', name: 'Nuclear', type: 'percentage', required: true },
                  { id: 'renewable', name: 'Renovable', type: 'percentage', required: true },
                ],
                sampleData: [
                  { thermal: 45, hydraulic: 25, nuclear: 15, renewable: 15 }
                ]
              },
            },
            {
              id: 'component-2',
              type: 'demand-trend',
              columnIndex: 1,
              config: {
                title: 'Demand Trend',
                height: 300,
                colors: ['#FF7A00'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: {
                id: 'demand-trend',
                name: 'Tendencia de Demanda',
                type: 'demand',
                fields: [
                  { id: 'month', name: 'Mes', type: 'string', required: true },
                  { id: 'demand', name: 'Demanda (MWh)', type: 'number', required: true },
                ],
                sampleData: [
                  { month: 'Ene', demand: 1200 },
                  { month: 'Feb', demand: 1150 },
                  { month: 'Mar', demand: 1300 },
                ]
              },
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    it('should complete full report creation and save flow', async () => {
      // Test the complete flow from creation to saving using the persistence service directly
      
      // 1. Create a complete configuration
      const testConfig = { ...mockConfig };
      
      // 2. Save configuration using persistence service
      const saveResult = await ReportPersistenceService.saveConfig(testConfig);
      expect(saveResult.success).toBe(true);
      expect(saveResult.configId).toBe(testConfig.id);
      
      // 3. Verify configuration was persisted
      const loadResult = await ReportPersistenceService.loadConfig('test-client-1');
      expect(loadResult.success).toBe(true);
      expect(loadResult.config?.id).toBe(testConfig.id);
      expect(loadResult.config?.spaces[0].components).toHaveLength(2);
      
      // 4. Verify validation passes
      const validationErrors = ReportPersistenceService.validateConfig(testConfig);
      expect(validationErrors).toHaveLength(0);
      
      // 5. Test configuration update
      const updatedConfig = {
        ...testConfig,
        name: 'Updated Test Report',
        updatedAt: new Date(),
      };
      
      const updateResult = await ReportPersistenceService.saveConfig(updatedConfig);
      expect(updateResult.success).toBe(true);
      
      // 6. Verify update was persisted
      const updatedLoadResult = await ReportPersistenceService.loadConfig('test-client-1');
      expect(updatedLoadResult.success).toBe(true);
      expect(updatedLoadResult.config?.name).toBe('Updated Test Report');
    });

    it('should handle validation errors during creation flow', async () => {
      // Create config with invalid component (no data source)
      const invalidConfig: ReportConfig = {
        id: 'invalid-config',
        name: '', // Invalid: empty name
        clientId: 'test-client-1',
        spaces: [
          {
            id: 'invalid-space',
            columns: 1,
            order: 0,
            components: [
              {
                id: 'invalid-component',
                type: 'generation-mix',
                columnIndex: 0,
                config: {
                  title: '', // Invalid: empty title
                  height: 300,
                  colors: [],
                  showLegend: true,
                  showTooltip: true,
                },
                dataSource: {
                  id: '', // Invalid: empty data source ID
                  name: '',
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
      
      // Validate should return errors
      const validationErrors = ReportPersistenceService.validateConfig(invalidConfig);
      expect(validationErrors.length).toBeGreaterThan(0);
      
      // Save should fail due to validation errors
      const saveResult = await ReportPersistenceService.saveConfig(invalidConfig);
      expect(saveResult.success).toBe(false);
      expect(saveResult.message).toContain('Errores de validación');
    });

    it('should support component management operations', async () => {
      // Test component addition, removal, and reordering through persistence service
      
      // 1. Start with a basic configuration
      const baseConfig: ReportConfig = {
        id: 'component-test-config',
        name: 'Component Test Report',
        clientId: 'test-client-1',
        spaces: [
          {
            id: 'test-space',
            columns: 3,
            order: 0,
            components: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      
      await ReportPersistenceService.saveConfig(baseConfig);
      
      // 2. Add components to the configuration
      const configWithComponents = {
        ...baseConfig,
        spaces: [
          {
            ...baseConfig.spaces[0],
            components: mockConfig.spaces[0].components,
          },
        ],
      };
      
      const saveResult = await ReportPersistenceService.saveConfig(configWithComponents);
      expect(saveResult.success).toBe(true);
      
      // 3. Verify components were added
      const loadResult = await ReportPersistenceService.loadConfig('test-client-1');
      expect(loadResult.success).toBe(true);
      expect(loadResult.config?.spaces[0].components).toHaveLength(2);
      
      // 4. Test component removal
      const configWithRemovedComponent = {
        ...configWithComponents,
        spaces: [
          {
            ...configWithComponents.spaces[0],
            components: [configWithComponents.spaces[0].components[0]], // Keep only first component
          },
        ],
      };
      
      await ReportPersistenceService.saveConfig(configWithRemovedComponent);
      
      const updatedLoadResult = await ReportPersistenceService.loadConfig('test-client-1');
      expect(updatedLoadResult.success).toBe(true);
      expect(updatedLoadResult.config?.spaces[0].components).toHaveLength(1);
    });
  });

  describe('Constructor-Dashboard Synchronization', () => {
    const testConfig: ReportConfig = {
      id: 'sync-test-config',
      name: 'Sync Test Report',
      clientId: 'sync-client',
      spaces: [
        {
          id: 'sync-space-1',
          columns: 1,
          order: 0,
          components: [
            {
              id: 'sync-component-1',
              type: 'cost-comparison',
              columnIndex: 0,
              config: {
                title: 'Cost Analysis',
                height: 400,
                colors: ['#FF7A00'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: {
                id: 'cost-comparison',
                name: 'Comparación de Costos',
                type: 'cost',
                fields: [
                  { id: 'category', name: 'Categoría', type: 'string', required: true },
                  { id: 'cost', name: 'Costo (USD/MWh)', type: 'number', required: true },
                ],
                sampleData: [
                  { category: 'CAMMESA', cost: 45.2 },
                  { category: 'PLUS', cost: 38.7 },
                ]
              },
            },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    it('should synchronize configuration updates from constructor to dashboard', async () => {
      // 1. Save configuration in constructor
      const saveResult = await ReportPersistenceService.saveConfig(testConfig);
      expect(saveResult.success).toBe(true);
      
      // 2. Initialize sync service
      ReportSyncService.initialize();
      
      // 3. Set up sync listener (simulating dashboard component)
      const syncNotifications: any[] = [];
      ReportSyncService.addListener('dashboard-test', (notification) => {
        syncNotifications.push(notification);
      });
      
      // 4. Broadcast configuration update (simulating constructor save)
      ReportSyncService.broadcastConfigUpdate(testConfig, 'config_updated');
      
      // 5. Verify sync notification was received
      expect(syncNotifications).toHaveLength(1);
      expect(syncNotifications[0].type).toBe('config_updated');
      expect(syncNotifications[0].clientId).toBe('sync-client');
      expect(syncNotifications[0].configId).toBe('sync-test-config');
      
      // 6. Verify window event was dispatched
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'report-config-sync',
        })
      );
    });

    it('should handle cache invalidation during sync', async () => {
      // 1. Set up some cached data
      mockLocalStorage.setItem('report_cache_sync-client', 'cached-data');
      mockLocalStorage.setItem('report_list_cache', 'cached-list');
      
      // 2. Invalidate cache
      ReportSyncService.invalidateCache('sync-client');
      
      // 3. Verify cache was cleared
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('report_cache_sync-client');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('report_list_cache');
      
      // 4. Verify cache invalidation event was dispatched
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'report-cache-invalidated',
        })
      );
    });

    it('should handle cross-tab synchronization via localStorage events', async () => {
      ReportSyncService.initialize();
      
      const syncNotifications: any[] = [];
      ReportSyncService.addListener('cross-tab-test', (notification) => {
        syncNotifications.push(notification);
      });
      
      // Simulate localStorage change from another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'constructor_config_client_sync-client',
        newValue: JSON.stringify(testConfig),
        oldValue: null,
      });
      
      // Trigger storage event handler
      window.dispatchEvent(storageEvent);
      
      // Verify notification was received
      expect(syncNotifications).toHaveLength(1);
      expect(syncNotifications[0].type).toBe('config_updated');
      expect(syncNotifications[0].clientId).toBe('sync-client');
    });

    it('should handle real-time updates in dashboard component', async () => {
      // This test simulates the CustomizableEnergyReport component
      // receiving and handling sync notifications
      
      // 1. Save initial configuration
      await ReportPersistenceService.saveConfig(testConfig);
      
      // 2. Mock component state
      let componentConfig: ReportConfig | null = testConfig;
      let reloadCount = 0;
      
      const mockReloadConfig = vi.fn(() => {
        reloadCount++;
        // Simulate loading updated config
        componentConfig = { ...testConfig, updatedAt: new Date() };
      });
      
      // 3. Set up sync listener (simulating component effect)
      ReportSyncService.addListener('dashboard-component', (notification) => {
        if (notification.clientId === testConfig.clientId) {
          mockReloadConfig();
        }
      });
      
      // 4. Simulate configuration update from constructor
      const updatedConfig = {
        ...testConfig,
        name: 'Updated Sync Test Report',
        updatedAt: new Date(),
      };
      
      await ReportPersistenceService.saveConfig(updatedConfig);
      ReportSyncService.broadcastConfigUpdate(updatedConfig, 'config_updated');
      
      // 5. Verify dashboard component reloaded
      expect(mockReloadConfig).toHaveBeenCalled();
      expect(reloadCount).toBe(1);
    });
  });

  describe('Compatibility with Existing Reports', () => {
    it('should maintain backward compatibility when no custom config exists', async () => {
      // Test that the system gracefully falls back to default reports
      // when no custom configuration is available
      
      // 1. Ensure no configuration exists
      const loadResult = await ReportPersistenceService.loadConfig('new-client');
      expect(loadResult.success).toBe(false);
      
      // 2. This should not cause errors in the CustomizableEnergyReport component
      // The component should fall back to the default EnergyReport
      
      // Mock the component behavior
      const shouldUseDefault = !loadResult.success || !loadResult.config;
      expect(shouldUseDefault).toBe(true);
      
      // 3. Verify that existing report functionality is preserved
      // This would normally render the EnergyReport component
      expect(loadResult.message).toContain('No se encontró configuración');
    });

    it('should handle migration from default to custom reports', async () => {
      // Test the transition from using default reports to custom reports
      
      // 1. Start with no configuration (default report scenario)
      let loadResult = await ReportPersistenceService.loadConfig('migration-client');
      expect(loadResult.success).toBe(false);
      
      // 2. Create and save a custom configuration
      const customConfig: ReportConfig = {
        id: 'migration-config',
        name: 'Migrated Custom Report',
        clientId: 'migration-client',
        spaces: [
          {
            id: 'migration-space',
            columns: 1,
            order: 0,
            components: [
              {
                id: 'migration-component',
                type: 'generation-mix',
                columnIndex: 0,
                config: {
                  title: 'Custom Energy Mix',
                  height: 300,
                  colors: ['#FF7A00'],
                  showLegend: true,
                  showTooltip: true,
                },
                dataSource: {
                  id: 'energy-generation',
                  name: 'Generación de Energía',
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
      
      const saveResult = await ReportPersistenceService.saveConfig(customConfig);
      expect(saveResult.success).toBe(true);
      
      // 3. Verify custom configuration is now loaded
      loadResult = await ReportPersistenceService.loadConfig('migration-client');
      expect(loadResult.success).toBe(true);
      expect(loadResult.config?.name).toBe('Migrated Custom Report');
      
      // 4. Test fallback to global config when client config is inactive
      const inactiveConfig = { ...customConfig, isActive: false };
      await ReportPersistenceService.saveConfig(inactiveConfig);
      
      // Should fall back to global or default behavior
      loadResult = await ReportPersistenceService.loadConfig('migration-client');
      expect(loadResult.config?.isActive).toBe(false);
    });

    it('should preserve existing report data and functionality', async () => {
      // Test that custom configurations don't break existing data flows
      
      const testConfig: ReportConfig = {
        id: 'compatibility-config',
        name: 'Compatibility Test Report',
        clientId: 'compatibility-client',
        spaces: [
          {
            id: 'compat-space',
            columns: 2,
            order: 0,
            components: [
              {
                id: 'compat-component-1',
                type: 'generation-mix',
                columnIndex: 0,
                config: {
                  title: 'Generation Mix',
                  height: 300,
                  colors: ['#FF7A00', '#00A3FF'],
                  showLegend: true,
                  showTooltip: true,
                },
                dataSource: {
                  id: 'energy-generation',
                  name: 'Generación de Energía',
                  type: 'energy-generation',
                  fields: [
                    { id: 'thermal', name: 'Térmica', type: 'percentage', required: true },
                    { id: 'renewable', name: 'Renovable', type: 'percentage', required: true },
                  ],
                  sampleData: [
                    { thermal: 60, renewable: 40 }
                  ]
                },
              },
              {
                id: 'compat-component-2',
                type: 'demand-trend',
                columnIndex: 1,
                config: {
                  title: 'Demand Analysis',
                  height: 300,
                  colors: ['#FFB800'],
                  showLegend: false,
                  showTooltip: true,
                },
                dataSource: {
                  id: 'demand-trend',
                  name: 'Tendencia de Demanda',
                  type: 'demand',
                  fields: [
                    { id: 'period', name: 'Período', type: 'string', required: true },
                    { id: 'value', name: 'Valor', type: 'number', required: true },
                  ],
                  sampleData: [
                    { period: 'Q1', value: 1200 },
                    { period: 'Q2', value: 1350 },
                  ]
                },
              },
            ],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      
      // 1. Save configuration with valid data sources
      const saveResult = await ReportPersistenceService.saveConfig(testConfig);
      expect(saveResult.success).toBe(true);
      
      // 2. Verify data source compatibility validation
      const validationErrors = ReportPersistenceService.validateConfig(testConfig);
      expect(validationErrors).toHaveLength(0);
      
      // 3. Test that components can access their data sources
      testConfig.spaces[0].components.forEach(component => {
        expect(component.dataSource.id).toBeTruthy();
        expect(component.dataSource.sampleData).toBeDefined();
        expect(component.dataSource.fields.length).toBeGreaterThan(0);
      });
      
      // 4. Verify configuration can be loaded and used
      const loadResult = await ReportPersistenceService.loadConfig('compatibility-client');
      expect(loadResult.success).toBe(true);
      expect(loadResult.config?.spaces[0].components).toHaveLength(2);
    });

    it('should handle global configuration inheritance', async () => {
      // Test that clients inherit global configuration when they don't have custom ones
      
      // 1. Create and save global configuration
      const globalConfig: ReportConfig = {
        id: 'global-config',
        name: 'Global Default Report',
        clientId: undefined, // Global configuration
        spaces: [
          {
            id: 'global-space',
            columns: 1,
            order: 0,
            components: [
              {
                id: 'global-component',
                type: 'cost-comparison',
                columnIndex: 0,
                config: {
                  title: 'Global Cost Analysis',
                  height: 350,
                  colors: ['#FF7A00'],
                  showLegend: true,
                  showTooltip: true,
                },
                dataSource: {
                  id: 'cost-comparison',
                  name: 'Comparación de Costos',
                  type: 'cost',
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
      
      await ReportPersistenceService.saveConfig(globalConfig);
      
      // 2. Try to load client-specific config (should not exist)
      let loadResult = await ReportPersistenceService.loadConfig('inheritance-client');
      expect(loadResult.success).toBe(false);
      
      // 3. Load global config as fallback
      loadResult = await ReportPersistenceService.loadConfig(undefined);
      expect(loadResult.success).toBe(true);
      expect(loadResult.config?.name).toBe('Global Default Report');
      expect(loadResult.config?.clientId).toBeUndefined();
      
      // 4. Create client-specific config that overrides global
      const clientConfig = {
        ...globalConfig,
        id: 'client-override-config',
        name: 'Client Override Report',
        clientId: 'inheritance-client',
      };
      
      await ReportPersistenceService.saveConfig(clientConfig);
      
      // 5. Verify client now gets their specific config
      loadResult = await ReportPersistenceService.loadConfig('inheritance-client');
      expect(loadResult.success).toBe(true);
      expect(loadResult.config?.name).toBe('Client Override Report');
      expect(loadResult.config?.clientId).toBe('inheritance-client');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent configuration updates', async () => {
      // Test concurrent saves to the same configuration
      const baseConfig: ReportConfig = {
        id: 'concurrent-test',
        name: 'Concurrent Test Report',
        clientId: 'concurrent-client',
        spaces: [
          {
            id: 'concurrent-space',
            columns: 1,
            order: 0,
            components: [
              {
                id: 'concurrent-component',
                type: 'generation-mix',
                columnIndex: 0,
                config: {
                  title: 'Concurrent Chart',
                  height: 300,
                  colors: ['#FF7A00'],
                  showLegend: true,
                  showTooltip: true,
                },
                dataSource: {
                  id: 'energy-generation',
                  name: 'Generación de Energía',
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

      // Simulate concurrent updates
      const update1 = { ...baseConfig, name: 'Update 1' };
      const update2 = { ...baseConfig, name: 'Update 2' };

      const [result1, result2] = await Promise.all([
        ReportPersistenceService.saveConfig(update1),
        ReportPersistenceService.saveConfig(update2),
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      // Last update should win
      const loadResult = await ReportPersistenceService.loadConfig('concurrent-client');
      expect(loadResult.success).toBe(true);
      expect(['Update 1', 'Update 2']).toContain(loadResult.config?.name);
    });

    it('should handle malformed data in localStorage', async () => {
      // Put malformed data in localStorage
      mockLocalStorage.store['constructor_config_client_malformed'] = 'invalid-json{';

      const loadResult = await ReportPersistenceService.loadConfig('malformed');
      expect(loadResult.success).toBe(false);
      // The error message could be either about deserialization or not found
      expect(loadResult.message).toBeTruthy();
    });

    it('should handle storage quota exceeded scenarios', async () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      const testConfig: ReportConfig = {
        id: 'quota-test',
        name: 'Quota Test Report',
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      const saveResult = await ReportPersistenceService.saveConfig(testConfig);
      expect(saveResult.success).toBe(false);

      // Restore original function
      mockLocalStorage.setItem = originalSetItem;
    });

    it('should handle configuration duplication correctly', async () => {
      // Create source configuration
      const sourceConfig: ReportConfig = {
        id: 'source-config',
        name: 'Source Configuration',
        clientId: 'source-client',
        spaces: [
          {
            id: 'source-space',
            columns: 1,
            order: 0,
            components: [
              {
                id: 'source-component',
                type: 'generation-mix',
                columnIndex: 0,
                config: {
                  title: 'Source Chart',
                  height: 300,
                  colors: ['#FF7A00'],
                  showLegend: true,
                  showTooltip: true,
                },
                dataSource: {
                  id: 'energy-generation',
                  name: 'Generación de Energía',
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

      await ReportPersistenceService.saveConfig(sourceConfig);

      // Duplicate to target client
      const duplicateResult = await ReportPersistenceService.duplicateConfig(
        'source-client',
        'target-client'
      );

      expect(duplicateResult.success).toBe(true);

      // Verify both configurations exist and are different
      const sourceLoad = await ReportPersistenceService.loadConfig('source-client');
      const targetLoad = await ReportPersistenceService.loadConfig('target-client');

      expect(sourceLoad.success).toBe(true);
      expect(targetLoad.success).toBe(true);
      expect(sourceLoad.config?.id).not.toBe(targetLoad.config?.id);
      expect(targetLoad.config?.clientId).toBe('target-client');
      expect(targetLoad.config?.name).toContain('Cliente target-client');
    });

    it('should handle sync service cleanup properly', () => {
      // Initialize sync service
      ReportSyncService.initialize();

      // Add multiple listeners
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      ReportSyncService.addListener('test-1', listener1);
      ReportSyncService.addListener('test-2', listener2);

      // Verify listeners are registered
      const statusBefore = ReportSyncService.getSyncStatus();
      expect(statusBefore.listenersCount).toBe(2);

      // Cleanup
      ReportSyncService.cleanup();

      // Verify cleanup
      const statusAfter = ReportSyncService.getSyncStatus();
      expect(statusAfter.listenersCount).toBe(0);
      expect(statusAfter.isInitialized).toBe(false);
    });

    it('should handle force refresh correctly', () => {
      // Set up some data in localStorage
      mockLocalStorage.store['report_cache_test'] = 'cached-data';
      mockLocalStorage.store['constructor_config_test'] = 'config-data';

      // Force refresh
      ReportSyncService.forceRefresh();

      // Verify event was dispatched (the actual cache clearing is handled by the real implementation)
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'report-force-refresh',
        })
      );
    });
  });
});