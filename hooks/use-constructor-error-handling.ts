'use client';

import { useState, useCallback } from 'react';
import { 
  errorRecoveryService, 
  createErrorContext, 
  RecoveryPlan, 
  RecoveryAction,
  ErrorContext 
} from '@/lib/services/error-recovery';
import { useConstructorStore } from '@/lib/state/constructor';
import { constructorLogger } from '@/lib/services/logging';

interface ErrorHandlingState {
  currentError: Error | null;
  recoveryPlan: RecoveryPlan | null;
  isRecovering: boolean;
  showRecoveryDialog: boolean;
}

interface ErrorHandlingActions {
  handleError: (operation: string, error: Error, context?: Partial<ErrorContext>) => void;
  executeRecoveryAction: (action: RecoveryAction) => Promise<void>;
  dismissError: () => void;
  retryLastOperation: () => Promise<void>;
  // Enhanced store methods
  saveConfig: () => Promise<void>;
  loadConfig: (configId: string) => Promise<void>;
  loadClientConfig: (clientId?: string) => Promise<void>;
  addComponent: (spaceId: string, columnIndex: number, component: any) => void;
  removeComponent: (componentId: string) => void;
  updateComponent: (componentId: string, updates: any) => void;
  triggerAutoSave: () => Promise<void>;
}

export const useConstructorErrorHandling = (): ErrorHandlingState & ErrorHandlingActions => {
  const [state, setState] = useState<ErrorHandlingState>({
    currentError: null,
    recoveryPlan: null,
    isRecovering: false,
    showRecoveryDialog: false,
  });

  const {
    saveConfig,
    loadConfig,
    loadClientConfig,
    validateConfig,
    addComponent,
    removeComponent,
    updateComponent,
    clearError,
    triggerAutoSave,
  } = useConstructorStore();

  const [lastOperation, setLastOperation] = useState<{
    operation: string;
    args: any[];
    context?: Partial<ErrorContext>;
  } | null>(null);

  const handleError = useCallback((
    operation: string, 
    error: Error, 
    context?: Partial<ErrorContext>
  ) => {
    const errorContext = createErrorContext(operation, error, context);
    const recoveryPlan = errorRecoveryService.generateRecoveryPlan(errorContext);

    setState({
      currentError: error,
      recoveryPlan,
      isRecovering: false,
      showRecoveryDialog: true,
    });

    constructorLogger.error('error-handling', `Handling error in ${operation}`, {
      error: error.message,
      recoveryActionsCount: recoveryPlan.actions.length,
      recommendedAction: recoveryPlan.recommendedAction,
    });
  }, []);

  const executeRecoveryAction = useCallback(async (action: RecoveryAction) => {
    setState(prev => ({ ...prev, isRecovering: true }));

    try {
      constructorLogger.info('error-recovery', `Executing recovery action: ${action.id}`, {
        strategy: action.strategy,
        isDestructive: action.isDestructive,
      });

      // Handle built-in recovery actions
      switch (action.id) {
        case 'retry-save':
          await saveConfig();
          break;

        case 'retry-load':
          if (state.recoveryPlan?.context.configId) {
            await loadConfig(state.recoveryPlan.context.configId);
          }
          break;

        case 'validate-before-save':
          validateConfig();
          break;

        case 'disable-auto-save':
          useConstructorStore.getState().disableAutoSave();
          break;

        case 'manual-save':
          await saveConfig();
          break;

        case 'create-new':
          useConstructorStore.getState().createNewConfig();
          break;

        case 'refresh-page':
          window.location.reload();
          break;

        case 'retry':
          if (lastOperation) {
            await retryLastOperation();
          }
          break;

        default:
          // Execute custom action
          await action.execute();
          break;
      }

      // Clear error state on successful recovery
      setState({
        currentError: null,
        recoveryPlan: null,
        isRecovering: false,
        showRecoveryDialog: false,
      });

      clearError();

      constructorLogger.info('error-recovery', `Recovery action completed successfully: ${action.id}`);

    } catch (recoveryError) {
      constructorLogger.error('error-recovery', `Recovery action failed: ${action.id}`, {
        error: recoveryError instanceof Error ? recoveryError.message : recoveryError,
      });

      // If recovery fails, show new recovery options
      if (recoveryError instanceof Error) {
        handleError(`recovery-${action.id}`, recoveryError, {
          ...state.recoveryPlan?.context,
          retryCount: (state.recoveryPlan?.context.retryCount || 0) + 1,
        });
      }
    } finally {
      setState(prev => ({ ...prev, isRecovering: false }));
    }
  }, [state.recoveryPlan, lastOperation, saveConfig, loadConfig, validateConfig, clearError, handleError]);

  const dismissError = useCallback(() => {
    setState({
      currentError: null,
      recoveryPlan: null,
      isRecovering: false,
      showRecoveryDialog: false,
    });
    clearError();
  }, [clearError]);

  const retryLastOperation = useCallback(async () => {
    if (!lastOperation) {
      throw new Error('No hay operación anterior para reintentar');
    }

    constructorLogger.info('error-recovery', `Retrying last operation: ${lastOperation.operation}`);

    switch (lastOperation.operation) {
      case 'config-save':
        await saveConfig();
        break;

      case 'config-load':
        if (lastOperation.args[0]) {
          await loadConfig(lastOperation.args[0]);
        }
        break;

      case 'client-config-load':
        if (lastOperation.args[0]) {
          await loadClientConfig(lastOperation.args[0]);
        }
        break;

      case 'component-add':
        const [spaceId, columnIndex, component] = lastOperation.args;
        addComponent(spaceId, columnIndex, component);
        break;

      case 'component-remove':
        removeComponent(lastOperation.args[0]);
        break;

      case 'component-update':
        const [componentId, updates] = lastOperation.args;
        updateComponent(componentId, updates);
        break;

      case 'auto-save':
        await triggerAutoSave();
        break;

      default:
        throw new Error(`Operación no soportada para reintentar: ${lastOperation.operation}`);
    }
  }, [lastOperation, saveConfig, loadConfig, loadClientConfig, addComponent, removeComponent, updateComponent, triggerAutoSave]);

  // Wrapper functions that track operations for retry capability
  const trackOperation = useCallback((operation: string, args: any[], context?: Partial<ErrorContext>) => {
    setLastOperation({ operation, args, context });
  }, []);

  // Enhanced store methods with error handling
  const enhancedSaveConfig = useCallback(async () => {
    trackOperation('config-save', []);
    try {
      await saveConfig();
    } catch (error) {
      if (error instanceof Error) {
        handleError('config-save', error);
      }
      throw error;
    }
  }, [saveConfig, trackOperation, handleError]);

  const enhancedLoadConfig = useCallback(async (configId: string) => {
    trackOperation('config-load', [configId]);
    try {
      await loadConfig(configId);
    } catch (error) {
      if (error instanceof Error) {
        handleError('config-load', error, { configId });
      }
      throw error;
    }
  }, [loadConfig, trackOperation, handleError]);

  const enhancedLoadClientConfig = useCallback(async (clientId?: string) => {
    trackOperation('client-config-load', [clientId]);
    try {
      await loadClientConfig(clientId);
    } catch (error) {
      if (error instanceof Error) {
        handleError('client-config-load', error, { configId: clientId });
      }
      throw error;
    }
  }, [loadClientConfig, trackOperation, handleError]);

  const enhancedAddComponent = useCallback((spaceId: string, columnIndex: number, component: any) => {
    trackOperation('component-add', [spaceId, columnIndex, component], { 
      spaceId, 
      componentId: component.id 
    });
    try {
      addComponent(spaceId, columnIndex, component);
    } catch (error) {
      if (error instanceof Error) {
        handleError('component-add', error, { 
          spaceId, 
          componentId: component.id 
        });
      }
      throw error;
    }
  }, [addComponent, trackOperation, handleError]);

  const enhancedRemoveComponent = useCallback((componentId: string) => {
    trackOperation('component-remove', [componentId], { componentId });
    try {
      removeComponent(componentId);
    } catch (error) {
      if (error instanceof Error) {
        handleError('component-remove', error, { componentId });
      }
      throw error;
    }
  }, [removeComponent, trackOperation, handleError]);

  const enhancedUpdateComponent = useCallback((componentId: string, updates: any) => {
    trackOperation('component-update', [componentId, updates], { componentId });
    try {
      updateComponent(componentId, updates);
    } catch (error) {
      if (error instanceof Error) {
        handleError('component-update', error, { componentId });
      }
      throw error;
    }
  }, [updateComponent, trackOperation, handleError]);

  const enhancedTriggerAutoSave = useCallback(async () => {
    trackOperation('auto-save', []);
    try {
      await triggerAutoSave();
    } catch (error) {
      if (error instanceof Error) {
        handleError('auto-save', error);
      }
      // Don't re-throw auto-save errors to avoid disrupting user workflow
    }
  }, [triggerAutoSave, trackOperation, handleError]);

  return {
    // State
    currentError: state.currentError,
    recoveryPlan: state.recoveryPlan,
    isRecovering: state.isRecovering,
    showRecoveryDialog: state.showRecoveryDialog,

    // Actions
    handleError,
    executeRecoveryAction,
    dismissError,
    retryLastOperation,

    // Enhanced store methods (these can be used instead of direct store methods)
    saveConfig: enhancedSaveConfig,
    loadConfig: enhancedLoadConfig,
    loadClientConfig: enhancedLoadClientConfig,
    addComponent: enhancedAddComponent,
    removeComponent: enhancedRemoveComponent,
    updateComponent: enhancedUpdateComponent,
    triggerAutoSave: enhancedTriggerAutoSave,
  };
};