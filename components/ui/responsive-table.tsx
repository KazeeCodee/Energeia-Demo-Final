'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  mobileHidden?: boolean; // Hide on mobile
  mobileOnly?: boolean;   // Show only on mobile
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T) => void;
  mobileCardRender?: (item: T) => React.ReactNode; // Custom mobile card layout
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  className,
  emptyMessage = "No hay datos disponibles",
  loading = false,
  onRowClick,
  mobileCardRender
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-label="Cargando tabla">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div 
        className="text-center py-8 text-slate-500"
        role="status"
        aria-live="polite"
      >
        {emptyMessage}
      </div>
    );
  }

  // Mobile card view
  if (isMobile && mobileCardRender) {
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={String(item[keyField])}
            className={cn(
              "bg-white border border-slate-200 rounded-lg p-4 shadow-sm",
              onRowClick && "cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            )}
            onClick={() => onRowClick?.(item)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                e.preventDefault();
                onRowClick(item);
              }
            }}
            tabIndex={onRowClick ? 0 : undefined}
          >
            {mobileCardRender(item)}
          </div>
        ))}
      </div>
    );
  }

  // Mobile simplified table view
  if (isMobile) {
    const visibleColumns = columns.filter(col => !col.mobileHidden);
    
    return (
      <div className="space-y-3">
        {data.map((item) => (
          <div
            key={String(item[keyField])}
            className={cn(
              "bg-white border border-slate-200 rounded-lg p-4 shadow-sm",
              onRowClick && "cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            )}
            onClick={() => onRowClick?.(item)}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                e.preventDefault();
                onRowClick(item);
              }
            }}
            tabIndex={onRowClick ? 0 : undefined}
          >
            <div className="space-y-2">
              {visibleColumns.map((column) => (
                <div key={String(column.key)} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">
                    {column.header}:
                  </span>
                  <span className="text-sm text-slate-900">
                    {column.render 
                      ? column.render(item[column.key], item)
                      : String(item[column.key])
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Desktop table view
  const visibleColumns = columns.filter(col => !col.mobileOnly);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table 
        className="w-full text-sm"
        role="table"
        aria-label="Tabla de datos"
      >
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {visibleColumns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  "px-4 py-3 text-left font-medium text-slate-700",
                  column.className
                )}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={String(item[keyField])}
              className={cn(
                "border-b border-slate-100 hover:bg-slate-50",
                onRowClick && "cursor-pointer focus:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-inset",
                index % 2 === 0 ? "bg-white" : "bg-slate-25"
              )}
              onClick={() => onRowClick?.(item)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                  e.preventDefault();
                  onRowClick(item);
                }
              }}
              tabIndex={onRowClick ? 0 : undefined}
            >
              {visibleColumns.map((column) => (
                <td
                  key={String(column.key)}
                  className={cn(
                    "px-4 py-3 text-slate-900",
                    column.className
                  )}
                >
                  {column.render 
                    ? column.render(item[column.key], item)
                    : String(item[column.key])
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper component for mobile card layouts
interface MobileCardFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function MobileCardField({ label, value, className }: MobileCardFieldProps) {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      <span className="text-sm font-medium text-slate-600">{label}:</span>
      <span className="text-sm text-slate-900">{value}</span>
    </div>
  );
}

// Helper component for mobile card headers
interface MobileCardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function MobileCardHeader({ title, subtitle, actions }: MobileCardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-medium text-slate-900">{title}</h3>
        {subtitle && (
          <p className="text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
}