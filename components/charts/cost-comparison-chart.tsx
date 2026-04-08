'use client';

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ReportChart } from './report-chart';
import { ReportData } from '@/lib/types';

interface CostComparisonChartProps {
  memCosts: ReportData['memCosts'];
  supplyCosts: ReportData['supplyCosts']['monthly'];
  mobileCosts?: ReportData['supplyCosts']['mobileCosts'];
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
  loading?: boolean;
}

export function CostComparisonChart({
  memCosts,
  supplyCosts,
  mobileCosts,
  title = "Comparación de Costos",
  subtitle,
  height = 350,
  className,
  loading = false
}: CostComparisonChartProps) {
  // Combinar datos de diferentes fuentes por mes
  const chartData = memCosts.map(memItem => {
    const supplyItem = supplyCosts.find(s => s.month === memItem.month);
    const mobileItem = mobileCosts?.find(m => m.month === memItem.month);
    
    return {
      month: memItem.month,
      cammesa: memItem.cammesa,
      plus: memItem.plus,
      renewable: memItem.renewable,
      supplyCost: supplyItem?.cost || 0,
      mobileCost: mobileItem?.cost || 0
    };
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="font-medium text-gray-900 mb-2">{formatXAxisLabel(label || '')}</p>
          {payload.map((entry: { value: number; color: string; name: string }, index: number) => (
            <p key={index} className="text-sm text-gray-600 flex justify-between">
              <span className="flex items-center">
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-semibold text-orange-600 ml-2">
                ${entry.value.toFixed(2)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatXAxisLabel = (tickItem: string) => {
    // Formatear etiquetas del eje X (ej: "2024-01" -> "Ene 24")
    const [year, month] = tickItem.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${monthNames[parseInt(month) - 1]} ${year.slice(-2)}`;
  };

  const formatYAxisLabel = (value: number) => {
    return `$${value}`;
  };

  return (
    <ReportChart
      title={title}
      subtitle={subtitle}
      height={height}
      className={className}
      loading={loading}
    >
      <ComposedChart data={chartData} margin={{ top: 20, right: 10, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="month" 
          tickFormatter={formatXAxisLabel}
          stroke="#6B7280"
          fontSize={12}
        />
        <YAxis 
          tickFormatter={formatYAxisLabel}
          stroke="#6B7280"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* Barras para costos MEM */}
        <Bar 
          dataKey="cammesa" 
          fill="#64748B" 
          name="CAMMESA"
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="plus" 
          fill="#94A3B8" 
          name="PLUS"
          radius={[2, 2, 0, 0]}
        />
        <Bar 
          dataKey="renewable" 
          fill="#FF7A00" 
          name="Renovable"
          radius={[2, 2, 0, 0]}
        />
        
        {/* Líneas para costos de abastecimiento */}
        <Line
          type="monotone"
          dataKey="supplyCost"
          stroke="#EF4444"
          strokeWidth={3}
          dot={{ r: 4, fill: '#EF4444' }}
          activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
          name="Costo Abastecimiento"
        />
        
        {mobileCosts && mobileCosts.length > 0 && (
          <Line
            type="monotone"
            dataKey="mobileCost"
            stroke="#8B5CF6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: '#8B5CF6' }}
            name="Costo Móvil"
          />
        )}
      </ComposedChart>
    </ReportChart>
  );
}