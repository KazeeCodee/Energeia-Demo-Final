'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/state/auth';
import { User } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Badge } from '@/components/ui/badge';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Building, 
  Shield,
  Key,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function MiCuentaPage() {
  const { user, updateUser } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState({
    profile: false,
    password: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        position: user.position || ''
      });
    }
  }, [user]);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'client_admin':
        return 'Administrador';
      case 'client_user':
        return 'Usuario';
      case 'backoffice':
        return 'Backoffice';
      default:
        return role;
    }
  };

  const getStatusLabel = (status: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const validateProfileForm = () => {
    if (!profileData.firstName.trim()) {
      toast.error('El nombre es requerido');
      return false;
    }
    if (!profileData.lastName.trim()) {
      toast.error('El apellido es requerido');
      return false;
    }
    if (!profileData.email.trim()) {
      toast.error('El email es requerido');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      toast.error('El email no tiene un formato válido');
      return false;
    }
    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordData.currentPassword) {
      toast.error('La contraseña actual es requerida');
      return false;
    }
    if (!passwordData.newPassword) {
      toast.error('La nueva contraseña es requerida');
      return false;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual');
      return false;
    }
    return true;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    if (!user) return;

    setIsLoading(prev => ({ ...prev, profile: true }));

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedUser: User = {
        ...user,
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim() || undefined,
        position: profileData.position.trim() || undefined
      };

      updateUser(updatedUser);
      setIsEditingProfile(false);
      
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;

    setIsLoading(prev => ({ ...prev, password: true }));

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate password validation
      if (passwordData.currentPassword !== 'demo123') {
        throw new Error('Contraseña actual incorrecta');
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      
      toast.success('Contraseña cambiada correctamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cambiar la contraseña');
    } finally {
      setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleCancelProfileEdit = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        position: user.position || ''
      });
    }
    setIsEditingProfile(false);
  };

  const handleCancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangingPassword(false);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <UserIcon className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
        </div>
        <Card className="p-6">
          <div className="text-center text-gray-600">
            Cargando información del usuario...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <UserIcon className="h-6 w-6 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
          <p className="text-gray-600">
            Gestiona tu información personal y configuración de seguridad
          </p>
        </div>
      </div>

      {/* Account Overview */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getStatusColor(user.status)}>
                  {getStatusLabel(user.status)}
                </Badge>
                <Badge variant="outline">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-500">
            <p>Último acceso:</p>
            <p>{user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-ES') : 'Nunca'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Teléfono:</span>
              <span className="font-medium">{user.phone}</span>
            </div>
          )}
          {user.position && (
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Cargo:</span>
              <span className="font-medium">{user.position}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Profile Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
          {!isEditingProfile && (
            <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
              Editar
            </Button>
          )}
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditingProfile}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditingProfile}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditingProfile}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditingProfile}
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={profileData.position}
                onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                disabled={!isEditingProfile}
                placeholder="Ej: Gerente de Energía"
              />
            </div>
          </div>

          {isEditingProfile && (
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelProfileEdit}
                disabled={isLoading.profile}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading.profile}
              >
                {isLoading.profile ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Seguridad</h3>
          </div>
          {!isChangingPassword && (
            <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
              <Key className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </Button>
          )}
        </div>

        {!isChangingPassword ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Contraseña configurada</p>
                <p className="text-sm text-green-600">
                  Tu contraseña fue actualizada por última vez hace 30 días
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2">Recomendaciones de seguridad:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Usa una contraseña de al menos 8 caracteres</li>
                <li>Incluye mayúsculas, minúsculas, números y símbolos</li>
                <li>No reutilices contraseñas de otras cuentas</li>
                <li>Cambia tu contraseña regularmente</li>
              </ul>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Para fines de demostración</p>
                    <p>La contraseña actual es: <code className="bg-blue-100 px-1 rounded">demo123</code></p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual *</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelPasswordChange}
                disabled={isLoading.password}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading.password}
              >
                {isLoading.password ? (
                  <>Cambiando...</>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}