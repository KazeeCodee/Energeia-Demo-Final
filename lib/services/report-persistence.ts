// Report Configuration Persistence Service
import { ReportConfig, ValidationError } from '../types/constructor';
import { LocalStorageManager } from '../utils/localStorage';

// Storage keys for report configurations
const STORAGE_KEYS = {
  GLOBAL_CONFIG: 'constructor_config_global',
  CLIENT_CONFIG_PREFIX: 'constructor_config_client_',
  CONFIG_LIST: 'constructor_config_list',
  AUTO_SAVE_PREFIX: 'constructor_autosave_',
} as const;

export interface SaveResult {
  success: boolean;
  message: string;
  configId?: string;
}

export interface LoadResult {
  success: boolean;
  config?: ReportConfig;
  message?: string;
}

export interface ConfigListItem {
  id: string;
  name: string;
  clientId?: string;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Service for persisting and managing report configurations
 */
export class ReportPersistenceService {
  
  /**
   * Validates a report configuration before saving
   */
  static validateConfig(config: ReportConfig): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate basic structure
    if (!config.id) {
      errors.push({
        type: 'canvas',
        message: 'La configuración debe tener un ID válido',
      });
    }

    if (!config.name?.trim()) {
      errors.push({
        type: 'canvas',
        message: 'La configuración debe tener un nombre',
      });
    }

    // Validate canvas has at least one component
    const totalComponents = config.spaces.reduce(
      (total, space) => total + space.components.length,
      0
    );

    if (totalComponents === 0) {
      errors.push({
        type: 'canvas',
        message: 'El informe debe tener al menos un componente',
      });
    }

    // Validate each space and component
    config.spaces.forEach(space => {
      // Validate grid constraints
      if (space.components.length > space.columns) {
        errors.push({
          type: 'grid',
          message: `El espacio de ${space.columns} columna(s) no puede tener más de ${space.columns} componente(s)`,
          spaceId: space.id,
        });
      }

      // Validate each component
      space.components.forEach(component => {
        if (!component.dataSource?.id) {
          errors.push({
            type: 'component',
            message: 'El componente debe tener una fuente de datos válida',
            componentId: component.id,
            spaceId: space.id,
          });
        }

        if (!component.config?.title?.trim()) {
          errors.push({
            type: 'component',
            message: 'El componente debe tener un título',
            componentId: component.id,
            spaceId: space.id,
          });
        }

        if (component.columnIndex >= space.columns) {
          errors.push({
            type: 'component',
            message: `Índice de columna inválido: ${component.columnIndex} para espacio de ${space.columns} columnas`,
            componentId: component.id,
            spaceId: space.id,
          });
        }

        // Validate data source compatibility
        if (component.dataSource && component.type) {
          const isCompatible = this.validateDataSourceCompatibility(
            component.type,
            component.dataSource
          );
          
          if (!isCompatible) {
            errors.push({
              type: 'data',
              message: `La fuente de datos "${component.dataSource.name}" no es compatible con el tipo de gráfico "${component.type}"`,
              componentId: component.id,
              spaceId: space.id,
            });
          }
        }
      });
    });

    return errors;
  }

  /**
   * Validates compatibility between chart type and data source
   */
  private static validateDataSourceCompatibility(
    chartType: string,
    dataSource: { type: string; fields: Array<{ type: string }> }
  ): boolean {
    // Basic compatibility rules
    switch (chartType) {
      case 'generation-mix':
        return dataSource.type === 'energy-generation' || 
               (dataSource.type === 'custom' && dataSource.fields.some(f => f.type === 'percentage'));
      
      case 'demand-trend':
        return dataSource.type === 'demand' || 
               (dataSource.type === 'custom' && dataSource.fields.some(f => f.type === 'number'));
      
      case 'cost-comparison':
        return dataSource.type === 'cost' || 
               (dataSource.type === 'custom' && dataSource.fields.some(f => f.type === 'number'));
      
      case 'custom-bar':
      case 'custom-line':
      case 'custom-pie':
        return dataSource.fields.some(f => f.type === 'number');
      
      default:
        return true; // Allow unknown types for flexibility
    }
  }

  /**
   * Serializes a ReportConfig for storage
   */
  static serializeConfig(config: ReportConfig): string {
    try {
      return JSON.stringify(config, (key, value) => {
        // Handle Date objects
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      });
    } catch (error) {
      throw new Error(`Error al serializar configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Deserializes a ReportConfig from storage
   */
  static deserializeConfig(data: string): ReportConfig {
    try {
      return JSON.parse(data, (key, value) => {
        // Handle Date objects
        if (value && typeof value === 'object' && value.__type === 'Date') {
          return new Date(value.value);
        }
        return value;
      });
    } catch (error) {
      throw new Error(`Error al deserializar configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Saves a report configuration
   */
  static async saveConfig(config: ReportConfig): Promise<SaveResult> {
    try {
      // Validate configuration
      const errors = this.validateConfig(config);
      if (errors.length > 0) {
        return {
          success: false,
          message: `Errores de validación: ${errors.map(e => e.message).join(', ')}`,
        };
      }

      // Update timestamps
      const configToSave = {
        ...config,
        updatedAt: new Date(),
      };

      // Determine storage key
      const storageKey = config.clientId 
        ? `${STORAGE_KEYS.CLIENT_CONFIG_PREFIX}${config.clientId}`
        : STORAGE_KEYS.GLOBAL_CONFIG;

      // Serialize and save
      const serialized = this.serializeConfig(configToSave);
      const success = LocalStorageManager.set(storageKey, serialized);

      if (!success) {
        return {
          success: false,
          message: 'Error al guardar en el almacenamiento local',
        };
      }

      // Update config list
      await this.updateConfigList(configToSave);

      // Clear any auto-save for this config
      this.clearAutoSave(config.id);

      return {
        success: true,
        message: 'Configuración guardada exitosamente',
        configId: config.id,
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al guardar',
      };
    }
  }

  /**
   * Loads a report configuration
   */
  static async loadConfig(clientId?: string): Promise<LoadResult> {
    try {
      // Determine storage key
      const storageKey = clientId 
        ? `${STORAGE_KEYS.CLIENT_CONFIG_PREFIX}${clientId}`
        : STORAGE_KEYS.GLOBAL_CONFIG;

      // Load from storage
      const serialized = LocalStorageManager.get<string>(storageKey);
      
      if (!serialized) {
        return {
          success: false,
          message: clientId 
            ? `No se encontró configuración para el cliente ${clientId}`
            : 'No se encontró configuración global',
        };
      }

      // Deserialize
      const config = this.deserializeConfig(serialized);

      return {
        success: true,
        config,
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al cargar',
      };
    }
  }

  /**
   * Auto-saves a configuration (for draft purposes)
   */
  static async autoSaveConfig(config: ReportConfig): Promise<void> {
    try {
      const autoSaveKey = `${STORAGE_KEYS.AUTO_SAVE_PREFIX}${config.id}`;
      const configToSave = {
        ...config,
        updatedAt: new Date(),
      };

      const serialized = this.serializeConfig(configToSave);
      LocalStorageManager.set(autoSaveKey, serialized);
    } catch (error) {
      console.warn('Error en auto-guardado:', error);
    }
  }

  /**
   * Loads an auto-saved configuration
   */
  static async loadAutoSave(configId: string): Promise<ReportConfig | null> {
    try {
      const autoSaveKey = `${STORAGE_KEYS.AUTO_SAVE_PREFIX}${configId}`;
      const serialized = LocalStorageManager.get<string>(autoSaveKey);
      
      if (!serialized) {
        return null;
      }

      return this.deserializeConfig(serialized);
    } catch (error) {
      console.warn('Error al cargar auto-guardado:', error);
      return null;
    }
  }

  /**
   * Clears auto-save for a configuration
   */
  static clearAutoSave(configId: string): void {
    const autoSaveKey = `${STORAGE_KEYS.AUTO_SAVE_PREFIX}${configId}`;
    LocalStorageManager.remove(autoSaveKey);
  }

  /**
   * Updates the list of available configurations
   */
  private static async updateConfigList(config: ReportConfig): Promise<void> {
    try {
      const currentList = LocalStorageManager.get<ConfigListItem[]>(STORAGE_KEYS.CONFIG_LIST, []) || [];
      
      // Remove existing entry for this config
      const filteredList = currentList.filter(item => 
        item.id !== config.id && 
        (item.clientId || 'global') !== (config.clientId || 'global')
      );

      // Add updated entry
      const listItem: ConfigListItem = {
        id: config.id,
        name: config.name,
        clientId: config.clientId,
        updatedAt: config.updatedAt,
        isActive: config.isActive,
      };

      filteredList.push(listItem);

      // Sort by update date (most recent first)
      filteredList.sort((a, b) => {
        const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt);
        const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });

      LocalStorageManager.set(STORAGE_KEYS.CONFIG_LIST, filteredList);
    } catch (error) {
      console.warn('Error al actualizar lista de configuraciones:', error);
    }
  }

  /**
   * Gets the list of available configurations
   */
  static async getConfigList(): Promise<ConfigListItem[]> {
    try {
      return LocalStorageManager.get<ConfigListItem[]>(STORAGE_KEYS.CONFIG_LIST, []) || [];
    } catch (error) {
      console.warn('Error al obtener lista de configuraciones:', error);
      return [];
    }
  }

  /**
   * Deletes a configuration
   */
  static async deleteConfig(clientId?: string): Promise<SaveResult> {
    try {
      // Determine storage key
      const storageKey = clientId 
        ? `${STORAGE_KEYS.CLIENT_CONFIG_PREFIX}${clientId}`
        : STORAGE_KEYS.GLOBAL_CONFIG;

      // Remove from storage
      const success = LocalStorageManager.remove(storageKey);

      if (!success) {
        return {
          success: false,
          message: 'Error al eliminar configuración del almacenamiento',
        };
      }

      // Update config list
      const currentList = LocalStorageManager.get<ConfigListItem[]>(STORAGE_KEYS.CONFIG_LIST, []) || [];
      const filteredList = currentList.filter(item => 
        (item.clientId || 'global') !== (clientId || 'global')
      );
      LocalStorageManager.set(STORAGE_KEYS.CONFIG_LIST, filteredList);

      return {
        success: true,
        message: 'Configuración eliminada exitosamente',
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al eliminar',
      };
    }
  }

  /**
   * Duplicates a configuration for a different client
   */
  static async duplicateConfig(sourceClientId: string | undefined, targetClientId: string): Promise<SaveResult> {
    try {
      // Load source configuration
      const loadResult = await this.loadConfig(sourceClientId);
      
      if (!loadResult.success || !loadResult.config) {
        return {
          success: false,
          message: loadResult.message || 'No se pudo cargar la configuración origen',
        };
      }

      // Create new configuration for target client
      const newConfig: ReportConfig = {
        ...loadResult.config,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${loadResult.config.name} - Cliente ${targetClientId}`,
        clientId: targetClientId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save the duplicated configuration
      return await this.saveConfig(newConfig);

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al duplicar',
      };
    }
  }

  /**
   * Exports all configurations for backup
   */
  static async exportConfigurations(): Promise<string> {
    try {
      const configList = await this.getConfigList();
      const configurations: Record<string, ReportConfig> = {};

      // Load all configurations
      for (const item of configList) {
        const loadResult = await this.loadConfig(item.clientId);
        if (loadResult.success && loadResult.config) {
          const key = item.clientId || 'global';
          configurations[key] = loadResult.config;
        }
      }

      return JSON.stringify({
        exportDate: new Date().toISOString(),
        version: '1.0',
        configurations,
      }, null, 2);

    } catch (error) {
      throw new Error(`Error al exportar configuraciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Imports configurations from backup
   */
  static async importConfigurations(data: string): Promise<SaveResult> {
    try {
      const parsed = JSON.parse(data);
      
      if (!parsed.configurations || typeof parsed.configurations !== 'object') {
        return {
          success: false,
          message: 'Formato de importación inválido',
        };
      }

      let importedCount = 0;
      const errors: string[] = [];

      // Import each configuration
      for (const [key, config] of Object.entries(parsed.configurations)) {
        try {
          const saveResult = await this.saveConfig(config as ReportConfig);
          if (saveResult.success) {
            importedCount++;
          } else {
            errors.push(`${key}: ${saveResult.message}`);
          }
        } catch (error) {
          errors.push(`${key}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: `Se importaron ${importedCount} configuraciones. Errores: ${errors.join(', ')}`,
        };
      }

      return {
        success: true,
        message: `Se importaron ${importedCount} configuraciones exitosamente`,
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido al importar',
      };
    }
  }
}