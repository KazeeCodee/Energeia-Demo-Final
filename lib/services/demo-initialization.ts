// Demo Data Initialization Service
import { DemoConfigurationService, demoDataSources } from './demo-data';
import { ReportPersistenceService } from './report-persistence';
import { useConstructorStore } from '../state/constructor';

export interface DemoInitializationResult {
  success: boolean;
  message: string;
  configurationsCreated: number;
  errors?: string[];
}

/**
 * Service for initializing demo data and configurations
 */
export class DemoInitializationService {
  
  /**
   * Initializes all demo configurations and data sources
   */
  static async initializeAllDemoData(): Promise<DemoInitializationResult> {
    try {
      const errors: string[] = [];
      let configurationsCreated = 0;

      // Get all demo configurations
      const demoConfigs = DemoConfigurationService.getAllDemoConfigurations();

      // Initialize global configuration
      try {
        const globalResult = await ReportPersistenceService.saveConfig(demoConfigs.global);
        if (globalResult.success) {
          configurationsCreated++;
        } else {
          errors.push(`Global: ${globalResult.message}`);
        }
      } catch (error) {
        errors.push(`Global: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }

      // Initialize client configurations
      for (const { clientId, config } of demoConfigs.clients) {
        try {
          const clientResult = await ReportPersistenceService.saveConfig(config);
          if (clientResult.success) {
            configurationsCreated++;
          } else {
            errors.push(`Cliente ${clientId}: ${clientResult.message}`);
          }
        } catch (error) {
          errors.push(`Cliente ${clientId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      // Update constructor store with demo data sources
      const store = useConstructorStore.getState();
      store.availableDataSources = demoDataSources;

      return {
        success: errors.length === 0,
        message: errors.length === 0 
          ? `Se inicializaron ${configurationsCreated} configuraciones de demostración exitosamente`
          : `Se inicializaron ${configurationsCreated} configuraciones. ${errors.length} errores encontrados`,
        configurationsCreated,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      return {
        success: false,
        message: `Error crítico durante la inicialización: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        configurationsCreated: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Initializes only the global demo configuration
   */
  static async initializeGlobalDemo(): Promise<DemoInitializationResult> {
    try {
      const globalConfig = DemoConfigurationService.createGlobalReportConfig();
      const result = await ReportPersistenceService.saveConfig(globalConfig);

      // Update constructor store with demo data sources
      const store = useConstructorStore.getState();
      store.availableDataSources = demoDataSources;

      return {
        success: result.success,
        message: result.success 
          ? 'Configuración global de demostración inicializada exitosamente'
          : `Error al inicializar configuración global: ${result.message}`,
        configurationsCreated: result.success ? 1 : 0,
        errors: result.success ? undefined : [result.message],
      };

    } catch (error) {
      return {
        success: false,
        message: `Error al inicializar configuración global: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        configurationsCreated: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Initializes demo configuration for a specific client
   */
  static async initializeClientDemo(clientId: string): Promise<DemoInitializationResult> {
    try {
      let config;
      
      // Create appropriate configuration based on client ID
      switch (clientId) {
        case 'client-1':
          config = DemoConfigurationService.createEnergyCompanyConfig(clientId);
          break;
        case 'client-2':
          config = DemoConfigurationService.createIndustrialCompanyConfig(clientId);
          break;
        case 'client-3':
          config = DemoConfigurationService.createCooperativeConfig(clientId);
          break;
        case 'client-4':
          config = DemoConfigurationService.createMiningCompanyConfig(clientId);
          break;
        case 'client-5':
          config = DemoConfigurationService.createTextileCompanyConfig(clientId);
          break;
        default:
          // Create a generic configuration for unknown clients
          config = DemoConfigurationService.createGlobalReportConfig();
          config.clientId = clientId;
          config.name = `Informe personalizado - Cliente ${clientId}`;
          break;
      }

      const result = await ReportPersistenceService.saveConfig(config);

      return {
        success: result.success,
        message: result.success 
          ? `Configuración de demostración para cliente ${clientId} inicializada exitosamente`
          : `Error al inicializar configuración para cliente ${clientId}: ${result.message}`,
        configurationsCreated: result.success ? 1 : 0,
        errors: result.success ? undefined : [result.message],
      };

    } catch (error) {
      return {
        success: false,
        message: `Error al inicializar configuración para cliente ${clientId}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        configurationsCreated: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Resets all demo data (clears existing and reinitializes)
   */
  static async resetAllDemoData(): Promise<DemoInitializationResult> {
    try {
      const errors: string[] = [];
      
      // Clear existing configurations
      try {
        // Delete global config
        await ReportPersistenceService.deleteConfig();
        
        // Delete client configs
        const demoConfigs = DemoConfigurationService.getAllDemoConfigurations();
        for (const { clientId } of demoConfigs.clients) {
          await ReportPersistenceService.deleteConfig(clientId);
        }
      } catch (error) {
        errors.push(`Error al limpiar configuraciones existentes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }

      // Reinitialize all demo data
      const initResult = await this.initializeAllDemoData();
      
      return {
        success: initResult.success && errors.length === 0,
        message: errors.length === 0 
          ? `Datos de demostración reinicializados exitosamente. ${initResult.message}`
          : `Reinicialización completada con advertencias: ${errors.join(', ')}. ${initResult.message}`,
        configurationsCreated: initResult.configurationsCreated,
        errors: [...(errors || []), ...(initResult.errors || [])],
      };

    } catch (error) {
      return {
        success: false,
        message: `Error crítico durante la reinicialización: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        configurationsCreated: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Validates that demo data is properly initialized
   */
  static async validateDemoData(): Promise<{
    isValid: boolean;
    globalConfigExists: boolean;
    clientConfigsCount: number;
    dataSourcesCount: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    let globalConfigExists = false;
    let clientConfigsCount = 0;

    try {
      // Check global configuration
      const globalResult = await ReportPersistenceService.loadConfig();
      globalConfigExists = globalResult.success;
      if (!globalConfigExists) {
        issues.push('Configuración global no encontrada');
      }

      // Check client configurations
      const demoConfigs = DemoConfigurationService.getAllDemoConfigurations();
      for (const { clientId } of demoConfigs.clients) {
        try {
          const clientResult = await ReportPersistenceService.loadConfig(clientId);
          if (clientResult.success) {
            clientConfigsCount++;
          } else {
            issues.push(`Configuración del cliente ${clientId} no encontrada`);
          }
        } catch (error) {
          issues.push(`Error al verificar cliente ${clientId}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      // Check data sources
      const dataSourcesCount = demoDataSources.length;
      if (dataSourcesCount === 0) {
        issues.push('No hay fuentes de datos de demostración disponibles');
      }

      return {
        isValid: issues.length === 0,
        globalConfigExists,
        clientConfigsCount,
        dataSourcesCount,
        issues,
      };

    } catch (error) {
      return {
        isValid: false,
        globalConfigExists: false,
        clientConfigsCount: 0,
        dataSourcesCount: demoDataSources.length,
        issues: [`Error crítico durante la validación: ${error instanceof Error ? error.message : 'Error desconocido'}`],
      };
    }
  }

  /**
   * Gets demo scenarios for testing
   */
  static getDemoScenarios() {
    return DemoConfigurationService.getDemoScenarios();
  }

  /**
   * Initializes a specific demo scenario
   */
  static async initializeDemoScenario(scenarioName: string): Promise<DemoInitializationResult> {
    try {
      const scenarios = this.getDemoScenarios();
      const scenario = scenarios.find(s => s.name === scenarioName);
      
      if (!scenario) {
        return {
          success: false,
          message: `Escenario "${scenarioName}" no encontrado`,
          configurationsCreated: 0,
          errors: [`Escenario "${scenarioName}" no existe`],
        };
      }

      const result = await ReportPersistenceService.saveConfig(scenario.config);

      return {
        success: result.success,
        message: result.success 
          ? `Escenario "${scenarioName}" inicializado exitosamente`
          : `Error al inicializar escenario "${scenarioName}": ${result.message}`,
        configurationsCreated: result.success ? 1 : 0,
        errors: result.success ? undefined : [result.message],
      };

    } catch (error) {
      return {
        success: false,
        message: `Error al inicializar escenario "${scenarioName}": ${error instanceof Error ? error.message : 'Error desconocido'}`,
        configurationsCreated: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
      };
    }
  }

  /**
   * Gets information about available demo clients
   */
  static getDemoClientsInfo(): Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    keyFeatures: string[];
  }> {
    return [
      {
        id: 'client-1',
        name: 'Empresa Energética Norte',
        type: 'Generadora',
        description: 'Empresa de generación eléctrica con mix diversificado',
        keyFeatures: [
          'Mix energético completo (térmica, renovable, nuclear)',
          'Análisis detallado por tecnología',
          'Métricas de eficiencia operacional',
          'Indicadores de calidad de red'
        ]
      },
      {
        id: 'client-2',
        name: 'Industrias del Sur S.A.',
        type: 'Gran Usuario Industrial',
        description: 'Complejo industrial con alta demanda energética',
        keyFeatures: [
          'Demanda industrial por sector',
          'Análisis de eficiencia por proceso',
          'Costos de mantenimiento detallados',
          'Generación térmica especializada'
        ]
      },
      {
        id: 'client-3',
        name: 'Cooperativa Eléctrica Centro',
        type: 'Distribuidora',
        description: 'Cooperativa de distribución eléctrica regional',
        keyFeatures: [
          'Distribución por zona de servicio',
          'Métricas de calidad de servicio',
          'Análisis de satisfacción de socios',
          'Indicadores de eficiencia de red'
        ]
      },
      {
        id: 'client-4',
        name: 'Minera Los Andes',
        type: 'Gran Usuario Minero',
        description: 'Operación minera con procesos intensivos en energía',
        keyFeatures: [
          'Consumo por operación minera',
          'Eficiencia energética por proceso',
          'Análisis de energías renovables',
          'Métricas de sustentabilidad'
        ]
      },
      {
        id: 'client-5',
        name: 'Textil Argentina',
        type: 'Industria Manufacturera',
        description: 'Empresa textil con enfoque en eficiencia energética',
        keyFeatures: [
          'Consumo por proceso textil',
          'Análisis de calidad y eficiencia',
          'Compromiso con energías renovables',
          'Optimización de costos energéticos'
        ]
      }
    ];
  }
}