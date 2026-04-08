'use client';

import { ReportData, ReportFilters } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { GenerationMixChart } from '@/components/charts/generation-mix-chart';
import { DemandTrendChart } from '@/components/charts/demand-trend-chart';

import { 
  Zap, 
  TrendingUp, 
  Factory, 
  Users, 
  PieChart, 
  BarChart3,
  Percent,
  FileText,

  Calendar,
  Activity
} from 'lucide-react';

interface FilteredReportDisplayProps {
  reports: ReportData[];
  filters: ReportFilters;
  showActions?: boolean;
}

export function FilteredReportDisplay({ reports, filters, showActions = true }: FilteredReportDisplayProps) {
  const formatNumber = (value: number, decimals = 1) => {
    return value.toLocaleString('es-AR', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatPercentage = (value: number) => {
    return `${formatNumber(value, 1)}%`;
  };

  const formatVariation = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    const color = value >= 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={color}>
        {sign}{formatPercentage(value)}
      </span>
    );
  };

  // Calculate aggregated data based on mode
  const getAggregatedData = () => {
    if (reports.length === 0) return null;

    switch (filters.mode) {
      case 'accumulate':
        return accumulateReports(reports);
      case 'average':
        return averageReports(reports);
      case 'compare':
      default:
        return reports; // Return all reports for comparison
    }
  };

  const accumulateReports = (reports: ReportData[]): ReportData => {
    const accumulated = { ...reports[0] };
    
    // Sum up all numeric values
    accumulated.totalGeneration.value = reports.reduce((sum, r) => sum + r.totalGeneration.value, 0);
    accumulated.materGeneration.value = reports.reduce((sum, r) => sum + r.materGeneration.value, 0);
    accumulated.materPowerIncome = reports.reduce((sum, r) => sum + r.materPowerIncome, 0);
    
    // Average percentages
    accumulated.generationMix.thermal = reports.reduce((sum, r) => sum + r.generationMix.thermal, 0) / reports.length;
    accumulated.generationMix.hydraulic = reports.reduce((sum, r) => sum + r.generationMix.hydraulic, 0) / reports.length;
    accumulated.generationMix.nuclear = reports.reduce((sum, r) => sum + r.generationMix.nuclear, 0) / reports.length;
    accumulated.generationMix.renewable = reports.reduce((sum, r) => sum + r.generationMix.renewable, 0) / reports.length;
    
    // Accumulate large users
    accumulated.largeUsers.gudi = reports.reduce((sum, r) => sum + r.largeUsers.gudi, 0);
    accumulated.largeUsers.guma = reports.reduce((sum, r) => sum + r.largeUsers.guma, 0);
    accumulated.largeUsers.gume = reports.reduce((sum, r) => sum + r.largeUsers.gume, 0);
    
    // Average supply mix
    accumulated.supplyMix.mater = reports.reduce((sum, r) => sum + r.supplyMix.mater, 0) / reports.length;
    accumulated.supplyMix.plus = reports.reduce((sum, r) => sum + r.supplyMix.plus, 0) / reports.length;
    accumulated.supplyMix.spot = reports.reduce((sum, r) => sum + r.supplyMix.spot, 0) / reports.length;
    
    // Accumulate demand by segment
    accumulated.demandBySegment.guma = reports.reduce((sum, r) => sum + r.demandBySegment.guma, 0);
    accumulated.demandBySegment.gume = reports.reduce((sum, r) => sum + r.demandBySegment.gume, 0);
    
    // Accumulate Energeia agreement
    accumulated.energeiaAgreement.monthly = reports.reduce((sum, r) => sum + r.energeiaAgreement.monthly, 0);
    accumulated.energeiaAgreement.annual = reports.reduce((sum, r) => sum + r.energeiaAgreement.annual, 0);
    
    // Average renewable percentage
    accumulated.renewablePercentage.annual = reports.reduce((sum, r) => sum + r.renewablePercentage.annual, 0) / reports.length;
    
    // Set variations to 0 for accumulated data
    accumulated.totalGeneration.monthlyVariation = 0;
    accumulated.totalGeneration.annualVariation = 0;
    accumulated.materGeneration.monthlyVariation = 0;
    accumulated.materGeneration.annualVariation = 0;
    
    // Update period to show range
    const periods = reports.map(r => r.period).sort();
    accumulated.period = `${periods[0]} - ${periods[periods.length - 1]}`;
    
    return accumulated;
  };

  const averageReports = (reports: ReportData[]): ReportData => {
    const averaged = { ...reports[0] };
    
    // Average all numeric values
    averaged.totalGeneration.value = reports.reduce((sum, r) => sum + r.totalGeneration.value, 0) / reports.length;
    averaged.materGeneration.value = reports.reduce((sum, r) => sum + r.materGeneration.value, 0) / reports.length;
    averaged.materPowerIncome = reports.reduce((sum, r) => sum + r.materPowerIncome, 0) / reports.length;
    
    // Average percentages
    averaged.generationMix.thermal = reports.reduce((sum, r) => sum + r.generationMix.thermal, 0) / reports.length;
    averaged.generationMix.hydraulic = reports.reduce((sum, r) => sum + r.generationMix.hydraulic, 0) / reports.length;
    averaged.generationMix.nuclear = reports.reduce((sum, r) => sum + r.generationMix.nuclear, 0) / reports.length;
    averaged.generationMix.renewable = reports.reduce((sum, r) => sum + r.generationMix.renewable, 0) / reports.length;
    
    // Average large users
    averaged.largeUsers.gudi = reports.reduce((sum, r) => sum + r.largeUsers.gudi, 0) / reports.length;
    averaged.largeUsers.guma = reports.reduce((sum, r) => sum + r.largeUsers.guma, 0) / reports.length;
    averaged.largeUsers.gume = reports.reduce((sum, r) => sum + r.largeUsers.gume, 0) / reports.length;
    
    // Average supply mix
    averaged.supplyMix.mater = reports.reduce((sum, r) => sum + r.supplyMix.mater, 0) / reports.length;
    averaged.supplyMix.plus = reports.reduce((sum, r) => sum + r.supplyMix.plus, 0) / reports.length;
    averaged.supplyMix.spot = reports.reduce((sum, r) => sum + r.supplyMix.spot, 0) / reports.length;
    
    // Average demand by segment
    averaged.demandBySegment.guma = reports.reduce((sum, r) => sum + r.demandBySegment.guma, 0) / reports.length;
    averaged.demandBySegment.gume = reports.reduce((sum, r) => sum + r.demandBySegment.gume, 0) / reports.length;
    
    // Average Energeia agreement
    averaged.energeiaAgreement.monthly = reports.reduce((sum, r) => sum + r.energeiaAgreement.monthly, 0) / reports.length;
    averaged.energeiaAgreement.annual = reports.reduce((sum, r) => sum + r.energeiaAgreement.annual, 0) / reports.length;
    
    // Average renewable percentage
    averaged.renewablePercentage.annual = reports.reduce((sum, r) => sum + r.renewablePercentage.annual, 0) / reports.length;
    
    // Average variations
    averaged.totalGeneration.monthlyVariation = reports.reduce((sum, r) => sum + r.totalGeneration.monthlyVariation, 0) / reports.length;
    averaged.totalGeneration.annualVariation = reports.reduce((sum, r) => sum + r.totalGeneration.annualVariation, 0) / reports.length;
    averaged.materGeneration.monthlyVariation = reports.reduce((sum, r) => sum + r.materGeneration.monthlyVariation, 0) / reports.length;
    averaged.materGeneration.annualVariation = reports.reduce((sum, r) => sum + r.materGeneration.annualVariation, 0) / reports.length;
    
    // Update period to show range
    const periods = reports.map(r => r.period).sort();
    averaged.period = `Promedio ${periods[0]} - ${periods[periods.length - 1]}`;
    
    return averaged;
  };

  const getPeriodLabel = () => {
    if (filters.period.type === 'month') {
      return filters.period.value as string;
    } else if (filters.period.type === 'range') {
      const range = filters.period.value as { start: string; end: string };
      return `${range.start} - ${range.end}`;
    } else if (filters.period.type === 'preset') {
      switch (filters.period.preset) {
        case 'last3': return 'Últimos 3 meses';
        case 'last6': return 'Últimos 6 meses';
        case 'last12': return 'Últimos 12 meses';
        default: return 'Período personalizado';
      }
    }
    return 'Período no definido';
  };

  const getModeLabel = () => {
    switch (filters.mode) {
      case 'compare': return 'Comparación';
      case 'accumulate': return 'Acumulado';
      case 'average': return 'Promedio';
      default: return filters.mode;
    }
  };

  const aggregatedData = getAggregatedData();

  if (!aggregatedData) {
    return (
      <Card className="p-8 text-center">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay datos disponibles
        </h3>
        <p className="text-gray-600">
          No se encontraron informes para los filtros seleccionados.
        </p>
      </Card>
    );
  }

  // For compare mode, show multiple reports
  if (filters.mode === 'compare' && Array.isArray(aggregatedData)) {
    return (
      <div className="space-y-6">
        {/* Header with filter info */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Informes Filtrados - {getModeLabel()}
                </h2>
                <p className="text-sm text-gray-600">
                  Período: {getPeriodLabel()} • {reports.length} informe(s)
                </p>
              </div>
            </div>
            <Badge variant="secondary">{getModeLabel()}</Badge>
          </div>
        </Card>

        {/* Show each report in comparison mode */}
        {aggregatedData.map((report, index) => (
          <Card key={report.id} className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Badge variant="outline">{report.period}</Badge>
              <h3 className="text-lg font-semibold text-gray-900">
                Informe {report.period}
              </h3>
            </div>
            
            {/* Simplified report display for comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {formatNumber(report.totalGeneration.value)} GWh
                </p>
                <p className="text-sm text-gray-600">Generación Total</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {formatNumber(report.materGeneration.value)} GWh
                </p>
                <p className="text-sm text-gray-600">Generación MATER</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {formatNumber(report.renewablePercentage.annual, 0)}%
                </p>
                <p className="text-sm text-gray-600">% Renovable</p>
              </div>
            </div>
          </Card>
        ))}

        {/* Combined charts for comparison */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Comparación de Demanda
            </h2>
          </div>
          
          {/* Combine mobile demand data from all reports */}
          <DemandTrendChart 
            data={aggregatedData.flatMap(report => 
              report.mobileDemand.map(item => ({
                ...item,
                reportPeriod: report.period
              }))
            )}
            height={350}
            compareMode={true}
          />
        </Card>
      </div>
    );
  }

  // For accumulate and average modes, show single aggregated report
  const singleReport = aggregatedData as ReportData;

  return (
    <div className="space-y-6">
      {/* Header with filter info */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-orange-500" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Informes Filtrados - {getModeLabel()}
              </h2>
              <p className="text-sm text-gray-600">
                Período: {getPeriodLabel()} • {reports.length} informe(s) procesado(s)
              </p>
            </div>
          </div>
          <Badge variant="secondary">{getModeLabel()}</Badge>
        </div>
      </Card>

      {/* Generación Total del MEM */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Generación Total del MEM
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(singleReport.totalGeneration.value)} GWh
            </p>
            <p className="text-sm text-gray-600">
              {filters.mode === 'accumulate' ? 'Total Acumulado' : 
               filters.mode === 'average' ? 'Promedio' : 'Generación Total'}
            </p>
          </div>
          {filters.mode === 'average' && (
            <>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {formatVariation(singleReport.totalGeneration.monthlyVariation)}
                </p>
                <p className="text-sm text-gray-600">Variación Mensual Promedio</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {formatVariation(singleReport.totalGeneration.annualVariation)}
                </p>
                <p className="text-sm text-gray-600">Variación Anual Promedio</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Mix de Generación */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <PieChart className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            {filters.mode === 'average' ? 'Mix de Generación Promedio' : 'Mix de Generación'}
          </h2>
        </div>
        
        <GenerationMixChart 
          data={singleReport.generationMix}
          height={350}
        />
      </Card>

      {/* Generación MATER y Grandes Usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Factory className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Generación MATER
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(singleReport.materGeneration.value)} GWh
              </p>
              <p className="text-sm text-gray-600">
                {filters.mode === 'accumulate' ? 'Total Acumulado' : 
                 filters.mode === 'average' ? 'Promedio' : 'Generación MATER'}
              </p>
            </div>
            
            <Separator />
            
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {formatNumber(singleReport.materPowerIncome)} MW
              </p>
              <p className="text-sm text-gray-600">
                {filters.mode === 'average' ? 'Potencia Promedio' : 'Potencia Ingresada MATER'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Grandes Usuarios
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">GUDI</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatNumber(singleReport.largeUsers.gudi)} GWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">GUMA</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatNumber(singleReport.largeUsers.guma)} GWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">GUME</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatNumber(singleReport.largeUsers.gume)} GWh
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Demanda por Segmento
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">GUMA</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(singleReport.demandBySegment.guma)} GWh
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">GUME</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(singleReport.demandBySegment.gume)} GWh
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Mix de Abastecimiento */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            {filters.mode === 'average' ? 'Mix de Abastecimiento Promedio' : 'Mix de Abastecimiento'}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-orange-600">
                {formatNumber(singleReport.supplyMix.mater, 0)}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">MATER</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatNumber(singleReport.supplyMix.plus, 0)}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">PLUS</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-gray-600">
                {formatNumber(singleReport.supplyMix.spot, 0)}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">SPOT</p>
          </div>
        </div>
      </Card>

      {/* Porcentaje Renovable y Acuerdo Energeia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Percent className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              % Renovable
            </h2>
          </div>
          
          <div className="text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-green-600">
                {formatNumber(singleReport.renewablePercentage.annual, 0)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {filters.mode === 'average' ? 'Porcentaje Promedio' : 'Porcentaje Anual'}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Acuerdo Energeia
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(singleReport.energeiaAgreement.monthly)} MWh
              </p>
              <p className="text-sm text-gray-600">
                {filters.mode === 'accumulate' ? 'Total Mensual' : 
                 filters.mode === 'average' ? 'Promedio Mensual' : 'Mensual'}
              </p>
            </div>
            
            <Separator />
            
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {formatNumber(singleReport.energeiaAgreement.annual)} MWh
              </p>
              <p className="text-sm text-gray-600">
                {filters.mode === 'accumulate' ? 'Total Anual' : 
                 filters.mode === 'average' ? 'Promedio Anual' : 'Anual'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}