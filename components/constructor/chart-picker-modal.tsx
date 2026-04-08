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
    'generation-mix':          'Mix de Generación',
    'demand-trend':            'Tendencia de Demanda',
    'cost-comparison':         'Comparación de Costos',
    'multi-series':            'Gráfico Multi-Series',
    'custom-bar':              'Gráfico de Barras',
    'custom-line':             'Gráfico de Líneas',
    'custom-pie':              'Gráfico Circular',
    'kpi-card':                'KPI Energía',
    'demanda-anual':           'Demanda Año Móvil',
    'costos-mem-linea':        'Costos MEM — USD/MWh',
    'donut-guma':              'Demanda GUMA',
    'donut-gume':              'Demanda GUME',
    'renovable-bar':           'Porcentaje Renovable',
    'costos-abastecimiento':   'Costos de Abastecimiento',
    'argentina-map':           'Precios MEM vs Distribuidor',
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

  // Fuentes para tipos del informe real
  const reportSources: Partial<Record<ChartComponentType, DataSource>> = {
    'demanda-anual':          { id: 'demanda-anual',          name: 'Demanda Año Móvil',       type: 'demand',  fields: [], sampleData: [] },
    'costos-mem-linea':       { id: 'costos-mem',             name: 'Costos MEM USD/MWh',      type: 'cost',    fields: [], sampleData: [] },
    'donut-guma':             { id: 'guma',                   name: 'Demanda GUMA',            type: 'demand',  fields: [], sampleData: [] },
    'donut-gume':             { id: 'gume',                   name: 'Demanda GUME',            type: 'demand',  fields: [], sampleData: [] },
    'renovable-bar':          { id: 'renovable',              name: 'Porcentaje Renovable',    type: 'custom',  fields: [], sampleData: [] },
    'costos-abastecimiento':  { id: 'costos-abast',           name: 'Costos Abastecimiento',   type: 'cost',    fields: [], sampleData: [] },
    'kpi-card':               { id: 'kpi',                    name: 'KPI Energía',             type: 'custom',  fields: [], sampleData: [] },
    'argentina-map':          { id: 'argentina-map',          name: 'Precios por Distribuidor',type: 'custom',  fields: [], sampleData: [] },
  };
  if (reportSources[type]) return reportSources[type]!;

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

type Category = 'energy' | 'demand' | 'cost' | 'custom' | 'report';

interface ChartInfo {
  type: ChartComponentType;
  name: string;
  description: string;
  category: Category;
  preview: React.ReactNode;
}

function KpiPreview() {
  return (
    <svg viewBox="0 0 48 32" className="w-12 h-8">
      <text x="2" y="22" fontSize="18" fontWeight="bold" fill="#1e293b">374</text>
      <text x="34" y="22" fontSize="9" fill="#64748b">MWh</text>
      <text x="2" y="30" fontSize="6" fill="#22a55b">▲ +3.2%</text>
    </svg>
  );
}

function MapPreview() {
  return (
    <svg viewBox="0 0 40 48" className="w-10 h-12">
      <path d="M18 2 L28 4 L34 10 L36 20 L32 32 L28 42 L22 46 L16 44 L10 36 L6 26 L8 14 L12 6 Z" fill="#E8460A" opacity="0.9" stroke="white" strokeWidth="0.8" />
      <path d="M18 2 L28 4 L26 14 L18 16 L10 14 L12 6 Z" fill="#C83A08" opacity="0.6" stroke="white" strokeWidth="0.5" />
      <path d="M8 14 L18 16 L26 14 L28 24 L22 28 L14 26 L6 26 Z" fill="#E8460A" opacity="0.7" stroke="white" strokeWidth="0.5" />
    </svg>
  );
}

function HBarPreview() {
  return (
    <svg viewBox="0 0 48 28" className="w-12 h-7">
      <rect x="2" y="4"  width="36" height="7" rx="3" fill="#22A55B" opacity="0.85" />
      <rect x="2" y="16" width="28" height="7" rx="3" fill="#E8460A" opacity="0.85" />
      <text x="40" y="10" fontSize="7" fill="#64748b">71</text>
      <text x="32" y="22" fontSize="7" fill="#64748b">64</text>
    </svg>
  );
}

const CHARTS: ChartInfo[] = [
  // ── Del informe energético real ──────────────────────────────────────────
  {
    type: 'demanda-anual',
    name: 'Demanda Año Móvil',
    description: 'Barras mensuales de demanda energética (MWh) — últimos 12 meses',
    category: 'report',
    preview: <BarPreview />,
  },
  {
    type: 'costos-mem-linea',
    name: 'Costos MEM',
    description: 'Línea de costos USD/MWh con línea de promedio de referencia',
    category: 'report',
    preview: <LinePreview />,
  },
  {
    type: 'donut-guma',
    name: 'Demanda GUMA',
    description: 'Donut MATER / SPOT / PLUS para demanda GUMA',
    category: 'report',
    preview: <PiePreview donut />,
  },
  {
    type: 'donut-gume',
    name: 'Demanda GUME',
    description: 'Donut MATER / SPOT / PLUS para demanda GUME',
    category: 'report',
    preview: <PiePreview donut />,
  },
  {
    type: 'renovable-bar',
    name: 'Porcentaje Renovable',
    description: 'Barras horizontales de porcentaje renovable por punto de suministro',
    category: 'report',
    preview: <HBarPreview />,
  },
  {
    type: 'costos-abastecimiento',
    name: 'Costos de Abastecimiento',
    description: 'Barras horizontales de costos Renovable vs CAMMESA en USD/MWh',
    category: 'report',
    preview: <HBarPreview />,
  },
  {
    type: 'kpi-card',
    name: 'Tarjeta KPI',
    description: 'Número grande con variación MoM y YoY — ideal para métricas clave',
    category: 'report',
    preview: <KpiPreview />,
  },
  {
    type: 'generation-mix',
    name: 'Mix de Generación',
    description: 'Donut con Térmica, Hidráulica, Nuclear y Renovable',
    category: 'report',
    preview: <PiePreview />,
  },
  {
    type: 'argentina-map',
    name: 'Mapa Argentina',
    description: 'Mapa de provincias con precios MEM por distribuidor',
    category: 'report',
    preview: <MapPreview />,
  },
  // ── Personalizados ────────────────────────────────────────────────────────
  {
    type: 'custom-bar',
    name: 'Barras',
    description: 'Gráfico de barras para datos categóricos personalizados',
    category: 'custom',
    preview: <BarPreview />,
  },
  {
    type: 'custom-line',
    name: 'Línea',
    description: 'Línea para tendencias temporales personalizadas',
    category: 'custom',
    preview: <LinePreview />,
  },
  {
    type: 'custom-pie',
    name: 'Circular',
    description: 'Torta / donut para distribuciones porcentuales',
    category: 'custom',
    preview: <PiePreview donut />,
  },
];

const CATEGORY_TABS: { key: Category | 'all'; label: string }[] = [
  { key: 'all',    label: 'Todos'         },
  { key: 'report', label: 'Informe'       },
  { key: 'custom', label: 'Personalizado' },
];

const CATEGORY_DOT: Record<Category, string> = {
  energy: 'bg-orange-400',
  demand: 'bg-blue-400',
  cost:   'bg-green-400',
  custom: 'bg-slate-400',
  report: 'bg-orange-500',
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
