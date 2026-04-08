'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ReportNavigationProps {
  currentPeriod: string;
  onNavigate: (direction: 'previous' | 'next') => void;
  disabled?: boolean;
}

export function ReportNavigation({ 
  currentPeriod, 
  onNavigate, 
  disabled = false 
}: ReportNavigationProps) {
  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const getPreviousPeriod = (period: string) => {
    const date = new Date(period + '-01');
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 7);
  };

  const getNextPeriod = (period: string) => {
    const date = new Date(period + '-01');
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().slice(0, 7);
  };

  const isCurrentMonth = (period: string) => {
    const now = new Date();
    const currentPeriod = now.toISOString().slice(0, 7);
    return period === currentPeriod;
  };

  const isFutureMonth = (period: string) => {
    const now = new Date();
    const currentPeriod = now.toISOString().slice(0, 7);
    return period > currentPeriod;
  };

  const previousPeriod = getPreviousPeriod(currentPeriod);
  const nextPeriod = getNextPeriod(currentPeriod);
  const nextIsFuture = isFutureMonth(nextPeriod);

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigate('previous')}
        disabled={disabled}
        className="flex items-center space-x-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">
          {formatPeriod(previousPeriod)}
        </span>
        <span className="sm:hidden">Anterior</span>
      </Button>
      
      <div className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 rounded border">
        {formatPeriod(currentPeriod)}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onNavigate('next')}
        disabled={disabled || nextIsFuture}
        className="flex items-center space-x-1"
      >
        <span className="hidden sm:inline">
          {formatPeriod(nextPeriod)}
        </span>
        <span className="sm:hidden">Siguiente</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}