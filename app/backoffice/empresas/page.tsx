'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Building2, Users, FileText, Eye, Edit, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Company } from '@/lib/types';
import { getMockData, getUsersForCompany, getReportsForCompany } from '@/lib/mock/data/seeds';
import { SimulationManager } from '@/lib/mock/simulators/delays';
import { useRouter } from 'next/navigation';
import { CompanyFormDialog } from '@/components/forms/company-form-dialog';

interface CompanyWithStats extends Company {
  userCount: number;
  reportCount: number;
  lastReportDate?: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const _router = useRouter();

  useEffect(() => {
    loadCompanies();
  }, []);

  // Listen for company creation events
  useEffect(() => {
    const handleCompanyCreated = () => {
      loadCompanies(); // Reload companies when a new one is created
    };

    window.addEventListener('companyCreated', handleCompanyCreated);
    return () => {
      window.removeEventListener('companyCreated', handleCompanyCreated);
    };
  }, []);

  const loadCompanies = async () => {
    setIsLoading(true);
    await SimulationManager.delay();
    
    const mockData = getMockData();
    if (!mockData) return;

    const companiesWithStats: CompanyWithStats[] = mockData.companies.map(company => {
      const users = getUsersForCompany(company.id);
      const reports = getReportsForCompany(company.id);
      const lastReport = reports.sort((a, b) => b.period.localeCompare(a.period))[0];

      return {
        ...company,
        userCount: users.length,
        reportCount: reports.length,
        lastReportDate: lastReport?.period,
      };
    });

    setCompanies(companiesWithStats);
    setIsLoading(false);
  };

  const filterCompanies = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredCompanies(companies);
      return;
    }

    const filtered = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [companies, searchTerm]);

  useEffect(() => {
    filterCompanies();
  }, [filterCompanies]);

  const handleViewCompany = (companyId: string) => {
    // Demo: Mostrar mensaje en lugar de navegar
    const company = companies.find(c => c.id === companyId);
    if (company) {
      alert(`Demo: Ver detalles de ${company.name}\n\nEsta funcionalidad está disponible en la versión completa.`);
    }
  };

  const handleCreateCompany = async (companyData: Partial<Company>) => {
    // This is handled by the dialog component in demo mode
    // In a real app, this would make an API call
  };

  const formatDate = (dateString: string) => {
    const [year, month] = dateString.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Empresas</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const totalUsers = companies.reduce((sum, c) => sum + c.userCount, 0);
  const totalReports = companies.reduce((sum, c) => sum + c.reportCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Empresas</h1>
        <Button 
          onClick={() => setIsCompanyDialogOpen(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Empresas</p>
                <p className="text-2xl font-bold text-gray-900">{totalCompanies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Empresas Activas</p>
                <p className="text-2xl font-bold text-gray-900">{activeCompanies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Informes</p>
                <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Usuarios</TableHead>
                  <TableHead>Informes</TableHead>
                  <TableHead>Último Informe</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{company.name}</div>
                          <div className="text-sm text-gray-500">{company.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                        {company.status === 'active' ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{company.userCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>{company.reportCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {company.lastReportDate ? (
                        <span className="text-sm text-gray-600">
                          {formatDate(company.lastReportDate)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Sin informes</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-gray-900">{company.contactEmail}</div>
                        {company.contactPhone && (
                          <div className="text-gray-500">{company.contactPhone}</div>
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
                          <DropdownMenuItem onClick={() => handleViewCompany(company.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalle
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

          {filteredCompanies.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron empresas</h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay empresas que coincidan con tu búsqueda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Form Dialog */}
      <CompanyFormDialog
        isOpen={isCompanyDialogOpen}
        onClose={() => setIsCompanyDialogOpen(false)}
        onSubmit={handleCreateCompany}
      />
    </div>
  );
}