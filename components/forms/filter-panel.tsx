'use client';

import { useState, useEffect } from 'react';
import { ReportFilters } from '@/lib/types';
import { useFilterPersistence } from '@/lib/hooks/use-persistence';
import { useAuthStore } from '@/lib/state/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, RotateCcw, Save, History } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FilterPanelProps {
  onFiltersChange: (filters: ReportFilters) => void;
  initialFilters?: ReportFilters;
  showCompanyScope?: boolean; // Solo para backoffice
  isLoading?: boolean;
}

export function FilterPanel({ 
  onFiltersChange, 
  initialFilters, 
  showCompanyScope = false,
  isLoading = false 
}: FilterPanelProps) {
  const { user } = useAuthStore();
  const { presets, savePreset, applyPreset, trackFilterApplication } = useFilterPersistence(user?.id);
  
  const [filters, setFilters] = useState<ReportFilters>(
    initialFilters || {
      period: {
        type: 'month',
        value: new Date().toISOString().slice(0, 7), // Current month YYYY-MM
      },
      mode: 'compare',
      scope: 'all',
      viewMode: 'aggregated',
    }
  );

  const [tempRangeStart, setTempRangeStart] = useState('');
  const [tempRangeEnd, setTempRangeEnd] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
      
      // Set temp range values if it's a range filter
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

    // Update filters if both values are present
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

  const handleApplyFilters = () => {
    // Track filter application
    trackFilterApplication(filters);
    
    onFiltersChange(filters);
  };

  const handleSavePreset = async () => {
    if (presetName.trim()) {
      await savePreset(presetName.trim(), filters);
      setPresetName('');
      setShowSaveDialog(false);
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const presetFilters = applyPreset(presetId);
    if (presetFilters) {
      setFilters(presetFilters);
      onFiltersChange(presetFilters);
    }
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
    };
    
    setFilters(defaultFilters);
    setTempRangeStart('');
    setTempRangeEnd('');
    onFiltersChange(defaultFilters);
  };

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
    <Card className="card-responsive">
      <div className="flex items-center space-x-3 mb-6">
        <Filter className="h-5 w-5 text-orange-500" aria-hidden="true" />
        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Filtros de Informes</h2>
      </div>

      <form 
        className="space-y-6"
        role="search"
        aria-label="Filtros para informes energéticos"
        onSubmit={(e) => {
          e.preventDefault();
          handleApplyFilters();
        }}
      >
        {/* Período */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-gray-700">Período</legend>
          
          <div 
            className="flex flex-wrap gap-2 mb-3"
            role="radiogroup"
            aria-label="Tipo de período"
          >
            <Button
              type="button"
              variant={filters.period.type === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodTypeChange('month')}
              aria-pressed={filters.period.type === 'month'}
              className="focus-visible-ring"
            >
              Mes específico
            </Button>
            <Button
              type="button"
              variant={filters.period.type === 'range' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodTypeChange('range')}
              aria-pressed={filters.period.type === 'range'}
              className="focus-visible-ring"
            >
              Rango personalizado
            </Button>
            <Button
              type="button"
              variant={filters.period.type === 'preset' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodTypeChange('preset')}
              aria-pressed={filters.period.type === 'preset'}
              className="focus-visible-ring"
            >
              Presets rápidos
            </Button>
          </div>

          {filters.period.type === 'month' && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input
                type="month"
                value={filters.period.value as string}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="max-w-xs focus-visible-ring"
                aria-label="Seleccionar mes específico"
              />
            </div>
          )}

          {filters.period.type === 'range' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="range-start" className="text-xs text-gray-600">Desde</Label>
                <Input
                  id="range-start"
                  type="month"
                  value={tempRangeStart}
                  onChange={(e) => handleRangeChange('start', e.target.value)}
                  className="focus-visible-ring"
                  aria-label="Fecha de inicio del rango"
                />
              </div>
              <div>
                <Label htmlFor="range-end" className="text-xs text-gray-600">Hasta</Label>
                <Input
                  id="range-end"
                  type="month"
                  value={tempRangeEnd}
                  onChange={(e) => handleRangeChange('end', e.target.value)}
                  className="focus-visible-ring"
                  aria-label="Fecha de fin del rango"
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
        </fieldset>

        {/* Modo de Visualización */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-gray-700">Modo de Visualización</legend>
          
          <div 
            className="flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Modo de visualización de datos"
          >
            <Button
              type="button"
              variant={filters.mode === 'compare' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('compare')}
              aria-pressed={filters.mode === 'compare'}
              className="focus-visible-ring"
            >
              Comparar
            </Button>
            <Button
              type="button"
              variant={filters.mode === 'accumulate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('accumulate')}
              aria-pressed={filters.mode === 'accumulate'}
              className="focus-visible-ring"
            >
              Acumular
            </Button>
            <Button
              type="button"
              variant={filters.mode === 'average' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('average')}
              aria-pressed={filters.mode === 'average'}
              className="focus-visible-ring"
            >
              Promedio
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            {filters.mode === 'compare' && 'Muestra series de datos superpuestas para comparación'}
            {filters.mode === 'accumulate' && 'Suma los valores de los períodos seleccionados'}
            {filters.mode === 'average' && 'Calcula y muestra los valores promedio del período'}
          </p>
        </fieldset>

        {/* Resumen de filtros aplicados */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Filtros Aplicados</Label>
          
          <div 
            className="flex flex-wrap gap-2"
            role="status"
            aria-live="polite"
            aria-label="Resumen de filtros seleccionados"
          >
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
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
          <Button 
            type="submit"
            disabled={isLoading}
            className="flex-1 focus-visible-ring"
            aria-describedby="apply-filters-description"
          >
            {isLoading ? 'Aplicando...' : 'Aplicar Filtros'}
          </Button>
          
          <div className="flex space-x-2">
            {/* Save Preset Button */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  disabled={isLoading}
                  className="focus-visible-ring"
                  aria-label="Guardar filtros como preset"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Guardar Preset de Filtros</DialogTitle>
                  <DialogDescription>
                    Guarda la configuración actual de filtros para uso futuro.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="preset-name">Nombre del preset</Label>
                    <Input
                      id="preset-name"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="Ej: Análisis trimestral"
                      className="focus-visible-ring"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Load Preset Dropdown */}
            {presets.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    disabled={isLoading}
                    className="focus-visible-ring"
                    aria-label="Cargar preset guardado"
                  >
                    <History className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Presets Guardados</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {presets.map((preset) => (
                    <DropdownMenuItem
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.id)}
                      className="flex flex-col items-start space-y-1"
                    >
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs text-gray-500">
                        Usado {preset.usageCount} veces
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button 
              type="button"
              variant="outline" 
              onClick={handleClearFilters}
              disabled={isLoading}
              className="focus-visible-ring"
              aria-label="Limpiar todos los filtros"
            >
              <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
              Limpiar
            </Button>
          </div>
        </div>
        <div id="apply-filters-description" className="sr-only">
          Aplica los filtros seleccionados para actualizar los informes mostrados
        </div>
      </form>
    </Card>
  );
}