'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from './skeleton';
import { Progress } from './progress';
import { Card, CardContent, CardHeader } from './card';
import { Loader2, FileText, BarChart3, Users, Building2, Download, Upload, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

// Generic loading spinner
export function LoadingSpinner({ 
  size = 'default',
  className 
}: { 
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  );
}

// Loading overlay for full-screen operations
export function LoadingOverlay({ 
  message = 'Cargando...',
  progress,
  onCancel,
}: {
  message?: string;
  progress?: number;
  onCancel?: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" className="mx-auto text-primary" />
            <div>
              <p className="font-medium">{message}</p>
              {progress !== undefined && (
                <div className="mt-3 space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{progress}%</p>
                </div>
              )}
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Cancelar
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton loaders for different content types
export function ReportSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
      
      {/* Table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ type = 'bar' }: { type?: 'bar' | 'line' | 'pie' }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="relative h-64 bg-muted rounded-lg flex items-center justify-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
      </div>
      <div className="flex justify-center space-x-4">
        {Array.from({ length: type === 'pie' ? 4 : 6 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Animated loading states with progress
export function ProcessingLoader({ 
  steps,
  currentStep = 0,
  progress = 0,
  eta,
}: {
  steps: string[];
  currentStep?: number;
  progress?: number;
  eta?: number;
}) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
          <div 
            className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"
            style={{ animationDuration: '1s' }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          Procesando{dots}
        </h3>
        
        {eta && (
          <p className="text-sm text-muted-foreground">
            Tiempo estimado: {Math.ceil(eta / 60)} minutos
          </p>
        )}
      </div>

      <div className="space-y-4">
        <Progress value={progress} className="w-full" />
        
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center space-x-3 p-2 rounded-lg transition-colors",
                index === currentStep && "bg-primary/10",
                index < currentStep && "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                index < currentStep && "bg-green-500 text-white",
                index === currentStep && "bg-primary text-white animate-pulse",
                index > currentStep && "bg-muted text-muted-foreground"
              )}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className={cn(
                "text-sm",
                index === currentStep && "font-medium"
              )}>
                {step}
              </span>
              {index === currentStep && (
                <LoadingSpinner size="sm" className="ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// File upload progress
export function FileUploadProgress({ 
  fileName,
  progress = 0,
  status = 'uploading',
}: {
  fileName: string;
  progress?: number;
  status?: 'uploading' | 'processing' | 'completed' | 'error';
}) {
  const statusConfig = {
    uploading: { icon: Upload, color: 'text-blue-500', bg: 'bg-blue-50' },
    processing: { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
    completed: { icon: FileText, color: 'text-green-500', bg: 'bg-green-50' },
    error: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={config.bg}>
      <CardContent className="pt-4">
        <div className="flex items-center space-x-3">
          <Icon className={cn("h-8 w-8", config.color)} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <div className="mt-2 space-y-1">
              <Progress value={progress} className="w-full h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress}%</span>
                <span>
                  {status === 'uploading' && 'Subiendo...'}
                  {status === 'processing' && 'Procesando...'}
                  {status === 'completed' && 'Completado'}
                  {status === 'error' && 'Error'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard loading state
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Empty states
export function EmptyState({ 
  icon: Icon = FileText,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <Icon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-semibold text-muted-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}