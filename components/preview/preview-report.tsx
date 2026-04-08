'use client';

import { ReportConfig } from '@/lib/types/constructor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PreviewChart } from './preview-chart';
import { Calendar, Building2, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewReportProps {
  config: ReportConfig;
}

export function PreviewReport({ config }: PreviewReportProps) {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalComponents = config.spaces.reduce((total, space) => total + space.components.length, 0);

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                {config.name}
              </CardTitle>
              <p className="text-gray-600 text-lg">
                Informe Energético Mensual - Datos Simulados
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4" />
                {currentDate}
              </div>
              <Badge variant="outline" className="bg-white">
                {totalComponents} Componente{totalComponents !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-orange-200">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-semibold text-gray-900">
                  {config.clientId ? `Cliente ${config.clientId}` : 'Configuración Global'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-orange-200">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Consumo Total</p>
                <p className="font-semibold text-gray-900">2,847 MWh</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-orange-200">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Eficiencia</p>
                <p className="font-semibold text-gray-900">+12.5%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <div className="space-y-8">
        {config.spaces
          .sort((a, b) => a.order - b.order)
          .map((space, spaceIndex) => (
            <Card key={space.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-xl text-gray-900">
                  Sección {spaceIndex + 1}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {space.components.length} componente{space.components.length !== 1 ? 's' : ''} • 
                  {space.columns} columna{space.columns > 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div
                  className={cn(
                    'grid gap-6',
                    space.columns === 1 && 'grid-cols-1',
                    space.columns === 2 && 'grid-cols-1 lg:grid-cols-2',
                    space.columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  )}
                >
                  {Array.from({ length: space.columns }).map((_, columnIndex) => {
                    const columnComponents = space.components
                      .filter(comp => comp.columnIndex === columnIndex)
                      .sort((a, b) => (a.order || 0) - (b.order || 0));

                    return (
                      <div key={columnIndex} className="space-y-6">
                        {columnComponents.map((component) => (
                          <Card key={component.id} className="border border-gray-200">
                            <CardHeader className="pb-4">
                              <CardTitle className="text-lg text-gray-900">
                                {component.config.title}
                              </CardTitle>
                              {component.config.subtitle && (
                                <p className="text-sm text-gray-600">
                                  {component.config.subtitle}
                                </p>
                              )}
                            </CardHeader>
                            <CardContent>
                              <PreviewChart component={component} />
                            </CardContent>
                          </Card>
                        ))}
                        
                        {columnComponents.length === 0 && (
                          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                            <p className="text-gray-500">Columna {columnIndex + 1} vacía</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Report Footer */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Informe generado automáticamente por el Sistema Energeia
            </p>
            <p className="text-xs text-gray-500">
              © 2024 Energeia - Todos los derechos reservados
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
              <Badge variant="outline" className="text-xs">
                Versión Demo
              </Badge>
              <Badge variant="outline" className="text-xs">
                Datos Simulados
              </Badge>
              <Badge variant="outline" className="text-xs">
                {config.spaces.length} Sección{config.spaces.length !== 1 ? 'es' : ''}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}