'use client';

import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface ReportChartProps {
  children: React.ReactElement;
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
  loading?: boolean;
}

export function ReportChart({
  children,
  title,
  subtitle,
  height = 300,
  className,
  loading = false
}: ReportChartProps) {
  return (
    <div className={cn('w-full', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Cargando gráfico...</span>
            </div>
          </div>
        )}
        
        <div 
          className="bg-white border border-gray-200 rounded-lg p-2 sm:p-4"
          style={{ minHeight: `${height}px` }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}