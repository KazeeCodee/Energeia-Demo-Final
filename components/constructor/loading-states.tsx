'use client';

import React from 'react';
import { Loader2, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};

interface SavingIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date;
  autoSaveEnabled?: boolean;
  className?: string;
}

export const SavingIndicator: React.FC<SavingIndicatorProps> = ({
  isSaving,
  lastSaved,
  autoSaveEnabled = false,
  className = '',
}) => {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return 'hace unos segundos';
    } else if (diffMinutes < 60) {
      return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  if (isSaving) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Save className="h-4 w-4 animate-pulse" />
        Guardando...
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <div className="h-2 w-2 rounded-full bg-green-500" />
        Guardado {formatLastSaved(lastSaved)}
        {autoSaveEnabled && (
          <span className="text-xs text-muted-foreground">(auto)</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <div className="h-2 w-2 rounded-full bg-yellow-500" />
      Sin guardar
    </div>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Cargando...',
  progress,
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg border max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <LoadingSpinner size="md" />
              <span className="text-sm font-medium">{message}</span>
            </div>
            {typeof progress === 'number' && (
              <Progress value={progress} className="w-full" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ErrorRecoveryProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  onDismiss,
  retryLabel = 'Reintentar',
  className = '',
}) => {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="flex-1">{error}</span>
        <div className="flex gap-2 ml-4">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {retryLabel}
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8"
            >
              Cerrar
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
}) => {
  const baseClasses = 'animate-pulse bg-muted';
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

interface ComponentLoadingSkeletonProps {
  className?: string;
}

export const ComponentLoadingSkeleton: React.FC<ComponentLoadingSkeletonProps> = ({
  className = '',
}) => {
  return (
    <div className={`space-y-4 p-4 border rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton variant="text" className="w-32" />
        <Skeleton variant="circular" className="h-6 w-6" />
      </div>
      <Skeleton variant="rectangular" className="h-48 w-full" />
      <div className="flex gap-2">
        <Skeleton variant="text" className="w-16 h-3" />
        <Skeleton variant="text" className="w-20 h-3" />
      </div>
    </div>
  );
};

interface CanvasLoadingSkeletonProps {
  spaceCount?: number;
  className?: string;
}

export const CanvasLoadingSkeleton: React.FC<CanvasLoadingSkeletonProps> = ({
  spaceCount = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: spaceCount }).map((_, index) => (
        <div key={index} className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" className="w-24 h-4" />
            <Skeleton variant="circular" className="h-4 w-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, compIndex) => (
              <ComponentLoadingSkeleton key={compIndex} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface AutoSaveIndicatorProps {
  isEnabled: boolean;
  lastAutoSave?: Date;
  nextAutoSave?: Date;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isEnabled,
  lastAutoSave,
  nextAutoSave,
  className = '',
}) => {
  if (!isEnabled) {
    return null;
  }

  const getNextSaveCountdown = () => {
    if (!nextAutoSave) return null;
    
    const now = new Date();
    const diffMs = nextAutoSave.getTime() - now.getTime();
    const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
    
    if (diffSeconds <= 0) return 'Guardando...';
    return `${diffSeconds}s`;
  };

  const countdown = getNextSaveCountdown();

  return (
    <div className={`flex items-center gap-2 text-xs text-muted-foreground ${className}`}>
      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
      <span>Auto-guardado activo</span>
      {countdown && (
        <span className="font-mono">({countdown})</span>
      )}
    </div>
  );
};

interface RetryableOperationProps {
  operation: () => Promise<void>;
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
  children: (props: {
    execute: () => void;
    isLoading: boolean;
    error: string | null;
    retryCount: number;
  }) => React.ReactNode;
}

export const RetryableOperation: React.FC<RetryableOperationProps> = ({
  operation,
  maxRetries = 3,
  retryDelay = 1000,
  onSuccess,
  onFailure,
  children,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const execute = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let currentRetry = 0;
    
    while (currentRetry <= maxRetries) {
      try {
        await operation();
        setIsLoading(false);
        setRetryCount(0);
        onSuccess?.();
        return;
      } catch (err) {
        currentRetry++;
        setRetryCount(currentRetry);
        
        if (currentRetry > maxRetries) {
          const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
          setError(errorMessage);
          setIsLoading(false);
          onFailure?.(err instanceof Error ? err : new Error(errorMessage));
          return;
        }
        
        // Wait before retrying
        if (currentRetry <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * currentRetry));
        }
      }
    }
  }, [operation, maxRetries, retryDelay, onSuccess, onFailure]);

  return (
    <>
      {children({
        execute,
        isLoading,
        error,
        retryCount,
      })}
    </>
  );
};