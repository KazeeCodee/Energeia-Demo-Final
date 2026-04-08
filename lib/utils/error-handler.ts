import { ToastManager } from './toast';

export interface AppError extends Error {
  code?: string;
  context?: string;
  retryable?: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorHandler {
  private static errorQueue: AppError[] = [];
  private static maxQueueSize = 100;

  // Global error handler for unhandled errors
  static initialize() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = this.createAppError(event.reason, {
        context: 'unhandled_promise_rejection',
        severity: 'high',
      });
      this.handleError(error);
      event.preventDefault(); // Prevent console logging
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      const error = this.createAppError(event.error || new Error(event.message), {
        context: 'javascript_error',
        severity: 'high',
      });
      this.handleError(error);
    });

    console.log('Global error handler initialized');
  }

  // Create standardized error object
  static createAppError(
    error: unknown, 
    options: {
      code?: string;
      context?: string;
      retryable?: boolean;
      severity?: AppError['severity'];
    } = {}
  ): AppError {
    let appError: AppError;

    if (error instanceof Error) {
      appError = error as AppError;
    } else if (typeof error === 'string') {
      appError = new Error(error) as AppError;
    } else {
      appError = new Error('Unknown error occurred') as AppError;
    }

    // Add metadata
    appError.code = options.code || 'UNKNOWN_ERROR';
    appError.context = options.context || 'unknown';
    appError.retryable = options.retryable ?? false;
    appError.severity = options.severity || 'medium';

    return appError;
  }

  // Main error handling method
  static handleError(error: AppError | Error | unknown, showToast = true): void {
    const appError = error instanceof Error ? error as AppError : this.createAppError(error);
    
    // Add to error queue
    this.addToQueue(appError);
    
    // Log error
    this.logError(appError);
    
    // Show user notification based on severity
    if (showToast) {
      this.showErrorNotification(appError);
    }
    
    // Report to external service (in a real app)
    this.reportError(appError);
  }

  // Add error to queue for tracking
  private static addToQueue(error: AppError): void {
    this.errorQueue.push(error);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  // Log error to localStorage and console
  private static logError(error: AppError): void {
    const errorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      code: error.code,
      context: error.context,
      severity: error.severity,
      retryable: error.retryable,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console based on severity
    switch (error.severity) {
      case 'critical':
        console.error('CRITICAL ERROR:', errorLog);
        break;
      case 'high':
        console.error('HIGH SEVERITY ERROR:', errorLog);
        break;
      case 'medium':
        console.warn('MEDIUM SEVERITY ERROR:', errorLog);
        break;
      case 'low':
        console.info('LOW SEVERITY ERROR:', errorLog);
        break;
      default:
        console.error('ERROR:', errorLog);
    }

    // Store in localStorage
    try {
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 100 errors
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('error_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to store error log:', e);
    }
  }

  // Show appropriate user notification
  private static showErrorNotification(error: AppError): void {
    const message = this.getUserFriendlyMessage(error);
    
    switch (error.severity) {
      case 'critical':
        ToastManager.error(message, {
          duration: 0, // Don't auto-dismiss
          action: error.retryable ? {
            label: 'Reintentar',
            onClick: () => window.location.reload(),
          } : undefined,
        });
        break;
        
      case 'high':
        ToastManager.error(message, {
          duration: 8000,
          action: error.retryable ? {
            label: 'Reintentar',
            onClick: () => window.location.reload(),
          } : undefined,
        });
        break;
        
      case 'medium':
        ToastManager.warning(message, { duration: 5000 });
        break;
        
      case 'low':
        ToastManager.info(message, { duration: 3000 });
        break;
        
      default:
        ToastManager.error(message);
    }
  }

  // Convert technical errors to user-friendly messages
  private static getUserFriendlyMessage(error: AppError): string {
    // Context-specific messages
    switch (error.context) {
      case 'auth':
        return 'Error de autenticación. Por favor, inicia sesión nuevamente.';
      case 'network':
        return 'Error de conexión. Verifica tu conexión a internet.';
      case 'data_fetch':
        return 'Error al cargar datos. Intenta nuevamente.';
      case 'file_upload':
        return 'Error al subir archivo. Verifica el formato y tamaño.';
      case 'reports':
        return 'Error al generar informe. Los datos pueden estar incompletos.';
      case 'charts':
        return 'Error al mostrar gráfico. Intenta recargar la página.';
      case 'user_operation':
        return 'Error en la operación de usuario. Intenta nuevamente.';
      case 'processing':
        return 'Error en el procesamiento. Revisa los datos de entrada.';
      default:
        break;
    }

    // Code-specific messages
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return 'Los datos ingresados no son válidos.';
      case 'PERMISSION_DENIED':
        return 'No tienes permisos para realizar esta acción.';
      case 'RESOURCE_NOT_FOUND':
        return 'El recurso solicitado no fue encontrado.';
      case 'TIMEOUT_ERROR':
        return 'La operación tardó demasiado tiempo. Intenta nuevamente.';
      case 'QUOTA_EXCEEDED':
        return 'Se ha excedido el límite permitido.';
      default:
        break;
    }

    // Fallback to original message or generic message
    return error.message || 'Se produjo un error inesperado.';
  }

  // Report error to external service (mock implementation)
  private static reportError(error: AppError): void {
    // In a real application, this would send to an error tracking service
    // like Sentry, Bugsnag, or custom analytics
    
    if (error.severity === 'critical' || error.severity === 'high') {
      console.log('Would report to error tracking service:', {
        message: error.message,
        code: error.code,
        context: error.context,
        severity: error.severity,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get error statistics
  static getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byContext: Record<string, number>;
    recent: AppError[];
  } {
    const bySeverity: Record<string, number> = {};
    const byContext: Record<string, number> = {};

    this.errorQueue.forEach(error => {
      bySeverity[error.severity || 'unknown'] = (bySeverity[error.severity || 'unknown'] || 0) + 1;
      byContext[error.context || 'unknown'] = (byContext[error.context || 'unknown'] || 0) + 1;
    });

    return {
      total: this.errorQueue.length,
      bySeverity,
      byContext,
      recent: this.errorQueue.slice(-10), // Last 10 errors
    };
  }

  // Clear error queue
  static clearErrors(): void {
    this.errorQueue = [];
    localStorage.removeItem('error_logs');
  }

  // Specific error handlers for common scenarios
  static handleAuthError(error: unknown): void {
    const appError = this.createAppError(error, {
      context: 'auth',
      code: 'AUTH_ERROR',
      severity: 'high',
      retryable: true,
    });
    this.handleError(appError);
  }

  static handleNetworkError(error: unknown): void {
    const appError = this.createAppError(error, {
      context: 'network',
      code: 'NETWORK_ERROR',
      severity: 'medium',
      retryable: true,
    });
    this.handleError(appError);
  }

  static handleValidationError(error: unknown, field?: string): void {
    const appError = this.createAppError(error, {
      context: 'validation',
      code: 'VALIDATION_ERROR',
      severity: 'low',
      retryable: false,
    });
    
    if (field) {
      appError.message = `Error de validación en ${field}: ${appError.message}`;
    }
    
    this.handleError(appError);
  }

  static handleDataError(error: unknown): void {
    const appError = this.createAppError(error, {
      context: 'data_fetch',
      code: 'DATA_ERROR',
      severity: 'medium',
      retryable: true,
    });
    this.handleError(appError);
  }

  static handleProcessingError(error: unknown): void {
    const appError = this.createAppError(error, {
      context: 'processing',
      code: 'PROCESSING_ERROR',
      severity: 'high',
      retryable: true,
    });
    this.handleError(appError);
  }
}

// Convenience functions
export const handleError = ErrorHandler.handleError.bind(ErrorHandler);
export const handleAuthError = ErrorHandler.handleAuthError.bind(ErrorHandler);
export const handleNetworkError = ErrorHandler.handleNetworkError.bind(ErrorHandler);
export const handleValidationError = ErrorHandler.handleValidationError.bind(ErrorHandler);
export const handleDataError = ErrorHandler.handleDataError.bind(ErrorHandler);
export const handleProcessingError = ErrorHandler.handleProcessingError.bind(ErrorHandler);

// React hook for error handling
export function useErrorHandler() {
  return {
    handleError: ErrorHandler.handleError.bind(ErrorHandler),
    handleAuthError: ErrorHandler.handleAuthError.bind(ErrorHandler),
    handleNetworkError: ErrorHandler.handleNetworkError.bind(ErrorHandler),
    handleValidationError: ErrorHandler.handleValidationError.bind(ErrorHandler),
    handleDataError: ErrorHandler.handleDataError.bind(ErrorHandler),
    handleProcessingError: ErrorHandler.handleProcessingError.bind(ErrorHandler),
    getErrorStats: ErrorHandler.getErrorStats.bind(ErrorHandler),
    clearErrors: ErrorHandler.clearErrors.bind(ErrorHandler),
  };
}