import { create } from 'zustand';
import { ReportConfig, GridSpace, ChartComponent, ValidationError, DataSource } from '../types/constructor';
import { ReportValidationService } from '../services/validation';
import { constructorLogger, measurePerformance } from '../services/logging';
import { defaultDataSources } from '../data/default-data-sources';



interface ConstructorState {
  // Current state
  currentConfig: ReportConfig | null;
  selectedClientId?: string;
  availableDataSources: DataSource[];
  
  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  validationErrors: ValidationError[];
  
  // Auto-save state
  autoSaveEnabled: boolean;
  autoSaveInterval?: NodeJS.Timeout;
  
  // Actions
  setCurrentConfig: (config: ReportConfig) => void;
  setSelectedClient: (clientId?: string) => void;
  updateConfig: (updates: Partial<ReportConfig>) => void;
  
  // Grid management
  addGridSpace: (columns: 1 | 2 | 3) => void;
  removeGridSpace: (spaceId: string) => void;
  reorderGridSpaces: (spaceIds: string[]) => void;
  
  // Component management
  addComponent: (spaceId: string, columnIndex: number, component: ChartComponent) => void;
  removeComponent: (componentId: string) => void;
  updateComponent: (componentId: string, updates: Partial<ChartComponent>) => void;
  
  // Validation
  validateConfig: () => ValidationError[];
  clearValidationErrors: () => void;
  
  // Persistence
  saveConfig: () => Promise<void>;
  loadConfig: (configId: string) => Promise<void>;
  loadClientConfig: (clientId?: string) => Promise<void>;
  createNewConfig: (clientId?: string) => void;
  
  // Auto-save
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  triggerAutoSave: () => void;
  
  // Data sources
  loadDataSources: () => Promise<void>;
  
  // Client management
  getAvailableClients: () => Promise<Array<{ id: string; name: string; hasCustomConfig: boolean }>>;
  
  // Cleanup
  resetConstructor: () => void;
  clearError: () => void;
}

// Helper function to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper function to create empty config
const createEmptyConfig = (clientId?: string): ReportConfig => ({
  id: generateId(),
  name: clientId ? `Informe personalizado - Cliente ${clientId}` : 'Informe global',
  clientId,
  spaces: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
});

export const useConstructorStore = create<ConstructorState>((set, get) => ({
  // Initial state
  currentConfig: null,
  selectedClientId: undefined,
  availableDataSources: defaultDataSources,
  isLoading: false,
  isSaving: false,
  error: null,
  validationErrors: [],
  autoSaveEnabled: false,
  autoSaveInterval: undefined,

  setCurrentConfig: (config: ReportConfig) => {
    set({ currentConfig: config, validationErrors: [] });
  },

  setSelectedClient: (clientId?: string) => {
    set({ selectedClientId: clientId });
  },

  updateConfig: (updates: Partial<ReportConfig>) => {
    const { currentConfig } = get();
    if (!currentConfig) return;

    const updatedConfig = {
      ...currentConfig,
      ...updates,
      updatedAt: new Date(),
    };

    set({ currentConfig: updatedConfig });
  },

  addGridSpace: (columns: 1 | 2 | 3) => {
    const { currentConfig } = get();
    if (!currentConfig) return;

    const newSpace: GridSpace = {
      id: generateId(),
      columns,
      components: [],
      order: currentConfig.spaces.length,
    };

    const updatedConfig = {
      ...currentConfig,
      spaces: [...currentConfig.spaces, newSpace],
      updatedAt: new Date(),
    };

    set({ currentConfig: updatedConfig });
  },

  removeGridSpace: (spaceId: string) => {
    const { currentConfig } = get();
    if (!currentConfig) return;

    const updatedSpaces = currentConfig.spaces
      .filter(space => space.id !== spaceId)
      .map((space, index) => ({ ...space, order: index }));

    const updatedConfig = {
      ...currentConfig,
      spaces: updatedSpaces,
      updatedAt: new Date(),
    };

    set({ currentConfig: updatedConfig });
  },

  reorderGridSpaces: (spaceIds: string[]) => {
    const { currentConfig } = get();
    if (!currentConfig) return;

    const spaceMap = new Map(currentConfig.spaces.map(space => [space.id, space]));
    const reorderedSpaces = spaceIds
      .map(id => spaceMap.get(id))
      .filter(Boolean)
      .map((space, index) => ({ ...space!, order: index }));

    const updatedConfig = {
      ...currentConfig,
      spaces: reorderedSpaces,
      updatedAt: new Date(),
    };

    set({ currentConfig: updatedConfig });
  },

  addComponent: (spaceId: string, columnIndex: number, component: ChartComponent) => {
    const { currentConfig, availableDataSources } = get();
    if (!currentConfig) return;

    const space = currentConfig.spaces.find(s => s.id === spaceId);
    if (!space) {
      constructorLogger.error('component', 'Space not found for component addition', { spaceId, componentId: component.id });
      throw new Error(`Espacio no encontrado: ${spaceId}`);
    }

    // Validate component can be added
    const validation = ReportValidationService.canAddComponent(space, columnIndex, component, availableDataSources);
    if (!validation.canAdd) {
      const errorMessages = validation.errors.map(e => e.message).join(', ');
      constructorLogger.error('component', 'Component validation failed', { 
        spaceId, 
        componentId: component.id, 
        errors: validation.errors 
      });
      throw new Error(`No se puede añadir el componente: ${errorMessages}`);
    }

    const updatedSpaces = currentConfig.spaces.map(s => {
      if (s.id === spaceId) {
        return {
          ...s,
          components: [...s.components, { ...component, columnIndex }],
        };
      }
      return s;
    });

    const updatedConfig = {
      ...currentConfig,
      spaces: updatedSpaces,
      updatedAt: new Date(),
    };

    constructorLogger.logComponentAction('added', component.id, spaceId, { 
      componentType: component.type, 
      columnIndex 
    });

    set({ currentConfig: updatedConfig });
  },

  removeComponent: (componentId: string) => {
    const { currentConfig } = get();
    if (!currentConfig) return;

    const updatedSpaces = currentConfig.spaces.map(space => ({
      ...space,
      components: space.components.filter(comp => comp.id !== componentId),
    }));

    const updatedConfig = {
      ...currentConfig,
      spaces: updatedSpaces,
      updatedAt: new Date(),
    };

    set({ currentConfig: updatedConfig });
  },

  updateComponent: (componentId: string, updates: Partial<ChartComponent>) => {
    const { currentConfig } = get();
    if (!currentConfig) return;

    const updatedSpaces = currentConfig.spaces.map(space => ({
      ...space,
      components: space.components.map(comp =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      ),
    }));

    const updatedConfig = {
      ...currentConfig,
      spaces: updatedSpaces,
      updatedAt: new Date(),
    };

    set({ currentConfig: updatedConfig });
  },

  validateConfig: () => {
    const { currentConfig, availableDataSources } = get();
    if (!currentConfig) return [];

    try {
      const result = ReportValidationService.validateConfig(currentConfig, availableDataSources);
      
      constructorLogger.logValidation(result.isValid, result.errors, currentConfig);
      
      set({ validationErrors: result.errors });
      return result.errors;
    } catch (error) {
      console.error('Error during validation:', error);
      const errorResult = [{
        type: 'canvas' as const,
        message: 'Error durante la validación',
      }];
      set({ validationErrors: errorResult });
      return errorResult;
    }
  },

  clearValidationErrors: () => {
    set({ validationErrors: [] });
  },

  saveConfig: async () => {
    const { currentConfig, validateConfig } = get();
    if (!currentConfig) return;

    set({ isSaving: true, error: null });

    try {
      // Validate before saving
      const errors = await measurePerformance('pre-save-validation', () => validateConfig());
      if (errors.length > 0) {
        const errorMessage = 'La configuración tiene errores que deben corregirse antes de guardar';
        constructorLogger.error('persistence', errorMessage, { errors: errors.slice(0, 3) });
        throw new Error(errorMessage);
      }

      // Use the persistence service
      const { ReportPersistenceService } = await import('../services/report-persistence');
      const result = await measurePerformance('config-save', () => 
        ReportPersistenceService.saveConfig(currentConfig)
      );

      if (!result.success) {
        constructorLogger.logConfigSave(currentConfig.id, false, result.message);
        throw new Error(result.message);
      }

      // Broadcast sync notification
      const { ReportSyncService } = await import('../services/report-sync');
      ReportSyncService.broadcastConfigUpdate(currentConfig, 'config_updated');
      ReportSyncService.invalidateCache(currentConfig.clientId);

      constructorLogger.logConfigSave(currentConfig.id, true);
      set({ isSaving: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar configuración';
      constructorLogger.logConfigSave(currentConfig?.id || 'unknown', false, error);
      set({ 
        isSaving: false, 
        error: errorMessage
      });
      throw error;
    }
  },

  loadConfig: async (configId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Use the persistence service
      const { ReportPersistenceService } = await import('../services/report-persistence');
      const result = await ReportPersistenceService.loadConfig(configId);

      if (!result.success || !result.config) {
        throw new Error(result.message || 'No se pudo cargar la configuración');
      }

      set({ currentConfig: result.config, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Error al cargar configuración' 
      });
      throw error;
    }
  },

  loadClientConfig: async (clientId?: string) => {
    set({ isLoading: true, error: null });

    try {
      // Use the persistence service
      const { ReportPersistenceService } = await import('../services/report-persistence');
      const result = await ReportPersistenceService.loadConfig(clientId);

      if (result.success && result.config) {
        set({ 
          currentConfig: result.config, 
          selectedClientId: clientId,
          isLoading: false 
        });
      } else {
        // Create new config if none exists
        const newConfig = createEmptyConfig(clientId);
        set({ 
          currentConfig: newConfig, 
          selectedClientId: clientId,
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Error al cargar configuración del cliente' 
      });
      throw error;
    }
  },

  createNewConfig: (clientId?: string) => {
    const newConfig = createEmptyConfig(clientId);
    set({ 
      currentConfig: newConfig, 
      selectedClientId: clientId,
      validationErrors: [],
      error: null 
    });
  },

  loadDataSources: async () => {
    // For now, we use the default data sources
    // In a real implementation, this would fetch from an API
    set({ availableDataSources: defaultDataSources });
  },

  getAvailableClients: async () => {
    // Mock client data - in a real app this would come from an API
    const mockClients = [
      { id: 'client-1', name: 'Empresa Energética Norte' },
      { id: 'client-2', name: 'Industrias del Sur S.A.' },
      { id: 'client-3', name: 'Cooperativa Eléctrica Centro' },
      { id: 'client-4', name: 'Minera Los Andes' },
      { id: 'client-5', name: 'Textil Argentina' },
    ];

    // Check which clients have custom configurations
    const { ReportPersistenceService } = await import('../services/report-persistence');
    
    const clientsWithStatus = await Promise.all(
      mockClients.map(async (client) => {
        try {
          const result = await ReportPersistenceService.loadConfig(client.id);
          return {
            ...client,
            hasCustomConfig: result.success && result.config !== null,
          };
        } catch (_error) {
          return {
            ...client,
            hasCustomConfig: false,
          };
        }
      })
    );

    return clientsWithStatus;
  },

  resetConstructor: () => {
    const { disableAutoSave } = get();
    
    // Clean up auto-save
    disableAutoSave();
    
    set({
      currentConfig: null,
      selectedClientId: undefined,
      isLoading: false,
      isSaving: false,
      error: null,
      validationErrors: [],
      autoSaveEnabled: false,
      autoSaveInterval: undefined,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  enableAutoSave: () => {
    const { autoSaveInterval, disableAutoSave } = get();
    
    // Clear existing interval if any
    if (autoSaveInterval) {
      disableAutoSave();
    }

    // Set up auto-save every 30 seconds
    const interval = setInterval(() => {
      const { currentConfig, triggerAutoSave } = get();
      if (currentConfig) {
        triggerAutoSave();
      }
    }, 30000); // 30 seconds

    set({ 
      autoSaveEnabled: true, 
      autoSaveInterval: interval 
    });
  },

  disableAutoSave: () => {
    const { autoSaveInterval } = get();
    
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
    }

    set({ 
      autoSaveEnabled: false, 
      autoSaveInterval: undefined 
    });
  },

  triggerAutoSave: async () => {
    const { currentConfig } = get();
    if (!currentConfig) return;

    try {
      const { ReportPersistenceService } = await import('../services/report-persistence');
      await measurePerformance('auto-save', () => 
        ReportPersistenceService.autoSaveConfig(currentConfig)
      );
      constructorLogger.logAutoSave(true, currentConfig.id);
    } catch (error) {
      constructorLogger.logAutoSave(false, currentConfig.id, error);
      console.warn('Error en auto-guardado:', error);
    }
  },
}));

// Helper hooks for specific constructor states
export const useCurrentConfig = () => useConstructorStore(state => state.currentConfig);
export const useSelectedClient = () => useConstructorStore(state => state.selectedClientId);
export const useConstructorLoading = () => useConstructorStore(state => state.isLoading);
export const useConstructorSaving = () => useConstructorStore(state => state.isSaving);
export const useConstructorError = () => useConstructorStore(state => state.error);
export const useValidationErrors = () => useConstructorStore(state => state.validationErrors);
export const useAvailableDataSources = () => useConstructorStore(state => state.availableDataSources);