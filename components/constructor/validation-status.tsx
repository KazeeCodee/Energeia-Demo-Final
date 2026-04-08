'use client';

import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ValidationError } from '@/lib/types/constructor';
import { ReportValidationService } from '@/lib/services/validation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ErrorDisplay, ValidationSummary } from './error-display';

interface ValidationStatusProps {
  errors: ValidationError[];
  isValidating?: boolean;
  onRevalidate?: () => void;
  onFixError?: (error: ValidationError) => void;
  className?: string;
}

export const ValidationStatus: React.FC<ValidationStatusProps> = ({
  errors,
  isValidating = false,
  onRevalidate,
  onFixError,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const isValid = errors.length === 0;
  const errorsByType = errors.reduce((acc, error) => {
    if (!acc[error.type]) {
      acc[error.type] = [];
    }
    acc[error.type].push(error);
    return acc;
  }, {} as Record<ValidationError['type'], ValidationError[]>);

  const getStatusIcon = () => {
    if (isValidating) {
      return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
    }
    
    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  };

  const getStatusText = () => {
    if (isValidating) {
      return 'Validando configuración...';
    }
    
    if (isValid) {
      return 'Configuración válida';
    }
    
    return ReportValidationService.getValidationSummary({
      isValid: false,
      errors,
      warnings: [],
    });
  };

  const getStatusColor = () => {
    if (isValidating) {
      return 'text-muted-foreground';
    }
    
    if (isValid) {
      return 'text-green-600';
    }
    
    return 'text-destructive';
  };

  // Auto-expand when there are errors
  React.useEffect(() => {
    if (errors.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [errors.length, isExpanded]);

  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isValid && (
              <div className="flex gap-1">
                {Object.entries(errorsByType).map(([type, typeErrors]) => (
                  <Badge
                    key={type}
                    variant={type === 'canvas' || type === 'component' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {typeErrors.length}
                  </Badge>
                ))}
              </div>
            )}
            
            {onRevalidate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRevalidate}
                disabled={isValidating}
                className="h-8 px-2"
              >
                Revalidar
              </Button>
            )}
            
            {errors.length > 0 && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                >
                  {isExpanded ? 'Ocultar' : 'Ver detalles'}
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
        </div>

        <CollapsibleContent className="mt-4">
          {errors.length > 0 && (
            <ErrorDisplay
              errors={errors}
              onDismiss={onFixError}
              className="mt-4"
            />
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

interface QuickValidationProps {
  errors: ValidationError[];
  className?: string;
}

export const QuickValidation: React.FC<QuickValidationProps> = ({
  errors,
  className = '',
}) => {
  const isValid = errors.length === 0;
  
  if (isValid) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
        <CheckCircle className="h-4 w-4" />
        <span>Válido</span>
      </div>
    );
  }

  const criticalErrors = errors.filter(e => e.type === 'canvas' || e.type === 'component');
  const warnings = errors.filter(e => e.type === 'data' || e.type === 'grid');

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {criticalErrors.length > 0 && (
        <div className="flex items-center gap-1 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{criticalErrors.length}</span>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="flex items-center gap-1 text-yellow-600">
          <AlertTriangle className="h-4 w-4" />
          <span>{warnings.length}</span>
        </div>
      )}
    </div>
  );
};

interface ValidationTooltipProps {
  errors: ValidationError[];
  children: React.ReactNode;
}

export const ValidationTooltip: React.FC<ValidationTooltipProps> = ({
  errors,
  children,
}) => {
  if (errors.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 max-w-xs">
        <div className="text-xs space-y-1">
          {errors.slice(0, 3).map((error, index) => (
            <div key={index} className="flex items-start gap-2">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0 text-destructive" />
              <span>{error.message}</span>
            </div>
          ))}
          {errors.length > 3 && (
            <div className="text-muted-foreground">
              +{errors.length - 3} más...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ValidationBadgeProps {
  errors: ValidationError[];
  showCount?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({
  errors,
  showCount = true,
  size = 'sm',
  className = '',
}) => {
  if (errors.length === 0) {
    return (
      <Badge variant="outline" className={`text-green-600 border-green-600 ${className}`}>
        <CheckCircle className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        Válido
      </Badge>
    );
  }

  const criticalCount = errors.filter(e => e.type === 'canvas' || e.type === 'component').length;
  
  if (criticalCount > 0) {
    return (
      <Badge variant="destructive" className={className}>
        <AlertCircle className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        {showCount ? `${criticalCount} error${criticalCount > 1 ? 'es' : ''}` : 'Error'}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={className}>
      <AlertTriangle className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
      {showCount ? `${errors.length} advertencia${errors.length > 1 ? 's' : ''}` : 'Advertencia'}
    </Badge>
  );
};