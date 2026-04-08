'use client';

import { useState } from 'react';
import { ChartComponent, ChartComponentType, DataSource } from '@/lib/types/constructor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ── Helpers ────────────────────────────────────────────────────────────────

export function getDefaultTitle(type: ChartComponentType): string {
  const titles: Record<ChartComponentType, string> = {
    'generation-mix': 'Mix de Generación',
    'demand-trend': 'Tendencia de Demanda',
    'cost-comparison': 'Comparación de Costos',
    'multi-series': 'Gráfico Multi-Series',
    'custom-bar': 'Gráfico de Barras',
    'custom-line': 'Gráfico de Líneas',
    'custom-pie': 'Gráfico Circular',
  };
  return titles[type] ?? 'Gráfico';
}

export function getDefaultDataSource(type: ChartComponentType): DataSource {
  const sources: Partial<Record<ChartComponentType, DataSource>> = {
    'generation-mix': {
      id: 'energy-generation',
      name: 'Generación de Energía',
      type: 'energy-generation',
      fields: [
        { id: 'thermal',   name: 'Térmica',   type: 'percentage', required: true },
        { id: 'hydraulic', name: 'Hidráulica', type: 'percentage', required: true },
        { id: 'nuclear',   name: 'Nuclear',    type: 'percentage', required: true },
        { id: 'renewable', name: 'Renovable',  type: 'percentage', required: true },
      ],
      sampleData: [{ thermal: 45, hydraulic: 25, nuclear: 15, renewable: 15 }],
    },
    'demand-trend': {
      id: 'demand-trend',
      name: 'Tendencia de Demanda',
      type: 'demand',
      fields: [
        { id: 'month',     name: 'Mes',            type: 'string',     required: true  },
        { id: 'demand',    name: 'Demanda (MWh)',   type: 'number',     required: true  },
        { id: 'variation', name: 'Variación (%)',   type: 'percentage', required: false },
      ],
      sampleData: [
        { month: 'Ene', demand: 1200, variation: 5.2 },
        { month: 'Feb', demand: 1150, variation: -2.1 },
        { month: 'Mar', demand: 1300, variation: 8.7 },
      ],
    },
    'cost-comparison': {
      id: 'cost-comparison',
      name: 'Comparación de Costos',
      type: 'cost',
      fields: [
        { id: 'category', name: 'Categoría',       type: 'string', required: true  },
        { id: 'cost',     name: 'Costo (USD/MWh)', type: 'number', required: true  },
        { id: 'budget',   name: 'Presupuesto',     type: 'number', required: false },
      ],
      sampleData: [
        { category: 'CAMMESA',   cost: 45.2, budget: 50.0 },
        { category: 'PLUS',      cost: 38.7, budget: 40.0 },
        { category: 'Renovable', cost: 42.1, budget: 45.0 },
      ],
    },
  };

  return sources[type] ?? {
    id: 'custom-data',
    name: 'Datos Personalizados',
    type: 'custom',
    fields: [
      { id: 'category', name: 'Categoría', type: 'string', required: true },
      { id: 'value',    name: 'Valor',     type: 'number', required: true },
    ],
    sampleData: [
      { category: 'A', value: 100 },
      { category: 'B', value: 200 },
      { category: 'C', value: 150 },
    ],
  };
}

function buildComponent(type: ChartComponentType, columnIndex: number): ChartComponent {
  return {
    id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    columnIndex,
    config: {
      title: getDefaultTitle(type),
      subtitle: '',
      height: 300,
      colors: ['#FF7A00', '#64748B', '#3B82F6', '#8B5CF6'],
      showLegend: true,
      showTooltip: true,
    },
    dataSource: getDefaultDataSource(type),
  };
}

// ── Mini chart previews ────────────────────────────────────────────────────

function PiePreview({ donut = false }: { donut?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="w-10 h-10">
      <circle cx="20" cy="20" r="16" fill="none" stroke="#FF7A00" strokeWidth="8" strokeDasharray="50 50" strokeDashoffset="0" />
      <circle cx="20" cy="20" r="16" fill="none" stroke="#3B82F6" strokeWidth="8" strokeDasharray="30 70" strokeDashoffset="-50" />
      <circle cx="20" cy="20" r="16" fill="none" stroke="#8B5CF6" strokeWidth="8" strokeDasharray="20 80" strokeDashoffset="-80" />
      {donut && <circle cx="20" cy="20" r="8" fill="white" />}
    </svg>
  );
}

function BarPreview() {
  const bars = [60, 85, 45, 95, 70, 55];
  return (
    <svg viewBox="0 0 48 32" className="w-12 h-8">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 8 + 1}
          y={32 - h * 0.28}
          width="6"
          height={h * 0.28}
          rx="1"
          fill={i % 2 === 0 ? '#FF7A00' : '#64748B'}
          opacity={0.85}
        />
      ))}
    </svg>
  );
}

function LinePreview({ multi = false }: { multi?: boolean }) {
  return (
    <svg viewBox="0 0 48 32" className="w-12 h-8">
      <polyline points="2,24 10,16 18,20 26,10 34,15 46,6" fill="none" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {multi && (
        <polyline points="2,28 10,22 18,26 26,18 34,22 46,14" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function CostPreview() {
  return (
    <svg viewBox="0 0 48 32" className="w-12 h-8">
      <rect x="2"  y="10" width="8" height="22" rx="1" fill="#64748B" opacity="0.7" />
      <rect x="13" y="6"  width="8" height="26" rx="1" fill="#94A3B8" opacity="0.7" />
      <rect x="24" y="14" width="8" height="18" rx="1" fill="#64748B" opacity="0.7" />
      <rect x="35" y="4"  width="8" height="28" rx="1" fill="#94A3B8" opacity="0.7" />
      <polyline points="6,8 17,5 28,12 39,3" fill="none" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Catalogue ──────────────────────────────────────────────────────────────

type Category = 'energy' | 'demand' | 'cost' | 'custom';

interface ChartInfo {
  type: ChartComponentType;
  name: string;
  description: string;
  category: Category;
  preview: React.ReactNode;
}

const CHARTS: ChartInfo[] = [
  {
    type: 'generation-mix',
    name: 'Mix de Generación',
    description: 'Distribución por tipo: Térmica, Hidráulica, Nuclear, Renovable',
    category: 'energy',
    preview: <PiePreview />,
  },
  {
    type: 'demand-trend',
    name: 'Tendencia de Demanda',
    description: 'Evolución de la demanda energética en MWh',
    category: 'demand',
    preview: <LinePreview />,
  },
  {
    type: 'cost-comparison',
    name: 'Comparación de Costos',
    description: 'Barras + línea para costos vs presupuesto',
    category: 'cost',
    preview: <CostPreview />,
  },
  {
    type: 'multi-series',
    name: 'Multi-Series',
    description: 'Varias líneas para comparar series de datos',
    category: 'custom',
    preview: <LinePreview multi />,
  },
  {
    type: 'custom-bar',
    name: 'Barras',
    description: 'Gráfico de barras para datos categóricos',
    category: 'custom',
    preview: <BarPreview />,
  },
  {
    type: 'custom-line',
    name: 'Línea',
    description: 'Línea para tendencias temporales',
    category: 'custom',
    preview: <LinePreview />,
  },
  {
    type: 'custom-pie',
    name: 'Circular',
    description: 'Torta para distribuciones porcentuales',
    category: 'custom',
    preview: <PiePreview donut />,
  },
];

const CATEGORY_TABS: { key: Category | 'all'; label: string }[] = [
  { key: 'all',    label: 'Todos'         },
  { key: 'energy', label: 'Energía'       },
  { key: 'demand', label: 'Demanda'       },
  { key: 'cost',   label: 'Costos'        },
  { key: 'custom', label: 'Personalizado' },
];

const CATEGORY_DOT: Record<Category, string> = {
  energy: 'bg-orange-400',
  demand: 'bg-blue-400',
  cost:   'bg-green-400',
  custom: 'bg-slate-400',
};

// ── Component ──────────────────────────────────────────────────────────────

interface ChartPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnIndex: number;
  onSelect: (component: ChartComponent) => void;
}

export function ChartPickerModal({
  open,
  onOpenChange,
  columnIndex,
  onSelect,
}: ChartPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  const filtered = activeCategory === 'all'
    ? CHARTS
    : CHARTS.filter(c => c.category === activeCategory);

  function handleSelect(type: ChartComponentType) {
    onSelect(buildComponent(type, columnIndex));
    onOpenChange(false);
    setActiveCategory('all');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        {/* Modal header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">
              Elegir tipo de gráfico
            </DialogTitle>
          </DialogHeader>

          {/* Category tabs */}
          <div className="flex gap-1 mt-3 flex-wrap">
            {CATEGORY_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  activeCategory === key
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart grid */}
        <div className="px-6 py-4 grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
          {filtered.map((chart) => (
            <button
              key={chart.type}
              onClick={() => handleSelect(chart.type)}
              className={cn(
                'group text-left rounded-xl border-2 border-slate-100 bg-slate-50 p-4',
                'hover:border-orange-400 hover:bg-white hover:shadow-md',
                'transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500'
              )}
            >
              {/* Preview + name row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div className={cn('w-2 h-2 rounded-full', CATEGORY_DOT[chart.category])} />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {CATEGORY_TABS.find(c => c.key === chart.category)?.label}
                  </span>
                </div>
                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                  {chart.preview}
                </div>
              </div>

              <p className="text-sm font-semibold text-slate-800 leading-tight">{chart.name}</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">{chart.description}</p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
