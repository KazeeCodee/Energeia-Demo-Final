// System Validation Service
import { ReportConfig } from '../types/constructor';
import { ReportPersistenceService } from './report-persistence';
import { DemoInitializationService } from './demo-initialization';
import { useConstructorStore } from '../state/constructor';

export interface SystemValidationResult {
  isValid: boolean;
  score: number; // 0-100
  categories: {
    dataIntegrity: ValidationCategory;
    functionality: ValidationCategory;
    performance: ValidationCategory;
    userExperience: ValidationCategory;
    compatibility: ValidationCategory;
  };
  recommendations: string[];
  criticalIssues: string[];
}

export interface ValidationCategory {
  name: string;
  score: number; // 0-100
  status: 'excellent' | 'good' | 'warning' | 'critical';
  checks: ValidationCheck[];
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  details?: string;
}

/**
 * Comprehensive system validation service
 */
export class SystemValidationService {
  
  /**
   * Performs complete system validation
   */
  static async validateCompleteSystem(): Promise<SystemValidationResult> {
    const categories = {
      dataIntegrity: await this.validateDataIntegrity(),
      functionality: await this.validateFunctionality(),
      performance: await this.validatePerformance(),
      userExperience: await this.validateUserExperience(),
      compatibility: await this.validateCompatibility(),
    };

    const overallScore = this.calculateOverallScore(categories);
    const isValid = overallScore >= 70; // 70% threshold for valid system

    const recommendations = this.generateRecommendations(categories);
    const criticalIssues = this.extractCriticalIssues(categories);

    return {
      isValid,
      score: overallScore,
      categories,
      recommendations,
      criticalIssues,
    };
  }

  /**
   * Validates data integrity across the system
   */
  private static async validateDataIntegrity(): Promise<ValidationCategory> {
    const checks: ValidationCheck[] = [];

    // Check demo data initialization
    try {
      const demoValidation = await DemoInitializationService.validateDemoData();
      checks.push({
        name: 'Demo Data Availability',
        passed: demoValidation.isValid,
        message: demoValidation.isValid 
          ? 'Datos de demostración disponibles y válidos'
          : `Problemas en datos de demostración: ${demoValidation.issues.join(', ')}`,
        severity: demoValidation.isValid ? 'info' : 'error',
        details: `Global: ${demoValidation.globalConfigExists}, Clientes: ${demoValidation.clientConfigsCount}, Fuentes: ${demoValidation.dataSourcesCount}`,
      });
    } catch (error) {
      checks.push({
        name: 'Demo Data Availability',
        passed: false,
        message: 'Error al validar datos de demostración',
        severity: 'critical',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    // Check configuration persistence
    try {
      const testConfig = {
        id: 'validation-test',
        name: 'Test Configuration',
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      } as ReportConfig;

      const saveResult = await ReportPersistenceService.saveConfig(testConfig);
      const loadResult = await ReportPersistenceService.loadConfig();
      
      checks.push({
        name: 'Configuration Persistence',
        passed: saveResult.success && loadResult.success,
        message: saveResult.success && loadResult.success
          ? 'Persistencia de configuraciones funcionando correctamente'
          : 'Problemas con la persistencia de configuraciones',
        severity: saveResult.success && loadResult.success ? 'info' : 'critical',
      });

      // Clean up test configuration
      if (saveResult.success) {
        await ReportPersistenceService.deleteConfig();
      }
    } catch (error) {
      checks.push({
        name: 'Configuration Persistence',
        passed: false,
        message: 'Error crítico en persistencia de configuraciones',
        severity: 'critical',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    // Check data source integrity
    try {
      const store = useConstructorStore.getState();
      await store.loadDataSources();
      
      const dataSources = store.availableDataSources;
      const validDataSources = dataSources.filter(ds => 
        ds.id && ds.name && ds.type && ds.fields && ds.sampleData
      );

      checks.push({
        name: 'Data Source Integrity',
        passed: validDataSources.length === dataSources.length && dataSources.length > 0,
        message: validDataSources.length === dataSources.length && dataSources.length > 0
          ? `${dataSources.length} fuentes de datos válidas disponibles`
          : `Problemas en fuentes de datos: ${dataSources.length - validDataSources.length} inválidas`,
        severity: validDataSources.length === dataSources.length && dataSources.length > 0 ? 'info' : 'warning',
        details: `Total: ${dataSources.length}, Válidas: ${validDataSources.length}`,
      });
    } catch (error) {
      checks.push({
        name: 'Data Source Integrity',
        passed: false,
        message: 'Error al cargar fuentes de datos',
        severity: 'error',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    return this.createValidationCategory('Data Integrity', checks);
  }

  /**
   * Validates core functionality
   */
  private static async validateFunctionality(): Promise<ValidationCategory> {
    const checks: ValidationCheck[] = [];

    // Test constructor store operations
    try {
      const store = useConstructorStore.getState();
      
      // Test configuration management
      const testConfig = {
        id: 'func-test',
        name: 'Functionality Test',
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      } as ReportConfig;

      store.setCurrentConfig(testConfig);
      
      checks.push({
        name: 'Configuration Management',
        passed: store.currentConfig?.id === testConfig.id,
        message: store.currentConfig?.id === testConfig.id
          ? 'Gestión de configuraciones funcionando'
          : 'Problemas en gestión de configuraciones',
        severity: store.currentConfig?.id === testConfig.id ? 'info' : 'error',
      });

      // Test grid operations
      const initialSpaceCount = store.currentConfig?.spaces.length || 0;
      store.addGridSpace(2);
      const afterAddCount = store.currentConfig?.spaces.length || 0;
      
      checks.push({
        name: 'Grid Operations',
        passed: afterAddCount === initialSpaceCount + 1,
        message: afterAddCount === initialSpaceCount + 1
          ? 'Operaciones de grid funcionando correctamente'
          : 'Problemas en operaciones de grid',
        severity: afterAddCount === initialSpaceCount + 1 ? 'info' : 'error',
      });

      // Test validation
      const validationErrors = store.validateConfig();
      checks.push({
        name: 'Configuration Validation',
        passed: Array.isArray(validationErrors),
        message: Array.isArray(validationErrors)
          ? 'Sistema de validación funcionando'
          : 'Problemas en sistema de validación',
        severity: Array.isArray(validationErrors) ? 'info' : 'error',
        details: `Errores encontrados: ${validationErrors.length}`,
      });

    } catch (error) {
      checks.push({
        name: 'Constructor Store Operations',
        passed: false,
        message: 'Error en operaciones del constructor',
        severity: 'critical',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    // Test client management
    try {
      const store = useConstructorStore.getState();
      const clients = await store.getAvailableClients();
      
      checks.push({
        name: 'Client Management',
        passed: Array.isArray(clients) && clients.length > 0,
        message: Array.isArray(clients) && clients.length > 0
          ? `Gestión de clientes funcionando (${clients.length} clientes)`
          : 'Problemas en gestión de clientes',
        severity: Array.isArray(clients) && clients.length > 0 ? 'info' : 'warning',
      });
    } catch (error) {
      checks.push({
        name: 'Client Management',
        passed: false,
        message: 'Error en gestión de clientes',
        severity: 'error',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    return this.createValidationCategory('Functionality', checks);
  }

  /**
   * Validates system performance
   */
  private static async validatePerformance(): Promise<ValidationCategory> {
    const checks: ValidationCheck[] = [];

    // Test configuration loading performance
    try {
      const startTime = performance.now();
      
      // Initialize demo data
      await DemoInitializationService.initializeAllDemoData();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      checks.push({
        name: 'Demo Data Initialization Performance',
        passed: duration < 5000, // 5 seconds threshold
        message: duration < 5000
          ? `Inicialización rápida (${Math.round(duration)}ms)`
          : `Inicialización lenta (${Math.round(duration)}ms)`,
        severity: duration < 2000 ? 'info' : duration < 5000 ? 'warning' : 'error',
        details: `Tiempo: ${Math.round(duration)}ms`,
      });
    } catch (error) {
      checks.push({
        name: 'Demo Data Initialization Performance',
        passed: false,
        message: 'Error en prueba de rendimiento de inicialización',
        severity: 'error',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    // Test configuration save/load performance
    try {
      const testConfig = {
        id: 'perf-test',
        name: 'Performance Test',
        spaces: Array.from({ length: 10 }, (_, i) => ({
          id: `space-${i}`,
          columns: (i % 3) + 1 as 1 | 2 | 3,
          components: [],
          order: i,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      } as ReportConfig;

      const startTime = performance.now();
      
      const saveResult = await ReportPersistenceService.saveConfig(testConfig);
      const loadResult = await ReportPersistenceService.loadConfig();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      checks.push({
        name: 'Configuration Save/Load Performance',
        passed: saveResult.success && loadResult.success && duration < 1000,
        message: saveResult.success && loadResult.success && duration < 1000
          ? `Operaciones rápidas (${Math.round(duration)}ms)`
          : `Operaciones lentas o fallidas (${Math.round(duration)}ms)`,
        severity: duration < 500 ? 'info' : duration < 1000 ? 'warning' : 'error',
        details: `Tiempo: ${Math.round(duration)}ms, Guardado: ${saveResult.success}, Carga: ${loadResult.success}`,
      });

      // Clean up
      if (saveResult.success) {
        await ReportPersistenceService.deleteConfig();
      }
    } catch (error) {
      checks.push({
        name: 'Configuration Save/Load Performance',
        passed: false,
        message: 'Error en prueba de rendimiento de configuraciones',
        severity: 'error',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    // Test memory usage (basic check)
    try {
      const memoryInfo = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      if (memoryInfo) {
        const usedMemoryMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
        
        checks.push({
          name: 'Memory Usage',
          passed: usedMemoryMB < 100, // 100MB threshold
          message: usedMemoryMB < 100
            ? `Uso de memoria normal (${Math.round(usedMemoryMB)}MB)`
            : `Uso de memoria alto (${Math.round(usedMemoryMB)}MB)`,
          severity: usedMemoryMB < 50 ? 'info' : usedMemoryMB < 100 ? 'warning' : 'error',
          details: `Memoria usada: ${Math.round(usedMemoryMB)}MB`,
        });
      } else {
        checks.push({
          name: 'Memory Usage',
          passed: true,
          message: 'Información de memoria no disponible en este entorno',
          severity: 'info',
        });
      }
    } catch (_error) {
      checks.push({
        name: 'Memory Usage',
        passed: true,
        message: 'No se pudo evaluar el uso de memoria',
        severity: 'info',
      });
    }

    return this.createValidationCategory('Performance', checks);
  }

  /**
   * Validates user experience aspects
   */
  private static async validateUserExperience(): Promise<ValidationCategory> {
    const checks: ValidationCheck[] = [];

    // Check error handling
    try {
      const store = useConstructorStore.getState();
      
      // Test with invalid configuration
      const invalidConfig = {
        id: '',
        name: '',
        spaces: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      } as ReportConfig;

      store.setCurrentConfig(invalidConfig);
      const errors = store.validateConfig();
      
      checks.push({
        name: 'Error Handling',
        passed: errors.length > 0,
        message: errors.length > 0
          ? 'Sistema de validación detecta errores correctamente'
          : 'Sistema de validación no detecta errores obvios',
        severity: errors.length > 0 ? 'info' : 'warning',
        details: `Errores detectados: ${errors.length}`,
      });
    } catch (error) {
      checks.push({
        name: 'Error Handling',
        passed: false,
        message: 'Error en sistema de manejo de errores',
        severity: 'error',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    // Check data source variety
    try {
      const store = useConstructorStore.getState();
      await store.loadDataSources();
      
      const dataSources = store.availableDataSources;
      const uniqueTypes = new Set(dataSources.map(ds => ds.type));
      
      checks.push({
        name: 'Data Source Variety',
        passed: uniqueTypes.size >= 4,
        message: uniqueTypes.size >= 4
          ? `Buena variedad de fuentes de datos (${uniqueTypes.size} tipos)`
          : `Variedad limitada de fuentes de datos (${uniqueTypes.size} tipos)`,
        severity: uniqueTypes.size >= 5 ? 'info' : uniqueTypes.size >= 3 ? 'warning' : 'error',
        details: `Tipos disponibles: ${Array.from(uniqueTypes).join(', ')}`,
      });
    } catch (error) {
      checks.push({
        name: 'Data Source Variety',
        passed: false,
        message: 'Error al evaluar variedad de fuentes de datos',
        severity: 'error',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    // Check demo scenarios availability
    try {
      const scenarios = DemoInitializationService.getDemoScenarios();
      
      checks.push({
        name: 'Demo Scenarios',
        passed: scenarios.length >= 3,
        message: scenarios.length >= 3
          ? `Escenarios de demostración disponibles (${scenarios.length})`
          : `Pocos escenarios de demostración (${scenarios.length})`,
        severity: scenarios.length >= 3 ? 'info' : 'warning',
        details: `Escenarios: ${scenarios.map(s => s.name).join(', ')}`,
      });
    } catch (error) {
      checks.push({
        name: 'Demo Scenarios',
        passed: false,
        message: 'Error al evaluar escenarios de demostración',
        severity: 'error',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    // Check client diversity
    try {
      const clientsInfo = DemoInitializationService.getDemoClientsInfo();
      const uniqueClientTypes = new Set(clientsInfo.map(c => c.type));
      
      checks.push({
        name: 'Client Diversity',
        passed: uniqueClientTypes.size >= 3,
        message: uniqueClientTypes.size >= 3
          ? `Buena diversidad de tipos de cliente (${uniqueClientTypes.size})`
          : `Diversidad limitada de tipos de cliente (${uniqueClientTypes.size})`,
        severity: uniqueClientTypes.size >= 4 ? 'info' : uniqueClientTypes.size >= 2 ? 'warning' : 'error',
        details: `Tipos: ${Array.from(uniqueClientTypes).join(', ')}`,
      });
    } catch (error) {
      checks.push({
        name: 'Client Diversity',
        passed: false,
        message: 'Error al evaluar diversidad de clientes',
        severity: 'error',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    return this.createValidationCategory('User Experience', checks);
  }

  /**
   * Validates system compatibility
   */
  private static async validateCompatibility(): Promise<ValidationCategory> {
    const checks: ValidationCheck[] = [];

    // Check localStorage availability
    try {
      const testKey = 'compatibility-test';
      const testValue = 'test-value';
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      checks.push({
        name: 'LocalStorage Compatibility',
        passed: retrieved === testValue,
        message: retrieved === testValue
          ? 'LocalStorage funcionando correctamente'
          : 'Problemas con LocalStorage',
        severity: retrieved === testValue ? 'info' : 'critical',
      });
    } catch (error) {
      checks.push({
        name: 'LocalStorage Compatibility',
        passed: false,
        message: 'LocalStorage no disponible',
        severity: 'critical',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    // Check JSON serialization
    try {
      const testObject = {
        id: 'test',
        date: new Date(),
        array: [1, 2, 3],
        nested: { prop: 'value' },
      };
      
      const serialized = JSON.stringify(testObject);
      const deserialized = JSON.parse(serialized);
      
      checks.push({
        name: 'JSON Serialization',
        passed: deserialized.id === testObject.id,
        message: deserialized.id === testObject.id
          ? 'Serialización JSON funcionando'
          : 'Problemas con serialización JSON',
        severity: deserialized.id === testObject.id ? 'info' : 'error',
      });
    } catch (error) {
      checks.push({
        name: 'JSON Serialization',
        passed: false,
        message: 'Error en serialización JSON',
        severity: 'error',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    // Check Performance API
    try {
      const startTime = performance.now();
      // Small delay to test timing
      await new Promise(resolve => setTimeout(resolve, 1));
      const endTime = performance.now();
      
      checks.push({
        name: 'Performance API',
        passed: endTime > startTime,
        message: endTime > startTime
          ? 'Performance API disponible'
          : 'Performance API no funciona correctamente',
        severity: endTime > startTime ? 'info' : 'warning',
      });
    } catch (error) {
      checks.push({
        name: 'Performance API',
        passed: false,
        message: 'Performance API no disponible',
        severity: 'warning',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    // Check modern JavaScript features
    try {
      // Test async/await, destructuring, arrow functions, etc.
      const testAsync = async () => {
        const obj = { a: 1, b: 2 };
        const { a, b } = obj;
        return [a, b].map(x => x * 2);
      };
      
      const result = await testAsync();
      
      checks.push({
        name: 'Modern JavaScript Features',
        passed: Array.isArray(result) && result.length === 2,
        message: Array.isArray(result) && result.length === 2
          ? 'Características modernas de JavaScript disponibles'
          : 'Problemas con características modernas de JavaScript',
        severity: Array.isArray(result) && result.length === 2 ? 'info' : 'warning',
      });
    } catch (error) {
      checks.push({
        name: 'Modern JavaScript Features',
        passed: false,
        message: 'Características modernas de JavaScript no disponibles',
        severity: 'warning',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }

    return this.createValidationCategory('Compatibility', checks);
  }

  /**
   * Creates a validation category from checks
   */
  private static createValidationCategory(name: string, checks: ValidationCheck[]): ValidationCategory {
    const passedChecks = checks.filter(c => c.passed).length;
    const totalChecks = checks.length;
    const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
    
    const criticalFailed = checks.some(c => !c.passed && c.severity === 'critical');
    const errorFailed = checks.some(c => !c.passed && c.severity === 'error');
    const warningFailed = checks.some(c => !c.passed && c.severity === 'warning');
    
    let status: ValidationCategory['status'];
    if (criticalFailed) {
      status = 'critical';
    } else if (errorFailed) {
      status = 'warning';
    } else if (warningFailed || score < 80) {
      status = 'warning';
    } else if (score < 95) {
      status = 'good';
    } else {
      status = 'excellent';
    }

    return {
      name,
      score,
      status,
      checks,
    };
  }

  /**
   * Calculates overall system score
   */
  private static calculateOverallScore(categories: Record<string, ValidationCategory>): number {
    const scores = Object.values(categories).map(c => c.score);
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  /**
   * Generates recommendations based on validation results
   */
  private static generateRecommendations(categories: Record<string, ValidationCategory>): string[] {
    const recommendations: string[] = [];

    Object.values(categories).forEach(category => {
      const failedChecks = category.checks.filter(c => !c.passed);
      
      failedChecks.forEach(check => {
        switch (check.severity) {
          case 'critical':
            recommendations.push(`CRÍTICO: ${check.message} - Requiere atención inmediata`);
            break;
          case 'error':
            recommendations.push(`ERROR: ${check.message} - Debe corregirse antes de producción`);
            break;
          case 'warning':
            recommendations.push(`ADVERTENCIA: ${check.message} - Considere corregir para mejor rendimiento`);
            break;
        }
      });
    });

    // Add general recommendations based on scores
    const overallScore = this.calculateOverallScore(categories);
    
    if (overallScore < 70) {
      recommendations.push('El sistema requiere mejoras significativas antes de ser usado en producción');
    } else if (overallScore < 85) {
      recommendations.push('El sistema está funcional pero se recomiendan mejoras para optimizar la experiencia');
    } else if (overallScore < 95) {
      recommendations.push('El sistema está en buen estado, considere las mejoras menores sugeridas');
    } else {
      recommendations.push('El sistema está en excelente estado y listo para producción');
    }

    return recommendations;
  }

  /**
   * Extracts critical issues that must be addressed
   */
  private static extractCriticalIssues(categories: Record<string, ValidationCategory>): string[] {
    const criticalIssues: string[] = [];

    Object.values(categories).forEach(category => {
      const criticalChecks = category.checks.filter(c => !c.passed && c.severity === 'critical');
      criticalChecks.forEach(check => {
        criticalIssues.push(`${category.name}: ${check.message}`);
      });
    });

    return criticalIssues;
  }

  /**
   * Performs a quick health check
   */
  static async quickHealthCheck(): Promise<{
    isHealthy: boolean;
    issues: string[];
    score: number;
  }> {
    try {
      // Quick checks for essential functionality
      const issues: string[] = [];
      let healthyChecks = 0;
      const totalChecks = 4;

      // Check localStorage
      try {
        localStorage.setItem('health-check', 'test');
        localStorage.removeItem('health-check');
        healthyChecks++;
      } catch {
        issues.push('LocalStorage no disponible');
      }

      // Check demo data
      try {
        const demoValidation = await DemoInitializationService.validateDemoData();
        if (demoValidation.isValid) {
          healthyChecks++;
        } else {
          issues.push('Datos de demostración no válidos');
        }
      } catch {
        issues.push('Error al validar datos de demostración');
      }

      // Check constructor store
      try {
        const store = useConstructorStore.getState();
        if (typeof store.setCurrentConfig === 'function') {
          healthyChecks++;
        } else {
          issues.push('Constructor store no funcional');
        }
      } catch {
        issues.push('Error en constructor store');
      }

      // Check persistence
      try {
        const testConfig = {
          id: 'health-test',
          name: 'Health Test',
          spaces: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        } as ReportConfig;

        const result = await ReportPersistenceService.saveConfig(testConfig);
        if (result.success) {
          healthyChecks++;
          await ReportPersistenceService.deleteConfig();
        } else {
          issues.push('Persistencia no funcional');
        }
      } catch {
        issues.push('Error en persistencia');
      }

      const score = Math.round((healthyChecks / totalChecks) * 100);
      const isHealthy = score >= 75;

      return {
        isHealthy,
        issues,
        score,
      };
    } catch (error) {
      return {
        isHealthy: false,
        issues: [`Error crítico en health check: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        score: 0,
      };
    }
  }
}