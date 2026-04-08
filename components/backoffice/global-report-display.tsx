'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReportData, ReportFilters } from '@/lib/types';
import { GenerationMixChart } from '@/components/charts/generation-mix-chart';
import { DemandTrendChart } from '@/components/charts/demand-trend-chart';
import { CostComparisonChart } from '@/components/charts/cost-comparison-chart';
import { Download, Share2, TrendingUp, Zap, DollarSign, Factory } from 'lucide-react';

interface GlobalReportDisplayProps {
  reports: ReportData[];
  filters: ReportFilters;
  companies: Array<{ id: string; name: string }>;
  onExport: (format: 'pdf' | 'csv') => void;
  onShare: (reportData: ReportData) => void;
}

export function GlobalReportDisplay({
  reports,
  filters,
  companies,
  onExport,
  onShare,
}: GlobalReportDisplayProps) {
  
  const aggregatedData = useMemo(() => {
    if (reports.length === 0) return null;

    // Aggregate data based on the mode
    switch (filters.mode) {
      case 'accumulate':
        return aggregateReports(reports, 'sum');
      case 'average':
        return aggregateReports(reports, 'average');
      case 'compare':
      default:
        // For compare mode, we'll show the latest period's aggregated data
        const latestPeriod = reports.reduce((latest, report) => 
          report.period > latest ? report.period : latest, reports[0].period
        );
        const latestReports = reports.filter(r => r.period === latestPeriod);
        return aggregateReports(latestReports, 'sum');
    }
  }, [reports, filters.mode]);

  const getCompanyNames = () => {
    const selectedCompanyIds = filters.companies || [];
    if (filters.scope === 'all' || selectedCompanyIds.length === 0) {
      return companies.map(c => c.name);
    }
    return companies
      .filter(c => selectedCompanyIds.includes(c.id))
      .map(c => c.name);
  };

  const getGenerationMixData = () => {
    if (!aggregatedData) return [];
    
    return [
      { name: 'Térmica', value: aggregatedData.generationMix.thermal, color: '#8B5CF6' },
      { name: 'Hidráulica', value: aggregatedData.generationMix.hydraulic, color: '#06B6D4' },
      { name: 'Nuclear', value: aggregatedData.generationMix.nuclear, color: '#10B981' },
      { name: 'Renovable', value: aggregatedData.generationMix.renewable, color: '#FF7A00' },
    ];
  };

  const getDemandTrendData = () => {
    if (!aggregatedData) return [];
    
    return aggregatedData.mobileDemand.map(item => ({
      month: item.month,
      demand: item.demand,
      monthlyDemand: item.monthlyDemand,
    }));
  };

  const getCostComparisonData = () => {
    if (!aggregatedData) return [];
    
    return aggregatedData.memCosts.map(item => ({
      month: item.month,
      cammesa: item.cammesa,
      plus: item.plus,
      renewable: item.renewable,
    }));
  };

  const getSupplyCostData = () => {
    if (!aggregatedData) return [];
    
    return aggregatedData.supplyCosts.monthly.map(item => ({
      month: item.month,
      cost: item.cost,
    }));
  };

  if (!aggregatedData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Generación Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {aggregatedData.totalGeneration.value.toFixed(1)} GWh
              </p>
              <p className="text-xs text-gray-500">
                {aggregatedData.totalGeneration.monthlyVariation > 0 ? '+' : ''}
                {aggregatedData.totalGeneration.monthlyVariation.toFixed(1)}% vs mes anterior
              </p>
            </div>
            <Zap className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Generación MATER</p>
              <p className="text-2xl font-bold text-gray-900">
                {aggregatedData.materGeneration.value.toFixed(1)} GWh
              </p>
              <p className="text-xs text-gray-500">
                {aggregatedData.materGeneration.monthlyVariation > 0 ? '+' : ''}
                {aggregatedData.materGeneration.monthlyVariation.toFixed(1)}% vs mes anterior
              </p>
            </div>
            <Factory className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">% Renovable</p>
              <p className="text-2xl font-bold text-gray-900">
                {aggregatedData.renewablePercentage.annual.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">Anual</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Potencia MATER</p>
              <p className="text-2xl font-bold text-gray-900">
                {aggregatedData.materPowerIncome.toFixed(0)} MW
              </p>
              <p className="text-xs text-gray-500">Ingreso</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Company scope indicator */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Alcance del Análisis</h3>
            <div className="flex flex-wrap gap-1 mt-2">
              {getCompanyNames().slice(0, 3).map((name, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {name}
                </Badge>
              ))}
              {getCompanyNames().length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{getCompanyNames().length - 3} más
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {filters.mode === 'compare' && 'Datos del último período disponible'}
              {filters.mode === 'accumulate' && 'Valores acumulados del período'}
              {filters.mode === 'average' && 'Valores promedio del período'}
            </p>
            <p className="text-xs text-gray-500">
              {reports.length} informes procesados
            </p>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Mix */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Mix de Generación</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(reports[0])}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <GenerationMixChart
            data={aggregatedData.generationMix}
            subtitle={filters.period.type === 'month' ? filters.period.value as string : 'Período seleccionado'}
          />
        </Card>

        {/* Demand Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Demanda Año Móvil</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(reports[0])}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <DemandTrendChart
            data={getDemandTrendData()}
            compareMode={filters.mode === 'compare'}
          />
        </Card>

        {/* Cost Comparison */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Costos MEM</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(reports[0])}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <CostComparisonChart
            memCosts={getCostComparisonData()}
            supplyCosts={getSupplyCostData()}
          />
        </Card>

        {/* Supply Costs */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Costos de Abastecimiento</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(reports[0])}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <CostComparisonChart
            memCosts={[]}
            supplyCosts={getSupplyCostData()}
            title="Costos de Abastecimiento"
          />
        </Card>
      </div>

      {/* Large Users and Supply Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grandes Usuarios</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">GUDI</span>
              <span className="text-lg font-semibold text-gray-900">
                {aggregatedData.largeUsers.gudi.toFixed(1)} GWh
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">GUMA</span>
              <span className="text-lg font-semibold text-gray-900">
                {aggregatedData.largeUsers.guma.toFixed(1)} GWh
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">GUME</span>
              <span className="text-lg font-semibold text-gray-900">
                {aggregatedData.largeUsers.gume.toFixed(1)} GWh
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mix de Abastecimiento</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">MATER</span>
              <span className="text-lg font-semibold text-gray-900">
                {aggregatedData.supplyMix.mater.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">PLUS</span>
              <span className="text-lg font-semibold text-gray-900">
                {aggregatedData.supplyMix.plus.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">SPOT</span>
              <span className="text-lg font-semibold text-gray-900">
                {aggregatedData.supplyMix.spot.toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Export Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Exportar Análisis</h3>
            <p className="text-xs text-gray-500">
              Descargar los datos agregados en diferentes formatos
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('pdf')}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper function to aggregate reports
function aggregateReports(reports: ReportData[], mode: 'sum' | 'average'): ReportData {
  if (reports.length === 0) {
    throw new Error('No reports to aggregate');
  }

  if (reports.length === 1) {
    return reports[0];
  }

  const divisor = mode === 'average' ? reports.length : 1;

  // Create aggregated report structure
  const aggregated: ReportData = {
    id: 'aggregated',
    companyId: 'all',
    period: reports[0].period,
    generatedAt: new Date(),
    
    totalGeneration: {
      value: reports.reduce((sum, r) => sum + r.totalGeneration.value, 0) / divisor,
      monthlyVariation: reports.reduce((sum, r) => sum + r.totalGeneration.monthlyVariation, 0) / reports.length,
      annualVariation: reports.reduce((sum, r) => sum + r.totalGeneration.annualVariation, 0) / reports.length,
    },
    
    generationMix: {
      thermal: reports.reduce((sum, r) => sum + r.generationMix.thermal, 0) / reports.length,
      hydraulic: reports.reduce((sum, r) => sum + r.generationMix.hydraulic, 0) / reports.length,
      nuclear: reports.reduce((sum, r) => sum + r.generationMix.nuclear, 0) / reports.length,
      renewable: reports.reduce((sum, r) => sum + r.generationMix.renewable, 0) / reports.length,
    },
    
    materGeneration: {
      value: reports.reduce((sum, r) => sum + r.materGeneration.value, 0) / divisor,
      monthlyVariation: reports.reduce((sum, r) => sum + r.materGeneration.monthlyVariation, 0) / reports.length,
      annualVariation: reports.reduce((sum, r) => sum + r.materGeneration.annualVariation, 0) / reports.length,
    },
    
    largeUsers: {
      gudi: reports.reduce((sum, r) => sum + r.largeUsers.gudi, 0) / divisor,
      guma: reports.reduce((sum, r) => sum + r.largeUsers.guma, 0) / divisor,
      gume: reports.reduce((sum, r) => sum + r.largeUsers.gume, 0) / divisor,
    },
    
    supplyMix: {
      mater: reports.reduce((sum, r) => sum + r.supplyMix.mater, 0) / reports.length,
      plus: reports.reduce((sum, r) => sum + r.supplyMix.plus, 0) / reports.length,
      spot: reports.reduce((sum, r) => sum + r.supplyMix.spot, 0) / reports.length,
    },
    
    demandBySegment: {
      guma: reports.reduce((sum, r) => sum + r.demandBySegment.guma, 0) / divisor,
      gume: reports.reduce((sum, r) => sum + r.demandBySegment.gume, 0) / divisor,
    },
    
    materPowerIncome: reports.reduce((sum, r) => sum + r.materPowerIncome, 0) / divisor,
    
    priceComparison: aggregatePriceComparison(reports, mode),
    mobileDemand: aggregateMobileDemand(reports, mode),
    
    renewablePercentage: {
      annual: reports.reduce((sum, r) => sum + r.renewablePercentage.annual, 0) / reports.length,
    },
    
    energeiaAgreement: {
      monthly: reports.reduce((sum, r) => sum + r.energeiaAgreement.monthly, 0) / divisor,
      annual: reports.reduce((sum, r) => sum + r.energeiaAgreement.annual, 0) / divisor,
    },
    
    memCosts: aggregateMemCosts(reports, mode),
    supplyCosts: aggregateSupplyCosts(reports, mode),
  };

  return aggregated;
}

function aggregatePriceComparison(reports: ReportData[], mode: 'sum' | 'average') {
  const distributorMap = new Map<string, number[]>();
  
  reports.forEach(report => {
    report.priceComparison.forEach(item => {
      if (!distributorMap.has(item.distributor)) {
        distributorMap.set(item.distributor, []);
      }
      distributorMap.get(item.distributor)!.push(item.difference);
    });
  });
  
  return Array.from(distributorMap.entries()).map(([distributor, differences]) => ({
    distributor,
    difference: differences.reduce((sum, diff) => sum + diff, 0) / differences.length,
  }));
}

function aggregateMobileDemand(reports: ReportData[], mode: 'sum' | 'average') {
  const monthMap = new Map<string, { demand: number[]; monthlyDemand: number[] }>();
  
  reports.forEach(report => {
    report.mobileDemand.forEach(item => {
      if (!monthMap.has(item.month)) {
        monthMap.set(item.month, { demand: [], monthlyDemand: [] });
      }
      monthMap.get(item.month)!.demand.push(item.demand);
      monthMap.get(item.month)!.monthlyDemand.push(item.monthlyDemand);
    });
  });
  
  const divisor = mode === 'average' ? reports.length : 1;
  
  return Array.from(monthMap.entries()).map(([month, values]) => ({
    month,
    demand: values.demand.reduce((sum, val) => sum + val, 0) / divisor,
    monthlyDemand: values.monthlyDemand.reduce((sum, val) => sum + val, 0) / divisor,
  }));
}

function aggregateMemCosts(reports: ReportData[], mode: 'sum' | 'average') {
  const monthMap = new Map<string, { cammesa: number[]; plus: number[]; renewable: number[] }>();
  
  reports.forEach(report => {
    report.memCosts.forEach(item => {
      if (!monthMap.has(item.month)) {
        monthMap.set(item.month, { cammesa: [], plus: [], renewable: [] });
      }
      monthMap.get(item.month)!.cammesa.push(item.cammesa);
      monthMap.get(item.month)!.plus.push(item.plus);
      monthMap.get(item.month)!.renewable.push(item.renewable);
    });
  });
  
  return Array.from(monthMap.entries()).map(([month, values]) => ({
    month,
    cammesa: values.cammesa.reduce((sum, val) => sum + val, 0) / values.cammesa.length,
    plus: values.plus.reduce((sum, val) => sum + val, 0) / values.plus.length,
    renewable: values.renewable.reduce((sum, val) => sum + val, 0) / values.renewable.length,
  }));
}

function aggregateSupplyCosts(reports: ReportData[], mode: 'sum' | 'average') {
  const monthlyMap = new Map<string, number[]>();
  const mobileMap = new Map<string, number[]>();
  
  reports.forEach(report => {
    report.supplyCosts.monthly.forEach(item => {
      if (!monthlyMap.has(item.month)) {
        monthlyMap.set(item.month, []);
      }
      monthlyMap.get(item.month)!.push(item.cost);
    });
    
    report.supplyCosts.mobileCosts.forEach(item => {
      if (!mobileMap.has(item.month)) {
        mobileMap.set(item.month, []);
      }
      mobileMap.get(item.month)!.push(item.cost);
    });
  });
  
  return {
    monthly: Array.from(monthlyMap.entries()).map(([month, costs]) => ({
      month,
      cost: costs.reduce((sum, cost) => sum + cost, 0) / costs.length,
    })),
    mobileCosts: Array.from(mobileMap.entries()).map(([month, costs]) => ({
      month,
      cost: costs.reduce((sum, cost) => sum + cost, 0) / costs.length,
    })),
  };
}