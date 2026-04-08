import { 
  SimulationManager, 
  RetryManager, 
  CircuitBreaker, 
  RealisticDataGenerator,
  SimulationMonitor,
  SimulationState
} from '../mock/simulators/delays';
import { ToastManager } from '../utils/toast';
import { SimulationError } from '../types';

// Centralized simulation service
export class SimulationService {
  private static circuitBreakers = new Map<string, CircuitBreaker>();
  
  // Initialize simulation environment
  static initialize() {
    // Set up default patterns based on environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      SimulationManager.setPattern('fast');
      SimulationState.enableDebugMode();
    } else {
      SimulationManager.setPattern('normal');
    }
    
    // Update seasonal patterns
    SimulationManager.updateSeasonalMultiplier();
    
    SimulationState.log('Simulation service initialized');
  }

  // Get or create circuit breaker for operation
  private static getCircuitBreaker(operationName: string): CircuitBreaker {
    if (!this.circuitBreakers.has(operationName)) {
      this.circuitBreakers.set(operationName, new CircuitBreaker());
    }
    return this.circuitBreakers.get(operationName)!;
  }

  // Execute operation with full simulation features
  static async executeOperation<T>(
    operation: () => Promise<T>,
    options: {
      operationName: string;
      pattern?: 'instant' | 'fast' | 'normal' | 'slow' | 'heavy';
      useRetry?: boolean;
      useCircuitBreaker?: boolean;
      showToast?: boolean;
      toastMessages?: {
        loading?: string;
        success?: string;
        error?: string;
      };
    }
  ): Promise<T> {
    const { 
      operationName, 
      pattern, 
      useRetry = true, 
      useCircuitBreaker = false,
      showToast = false,
      toastMessages = {}
    } = options;

    const endMonitoring = SimulationMonitor.startOperation(operationName);
    let toastId: string | number | undefined;

    try {
      // Show loading toast if requested
      if (showToast && toastMessages.loading) {
        const result = ToastManager.loading(toastMessages.loading);
        toastId = typeof result === 'object' && result && 'unwrap' in result ? undefined : result;
      }

      // Apply simulation pattern if specified
      if (pattern) {
        SimulationManager.setPattern(pattern);
      }

      // Wrap operation with simulation delay
      const simulatedOperation = async () => {
        await SimulationManager.delay();
        return await operation();
      };

      let result: T;

      // Apply circuit breaker if requested
      if (useCircuitBreaker) {
        const circuitBreaker = this.getCircuitBreaker(operationName);
        
        if (useRetry) {
          result = await circuitBreaker.execute(() => 
            RetryManager.withRetry(simulatedOperation)
          );
        } else {
          result = await circuitBreaker.execute(simulatedOperation);
        }
      } else if (useRetry) {
        result = await RetryManager.withRetry(simulatedOperation);
      } else {
        result = await simulatedOperation();
      }

      // Show success toast
      if (showToast) {
        if (toastId) ToastManager.dismiss(toastId);
        if (toastMessages.success) {
          ToastManager.success(toastMessages.success);
        }
      }

      endMonitoring();
      SimulationState.log(`Operation ${operationName} completed successfully`);
      
      return result;

    } catch (error) {
      endMonitoring();
      SimulationMonitor.recordError(operationName);

      // Show error toast
      if (showToast) {
        if (toastId) ToastManager.dismiss(toastId);
        const errorMessage = toastMessages.error || 'Error en la operación';
        ToastManager.error(errorMessage);
      }

      SimulationState.log(`Operation ${operationName} failed`, error);
      throw error;
    }
  }

  // Specialized methods for common operations
  static async simulateAuth(
    email: string, 
    password: string, 
    authType: 'login' | 'forgot-password' | 'set-password' = 'login'
  ) {
    return this.executeOperation(
      () => SimulationManager.simulateAuth(email, password, authType),
      {
        operationName: `auth_${authType}`,
        pattern: 'normal',
        useRetry: true,
        showToast: true,
        toastMessages: {
          loading: authType === 'login' ? 'Iniciando sesión...' : 'Procesando...',
          success: authType === 'login' ? 'Sesión iniciada correctamente' : 'Operación completada',
          error: 'Error de autenticación'
        }
      }
    );
  }

  static async simulateDataFetch<T>(
    dataFetcher: () => T | Promise<T>,
    operationName: string = 'data_fetch'
  ): Promise<T> {
    return this.executeOperation(
      async () => await dataFetcher(),
      {
        operationName,
        pattern: 'fast',
        useRetry: true,
        useCircuitBreaker: true,
      }
    );
  }

  static async simulateFileUpload(
    file: { name: string; size: number },
    onProgress?: (progress: number) => void
  ) {
    return this.executeOperation(
      () => SimulationManager.simulateFileUpload(file, onProgress),
      {
        operationName: 'file_upload',
        pattern: 'slow',
        useRetry: true,
        showToast: true,
        toastMessages: {
          loading: `Subiendo ${file.name}...`,
          success: `${file.name} subido correctamente`,
          error: `Error al subir ${file.name}`
        }
      }
    );
  }

  static async simulateProcessing(
    steps: string[],
    onStepUpdate?: (stepIndex: number, progress: number) => void
  ) {
    return this.executeOperation(
      () => SimulationManager.simulateProcessing(steps, onStepUpdate),
      {
        operationName: 'data_processing',
        pattern: 'heavy',
        useRetry: false, // Processing operations typically don't retry
        showToast: true,
        toastMessages: {
          loading: 'Procesando datos...',
          success: 'Procesamiento completado',
          error: 'Error en el procesamiento'
        }
      }
    );
  }

  static async simulateDownload(
    fileType: 'pdf' | 'csv' | 'xlsx',
    dataSize?: number
  ): Promise<string> {
    return this.executeOperation(
      () => SimulationManager.simulateDownload(fileType, dataSize),
      {
        operationName: 'file_download',
        pattern: 'normal',
        useRetry: true,
        showToast: true,
        toastMessages: {
          loading: `Preparando descarga ${fileType.toUpperCase()}...`,
          success: `Descarga ${fileType.toUpperCase()} lista`,
          error: `Error al generar archivo ${fileType.toUpperCase()}`
        }
      }
    );
  }

  static async simulateEmailSend(
    emailType: 'forgot-password' | 'user-created' | 'password-reset' = 'forgot-password',
    recipient?: string
  ) {
    return this.executeOperation(
      () => SimulationManager.simulateEmailSend(emailType),
      {
        operationName: 'email_send',
        pattern: 'normal',
        useRetry: true,
        showToast: true,
        toastMessages: {
          loading: 'Enviando email...',
          success: recipient ? `Email enviado a ${recipient}` : 'Email enviado correctamente',
          error: 'Error al enviar email'
        }
      }
    );
  }

  // Form operations
  static async simulateFormSubmission<T>(
    formData: any,
    operation: (data: any) => T | Promise<T>,
    operationName: string = 'form_submit'
  ): Promise<T> {
    return this.executeOperation(
      async () => await operation(formData),
      {
        operationName,
        pattern: 'normal',
        useRetry: false, // Form submissions typically don't auto-retry
        showToast: true,
        toastMessages: {
          loading: 'Guardando...',
          success: 'Datos guardados correctamente',
          error: 'Error al guardar datos'
        }
      }
    );
  }

  // User management operations
  static async simulateUserOperation(
    operation: () => Promise<any>,
    operationType: 'create' | 'update' | 'delete',
    userName?: string
  ) {
    const messages = {
      create: {
        loading: 'Creando usuario...',
        success: userName ? `Usuario ${userName} creado correctamente` : 'Usuario creado correctamente',
        error: 'Error al crear usuario'
      },
      update: {
        loading: 'Actualizando usuario...',
        success: userName ? `Usuario ${userName} actualizado correctamente` : 'Usuario actualizado correctamente',
        error: 'Error al actualizar usuario'
      },
      delete: {
        loading: 'Eliminando usuario...',
        success: userName ? `Usuario ${userName} eliminado correctamente` : 'Usuario eliminado correctamente',
        error: 'Error al eliminar usuario'
      }
    };

    return this.executeOperation(
      operation,
      {
        operationName: `user_${operationType}`,
        pattern: 'normal',
        useRetry: operationType !== 'delete', // Don't retry delete operations
        showToast: true,
        toastMessages: messages[operationType]
      }
    );
  }

  // Report operations
  static async simulateReportGeneration(
    reportType: string,
    filters?: any
  ) {
    return this.executeOperation(
      async () => {
        // Simulate report generation based on complexity
        const complexity = filters ? Object.keys(filters).length : 1;
        const delay = 1000 + (complexity * 500); // More filters = longer processing
        await SimulationManager.delay(delay);
        return { success: true, reportId: `report_${Date.now()}` };
      },
      {
        operationName: 'report_generation',
        pattern: 'slow',
        useRetry: true,
        showToast: true,
        toastMessages: {
          loading: `Generando informe ${reportType}...`,
          success: 'Informe generado correctamente',
          error: 'Error al generar informe'
        }
      }
    );
  }

  // Utility methods
  static getOperationMetrics(operationName?: string) {
    return SimulationMonitor.getMetrics(operationName);
  }

  static resetMetrics(operationName?: string) {
    SimulationMonitor.reset(operationName);
  }

  static getCircuitBreakerStatus(operationName: string) {
    const circuitBreaker = this.circuitBreakers.get(operationName);
    return circuitBreaker?.getState() || null;
  }

  static resetCircuitBreaker(operationName: string) {
    const circuitBreaker = this.circuitBreakers.get(operationName);
    circuitBreaker?.reset();
  }

  static setSimulationPattern(pattern: 'instant' | 'fast' | 'normal' | 'slow' | 'heavy') {
    SimulationManager.setPattern(pattern);
    SimulationState.log(`Simulation pattern changed to: ${pattern}`);
  }

  static getAvailablePatterns() {
    return SimulationManager.getAvailablePatterns();
  }

  static enableDebugMode() {
    SimulationState.enableDebugMode();
  }

  static disableDebugMode() {
    SimulationState.disableDebugMode();
  }

  static setGlobalSpeedMultiplier(multiplier: number) {
    SimulationState.setGlobalMultiplier(multiplier);
    SimulationState.log(`Global speed multiplier set to: ${multiplier}`);
  }
}

// React hooks for simulation
export function useSimulation() {
  return {
    executeOperation: SimulationService.executeOperation,
    simulateAuth: SimulationService.simulateAuth,
    simulateDataFetch: SimulationService.simulateDataFetch,
    simulateFileUpload: SimulationService.simulateFileUpload,
    simulateProcessing: SimulationService.simulateProcessing,
    simulateDownload: SimulationService.simulateDownload,
    simulateEmailSend: SimulationService.simulateEmailSend,
    simulateFormSubmission: SimulationService.simulateFormSubmission,
    simulateUserOperation: SimulationService.simulateUserOperation,
    simulateReportGeneration: SimulationService.simulateReportGeneration,
    
    // Utility methods
    getMetrics: SimulationService.getOperationMetrics,
    resetMetrics: SimulationService.resetMetrics,
    setPattern: SimulationService.setSimulationPattern,
    getPatterns: SimulationService.getAvailablePatterns,
    setSpeedMultiplier: SimulationService.setGlobalSpeedMultiplier,
  };
}

// Error handling utilities
export function handleSimulationError(error: unknown, context?: string): SimulationError {
  if (error && typeof error === 'object' && 'type' in error) {
    return error as SimulationError;
  }

  // Convert regular errors to simulation errors
  const message = error instanceof Error ? error.message : 'Error desconocido';
  
  return {
    type: 'network',
    message,
    code: `SIM_ERROR_${Date.now()}`,
    retryable: true,
  };
}

// Initialize simulation service
if (typeof window !== 'undefined') {
  SimulationService.initialize();
}