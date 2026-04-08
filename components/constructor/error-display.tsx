'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ValidationError } from '@/lib/types/constructor';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ErrorDisplayProps {
  errors: ValidationError[];
  onDismiss?: (error: ValidationError) => void;
  onDismissAll?: () => void;
  className?: string;
}

interface ErrorItemProps {
  error: ValidationError;
  onDismiss?: (error: ValidationError) => void;
}

const ErrorIcon = ({ type }: { type: ValidationError['type'] }) => {
  switch (type) {
    case 'canvas':
      return <AlertCircle className="h-4 w-4" />;
    case 'component':
      return <AlertTriangle className="h-4 w-4" />;
    case 'data':
      return <Info className="h-4 w-4" />;
    case 'grid':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const ErrorTypeLabel = ({ type }: { type: ValidationError['type'] }) => {
  const labels = {
    canvas: 'Canvas',
    component: 'Componente',
    data: 'Datos',
    grid: 'Grid',
  };

  const variants = {
    canvas: 'destructive',
    component: 'secondary',
    data: 'outline',
    grid: 'default',
  } as const;

  return (
    <Badge variant={variants[type]} className="text-xs">
      {labels[type]}
    </Badge>
  );
};

const ErrorItem: React.FC<ErrorItemProps> = ({ error, onDismiss }) => {
  const getAlertVariant = (type: ValidationError['type']) => {
    switch (type) {
      case 'canvas':
      case 'component':
        return 'destructive';
      case 'data':
      case 'grid':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getAlertVariant(error.type)} className="relative">
      <ErrorIcon type={error.type} />
      <div className="flex-1">
        <AlertTitle className="flex items-center gap-2 text-sm">
          <ErrorTypeLabel type={error.type} />
          {error.componentId && (
            <span className="text-xs text-muted-foreground">
              ID: {error.componentId.slice(-8)}
            </span>
          )}
        </AlertTitle>
        <AlertDescription className="text-sm mt-1">
          {error.message}
        </AlertDescription>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={() => onDismiss(error)}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  );
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  errors,
  onDismiss,
  onDismissAll,
  className = '',
}) => {
  if (errors.length === 0) {
    return null;
  }

  const errorsByType = errors.reduce((acc, error) => {
    if (!acc[error.type]) {
      acc[error.type] = [];
    }
    acc[error.type].push(error);
    return acc;
  }, {} as Record<ValidationError['type'], ValidationError[]>);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-destructive">
          {errors.length} error{errors.length > 1 ? 'es' : ''} encontrado{errors.length > 1 ? 's' : ''}
        </h3>
        {onDismissAll && errors.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDismissAll}
            className="text-xs"
          >
            Limpiar todos
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {Object.entries(errorsByType).map(([type, typeErrors]) => (
          <div key={type} className="space-y-2">
            {typeErrors.map((error, index) => (
              <ErrorItem
                key={`${type}-${index}-${error.componentId || error.spaceId || 'global'}`}
                error={error}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

interface ValidationSummaryProps {
  errorCount: number;
  warningCount?: number;
  isValid: boolean;
  className?: string;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errorCount,
  warningCount = 0,
  isValid,
  className = '',
}) => {
  if (isValid) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
        <div className="h-2 w-2 rounded-full bg-green-500" />
        Configuración válida
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-destructive ${className}`}>
      <div className="h-2 w-2 rounded-full bg-red-500" />
      {errorCount} error{errorCount > 1 ? 'es' : ''}
      {warningCount > 0 && (
        <span className="text-yellow-600">
          , {warningCount} advertencia{warningCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ConstructorErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Constructor Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
          />
        );
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error en el Constructor</AlertTitle>
          <AlertDescription className="mt-2">
            <p>Ha ocurrido un error inesperado en el constructor de informes.</p>
            <p className="text-xs mt-2 font-mono bg-muted p-2 rounded">
              {this.state.error?.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.resetError}
              className="mt-3"
            >
              Intentar de nuevo
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}