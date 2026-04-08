'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/state/auth';
import { SharedLink } from '@/lib/types';
import { SharedLinksService } from '@/lib/services/shared-links';
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
  Share2, 
  Link, 
  Copy, 
  Eye,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  AlertCircle,
  Plus,
  BarChart3,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

export default function EnlacesCompartidosPage() {
  const { user } = useAuthStore();
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<SharedLink[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');

  useEffect(() => {
    const loadSharedLinks = async () => {
      if (!user?.companyId) return;

      setIsLoading(true);
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load shared links using the service
        const sharedLinks = await SharedLinksService.getSharedLinks(user.companyId);
        
        // If no links exist, create some mock data
        if (sharedLinks.length === 0) {
          const mockLinks = [
            await SharedLinksService.createSharedLink({
              createdBy: user.id,
              companyIds: [user.companyId],
              origin: 'home',
              expirationOption: '1w'
            }),
            await SharedLinksService.createSharedLink({
              createdBy: user.id,
              companyIds: [user.companyId],
              origin: 'reports',
              filters: {
                period: { type: 'range', value: { start: '2024-01', end: '2024-03' } },
                mode: 'compare'
              },
              expirationOption: '1d'
            })
          ];
          
          // Update access counts for demo
          await SharedLinksService.updateSharedLink(mockLinks[0].id, { accessCount: 12 });
          await SharedLinksService.updateSharedLink(mockLinks[1].id, { accessCount: 5 });
          
          setLinks(mockLinks);
          setFilteredLinks(mockLinks);
        } else {
          setLinks(sharedLinks);
          setFilteredLinks(sharedLinks);
        }
        
        // Load analytics
        const analyticsData = await SharedLinksService.getAnalytics(user.companyId);
        setAnalytics(analyticsData);
        
      } catch (error) {
        console.error('Error loading shared links:', error);
        toast.error('Error al cargar los enlaces compartidos');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedLinks();
  }, [user?.companyId, user?.id]);

  useEffect(() => {
    // Apply filters
    let filtered = links;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(link => 
        link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.origin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(link => link.status === statusFilter);
    }

    setFilteredLinks(filtered);
  }, [links, searchTerm, statusFilter]);

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

  const getDaysUntilExpiry = (expiresAt: Date | string | undefined) => {
    try {
      if (!expiresAt) return 0;
      
      const expiryDate = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
      
      if (isNaN(expiryDate.getTime())) return 0;
      
      const now = new Date();
      const diffTime = expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Error calculating days until expiry:', error);
      return 0;
    };
  };

  const getOriginLabel = (origin: string) => {
    switch (origin) {
      case 'home':
        return 'Inicio';
      case 'reports':
        return 'Informes';
      default:
        return origin;
    }
  };

  const getStatusBadge = (link: SharedLink) => {
    switch (link.status) {
      case 'active':
        const daysLeft = getDaysUntilExpiry(link.expiresAt);
        return (
          <Badge 
            variant={daysLeft <= 1 ? 'destructive' : 'default'}
            className={daysLeft <= 1 ? '' : 'bg-green-100 text-green-800'}
          >
            {daysLeft > 0 ? `${daysLeft} día${daysLeft !== 1 ? 's' : ''}` : 'Expira hoy'}
          </Badge>
        );
      case 'expired':
        return <Badge variant="destructive">Expirado</Badge>;
      case 'revoked':
        return <Badge variant="secondary">Revocado</Badge>;
      default:
        return null;
    }
  };

  const handleCopyLink = async (link: SharedLink) => {
    if (link.status !== 'active') {
      toast.error('Este enlace no está activo');
      return;
    }

    try {
      await navigator.clipboard.writeText(link.url);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar el enlace');
    }
  };

  const handleRevokeLink = async (link: SharedLink) => {
    try {
      toast.loading('Revocando enlace...');
      
      // Simulate revoke delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const success = await SharedLinksService.revokeSharedLink(link.id);
      
      if (success) {
        const updatedLinks = links.map(l => 
          l.id === link.id ? { ...l, status: 'revoked' as const } : l
        );
        setLinks(updatedLinks);
        
        toast.dismiss();
        toast.success('Enlace revocado correctamente');
      } else {
        toast.dismiss();
        toast.error('Error al revocar el enlace');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Error al revocar el enlace');
    }
  };

  const handleDeleteLink = async (link: SharedLink) => {
    try {
      toast.loading('Eliminando enlace...');
      
      // Simulate delete delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = await SharedLinksService.deleteSharedLink(link.id);
      
      if (success) {
        const updatedLinks = links.filter(l => l.id !== link.id);
        setLinks(updatedLinks);
        
        toast.dismiss();
        toast.success('Enlace eliminado correctamente');
      } else {
        toast.dismiss();
        toast.error('Error al eliminar el enlace');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Error al eliminar el enlace');
    }
  };

  const handleCreateNewLink = () => {
    toast.info('Para crear un nuevo enlace, ve a la página de Inicio o Informes y usa el botón "Compartir"');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Share2 className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Enlaces Compartidos</h1>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
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
          <Share2 className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enlaces Compartidos</h1>
            <p className="text-gray-600">
              Gestiona los enlaces compartidos de tus informes energéticos
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="text-sm">
            {filteredLinks.length} enlace{filteredLinks.length !== 1 ? 's' : ''}
          </Badge>
          <Button onClick={handleCreateNewLink}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Enlace
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Link className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enlaces</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalLinks}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Enlaces Activos</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeLinks}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Accesos</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalAccesses}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expirados</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.expiredLinks}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Info Alert */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">¿Cómo crear enlaces compartidos?</p>
            <p>
              Ve a la página de <strong>Inicio</strong> o <strong>Informes</strong> y haz clic en el botón 
              &quot;Compartir&quot; para generar un enlace temporal que permita acceso sin autenticación.
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar enlaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'expired' | 'revoked')}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Filtrar por estado del enlace"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="expired">Expirados</option>
              <option value="revoked">Revocados</option>
            </select>
            
            {(searchTerm || statusFilter !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Links Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Link className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Enlaces Creados</h2>
          </div>
          
          {filteredLinks.length === 0 ? (
            <div className="text-center py-8">
              <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay enlaces compartidos
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No se encontraron enlaces que coincidan con los filtros aplicados.'
                  : 'Aún no has creado ningún enlace compartido.'
                }
              </p>
              <Button onClick={handleCreateNewLink}>
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer enlace
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enlace</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Accesos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLinks.map((link) => (
                    <TableRow key={link.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2 max-w-xs">
                          <Link className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate text-sm font-mono">
                            {link.url.split('/').pop()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getOriginLabel(link.origin)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(link.createdAt)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(link.expiresAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span>{link.accessCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(link)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {link.status === 'active' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyLink(link)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(link.url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeLink(link)}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLink(link)}
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