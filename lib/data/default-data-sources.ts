import { DataSource } from '../types/constructor';

export const defaultDataSources: DataSource[] = [
  {
    id: 'energy-generation',
    name: 'Generación de Energía',
    type: 'energy-generation',
    fields: [
      { id: 'thermal', name: 'Térmica', type: 'percentage', required: true },
      { id: 'hydraulic', name: 'Hidráulica', type: 'percentage', required: true },
      { id: 'nuclear', name: 'Nuclear', type: 'percentage', required: true },
      { id: 'renewable', name: 'Renovable', type: 'percentage', required: true },
    ],
    sampleData: [
      { thermal: 45, hydraulic: 25, nuclear: 15, renewable: 15 }
    ]
  },
  {
    id: 'demand-trend',
    name: 'Tendencia de Demanda',
    type: 'demand',
    fields: [
      { id: 'month', name: 'Mes', type: 'string', required: true },
      { id: 'demand', name: 'Demanda (MWh)', type: 'number', required: true },
      { id: 'variation', name: 'Variación (%)', type: 'percentage', required: false },
    ],
    sampleData: [
      { month: 'Ene', demand: 1200, variation: 5.2 },
      { month: 'Feb', demand: 1150, variation: -2.1 },
      { month: 'Mar', demand: 1300, variation: 8.7 },
      { month: 'Abr', demand: 1250, variation: 3.5 },
      { month: 'May', demand: 1180, variation: -1.8 },
      { month: 'Jun', demand: 1350, variation: 7.2 },
    ]
  },
  {
    id: 'cost-comparison',
    name: 'Comparación de Costos',
    type: 'cost',
    fields: [
      { id: 'category', name: 'Categoría', type: 'string', required: true },
      { id: 'cost', name: 'Costo (USD/MWh)', type: 'number', required: true },
      { id: 'budget', name: 'Presupuesto', type: 'number', required: false },
    ],
    sampleData: [
      { category: 'CAMMESA', cost: 45.2, budget: 50.0 },
      { category: 'PLUS', cost: 38.7, budget: 40.0 },
      { category: 'Renovable', cost: 42.1, budget: 45.0 },
    ]
  },
  {
    id: 'efficiency-metrics',
    name: 'Métricas de Eficiencia',
    type: 'efficiency',
    fields: [
      { id: 'metric', name: 'Métrica', type: 'string', required: true },
      { id: 'value', name: 'Valor', type: 'number', required: true },
      { id: 'target', name: 'Objetivo', type: 'number', required: false },
    ],
    sampleData: [
      { metric: 'Eficiencia Energética', value: 85.5, target: 90.0 },
      { metric: 'Factor de Carga', value: 72.3, target: 75.0 },
      { metric: 'Disponibilidad', value: 94.8, target: 95.0 },
    ]
  },
  {
    id: 'custom-data-1',
    name: 'Datos Personalizados - Ventas',
    type: 'custom',
    fields: [
      { id: 'category', name: 'Categoría', type: 'string', required: true },
      { id: 'value', name: 'Valor', type: 'number', required: true },
    ],
    sampleData: [
      { category: 'Q1', value: 120 },
      { category: 'Q2', value: 150 },
      { category: 'Q3', value: 180 },
      { category: 'Q4', value: 200 },
    ]
  },
  {
    id: 'custom-data-2',
    name: 'Datos Personalizados - Regiones',
    type: 'custom',
    fields: [
      { id: 'category', name: 'Región', type: 'string', required: true },
      { id: 'value', name: 'Consumo (MWh)', type: 'number', required: true },
    ],
    sampleData: [
      { category: 'Norte', value: 450 },
      { category: 'Centro', value: 680 },
      { category: 'Sur', value: 320 },
      { category: 'Este', value: 520 },
    ]
  }
];
