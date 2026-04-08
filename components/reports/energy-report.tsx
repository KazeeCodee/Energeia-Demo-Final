'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, LabelList, ReferenceLine,
} from 'recharts';
import { Zap, Factory, TrendingUp, TrendingDown } from 'lucide-react';

const ArgentinaMap = dynamic(
  () => import('@/components/charts/argentina-map').then(m => m.ArgentinaMap),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Cargando mapa…</div> }
);
import {
  simulateEnergyData,
  getReportTitle,
  getPeriodDisplayText,
  calculatePercentageChanges,
  EnergyDataFilters,
} from '@/lib/utils/energy-data-simulator';

// ── Design tokens ───────────────────────────────────────────────────────────

const C = {
  orange:   '#E8460A',
  green:    '#22A55B',
  blue:     '#3B82F6',
  teal:     '#0EA5E9',
  brown:    '#7C3C21',
  lavender: '#EAEBF4',
};

// ── Shared components ───────────────────────────────────────────────────────

function ReportCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-bold text-slate-800">{children}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function KpiCard({ value, unit, label, mom, yoy }: {
  value: string | number;
  unit: string;
  label: string;
  mom?: number;
  yoy?: number;
}) {
  return (
    <ReportCard>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-5xl font-extrabold text-slate-900 leading-none">
        {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
        <span className="text-2xl font-bold text-slate-500 ml-2">{unit}</span>
      </p>
      {(mom !== undefined || yoy !== undefined) && (
        <div className="flex gap-6 mt-4">
          {mom !== undefined && (
            <div className="text-center">
              <div className={`flex items-center gap-1 font-semibold text-lg ${mom >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {mom >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {mom >= 0 ? '+' : ''}{mom} %
              </div>
              <p className="text-xs text-slate-400 font-medium">MoM</p>
            </div>
          )}
          {yoy !== undefined && (
            <div className="text-center">
              <div className={`flex items-center gap-1 font-semibold text-lg ${yoy >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {yoy >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {yoy >= 0 ? '+' : ''}{yoy} %
              </div>
              <p className="text-xs text-slate-400 font-medium">YoY</p>
            </div>
          )}
        </div>
      )}
    </ReportCard>
  );
}

function DonutCard({ data, centerValue, centerLabel, title, subtitle }: {
  data: { name: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <ReportCard>
      {title && <CardTitle subtitle={subtitle}>{title}</CardTitle>}
      <div className="flex items-center gap-6">
        <div className="relative w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-extrabold text-slate-800 leading-tight">{centerValue}</span>
            <span className="text-[10px] text-slate-500 font-medium text-center leading-tight px-1">{centerLabel}</span>
          </div>
        </div>
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-600 font-medium">{item.name} {item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </ReportCard>
  );
}

// ── Custom bar label ───────────────────────────────────────────────────────

function BarLabel(props: { x?: number; y?: number; width?: number; value?: number }) {
  const { x = 0, y = 0, width = 0, value } = props;
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y - 5} fill="#64748b" textAnchor="middle" fontSize={11} fontWeight={600}>
      {value}
    </text>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface EnergyReportProps {
  period: string;
  company: string;
  companies?: string[];
  supplyPoint?: string;
  isBackoffice?: boolean;
}

export function EnergyReport({
  period,
  company,
  companies = ['santa-rita'],
  supplyPoint = 'all',
  isBackoffice = false,
}: EnergyReportProps) {
  const [selectedSupplyPoint, setSelectedSupplyPoint] = useState('Todas');
  const [selectedType, setSelectedType] = useState('GUME');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('octubre');

  const simulatedData = useMemo(() => {
    const filters: EnergyDataFilters = { companies, period, supplyPoint, isBackoffice };
    return simulateEnergyData(filters);
  }, [companies, period, supplyPoint, isBackoffice]);

  const periodText = getPeriodDisplayText(period);

  const demandData = useMemo(() => [
    { label: 'nov 2024', value: simulatedData.demandMonthly[0] },
    { label: 'dic 2024', value: simulatedData.demandMonthly[1] },
    { label: 'ene 2025', value: simulatedData.demandMonthly[2] },
    { label: 'feb 2025', value: simulatedData.demandMonthly[3] },
    { label: 'mar 2025', value: simulatedData.demandMonthly[4] },
    { label: 'abr 2025', value: simulatedData.demandMonthly[5] },
    { label: 'may 2025', value: simulatedData.demandMonthly[6] },
    { label: 'jun 2025', value: simulatedData.demandMonthly[7] || 180 },
    { label: 'jul 2025', value: simulatedData.demandMonthly[8] || 161 },
    { label: 'ago 2025', value: simulatedData.demandMonthly[9] || 347 },
    { label: 'sep 2025', value: simulatedData.demandMonthly[10] || 341 },
    { label: 'oct 2025', value: simulatedData.demandMonthly[11] || 374 },
  ], [simulatedData.demandMonthly]);

  const costData = useMemo(() => [
    { month: 'nov 2024', value: simulatedData.costData[0] },
    { month: 'dic 2024', value: simulatedData.costData[1] },
    { month: 'ene 2025', value: simulatedData.costData[2] },
    { month: 'feb 2025', value: simulatedData.costData[3] },
    { month: 'mar 2025', value: simulatedData.costData[4] },
    { month: 'abr 2025', value: simulatedData.costData[5] },
    { month: 'may 2025', value: simulatedData.costData[6] },
    { month: 'jun 2025', value: simulatedData.costData[7] },
    { month: 'jul 2025', value: simulatedData.costData[8] },
    { month: 'ago 2025', value: simulatedData.costData[9] },
    { month: 'sep 2025', value: simulatedData.costData[10] },
    { month: 'oct 2025', value: simulatedData.costData[11] },
  ], [simulatedData.costData]);

  const avgCost = Math.round(costData.reduce((s, d) => s + d.value, 0) / costData.length);

  const generationMix = [
    { name: 'Térmica',   value: 41.39, color: C.orange },
    { name: 'Hidráulica',value: 27.70, color: C.teal   },
    { name: 'Renovable', value: 22.45, color: C.green  },
    { name: 'Nuclear',   value: 8.47,  color: C.brown  },
  ];

  const demandGumaData = [
    { name: 'MATER', value: 67, color: C.green  },
    { name: 'SPOT',  value: 21, color: C.orange },
    { name: 'PLUS',  value: 12, color: C.blue   },
  ];

  const demandGumeData = [
    { name: 'MATER', value: 36, color: C.green  },
    { name: 'SPOT',  value: 48, color: C.orange },
    { name: 'PLUS',  value: 16, color: C.blue   },
  ];

  const supplyBars = [
    { name: 'Renovable', cammesa: 71.67, year: 72.57 },
    { name: 'CAMMESA',   cammesa: 64.14, year: 74.55 },
  ];

  const momChanges = calculatePercentageChanges(simulatedData.totalGenerationMEM, 12030);
  const materChanges = calculatePercentageChanges(simulatedData.generationMATER, 814);

  return (
    <div className="space-y-4 rounded-2xl p-5" style={{ backgroundColor: C.lavender }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.orange }}>
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Informe energético</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-slate-500">{periodText}</span>
              {isBackoffice && (
                <span className="text-xs text-slate-400">· {company}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-tight" style={{ color: C.orange }}>energeia</span>
        </div>
      </div>

      {/* ── Demanda año móvil ─────────────────────────────────────────────── */}
      <ReportCard>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Demanda año móvil</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: C.orange }} />
              <span className="text-xs text-slate-500">Punto de Suministro · <strong>SARIPÓN</strong></span>
            </div>
          </div>
          <Select value={selectedSupplyPoint} onValueChange={setSelectedSupplyPoint}>
            <SelectTrigger className="w-28 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value="SARIPÓN">SARIPÓN</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={demandData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'white', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,.10)', fontSize: 12 }}
              cursor={{ fill: 'rgba(232,70,10,0.08)' }}
            />
            <Bar dataKey="value" fill={C.orange} radius={[4, 4, 0, 0]} maxBarSize={40}>
              <LabelList content={<BarLabel />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ReportCard>

      {/* ── KPI row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <KpiCard
          value={simulatedData.agreementEnergyMonth}
          unit="MWh"
          label="Acuerdo Energeia · Mes"
        />
        <KpiCard
          value={simulatedData.agreementEnergyYear}
          unit="MWh"
          label="Acuerdo Energeia · Año"
        />
      </div>

      {/* ── Demanda GUMA / GUME ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <DonutCard
          data={demandGumaData}
          centerValue={`${simulatedData.demandGUMA.toLocaleString('es-AR')} GWh`}
          centerLabel="Demanda GUMA"
          title="Demanda GUMA"
          subtitle={periodText}
        />
        <DonutCard
          data={demandGumeData}
          centerValue={`${simulatedData.demandGUME.toLocaleString('es-AR')} GWh`}
          centerLabel="Demanda GUME"
          title="Demanda GUME"
          subtitle={periodText}
        />
      </div>

      {/* ── Renovable bar ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <ReportCard>
          <CardTitle subtitle={periodText}>Porcentaje de Renovable en el Año</CardTitle>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>SARIPÓN</span>
                <span style={{ color: C.green }}>71 %</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden">
                <div className="h-5 rounded-full transition-all" style={{ width: '71%', backgroundColor: C.green }} />
              </div>
            </div>
          </div>
        </ReportCard>
        <ReportCard>
          <CardTitle subtitle={periodText}>Renovable Total Sociedad</CardTitle>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>24 %</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden">
                <div className="h-5 rounded-full" style={{ width: '24%', backgroundColor: '#1E40AF' }} />
              </div>
            </div>
          </div>
        </ReportCard>
      </div>

      {/* ── Costos MEM línea ──────────────────────────────────────────────── */}
      <ReportCard>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">
            Costos MEM — USD / MWh — Año móvil
          </h3>
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GUME">GUME</SelectItem>
                <SelectItem value="GUDI">GUDI</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSupplyPoint} onValueChange={setSelectedSupplyPoint}>
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="SARIPÓN">SARIPÓN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={costData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: 'white', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,.10)', fontSize: 12 }}
            />
            <ReferenceLine y={avgCost} stroke="#94a3b8" strokeDasharray="4 3" strokeWidth={1.5} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={C.orange}
              strokeWidth={2.5}
              dot={{ fill: 'white', stroke: C.orange, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 5, fill: C.orange }}
            >
              <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </ReportCard>

      {/* ── Costos de abastecimiento barras horizontales ──────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        {['octubre de 2025', 'Año Móvil'].map((label, idx) => (
          <ReportCard key={idx}>
            <CardTitle subtitle={label}>Costos de Abastecimiento — USD / MWh</CardTitle>
            <div className="space-y-5">
              {supplyBars.map((row) => {
                const val = idx === 0 ? row.cammesa : row.year;
                return (
                  <div key={row.name}>
                    <p className="text-xs font-semibold text-slate-500 mb-1.5">{row.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-4 rounded-full"
                          style={{
                            width: `${(val / 120) * 100}%`,
                            backgroundColor: row.name === 'Renovable' ? C.green : C.orange,
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-10 text-right">{val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ReportCard>
        ))}
      </div>

      {/* ── Ingreso MATER + Generación KPIs ──────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Ingreso Potencia MATER */}
        <ReportCard>
          <CardTitle subtitle="noviembre 2025 a enero 2026">Ingreso Potencia MATER</CardTitle>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50">
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-2xl font-extrabold text-slate-800">{simulatedData.ingresoPotenciaMATER} MW</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
                <Factory className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-2xl font-extrabold text-slate-800">{simulatedData.ingresoPotenciaIndustrial} MW</span>
            </div>
          </div>
        </ReportCard>

        {/* Generación total MEM */}
        <KpiCard
          value={`${simulatedData.totalGenerationMEM.toLocaleString('es-AR')} GWh`}
          unit=""
          label="Generación total MEM"
          mom={momChanges.mom}
          yoy={momChanges.yoy}
        />

        {/* Generación MATER */}
        <KpiCard
          value={`${simulatedData.generationMATER.toLocaleString('es-AR')} GWh`}
          unit=""
          label="Generación MATER"
          mom={materChanges.mom}
          yoy={materChanges.yoy}
        />
      </div>

      {/* ── Mapa Argentina ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <ReportCard className="h-full">
            <CardTitle subtitle={periodText}>Precios MEM vs Distribuidor</CardTitle>
            <div className="h-[480px]">
              <ArgentinaMap />
            </div>
          </ReportCard>
        </div>
        <div className="space-y-4">
          <DonutCard
            data={generationMix}
            centerValue=""
            centerLabel=""
            title="Generación por Tipo"
            subtitle={periodText}
          />
          <ReportCard>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Grandes Usuarios · {periodText}</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">GUDI</span>
                <span className="text-xl font-extrabold text-slate-900">{simulatedData.gudi.toLocaleString('es-AR')} GWh</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">GUMA / GUME</span>
                <span className="text-xl font-extrabold text-slate-900">{simulatedData.gumaGume.toLocaleString('es-AR')} GWh</span>
              </div>
            </div>
          </ReportCard>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-2">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-20 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-28 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'].map(m => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
