'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/state/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Download, 
  FileText, 
  Search,
  Filter,
  ExternalLink,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface DownloadFile {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'csv';
  reportPeriod: string;
  generatedAt: Date;
  fileSize: number;
  status: 'ready' | 'generating' | 'expired';
  downloadUrl?: string;
  expiresAt: Date;
}

export default function DescargasPage() {
  const { user } = useAuthStore();
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<DownloadFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'pdf' | 'csv'>('all');

  useEffect(() => {
    const loadDownloadFiles = async () => {
      if (!user?.companyId) return;

      setIsLoading(true);
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock download files
        const mockFiles: DownloadFile[] = [
          {
            id: '1',
            fileName: 'informe_energetico_2024_03.pdf',
            fileType: 'pdf',
            reportPeriod: '2024-03',
            generatedAt: new Date('2024-04-02T10:30:00'),
            fileSize: 2.4 * 1024 * 1024, // 2.4 MB
            status: 'ready',
            downloadUrl: '#',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          },
          {
            id: '2',
            fileName: 'datos_consumo_2024_03.csv',
            fileType: 'csv',
            reportPeriod: '2024-03',
            generatedAt: new Date('2024-04-02T10:32:00'),
            fileSize: 156 * 1024, // 156 KB
            status: 'ready',
            downloadUrl: '#',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: '3',
            fileName: 'informe_energetico_2024_02.pdf',
            fileType: 'pdf',
            reportPeriod: '2024-02',
            generatedAt: new Date('2024-03-05T14:15:00'),
            fileSize: 2.1 * 1024 * 1024,
            status: 'ready',
            downloadUrl: '#',
            expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          },
          {
            id: '4',
            fileName: 'informe_comparativo_q1_2024.pdf',
            fileType: 'pdf',
            reportPeriod: '2024-01',
            generatedAt: new Date('2024-04-01T09:00:00'),
            fileSize: 3.2 * 1024 * 1024,
            status: 'generating',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          {
            id: '5',
            fileName: 'datos_historicos_2023.csv',
            fileType: 'csv',
            reportPeriod: '2023-12',
            generatedAt: new Date('2024-01-15T16:45:00'),
            fileSize: 890 * 1024,
            status: 'expired',
            expiresAt: new Date('2024-01-22T16:45:00')
          }
        ];
        
        setFiles(mockFiles);
        setFilteredFiles(mockFiles);
      } catch (error) {
        console.error('Error loading download files:', error);
        toast.error('Error al cargar la lista de descargas');
      } finally {
        setIsLoading(false);
      }
    };

    loadDownloadFiles();
  }, [user?.companyId]);

  useEffect(() => {
    // Apply filters
    let filtered = files;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatPeriod(file.reportPeriod).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(file => file.fileType === typeFilter);
    }

    setFilteredFiles(filtered);
  }, [files, searchTerm, typeFilter]);

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDownload = async (file: DownloadFile) => {
    if (file.status !== 'ready') {
      toast.error('El archivo no está disponible para descarga');
      return;
    }

    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(`Descarga de ${file.fileName} completada`);
        }, 2000);
      }),
      {
        loading: `Descargando ${file.fileName}...`,
        success: (message) => message as string,
        error: 'Error en la descarga',
      }
    );
  };

  const handleDelete = async (file: DownloadFile) => {
    try {
      toast.loading('Eliminando archivo...');
      
      // Simulate delete delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFiles(prev => prev.filter(f => f.id !== file.id));
      
      toast.dismiss();
      toast.success(`Archivo ${file.fileName} eliminado`);
    } catch (error) {
      toast.dismiss();
      toast.error('Error al eliminar el archivo');
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update file statuses
      setFiles(prev => prev.map(file => {
        if (file.status === 'generating' && Math.random() > 0.5) {
          return { ...file, status: 'ready' as const, downloadUrl: '#' };
        }
        return file;
      }));
      
      toast.success('Lista actualizada');
    } catch (error) {
      toast.error('Error al actualizar la lista');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
  };

  const getStatusBadge = (file: DownloadFile) => {
    switch (file.status) {
      case 'ready':
        const daysLeft = getDaysUntilExpiry(file.expiresAt);
        return (
          <Badge 
            variant={daysLeft <= 2 ? 'destructive' : 'default'}
            className={daysLeft <= 2 ? '' : 'bg-green-100 text-green-800'}
          >
            {daysLeft > 0 ? `${daysLeft} día${daysLeft !== 1 ? 's' : ''}` : 'Expira hoy'}
          </Badge>
        );
      case 'generating':
        return <Badge variant="secondary">Generando...</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Download className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Descargas</h1>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
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
          <Download className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Descargas</h1>
            <p className="text-gray-600">
              Gestiona y descarga archivos PDF y CSV generados
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="text-sm">
            {filteredFiles.length} archivo{filteredFiles.length !== 1 ? 's' : ''}
          </Badge>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'pdf' | 'csv')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Filtrar por tipo de archivo"
            >
              <option value="all">Todos los tipos</option>
              <option value="pdf">Solo PDF</option>
              <option value="csv">Solo CSV</option>
            </select>
            
            {(searchTerm || typeFilter !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Files Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Archivos Disponibles</h2>
          </div>
          
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8">
              <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay archivos disponibles
              </h3>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== 'all'
                  ? 'No se encontraron archivos que coincidan con los filtros aplicados.'
                  : 'Aún no has generado ningún archivo para descargar.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Generado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="truncate max-w-xs">{file.fileName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatPeriod(file.reportPeriod)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {file.fileType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatFileSize(file.fileSize)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(file.generatedAt)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(file)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {file.status === 'ready' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(file)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(file)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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