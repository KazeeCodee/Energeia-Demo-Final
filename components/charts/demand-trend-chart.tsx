'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ReportChart } from './report-chart';
import { ReportData } from '@/lib/types';

interface GroupedDemandData {
  month: string;
  [period: string]: string | number;
}

interface DemandTrendChartProps {
  data: ReportData['mobileDemand'] | Array<ReportData['mobileDemand'][0] & { reportPeriod?: string }>;
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
  loading?: boolean;
  compareMode?: boolean;
  multipleSeries?: Array<{
    name: string;
    data: ReportData['mobileDemand'];
    color?: string;
  }>;
}

export function DemandTrendChart({
  data,
  title = "Demanda Año Móvil",
  subtitle,
  height = 300,
  className,
  loading = false,
  compareMode = false,
  multipleSeries
}: DemandTrendChartProps) {
  // Formatear datos para el gráfico
  let chartData;
  
  if (compareMode && Array.isArray(data) && data.length > 0 && 'reportPeriod' in data[0]) {
    // Modo comparación con múltiples períodos
    const groupedData = new Map<string, GroupedDemandData>();
    
    (data as Array<ReportData['mobileDemand'][0] & { reportPeriod: string }>).forEach(item => {
      if (!groupedData.has(item.month)) {
        groupedData.set(item.month, { month: item.month });
      }
      const monthData = groupedData.get(item.month);
      if (monthData) {
        monthData[item.reportPeriod] = item.demand;
      }
    });
    
    chartData = Array.from(groupedData.values()).sort((a, b) => a.month.localeCompare(b.month));
  } else if (multipleSeries && multipleSeries.length > 0) {
    // Combinar múltiples series para comparación
    const allMonths = new Set<string>();
    multipleSeries.forEach(series => {
      series.data.forEach(item => allMonths.add(item.month));
    });
    
    chartData = Array.from(allMonths).sort().map(month => {
      const dataPoint: GroupedDemandData = { month };
      multipleSeries.forEach(series => {
        const seriesData = series.data.find(item => item.month === month);
        dataPoint[series.name] = seriesData?.demand || 0;
      });
      return dataPoint;
    });
  } else {
    // Serie única
    const singleData = Array.isArray(data) && data.length > 0 && 'reportPeriod' in data[0] 
      ? data as Array<ReportData['mobileDemand'][0] & { reportPeriod: string }>
      : data as ReportData['mobileDemand'];
      
    chartData = singleData.map(item => ({
      month: item.month,
      demand: item.demand,
      monthlyDemand: 'monthlyDemand' in item ? item.monthlyDemand : undefined
    }));
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}: 
              <span className="font-semibold text-orange-600 ml-1">
                {entry.value.toLocaleString()} MWh
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
    // Formatear valores del eje Y
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <ReportChart
      title={title}
      subtitle={subtitle}
      height={height}
      className={className}
      loading={loading}
    >
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
        
        {compareMode && chartData.length > 0 ? (
          // Modo comparación con múltiples períodos
          <>
            <Legend />
            {Object.keys(chartData[0])
              .filter(key => key !== 'month')
              .map((period, index) => (
                <Line
                  key={period}
                  type="monotone"
                  dataKey={period}
                  stroke={index === 0 ? '#FF7A00' : `hsl(${(index * 60) % 360}, 70%, 50%)`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  name={period}
                />
              ))}
          </>
        ) : multipleSeries && multipleSeries.length > 0 ? (
          // Múltiples series para comparación
          <>
            <Legend />
            {multipleSeries.map((series, index) => (
              <Line
                key={series.name}
                type="monotone"
                dataKey={series.name}
                stroke={series.color || (index === 0 ? '#FF7A00' : '#64748B')}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#FF7A00', strokeWidth: 2 }}
              />
            ))}
          </>
        ) : (
          // Serie única
          <>
            <Line
              type="monotone"
              dataKey="demand"
              stroke="#FF7A00"
              strokeWidth={2}
              dot={{ r: 4, fill: '#FF7A00' }}
              activeDot={{ r: 6, stroke: '#FF7A00', strokeWidth: 2 }}
              name="Demanda Año Móvil"
            />
            {Array.isArray(data) && data.some((item: any) => item.monthlyDemand) && (
              <Line
                type="monotone"
                dataKey="monthlyDemand"
                stroke="#64748B"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#64748B' }}
                name="Demanda Mensual"
              />
            )}
          </>
        )}
      </LineChart>
    </ReportChart>
  );
}