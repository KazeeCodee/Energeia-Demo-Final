'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChartComponentType } from '@/lib/types/constructor';
import { 
  PieChart, 
  BarChart3, 
  LineChart, 
  TrendingUp,
  Zap,
  DollarSign,
  Activity,
  Grid3X3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComponentPaletteProps {
  onDragStart: (componentType: ChartComponentType) => void;
  className?: string;
}

interface ChartComponentInfo {
  type: ChartComponentType;
  name: string;
  description: string;
  category: 'energy' | 'demand' | 'cost' | 'custom';
  icon: React.ComponentType<{ className?: string }>;
  preview: React.ReactNode;
  dataRequirements: string[];
}

const CHART_COMPONENTS: ChartComponentInfo[] = [
  {
    type: 'generation-mix',
    name: 'Mix de Generación',
    description: 'Gráfico de torta mostrando la distribución por tipo de energía',
    category: 'energy',
    icon: PieChart,
    preview: (
      <div className="w-full h-16 flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-gray-300 border-r-blue-500 border-b-purple-500"></div>
        </div>
      </div>
    ),
    dataRequirements: ['Térmica', 'Hidráulica', 'Nuclear', 'Renovable']
  },
  {
    type: 'demand-trend',
    name: 'Tendencia de Demanda',
    description: 'Gráfico de línea mostrando la evolución temporal de la demanda',
    category: 'demand',
    icon: TrendingUp,
    preview: (
      <div className="w-full h-16 flex items-end justify-center space-x-1">
        {[3, 5, 4, 7, 6, 8, 7].map((height, i) => (
          <div 
            key={i} 
            className={cn(
              "w-1 bg-orange-500 rounded-t",
              height === 3 && "h-1.5",
              height === 4 && "h-2",
              height === 5 && "h-2.5",
              height === 6 && "h-3",
              height === 7 && "h-3.5",
              height === 8 && "h-4"
            )}
          />
        ))}
      </div>
    ),
    dataRequirements: ['Mes', 'Demanda (MWh)', 'Variación (%)']
  },
  {
    type: 'cost-comparison',
    name: 'Comparación de Costos',
    description: 'Gráfico combinado de barras y líneas para análisis de costos',
    category: 'cost',
    icon: DollarSign,
    preview: (
      <div className="w-full h-16 flex items-end justify-center space-x-1">
        {[4, 6, 5, 7, 5, 6, 8].map((height, i) => (
          <div key={i} className="flex flex-col items-center space-y-1">
            <div 
              className={cn(
                "w-2 bg-gray-400 rounded-t",
                height === 4 && "h-1.5",
                height === 5 && "h-2",
                height === 6 && "h-2.5",
                height === 7 && "h-3",
                height === 8 && "h-3.5"
              )}
            />
            <div className="w-1 h-1 bg-orange-500 rounded-full" />
          </div>
        ))}
      </div>
    ),
    dataRequirements: ['CAMMESA', 'PLUS', 'Renovable', 'Costo Abastecimiento']
  },
  {
    type: 'multi-series',
    name: 'Multi-Series',
    description: 'Gráfico de líneas múltiples para comparar diferentes series de datos',
    category: 'custom',
    icon: LineChart,
    preview: (
      <div className="w-full h-16 flex items-center justify-center">
        <svg width="48" height="32" viewBox="0 0 48 32" className="text-orange-500">
          <path 
            d="M2 20 L10 12 L18 16 L26 8 L34 14 L42 6" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none"
          />
          <path 
            d="M2 24 L10 18 L18 22 L26 14 L34 20 L42 12" 
            stroke="#64748B" 
            strokeWidth="2" 
            fill="none"
          />
        </svg>
      </div>
    ),
    dataRequirements: ['Eje X', 'Serie 1', 'Serie 2', 'Serie N']
  },
  {
    type: 'custom-bar',
    name: 'Gráfico de Barras',
    description: 'Gráfico de barras personalizable para datos categóricos',
    category: 'custom',
    icon: BarChart3,
    preview: (
      <div className="w-full h-16 flex items-end justify-center space-x-1">
        {[5, 8, 6, 9, 7, 4, 6].map((height, i) => (
          <div 
            key={i} 
            className={cn(
              "w-2 bg-orange-500 rounded-t",
              height === 4 && "h-2",
              height === 5 && "h-2.5",
              height === 6 && "h-3",
              height === 7 && "h-3.5",
              height === 8 && "h-4",
              height === 9 && "h-4.5"
            )}
          />
        ))}
      </div>
    ),
    dataRequirements: ['Categoría', 'Valor', 'Etiqueta (opcional)']
  },
  {
    type: 'custom-line',
    name: 'Gráfico de Línea',
    description: 'Gráfico de línea personalizable para tendencias temporales',
    category: 'custom',
    icon: Activity,
    preview: (
      <div className="w-full h-16 flex items-center justify-center">
        <svg width="48" height="32" viewBox="0 0 48 32" className="text-orange-500">
          <path 
            d="M2 24 L8 16 L14 20 L20 12 L26 18 L32 8 L38 14 L44 6" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none"
          />
          {[2, 8, 14, 20, 26, 32, 38, 44].map((x, i) => (
            <circle key={i} cx={x} cy={[24, 16, 20, 12, 18, 8, 14, 6][i]} r="2" fill="currentColor" />
          ))}
        </svg>
      </div>
    ),
    dataRequirements: ['Tiempo/Período', 'Valor', 'Etiqueta (opcional)']
  },
  {
    type: 'custom-pie',
    name: 'Gráfico Circular',
    description: 'Gráfico de torta personalizable para distribuciones porcentuales',
    category: 'custom',
    icon: PieChart,
    preview: (
      <div className="w-full h-16 flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-gray-400 border-r-blue-400 border-b-green-400"></div>
          <div className="absolute inset-2 rounded-full bg-white"></div>
        </div>
      </div>
    ),
    dataRequirements: ['Categoría', 'Porcentaje/Valor', 'Color (opcional)']
  }
];

const CATEGORY_INFO = {
  energy: {
    name: 'Energía',
    icon: Zap,
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  demand: {
    name: 'Demanda',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  cost: {
    name: 'Costos',
    icon: DollarSign,
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  custom: {
    name: 'Personalizado',
    icon: Grid3X3,
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }
};

export function ComponentPalette({ onDragStart, className }: ComponentPaletteProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<ChartComponentType | null>(null);

  const filteredComponents = selectedCategory 
    ? CHART_COMPONENTS.filter(comp => comp.category === selectedCategory)
    : CHART_COMPONENTS;

  const handleDragStart = (componentType: ChartComponentType, e: React.DragEvent) => {
    setDraggedComponent(componentType);
    onDragStart(componentType);
    
    // Set drag data
    const dragData = {
      type: 'chart-component',
      componentType: componentType
    };
    
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedComponent(null);
  };

  return (
    <Card className={cn('w-full h-fit shadow-lg border-orange-200', className)}>
      <CardHeader className="pb-3 px-4 bg-gradient-to-r from-orange-50 to-orange-100/50 border-b border-orange-200">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Grid3X3 className="h-5 w-5 text-orange-500" />
            <span>Componentes</span>
          </div>
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" title="Paleta fija"></div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Arrastra al lienzo para añadir
        </p>
      </CardHeader>

      <CardContent className="space-y-4 px-4">
        {/* Category Filters */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Categorías</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="h-8 text-xs"
            >
              Todos
            </Button>
            {Object.entries(CATEGORY_INFO).map(([key, info]) => {
              const Icon = info.icon;
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="h-8 text-xs"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {info.name}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Component List */}
        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 -mr-2">
          {filteredComponents.map((component) => {
            const Icon = component.icon;
            const categoryInfo = CATEGORY_INFO[component.category];
            const isDragging = draggedComponent === component.type;

            return (
              <div
                key={component.type}
                draggable
                onDragStart={(e) => handleDragStart(component.type, e)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group relative border border-gray-200 rounded-lg p-3 transition-all cursor-grab",
                  "hover:border-orange-300 hover:shadow-lg hover:bg-orange-50/50",
                  "active:cursor-grabbing",
                  isDragging && "opacity-50 scale-95 rotate-2 shadow-xl"
                )}
              >
                <div className="space-y-2">
                  {/* Header with Icon and Title */}
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors flex-shrink-0">
                      <Icon className="h-4 w-4 text-gray-600 group-hover:text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {component.name}
                      </h5>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs mt-1", categoryInfo.color)}
                      >
                        {categoryInfo.name}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {component.description}
                  </p>

                  {/* Preview - Compact */}
                  <div className="bg-white border border-gray-100 rounded-lg p-2">
                    <div className="scale-75 origin-left">
                      {component.preview}
                    </div>
                  </div>

                  {/* Data Requirements - Compact */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">Datos:</p>
                    <div className="flex flex-wrap gap-1">
                      {component.dataRequirements.slice(0, 2).map((req, index) => (
                        <span 
                          key={index}
                          className="inline-block text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded"
                        >
                          {req}
                        </span>
                      ))}
                      {component.dataRequirements.length > 2 && (
                        <span className="inline-block text-xs text-gray-500 px-1">
                          +{component.dataRequirements.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drag Indicator */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-0.5" aria-hidden="true">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-gray-400 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Grid3X3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No hay componentes en esta categoría</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}