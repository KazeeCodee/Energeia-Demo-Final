'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building2, Filter, RotateCcw } from 'lucide-react';

interface EnergyReportFiltersProps {
  onFiltersChange: (filters: {
    period: string;
    companies: string[];
    supplyPoint: string;
  }) => void;
}

export function EnergyReportFilters({ onFiltersChange }: EnergyReportFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-08');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(['all']);
  const [selectedSupplyPoint, setSelectedSupplyPoint] = useState('all');

  const periods = [
    { value: '2025-08', label: 'Agosto 2025 (1 mes)' },
    { value: '2025-07', label: 'Julio-Agosto 2025 (2 meses)' },
    { value: '2025-06', label: 'Junio-Agosto 2025 (3 meses)' },
    { value: '2025-05', label: 'Mayo-Agosto 2025 (4 meses)' },
    { value: '2025-04', label: 'Abril-Agosto 2025 (5 meses)' },
    { value: '2025-03', label: 'Marzo-Agosto 2025 (6 meses)' },
    { value: '2025-02', label: 'Febrero-Agosto 2025 (7 meses)' },
    { value: '2025-01', label: 'Enero-Agosto 2025 (8 meses)' },
    { value: '2024-12', label: 'Diciembre 2024-Agosto 2025 (9 meses)' },
    { value: '2024-11', label: 'Noviembre 2024-Agosto 2025 (10 meses)' },
    { value: '2024-10', label: 'Octubre 2024-Agosto 2025 (11 meses)' },
    { value: '2024-09', label: 'Septiembre 2024-Agosto 2025 (12 meses)' },
  ];

  const companies = [
    { value: 'all', label: 'Todas las empresas' },
    { value: 'santa-rita', label: 'Santa Rita Metalúrgica S.A.' },
    { value: 'aceros-del-sur', label: 'Aceros del Sur S.A.' },
    { value: 'metalurgica-norte', label: 'Metalúrgica Norte S.A.' },
    { value: 'siderurgica-central', label: 'Siderúrgica Central S.A.' },
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
      companies: selectedCompanies,
      supplyPoint: selectedSupplyPoint,
    });
  };

  const handleResetFilters = () => {
    setSelectedPeriod('2025-08');
    setSelectedCompanies(['all']);
    setSelectedSupplyPoint('all');
    onFiltersChange({
      period: '2025-08',
      companies: ['all'],
      supplyPoint: 'all',
    });
  };

  const getSelectedCompanyLabel = () => {
    if (selectedCompanies.includes('all')) return 'Todas las empresas';
    if (selectedCompanies.length === 1) {
      return companies.find(c => c.value === selectedCompanies[0])?.label || '';
    }
    return `${selectedCompanies.length} empresas seleccionadas`;
  };

  const getSelectedSupplyPointLabel = () => {
    return supplyPoints.find(sp => sp.value === selectedSupplyPoint)?.label || 'Todos los puntos';
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-orange-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
          <Filter className="h-5 w-5 mr-2 text-orange-500" />
          Filtros de Informe Energético
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

          {/* Company Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-orange-500" />
              Empresas
            </label>
            <Select 
              value={selectedCompanies.includes('all') ? 'all' : selectedCompanies[0]} 
              onValueChange={(value) => setSelectedCompanies([value])}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.value} value={company.value}>
                    {company.label}
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
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {getSelectedCompanyLabel()}
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
            <strong>Tip:</strong> Los informes se actualizan mensualmente. 
            Selecciona diferentes períodos para comparar la evolución energética.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}