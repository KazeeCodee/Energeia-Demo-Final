'use client';

import { useState, useEffect } from 'react';
import { ChartComponent, ChartConfig, DataSource, ChartComponentType } from '@/lib/types/constructor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, PieChart, TrendingUp, DollarSign, BarChart3, LineChart, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Constants ──────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  ['#FF7A00', '#64748B', '#3B82F6', '#8B5CF6'],
  ['#EF4444', '#F97316', '#EAB308', '#22C55E'],
  ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6'],
  ['#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0'],
];

const CHART_META: Record<ChartComponentType, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  bg: string;
}> = {
  'generation-mix':   { label: 'Mix de Generación',     icon: PieChart,    accent: 'text-orange-600', bg: 'bg-orange-50' },
  'demand-trend':     { label: 'Tendencia de Demanda',   icon: TrendingUp,  accent: 'text-blue-600',   bg: 'bg-blue-50'   },
  'cost-comparison':  { label: 'Comparación de Costos',  icon: DollarSign,  accent: 'text-green-600',  bg: 'bg-green-50'  },
  'multi-series':     { label: 'Gráfico Multi-Serie',    icon: LineChart,   accent: 'text-violet-600', bg: 'bg-violet-50' },
  'custom-bar':       { label: 'Gráfico de Barras',      icon: BarChart3,   accent: 'text-slate-600',  bg: 'bg-slate-50'  },
  'custom-line':      { label: 'Gráfico de Líneas',      icon: Activity,    accent: 'text-slate-600',  bg: 'bg-slate-50'  },
  'custom-pie':       { label: 'Gráfico Circular',       icon: PieChart,    accent: 'text-slate-600',  bg: 'bg-slate-50'  },
};

// ── Props ──────────────────────────────────────────────────────────────────

interface ChartComponentConfigProps {
  component: ChartComponent | null;
  availableDataSources: DataSource[];
  onConfigChange: (componentId: string, updates: Partial<ChartComponent>) => void;
  onClose: () => void;
}

// ── Section wrapper ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      {children}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function ChartComponentConfig({
  component,
  availableDataSources,
  onConfigChange,
  onClose,
}: ChartComponentConfigProps) {
  const [localConfig, setLocalConfig] = useState<ChartConfig | null>(null);
  const [selectedDataSource, setSelectedDataSource] = useState('');

  useEffect(() => {
    if (component) {
      setLocalConfig(component.config);
      setSelectedDataSource(component.dataSource.id);
    } else {
      setLocalConfig(null);
      setSelectedDataSource('');
    }
  }, [component]);

  if (!component || !localConfig) return null;

  const meta = CHART_META[component.type];
  const Icon = meta.icon;

  function updateConfig(updates: Partial<ChartConfig>) {
    const next = { ...localConfig!, ...updates };
    setLocalConfig(next);
    onConfigChange(component!.id, { config: next });
  }

  function handleDataSource(id: string) {
    const ds = availableDataSources.find(d => d.id === id);
    if (ds) {
      setSelectedDataSource(id);
      onConfigChange(component!.id, { dataSource: ds });
    }
  }

  const compatibleSources = availableDataSources.filter(ds => {
    switch (component.type) {
      case 'generation-mix':  return ds.type === 'energy-generation';
      case 'demand-trend':    return ds.type === 'demand';
      case 'cost-comparison': return ds.type === 'cost';
      default:                return true;
    }
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* ── Colored header ───────────────────────────────────────────────── */}
      <div className={cn('px-4 py-3 flex items-center justify-between border-b border-slate-100', meta.bg)}>
        <div className="flex items-center gap-2.5">
          <div className={cn('w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shadow-sm', meta.accent)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Configurar</p>
            <p className={cn('text-sm font-bold', meta.accent)}>{meta.label}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Form body ────────────────────────────────────────────────────── */}
      <div className="p-4 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto">

        {/* Texts */}
        <Section title="Textos">
          <div>
            <Label htmlFor="cfg-title" className="text-xs text-slate-600">Título</Label>
            <Input
              id="cfg-title"
              value={localConfig.title ?? ''}
              onChange={e => updateConfig({ title: e.target.value })}
              placeholder="Título del gráfico"
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="cfg-subtitle" className="text-xs text-slate-600">Subtítulo</Label>
            <Input
              id="cfg-subtitle"
              value={localConfig.subtitle ?? ''}
              onChange={e => updateConfig({ subtitle: e.target.value })}
              placeholder="Opcional"
              className="mt-1 h-8 text-sm"
            />
          </div>
        </Section>

        {/* Data source */}
        <Section title="Fuente de datos">
          <Select value={selectedDataSource} onValueChange={handleDataSource}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Seleccionar fuente" />
            </SelectTrigger>
            <SelectContent>
              {compatibleSources.map(ds => (
                <SelectItem key={ds.id} value={ds.id} className="text-sm">
                  {ds.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedDataSource && (
            <div className="flex flex-wrap gap-1 mt-1">
              {availableDataSources
                .find(ds => ds.id === selectedDataSource)
                ?.fields.map(f => (
                  <Badge key={f.id} variant="outline" className="text-xs py-0 px-1.5 font-normal">
                    {f.name}
                  </Badge>
                ))}
            </div>
          )}
        </Section>

        {/* Colors */}
        <Section title="Paleta de colores">
          <div className="grid grid-cols-2 gap-2">
            {PRESET_COLORS.map((set, i) => {
              const active = JSON.stringify(localConfig.colors) === JSON.stringify(set);
              return (
                <button
                  key={i}
                  onClick={() => updateConfig({ colors: set })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border-2 p-2.5 transition-all',
                    active
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-slate-100 bg-slate-50 hover:border-orange-300'
                  )}
                >
                  {set.map((c, j) => (
                    <span
                      key={j}
                      className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Height */}
        <Section title="Altura">
          <Select value={String(localConfig.height)} onValueChange={v => updateConfig({ height: parseInt(v) })}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                ['200', 'Compacto — 200px'],
                ['250', 'Pequeño — 250px'],
                ['300', 'Estándar — 300px'],
                ['350', 'Mediano — 350px'],
                ['400', 'Grande — 400px'],
                ['500', 'Extra grande — 500px'],
              ].map(([val, label]) => (
                <SelectItem key={val} value={val} className="text-sm">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Section>

        {/* Display options */}
        <Section title="Opciones">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="sw-legend" className="text-sm text-slate-700 font-normal cursor-pointer">
                Mostrar leyenda
              </Label>
              <Switch
                id="sw-legend"
                checked={localConfig.showLegend}
                onCheckedChange={v => updateConfig({ showLegend: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sw-tooltip" className="text-sm text-slate-700 font-normal cursor-pointer">
                Mostrar tooltips
              </Label>
              <Switch
                id="sw-tooltip"
                checked={localConfig.showTooltip}
                onCheckedChange={v => updateConfig({ showTooltip: v })}
              />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
