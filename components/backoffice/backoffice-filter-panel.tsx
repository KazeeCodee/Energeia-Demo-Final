'use client';

import { useState, useEffect } from 'react';
import { ReportFilters } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Calendar, Filter, RotateCcw, Building2, Users, Eye } from 'lucide-react';

interface BackofficeFilterPanelProps {
  onFiltersChange: (filters: ReportFilters) => void;
  initialFilters?: ReportFilters;
  companies: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export function BackofficeFilterPanel({ 
  onFiltersChange, 
  initialFilters, 
  companies,
  isLoading = false 
}: BackofficeFilterPanelProps) {
  const [filters, setFilters] = useState<ReportFilters>(
    initialFilters || {
      period: {
        type: 'month',
        value: new Date().toISOString().slice(0, 7),
      },
      mode: 'compare',
      scope: 'all',
      viewMode: 'aggregated',
      companies: [],
    }
  );

  const [tempRangeStart, setTempRangeStart] = useState('');
  const [tempRangeEnd, setTempRangeEnd] = useState('');
  const [companySearchTerm, setCompanySearchTerm] = useState('');

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
      
      if (initialFilters.period.type === 'range' && typeof initialFilters.period.value === 'object') {
        setTempRangeStart(initialFilters.period.value.start);
        setTempRangeEnd(initialFilters.period.value.end);
      }
    }
  }, [initialFilters]);

  const handlePeriodTypeChange = (type: 'month' | 'range' | 'preset') => {
    let newValue: string | { start: string; end: string };
    let preset: 'last3' | 'last6' | 'last12' | undefined;

    switch (type) {
      case 'month':
        newValue = new Date().toISOString().slice(0, 7);
        break;
      case 'range':
        newValue = { 
          start: tempRangeStart || new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().slice(0, 7),
          end: tempRangeEnd || new Date().toISOString().slice(0, 7)
        };
        break;
      case 'preset':
        preset = 'last3';
        newValue = 'last3';
        break;
      default:
        newValue = new Date().toISOString().slice(0, 7);
    }

    setFilters(prev => ({
      ...prev,
      period: {
        type,
        value: newValue,
        preset
      }
    }));
  };

  const handleMonthChange = (month: string) => {
    setFilters(prev => ({
      ...prev,
      period: {
        ...prev.period,
        value: month
      }
    }));
  };

  const handleRangeChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') {
      setTempRangeStart(value);
    } else {
      setTempRangeEnd(value);
    }

    if ((field === 'start' && tempRangeEnd) || (field === 'end' && tempRangeStart)) {
      const start = field === 'start' ? value : tempRangeStart;
      const end = field === 'end' ? value : tempRangeEnd;
      
      setFilters(prev => ({
        ...prev,
        period: {
          ...prev.period,
          value: { start, end }
        }
      }));
    }
  };

  const handlePresetChange = (preset: 'last3' | 'last6' | 'last12') => {
    setFilters(prev => ({
      ...prev,
      period: {
        type: 'preset',
        value: preset,
        preset
      }
    }));
  };

  const handleModeChange = (mode: 'compare' | 'accumulate' | 'average') => {
    setFilters(prev => ({
      ...prev,
      mode
    }));
  };

  const handleScopeChange = (scope: 'all' | 'selected') => {
    setFilters(prev => ({
      ...prev,
      scope,
      companies: scope === 'all' ? [] : prev.companies || []
    }));
  };

  const handleViewModeChange = (viewMode: 'aggregated' | 'by_company') => {
    setFilters(prev => ({
      ...prev,
      viewMode
    }));
  };

  const handleCompanyToggle = (companyId: string, checked: boolean) => {
    setFilters(prev => {
      const currentCompanies = prev.companies || [];
      const newCompanies = checked
        ? [...currentCompanies, companyId]
        : currentCompanies.filter(id => id !== companyId);
      
      return {
        ...prev,
        companies: newCompanies,
        scope: newCompanies.length === 0 ? 'all' : 'selected'
      };
    });
  };

  const handleSelectAllCompanies = () => {
    const allCompanyIds = companies.map(c => c.id);
    setFilters(prev => ({
      ...prev,
      companies: allCompanyIds,
      scope: 'selected'
    }));
  };

  const handleDeselectAllCompanies = () => {
    setFilters(prev => ({
      ...prev,
      companies: [],
      scope: 'all'
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
  };

  const handleClearFilters = () => {
    const defaultFilters: ReportFilters = {
      period: {
        type: 'month',
        value: new Date().toISOString().slice(0, 7),
      },
      mode: 'compare',
      scope: 'all',
      viewMode: 'aggregated',
      companies: [],
    };
    
    setFilters(defaultFilters);
    setTempRangeStart('');
    setTempRangeEnd('');
    setCompanySearchTerm('');
    onFiltersChange(defaultFilters);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
  );

  const selectedCompaniesCount = filters.companies?.length || 0;
  const isAllSelected = filters.scope === 'all' || selectedCompaniesCount === companies.length;

  const getPresetLabel = (preset: string) => {
    switch (preset) {
      case 'last3': return 'Últimos 3 meses';
      case 'last6': return 'Últimos 6 meses';
      case 'last12': return 'Últimos 12 meses';
      default: return preset;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'compare': return 'Comparar';
      case 'accumulate': return 'Acumular';
      case 'average': return 'Promedio';
      default: return mode;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Filter className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Period and Mode */}
        <div className="space-y-6">
          {/* Período */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Período</Label>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Button
                variant={filters.period.type === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodTypeChange('month')}
              >
                Mes específico
              </Button>
              <Button
                variant={filters.period.type === 'range' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodTypeChange('range')}
              >
                Rango personalizado
              </Button>
              <Button
                variant={filters.period.type === 'preset' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodTypeChange('preset')}
              >
                Presets rápidos
              </Button>
            </div>

            {filters.period.type === 'month' && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="month"
                  value={filters.period.value as string}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            )}

            {filters.period.type === 'range' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-600">Desde</Label>
                  <Input
                    type="month"
                    value={tempRangeStart}
                    onChange={(e) => handleRangeChange('start', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Hasta</Label>
                  <Input
                    type="month"
                    value={tempRangeEnd}
                    onChange={(e) => handleRangeChange('end', e.target.value)}
                  />
                </div>
              </div>
            )}

            {filters.period.type === 'preset' && (
              <Select
                value={filters.period.preset}
                onValueChange={(value) => handlePresetChange(value as 'last3' | 'last6' | 'last12')}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Seleccionar preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last3">Últimos 3 meses</SelectItem>
                  <SelectItem value="last6">Últimos 6 meses</SelectItem>
                  <SelectItem value="last12">Últimos 12 meses</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Modo de Visualización */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Modo de Visualización</Label>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.mode === 'compare' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleModeChange('compare')}
              >
                Comparar
              </Button>
              <Button
                variant={filters.mode === 'accumulate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleModeChange('accumulate')}
              >
                Acumular
              </Button>
              <Button
                variant={filters.mode === 'average' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleModeChange('average')}
              >
                Promedio
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              {filters.mode === 'compare' && 'Muestra series de datos superpuestas para comparación'}
              {filters.mode === 'accumulate' && 'Suma los valores de los períodos seleccionados'}
              {filters.mode === 'average' && 'Calcula y muestra los valores promedio del período'}
            </p>
          </div>

          {/* Vista de Resultados */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Vista de Resultados</Label>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.viewMode === 'aggregated' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('aggregated')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Agregada
              </Button>
              <Button
                variant={filters.viewMode === 'by_company' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('by_company')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Por Empresa
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              {filters.viewMode === 'aggregated' && 'Combina datos de todas las empresas seleccionadas'}
              {filters.viewMode === 'by_company' && 'Muestra series separadas para benchmark entre empresas'}
            </p>
          </div>
        </div>

        {/* Right Column - Company Selection */}
        <div className="space-y-6">
          {/* Alcance de Empresas */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Alcance de Empresas</Label>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.scope === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleScopeChange('all')}
              >
                <Users className="h-4 w-4 mr-2" />
                Todas las Empresas
              </Button>
              <Button
                variant={filters.scope === 'selected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleScopeChange('selected')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Selección Específica
              </Button>
            </div>
          </div>

          {/* Company Selection */}
          {filters.scope === 'selected' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Empresas Seleccionadas ({selectedCompaniesCount}/{companies.length})
                </Label>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllCompanies}
                    disabled={isAllSelected}
                  >
                    Todas
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeselectAllCompanies}
                    disabled={selectedCompaniesCount === 0}
                  >
                    Ninguna
                  </Button>
                </div>
              </div>

              {/* Search */}
              <Input
                placeholder="Buscar empresas..."
                value={companySearchTerm}
                onChange={(e) => setCompanySearchTerm(e.target.value)}
                className="mb-3"
              />

              {/* Company List */}
              <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-2">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={company.id}
                      checked={filters.companies?.includes(company.id) || false}
                      onCheckedChange={(checked) => 
                        handleCompanyToggle(company.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={company.id}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {company.name}
                    </Label>
                  </div>
                ))}
                
                {filteredCompanies.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No se encontraron empresas
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Resumen de filtros aplicados */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Filtros Aplicados</Label>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            Período: {filters.period.type === 'month' 
              ? filters.period.value as string
              : filters.period.type === 'range' 
                ? `${(filters.period.value as any).start} - ${(filters.period.value as any).end}`
                : getPresetLabel(filters.period.preset || '')
            }
          </Badge>
          <Badge variant="secondary">
            Modo: {getModeLabel(filters.mode)}
          </Badge>
          <Badge variant="secondary">
            Vista: {filters.viewMode === 'aggregated' ? 'Agregada' : 'Por Empresa'}
          </Badge>
          <Badge variant="secondary">
            Empresas: {filters.scope === 'all' 
              ? `Todas (${companies.length})`
              : `${selectedCompaniesCount} seleccionadas`
            }
          </Badge>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <Button 
          onClick={handleApplyFilters}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleClearFilters}
          disabled={isLoading}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>
    </Card>
  );
}