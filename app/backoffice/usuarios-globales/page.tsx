'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Users, Plus, Filter, MoreHorizontal, Edit, Eye, UserX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Company } from '@/lib/types';
import { getMockData, getCompanyById } from '@/lib/mock/data/seeds';
import { SimulationManager } from '@/lib/mock/simulators/delays';
import { UserFormDialog } from '@/components/forms/user-form-dialog';
import { useNotificationActions } from '@/lib/state/ui';

interface UserWithCompany extends User {
  companyName?: string;
}

export default function GlobalUsersPage() {
  const [users, setUsers] = useState<UserWithCompany[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithCompany[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { showSuccess, showError } = useNotificationActions();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter, companyFilter]);



  const loadData = async () => {
    setIsLoading(true);
    await SimulationManager.delay();
    
    const mockData = getMockData();
    if (!mockData) return;

    const usersWithCompany: UserWithCompany[] = mockData.users.map(user => ({
      ...user,
      companyName: user.companyId ? getCompanyById(user.companyId)?.name : undefined,
    }));

    setUsers(usersWithCompany);
    setCompanies(mockData.companies);
    setIsLoading(false);
  };

  useEffect(() => {
    const handleUserCreated = (event: CustomEvent) => {
      console.log('🔔 Event received, reloading data...', event.detail);
      // Force a reload with a small delay to ensure localStorage is updated
      setTimeout(() => {
        loadData();
      }, 100);
    };

    window.addEventListener('userCreated', handleUserCreated as EventListener);
    
    return () => {
      window.removeEventListener('userCreated', handleUserCreated as EventListener);
    };
  }, []);

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Company filter
    if (companyFilter !== 'all') {
      if (companyFilter === 'backoffice') {
        filtered = filtered.filter(user => user.role === 'backoffice');
      } else {
        filtered = filtered.filter(user => user.companyId === companyFilter);
      }
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleUserSubmit = useCallback(async (userData: Partial<User>): Promise<void> => {
    try {
      await SimulationManager.delay(500);
      
      if (editingUser) {
        // Update existing user
        const updatedUsers = users.map(user => 
          user.id === editingUser.id 
            ? { 
                ...user, 
                ...userData,
                companyName: userData.companyId ? getCompanyById(userData.companyId)?.name : undefined
              }
            : user
        );
        setUsers(updatedUsers);
        showSuccess("Usuario actualizado", "Los datos del usuario se han actualizado correctamente.");
      } else {
        // Create new user
        const newUser: UserWithCompany = {
          id: `user-${Date.now()}`,
          email: userData.email!,
          firstName: userData.firstName!,
          lastName: userData.lastName!,
          role: userData.role!,
          companyId: userData.companyId,
          phone: userData.phone,
          position: userData.position,
          status: 'active',
          createdAt: new Date(),
          companyName: userData.companyId ? getCompanyById(userData.companyId)?.name : undefined,
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        showSuccess("Usuario creado", "El nuevo usuario se ha creado correctamente.");
      }
      
      setShowUserForm(false);
    } catch (error) {
      showError("Error", "Ha ocurrido un error al procesar el usuario.");
    }
  }, [editingUser, users, showSuccess, showError]);

  const handleChangeStatus = async (user: User, newStatus: User['status']) => {
    await SimulationManager.delay(300);
    
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    );
    setUsers(updatedUsers);
    
    const statusLabels = {
      active: 'activado',
      paused: 'pausado',
      inactive: 'desactivado',
    };
    
    showSuccess("Estado actualizado", `El usuario ha sido ${statusLabels[newStatus]}.`);
  };

  const handleResetPassword = async (user: User) => {
    await SimulationManager.delay(500);
    
    showSuccess("Contraseña restablecida", `Se ha enviado un email a ${user.email} con las instrucciones para restablecer la contraseña.`);
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'client_admin':
        return 'Admin Cliente';
      case 'client_user':
        return 'Usuario Cliente';
      case 'backoffice':
        return 'Backoffice';
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
      <div className="space-y-6 px-6 pl-6 pr-10" style={{ paddingLeft: '1.5rem', paddingRight: '2.5rem' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
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

        <Card className="mt-6 mb-6">
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

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const clientUsers = users.filter(u => u.role !== 'backoffice').length;
  const backofficeUsers = users.filter(u => u.role === 'backoffice').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
        <Button onClick={handleCreateUser}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Cliente</p>
                <p className="text-2xl font-bold text-gray-900">{clientUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuarios Backoffice</p>
                <p className="text-2xl font-bold text-gray-900">{backofficeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="client_admin">Admin Cliente</SelectItem>
                <SelectItem value="client_user">Usuario Cliente</SelectItem>
                <SelectItem value="backoffice">Backoffice</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las empresas</SelectItem>
                <SelectItem value="backoffice">Backoffice Energeia</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="w-[70px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
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
                      {user.companyName ? (
                        <span className="text-sm text-gray-900">{user.companyName}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Backoffice Energeia</span>
                      )}
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
                          {(user.lastLogin instanceof Date ? user.lastLogin : new Date(user.lastLogin)).toLocaleDateString('es-AR')}
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
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Resetear contraseña
                          </DropdownMenuItem>
                          {user.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleChangeStatus(user, 'paused')}>
                              <UserX className="mr-2 h-4 w-4" />
                              Pausar usuario
                            </DropdownMenuItem>
                          )}
                          {user.status === 'paused' && (
                            <DropdownMenuItem onClick={() => handleChangeStatus(user, 'active')}>
                              <Users className="mr-2 h-4 w-4" />
                              Activar usuario
                            </DropdownMenuItem>
                          )}
                          {user.status !== 'inactive' && (
                            <DropdownMenuItem 
                              onClick={() => handleChangeStatus(user, 'inactive')}
                              className="text-red-600"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Desactivar usuario
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || companyFilter !== 'all'
                  ? 'No hay usuarios que coincidan con los filtros aplicados.'
                  : 'No hay usuarios registrados en el sistema.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      {showUserForm && (
        <UserFormDialog
          isOpen={showUserForm}
          onClose={() => setShowUserForm(false)}
          onSubmit={handleUserSubmit}
          user={editingUser}
          companies={companies}
          isBackoffice={true}
        />
      )}
    </div>
  );
}