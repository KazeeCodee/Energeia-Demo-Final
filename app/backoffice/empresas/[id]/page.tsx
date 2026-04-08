'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Building2, Users, FileText, Calendar, Mail, Phone, Edit, Plus, 
  MoreHorizontal, Eye, TrendingUp, TrendingDown, Activity, Settings, Download, Share2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Company, User, ReportData } from '@/lib/types';
import { getCompanyById, getUsersForCompany, getReportsForCompany } from '@/lib/mock/data/seeds';
import { SimulationManager } from '@/lib/mock/simulators/delays';

interface CompanyDetailData {
  company: Company;
  users: User[];
  reports: ReportData[];
  analytics: {
    totalUsers: number;
    activeUsers: number;
    totalReports: number;
    lastReportDate?: string;
    avgMonthlyGeneration: number;
    totalGeneration: number;
    growthRate: number;
    renewablePercentage: number;
    avgRenewablePercentage: number;
    recentActivity: {
      newUsers: number;
      newReports: number;
      lastActivity: string;
    };
  };
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  
  const [data, setData] = useState<CompanyDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompanyData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await SimulationManager.delay();
      
      const company = getCompanyById(companyId);
      if (!company) {
        setError('Empresa no encontrada');
        return;
      }

      const users = getUsersForCompany(companyId);
      const reports = getReportsForCompany(companyId);
      
      // Calculate analytics
      const activeUsers = users.filter(u => u.status === 'active').length;
      const sortedReports = reports.sort((a, b) => b.period.localeCompare(a.period));
      const lastReport = sortedReports[0];
      
      const totalGeneration = reports.reduce((sum, report) => sum + report.totalGeneration.value, 0);
      const avgMonthlyGeneration = reports.length > 0 ? totalGeneration / reports.length : 0;
      
      // Calculate growth rate (comparing last 3 months vs previous 3 months)
      const recentReports = sortedReports.slice(0, 3);
      const previousReports = sortedReports.slice(3, 6);
      const recentGeneration = recentReports.reduce((sum, r) => sum + r.totalGeneration.value, 0);
      const previousGeneration = previousReports.reduce((sum, r) => sum + r.totalGeneration.value, 0);
      const growthRate = previousGeneration > 0 ? ((recentGeneration - previousGeneration) / previousGeneration) * 100 : 0;
      
      // Calculate renewable percentages
      const avgRenewablePercentage = reports.length > 0 
        ? reports.reduce((sum, r) => sum + r.renewablePercentage.annual, 0) / reports.length 
        : 0;
      const renewablePercentage = lastReport?.renewablePercentage.annual || 0;
      
      // Recent activity (last 30 days simulation)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newUsers = users.filter(u => new Date(u.createdAt) > thirtyDaysAgo).length;
      const newReports = reports.filter(r => new Date(r.generatedAt) > thirtyDaysAgo).length;
      const lastActivity = Math.max(
        ...users.map(u => new Date(u.lastLogin || u.createdAt).getTime()),
        ...reports.map(r => new Date(r.generatedAt).getTime())
      );

      const analytics = {
        totalUsers: users.length,
        activeUsers,
        totalReports: reports.length,
        lastReportDate: lastReport?.period,
        avgMonthlyGeneration,
        totalGeneration,
        growthRate,
        renewablePercentage,
        avgRenewablePercentage,
        recentActivity: {
          newUsers,
          newReports,
          lastActivity: new Date(lastActivity).toISOString(),
        },
      };

      setData({
        company,
        users,
        reports: sortedReports,
        analytics,
      });
    } catch (_err) {
      setError('Error al cargar los datos de la empresa');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);

  const formatDate = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(Math.round(num));
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'client_admin':
        return 'Administrador';
      case 'client_user':
        return 'Usuario';
      default:
        return role;
    }
  };

  const getStatusLabel = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'paused':
        return 'Pausado';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Empresa no encontrada'}
            </h3>
            <p className="text-gray-500">
              No se pudo cargar la información de la empresa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { company, users, reports, analytics } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold text-gray-900">{company.name}</h1>
              <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                {company.status === 'active' ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
            <p className="text-gray-500">{company.slug}</p>
            <p className="text-xs text-gray-400 mt-1">
              Última actividad: {new Date(analytics.recentActivity.lastActivity).toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Exportar datos
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="mr-2 h-4 w-4" />
                Crear enlace compartido
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
          <Button variant="default" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Company Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email de contacto</p>
                <p className="font-medium">{company.contactEmail}</p>
              </div>
            </div>
            {company.contactPhone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{company.contactPhone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Fecha de creación</p>
                <p className="font-medium">{new Date(company.createdAt).toLocaleDateString('es-AR')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers}</p>
                </div>
              </div>
              {analytics.recentActivity.newUsers > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{analytics.recentActivity.newUsers} nuevos
                </Badge>
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Activos</span>
                <span>{analytics.activeUsers}/{analytics.totalUsers}</span>
              </div>
              <Progress 
                value={(analytics.activeUsers / analytics.totalUsers) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Informes</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalReports}</p>
                </div>
              </div>
              {analytics.recentActivity.newReports > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{analytics.recentActivity.newReports} nuevos
                </Badge>
              )}
            </div>
            <div className="mt-4">
              {analytics.lastReportDate ? (
                <p className="text-xs text-gray-500">
                  Último: {formatDate(analytics.lastReportDate)}
                </p>
              ) : (
                <p className="text-xs text-gray-400">Sin informes</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Generación</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.totalGeneration)}</p>
                </div>
              </div>
              <div className="flex items-center">
                {analytics.growthRate >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ml-1 ${
                  analytics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics.growthRate >= 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Promedio: {formatNumber(analytics.avgMonthlyGeneration)} GWh/mes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Renovable</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.renewablePercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Promedio histórico</span>
                <span>{analytics.avgRenewablePercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={analytics.renewablePercentage} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="users">Usuarios ({users.length})</TabsTrigger>
          <TabsTrigger value="reports">Informes ({reports.length})</TabsTrigger>
          <TabsTrigger value="analytics">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Nuevos usuarios</p>
                        <p className="text-sm text-blue-600">Últimos 30 días</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">
                      {analytics.recentActivity.newUsers}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Nuevos informes</p>
                        <p className="text-sm text-green-600">Últimos 30 días</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-green-900">
                      {analytics.recentActivity.newReports}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Tasa de crecimiento</p>
                        <p className="text-sm text-purple-600">Últimos 3 meses</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {analytics.growthRate >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
                      )}
                      <span className={`text-xl font-bold ${
                        analytics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analytics.growthRate >= 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimos Informes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{formatDate(report.period)}</p>
                        <p className="text-sm text-gray-500">
                          {formatNumber(report.totalGeneration.value)} GWh
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          report.totalGeneration.monthlyVariation >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {report.totalGeneration.monthlyVariation >= 0 ? '+' : ''}
                          {report.totalGeneration.monthlyVariation.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-500">
                          {report.renewablePercentage.annual.toFixed(1)}% renovable
                        </p>
                      </div>
                    </div>
                  ))}
                  {reports.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p>No hay informes disponibles</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Usuarios de la Empresa</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Último Acceso</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead className="w-[70px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.position && (
                              <div className="text-sm text-gray-500">{user.position}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.status === 'active' ? 'default' : 
                              user.status === 'paused' ? 'secondary' : 'destructive'
                            }
                          >
                            {getStatusLabel(user.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastLogin ? (
                            <span className="text-sm text-gray-600">
                              {new Date(user.lastLogin).toLocaleDateString('es-AR')}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">Nunca</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-gray-900">{user.email}</div>
                            {user.phone && (
                              <div className="text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {users.length === 0 && (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Esta empresa aún no tiene usuarios asignados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Informes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Generación Total</TableHead>
                      <TableHead>Variación Mensual</TableHead>
                      <TableHead>% Renovable</TableHead>
                      <TableHead>Fecha Generación</TableHead>
                      <TableHead className="w-[70px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.slice(0, 10).map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="font-medium">
                            {formatDate(report.period)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono">
                            {formatNumber(report.totalGeneration.value)} GWh
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-mono ${
                            report.totalGeneration.monthlyVariation >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {report.totalGeneration.monthlyVariation >= 0 ? '+' : ''}
                            {report.totalGeneration.monthlyVariation.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono">
                            {report.renewablePercentage.annual.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {new Date(report.generatedAt).toLocaleDateString('es-AR')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver informe
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {reports.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay informes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Esta empresa aún no tiene informes generados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Estadísticas de Generación */}
            <Card>
              <CardHeader>
                <CardTitle>Generación de Energía</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Total acumulado</span>
                      <span className="font-mono">{formatNumber(analytics.totalGeneration)} GWh</span>
                    </div>
                    <Progress value={100} className="mt-1 h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Promedio mensual</span>
                      <span className="font-mono">{formatNumber(analytics.avgMonthlyGeneration)} GWh</span>
                    </div>
                    <Progress 
                      value={(analytics.avgMonthlyGeneration / (analytics.totalGeneration / reports.length || 1)) * 100} 
                      className="mt-1 h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Energía renovable</span>
                      <span className="font-mono">{analytics.renewablePercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.renewablePercentage} className="mt-1 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas de Usuarios */}
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Usuarios activos</span>
                      <span className="font-mono">{analytics.activeUsers}/{analytics.totalUsers}</span>
                    </div>
                    <Progress 
                      value={(analytics.activeUsers / analytics.totalUsers) * 100} 
                      className="mt-1 h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Administradores</span>
                      <span className="font-mono">
                        {users.filter(u => u.role === 'client_admin').length}
                      </span>
                    </div>
                    <Progress 
                      value={(users.filter(u => u.role === 'client_admin').length / analytics.totalUsers) * 100} 
                      className="mt-1 h-2" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Usuarios regulares</span>
                      <span className="font-mono">
                        {users.filter(u => u.role === 'client_user').length}
                      </span>
                    </div>
                    <Progress 
                      value={(users.filter(u => u.role === 'client_user').length / analytics.totalUsers) * 100} 
                      className="mt-1 h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Tasa de usuarios activos</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {reports.length > 0 ? (reports.length / Math.max(1, Math.ceil((new Date().getTime() - new Date(company.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)))).toFixed(1) : '0'}
                    </div>
                    <div className="text-sm text-gray-600">Informes por mes</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {analytics.renewablePercentage.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Energía renovable actual</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de tendencias */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencias por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      <TableHead>Generación (GWh)</TableHead>
                      <TableHead>Variación (%)</TableHead>
                      <TableHead>% Renovable</TableHead>
                      <TableHead>Mix Energético</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.slice(0, 8).map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {formatDate(report.period)}
                        </TableCell>
                        <TableCell className="font-mono">
                          {formatNumber(report.totalGeneration.value)}
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center font-mono ${
                            report.totalGeneration.monthlyVariation >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {report.totalGeneration.monthlyVariation >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {report.totalGeneration.monthlyVariation >= 0 ? '+' : ''}
                            {report.totalGeneration.monthlyVariation.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">
                          {report.renewablePercentage.annual.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <div className="text-xs">
                              <span className="text-green-600">R:{report.generationMix.renewable.toFixed(0)}%</span>
                              <span className="text-blue-600 ml-1">H:{report.generationMix.hydraulic.toFixed(0)}%</span>
                              <span className="text-orange-600 ml-1">T:{report.generationMix.thermal.toFixed(0)}%</span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}