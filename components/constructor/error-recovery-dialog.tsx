'use client';

import React from 'react';
import { AlertCircle, RefreshCw, AlertTriangle, Info, X } from 'lucide-react';
import { 
  RecoveryPlan, 
  RecoveryAction, 
  ErrorContext,
  RecoveryStrategy 
} from '@/lib/services/error-recovery';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ErrorRecoveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recoveryPlan: RecoveryPlan | null;
  onExecuteAction: (action: RecoveryAction) => Promise<void>;
  isExecuting?: boolean;
}

const StrategyIcon = ({ strategy }: { strategy: RecoveryStrategy }) => {
  switch (strategy) {
    case 'retry':
      return <RefreshCw className="h-4 w-4" />;
    case 'fallback':
      return <Info className="h-4 w-4" />;
    case 'reset':
      return <AlertTriangle className="h-4 w-4" />;
    case 'ignore':
      return <X className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const StrategyBadge = ({ strategy }: { strategy: RecoveryStrategy }) => {
  const variants = {
    retry: 'default',
    fallback: 'secondary',
    reset: 'destructive',
    ignore: 'outline',
  } as const;

  const labels = {
    retry: 'Reintentar',
    fallback: 'Alternativa',
    reset: 'Reiniciar',
    ignore: 'Ignorar',
  };

  return (
    <Badge variant={variants[strategy]} className="text-xs">
      <StrategyIcon strategy={strategy} />
      <span className="ml-1">{labels[strategy]}</span>
    </Badge>
  );
};

const ErrorDetails = ({ context }: { context: ErrorContext }) => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div>
            <strong>Operación:</strong> {context.operation}
          </div>
          <div>
            <strong>Error:</strong> {context.error.message}
          </div>
          {context.configId && (
            <div>
              <strong>Configuración:</strong> {context.configId.slice(-8)}
            </div>
          )}
          {context.componentId && (
            <div>
              <strong>Componente:</strong> {context.componentId.slice(-8)}
            </div>
          )}
          {context.retryCount && context.retryCount > 0 && (
            <div>
              <strong>Intentos:</strong> {context.retryCount}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {context.timestamp.toLocaleString('es-ES')}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

const ActionButton = ({ 
  action, 
  onExecute, 
  isExecuting, 
  isRecommended 
}: { 
  action: RecoveryAction;
  onExecute: (action: RecoveryAction) => void;
  isExecuting: boolean;
  isRecommended: boolean;
}) => {
  const getVariant = () => {
    if (isRecommended) return 'default';
    if (action.isDestructive) return 'destructive';
    return 'outline';
  };

  return (
    <Button
      variant={getVariant()}
      onClick={() => onExecute(action)}
      disabled={isExecuting}
      className="w-full justify-start h-auto p-4"
    >
      <div className="flex items-start gap-3 w-full">
        <StrategyIcon strategy={action.strategy} />
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{action.label}</span>
            <StrategyBadge strategy={action.strategy} />
            {isRecommended && (
              <Badge variant="default" className="text-xs">
                Recomendado
              </Badge>
            )}
            {action.isDestructive && (
              <Badge variant="destructive" className="text-xs">
                Destructivo
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {action.description}
          </p>
        </div>
      </div>
    </Button>
  );
};

export const ErrorRecoveryDialog: React.FC<ErrorRecoveryDialogProps> = ({
  isOpen,
  onClose,
  recoveryPlan,
  onExecuteAction,
  isExecuting = false,
}) => {
  const [selectedAction, setSelectedAction] = React.useState<RecoveryAction | null>(null);

  const handleExecuteAction = async (action: RecoveryAction) => {
    setSelectedAction(action);
    try {
      await onExecuteAction(action);
      onClose();
    } catch (error) {
      console.error('Error executing recovery action:', error);
    } finally {
      setSelectedAction(null);
    }
  };

  if (!recoveryPlan) {
    return null;
  }

  const recommendedAction = recoveryPlan.actions.find(
    action => action.id === recoveryPlan.recommendedAction
  );

  const otherActions = recoveryPlan.actions.filter(
    action => action.id !== recoveryPlan.recommendedAction
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Error en el Constructor
          </DialogTitle>
          <DialogDescription>
            Se ha producido un error durante la operación. Selecciona una acción para continuar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ErrorDetails context={recoveryPlan.context} />

          <div className="space-y-4">
            {recommendedAction && (
              <div>
                <h4 className="text-sm font-medium mb-2">Acción recomendada</h4>
                <ActionButton
                  action={recommendedAction}
                  onExecute={handleExecuteAction}
                  isExecuting={isExecuting && selectedAction?.id === recommendedAction.id}
                  isRecommended={true}
                />
              </div>
            )}

            {otherActions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Otras opciones</h4>
                  <div className="space-y-2">
                    {otherActions.map((action) => (
                      <ActionButton
                        key={action.id}
                        action={action}
                        onExecute={handleExecuteAction}
                        isExecuting={isExecuting && selectedAction?.id === action.id}
                        isRecommended={false}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isExecuting}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface QuickErrorRecoveryProps {
  error: Error;
  operation: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const QuickErrorRecovery: React.FC<QuickErrorRecoveryProps> = ({
  error,
  operation,
  onRetry,
  onDismiss,
  className = '',
}) => {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium">Error en {operation}</div>
          <div className="text-sm mt-1">{error.message}</div>
        </div>
        <div className="flex gap-2 ml-4">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reintentar
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <div className="font-medium">Error inesperado</div>
                <div className="text-sm mt-1">
                  Ha ocurrido un error inesperado en el constructor de informes.
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetError}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reintentar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Ocultar' : 'Ver'} detalles
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Recargar página
                </Button>
              </div>

              {showDetails && (
                <div className="mt-3 p-3 bg-muted rounded text-xs font-mono">
                  <div className="font-semibold mb-1">Error:</div>
                  <div className="break-all">{error.message}</div>
                  {error.stack && (
                    <>
                      <div className="font-semibold mt-2 mb-1">Stack:</div>
                      <div className="break-all whitespace-pre-wrap">
                        {error.stack.split('\n').slice(0, 5).join('\n')}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};