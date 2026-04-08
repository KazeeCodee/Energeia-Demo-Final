'use client';

import React, { useEffect, useState } from 'react';
import { Progress } from './progress';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  AlertCircle,
  Play,
  Pause,
  Square,
  RotateCcw
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Enhanced progress bar with animations
export function AnimatedProgress({ 
  value, 
  max = 100,
  className,
  showPercentage = true,
  color = 'primary',
  size = 'default',
  animated = true
}: {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'default' | 'lg';
  animated?: boolean;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const sizeClasses = {
    sm: 'h-2',
    default: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn(
        'w-full bg-muted rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            colorClasses[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{Math.round(percentage)}%</span>
          <span>{value} / {max}</span>
        </div>
      )}
    </div>
  );
}

// Circular progress indicator
export function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  color = 'primary',
  showPercentage = true,
  className
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'success' | 'warning' | 'error';
  showPercentage?: boolean;
  className?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: 'stroke-primary',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    error: 'stroke-red-500',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-500 ease-out', colorClasses[color])}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Step progress indicator
export function StepProgress({
  steps,
  currentStep = 0,
  completedSteps = [],
  errorSteps = [],
  orientation = 'horizontal',
  showLabels = true,
  className
}: {
  steps: string[];
  currentStep?: number;
  completedSteps?: number[];
  errorSteps?: number[];
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  className?: string;
}) {
  const getStepStatus = (index: number) => {
    if (errorSteps.includes(index)) return 'error';
    if (completedSteps.includes(index)) return 'completed';
    if (index === currentStep) return 'current';
    if (index < currentStep) return 'completed';
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'current':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn(
      'flex',
      isHorizontal ? 'flex-row items-center space-x-4' : 'flex-col space-y-4',
      className
    )}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <div
            key={index}
            className={cn(
              'flex items-center',
              isHorizontal ? 'flex-row' : 'flex-col',
              !isLast && (isHorizontal ? 'flex-1' : '')
            )}
          >
            <div className={cn(
              'flex items-center',
              isHorizontal ? 'flex-row space-x-3' : 'flex-col space-y-2'
            )}>
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                status === 'completed' && 'border-green-500 bg-green-50',
                status === 'error' && 'border-red-500 bg-red-50',
                status === 'current' && 'border-primary bg-primary/10',
                status === 'pending' && 'border-muted bg-muted/50'
              )}>
                {getStepIcon(status)}
              </div>
              
              {showLabels && (
                <div className={cn(
                  'text-sm',
                  isHorizontal ? 'text-left' : 'text-center',
                  status === 'current' && 'font-medium text-primary',
                  status === 'completed' && 'text-green-700',
                  status === 'error' && 'text-red-700',
                  status === 'pending' && 'text-muted-foreground'
                )}>
                  {step}
                </div>
              )}
            </div>

            {!isLast && (
              <div className={cn(
                'transition-colors',
                isHorizontal ? 'flex-1 h-0.5 mx-4' : 'w-0.5 h-8 my-2',
                index < currentStep ? 'bg-green-500' : 'bg-muted'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Multi-stage progress with ETA
export function MultiStageProgress({
  stages,
  currentStage = 0,
  stageProgress = 0,
  eta,
  onPause,
  onResume,
  onCancel,
  isPaused = false,
  className
}: {
  stages: Array<{ name: string; weight?: number }>;
  currentStage?: number;
  stageProgress?: number;
  eta?: number;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  isPaused?: boolean;
  className?: string;
}) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const totalWeight = stages.reduce((sum, stage) => sum + (stage.weight || 1), 0);
  const completedWeight = stages.slice(0, currentStage).reduce((sum, stage) => sum + (stage.weight || 1), 0);
  const currentStageWeight = stages[currentStage]?.weight || 1;
  const overallProgress = ((completedWeight + (stageProgress / 100) * currentStageWeight) / totalWeight) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {stages[currentStage]?.name || 'Procesando...'}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {onPause && !isPaused && (
              <Button variant="outline" size="sm" onClick={onPause}>
                <Pause className="h-4 w-4" />
              </Button>
            )}
            {onResume && isPaused && (
              <Button variant="outline" size="sm" onClick={onResume}>
                <Play className="h-4 w-4" />
              </Button>
            )}
            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                <Square className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso general</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <AnimatedProgress 
            value={overallProgress} 
            color="primary"
            animated={!isPaused}
          />
        </div>

        {/* Current Stage Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Etapa actual</span>
            <span>{Math.round(stageProgress)}%</span>
          </div>
          <AnimatedProgress 
            value={stageProgress} 
            color="success"
            size="sm"
            animated={!isPaused}
          />
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Tiempo transcurrido:</span>
            <div className="font-mono">{formatTime(elapsedTime)}</div>
          </div>
          {eta && (
            <div>
              <span className="text-muted-foreground">Tiempo estimado:</span>
              <div className="font-mono">{formatTime(eta)}</div>
            </div>
          )}
        </div>

        {/* Stage List */}
        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center space-x-3 p-2 rounded-lg transition-colors',
                index === currentStage && 'bg-primary/10',
                index < currentStage && 'text-muted-foreground'
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                index < currentStage && 'bg-green-500 text-white',
                index === currentStage && 'bg-primary text-white',
                index > currentStage && 'bg-muted text-muted-foreground'
              )}>
                {index < currentStage ? '✓' : index + 1}
              </div>
              <span className={cn(
                'text-sm',
                index === currentStage && 'font-medium'
              )}>
                {stage.name}
              </span>
              {index === currentStage && !isPaused && (
                <Loader2 className="h-4 w-4 animate-spin ml-auto" />
              )}
              {isPaused && index === currentStage && (
                <Pause className="h-4 w-4 ml-auto text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {isPaused && (
          <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">Procesamiento pausado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple loading dots animation
export function LoadingDots({ 
  size = 'default',
  color = 'primary' 
}: { 
  size?: 'sm' | 'default' | 'lg';
  color?: 'primary' | 'muted';
}) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    default: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colorClasses = {
    primary: 'bg-primary',
    muted: 'bg-muted-foreground',
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-pulse',
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
}

// Skeleton pulse animation
export function PulseLoader({ 
  lines = 3,
  className 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded animate-pulse"
          style={{
            width: `${60 + Math.random() * 40}%`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

// Retry button with countdown
export function RetryButton({
  onRetry,
  countdown = 0,
  disabled = false,
  className
}: {
  onRetry: () => void;
  countdown?: number;
  disabled?: boolean;
  className?: string;
}) {
  const [timeLeft, setTimeLeft] = useState(countdown);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const isDisabled = disabled || timeLeft > 0;

  return (
    <Button
      variant="outline"
      onClick={onRetry}
      disabled={isDisabled}
      className={className}
    >
      <RotateCcw className="h-4 w-4 mr-2" />
      {timeLeft > 0 ? `Reintentar en ${timeLeft}s` : 'Reintentar'}
    </Button>
  );
}