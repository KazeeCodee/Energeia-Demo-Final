'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/state/auth';
import { ReportData } from '@/lib/types';
import { getReportsForCompany } from '@/lib/mock/data/seeds';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  History, 
  Download, 
  Eye, 
  Calendar,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function HistoricosPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const loadHistoricalReports = async () => {
      if (!user?.companyId) return;

      setIsLoading(true);
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const companyReports = getReportsForCompany(user.companyId);
        
        // Filter out reports with invalid dates and validate generatedAt
        const validReports = companyReports.filter(report => {
          try {
            if (!report.generatedAt) return false;
            const date = typeof report.generatedAt === 'string' ? new Date(report.generatedAt) : report.generatedAt;
            return !isNaN(date.getTime());
          } catch {
            return false;
          }
        });
        
        const sortedReports = validReports.sort((a, b) => 
          new Date(b.period).getTime() - new Date(a.period).getTime()
        );
        
        setReports(sortedReports);
        setFilteredReports(sortedReports);
      } catch (error) {
        console.error('Error loading historical reports:', error);
        toast.error('Error al cargar el historial de informes');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistoricalReports();
  }, [user?.companyId]);

  useEffect(() => {
    // Apply filters
    let filtered = reports;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        formatPeriod(report.period).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filter
    if (dateFilter.startDate) {
      filtered = filtered.filter(report => report.period >= dateFilter.startDate);
    }
    if (dateFilter.endDate) {
      filtered = filtered.filter(report => report.period <= dateFilter.endDate);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, dateFilter]);

  const formatPeriod = (period: string) => {
    try {
      const [year, month] = period.split('-');
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const monthIndex = parseInt(month) - 1;
      
      if (monthIndex < 0 || monthIndex >= 12 || !year) {
        return period; // Return original if invalid
      }
      
      return `${monthNames[monthIndex]} ${year}`;
    } catch (error) {
      console.error('Error formatting period:', error);
      return period; // Return original if error
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    try {
      if (!date) return 'N/A';
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) return 'N/A';
      
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const handleViewReport = (report: ReportData) => {
    // Demo: No hacer nada, solo mostrar que es clickeable
    toast.info('Función de demo', {
      description: `Ver informe de ${formatPeriod(report.period)} - Disponible en versión completa`
    });
  };

  const handleDownloadReport = async (report: ReportData, format: 'pdf' | 'csv') => {
    // Demo: No hacer nada, solo mostrar que es clickeable
    toast.info('Función de demo', {
      description: `Descargar ${format.toUpperCase()} de ${formatPeriod(report.period)} - Disponible en versión completa`
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter({ startDate: '', endDate: '' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <History className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Históricos</h1>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <History className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Históricos</h1>
            <p className="text-gray-600">
              Consulta y descarga informes energéticos anteriores
            </p>
          </div>
        </div>
        
        <Badge variant="secondary" className="text-sm">
          {filteredReports.length} informe{filteredReports.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por período..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                type="month"
                placeholder="Desde"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-40"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                type="month"
                placeholder="Hasta"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-40"
              />
            </div>
            
            {(searchTerm || dateFilter.startDate || dateFilter.endDate) && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Reports Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Informes Disponibles</h2>
          </div>
          
          {filteredReports.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay informes disponibles
              </h3>
              <p className="text-gray-600">
                {searchTerm || dateFilter.startDate || dateFilter.endDate
                  ? 'No se encontraron informes que coincidan con los filtros aplicados.'
                  : 'Aún no hay informes históricos disponibles para tu empresa.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Fecha de Generación</TableHead>
                    <TableHead>Generación Total</TableHead>
                    <TableHead>% Renovable</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {formatPeriod(report.period)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(report.generatedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {report.totalGeneration.value.toLocaleString()} GWh
                          </span>
                          <span className={`text-xs ${
                            report.totalGeneration.monthlyVariation >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {report.totalGeneration.monthlyVariation >= 0 ? '+' : ''}
                            {report.totalGeneration.monthlyVariation.toFixed(1)}% vs mes anterior
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={report.generationMix.renewable >= 30 ? 'default' : 'secondary'}
                          className={report.generationMix.renewable >= 30 ? 'bg-green-100 text-green-800' : ''}
                        >
                          {report.generationMix.renewable.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReport(report, 'pdf')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}