/**
 * Error recovery service for constructor operations
 */

import { ReportConfig } from '../types/constructor';
import { constructorLogger } from './logging';

export type RecoveryStrategy = 'retry' | 'fallback' | 'reset' | 'ignore';

export interface RecoveryAction {
  id: string;
  label: string;
  description: string;
  strategy: RecoveryStrategy;
  execute: () => Promise<void> | void;
  isDestructive?: boolean;
}

export interface ErrorContext {
  operation: string;
  error: Error;
  timestamp: Date;
  configId?: string;
  componentId?: string;
  spaceId?: string;
  retryCount?: number;
}

export interface RecoveryPlan {
  context: ErrorContext;
  actions: RecoveryAction[];
  recommendedAction?: string;
}

class ErrorRecoveryService {
  private recoveryHistory: ErrorContext[] = [];
  private maxHistorySize = 50;

  /**
   * Generate recovery plan for a given error context
   */
  generateRecoveryPlan(context: ErrorContext): RecoveryPlan {
    const actions: RecoveryAction[] = [];
    let recommendedAction: string | undefined;

    // Log the error
    constructorLogger.error('error-recovery', `Error in ${context.operation}`, {
      error: context.error.message,
      configId: context.configId,
      componentId: context.componentId,
      spaceId: context.spaceId,
      retryCount: context.retryCount,
    });

    // Add to history
    this.addToHistory(context);

    // Generate recovery actions based on error type and operation
    switch (context.operation) {
      case 'config-save':
        actions.push(...this.getConfigSaveRecoveryActions(context));
        recommendedAction = 'retry-save';
        break;

      case 'config-load':
        actions.push(...this.getConfigLoadRecoveryActions(context));
        recommendedAction = 'retry-load';
        break;

      case 'component-add':
        actions.push(...this.getComponentAddRecoveryActions(context));
        recommendedAction = 'fix-validation';
        break;

      case 'validation':
        actions.push(...this.getValidationRecoveryActions(context));
        recommendedAction = 'fix-errors';
        break;

      case 'auto-save':
        actions.push(...this.getAutoSaveRecoveryActions(context));
        recommendedAction = 'disable-auto-save';
        break;

      case 'drag-drop':
        actions.push(...this.getDragDropRecoveryActions(context));
        recommendedAction = 'reset-drag';
        break;

      default:
        actions.push(...this.getGenericRecoveryActions(context));
        recommendedAction = 'retry';
        break;
    }

    return {
      context,
      actions,
      recommendedAction,
    };
  }

  private getConfigSaveRecoveryActions(context: ErrorContext): RecoveryAction[] {
    return [
      {
        id: 'retry-save',
        label: 'Reintentar guardado',
        description: 'Intentar guardar la configuración nuevamente',
        strategy: 'retry',
        execute: async () => {
          // This will be implemented by the component using this service
          throw new Error('Retry action must be implemented by caller');
        },
      },
      {
        id: 'validate-before-save',
        label: 'Validar y corregir',
        description: 'Ejecutar validación completa y mostrar errores para corregir',
        strategy: 'fallback',
        execute: async () => {
          // This will be implemented by the component using this service
          throw new Error('Validation action must be implemented by caller');
        },
      },
      {
        id: 'save-as-draft',
        label: 'Guardar como borrador',
        description: 'Guardar en almacenamiento local como borrador',
        strategy: 'fallback',
        execute: async () => {
          // This will be implemented by the component using this service
          throw new Error('Draft save action must be implemented by caller');
        },
      },
      {
        id: 'export-config',
        label: 'Exportar configuración',
        description: 'Descargar la configuración como archivo JSON',
        strategy: 'fallback',
        execute: async () => {
          // This will be implemented by the component using this service
          throw new Error('Export action must be implemented by caller');
        },
      },
    ];
  }

  private getConfigLoadRecoveryActions(context: ErrorContext): RecoveryAction[] {
    return [
      {
        id: 'retry-load',
        label: 'Reintentar carga',
        description: 'Intentar cargar la configuración nuevamente',
        strategy: 'retry',
        execute: async () => {
          throw new Error('Retry load action must be implemented by caller');
        },
      },
      {
        id: 'load-backup',
        label: 'Cargar respaldo',
        description: 'Intentar cargar desde respaldo automático',
        strategy: 'fallback',
        execute: async () => {
          throw new Error('Load backup action must be implemented by caller');
        },
      },
      {
        id: 'create-new',
        label: 'Crear nueva configuración',
        description: 'Crear una configuración nueva desde cero',
        strategy: 'reset',
        execute: async () => {
          throw new Error('Create new action must be implemented by caller');
        },
      },
      {
        id: 'load-template',
        label: 'Cargar plantilla',
        description: 'Cargar una plantilla predefinida',
        strategy: 'fallback',
        execute: async () => {
          throw new Error('Load template action must be implemented by caller');
        },
      },
    ];
  }

  private getComponentAddRecoveryActions(context: ErrorContext): RecoveryAction[] {
    return [
      {
        id: 'fix-validation',
        label: 'Corregir errores',
        description: 'Mostrar y corregir errores de validación',
        strategy: 'fallback',
        execute: async () => {
          throw new Error('Fix validation action must be implemented by caller');
        },
      },
      {
        id: 'try-different-position',
        label: 'Probar otra posición',
        description: 'Intentar colocar el componente en otra posición disponible',
        strategy: 'fallback',
        execute: async () => {
          throw new Error('Try different position action must be implemented by caller');
        },
      },
      {
        id: 'configure-component',
        label: 'Configurar componente',
        description: 'Abrir panel de configuración para ajustar el componente',
        strategy: 'fallback',
        execute: async () => {
          throw new Error('Configure component action must be implemented by caller');
        },
      },
      {
        id: 'cancel-add',
        label: 'Cancelar',
        description: 'Cancelar la adición del componente',
        strategy: 'ignore',
        execute: () => {
          // No action needed, just dismiss
        },
      },
    ];
  }

  private getValidationRecoveryActions(context: ErrorContext): RecoveryAction[] {
    return [
      {
        id: 'fix-errors',
        label: 'Corregir errores',
        description: 'Ir a los errores y corregirlos uno por uno',
        strategy: 'fallback',
        execute: async () => {
          throw new Error('Fix errors action must be implemented by caller');
        },
      },
      {
        id: 'ignore-warnings',
        label: 'Ignorar advertencias',
        description: 'Continuar ignorando las advertencias no críticas',
        strategy: 'ignore',
        execute: () => {
          // No action needed
        },
      },
      {
        id: 'reset-config',
        label: 'Reiniciar configuración',
        description: 'Volver a una configuración válida anterior',
        strategy: 'reset',
        isDestructive: true,
        execute: async () => {
          throw new Error('Reset config action must be implemented by caller');
        },
      },
    ];
  }

  private getAutoSaveRecoveryActions(context: ErrorContext): RecoveryAction[] {
    return [
      {
        id: 'disable-auto-save',
        label: 'Desactivar auto-guardado',
        description: 'Desactivar el auto-guardado para evitar errores repetidos',
        strategy: 'fallback',
        execute: async () => {
          throw new Error('Disable auto-save action must be implemented by caller');
        },
      },
      {
        id: 'manual-save',
        label: 'Guardar manualmente',
        description: 'Intentar un guardado manual',
        strategy: 'retry',
        execute: async () => {
          throw new Error('Manual save action must be implemented by caller');
        },
      },
      {
        id: 'ignore-auto-save-error',
        label: 'Ignorar error',
        description: 'Continuar trabajando sin auto-guardado',
        strategy: 'ignore',
        execute: () => {
          // No action needed
        },
      },
    ];
  }

  private getDragDropRecoveryActions(context: ErrorContext): RecoveryAction[] {
    return [
      {
        id: 'reset-drag',
        label: 'Reiniciar arrastre',
        description: 'Cancelar la operación de arrastre actual',
        strategy: 'reset',
        execute: () => {
          // Reset drag state
        },
      },
      {
        id: 'try-manual-add',
        label: 'Añadir manualmente',
        description: 'Usar el panel de componentes para añadir manualmente',
        strategy: 'fallback',
        execute: async () => {
          throw new Error('Manual add action must be implemented by caller');
        },
      },
    ];
  }

  private getGenericRecoveryActions(context: ErrorContext): RecoveryAction[] {
    return [
      {
        id: 'retry',
        label: 'Reintentar',
        description: 'Intentar la operación nuevamente',
        strategy: 'retry',
        execute: async () => {
          throw new Error('Retry action must be implemented by caller');
        },
      },
      {
        id: 'refresh-page',
        label: 'Recargar página',
        description: 'Recargar la página para reiniciar el estado',
        strategy: 'reset',
        isDestructive: true,
        execute: () => {
          window.location.reload();
        },
      },
      {
        id: 'report-error',
        label: 'Reportar error',
        description: 'Reportar este error al equipo de desarrollo',
        strategy: 'ignore',
        execute: () => {
          // This would integrate with error reporting service
          console.error('Error reported:', context);
        },
      },
    ];
  }

  private addToHistory(context: ErrorContext): void {
    this.recoveryHistory.unshift(context);
    
    // Keep only recent history
    if (this.recoveryHistory.length > this.maxHistorySize) {
      this.recoveryHistory = this.recoveryHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get error patterns to help identify recurring issues
   */
  getErrorPatterns(): Array<{
    operation: string;
    errorType: string;
    count: number;
    lastOccurrence: Date;
  }> {
    const patterns = new Map<string, { count: number; lastOccurrence: Date }>();

    this.recoveryHistory.forEach(context => {
      const key = `${context.operation}:${context.error.name}`;
      const existing = patterns.get(key);
      
      if (existing) {
        existing.count++;
        if (context.timestamp > existing.lastOccurrence) {
          existing.lastOccurrence = context.timestamp;
        }
      } else {
        patterns.set(key, {
          count: 1,
          lastOccurrence: context.timestamp,
        });
      }
    });

    return Array.from(patterns.entries()).map(([key, data]) => {
      const [operation, errorType] = key.split(':');
      return {
        operation,
        errorType,
        ...data,
      };
    }).sort((a, b) => b.count - a.count);
  }

  /**
   * Check if an error is recurring
   */
  isRecurringError(context: ErrorContext): boolean {
    const recentErrors = this.recoveryHistory
      .filter(h => h.operation === context.operation)
      .filter(h => h.error.name === context.error.name)
      .filter(h => Date.now() - h.timestamp.getTime() < 5 * 60 * 1000); // Last 5 minutes

    return recentErrors.length >= 3;
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.recoveryHistory = [];
    constructorLogger.info('error-recovery', 'Error history cleared');
  }

  /**
   * Get recovery statistics
   */
  getStats(): {
    totalErrors: number;
    errorsByOperation: Record<string, number>;
    errorsByType: Record<string, number>;
    recentErrors: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    const errorsByOperation = this.recoveryHistory.reduce((acc, context) => {
      acc[context.operation] = (acc[context.operation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorsByType = this.recoveryHistory.reduce((acc, context) => {
      acc[context.error.name] = (acc[context.error.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentErrors = this.recoveryHistory.filter(
      context => context.timestamp.getTime() > oneHourAgo
    ).length;

    return {
      totalErrors: this.recoveryHistory.length,
      errorsByOperation,
      errorsByType,
      recentErrors,
    };
  }
}

// Singleton instance
export const errorRecoveryService = new ErrorRecoveryService();

// Convenience function to create error context
export const createErrorContext = (
  operation: string,
  error: Error,
  additionalContext?: Partial<ErrorContext>
): ErrorContext => ({
  operation,
  error,
  timestamp: new Date(),
  ...additionalContext,
});

// Hook for React components
export const useErrorRecovery = () => {
  return {
    generateRecoveryPlan: errorRecoveryService.generateRecoveryPlan.bind(errorRecoveryService),
    isRecurringError: errorRecoveryService.isRecurringError.bind(errorRecoveryService),
    getErrorPatterns: errorRecoveryService.getErrorPatterns.bind(errorRecoveryService),
    clearHistory: errorRecoveryService.clearHistory.bind(errorRecoveryService),
    getStats: errorRecoveryService.getStats.bind(errorRecoveryService),
  };
};