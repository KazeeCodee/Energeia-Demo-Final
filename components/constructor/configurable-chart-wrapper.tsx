'use client';

import dynamic from 'next/dynamic';
import { ChartComponent } from '@/lib/types/constructor';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, LabelList, ReferenceLine, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

const ArgentinaMap = dynamic(
  () => import('@/components/charts/argentina-map').then(m => m.ArgentinaMap),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-xs text-slate-400">Cargando mapa…</div> }
);

// ── Design tokens (igual que energy-report) ────────────────────────────────
const C = {
  orange:   '#E8460A',
  green:    '#22A55B',
  blue:     '#3B82F6',
  teal:     '#0EA5E9',
  brown:    '#7C3C21',
};

// ── Mock data ──────────────────────────────────────────────────────────────
const DEMAND_DATA = [
  { label: 'nov 24', value: 310 }, { label: 'dic 24', value: 290 },
  { label: 'ene 25', value: 320 }, { label: 'feb 25', value: 260 },
  { label: 'mar 25', value: 285 }, { label: 'abr 25', value: 240 },
  { label: 'may 25', value: 215 }, { label: 'jun 25', value: 180 },
  { label: 'jul 25', value: 161 }, { label: 'ago 25', value: 347 },
  { label: 'sep 25', value: 341 }, { label: 'oct 25', value: 374 },
];

const COST_DATA = [
  { month: 'nov 24', value: 52 }, { month: 'dic 24', value: 58 },
  { month: 'ene 25', value: 61 }, { month: 'feb 25', value: 55 },
  { month: 'mar 25', value: 63 }, { month: 'abr 25', value: 67 },
  { month: 'may 25', value: 71 }, { month: 'jun 25', value: 69 },
  { month: 'jul 25', value: 74 }, { month: 'ago 25', value: 78 },
  { month: 'sep 25', value: 72 }, { month: 'oct 25', value: 76 },
];

const GEN_MIX = [
  { name: 'Térmica',    value: 41.39, color: C.orange },
  { name: 'Hidráulica', value: 27.70, color: C.teal   },
  { name: 'Renovable',  value: 22.45, color: C.green  },
  { name: 'Nuclear',    value: 8.47,  color: C.brown  },
];

const GUMA_DATA = [
  { name: 'MATER', value: 67, color: C.green  },
  { name: 'SPOT',  value: 21, color: C.orange },
  { name: 'PLUS',  value: 12, color: C.blue   },
];
const GUME_DATA = [
  { name: 'MATER', value: 36, color: C.green  },
  { name: 'SPOT',  value: 48, color: C.orange },
  { name: 'PLUS',  value: 16, color: C.blue   },
];

// ── Shared wrapper ─────────────────────────────────────────────────────────
function ChartWrapper({ height, children }: { height: number; children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

function BarLabel(props: { x?: number; y?: number; width?: number; value?: number }) {
  const { x = 0, y = 0, width = 0, value } = props;
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 4} fill="#64748b" textAnchor="middle" fontSize={10} fontWeight={600}>
      {value}
    </text>
  );
}

// ── Individual chart renderers ─────────────────────────────────────────────

function DemandaAnualChart({ height }: { height: number }) {
  return (
    <ChartWrapper height={height}>
      <BarChart data={DEMAND_DATA} margin={{ top: 18, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: 'white', border: 'none', borderRadius: 10, fontSize: 11 }} cursor={{ fill: 'rgba(232,70,10,0.08)' }} />
        <Bar dataKey="value" fill={C.orange} radius={[4, 4, 0, 0]} maxBarSize={32}>
          <LabelList content={<BarLabel />} />
        </Bar>
      </BarChart>
    </ChartWrapper>
  );
}

function CostosMemChart({ height }: { height: number }) {
  const avg = Math.round(COST_DATA.reduce((s, d) => s + d.value, 0) / COST_DATA.length);
  return (
    <ChartWrapper height={height}>
      <LineChart data={COST_DATA} margin={{ top: 18, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: 'white', border: 'none', borderRadius: 10, fontSize: 11 }} />
        <ReferenceLine y={avg} stroke="#94a3b8" strokeDasharray="4 3" strokeWidth={1.5} />
        <Line type="monotone" dataKey="value" stroke={C.orange} strokeWidth={2.5}
          dot={{ fill: 'white', stroke: C.orange, strokeWidth: 2, r: 3 }}
          activeDot={{ r: 4, fill: C.orange }}>
          <LabelList dataKey="value" position="top" style={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }} />
        </Line>
      </LineChart>
    </ChartWrapper>
  );
}

function DonutChart({ data, label, height }: { data: typeof GUMA_DATA; label: string; height: number }) {
  return (
    <div style={{ height }} className="relative flex items-center gap-4">
      <div className="relative" style={{ width: 120, height: 120, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={36} outerRadius={54}
              dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-extrabold text-slate-800 leading-tight">{label}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-slate-600 font-medium">{item.name} {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RenovableBarChart({ height }: { height: number }) {
  return (
    <div style={{ height }} className="flex flex-col justify-center space-y-4 px-2">
      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
          <span>SARIPÓN</span><span style={{ color: C.green }}>71 %</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-5">
          <div className="h-5 rounded-full" style={{ width: '71%', backgroundColor: C.green }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
          <span>Renovable Total</span><span style={{ color: C.blue }}>24 %</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-5">
          <div className="h-5 rounded-full" style={{ width: '24%', backgroundColor: C.blue }} />
        </div>
      </div>
    </div>
  );
}

function CostosAbastecimientoChart({ height }: { height: number }) {
  const items = [
    { name: 'Renovable', val: 71.67, color: C.green },
    { name: 'CAMMESA',   val: 64.14, color: C.orange },
  ];
  return (
    <div style={{ height }} className="flex flex-col justify-center space-y-5 px-2">
      {items.map(row => (
        <div key={row.name}>
          <p className="text-xs font-semibold text-slate-500 mb-1">{row.name}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-100 rounded-full h-4">
              <div className="h-4 rounded-full" style={{ width: `${(row.val / 120) * 100}%`, backgroundColor: row.color }} />
            </div>
            <span className="text-xs font-bold text-slate-700 w-10 text-right">{row.val}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function KpiCardChart({ title, height }: { title: string; height: number }) {
  return (
    <div style={{ height }} className="flex flex-col justify-center">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title || 'KPI Energía'}</p>
      <p className="text-4xl font-extrabold text-slate-900 leading-none">
        12.450 <span className="text-xl font-bold text-slate-500 ml-1">MWh</span>
      </p>
      <div className="flex gap-4 mt-3">
        <div className="text-center">
          <div className="flex items-center gap-1 font-semibold text-base text-green-600">
            <TrendingUp className="h-3 w-3" />+3.2 %
          </div>
          <p className="text-xs text-slate-400 font-medium">MoM</p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-1 font-semibold text-base text-green-600">
            <TrendingUp className="h-3 w-3" />+8.1 %
          </div>
          <p className="text-xs text-slate-400 font-medium">YoY</p>
        </div>
      </div>
    </div>
  );
}

function GenerationMixDonut({ height }: { height: number }) {
  return (
    <div style={{ height }} className="relative flex items-center gap-4">
      <div className="relative" style={{ width: 120, height: 120, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={GEN_MIX} cx="50%" cy="50%" innerRadius={36} outerRadius={54}
              dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
              {GEN_MIX.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-1.5">
        {GEN_MIX.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-slate-600 font-medium">{item.name} {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomBarChartFn({ component, height }: { component: ChartComponent; height: number }) {
  const data = component.dataSource.sampleData || [];
  return (
    <ChartWrapper height={height}>
      <BarChart data={data} margin={{ top: 18, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: 'white', border: 'none', borderRadius: 10, fontSize: 11 }} cursor={{ fill: 'rgba(232,70,10,0.08)' }} />
        <Bar dataKey="value" fill={component.config.colors?.[0] || C.orange} radius={[4, 4, 0, 0]} maxBarSize={40}>
          <LabelList content={<BarLabel />} />
        </Bar>
      </BarChart>
    </ChartWrapper>
  );
}

function CustomLineChartFn({ component, height }: { component: ChartComponent; height: number }) {
  const data = component.dataSource.sampleData || [];
  return (
    <ChartWrapper height={height}>
      <LineChart data={data} margin={{ top: 18, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: 'white', border: 'none', borderRadius: 10, fontSize: 11 }} />
        <Line type="monotone" dataKey="value" stroke={component.config.colors?.[0] || C.orange} strokeWidth={2.5}
          dot={{ fill: 'white', stroke: component.config.colors?.[0] || C.orange, strokeWidth: 2, r: 3 }} />
      </LineChart>
    </ChartWrapper>
  );
}

function CustomPieChartFn({ component, height }: { component: ChartComponent; height: number }) {
  const raw = component.dataSource.sampleData || [];
  const pieData = raw.map((item: Record<string, unknown>, i: number) => ({
    name: String(item.category ?? `Item ${i + 1}`),
    value: Number(item.value ?? 0),
    color: (component.config.colors ?? [])[i % (component.config.colors?.length || 1)] || C.orange,
  }));
  return (
    <ChartWrapper height={height}>
      <PieChart>
        <Pie data={pieData} cx="50%" cy="50%" innerRadius="20%" outerRadius="65%"
          paddingAngle={2} dataKey="value" strokeWidth={0}>
          {pieData.map((entry: { color: string }, i: number) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip contentStyle={{ background: 'white', border: 'none', borderRadius: 10, fontSize: 11 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ChartWrapper>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

interface Props {
  component: ChartComponent;
  className?: string;
}

export function ConfigurableChartWrapper({ component }: Props) {
  const height = component.config.height || 260;

  try {
    switch (component.type) {
      case 'demanda-anual':      return <DemandaAnualChart height={height} />;
      case 'costos-mem-linea':   return <CostosMemChart height={height} />;
      case 'donut-guma':         return <DonutChart data={GUMA_DATA} label="GUMA" height={height} />;
      case 'donut-gume':         return <DonutChart data={GUME_DATA} label="GUME" height={height} />;
      case 'renovable-bar':      return <RenovableBarChart height={height} />;
      case 'costos-abastecimiento': return <CostosAbastecimientoChart height={height} />;
      case 'kpi-card':           return <KpiCardChart title={component.config.title || ''} height={height} />;
      case 'generation-mix':     return <GenerationMixDonut height={height} />;
      case 'argentina-map':      return <div style={{ height }}><ArgentinaMap /></div>;
      case 'demand-trend':       return <DemandaAnualChart height={height} />;
      case 'cost-comparison':    return <CostosAbastecimientoChart height={height} />;
      case 'custom-bar':         return <CustomBarChartFn component={component} height={height} />;
      case 'custom-line':        return <CustomLineChartFn component={component} height={height} />;
      case 'custom-pie':         return <CustomPieChartFn component={component} height={height} />;
      case 'multi-series':       return <CostosMemChart height={height} />;
      default:
        return (
          <div style={{ height }} className="flex items-center justify-center text-xs text-slate-400">
            Tipo de gráfico no soportado
          </div>
        );
    }
  } catch {
    return (
      <div style={{ height }} className="flex items-center justify-center text-xs text-red-400">
        Error al renderizar gráfico
      </div>
    );
  }
}
