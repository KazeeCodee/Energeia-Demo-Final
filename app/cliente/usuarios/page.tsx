'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, RotateCcw, Mail } from 'lucide-react';
import { User } from '@/lib/types';
import { useAuthStore } from '@/lib/state/auth';
import { useNotificationActions } from '@/lib/state/ui';
import { getUsersForCompany, getMockData } from '@/lib/mock/data/seeds';
import { LocalStorageManager } from '@/lib/utils/localStorage';
import { SimulationManager } from '@/lib/mock/simulators/delays';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserFormDialog } from '@/components/forms/user-form-dialog';
import { DeleteUserDialog } from '@/components/forms/delete-user-dialog';
import { ResponsiveTable, MobileCardHeader, MobileCardField } from '@/components/ui/responsive-table';
import { NoUsersEmpty } from '@/components/ui/empty-states';

export default function UsuariosPage() {
  const { user: currentUser } = useAuthStore();
  const { showSuccess, showError } = useNotificationActions();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'client_admin';

  useEffect(() => {
    loadUsers();
  }, [currentUser]);

  useEffect(() => {
    // Filter users based on search term
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.position && user.position.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const loadUsers = async () => {
    if (!currentUser?.companyId) return;
    
    setIsLoading(true);
    try {
      // Simulate loading delay
      await SimulationManager.delay();
      
      const companyUsers = getUsersForCompany(currentUser.companyId);
      setUsers(companyUsers);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsUserFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUserSaved = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await SimulationManager.delay();
      
      const mockData = getMockData();
      if (!mockData) throw new Error('No se pudo acceder a los datos');

      if (selectedUser) {
        // Update existing user
        const updatedUser: User = {
          ...selectedUser,
          ...userData,
        };
        
        // Update in mock data
        const userIndex = mockData.users.findIndex(u => u.id === selectedUser.id);
        if (userIndex !== -1) {
          mockData.users[userIndex] = updatedUser;
          LocalStorageManager.setMockData(mockData);
        }
        
        showSuccess('Usuario actualizado', 'Los datos del usuario se han actualizado correctamente');
      } else {
        // Create new user
        const newUser: User = {
          id: `user-${Date.now()}`,
          email: userData.email!,
          firstName: userData.firstName!,
          lastName: userData.lastName!,
          role: 'client_user',
          companyId: currentUser?.companyId,
          phone: userData.phone,
          position: userData.position,
          status: 'active',
          createdAt: new Date(),
        };
        
        // Add to mock data
        mockData.users.push(newUser);
        LocalStorageManager.setMockData(mockData);
        
        showSuccess('Usuario creado', 'El nuevo usuario se ha creado correctamente');
      }
      
      // Reload users
      await loadUsers();
      setIsUserFormOpen(false);
      setSelectedUser(null);
      
    } catch (error) {
      showError('Error', 'No se pudo guardar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserDeleted = async () => {
    if (!userToDelete) return;
    
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await SimulationManager.delay();
      
      const mockData = getMockData();
      if (!mockData) throw new Error('No se pudo acceder a los datos');
      
      // Remove user from mock data
      mockData.users = mockData.users.filter(u => u.id !== userToDelete.id);
      LocalStorageManager.setMockData(mockData);
      
      showSuccess('Usuario eliminado', 'El usuario se ha eliminado correctamente');
      
      // Reload users
      await loadUsers();
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      
    } catch (error) {
      showError('Error', 'No se pudo eliminar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (user: User, newStatus: User['status']) => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await SimulationManager.delay();
      
      const mockData = getMockData();
      if (!mockData) throw new Error('No se pudo acceder a los datos');
      
      // Update user status
      const userIndex = mockData.users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        mockData.users[userIndex].status = newStatus;
        LocalStorageManager.setMockData(mockData);
      }
      
      const statusLabels = {
        active: 'activado',
        paused: 'pausado',
        inactive: 'desactivado'
      };
      
      showSuccess('Estado actualizado', `El usuario ha sido ${statusLabels[newStatus]}`);
      
      // Reload users
      await loadUsers();
      
    } catch (error) {
      showError('Error', 'No se pudo cambiar el estado del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (user: User) => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await SimulationManager.delay();
      
      // Simulate email sending
      showSuccess(
        'Email enviado', 
        `Se ha enviado un email de recuperación de contraseña a ${user.email}`
      );
      
    } catch (error) {
      showError('Error', 'No se pudo enviar el email de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: User['status']) => {
    const variants = {
      active: 'default',
      paused: 'secondary',
      inactive: 'destructive'
    } as const;
    
    const labels = {
      active: 'Activo',
      paused: 'Pausado',
      inactive: 'Inactivo'
    };
    
    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
            <CardDescription>
              Solo los administradores pueden acceder a la gestión de usuarios.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Usuarios de mi empresa</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los usuarios de tu organización
          </p>
        </div>
        <Button onClick={handleCreateUser} disabled={isLoading} className="focus-visible-ring">
          <Plus className="h-4 w-4" />
          Crear usuario
        </Button>
      </div>

      <Card className="card-responsive">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Lista de usuarios</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="w-full sm:w-72">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus-visible-ring"
                  aria-label="Buscar usuarios por nombre, email o cargo"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 && !isLoading && !searchTerm ? (
            <NoUsersEmpty onAddUser={handleCreateUser} />
          ) : (
            <ResponsiveTable
              data={filteredUsers}
              keyField="id"
              loading={isLoading}
              emptyMessage={searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
              columns={[
                {
                  key: 'firstName',
                  header: 'Nombre',
                  render: (_, user) => (
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                    </div>
                  ),
                },
                {
                  key: 'email',
                  header: 'Email',
                  mobileHidden: true,
                },
                {
                  key: 'position',
                  header: 'Cargo',
                  render: (value) => <span>{String(value) || '-'}</span>,
                  mobileHidden: true,
                },
                {
                  key: 'phone',
                  header: 'Teléfono',
                  render: (value) => <span>{String(value) || '-'}</span>,
                  mobileHidden: true,
                },
                {
                  key: 'status',
                  header: 'Estado',
                  render: (_, user) => getStatusBadge(user.status),
                },
                {
                  key: 'id' as keyof User,
                  header: '',
                  render: (_, user) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          aria-label={`Acciones para ${user.firstName} ${user.lastName}`}
                          className="focus-visible-ring"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        
                        {user.status === 'active' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(user, 'paused')}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Pausar
                          </DropdownMenuItem>
                        )}
                        
                        {user.status === 'paused' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(user, 'active')}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Activar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(user, 'inactive')}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Desactivar
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {user.status === 'inactive' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(user, 'active')}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Activar
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => handlePasswordReset(user)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Resetear contraseña
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ),
                  className: 'w-[50px]',
                },
              ]}
              mobileCardRender={(user) => (
                <div>
                  <MobileCardHeader
                    title={`${user.firstName} ${user.lastName}`}
                    subtitle={user.email}
                    actions={
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            aria-label={`Acciones para ${user.firstName} ${user.lastName}`}
                            className="focus-visible-ring"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePasswordReset(user)}>
                            <Mail className="h-4 w-4 mr-2" />
                            Resetear contraseña
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    }
                  />
                  <div className="space-y-2">
                    <MobileCardField label="Cargo" value={user.position || '-'} />
                    <MobileCardField label="Teléfono" value={user.phone || '-'} />
                    <MobileCardField label="Estado" value={getStatusBadge(user.status)} />
                  </div>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      <UserFormDialog
        isOpen={isUserFormOpen}
        onClose={() => {
          setIsUserFormOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUserSaved}
        user={selectedUser}
        isBackoffice={false}
      />

      <DeleteUserDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleUserDeleted}
        user={userToDelete}
      />
    </div>
  );
}