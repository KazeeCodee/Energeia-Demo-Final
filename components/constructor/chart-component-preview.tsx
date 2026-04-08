'use client';

import { ChartComponent } from '@/lib/types/constructor';
import { ConfigurableChartWrapper } from './configurable-chart-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, LineChart, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartComponentPreviewProps {
  component: ChartComponent;
  className?: string;
}

const componentTypeConfig = {
  'generation-mix': {
    icon: PieChart,
    label: 'Mix de Generación',
    color: 'bg-blue-500',
    description: 'Distribución de fuentes de energía'
  },
  'demand-trend': {
    icon: TrendingUp,
    label: 'Tendencia de Demanda',
    color: 'bg-green-500',
    description: 'Evolución temporal de la demanda'
  },
  'cost-comparison': {
    icon: DollarSign,
    label: 'Comparación de Costos',
    color: 'bg-orange-500',
    description: 'Análisis comparativo de costos'
  },
  'multi-series': {
    icon: LineChart,
    label: 'Series Múltiples',
    color: 'bg-purple-500',
    description: 'Múltiples series de datos'
  },
  'custom-bar': {
    icon: BarChart3,
    label: 'Gráfico de Barras',
    color: 'bg-indigo-500',
    description: 'Gráfico de barras personalizado'
  },
  'custom-line': {
    icon: LineChart,
    label: 'Gráfico de Líneas',
    color: 'bg-teal-500',
    description: 'Gráfico de líneas personalizado'
  },
  'custom-pie': {
    icon: PieChart,
    label: 'Gráfico Circular',
    color: 'bg-pink-500',
    description: 'Gráfico circular personalizado'
  }
};

export function ChartComponentPreview({ component, className }: ChartComponentPreviewProps) {
  const config = componentTypeConfig[component.type];
  const Icon = config.icon;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg text-white', config.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                {component.config.title || config.label}
              </CardTitle>
              {component.config.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {component.config.subtitle}
                </p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Real chart preview */}
        <div className="w-full">
          <ConfigurableChartWrapper component={component} />
        </div>

        {/* Component info */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Fuente de datos:</span>
            <span className="font-medium">{component.dataSource.name}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Altura:</span>
            <span className="font-medium">{component.config.height || 200}px</span>
          </div>

          {component.config.colors && component.config.colors.length > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Colores:</span>
              <div className="flex gap-1">
                {component.config.colors.slice(0, 3).map((color, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
                {component.config.colors.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{component.config.colors.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Leyenda:</span>
              <span className={cn(
                'font-medium',
                component.config.showLegend ? 'text-green-600' : 'text-muted-foreground'
              )}>
                {component.config.showLegend ? 'Sí' : 'No'}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Tooltip:</span>
              <span className={cn(
                'font-medium',
                component.config.showTooltip ? 'text-green-600' : 'text-muted-foreground'
              )}>
                {component.config.showTooltip ? 'Sí' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}