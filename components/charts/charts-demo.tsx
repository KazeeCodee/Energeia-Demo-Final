'use client';

import { GenerationMixChart, DemandTrendChart, CostComparisonChart } from './index';
import { ReportData } from '@/lib/types';

// Sample data for testing charts
const sampleReportData: ReportData = {
  id: 'test-report',
  companyId: 'test-company',
  period: '2024-10',
  generatedAt: new Date(),
  totalGeneration: {
    value: 10500,
    monthlyVariation: 2.3,
    annualVariation: 5.1
  },
  generationMix: {
    thermal: 48.5,
    hydraulic: 28.2,
    nuclear: 10.1,
    renewable: 13.2
  },
  materGeneration: {
    value: 2100,
    monthlyVariation: 1.8,
    annualVariation: 3.4
  },
  largeUsers: {
    gudi: 850,
    guma: 620,
    gume: 430
  },
  supplyMix: {
    mater: 72.5,
    plus: 18.3,
    spot: 9.2
  },
  demandBySegment: {
    guma: 6800,
    gume: 2400
  },
  materPowerIncome: 245,
  priceComparison: [
    { distributor: 'EDENOR', difference: -3.2 },
    { distributor: 'EDESUR', difference: 1.8 },
    { distributor: 'EDELAP', difference: -1.5 }
  ],
  mobileDemand: [
    { month: '2023-11', demand: 8900, monthlyDemand: 7800 },
    { month: '2023-12', demand: 9200, monthlyDemand: 8100 },
    { month: '2024-01', demand: 9500, monthlyDemand: 8300 },
    { month: '2024-02', demand: 9100, monthlyDemand: 7900 },
    { month: '2024-03', demand: 9300, monthlyDemand: 8000 },
    { month: '2024-04', demand: 8800, monthlyDemand: 7600 },
    { month: '2024-05', demand: 8600, monthlyDemand: 7400 },
    { month: '2024-06', demand: 8400, monthlyDemand: 7200 },
    { month: '2024-07', demand: 8200, monthlyDemand: 7000 },
    { month: '2024-08', demand: 8500, monthlyDemand: 7300 },
    { month: '2024-09', demand: 8900, monthlyDemand: 7700 },
    { month: '2024-10', demand: 9200, monthlyDemand: 8000 }
  ],
  renewablePercentage: {
    annual: 15.8,
    byPoint: [
      { point: 'Punto A', percentage: 22.5 },
      { point: 'Punto B', percentage: 18.2 },
      { point: 'Punto C', percentage: 12.1 }
    ]
  },
  energeiaAgreement: {
    monthly: 1680000,
    annual: 20160000
  },
  memCosts: [
    { month: '2024-05', cammesa: 52.3, plus: 68.7, renewable: 41.2 },
    { month: '2024-06', cammesa: 49.8, plus: 65.4, renewable: 38.9 },
    { month: '2024-07', cammesa: 47.2, plus: 62.1, renewable: 36.5 },
    { month: '2024-08', cammesa: 50.1, plus: 66.8, renewable: 39.7 },
    { month: '2024-09', cammesa: 53.4, plus: 71.2, renewable: 42.8 },
    { month: '2024-10', cammesa: 55.7, plus: 74.1, renewable: 44.3 }
  ],
  supplyCosts: {
    monthly: [
      { month: '2024-05', cost: 48.5 },
      { month: '2024-06', cost: 46.2 },
      { month: '2024-07', cost: 43.8 },
      { month: '2024-08', cost: 47.1 },
      { month: '2024-09', cost: 50.3 },
      { month: '2024-10', cost: 52.8 }
    ],
    mobileCosts: [
      { month: '2024-05', cost: 45.2 },
      { month: '2024-06', cost: 43.1 },
      { month: '2024-07', cost: 41.5 },
      { month: '2024-08', cost: 44.8 },
      { month: '2024-09', cost: 47.9 },
      { month: '2024-10', cost: 50.1 }
    ]
  }
};

export function ChartsDemo() {
  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Demo de Componentes de Gráficos
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generation Mix Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <GenerationMixChart
              data={sampleReportData.generationMix}
              title="Mix de Generación Energética"
              subtitle="Distribución por tipo de energía - Octubre 2024"
            />
          </div>

          {/* Demand Trend Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <DemandTrendChart
              data={sampleReportData.mobileDemand}
              title="Evolución de la Demanda"
              subtitle="Demanda año móvil vs mensual"
            />
          </div>

          {/* Cost Comparison Chart - Full Width */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <CostComparisonChart
              memCosts={sampleReportData.memCosts}
              supplyCosts={sampleReportData.supplyCosts.monthly}
              mobileCosts={sampleReportData.supplyCosts.mobileCosts}
              title="Análisis de Costos Energéticos"
              subtitle="Comparación de costos MEM vs abastecimiento"
              height={400}
            />
          </div>
        </div>

        {/* Loading State Demo */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Estado de Carga
          </h2>
          <GenerationMixChart
            data={sampleReportData.generationMix}
            title="Gráfico en Estado de Carga"
            loading={true}
          />
        </div>
      </div>
    </div>
  );
}