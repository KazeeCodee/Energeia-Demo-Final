'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Download, Share2, Building2, Users, TrendingUp } from 'lucide-react';
import { BackofficeFilterPanel } from '@/components/backoffice/backoffice-filter-panel';
import { GlobalReportDisplay } from '@/components/backoffice/global-report-display';
import { CompanyComparisonView } from '@/components/backoffice/company-comparison-view';
import { ShareModal } from '@/components/modals/share-modal';
import { useReportsStore } from '@/lib/state/reports';
import { useAuthStore } from '@/lib/state/auth';
import { ReportFilters, ReportData } from '@/lib/types';
import { getMockData } from '@/lib/mock/data/seeds';
import { SimulationManager } from '@/lib/mock/simulators/delays';
import { toast } from 'sonner';

export default function BackofficeReportsPage() {
  const { user } = useAuthStore();
  const { filteredReports, filters, isLoading, loadFilteredReports, setFilters } = useReportsStore();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState<ReportData | null>(null);
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // Load companies for the filter
    const mockData = getMockData();
    if (mockData) {
      setCompanies(mockData.companies.map(c => ({ id: c.id, name: c.name })));
    }
  }, []);

  useEffect(() => {
    // Load initial reports with default filters
    if (companies.length > 0) {
      const initialFilters: ReportFilters = {
        ...filters,
        scope: 'all',
        viewMode: 'aggregated',
      };
      loadFilteredReports(initialFilters);
    }
  }, [companies.length]);

  const handleFiltersChange = async (newFilters: ReportFilters) => {
    setFilters(newFilters);
    await loadFilteredReports(newFilters);
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      await SimulationManager.delay(1500);
      
      const fileName = `informes_globales_${new Date().toISOString().slice(0, 10)}.${format}`;
      toast.success(`Exportación iniciada`, {
        description: `Se está generando el archivo ${fileName}. Te notificaremos cuando esté listo.`,
      });
      
      // Simulate download after a delay
      setTimeout(() => {
        toast.success(`Descarga lista`, {
          description: `El archivo ${fileName} está listo para descargar.`,
        });
      }, 3000);
    } catch (error) {
      toast.error('Error al exportar', {
        description: 'No se pudo generar el archivo de exportación.',
      });
    }
  };

  const handleShare = (reportData: ReportData) => {
    setSelectedReportData(reportData);
    setShareModalOpen(true);
  };

  const handleCreateShareLink = async (config: any) => {
    try {
      await SimulationManager.delay(800);
      
      const shareUrl = `https://portal.energeia.com.ar/shared/${Math.random().toString(36).substring(2, 15)}`;
      
      toast.success('Enlace creado', {
        description: 'El enlace compartido ha sido generado exitosamente.',
      });
      
      return shareUrl;
    } catch (error) {
      toast.error('Error al crear enlace', {
        description: 'No se pudo generar el enlace compartido.',
      });
      throw error;
    }
  };

  const getStatsCards = () => {
    const totalCompanies = companies.length;
    const activeReports = filteredReports.length;
    const selectedCompanies = filters.companies?.length || totalCompanies;
    
    return [
      {
        title: 'Empresas Seleccionadas',
        value: selectedCompanies,
        total: totalCompanies,
        icon: Building2,
        color: 'text-blue-600',
      },
      {
        title: 'Informes Disponibles',
        value: activeReports,
        icon: BarChart3,
        color: 'text-green-600',
      },
      {
        title: 'Período Analizado',
        value: getPeriodLabel(),
        icon: TrendingUp,
        color: 'text-orange-600',
      },
    ];
  };

  const getPeriodLabel = () => {
    if (filters.period.type === 'month') {
      return filters.period.value as string;
    } else if (filters.period.type === 'range') {
      const range = filters.period.value as { start: string; end: string };
      return `${range.start} - ${range.end}`;
    } else if (filters.period.preset) {
      switch (filters.period.preset) {
        case 'last3': return 'Últimos 3 meses';
        case 'last6': return 'Últimos 6 meses';
        case 'last12': return 'Últimos 12 meses';
        default: return 'Período personalizado';
      }
    }
    return 'Sin período';
  };

  if (!user || user.role !== 'backoffice') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Acceso no autorizado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Informes Globales</h1>
          <p className="text-gray-600">
            Gestión y análisis de informes de todas las empresas
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={isLoading || filteredReports.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={isLoading || filteredReports.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getStatsCards().map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {typeof stat.value === 'number' ? stat.value : stat.value}
                  {stat.total && typeof stat.value === 'number' && (
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      / {stat.total}
                    </span>
                  )}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <BackofficeFilterPanel
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
        companies={companies}
        isLoading={isLoading}
      />

      {/* Results */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Resultados del Análisis
            </h2>
            {filteredReports.length > 0 && (
              <Badge variant="secondary">
                {filteredReports.length} informes
              </Badge>
            )}
          </div>
          
          {filteredReports.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare(filteredReports[0])}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartir Vista
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando informes...</p>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron informes</p>
              <p className="text-sm text-gray-400">
                Ajusta los filtros para ver resultados
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="aggregated" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="aggregated">Vista Agregada</TabsTrigger>
              <TabsTrigger value="by_company">Por Empresa</TabsTrigger>
            </TabsList>
            
            <TabsContent value="aggregated" className="mt-6">
              <GlobalReportDisplay
                reports={filteredReports}
                filters={filters}
                companies={companies}
                onExport={handleExport}
                onShare={handleShare}
              />
            </TabsContent>
            
            <TabsContent value="by_company" className="mt-6">
              <CompanyComparisonView
                reports={filteredReports}
                filters={filters}
                companies={companies}
                onExport={handleExport}
                onShare={handleShare}
              />
            </TabsContent>
          </Tabs>
        )}
      </Card>

      {/* Share Modal */}
      {selectedReportData && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          reportData={selectedReportData}
          origin="reports"
          filters={filters}
        />
      )}
    </div>
  );
}