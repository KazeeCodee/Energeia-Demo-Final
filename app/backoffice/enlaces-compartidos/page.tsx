'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Search, MoreHorizontal, Copy, Trash2, ExternalLink } from 'lucide-react';
import { SharedLink, User, Company } from '@/lib/types';
import { getMockData } from '@/lib/mock/data/seeds';
import { useToast } from '@/lib/utils/toast';
import { SimulationService } from '@/lib/services/simulation';

export default function BackofficeEnlacesCompartidosPage() {
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await SimulationService.simulateDataFetch(() => Promise.resolve(), 'data_fetch');
      const mockData = getMockData();
      if (mockData) {
        setSharedLinks(mockData.sharedLinks);
        setUsers(mockData.users);
        setCompanies(mockData.companies);
      }
    } catch (_error) {
      toast.error('Error al cargar enlaces compartidos');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLinks = sharedLinks.filter(link => {
    const creator = users.find(u => u.id === link.createdBy);
    const creatorName = creator ? `${creator.firstName} ${creator.lastName}` : '';
    const companyNames = link.companyIds
      .map(id => companies.find(c => c.id === id)?.name || '')
      .join(' ');
    
    return (
      creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companyNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCopyLink = async (link: SharedLink) => {
    try {
      await navigator.clipboard.writeText(link.url);
      toast.link.copied();
    } catch (error) {
      toast.link.error('Error al copiar enlace');
    }
  };

  const handleViewLink = (link: SharedLink) => {
    window.open(link.url, '_blank');
  };

  const handleRevokeLink = async (link: SharedLink) => {
    try {
      await SimulationService.simulateDataFetch(() => Promise.resolve(), 'link_operation');
      setSharedLinks(prev => prev.map(l => 
        l.id === link.id ? { ...l, status: 'revoked' } : l
      ));
      toast.link.revoked();
    } catch (error) {
      toast.link.error('Error al revocar enlace');
    }
  };

  const getCreatorName = (createdBy: string) => {
    const creator = users.find(u => u.id === createdBy);
    return creator ? `${creator.firstName} ${creator.lastName}` : 'Usuario desconocido';
  };

  const getCompanyNames = (companyIds: string[]) => {
    return companyIds
      .map(id => companies.find(c => c.id === id)?.name || 'Empresa desconocida')
      .join(', ');
  };

  const getStatusBadge = (status: SharedLink['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expirado</Badge>;
      case 'revoked':
        return <Badge variant="destructive">Revocado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOriginLabel = (origin: SharedLink['origin']) => {
    switch (origin) {
      case 'home':
        return 'Inicio';
      case 'reports':
        return 'Informes';
      default:
        return origin;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <Share2 className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Enlaces Compartidos</h1>
            <p className="text-slate-600">Cargando enlaces...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
          <Share2 className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enlaces Compartidos</h1>
          <p className="text-slate-600">
            Gestiona todos los enlaces compartidos del sistema ({filteredLinks.length} enlaces)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Enlaces</CardTitle>
          <CardDescription>
            Administra enlaces compartidos creados por todos los usuarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por creador, empresa o URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creado por</TableHead>
                  <TableHead>Empresa(s)</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Expira</TableHead>
                  <TableHead>Accesos</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="font-medium">
                        {getCreatorName(link.createdBy)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {getCompanyNames(link.companyIds)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getOriginLabel(link.origin)}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(link.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {(link.createdAt instanceof Date ? link.createdAt : new Date(link.createdAt)).toLocaleDateString('es-AR')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {(link.expiresAt instanceof Date ? link.expiresAt : new Date(link.expiresAt)).toLocaleDateString('es-AR')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{link.accessCount}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleCopyLink(link)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copiar enlace
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewLink(link)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Abrir enlace
                          </DropdownMenuItem>
                          {link.status === 'active' && (
                            <DropdownMenuItem 
                              onClick={() => handleRevokeLink(link)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Revocar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLinks.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              {searchTerm ? 'No se encontraron enlaces que coincidan con la búsqueda' : 'No hay enlaces compartidos'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}