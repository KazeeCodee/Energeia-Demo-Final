'use client';

import { ReportData } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ReportsErrorBoundary, ChartsErrorBoundary } from '@/components/ui/error-boundary';
import { ReportSkeleton } from '@/components/ui/loading-states';
import { GenerationMixChart } from '@/components/charts/generation-mix-chart';
import { DemandTrendChart } from '@/components/charts/demand-trend-chart';
import { CostComparisonChart } from '@/components/charts/cost-comparison-chart';
import { 
  Zap, 
  TrendingUp, 
  Factory, 
  Users, 
  PieChart, 
  BarChart3,
  Percent,
  FileText,
  DollarSign
} from 'lucide-react';

interface ReportDisplayProps {
  report: ReportData;
  showActions?: boolean;
}

export function ReportDisplay({ report }: ReportDisplayProps) {
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
    const ariaLabel = value >= 0 ? 'Aumento' : 'Disminución';
    return (
      <span className={color} aria-label={`${ariaLabel} del ${Math.abs(value).toFixed(1)}%`}>
        {sign}{formatPercentage(value)}
      </span>
    );
  };

  return (
    <ReportsErrorBoundary>
    <div className="space-y-4 md:space-y-6">
      {/* Generación Total del MEM */}
      <Card className="card-responsive">
        <div className="flex items-center space-x-3 mb-4">
          <Zap className="h-5 w-5 text-orange-500" aria-hidden="true" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Generación Total del MEM
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p 
              className="text-xl md:text-2xl font-bold text-gray-900"
              aria-label={`Generación total: ${formatNumber(report.totalGeneration.value)} gigavatios hora`}
            >
              {formatNumber(report.totalGeneration.value)} GWh
            </p>
            <p className="text-sm text-gray-600">Generación Total</p>
          </div>
          <div className="text-center">
            <p className="text-base md:text-lg font-semibold">
              {formatVariation(report.totalGeneration.monthlyVariation)}
            </p>
            <p className="text-sm text-gray-600">Variación Mensual</p>
          </div>
          <div className="text-center">
            <p className="text-base md:text-lg font-semibold">
              {formatVariation(report.totalGeneration.annualVariation)}
            </p>
            <p className="text-sm text-gray-600">Variación Anual</p>
          </div>
        </div>
      </Card>

      {/* Mix de Generación */}
      <Card className="card-responsive">
        <div className="flex items-center space-x-3 mb-4">
          <PieChart className="h-5 w-5 text-orange-500" aria-hidden="true" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Generación por Tipo
          </h2>
        </div>
        
        <ChartsErrorBoundary>
          <div role="img" aria-label="Gráfico de torta mostrando la distribución de generación por tipo de energía">
            <GenerationMixChart 
              data={report.generationMix}
              height={350}
            />
          </div>
        </ChartsErrorBoundary>
      </Card>

      {/* Generación MATER y Grandes Usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="card-responsive">
          <div className="flex items-center space-x-3 mb-4">
            <Factory className="h-5 w-5 text-orange-500" aria-hidden="true" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Generación MATER
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(report.materGeneration.value)} GWh
              </p>
              <p className="text-sm text-gray-600">Generación MATER</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold">
                  {formatVariation(report.materGeneration.monthlyVariation)}
                </p>
                <p className="text-xs text-gray-600">Var. Mensual</p>
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {formatVariation(report.materGeneration.annualVariation)}
                </p>
                <p className="text-xs text-gray-600">Var. Anual</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {formatNumber(report.materPowerIncome)} MW
              </p>
              <p className="text-sm text-gray-600">Potencia Ingresada MATER</p>
            </div>
          </div>
        </Card>

        <Card className="card-responsive">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-5 w-5 text-orange-500" aria-hidden="true" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Grandes Usuarios
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">GUDI</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatNumber(report.largeUsers.gudi)} GWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">GUMA</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatNumber(report.largeUsers.guma)} GWh
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">GUME</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatNumber(report.largeUsers.gume)} GWh
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
                    {formatNumber(report.demandBySegment.guma)} GWh
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">GUME</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(report.demandBySegment.gume)} GWh
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
            Mix de Abastecimiento
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-orange-600">
                {formatNumber(report.supplyMix.mater, 0)}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">MATER</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatNumber(report.supplyMix.plus, 0)}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">PLUS</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-gray-600">
                {formatNumber(report.supplyMix.spot, 0)}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">SPOT</p>
          </div>
        </div>
      </Card>

      {/* Tabla de Precios MEM vs Distribuidor */}
      <Card className="card-responsive">
        <div className="flex items-center space-x-3 mb-4">
          <DollarSign className="h-5 w-5 text-orange-500" aria-hidden="true" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Precios MEM vs Distribuidor
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table 
            className="w-full text-sm"
            role="table"
            aria-label="Comparación de precios entre MEM y distribuidores"
          >
            <thead>
              <tr className="border-b border-gray-200">
                <th 
                  className="text-left py-2 font-medium text-gray-700"
                  scope="col"
                >
                  Distribuidor
                </th>
                <th 
                  className="text-right py-2 font-medium text-gray-700"
                  scope="col"
                >
                  Diferencia vs MEM
                </th>
              </tr>
            </thead>
            <tbody>
              {report.priceComparison.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 text-gray-900">{item.distributor}</td>
                  <td className="py-2 text-right">
                    {formatVariation(item.difference)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Demanda Año Móvil */}
      <Card className="card-responsive">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="h-5 w-5 text-orange-500" aria-hidden="true" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            Demanda Año Móvil
          </h2>
        </div>
        
        <div role="img" aria-label="Gráfico de línea mostrando la evolución de la demanda durante el año móvil">
          <DemandTrendChart 
            data={report.mobileDemand}
            height={350}
          />
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
                {formatNumber(report.renewablePercentage.annual, 0)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Porcentaje Anual</p>
          </div>
          
          {report.renewablePercentage.byPoint && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Por Punto:</h3>
              {report.renewablePercentage.byPoint.map((point, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{point.point}</span>
                  <span className="font-semibold text-gray-900">
                    {formatPercentage(point.percentage)}
                  </span>
                </div>
              ))}
            </div>
          )}
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
                {formatNumber(report.energeiaAgreement.monthly)} MWh
              </p>
              <p className="text-sm text-gray-600">Mensual</p>
            </div>
            
            <Separator />
            
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {formatNumber(report.energeiaAgreement.annual)} MWh
              </p>
              <p className="text-sm text-gray-600">Anual</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Costos MEM y de Abastecimiento */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <DollarSign className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Costos MEM y de Abastecimiento
          </h2>
        </div>
        
        <CostComparisonChart
          memCosts={report.memCosts}
          supplyCosts={report.supplyCosts.monthly}
          mobileCosts={report.supplyCosts.mobileCosts}
          height={400}
        />
      </Card>
    </div>
    </ReportsErrorBoundary>
  );
}