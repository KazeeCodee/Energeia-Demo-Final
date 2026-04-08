// Demo Data Service for Constructor de Informes
import { ReportConfig, DataSource, ChartComponent, GridSpace, ChartComponentType } from '../types/constructor';

// Helper function to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

/**
 * Extended data sources with more realistic and varied data for different client types
 */
export const demoDataSources: DataSource[] = [
  // Energy Generation Data Sources
  {
    id: 'energy-generation-thermal',
    name: 'Generación Térmica Detallada',
    type: 'energy-generation',
    fields: [
      { id: 'coal', name: 'Carbón', type: 'percentage', required: true },
      { id: 'gas', name: 'Gas Natural', type: 'percentage', required: true },
      { id: 'fuel_oil', name: 'Fuel Oil', type: 'percentage', required: true },
      { id: 'diesel', name: 'Diesel', type: 'percentage', required: true },
    ],
    sampleData: [
      { coal: 35.2, gas: 42.8, fuel_oil: 15.3, diesel: 6.7 }
    ]
  },
  {
    id: 'energy-generation-renewable',
    name: 'Generación Renovable Detallada',
    type: 'energy-generation',
    fields: [
      { id: 'solar', name: 'Solar', type: 'percentage', required: true },
      { id: 'wind', name: 'Eólica', type: 'percentage', required: true },
      { id: 'hydro', name: 'Hidráulica', type: 'percentage', required: true },
      { id: 'biomass', name: 'Biomasa', type: 'percentage', required: true },
    ],
    sampleData: [
      { solar: 28.5, wind: 35.2, hydro: 31.8, biomass: 4.5 }
    ]
  },
  {
    id: 'energy-generation-mix',
    name: 'Mix Energético Nacional',
    type: 'energy-generation',
    fields: [
      { id: 'thermal', name: 'Térmica', type: 'percentage', required: true },
      { id: 'hydraulic', name: 'Hidráulica', type: 'percentage', required: true },
      { id: 'nuclear', name: 'Nuclear', type: 'percentage', required: true },
      { id: 'renewable', name: 'Renovable', type: 'percentage', required: true },
    ],
    sampleData: [
      { thermal: 52.3, hydraulic: 28.7, nuclear: 8.2, renewable: 10.8 }
    ]
  },

  // Demand Data Sources
  {
    id: 'demand-hourly',
    name: 'Demanda Horaria',
    type: 'demand',
    fields: [
      { id: 'hour', name: 'Hora', type: 'string', required: true },
      { id: 'demand', name: 'Demanda (MW)', type: 'number', required: true },
      { id: 'temperature', name: 'Temperatura (°C)', type: 'number', required: false },
    ],
    sampleData: [
      { hour: '00:00', demand: 8500, temperature: 18 },
      { hour: '06:00', demand: 9200, temperature: 16 },
      { hour: '12:00', demand: 12800, temperature: 24 },
      { hour: '18:00', demand: 15200, temperature: 22 },
      { hour: '21:00', demand: 13900, temperature: 20 },
    ]
  },
  {
    id: 'demand-monthly',
    name: 'Demanda Mensual',
    type: 'demand',
    fields: [
      { id: 'month', name: 'Mes', type: 'string', required: true },
      { id: 'demand', name: 'Demanda (GWh)', type: 'number', required: true },
      { id: 'variation', name: 'Variación (%)', type: 'percentage', required: false },
      { id: 'forecast', name: 'Pronóstico (GWh)', type: 'number', required: false },
    ],
    sampleData: [
      { month: 'Ene', demand: 1250, variation: 5.2, forecast: 1280 },
      { month: 'Feb', demand: 1180, variation: -2.1, forecast: 1200 },
      { month: 'Mar', demand: 1320, variation: 8.7, forecast: 1300 },
      { month: 'Abr', demand: 1280, variation: 3.5, forecast: 1290 },
      { month: 'May', demand: 1190, variation: -1.8, forecast: 1220 },
      { month: 'Jun', demand: 1380, variation: 7.2, forecast: 1350 },
    ]
  },
  {
    id: 'demand-industrial',
    name: 'Demanda Industrial por Sector',
    type: 'demand',
    fields: [
      { id: 'sector', name: 'Sector', type: 'string', required: true },
      { id: 'consumption', name: 'Consumo (MWh)', type: 'number', required: true },
      { id: 'efficiency', name: 'Eficiencia (%)', type: 'percentage', required: false },
    ],
    sampleData: [
      { sector: 'Minería', consumption: 2850, efficiency: 78.5 },
      { sector: 'Siderurgia', consumption: 1920, efficiency: 82.3 },
      { sector: 'Petroquímica', consumption: 1650, efficiency: 75.8 },
      { sector: 'Textil', consumption: 890, efficiency: 85.2 },
      { sector: 'Alimentaria', consumption: 720, efficiency: 88.7 },
    ]
  },

  // Cost Data Sources
  {
    id: 'cost-generation',
    name: 'Costos de Generación',
    type: 'cost',
    fields: [
      { id: 'technology', name: 'Tecnología', type: 'string', required: true },
      { id: 'cost', name: 'Costo (USD/MWh)', type: 'number', required: true },
      { id: 'budget', name: 'Presupuesto', type: 'number', required: false },
      { id: 'variation', name: 'Variación (%)', type: 'percentage', required: false },
    ],
    sampleData: [
      { technology: 'CAMMESA', cost: 45.2, budget: 50.0, variation: -9.6 },
      { technology: 'PLUS', cost: 38.7, budget: 40.0, variation: -3.3 },
      { technology: 'Renovable', cost: 42.1, budget: 45.0, variation: -6.4 },
      { technology: 'Nuclear', cost: 35.8, budget: 38.0, variation: -5.8 },
    ]
  },
  {
    id: 'cost-transmission',
    name: 'Costos de Transmisión',
    type: 'cost',
    fields: [
      { id: 'region', name: 'Región', type: 'string', required: true },
      { id: 'cost', name: 'Costo (USD/MWh)', type: 'number', required: true },
      { id: 'distance', name: 'Distancia (km)', type: 'number', required: false },
    ],
    sampleData: [
      { region: 'Norte', cost: 8.5, distance: 450 },
      { region: 'Centro', cost: 5.2, distance: 180 },
      { region: 'Sur', cost: 12.3, distance: 680 },
      { region: 'Este', cost: 7.8, distance: 320 },
    ]
  },
  {
    id: 'cost-maintenance',
    name: 'Costos de Mantenimiento',
    type: 'cost',
    fields: [
      { id: 'equipment', name: 'Equipo', type: 'string', required: true },
      { id: 'preventive', name: 'Preventivo (USD)', type: 'number', required: true },
      { id: 'corrective', name: 'Correctivo (USD)', type: 'number', required: true },
      { id: 'total', name: 'Total (USD)', type: 'number', required: true },
    ],
    sampleData: [
      { equipment: 'Turbinas', preventive: 125000, corrective: 85000, total: 210000 },
      { equipment: 'Generadores', preventive: 95000, corrective: 120000, total: 215000 },
      { equipment: 'Transformadores', preventive: 45000, corrective: 35000, total: 80000 },
      { equipment: 'Líneas', preventive: 65000, corrective: 45000, total: 110000 },
    ]
  },

  // Efficiency Data Sources
  {
    id: 'efficiency-plant',
    name: 'Eficiencia de Planta',
    type: 'efficiency',
    fields: [
      { id: 'plant', name: 'Planta', type: 'string', required: true },
      { id: 'efficiency', name: 'Eficiencia (%)', type: 'percentage', required: true },
      { id: 'target', name: 'Objetivo (%)', type: 'percentage', required: false },
      { id: 'capacity', name: 'Capacidad (MW)', type: 'number', required: false },
    ],
    sampleData: [
      { plant: 'Central Norte', efficiency: 87.5, target: 90.0, capacity: 650 },
      { plant: 'Central Sur', efficiency: 82.3, target: 85.0, capacity: 480 },
      { plant: 'Central Este', efficiency: 91.2, target: 92.0, capacity: 720 },
      { plant: 'Central Oeste', efficiency: 78.9, target: 82.0, capacity: 380 },
    ]
  },
  {
    id: 'efficiency-network',
    name: 'Eficiencia de Red',
    type: 'efficiency',
    fields: [
      { id: 'metric', name: 'Métrica', type: 'string', required: true },
      { id: 'value', name: 'Valor', type: 'number', required: true },
      { id: 'target', name: 'Objetivo', type: 'number', required: false },
      { id: 'unit', name: 'Unidad', type: 'string', required: false },
    ],
    sampleData: [
      { metric: 'Pérdidas Técnicas', value: 8.5, target: 7.0, unit: '%' },
      { metric: 'Factor de Potencia', value: 0.92, target: 0.95, unit: 'p.u.' },
      { metric: 'Disponibilidad', value: 94.8, target: 96.0, unit: '%' },
      { metric: 'SAIDI', value: 2.3, target: 2.0, unit: 'horas/año' },
    ]
  },

  // Custom Data Sources for specific client types
  {
    id: 'mining-operations',
    name: 'Operaciones Mineras',
    type: 'custom',
    fields: [
      { id: 'operation', name: 'Operación', type: 'string', required: true },
      { id: 'consumption', name: 'Consumo (MWh)', type: 'number', required: true },
      { id: 'production', name: 'Producción (ton)', type: 'number', required: true },
      { id: 'efficiency', name: 'Eficiencia (kWh/ton)', type: 'number', required: true },
    ],
    sampleData: [
      { operation: 'Extracción', consumption: 1250, production: 2800, efficiency: 446 },
      { operation: 'Procesamiento', consumption: 890, production: 2650, efficiency: 336 },
      { operation: 'Refinado', consumption: 650, production: 2400, efficiency: 271 },
      { operation: 'Transporte', consumption: 320, production: 2400, efficiency: 133 },
    ]
  },
  {
    id: 'textile-production',
    name: 'Producción Textil',
    type: 'custom',
    fields: [
      { id: 'process', name: 'Proceso', type: 'string', required: true },
      { id: 'energy_use', name: 'Uso Energético (kWh)', type: 'number', required: true },
      { id: 'output', name: 'Producción (m²)', type: 'number', required: true },
      { id: 'quality', name: 'Calidad (%)', type: 'percentage', required: false },
    ],
    sampleData: [
      { process: 'Hilado', energy_use: 450, output: 1200, quality: 94.5 },
      { process: 'Tejido', energy_use: 680, output: 980, quality: 96.2 },
      { process: 'Teñido', energy_use: 520, output: 950, quality: 92.8 },
      { process: 'Acabado', energy_use: 280, output: 920, quality: 98.1 },
    ]
  },
  {
    id: 'cooperative-distribution',
    name: 'Distribución Cooperativa',
    type: 'custom',
    fields: [
      { id: 'zone', name: 'Zona', type: 'string', required: true },
      { id: 'members', name: 'Socios', type: 'number', required: true },
      { id: 'consumption', name: 'Consumo (MWh)', type: 'number', required: true },
      { id: 'satisfaction', name: 'Satisfacción (%)', type: 'percentage', required: false },
    ],
    sampleData: [
      { zone: 'Rural Norte', members: 1250, consumption: 890, satisfaction: 87.5 },
      { zone: 'Rural Sur', members: 980, consumption: 720, satisfaction: 91.2 },
      { zone: 'Urbano Centro', members: 2100, consumption: 1580, satisfaction: 89.8 },
      { zone: 'Periurbano', members: 650, consumption: 480, satisfaction: 85.3 },
    ]
  },
];

/**
 * Predefined report configurations for different client types
 */
export class DemoConfigurationService {
  
  /**
   * Creates a comprehensive global report configuration
   */
  static createGlobalReportConfig(): ReportConfig {
    const configId = generateId();
    
    return {
      id: configId,
      name: 'Informe Global Energético',
      spaces: [
        // First row: Energy mix overview
        {
          id: generateId(),
          columns: 2,
          components: [
            {
              id: generateId(),
              type: 'generation-mix',
              columnIndex: 0,
              config: {
                title: 'Mix Energético Nacional',
                subtitle: 'Distribución por fuente de generación',
                height: 300,
                colors: ['#FF7A00', '#4CAF50', '#2196F3', '#FFC107'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'energy-generation-mix')!,
            },
            {
              id: generateId(),
              type: 'demand-trend',
              columnIndex: 1,
              config: {
                title: 'Tendencia de Demanda',
                subtitle: 'Evolución mensual de la demanda',
                height: 300,
                colors: ['#FF7A00', '#FF9800'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'demand-monthly')!,
            },
          ],
          order: 0,
        },
        // Second row: Cost analysis
        {
          id: generateId(),
          columns: 1,
          components: [
            {
              id: generateId(),
              type: 'cost-comparison',
              columnIndex: 0,
              config: {
                title: 'Análisis de Costos de Generación',
                subtitle: 'Comparación por tecnología vs presupuesto',
                height: 350,
                colors: ['#FF7A00', '#E0E0E0'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'cost-generation')!,
            },
          ],
          order: 1,
        },
        // Third row: Efficiency metrics
        {
          id: generateId(),
          columns: 3,
          components: [
            {
              id: generateId(),
              type: 'custom-bar',
              columnIndex: 0,
              config: {
                title: 'Eficiencia de Plantas',
                subtitle: 'Por central generadora',
                height: 250,
                colors: ['#4CAF50', '#E0E0E0'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'efficiency-plant')!,
            },
            {
              id: generateId(),
              type: 'custom-line',
              columnIndex: 1,
              config: {
                title: 'Demanda Horaria',
                subtitle: 'Perfil típico diario',
                height: 250,
                colors: ['#2196F3'],
                showLegend: false,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'demand-hourly')!,
            },
            {
              id: generateId(),
              type: 'custom-pie',
              columnIndex: 2,
              config: {
                title: 'Costos de Mantenimiento',
                subtitle: 'Distribución por equipo',
                height: 250,
                colors: ['#FF7A00', '#FF9800', '#FFC107', '#FFE082'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'cost-maintenance')!,
            },
          ],
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
  }

  /**
   * Creates a mining company specific report
   */
  static createMiningCompanyConfig(clientId: string): ReportConfig {
    const configId = generateId();
    
    return {
      id: configId,
      name: 'Informe Energético - Minera Los Andes',
      clientId,
      spaces: [
        // Mining operations focus
        {
          id: generateId(),
          columns: 2,
          components: [
            {
              id: generateId(),
              type: 'custom-bar',
              columnIndex: 0,
              config: {
                title: 'Consumo por Operación Minera',
                subtitle: 'Distribución energética por proceso',
                height: 320,
                colors: ['#FF7A00', '#FF5722'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'mining-operations')!,
            },
            {
              id: generateId(),
              type: 'demand-trend',
              columnIndex: 1,
              config: {
                title: 'Demanda Industrial',
                subtitle: 'Consumo por sector industrial',
                height: 320,
                colors: ['#795548', '#8D6E63'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'demand-industrial')!,
            },
          ],
          order: 0,
        },
        // Cost efficiency focus
        {
          id: generateId(),
          columns: 1,
          components: [
            {
              id: generateId(),
              type: 'cost-comparison',
              columnIndex: 0,
              config: {
                title: 'Análisis de Costos Energéticos',
                subtitle: 'Comparación con presupuesto y variaciones',
                height: 300,
                colors: ['#FF7A00', '#E0E0E0', '#F44336'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'cost-generation')!,
            },
          ],
          order: 1,
        },
        // Efficiency and renewable focus
        {
          id: generateId(),
          columns: 2,
          components: [
            {
              id: generateId(),
              type: 'generation-mix',
              columnIndex: 0,
              config: {
                title: 'Fuentes Renovables',
                subtitle: 'Mix de energías limpias',
                height: 280,
                colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'energy-generation-renewable')!,
            },
            {
              id: generateId(),
              type: 'custom-line',
              columnIndex: 1,
              config: {
                title: 'Eficiencia Operacional',
                subtitle: 'Métricas de red y distribución',
                height: 280,
                colors: ['#2196F3', '#03A9F4'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'efficiency-network')!,
            },
          ],
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
  }

  /**
   * Creates a textile company specific report
   */
  static createTextileCompanyConfig(clientId: string): ReportConfig {
    const configId = generateId();
    
    return {
      id: configId,
      name: 'Informe Energético - Textil Argentina',
      clientId,
      spaces: [
        // Production efficiency focus
        {
          id: generateId(),
          columns: 1,
          components: [
            {
              id: generateId(),
              type: 'custom-bar',
              columnIndex: 0,
              config: {
                title: 'Consumo Energético por Proceso Textil',
                subtitle: 'Análisis de eficiencia por etapa de producción',
                height: 350,
                colors: ['#E91E63', '#F06292', '#F8BBD9', '#FCE4EC'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'textile-production')!,
            },
          ],
          order: 0,
        },
        // Cost and demand analysis
        {
          id: generateId(),
          columns: 2,
          components: [
            {
              id: generateId(),
              type: 'cost-comparison',
              columnIndex: 0,
              config: {
                title: 'Costos de Energía',
                subtitle: 'Análisis vs presupuesto',
                height: 300,
                colors: ['#FF7A00', '#E0E0E0'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'cost-generation')!,
            },
            {
              id: generateId(),
              type: 'demand-trend',
              columnIndex: 1,
              config: {
                title: 'Perfil de Demanda',
                subtitle: 'Consumo horario típico',
                height: 300,
                colors: ['#9C27B0'],
                showLegend: false,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'demand-hourly')!,
            },
          ],
          order: 1,
        },
        // Sustainability metrics
        {
          id: generateId(),
          columns: 3,
          components: [
            {
              id: generateId(),
              type: 'generation-mix',
              columnIndex: 0,
              config: {
                title: 'Energías Renovables',
                subtitle: 'Compromiso sustentable',
                height: 250,
                colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'energy-generation-renewable')!,
            },
            {
              id: generateId(),
              type: 'custom-pie',
              columnIndex: 1,
              config: {
                title: 'Costos de Transmisión',
                subtitle: 'Por región',
                height: 250,
                colors: ['#FF7A00', '#FF9800', '#FFC107', '#FFE082'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'cost-transmission')!,
            },
            {
              id: generateId(),
              type: 'custom-line',
              columnIndex: 2,
              config: {
                title: 'Eficiencia de Planta',
                subtitle: 'Rendimiento vs objetivo',
                height: 250,
                colors: ['#2196F3', '#E0E0E0'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'efficiency-plant')!,
            },
          ],
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
  }

  /**
   * Creates a cooperative specific report
   */
  static createCooperativeConfig(clientId: string): ReportConfig {
    const configId = generateId();
    
    return {
      id: configId,
      name: 'Informe Energético - Cooperativa Eléctrica Centro',
      clientId,
      spaces: [
        // Member and distribution focus
        {
          id: generateId(),
          columns: 2,
          components: [
            {
              id: generateId(),
              type: 'custom-bar',
              columnIndex: 0,
              config: {
                title: 'Distribución por Zona',
                subtitle: 'Socios y consumo por área de servicio',
                height: 320,
                colors: ['#3F51B5', '#5C6BC0'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'cooperative-distribution')!,
            },
            {
              id: generateId(),
              type: 'demand-trend',
              columnIndex: 1,
              config: {
                title: 'Evolución de la Demanda',
                subtitle: 'Tendencia mensual de consumo',
                height: 320,
                colors: ['#FF7A00'],
                showLegend: false,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'demand-monthly')!,
            },
          ],
          order: 0,
        },
        // Cost efficiency and network quality
        {
          id: generateId(),
          columns: 1,
          components: [
            {
              id: generateId(),
              type: 'custom-line',
              columnIndex: 0,
              config: {
                title: 'Indicadores de Calidad de Servicio',
                subtitle: 'Métricas de eficiencia y disponibilidad',
                height: 300,
                colors: ['#4CAF50', '#FF9800', '#2196F3', '#F44336'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'efficiency-network')!,
            },
          ],
          order: 1,
        },
        // Sustainability and costs
        {
          id: generateId(),
          columns: 2,
          components: [
            {
              id: generateId(),
              type: 'generation-mix',
              columnIndex: 0,
              config: {
                title: 'Mix Energético Cooperativo',
                subtitle: 'Fuentes de abastecimiento',
                height: 280,
                colors: ['#FF7A00', '#4CAF50', '#2196F3', '#FFC107'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'energy-generation-mix')!,
            },
            {
              id: generateId(),
              type: 'cost-comparison',
              columnIndex: 1,
              config: {
                title: 'Análisis de Costos',
                subtitle: 'Gestión financiera energética',
                height: 280,
                colors: ['#FF7A00', '#E0E0E0'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'cost-generation')!,
            },
          ],
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
  }

  /**
   * Creates an industrial company specific report
   */
  static createIndustrialCompanyConfig(clientId: string): ReportConfig {
    const configId = generateId();
    
    return {
      id: configId,
      name: 'Informe Energético - Industrias del Sur S.A.',
      clientId,
      spaces: [
        // Industrial demand analysis
        {
          id: generateId(),
          columns: 1,
          components: [
            {
              id: generateId(),
              type: 'demand-trend',
              columnIndex: 0,
              config: {
                title: 'Demanda Industrial por Sector',
                subtitle: 'Análisis de consumo y eficiencia por área productiva',
                height: 350,
                colors: ['#607D8B', '#78909C', '#90A4AE', '#B0BEC5', '#CFD8DC'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'demand-industrial')!,
            },
          ],
          order: 0,
        },
        // Cost and efficiency analysis
        {
          id: generateId(),
          columns: 2,
          components: [
            {
              id: generateId(),
              type: 'cost-comparison',
              columnIndex: 0,
              config: {
                title: 'Costos Energéticos',
                subtitle: 'Análisis por fuente de suministro',
                height: 300,
                colors: ['#FF7A00', '#E0E0E0', '#F44336'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'cost-generation')!,
            },
            {
              id: generateId(),
              type: 'custom-bar',
              columnIndex: 1,
              config: {
                title: 'Eficiencia Operacional',
                subtitle: 'Rendimiento vs objetivos',
                height: 300,
                colors: ['#4CAF50', '#E0E0E0'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'efficiency-plant')!,
            },
          ],
          order: 1,
        },
        // Maintenance and thermal generation
        {
          id: generateId(),
          columns: 2,
          components: [
            {
              id: generateId(),
              type: 'custom-pie',
              columnIndex: 0,
              config: {
                title: 'Costos de Mantenimiento',
                subtitle: 'Distribución por tipo de equipo',
                height: 280,
                colors: ['#FF7A00', '#FF9800', '#FFC107', '#FFE082'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'cost-maintenance')!,
            },
            {
              id: generateId(),
              type: 'generation-mix',
              columnIndex: 1,
              config: {
                title: 'Generación Térmica',
                subtitle: 'Detalle por combustible',
                height: 280,
                colors: ['#795548', '#8D6E63', '#A1887F', '#BCAAA4'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'energy-generation-thermal')!,
            },
          ],
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
  }

  /**
   * Creates an energy company specific report
   */
  static createEnergyCompanyConfig(clientId: string): ReportConfig {
    const configId = generateId();
    
    return {
      id: configId,
      name: 'Informe Energético - Empresa Energética Norte',
      clientId,
      spaces: [
        // Comprehensive energy overview
        {
          id: generateId(),
          columns: 3,
          components: [
            {
              id: generateId(),
              type: 'generation-mix',
              columnIndex: 0,
              config: {
                title: 'Mix Energético Total',
                subtitle: 'Distribución general',
                height: 280,
                colors: ['#FF7A00', '#4CAF50', '#2196F3', '#FFC107'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'energy-generation-mix')!,
            },
            {
              id: generateId(),
              type: 'generation-mix',
              columnIndex: 1,
              config: {
                title: 'Generación Térmica',
                subtitle: 'Detalle por combustible',
                height: 280,
                colors: ['#795548', '#8D6E63', '#A1887F', '#BCAAA4'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'energy-generation-thermal')!,
            },
            {
              id: generateId(),
              type: 'generation-mix',
              columnIndex: 2,
              config: {
                title: 'Energías Renovables',
                subtitle: 'Detalle por tecnología',
                height: 280,
                colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'energy-generation-renewable')!,
            },
          ],
          order: 0,
        },
        // Demand and cost analysis
        {
          id: generateId(),
          columns: 2,
          components: [
            {
              id: generateId(),
              type: 'demand-trend',
              columnIndex: 0,
              config: {
                title: 'Evolución de la Demanda',
                subtitle: 'Tendencia mensual con pronósticos',
                height: 320,
                colors: ['#FF7A00', '#FF9800'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'demand-monthly')!,
            },
            {
              id: generateId(),
              type: 'cost-comparison',
              columnIndex: 1,
              config: {
                title: 'Análisis de Costos',
                subtitle: 'Por tecnología vs presupuesto',
                height: 320,
                colors: ['#FF7A00', '#E0E0E0', '#F44336'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'cost-generation')!,
            },
          ],
          order: 1,
        },
        // Operational efficiency
        {
          id: generateId(),
          columns: 2,
          components: [
            {
              id: generateId(),
              type: 'custom-bar',
              columnIndex: 0,
              config: {
                title: 'Eficiencia de Plantas',
                subtitle: 'Rendimiento por central',
                height: 300,
                colors: ['#4CAF50', '#E0E0E0'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'efficiency-plant')!,
            },
            {
              id: generateId(),
              type: 'custom-line',
              columnIndex: 1,
              config: {
                title: 'Indicadores de Red',
                subtitle: 'Métricas de calidad y eficiencia',
                height: 300,
                colors: ['#2196F3', '#FF9800', '#4CAF50', '#F44336'],
                showLegend: true,
                showTooltip: true,
              },
              dataSource: demoDataSources.find(ds => ds.id === 'efficiency-network')!,
            },
          ],
          order: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
  }

  /**
   * Gets all predefined demo configurations
   */
  static getAllDemoConfigurations(): { 
    global: ReportConfig; 
    clients: Array<{ clientId: string; config: ReportConfig }> 
  } {
    return {
      global: this.createGlobalReportConfig(),
      clients: [
        { clientId: 'client-1', config: this.createEnergyCompanyConfig('client-1') },
        { clientId: 'client-2', config: this.createIndustrialCompanyConfig('client-2') },
        { clientId: 'client-3', config: this.createCooperativeConfig('client-3') },
        { clientId: 'client-4', config: this.createMiningCompanyConfig('client-4') },
        { clientId: 'client-5', config: this.createTextileCompanyConfig('client-5') },
      ]
    };
  }

  /**
   * Creates demo scenarios for testing different use cases
   */
  static getDemoScenarios(): Array<{
    name: string;
    description: string;
    config: ReportConfig;
    testCases: string[];
  }> {
    return [
      {
        name: 'Escenario Completo',
        description: 'Configuración con todos los tipos de componentes y espacios',
        config: this.createGlobalReportConfig(),
        testCases: [
          'Validar renderizado de todos los tipos de gráficos',
          'Probar drag & drop entre diferentes espacios',
          'Verificar responsividad en diferentes tamaños de pantalla',
          'Testear guardado y carga de configuración compleja'
        ]
      },
      {
        name: 'Escenario Minimalista',
        description: 'Configuración básica con pocos componentes',
        config: {
          id: generateId(),
          name: 'Informe Básico',
          spaces: [
            {
              id: generateId(),
              columns: 1,
              components: [
                {
                  id: generateId(),
                  type: 'generation-mix',
                  columnIndex: 0,
                  config: {
                    title: 'Mix Energético Básico',
                    height: 300,
                    colors: ['#FF7A00', '#4CAF50'],
                    showLegend: true,
                    showTooltip: true,
                  },
                  dataSource: demoDataSources.find(ds => ds.id === 'energy-generation-mix')!,
                },
              ],
              order: 0,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        },
        testCases: [
          'Validar configuración mínima válida',
          'Probar adición de nuevos componentes',
          'Verificar validación de canvas vacío'
        ]
      },
      {
        name: 'Escenario de Estrés',
        description: 'Configuración con máximo número de componentes',
        config: this.createStressTestConfig(),
        testCases: [
          'Probar rendimiento con muchos componentes',
          'Validar límites de grid y columnas',
          'Testear scroll y navegación en configuraciones grandes',
          'Verificar tiempo de guardado y carga'
        ]
      }
    ];
  }

  /**
   * Creates a stress test configuration with maximum components
   */
  private static createStressTestConfig(): ReportConfig {
    const configId = generateId();
    const spaces: GridSpace[] = [];

    // Create multiple spaces with different column configurations
    for (let i = 0; i < 5; i++) {
      const columns = (i % 3) + 1 as 1 | 2 | 3;
      const components: ChartComponent[] = [];

      for (let j = 0; j < columns; j++) {
        const componentTypes: ChartComponentType[] = [
          'generation-mix', 'demand-trend', 'cost-comparison', 
          'custom-bar', 'custom-line', 'custom-pie'
        ];
        
        components.push({
          id: generateId(),
          type: componentTypes[j % componentTypes.length],
          columnIndex: j,
          config: {
            title: `Componente ${i}-${j}`,
            subtitle: `Espacio ${i}, Columna ${j}`,
            height: 250,
            colors: ['#FF7A00', '#4CAF50', '#2196F3'],
            showLegend: true,
            showTooltip: true,
          },
          dataSource: demoDataSources[j % demoDataSources.length],
        });
      }

      spaces.push({
        id: generateId(),
        columns,
        components,
        order: i,
      });
    }

    return {
      id: configId,
      name: 'Configuración de Estrés - Máximos Componentes',
      spaces,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
  }
}