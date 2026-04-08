'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building2, Filter, RotateCcw } from 'lucide-react';

interface ClientEnergyFiltersProps {
  onFiltersChange: (filters: {
    period: string;
    companies: string[];
    supplyPoint: string;
  }) => void;
  companyId: string;
}

export function ClientEnergyFilters({ onFiltersChange, companyId }: ClientEnergyFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-08');
  const [selectedSupplyPoint, setSelectedSupplyPoint] = useState('all');

  const periods = [
    { value: '2025-08', label: 'Agosto 2025' },
    { value: '2025-07', label: 'Julio 2025' },
    { value: '2025-06', label: 'Junio 2025' },
    { value: '2025-05', label: 'Mayo 2025' },
    { value: '2025-04', label: 'Abril 2025' },
    { value: '2025-03', label: 'Marzo 2025' },
    { value: '2025-02', label: 'Febrero 2025' },
    { value: '2025-01', label: 'Enero 2025' },
    { value: '2024-12', label: 'Diciembre 2024' },
    { value: '2024-11', label: 'Noviembre 2024' },
    { value: '2024-10', label: 'Octubre 2024' },
    { value: '2024-09', label: 'Septiembre 2024' },
  ];

  const supplyPoints = [
    { value: 'all', label: 'Todos los puntos' },
    { value: 'saripon', label: 'SARIPÓN' },
    { value: 'industrial-1', label: 'Industrial 1' },
    { value: 'industrial-2', label: 'Industrial 2' },
    { value: 'comercial-1', label: 'Comercial 1' },
  ];

  const handleApplyFilters = () => {
    onFiltersChange({
      period: selectedPeriod,
      companies: [companyId], // Always single company for clients
      supplyPoint: selectedSupplyPoint,
    });
  };

  const handleResetFilters = () => {
    setSelectedPeriod('2025-08');
    setSelectedSupplyPoint('all');
    onFiltersChange({
      period: '2025-08',
      companies: [companyId],
      supplyPoint: 'all',
    });
  };

  const getSelectedSupplyPointLabel = () => {
    return supplyPoints.find(sp => sp.value === selectedSupplyPoint)?.label || 'Todos los puntos';
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-orange-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
          <Filter className="h-5 w-5 mr-2 text-orange-500" />
          Filtros de Período y Punto de Suministro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Period Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-orange-500" />
              Período
            </label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supply Point Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-orange-500" />
              Punto de Suministro
            </label>
            <Select value={selectedSupplyPoint} onValueChange={setSelectedSupplyPoint}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supplyPoints.map((point) => (
                  <SelectItem key={point.value} value={point.value}>
                    {point.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {periods.find(p => p.value === selectedPeriod)?.label}
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {getSelectedSupplyPointLabel()}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            onClick={handleApplyFilters}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
          <Button 
            variant="outline" 
            onClick={handleResetFilters}
            className="border-gray-300 hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
        </div>

        {/* Quick Info */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Información:</strong> Este informe muestra los datos energéticos específicos de tu empresa. 
            Selecciona diferentes períodos para analizar la evolución temporal.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}