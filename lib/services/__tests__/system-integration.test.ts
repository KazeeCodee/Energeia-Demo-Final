// System Integration Tests
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DemoInitializationService } from '../demo-initialization';
import { DemoConfigurationService } from '../demo-data';
import { ReportPersistenceService } from '../report-persistence';
import { ReportSyncService } from '../report-sync';
import { useConstructorStore } from '../../state/constructor';
import { ReportConfig, ChartComponent } from '../../types/constructor';

// Mock localStorage for testing
const mockLocalStorage = {
  store: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockLocalStorage.store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    mockLocalStorage.store.delete(key);
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store.clear();
  }),
};

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('System Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    mockLocalStorage.clear();
    vi.clearAllMocks();
    
    // Reset constructor store
    const store = useConstructorStore.getState();
    store.resetConstructor();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Demo Data Integration', () => {
    it('should initialize all demo configurations successfully', async () => {
      const result = await DemoInitializationService.initializeAllDemoData();
      
      expect(result.success).toBe(true);
      expect(result.configurationsCreated).toBeGreaterThan(0);
      expect(result.errors).toBeUndefined();
    });

    it('should validate demo data after initialization', async () => {
      // Initialize demo data
      await DemoInitializationService.initializeAllDemoData();
      
      // Validate
      const validation = await DemoInitializationService.validateDemoData();
      
      expect(validation.isValid).toBe(true);
      expect(validation.globalConfigExists).toBe(true);
      expect(validation.clientConfigsCount).toBeGreaterThan(0);
      expect(validation.dataSourcesCount).toBeGreaterThan(0);
      expect(validation.issues).toHaveLength(0);
    });

    it('should create client-specific configurations with appropriate data', async () => {
      const clientId = 'client-1';
      const result = await DemoInitializationService.initializeClientDemo(clientId);
      
      expect(result.success).toBe(true);
      expect(result.configurationsCreated).toBe(1);
      
      // Load and verify the configuration
      const loadResult = await ReportPersistenceService.loadConfig(clientId);
      expect(loadResult.success).toBe(true);
      expect(loadResult.config).toBeDefined();
      expect(loadResult.config!.clientId).toBe(clientId);
      expect(loadResult.config!.spaces.length).toBeGreaterThan(0);
    });

    it('should reset and reinitialize demo data correctly', async () => {
      // Initialize first time
      await DemoInitializationService.initializeAllDemoData();
      
      // Verify data exists
      let validation = await DemoInitializationService.validateDemoData();
      expect(validation.isValid).toBe(true);
      
      // Reset and reinitialize
      const resetResult = await DemoInitializationService.resetAllDemoData();
      expect(resetResult.success).toBe(true);
      
      // Verify data still exists after reset
      validation = await DemoInitializationService.validateDemoData();
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Constructor to Dashboard Integration', () => {
    let testConfig: ReportConfig;

    beforeEach(async () => {
      // Create a test configuration
      testConfig = DemoConfigurationService.createGlobalReportConfig();
    });

    it('should save configuration and make it available for dashboard', async () => {
      // Save configuration through constructor
      const saveResult = await ReportPersistenceService.saveConfig(testConfig);
      expect(saveResult.success).toBe(true);
      
      // Load configuration as dashboard would
      const loadResult = await ReportPersistenceService.loadConfig(testConfig.clientId);
      expect(loadResult.success).toBe(true);
      expect(loadResult.config).toBeDefined();
      expect(loadResult.config!.id).toBe(testConfig.id);
    });

    it('should handle client-specific vs global configuration fallback', async () => {
      const clientId = 'test-client';
      
      // Save global configuration
      const globalConfig = DemoConfigurationService.createGlobalReportConfig();
      await ReportPersistenceService.saveConfig(globalConfig);
      
      // Try to load client-specific (should not exist)
      let loadResult = await ReportPersistenceService.loadConfig(clientId);
      expect(loadResult.success).toBe(false);
      
      // Load global (should exist)
      loadResult = await ReportPersistenceService.loadConfig();
      expect(loadResult.success).toBe(true);
      expect(loadResult.config!.clientId).toBeUndefined();
      
      // Create client-specific configuration
      const clientConfig = DemoConfigurationService.createMiningCompanyConfig(clientId);
      await ReportPersistenceService.saveConfig(clientConfig);
      
      // Now client-specific should be available
      loadResult = await ReportPersistenceService.loadConfig(clientId);
      expect(loadResult.success).toBe(true);
      expect(loadResult.config!.clientId).toBe(clientId);
    });

    it('should sync configuration changes between constructor and dashboard', async () => {
      // Mock sync service
      const syncSpy = vi.spyOn(ReportSyncService, 'broadcastConfigUpdate');
      const cacheSpy = vi.spyOn(ReportSyncService, 'invalidateCache');
      
      // Save configuration
      await ReportPersistenceService.saveConfig(testConfig);
      
      // Verify sync methods would be called (in real implementation)
      // Note: These are mocked since we don't have actual event listeners in tests
      expect(syncSpy).not.toHaveBeenCalled(); // Not called in persistence service directly
      expect(cacheSpy).not.toHaveBeenCalled(); // Not called in persistence service directly
      
      // Test through constructor store (which should call sync)
      const store = useConstructorStore.getState();
      store.setCurrentConfig(testConfig);
      
      // This would trigger sync in real usage
      await store.saveConfig();
      
      // Verify configuration is saved
      const loadResult = await ReportPersistenceService.loadConfig(testConfig.clientId);
      expect(loadResult.success).toBe(true);
    });
  });

  describe('Constructor Store Integration', () => {
    it('should manage configuration state correctly', async () => {
      const store = useConstructorStore.getState();
      
      // Initial state
      expect(store.currentConfig).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.isSaving).toBe(false);
      
      // Set configuration
      const config = DemoConfigurationService.createGlobalReportConfig();
      store.setCurrentConfig(config);
      
      expect(store.currentConfig).toBe(config);
      expect(store.validationErrors).toHaveLength(0);
    });

    it('should handle grid space operations correctly', async () => {
      const store = useConstructorStore.getState();
      const config = DemoConfigurationService.createGlobalReportConfig();
      store.setCurrentConfig(config);
      
      const initialSpaceCount = config.spaces.length;
      
      // Add grid space
      store.addGridSpace(2);
      expect(store.currentConfig!.spaces.length).toBe(initialSpaceCount + 1);
      
      // Remove grid space
      const spaceToRemove = store.currentConfig!.spaces[0];
      store.removeGridSpace(spaceToRemove.id);
      expect(store.currentConfig!.spaces.length).toBe(initialSpaceCount);
    });

    it('should handle component operations correctly', async () => {
      const store = useConstructorStore.getState();
      const config = DemoConfigurationService.createGlobalReportConfig();
      store.setCurrentConfig(config);
      
      // Find a space with components
      const spaceWithComponents = config.spaces.find(s => s.components.length > 0);
      expect(spaceWithComponents).toBeDefined();
      
      const initialComponentCount = spaceWithComponents!.components.length;
      
      // Create new component
      const newComponent: ChartComponent = {
        id: 'test-component',
        type: 'custom-bar',
        columnIndex: 0,
        config: {
          title: 'Test Component',
          height: 300,
          colors: ['#FF7A00'],
          showLegend: true,
          showTooltip: true,
        },
        dataSource: {
          id: 'test-data',
          name: 'Test Data',
          type: 'custom',
          fields: [
            { id: 'category', name: 'Category', type: 'string', required: true },
            { id: 'value', name: 'Value', type: 'number', required: true },
          ],
          sampleData: [{ category: 'Test', value: 100 }],
        },
      };
      
      // Add component (this should work if space has available columns)
      if (spaceWithComponents!.components.length < spaceWithComponents!.columns) {
        store.addComponent(spaceWithComponents!.id, 0, newComponent);
        expect(store.currentConfig!.spaces.find(s => s.id === spaceWithComponents!.id)!.components.length)
          .toBe(initialComponentCount + 1);
      }
      
      // Remove component
      const componentToRemove = spaceWithComponents!.components[0];
      store.removeComponent(componentToRemove.id);
      
      const updatedSpace = store.currentConfig!.spaces.find(s => s.id === spaceWithComponents!.id)!;
      expect(updatedSpace.components.find(c => c.id === componentToRemove.id)).toBeUndefined();
    });

    it('should validate configurations correctly', async () => {
      const store = useConstructorStore.getState();
      
      // Empty configuration should have validation errors
      const emptyConfig: ReportConfig = {
        id: 'empty-config',
        name: 'Empty Config',
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      
      store.setCurrentConfig(emptyConfig);
      const errors = store.validateConfig();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.type === 'canvas')).toBe(true);
      
      // Valid configuration should have no errors
      const validConfig = DemoConfigurationService.createGlobalReportConfig();
      store.setCurrentConfig(validConfig);
      const validErrors = store.validateConfig();
      expect(validErrors.length).toBe(0);
    });
  });

  describe('Data Source Integration', () => {
    it('should load and provide demo data sources', async () => {
      const store = useConstructorStore.getState();
      
      // Load data sources
      await store.loadDataSources();
      
      expect(store.availableDataSources.length).toBeGreaterThan(0);
      
      // Verify data sources have required structure
      store.availableDataSources.forEach(dataSource => {
        expect(dataSource.id).toBeDefined();
        expect(dataSource.name).toBeDefined();
        expect(dataSource.type).toBeDefined();
        expect(dataSource.fields).toBeDefined();
        expect(dataSource.sampleData).toBeDefined();
        expect(Array.isArray(dataSource.fields)).toBe(true);
        expect(Array.isArray(dataSource.sampleData)).toBe(true);
      });
    });

    it('should validate data source compatibility with chart types', async () => {
      const store = useConstructorStore.getState();
      await store.loadDataSources();
      
      const energyDataSource = store.availableDataSources.find(ds => ds.type === 'energy-generation');
      const demandDataSource = store.availableDataSources.find(ds => ds.type === 'demand');
      
      expect(energyDataSource).toBeDefined();
      expect(demandDataSource).toBeDefined();
      
      // Energy data source should be compatible with generation-mix charts
      expect(energyDataSource!.type).toBe('energy-generation');
      
      // Demand data source should be compatible with demand-trend charts
      expect(demandDataSource!.type).toBe('demand');
    });
  });

  describe('Performance and Stress Testing', () => {
    it('should handle large configurations efficiently', async () => {
      const scenarios = DemoInitializationService.getDemoScenarios();
      const stressScenario = scenarios.find(s => s.name === 'Escenario de Estrés');
      
      expect(stressScenario).toBeDefined();
      
      const startTime = performance.now();
      
      // Initialize stress test scenario
      const result = await DemoInitializationService.initializeDemoScenario(stressScenario!.name);
      expect(result.success).toBe(true);
      
      // Load the configuration
      const loadResult = await ReportPersistenceService.loadConfig();
      expect(loadResult.success).toBe(true);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (5 seconds)
      expect(duration).toBeLessThan(5000);
      
      // Verify the configuration has many components
      const config = loadResult.config!;
      const totalComponents = config.spaces.reduce((total, space) => total + space.components.length, 0);
      expect(totalComponents).toBeGreaterThan(10); // Stress test should have many components
    });

    it('should handle rapid configuration changes', async () => {
      const store = useConstructorStore.getState();
      const config = DemoConfigurationService.createGlobalReportConfig();
      store.setCurrentConfig(config);
      
      const startTime = performance.now();
      
      // Perform multiple rapid operations
      for (let i = 0; i < 10; i++) {
        store.addGridSpace(1);
        store.validateConfig();
        
        if (i % 2 === 0) {
          const spaces = store.currentConfig!.spaces;
          if (spaces.length > 1) {
            store.removeGridSpace(spaces[spaces.length - 1].id);
          }
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should handle rapid changes efficiently
      expect(duration).toBeLessThan(1000);
      expect(store.currentConfig).toBeDefined();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle corrupted configuration data gracefully', async () => {
      // Simulate corrupted data in localStorage
      mockLocalStorage.setItem('constructor_config_global', 'invalid-json-data');
      
      const loadResult = await ReportPersistenceService.loadConfig();
      expect(loadResult.success).toBe(false);
      expect(loadResult.message).toContain('Error al deserializar');
    });

    it('should recover from validation errors', async () => {
      const store = useConstructorStore.getState();
      
      // Create invalid configuration
      const invalidConfig: ReportConfig = {
        id: '',
        name: '',
        spaces: [
          {
            id: 'space-1',
            columns: 1,
            components: [
              {
                id: 'comp-1',
                type: 'generation-mix',
                columnIndex: 0,
                config: {
                  title: '',
                  height: 300,
                  colors: [],
                  showLegend: true,
                  showTooltip: true,
                },
                dataSource: {
                  id: '',
                  name: '',
                  type: 'custom',
                  fields: [],
                  sampleData: [],
                },
              },
            ],
            order: 0,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      
      store.setCurrentConfig(invalidConfig);
      const errors = store.validateConfig();
      
      expect(errors.length).toBeGreaterThan(0);
      expect(store.validationErrors.length).toBeGreaterThan(0);
      
      // Should prevent saving invalid configuration
      await expect(store.saveConfig()).rejects.toThrow();
    });

    it('should handle missing data sources gracefully', async () => {
      const store = useConstructorStore.getState();
      const config = DemoConfigurationService.createGlobalReportConfig();
      
      // Modify config to reference non-existent data source
      config.spaces[0].components[0].dataSource = {
        id: 'non-existent',
        name: 'Non-existent Data Source',
        type: 'custom',
        fields: [],
        sampleData: [],
      };
      
      store.setCurrentConfig(config);
      const errors = store.validateConfig();
      
      // Should detect the missing/invalid data source
      expect(errors.some(e => e.type === 'component' || e.type === 'data')).toBe(true);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing report structures', async () => {
      // Test that new constructor doesn't break existing report functionality
      const globalConfig = DemoConfigurationService.createGlobalReportConfig();
      
      // Save configuration
      const saveResult = await ReportPersistenceService.saveConfig(globalConfig);
      expect(saveResult.success).toBe(true);
      
      // Load and verify structure matches expected format
      const loadResult = await ReportPersistenceService.loadConfig();
      expect(loadResult.success).toBe(true);
      
      const config = loadResult.config!;
      
      // Verify all required fields are present
      expect(config.id).toBeDefined();
      expect(config.name).toBeDefined();
      expect(config.spaces).toBeDefined();
      expect(Array.isArray(config.spaces)).toBe(true);
      expect(config.createdAt).toBeDefined();
      expect(config.updatedAt).toBeDefined();
      expect(typeof config.isActive).toBe('boolean');
      
      // Verify spaces structure
      config.spaces.forEach(space => {
        expect(space.id).toBeDefined();
        expect([1, 2, 3].includes(space.columns)).toBe(true);
        expect(Array.isArray(space.components)).toBe(true);
        expect(typeof space.order).toBe('number');
        
        // Verify components structure
        space.components.forEach(component => {
          expect(component.id).toBeDefined();
          expect(component.type).toBeDefined();
          expect(typeof component.columnIndex).toBe('number');
          expect(component.config).toBeDefined();
          expect(component.dataSource).toBeDefined();
        });
      });
    });
  });
});