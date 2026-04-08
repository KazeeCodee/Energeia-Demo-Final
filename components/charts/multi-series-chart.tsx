'use client';

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ReportChart } from './report-chart';

interface MultiSeriesChartProps {
  type: 'bar' | 'line';
  data: any[];
  config: {
    colors: string[];
    showLegend?: boolean;
    showTooltip?: boolean;
    responsive?: boolean;
  };
  title?: string;
  subtitle?: string;
  height?: number;
  className?: string;
  loading?: boolean;
}

export function MultiSeriesChart({
  type,
  data,
  config,
  title,
  subtitle,
  height = 300,
  className,
  loading = false
}: MultiSeriesChartProps) {
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600">
              <span 
                className="inline-block w-3 h-3 rounded-full mr-2 bg-orange-500"
              />
              {entry.name}: 
              <span className="font-semibold text-orange-600 ml-1">
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatXAxisLabel = (tickItem: string) => {
    // If it looks like a date (YYYY-MM), format it
    if (tickItem.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = tickItem.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                         'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${monthNames[parseInt(month) - 1]} ${year.slice(-2)}`;
    }
    return tickItem;
  };

  const getDataKeys = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(key => key !== 'name' && key !== 'month');
  };

  const dataKeys = getDataKeys();

  return (
    <ReportChart
      title={title}
      subtitle={subtitle}
      height={height}
      className={className}
      loading={loading}
    >
      {type === 'bar' ? (
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            tickFormatter={formatXAxisLabel}
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          {config.showTooltip && <Tooltip content={<CustomTooltip />} />}
          {config.showLegend && <Legend />}
          
          {dataKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={config.colors[index % config.colors.length]}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      ) : (
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatXAxisLabel}
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
          />
          {config.showTooltip && <Tooltip content={<CustomTooltip />} />}
          {config.showLegend && <Legend />}
          
          {dataKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={config.colors[index % config.colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      )}
    </ReportChart>
  );
}