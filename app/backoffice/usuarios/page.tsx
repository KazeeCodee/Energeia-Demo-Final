'use client';

import React, { useState, useEffect } from 'react';
import { UserFormDialog } from '@/components/forms/user-form-dialog';
import { DeleteUserDialog } from '@/components/forms/delete-user-dialog';
import { FormErrorBoundary } from '@/components/ui/error-boundary';
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
import { Users, Plus, Search, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { User, Company } from '@/lib/types';
import { getMockData } from '@/lib/mock/data/seeds';
import { useToast } from '@/lib/utils/toast';
import { SimulationHelpers } from '@/lib/utils/simulation-helpers';

export default function BackofficeUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await SimulationHelpers.simulateDelay('data_fetch');
      const mockData = getMockData();
      if (mockData) {
        setUsers(mockData.users);
        setCompanies(mockData.companies);
      }
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.companyId && companies.find(c => c.id === user.companyId)?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleUserSaved = async (userData: Partial<User>) => {
    try {
      await SimulationHelpers.simulateDelay('user_operation');
      
      if (selectedUser) {
        // Update existing user
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id ? { ...u, ...userData } : u
        ));
        toast.user.updated(`${userData.firstName} ${userData.lastName}`);
      } else {
        // Create new user
        const newUser: User = {
          ...userData as User,
          id: `user-${Date.now()}`,
          createdAt: new Date(),
          lastLogin: undefined,
          status: 'active',
        };
        setUsers(prev => [...prev, newUser]);
        toast.user.created(`${userData.firstName} ${userData.lastName}`);
      }
      
      setShowUserDialog(false);
      setSelectedUser(null);
    } catch (error) {
      toast.user.error(selectedUser ? 'actualizar' : 'crear', `${userData.firstName} ${userData.lastName}`);
    }
  };

  const handleUserDeleted = async () => {
    if (!selectedUser) return;
    
    try {
      await SimulationHelpers.simulateDelay('user_operation');
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      toast.user.deleted(`${selectedUser.firstName} ${selectedUser.lastName}`);
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      toast.user.error('eliminar', `${selectedUser.firstName} ${selectedUser.lastName}`);
    }
  };

  const handleStatusChange = async (user: User, newStatus: User['status']) => {
    try {
      await SimulationHelpers.simulateDelay('user_operation');
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      ));
      
      const statusText = newStatus === 'active' ? 'activado' : 
                        newStatus === 'paused' ? 'pausado' : 'desactivado';
      toast.success(`${user.firstName} ${user.lastName} ha sido ${statusText}`);
    } catch (error) {
      toast.user.error('cambiar estado de', `${user.firstName} ${user.lastName}`);
    }
  };

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return 'Sin empresa';
    return companies.find(c => c.id === companyId)?.name || 'Empresa desconocida';
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

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>;
      case 'paused':
        return <Badge variant="secondary">Pausado</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactivo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Usuarios Globales</h1>
            <p className="text-slate-600">Cargando usuarios...</p>
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
    <FormErrorBoundary>
      <div className="space-y-6 px-8 pt-8 pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Usuarios Globales</h1>
              <p className="text-slate-600">
                Gestiona todos los usuarios del sistema ({filteredUsers.length} usuarios)
              </p>
            </div>
          </div>
          <Button onClick={handleCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Usuario
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              Administra usuarios de todas las empresas y del backoffice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, email o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último acceso</TableHead>
                    <TableHead className="w-[70px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.position && (
                            <div className="text-sm text-slate-500">{user.position}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getCompanyName(user.companyId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getRoleLabel(user.role)}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <span className="text-sm text-slate-600">
                            {(user.lastLogin instanceof Date ? user.lastLogin : new Date(user.lastLogin)).toLocaleDateString('es-AR')}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">Nunca</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            {user.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(user, 'paused')}>
                                <UserX className="mr-2 h-4 w-4" />
                                Pausar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleStatusChange(user, 'active')}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <UserFormDialog
          user={selectedUser}
          companies={companies}
          isOpen={showUserDialog}
          onClose={() => {
            setShowUserDialog(false);
            setSelectedUser(null);
          }}
          onSubmit={handleUserSaved}
        />

        <DeleteUserDialog
          user={selectedUser}
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedUser(null);
          }}
          onConfirm={handleUserDeleted}
        />
      </div>
    </FormErrorBoundary>
  );
}