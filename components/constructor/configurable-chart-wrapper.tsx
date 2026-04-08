'use client';

import { ChartComponent } from '@/lib/types/constructor';
import { GenerationMixChart } from '@/components/charts/generation-mix-chart';
import { DemandTrendChart } from '@/components/charts/demand-trend-chart';
import { CostComparisonChart } from '@/components/charts/cost-comparison-chart';
import { MultiSeriesChart } from '@/components/charts/multi-series-chart';
import { ReportChart } from '@/components/charts/report-chart';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ConfigurableChartWrapperProps {
  component: ChartComponent;
  className?: string;
}

// Helper functions to transform data source to chart-specific format
function transformGenerationMixData(component: ChartComponent) {
  const { dataSource } = component;
  if (dataSource.sampleData && dataSource.sampleData.length > 0) {
    const data = dataSource.sampleData[0] as Record<string, unknown>;
    return {
      thermal: typeof data.thermal === 'number' ? data.thermal : 0,
      hydraulic: typeof data.hydraulic === 'number' ? data.hydraulic : 0,
      nuclear: typeof data.nuclear === 'number' ? data.nuclear : 0,
      renewable: typeof data.renewable === 'number' ? data.renewable : 0,
    };
  }
  return { thermal: 45, hydraulic: 25, nuclear: 15, renewable: 15 };
}

function transformDemandTrendData(component: ChartComponent) {
  const { dataSource } = component;
  const defaultData = [
    { month: 'Ene', demand: 1200, monthlyDemand: 1200 },
    { month: 'Feb', demand: 1150, monthlyDemand: 1150 },
    { month: 'Mar', demand: 1300, monthlyDemand: 1300 },
  ];
  
  if (dataSource.sampleData && Array.isArray(dataSource.sampleData)) {
    return dataSource.sampleData.map((item: unknown) => {
      const data = item as Record<string, unknown>;
      return {
        month: typeof data.month === 'string' ? data.month : 'N/A',
        demand: typeof data.demand === 'number' ? data.demand : 0,
        monthlyDemand: typeof data.monthlyDemand === 'number' ? data.monthlyDemand : (typeof data.demand === 'number' ? data.demand : 0),
      };
    });
  }
  
  return defaultData;
}

function transformCostComparisonData(component: ChartComponent) {
  const { dataSource } = component;
  const costData = dataSource.sampleData || [
    { category: 'CAMMESA', cost: 45.2, budget: 50.0 },
    { category: 'PLUS', cost: 38.7, budget: 40.0 },
    { category: 'Renovable', cost: 42.1, budget: 45.0 },
  ];
  
  // Create mock MEM costs structure
  const memCosts = [
    { 
      month: '2024-01', 
      cammesa: (costData.find((d: Record<string, unknown>) => d.category === 'CAMMESA') as { cost?: number })?.cost || 45.2,
      plus: (costData.find((d: Record<string, unknown>) => d.category === 'PLUS') as { cost?: number })?.cost || 38.7,
      renewable: (costData.find((d: Record<string, unknown>) => d.category === 'Renovable') as { cost?: number })?.cost || 42.1
    }
  ];
  
  const supplyCosts = [
    { month: '2024-01', cost: 50.0 }
  ];
  
  return { memCosts, supplyCosts };
}

function transformCustomData(component: ChartComponent) {
  const { dataSource } = component;
  return dataSource.sampleData || [];
}

// Custom chart components for types not covered by existing charts
function CustomBarChart({ component }: { component: ChartComponent }) {
  const data = transformCustomData(component);
  const { config } = component;

  return (
    <ReportChart
      title={config.title}
      subtitle={config.subtitle}
      height={config.height}
    >
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="category" 
          stroke="#6B7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6B7280"
          fontSize={12}
        />
        {config.showTooltip && <Tooltip />}
        {config.showLegend && <Legend />}
        
        <Bar
          dataKey="value"
          fill={config.colors[0] || '#FF7A00'}
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ReportChart>
  );
}

function CustomLineChart({ component }: { component: ChartComponent }) {
  const data = transformCustomData(component);
  const { config } = component;

  return (
    <ReportChart
      title={config.title}
      subtitle={config.subtitle}
      height={config.height}
    >
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="category" 
          stroke="#6B7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6B7280"
          fontSize={12}
        />
        {config.showTooltip && <Tooltip />}
        {config.showLegend && <Legend />}
        
        <Line
          type="monotone"
          dataKey="value"
          stroke={config.colors[0] || '#FF7A00'}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </LineChart>
    </ReportChart>
  );
}

function CustomPieChart({ component }: { component: ChartComponent }) {
  const data = transformCustomData(component);
  const { config } = component;

  // Transform data for pie chart
  const pieData = Array.isArray(data) ? data.map((item, index) => ({
    name: item.category || `Item ${index + 1}`,
    value: item.value || 0,
    color: config.colors[index % config.colors.length] || '#FF7A00'
  })) : [];

  return (
    <ReportChart
      title={config.title}
      subtitle={config.subtitle}
      height={config.height}
    >
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="70%"
          paddingAngle={2}
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {config.showTooltip && <Tooltip />}
        {config.showLegend && <Legend />}
      </PieChart>
    </ReportChart>
  );
}

export function ConfigurableChartWrapper({ component, className }: ConfigurableChartWrapperProps) {
  const { type, config } = component;

  try {
    switch (type) {
      case 'generation-mix':
        const generationData = transformGenerationMixData(component);
        return (
          <GenerationMixChart
            data={generationData}
            title={config.title}
            subtitle={config.subtitle}
            height={config.height}
            className={className}
          />
        );

      case 'demand-trend':
        const demandData = transformDemandTrendData(component);
        return (
          <DemandTrendChart
            data={demandData}
            title={config.title}
            subtitle={config.subtitle}
            height={config.height}
            className={className}
          />
        );

      case 'cost-comparison':
        const costData = transformCostComparisonData(component);
        return (
          <CostComparisonChart
            memCosts={costData.memCosts}
            supplyCosts={costData.supplyCosts}
            title={config.title}
            subtitle={config.subtitle}
            height={config.height}
            className={className}
          />
        );

      case 'multi-series':
        const multiSeriesData = transformCustomData(component);
        return (
          <MultiSeriesChart
            type="line"
            data={multiSeriesData}
            config={{
              colors: config.colors,
              showLegend: config.showLegend,
              showTooltip: config.showTooltip,
            }}
            title={config.title}
            subtitle={config.subtitle}
            height={config.height}
            className={className}
          />
        );

      case 'custom-bar':
        return <CustomBarChart component={component} />;

      case 'custom-line':
        return <CustomLineChart component={component} />;

      case 'custom-pie':
        return <CustomPieChart component={component} />;

      default:
        return (
          <ReportChart
            title={config.title || 'Gráfico no soportado'}
            subtitle={config.subtitle}
            height={config.height}
            className={className}
          >
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">Tipo de gráfico no soportado: {type}</p>
                <p className="text-xs mt-1">Selecciona un tipo de gráfico válido</p>
              </div>
            </div>
          </ReportChart>
        );
    }
  } catch (error) {
    console.error('Error rendering chart:', error);
    
    return (
      <ReportChart
        title={config.title || 'Error en el gráfico'}
        subtitle="Error al cargar los datos"
        height={config.height}
        className={className}
      >
        <div className="flex items-center justify-center h-full text-destructive">
          <div className="text-center">
            <p className="text-sm">Error al renderizar el gráfico</p>
            <p className="text-xs mt-1">Verifica la configuración y los datos</p>
          </div>
        </div>
      </ReportChart>
    );
  }
}