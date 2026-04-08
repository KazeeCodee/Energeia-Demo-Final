import { toast } from 'sonner';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export class ToastManager {
  private static defaultDuration = 5000;

  // Success notifications
  static success(message: string, options?: ToastOptions) {
    return toast.success(message, {
      duration: options?.duration || this.defaultDuration,
      dismissible: options?.dismissible ?? true,
      action: options?.action,
    });
  }

  // Error notifications
  static error(message: string, options?: ToastOptions) {
    return toast.error(message, {
      duration: options?.duration || this.defaultDuration,
      dismissible: options?.dismissible ?? true,
      action: options?.action,
    });
  }

  // Warning notifications
  static warning(message: string, options?: ToastOptions) {
    return toast.warning(message, {
      duration: options?.duration || this.defaultDuration,
      dismissible: options?.dismissible ?? true,
      action: options?.action,
    });
  }

  // Info notifications
  static info(message: string, options?: ToastOptions) {
    return toast.info(message, {
      duration: options?.duration || this.defaultDuration,
      dismissible: options?.dismissible ?? true,
      action: options?.action,
    });
  }

  // Loading notifications with promise handling
  static loading(message: string, promise?: Promise<unknown>) {
    if (promise) {
      return toast.promise(promise, {
        loading: message,
        success: 'Operación completada exitosamente',
        error: 'Error en la operación',
      });
    }
    return toast.loading(message);
  }

  // Custom notifications
  static custom(message: string, options?: ToastOptions & { type?: 'default' }) {
    return toast(message, {
      duration: options?.duration || this.defaultDuration,
      dismissible: options?.dismissible ?? true,
      action: options?.action,
    });
  }

  // Dismiss specific toast
  static dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  }

  // Dismiss all toasts
  static dismissAll() {
    toast.dismiss();
  }

  // Simulated operation notifications
  static async simulatedOperation<T>(
    operation: () => Promise<T>,
    messages: {
      loading: string;
      success: string;
      error?: string;
    },
    options?: ToastOptions
  ): Promise<T> {
    const loadingToast = this.loading(messages.loading);
    
    try {
      const result = await operation();
      if (typeof loadingToast === 'string' || typeof loadingToast === 'number') {
        toast.dismiss(loadingToast);
      }
      this.success(messages.success, options);
      return result;
    } catch (error) {
      if (typeof loadingToast === 'string' || typeof loadingToast === 'number') {
        toast.dismiss(loadingToast);
      }
      const errorMessage = messages.error || 'Error en la operación';
      this.error(errorMessage, {
        ...options,
        action: {
          label: 'Reintentar',
          onClick: () => this.simulatedOperation(operation, messages, options),
        },
      });
      throw error;
    }
  }

  // Authentication-specific notifications
  static authSuccess(message: string = 'Sesión iniciada correctamente') {
    return this.success(message, { duration: 3000 });
  }

  static authError(message: string = 'Error de autenticación') {
    return this.error(message, { duration: 6000 });
  }

  static authLogout(message: string = 'Sesión cerrada') {
    return this.info(message, { duration: 2000 });
  }

  // File operation notifications
  static fileUploadStart(fileName: string) {
    return this.loading(`Subiendo ${fileName}...`);
  }

  static fileUploadSuccess(fileName: string) {
    return this.success(`${fileName} subido correctamente`);
  }

  static fileUploadError(fileName: string, error?: string) {
    return this.error(`Error al subir ${fileName}${error ? `: ${error}` : ''}`);
  }

  static downloadStart(fileType: string) {
    return this.loading(`Preparando descarga ${fileType.toUpperCase()}...`);
  }

  static downloadReady(fileType: string) {
    return this.success(`Descarga ${fileType.toUpperCase()} lista`);
  }

  static downloadError(fileType: string) {
    return this.error(`Error al generar archivo ${fileType.toUpperCase()}`);
  }

  // Processing notifications
  static processingStart(message: string = 'Iniciando procesamiento...') {
    return this.loading(message);
  }

  static processingStep(step: string, progress?: number) {
    const message = progress ? `${step} (${progress}%)` : step;
    return this.info(message, { duration: 2000 });
  }

  static processingComplete(message: string = 'Procesamiento completado') {
    return this.success(message);
  }

  static processingError(message: string = 'Error en el procesamiento') {
    return this.error(message);
  }

  // User management notifications
  static userCreated(userName: string) {
    return this.success(`Usuario ${userName} creado correctamente`);
  }

  static userUpdated(userName: string) {
    return this.success(`Usuario ${userName} actualizado correctamente`);
  }

  static userDeleted(userName: string) {
    return this.success(`Usuario ${userName} eliminado correctamente`);
  }

  static userError(action: string, userName?: string) {
    const message = userName 
      ? `Error al ${action} usuario ${userName}`
      : `Error al ${action} usuario`;
    return this.error(message);
  }

  // Password operations
  static passwordReset(email: string) {
    return this.success(`Enlace de recuperación enviado a ${email}`);
  }

  static passwordChanged() {
    return this.success('Contraseña actualizada correctamente');
  }

  static passwordError(message: string = 'Error al cambiar contraseña') {
    return this.error(message);
  }

  // Share link notifications
  static linkCreated() {
    return this.success('Enlace compartido creado correctamente');
  }

  static linkCopied() {
    return this.success('Enlace copiado al portapapeles');
  }

  static linkRevoked() {
    return this.success('Enlace revocado correctamente');
  }

  static linkError(message: string = 'Error con el enlace compartido') {
    return this.error(message);
  }

  // Filter and data notifications
  static filtersApplied() {
    return this.info('Filtros aplicados correctamente', { duration: 2000 });
  }

  static filtersCleared() {
    return this.info('Filtros limpiados', { duration: 2000 });
  }

  static dataRefreshed() {
    return this.success('Datos actualizados', { duration: 2000 });
  }

  static dataError(message: string = 'Error al cargar datos') {
    return this.error(message);
  }

  // Email simulation notifications
  static emailSent(type: string, recipient?: string) {
    const message = recipient 
      ? `${type} enviado a ${recipient}`
      : `${type} enviado correctamente`;
    return this.success(message);
  }

  static emailError(type: string) {
    return this.error(`Error al enviar ${type}`);
  }
}

// Convenience functions for common patterns
export const showToast = ToastManager;

// React hook for toast notifications
export function useToast() {
  return {
    success: ToastManager.success,
    error: ToastManager.error,
    warning: ToastManager.warning,
    info: ToastManager.info,
    loading: ToastManager.loading,
    custom: ToastManager.custom,
    dismiss: ToastManager.dismiss,
    dismissAll: ToastManager.dismissAll,
    simulatedOperation: ToastManager.simulatedOperation,
    
    // Specialized methods
    auth: {
      success: ToastManager.authSuccess,
      error: ToastManager.authError,
      logout: ToastManager.authLogout,
    },
    
    file: {
      uploadStart: ToastManager.fileUploadStart,
      uploadSuccess: ToastManager.fileUploadSuccess,
      uploadError: ToastManager.fileUploadError,
      downloadStart: ToastManager.downloadStart,
      downloadReady: ToastManager.downloadReady,
      downloadError: ToastManager.downloadError,
    },
    
    processing: {
      start: ToastManager.processingStart,
      step: ToastManager.processingStep,
      complete: ToastManager.processingComplete,
      error: ToastManager.processingError,
    },
    
    user: {
      created: ToastManager.userCreated,
      updated: ToastManager.userUpdated,
      deleted: ToastManager.userDeleted,
      error: ToastManager.userError,
    },
    
    password: {
      reset: ToastManager.passwordReset,
      changed: ToastManager.passwordChanged,
      error: ToastManager.passwordError,
    },
    
    link: {
      created: ToastManager.linkCreated,
      copied: ToastManager.linkCopied,
      revoked: ToastManager.linkRevoked,
      error: ToastManager.linkError,
    },
    
    data: {
      filtersApplied: ToastManager.filtersApplied,
      filtersCleared: ToastManager.filtersCleared,
      refreshed: ToastManager.dataRefreshed,
      error: ToastManager.dataError,
    },
    
    email: {
      sent: ToastManager.emailSent,
      error: ToastManager.emailError,
    },
  };
}