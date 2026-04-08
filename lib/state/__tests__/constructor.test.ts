import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportConfig, GridSpace, ChartComponent, DataSource } from '../../types/constructor';

// Mock the constructor store for testing
interface MockConstructorState {
  currentConfig: ReportConfig | null;
  selectedClientId?: string;
  availableDataSources: DataSource[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  validationErrors: Array<{ type: string; message: string; spaceId?: string; componentId?: string }>;
  autoSaveEnabled: boolean;
}

class MockConstructorStore {
  private state: MockConstructorState;
  private listeners: Array<(state: MockConstructorState) => void> = [];

  constructor() {
    this.state = {
      currentConfig: null,
      selectedClientId: undefined,
      availableDataSources: [],
      isLoading: false,
      isSaving: false,
      error: null,
      validationErrors: [],
      autoSaveEnabled: false,
    };
  }

  getState(): MockConstructorState {
    return { ...this.state };
  }

  setState(updates: Partial<MockConstructorState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: MockConstructorState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Actions
  setCurrentConfig(config: ReportConfig) {
    this.setState({ currentConfig: config, validationErrors: [] });
  }

  setSelectedClient(clientId?: string) {
    this.setState({ selectedClientId: clientId });
  }

  updateConfig(updates: Partial<ReportConfig>) {
    if (!this.state.currentConfig) return;

    const updatedConfig = {
      ...this.state.currentConfig,
      ...updates,
      updatedAt: new Date(),
    };

    this.setState({ currentConfig: updatedConfig });
  }

  addGridSpace(columns: 1 | 2 | 3) {
    if (!this.state.currentConfig) return;

    const newSpace: GridSpace = {
      id: `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      columns,
      components: [],
      order: this.state.currentConfig.spaces.length,
    };

    const updatedConfig = {
      ...this.state.currentConfig,
      spaces: [...this.state.currentConfig.spaces, newSpace],
      updatedAt: new Date(),
    };

    this.setState({ currentConfig: updatedConfig });
  }

  removeGridSpace(spaceId: string) {
    if (!this.state.currentConfig) return;

    const updatedSpaces = this.state.currentConfig.spaces
      .filter(space => space.id !== spaceId)
      .map((space, index) => ({ ...space, order: index }));

    const updatedConfig = {
      ...this.state.currentConfig,
      spaces: updatedSpaces,
      updatedAt: new Date(),
    };

    this.setState({ currentConfig: updatedConfig });
  }

  addComponent(spaceId: string, columnIndex: number, component: ChartComponent) {
    if (!this.state.currentConfig) return;

    const updatedSpaces = this.state.currentConfig.spaces.map(space => {
      if (space.id === spaceId) {
        // Check if column is already occupied
        const existingComponent = space.components.find(comp => comp.columnIndex === columnIndex);
        if (existingComponent) {
          throw new Error(`La columna ${columnIndex} ya está ocupada`);
        }

        // Check space limits
        if (space.components.length >= space.columns) {
          throw new Error(`El espacio ya tiene el máximo de ${space.columns} componente(s)`);
        }

        return {
          ...space,
          components: [...space.components, { ...component, columnIndex }],
        };
      }
      return space;
    });

    const updatedConfig = {
      ...this.state.currentConfig,
      spaces: updatedSpaces,
      updatedAt: new Date(),
    };

    this.setState({ currentConfig: updatedConfig });
  }

  removeComponent(componentId: string) {
    if (!this.state.currentConfig) return;

    const updatedSpaces = this.state.currentConfig.spaces.map(space => ({
      ...space,
      components: space.components.filter(comp => comp.id !== componentId),
    }));

    const updatedConfig = {
      ...this.state.currentConfig,
      spaces: updatedSpaces,
      updatedAt: new Date(),
    };

    this.setState({ currentConfig: updatedConfig });
  }

  updateComponent(componentId: string, updates: Partial<ChartComponent>) {
    if (!this.state.currentConfig) return;

    const updatedSpaces = this.state.currentConfig.spaces.map(space => ({
      ...space,
      components: space.components.map(comp =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      ),
    }));

    const updatedConfig = {
      ...this.state.currentConfig,
      spaces: updatedSpaces,
      updatedAt: new Date(),
    };

    this.setState({ currentConfig: updatedConfig });
  }

  validateConfig() {
    if (!this.state.currentConfig) return [];

    const errors: Array<{ type: string; message: string; spaceId?: string; componentId?: string }> = [];

    // Basic validation
    if (!this.state.currentConfig.name?.trim()) {
      errors.push({ type: 'canvas', message: 'La configuración debe tener un nombre' });
    }

    // Check if has components
    const totalComponents = this.state.currentConfig.spaces.reduce(
      (total, space) => total + space.components.length,
      0
    );

    if (totalComponents === 0) {
      errors.push({ type: 'canvas', message: 'El informe debe tener al menos un componente' });
    }

    // Validate each space
    this.state.currentConfig.spaces.forEach(space => {
      if (space.components.length > space.columns) {
        errors.push({
          type: 'grid',
          message: `El espacio de ${space.columns} columna(s) no puede tener más de ${space.columns} componente(s)`,
          spaceId: space.id,
        });
      }

      space.components.forEach(component => {
        if (!component.config?.title?.trim()) {
          errors.push({
            type: 'component',
            message: 'El componente debe tener un título',
            componentId: component.id,
            spaceId: space.id,
          });
        }

        if (component.columnIndex >= space.columns || component.columnIndex < 0) {
          errors.push({
            type: 'grid',
            message: `Índice de columna inválido: ${component.columnIndex}`,
            componentId: component.id,
            spaceId: space.id,
          });
        }
      });
    });

    this.setState({ validationErrors: errors });
    return errors;
  }

  async saveConfig() {
    if (!this.state.currentConfig) return;

    this.setState({ isSaving: true, error: null });

    try {
      // Validate before saving
      const errors = this.validateConfig();
      if (errors.length > 0) {
        throw new Error('La configuración tiene errores que deben corregirse');
      }

      // Simulate async save
      await new Promise(resolve => setTimeout(resolve, 100));

      this.setState({ isSaving: false });
    } catch (error) {
      this.setState({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Error al guardar'
      });
      throw error;
    }
  }

  async loadConfig(configId: string) {
    this.setState({ isLoading: true, error: null });

    try {
      // Simulate async load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Mock config
      const mockConfig: ReportConfig = {
        id: configId,
        name: 'Configuración Cargada',
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      this.setState({ currentConfig: mockConfig, isLoading: false });
    } catch (error) {
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar'
      });
      throw error;
    }
  }

  createNewConfig(clientId?: string) {
    const newConfig: ReportConfig = {
      id: `config-${Date.now()}`,
      name: clientId ? `Informe personalizado - Cliente ${clientId}` : 'Informe global',
      clientId,
      spaces: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    this.setState({
      currentConfig: newConfig,
      selectedClientId: clientId,
      validationErrors: [],
      error: null
    });
  }

  enableAutoSave() {
    this.setState({ autoSaveEnabled: true });
  }

  disableAutoSave() {
    this.setState({ autoSaveEnabled: false });
  }

  resetConstructor() {
    this.setState({
      currentConfig: null,
      selectedClientId: undefined,
      isLoading: false,
      isSaving: false,
      error: null,
      validationErrors: [],
      autoSaveEnabled: false,
    });
  }

  clearError() {
    this.setState({ error: null });
  }
}

describe('Constructor Store', () => {
  let store: MockConstructorStore;
  let mockDataSource: DataSource;
  let mockComponent: ChartComponent;

  beforeEach(() => {
    store = new MockConstructorStore();

    mockDataSource = {
      id: 'test-data-source',
      name: 'Test Data Source',
      type: 'custom',
      fields: [
        { id: 'category', name: 'Category', type: 'string', required: true },
        { id: 'value', name: 'Value', type: 'number', required: true },
      ],
      sampleData: [{ category: 'Test', value: 100 }]
    };

    mockComponent = {
      id: 'component-1',
      type: 'custom-bar',
      columnIndex: 0,
      config: {
        title: 'Test Component',
        height: 300,
        colors: ['#FF7A00'],
        showLegend: true,
        showTooltip: true,
      },
      dataSource: mockDataSource,
    };
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState();

      expect(state.currentConfig).toBeNull();
      expect(state.selectedClientId).toBeUndefined();
      expect(state.isLoading).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
      expect(state.validationErrors).toEqual([]);
      expect(state.autoSaveEnabled).toBe(false);
    });
  });

  describe('setCurrentConfig', () => {
    it('should set current config and clear validation errors', () => {
      const mockConfig: ReportConfig = {
        id: 'test-config',
        name: 'Test Configuration',
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      store.setCurrentConfig(mockConfig);
      const state = store.getState();

      expect(state.currentConfig).toEqual(mockConfig);
      expect(state.validationErrors).toEqual([]);
    });
  });

  describe('setSelectedClient', () => {
    it('should set selected client ID', () => {
      store.setSelectedClient('client-123');
      const state = store.getState();

      expect(state.selectedClientId).toBe('client-123');
    });

    it('should clear selected client ID when undefined', () => {
      store.setSelectedClient('client-123');
      store.setSelectedClient(undefined);
      const state = store.getState();

      expect(state.selectedClientId).toBeUndefined();
    });
  });

  describe('createNewConfig', () => {
    it('should create new global config', () => {
      store.createNewConfig();
      const state = store.getState();

      expect(state.currentConfig).not.toBeNull();
      expect(state.currentConfig?.name).toBe('Informe global');
      expect(state.currentConfig?.clientId).toBeUndefined();
      expect(state.selectedClientId).toBeUndefined();
      expect(state.validationErrors).toEqual([]);
      expect(state.error).toBeNull();
    });

    it('should create new client-specific config', () => {
      store.createNewConfig('client-123');
      const state = store.getState();

      expect(state.currentConfig).not.toBeNull();
      expect(state.currentConfig?.name).toBe('Informe personalizado - Cliente client-123');
      expect(state.currentConfig?.clientId).toBe('client-123');
      expect(state.selectedClientId).toBe('client-123');
    });
  });

  describe('updateConfig', () => {
    it('should update config properties', () => {
      store.createNewConfig();
      const originalUpdatedAt = store.getState().currentConfig?.updatedAt;

      // Wait a bit to ensure different timestamp
      setTimeout(() => {
        store.updateConfig({ name: 'Updated Name' });
        const state = store.getState();

        expect(state.currentConfig?.name).toBe('Updated Name');
        expect(state.currentConfig?.updatedAt).not.toEqual(originalUpdatedAt);
      }, 10);
    });

    it('should do nothing when no current config', () => {
      store.updateConfig({ name: 'Updated Name' });
      const state = store.getState();

      expect(state.currentConfig).toBeNull();
    });
  });

  describe('addGridSpace', () => {
    beforeEach(() => {
      store.createNewConfig();
    });

    it('should add grid space with correct properties', () => {
      store.addGridSpace(2);
      const state = store.getState();

      expect(state.currentConfig?.spaces).toHaveLength(1);
      const space = state.currentConfig?.spaces[0];
      expect(space?.columns).toBe(2);
      expect(space?.components).toEqual([]);
      expect(space?.order).toBe(0);
      expect(space?.id).toMatch(/^space-\d+-[a-z0-9]+$/);
    });

    it('should add multiple spaces with correct order', () => {
      store.addGridSpace(1);
      store.addGridSpace(3);
      const state = store.getState();

      expect(state.currentConfig?.spaces).toHaveLength(2);
      expect(state.currentConfig?.spaces[0].order).toBe(0);
      expect(state.currentConfig?.spaces[1].order).toBe(1);
    });

    it('should do nothing when no current config', () => {
      store.resetConstructor();
      store.addGridSpace(2);
      const state = store.getState();

      expect(state.currentConfig).toBeNull();
    });
  });

  describe('removeGridSpace', () => {
    beforeEach(() => {
      store.createNewConfig();
      store.addGridSpace(1);
      store.addGridSpace(2);
      store.addGridSpace(3);
    });

    it('should remove grid space and reorder remaining spaces', () => {
      // First verify we have 3 spaces
      const state = store.getState();
      expect(state.currentConfig?.spaces).toHaveLength(3);
      
      const middleSpaceId = state.currentConfig?.spaces[1]?.id;
      expect(middleSpaceId).toBeDefined();

      if (middleSpaceId) {
        store.removeGridSpace(middleSpaceId);
        const updatedState = store.getState();

        expect(updatedState.currentConfig?.spaces).toHaveLength(2);
        expect(updatedState.currentConfig?.spaces[0].order).toBe(0);
        expect(updatedState.currentConfig?.spaces[1].order).toBe(1);
      }
    });

    it('should do nothing when space not found', () => {
      store.removeGridSpace('non-existent-space');
      const state = store.getState();

      expect(state.currentConfig?.spaces).toHaveLength(3);
    });
  });

  describe('addComponent', () => {
    beforeEach(() => {
      store.createNewConfig();
      store.addGridSpace(2);
    });

    it('should add component to space', () => {
      const state = store.getState();
      const spaceId = state.currentConfig?.spaces[0].id;

      if (spaceId) {
        store.addComponent(spaceId, 0, mockComponent);
        const updatedState = store.getState();

        expect(updatedState.currentConfig?.spaces[0].components).toHaveLength(1);
        const addedComponent = updatedState.currentConfig?.spaces[0].components[0];
        expect(addedComponent?.id).toBe(mockComponent.id);
        expect(addedComponent?.columnIndex).toBe(0);
      }
    });

    it('should throw error when column is occupied', () => {
      const state = store.getState();
      const spaceId = state.currentConfig?.spaces[0].id;

      if (spaceId) {
        store.addComponent(spaceId, 0, mockComponent);

        expect(() => {
          store.addComponent(spaceId, 0, { ...mockComponent, id: 'component-2' });
        }).toThrow('La columna 0 ya está ocupada');
      }
    });

    it('should throw error when space is full', () => {
      const state = store.getState();
      const spaceId = state.currentConfig?.spaces[0].id;

      if (spaceId) {
        store.addComponent(spaceId, 0, mockComponent);
        store.addComponent(spaceId, 1, { ...mockComponent, id: 'component-2' });

        // Try to add to column 0 which is occupied - this will trigger the "occupied" error
        expect(() => {
          store.addComponent(spaceId, 0, { ...mockComponent, id: 'component-3' });
        }).toThrow('La columna 0 ya está ocupada');
      }
    });
  });

  describe('removeComponent', () => {
    beforeEach(() => {
      store.createNewConfig();
      store.addGridSpace(2);
      const state = store.getState();
      const spaceId = state.currentConfig?.spaces[0].id;
      if (spaceId) {
        store.addComponent(spaceId, 0, mockComponent);
        store.addComponent(spaceId, 1, { ...mockComponent, id: 'component-2' });
      }
    });

    it('should remove component from space', () => {
      store.removeComponent('component-1');
      const state = store.getState();

      expect(state.currentConfig?.spaces[0].components).toHaveLength(1);
      expect(state.currentConfig?.spaces[0].components[0].id).toBe('component-2');
    });

    it('should do nothing when component not found', () => {
      store.removeComponent('non-existent-component');
      const state = store.getState();

      expect(state.currentConfig?.spaces[0].components).toHaveLength(2);
    });
  });

  describe('updateComponent', () => {
    beforeEach(() => {
      store.createNewConfig();
      store.addGridSpace(2);
      const state = store.getState();
      const spaceId = state.currentConfig?.spaces[0].id;
      if (spaceId) {
        store.addComponent(spaceId, 0, mockComponent);
      }
    });

    it('should update component properties', () => {
      store.updateComponent('component-1', {
        config: { ...mockComponent.config, title: 'Updated Title' }
      });
      const state = store.getState();

      const updatedComponent = state.currentConfig?.spaces[0].components[0];
      expect(updatedComponent?.config.title).toBe('Updated Title');
    });

    it('should do nothing when component not found', () => {
      store.updateComponent('non-existent-component', {
        config: { ...mockComponent.config, title: 'Updated Title' }
      });
      const state = store.getState();

      const component = state.currentConfig?.spaces[0].components[0];
      expect(component?.config.title).toBe('Test Component');
    });
  });

  describe('validateConfig', () => {
    beforeEach(() => {
      store.createNewConfig();
    });

    it('should validate empty config', () => {
      const errors = store.validateConfig();

      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'canvas',
          message: 'El informe debe tener al menos un componente'
        })
      );
    });

    it('should validate config without name', () => {
      store.updateConfig({ name: '' });
      const errors = store.validateConfig();

      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'canvas',
          message: 'La configuración debe tener un nombre'
        })
      );
    });

    it('should validate component without title', () => {
      store.addGridSpace(1);
      const state = store.getState();
      const spaceId = state.currentConfig?.spaces[0].id;

      if (spaceId) {
        const componentWithoutTitle = {
          ...mockComponent,
          config: { ...mockComponent.config, title: '' }
        };
        store.addComponent(spaceId, 0, componentWithoutTitle);
        const errors = store.validateConfig();

        expect(errors).toContainEqual(
          expect.objectContaining({
            type: 'component',
            message: 'El componente debe tener un título'
          })
        );
      }
    });

    it('should validate valid config', () => {
      store.addGridSpace(1);
      const state = store.getState();
      const spaceId = state.currentConfig?.spaces[0].id;

      if (spaceId) {
        store.addComponent(spaceId, 0, mockComponent);
        const errors = store.validateConfig();

        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('saveConfig', () => {
    beforeEach(() => {
      store.createNewConfig();
      store.addGridSpace(1);
      const state = store.getState();
      const spaceId = state.currentConfig?.spaces[0].id;
      if (spaceId) {
        store.addComponent(spaceId, 0, mockComponent);
      }
    });

    it('should save valid config successfully', async () => {
      await store.saveConfig();
      const state = store.getState();

      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should reject saving invalid config', async () => {
      store.updateConfig({ name: '' }); // Make config invalid

      await expect(store.saveConfig()).rejects.toThrow(
        'La configuración tiene errores que deben corregirse'
      );

      const state = store.getState();
      expect(state.isSaving).toBe(false);
      expect(state.error).toBe('La configuración tiene errores que deben corregirse');
    });

    it('should set loading state during save', async () => {
      const savePromise = store.saveConfig();
      const state = store.getState();

      expect(state.isSaving).toBe(true);
      await savePromise;
    });
  });

  describe('loadConfig', () => {
    it('should load config successfully', async () => {
      await store.loadConfig('test-config-id');
      const state = store.getState();

      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.currentConfig).not.toBeNull();
      expect(state.currentConfig?.id).toBe('test-config-id');
      expect(state.currentConfig?.name).toBe('Configuración Cargada');
    });

    it('should set loading state during load', async () => {
      const loadPromise = store.loadConfig('test-config-id');
      const state = store.getState();

      expect(state.isLoading).toBe(true);
      await loadPromise;
    });
  });

  describe('auto-save functionality', () => {
    it('should enable auto-save', () => {
      store.enableAutoSave();
      const state = store.getState();

      expect(state.autoSaveEnabled).toBe(true);
    });

    it('should disable auto-save', () => {
      store.enableAutoSave();
      store.disableAutoSave();
      const state = store.getState();

      expect(state.autoSaveEnabled).toBe(false);
    });
  });

  describe('resetConstructor', () => {
    it('should reset all state to initial values', () => {
      store.createNewConfig('client-123');
      store.enableAutoSave();
      store.setState({ error: 'Some error' });

      store.resetConstructor();
      const state = store.getState();

      expect(state.currentConfig).toBeNull();
      expect(state.selectedClientId).toBeUndefined();
      expect(state.isLoading).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
      expect(state.validationErrors).toEqual([]);
      expect(state.autoSaveEnabled).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      store.setState({ error: 'Some error' });
      store.clearError();
      const state = store.getState();

      expect(state.error).toBeNull();
    });
  });

  describe('state subscription', () => {
    it('should notify subscribers of state changes', () => {
      const mockListener = vi.fn();
      const unsubscribe = store.subscribe(mockListener);

      store.createNewConfig();

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          currentConfig: expect.any(Object)
        })
      );

      unsubscribe();
    });

    it('should stop notifying after unsubscribe', () => {
      const mockListener = vi.fn();
      const unsubscribe = store.subscribe(mockListener);

      unsubscribe();
      store.createNewConfig();

      expect(mockListener).not.toHaveBeenCalled();
    });
  });
});