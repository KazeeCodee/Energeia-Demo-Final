'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ToastManager } from '../../lib/utils/toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  context?: string; // e.g., 'reports', 'auth', 'dashboard'
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    this.setState({ errorInfo });
    
    // Log to localStorage for debugging
    this.logError(error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Show toast notification
    ToastManager.error('Se produjo un error inesperado', {
      duration: 6000,
      action: {
        label: 'Reintentar',
        onClick: () => this.handleRetry(),
      },
    });
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorLog = {
      id: this.state.errorId,
      timestamp: new Date().toISOString(),
      context: this.props.context || 'unknown',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 50 errors
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('error_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to log error to localStorage:', e);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    ToastManager.info('Reintentando...');
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">¡Ups! Algo salió mal</CardTitle>
              <CardDescription>
                Se produjo un error inesperado en {this.props.context || 'la aplicación'}.
                {this.state.errorId && (
                  <span className="block mt-2 text-xs font-mono text-muted-foreground">
                    ID: {this.state.errorId}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.props.showDetails && this.state.error && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Detalles del error:
                  </p>
                  <p className="text-xs font-mono text-red-600">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reintentar
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={this.handleGoHome}
                    className="flex-1"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Inicio
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={this.handleReload}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recargar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different contexts
export function ReportsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary 
      context="reports"
      fallback={
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-600 mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error al cargar informes
          </h3>
          <p className="text-red-600 mb-4">
            No se pudieron cargar los datos del informe. Por favor, intenta nuevamente.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Recargar informes
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function ChartsErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary 
      context="charts"
      fallback={
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-600 mb-3" />
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            Error al cargar gráfico
          </h3>
          <p className="text-amber-600 mb-4">
            No se pudo renderizar el gráfico. Los datos pueden estar corruptos.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            Reintentar
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary 
      context="auth"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Error de autenticación</CardTitle>
              <CardDescription>
                Se produjo un error en el sistema de autenticación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="w-full"
              >
                Volver al login
              </Button>
            </CardContent>
          </Card>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary 
      context="form"
      fallback={
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">
              Error en el formulario. Por favor, recarga la página e intenta nuevamente.
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook to access error logging functionality
export function useErrorLogger() {
  const logError = (error: Error, context?: string) => {
    const errorLog = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      context: context || 'manual',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(errorLog);
      
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50);
      }
      
      localStorage.setItem('error_logs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to log error to localStorage:', e);
    }
  };

  const getErrorLogs = () => {
    try {
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch (e) {
      return [];
    }
  };

  const clearErrorLogs = () => {
    localStorage.removeItem('error_logs');
  };

  return { logError, getErrorLogs, clearErrorLogs };
}