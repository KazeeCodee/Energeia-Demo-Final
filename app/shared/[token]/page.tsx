'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SharedLink, ReportData } from '@/lib/types';
import { SharedLinksService } from '@/lib/services/shared-links';
import { SimulationManager } from '@/lib/mock/simulators/delays';
import { generateMockReportData } from '@/lib/mock/generators/reports';
import { ReportDisplay } from '@/components/reports/report-display';
import { FilteredReportDisplay } from '@/components/reports/filtered-report-display';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertCircle, 
  Clock, 
  Eye, 
  Share2, 
  ExternalLink,
  Calendar,
  Building2,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface SharedReportPageState {
  loading: boolean;
  error: string | null;
  link: SharedLink | null;
  reportData: ReportData | null;
  accessLogged: boolean;
}

export default function SharedReportPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [state, setState] = useState<SharedReportPageState>({
    loading: true,
    error: null,
    link: null,
    reportData: null,
    accessLogged: false
  });

  useEffect(() => {
    const loadSharedReport = async () => {
      if (!token) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Token de enlace no válido'
        }));
        return;
      }

      try {
        // Simulate network delay
        await SimulationManager.delay();

        // Validate the shared link
        const validation = await SharedLinksService.validateSharedLink(token);
        
        if (!validation.valid) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: validation.error || 'Enlace no válido'
          }));
          return;
        }

        const sharedLink = validation.link!;

        // Generate or load report data
        let reportData: ReportData;
        
        if (sharedLink.origin === 'home') {
          // For home origin, show the latest report
          const companyId = sharedLink.companyIds[0];
          const currentDate = new Date();
          const period = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          
          reportData = generateMockReportData(companyId, period);
        } else {
          // For reports origin with filters, generate filtered data
          const companyId = sharedLink.companyIds[0];
          const period = sharedLink.filters?.period?.value as string || 
                        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
          
          reportData = generateMockReportData(companyId, period);
        }

        // Log access (increment access count)
        await SharedLinksService.incrementAccessCount(sharedLink.id);
        const updatedAccessCount = sharedLink.accessCount + 1;

        setState(prev => ({
          ...prev,
          loading: false,
          link: { ...sharedLink, accessCount: updatedAccessCount },
          reportData,
          accessLogged: true
        }));

      } catch (error) {
        console.error('Error loading shared report:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar el informe compartido'
        }));
      }
    };

    loadSharedReport();
  }, [token]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTimeUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expirado';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
    }
  };

  const handleDownloadPDF = async () => {
    if (!state.reportData) return;
    
    try {
      toast.loading('Generando PDF...');
      await SimulationManager.delay();
      
      // Simulate PDF download
      const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe-${state.reportData.period}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('PDF descargado correctamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al descargar el PDF');
    }
  };

  const handleDownloadCSV = async () => {
    if (!state.reportData) return;
    
    try {
      toast.loading('Generando CSV...');
      await SimulationManager.delay();
      
      // Simulate CSV download
      const csvContent = `Período,Generación Total,Mix Renovable\n${state.reportData.period},${state.reportData.totalGeneration.value},${state.reportData.generationMix.renewable}%`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datos-${state.reportData.period}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('CSV descargado correctamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al descargar el CSV');
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-64" />
            </div>
            
            <Card className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <Skeleton className="h-64" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Card className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Enlace no disponible
            </h1>
            <p className="text-gray-600 mb-6">
              {state.error}
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Ir al inicio
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!state.link || !state.reportData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Share2 className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Informe Energético Compartido
                </h1>
                <p className="text-gray-600">
                  Período: {state.reportData.period}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={handleDownloadCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>

          {/* Link Info */}
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Enlace temporal
                  </p>
                  <p className="text-sm text-orange-700">
                    Este enlace expira en {getTimeUntilExpiry(state.link.expiresAt)}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Vence el {formatDate(state.link.expiresAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-orange-700">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{state.link.accessCount} visualizaciones</span>
                </div>
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  {state.link.origin === 'home' ? 'Inicio' : 'Informes'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Report Content */}
          {state.link.origin === 'home' ? (
            <ReportDisplay 
              report={state.reportData}
              showActions={false}
            />
          ) : (
            <FilteredReportDisplay 
              reports={[state.reportData]}
              filters={state.link.filters || {
                period: { type: 'month', value: state.reportData.period },
                mode: 'compare'
              }}
              showActions={false}
            />
          )}

          {/* Footer */}
          <Card className="p-6 bg-gray-50 border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Building2 className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Portal de Informes Energeia
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Este informe fue compartido de forma temporal y no requiere autenticación.
                Para acceder a más informes y funcionalidades, contacta con tu administrador.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}