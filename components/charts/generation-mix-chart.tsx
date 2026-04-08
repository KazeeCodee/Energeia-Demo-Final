'use client';

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ReportChart } from './report-chart';
import { ReportData } from '@/lib/types';

interface GenerationMixChartProps {
  data: ReportData['generationMix'];
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
  loading?: boolean;
}

// Colores específicos para cada tipo de energía
const ENERGY_COLORS = {
  thermal: '#64748B',    // Gris para térmica
  hydraulic: '#3B82F6',  // Azul para hidráulica
  nuclear: '#8B5CF6',    // Púrpura para nuclear
  renewable: '#FF7A00'   // Naranja (accent) para renovable
};

const ENERGY_LABELS = {
  thermal: 'Térmica',
  hydraulic: 'Hidráulica', 
  nuclear: 'Nuclear',
  renewable: 'Renovable'
};

export function GenerationMixChart({
  data,
  title = "Mix de Generación",
  subtitle,
  height = 300,
  className,
  loading = false
}: GenerationMixChartProps) {
  // Convertir los datos al formato requerido por Recharts
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: ENERGY_LABELS[key as keyof typeof ENERGY_LABELS],
    value: value,
    color: ENERGY_COLORS[key as keyof typeof ENERGY_COLORS]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div 
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-3"
          role="tooltip"
          aria-label={`${data.name}: ${data.value.toFixed(1)} por ciento`}
        >
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-orange-600">
              {data.value.toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div 
        className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 px-2"
        role="list"
        aria-label="Leyenda del gráfico de generación por tipo"
      >
        {payload?.map((entry: any, index: number) => (
          <div 
            key={index} 
            className="flex items-center space-x-1 sm:space-x-2"
            role="listitem"
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span 
              className="text-xs sm:text-sm text-gray-700"
              aria-label={`${entry.value}: ${entry.payload.value.toFixed(1)} por ciento`}
            >
              {entry.value} ({entry.payload.value.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ReportChart
      title={title}
      subtitle={subtitle}
      height={height}
      className={className}
      loading={loading}
    >
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="70%"
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ReportChart>
  );
}