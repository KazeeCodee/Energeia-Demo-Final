'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportData, ReportFilters } from '@/lib/types';
import { MultiSeriesChart } from '@/components/charts/multi-series-chart';
import { Download, Share2, Building2, TrendingUp, BarChart3 } from 'lucide-react';

interface CompanyComparisonViewProps {
  reports: ReportData[];
  filters: ReportFilters;
  companies: Array<{ id: string; name: string }>;
  onExport: (format: 'pdf' | 'csv') => void;
  onShare: (reportData: ReportData) => void;
}

export function CompanyComparisonView({
  reports,
  filters,
  companies,
  onExport,
  onShare,
}: CompanyComparisonViewProps) {
  
  const companyData = useMemo(() => {
    // Group reports by company
    const groupedByCompany = reports.reduce((acc, report) => {
      if (!acc[report.companyId]) {
        acc[report.companyId] = [];
      }
      acc[report.companyId].push(report);
      return acc;
    }, {} as Record<string, ReportData[]>);

    // Process each company's data based on the mode
    return Object.entries(groupedByCompany).map(([companyId, companyReports]) => {
      const company = companies.find(c => c.id === companyId);
      const processedData = processCompanyReports(companyReports, filters.mode);
      
      return {
        companyId,
        companyName: company?.name || `Empresa ${companyId}`,
        reports: companyReports,
        aggregatedData: processedData,
      };
    });
  }, [reports, filters.mode, companies]);

  const getGenerationComparisonData = () => {
    return companyData.map(company => ({
      name: company.companyName,
      thermal: company.aggregatedData.generationMix.thermal,
      hydraulic: company.aggregatedData.generationMix.hydraulic,
      nuclear: company.aggregatedData.generationMix.nuclear,
      renewable: company.aggregatedData.generationMix.renewable,
      total: company.aggregatedData.totalGeneration.value,
    }));
  };

  const getDemandComparisonData = () => {
    // Get all unique months from all companies
    const allMonths = new Set<string>();
    companyData.forEach(company => {
      company.aggregatedData.mobileDemand.forEach(item => {
        allMonths.add(item.month);
      });
    });

    const sortedMonths = Array.from(allMonths).sort();

    return sortedMonths.map(month => {
      const dataPoint: any = { month };
      
      companyData.forEach(company => {
        const monthData = company.aggregatedData.mobileDemand.find(item => item.month === month);
        dataPoint[company.companyName] = monthData?.demand || 0;
      });
      
      return dataPoint;
    });
  };

  const getCostComparisonData = () => {
    const allMonths = new Set<string>();
    companyData.forEach(company => {
      company.aggregatedData.supplyCosts.monthly.forEach(item => {
        allMonths.add(item.month);
      });
    });

    const sortedMonths = Array.from(allMonths).sort();

    return sortedMonths.map(month => {
      const dataPoint: any = { month };
      
      companyData.forEach(company => {
        const monthData = company.aggregatedData.supplyCosts.monthly.find(item => item.month === month);
        dataPoint[company.companyName] = monthData?.cost || 0;
      });
      
      return dataPoint;
    });
  };

  const getCompanyColors = () => {
    const colors = [
      '#FF7A00', // Orange (primary)
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#3B82F6', // Blue
      '#84CC16', // Lime
    ];
    
    return companyData.reduce((acc, company, index) => {
      acc[company.companyName] = colors[index % colors.length];
      return acc;
    }, {} as Record<string, string>);
  };

  const getBenchmarkStats = () => {
    if (companyData.length === 0) return null;

    const totalGenerations = companyData.map(c => c.aggregatedData.totalGeneration.value);
    const renewablePercentages = companyData.map(c => c.aggregatedData.renewablePercentage.annual);
    const materGenerations = companyData.map(c => c.aggregatedData.materGeneration.value);

    return {
      totalGeneration: {
        max: Math.max(...totalGenerations),
        min: Math.min(...totalGenerations),
        avg: totalGenerations.reduce((sum, val) => sum + val, 0) / totalGenerations.length,
      },
      renewablePercentage: {
        max: Math.max(...renewablePercentages),
        min: Math.min(...renewablePercentages),
        avg: renewablePercentages.reduce((sum, val) => sum + val, 0) / renewablePercentages.length,
      },
      materGeneration: {
        max: Math.max(...materGenerations),
        min: Math.min(...materGenerations),
        avg: materGenerations.reduce((sum, val) => sum + val, 0) / materGenerations.length,
      },
    };
  };

  const benchmarkStats = getBenchmarkStats();
  const colors = getCompanyColors();

  if (companyData.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No hay datos de empresas para comparar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Benchmark Summary */}
      {benchmarkStats && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Benchmark de Empresas</h3>
            <Badge variant="secondary">{companyData.length} empresas</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Generación Total (GWh)</p>
              <div className="space-y-1">
                <p className="text-lg font-bold text-green-600">
                  Máx: {benchmarkStats.totalGeneration.max.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">
                  Prom: {benchmarkStats.totalGeneration.avg.toFixed(1)}
                </p>
                <p className="text-lg font-bold text-red-600">
                  Mín: {benchmarkStats.totalGeneration.min.toFixed(1)}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">% Renovable</p>
              <div className="space-y-1">
                <p className="text-lg font-bold text-green-600">
                  Máx: {benchmarkStats.renewablePercentage.max.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">
                  Prom: {benchmarkStats.renewablePercentage.avg.toFixed(1)}%
                </p>
                <p className="text-lg font-bold text-red-600">
                  Mín: {benchmarkStats.renewablePercentage.min.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Generación MATER (GWh)</p>
              <div className="space-y-1">
                <p className="text-lg font-bold text-green-600">
                  Máx: {benchmarkStats.materGeneration.max.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">
                  Prom: {benchmarkStats.materGeneration.avg.toFixed(1)}
                </p>
                <p className="text-lg font-bold text-red-600">
                  Mín: {benchmarkStats.materGeneration.min.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companyData.map((company) => (
          <Card key={company.companyId} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full bg-orange-500"
                />
                <h4 className="font-semibold text-gray-900">{company.companyName}</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare(company.reports[0])}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Generación Total:</span>
                <span className="font-medium">
                  {company.aggregatedData.totalGeneration.value.toFixed(1)} GWh
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">% Renovable:</span>
                <span className="font-medium">
                  {company.aggregatedData.renewablePercentage.annual.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">MATER:</span>
                <span className="font-medium">
                  {company.aggregatedData.materGeneration.value.toFixed(1)} GWh
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Informes:</span>
                <span className="font-medium">{company.reports.length}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparison Charts */}
      <Tabs defaultValue="generation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generation">Generación</TabsTrigger>
          <TabsTrigger value="demand">Demanda</TabsTrigger>
          <TabsTrigger value="costs">Costos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generation" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Comparación de Generación por Empresa
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
            
            <MultiSeriesChart
              type="bar"
              data={getGenerationComparisonData()}
              config={{
                colors: Object.values(colors),
                showLegend: true,
                showTooltip: true,
                responsive: true,
              }}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="demand" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Comparación de Demanda Temporal
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
            
            <MultiSeriesChart
              type="line"
              data={getDemandComparisonData()}
              config={{
                colors: Object.values(colors),
                showLegend: true,
                showTooltip: true,
                responsive: true,
              }}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="costs" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Comparación de Costos de Abastecimiento
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
            
            <MultiSeriesChart
              type="line"
              data={getCostComparisonData()}
              config={{
                colors: Object.values(colors),
                showLegend: true,
                showTooltip: true,
                responsive: true,
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Company Analysis */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Análisis Detallado por Empresa</h3>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Empresa</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Gen. Total (GWh)</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Gen. MATER (GWh)</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">% Renovable</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Potencia MATER (MW)</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">GUMA (GWh)</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">GUME (GWh)</th>
              </tr>
            </thead>
            <tbody>
              {companyData.map((company) => (
                <tr key={company.companyId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full bg-orange-500"
                      />
                      <span className="font-medium">{company.companyName}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-mono">
                    {company.aggregatedData.totalGeneration.value.toFixed(1)}
                  </td>
                  <td className="text-right py-3 px-4 font-mono">
                    {company.aggregatedData.materGeneration.value.toFixed(1)}
                  </td>
                  <td className="text-right py-3 px-4 font-mono">
                    {company.aggregatedData.renewablePercentage.annual.toFixed(1)}%
                  </td>
                  <td className="text-right py-3 px-4 font-mono">
                    {company.aggregatedData.materPowerIncome.toFixed(0)}
                  </td>
                  <td className="text-right py-3 px-4 font-mono">
                    {company.aggregatedData.demandBySegment.guma.toFixed(1)}
                  </td>
                  <td className="text-right py-3 px-4 font-mono">
                    {company.aggregatedData.demandBySegment.gume.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Helper function to process company reports based on mode
function processCompanyReports(reports: ReportData[], mode: 'compare' | 'accumulate' | 'average'): ReportData {
  if (reports.length === 0) {
    throw new Error('No reports to process');
  }

  if (reports.length === 1) {
    return reports[0];
  }

  // Sort reports by period
  const sortedReports = reports.sort((a, b) => a.period.localeCompare(b.period));

  switch (mode) {
    case 'compare':
      // Return the latest report for comparison
      return sortedReports[sortedReports.length - 1];
    
    case 'accumulate':
      return aggregateReports(sortedReports, 'sum');
    
    case 'average':
      return aggregateReports(sortedReports, 'average');
    
    default:
      return sortedReports[sortedReports.length - 1];
  }
}

// Reuse the aggregation function from GlobalReportDisplay
function aggregateReports(reports: ReportData[], mode: 'sum' | 'average'): ReportData {
  if (reports.length === 0) {
    throw new Error('No reports to aggregate');
  }

  if (reports.length === 1) {
    return reports[0];
  }

  const divisor = mode === 'average' ? reports.length : 1;

  return {
    id: 'aggregated',
    companyId: reports[0].companyId,
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
    
    priceComparison: [],
    mobileDemand: aggregateMobileDemand(reports, mode),
    
    renewablePercentage: {
      annual: reports.reduce((sum, r) => sum + r.renewablePercentage.annual, 0) / reports.length,
    },
    
    energeiaAgreement: {
      monthly: reports.reduce((sum, r) => sum + r.energeiaAgreement.monthly, 0) / divisor,
      annual: reports.reduce((sum, r) => sum + r.energeiaAgreement.annual, 0) / divisor,
    },
    
    memCosts: [],
    supplyCosts: aggregateSupplyCosts(reports, mode),
  };
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