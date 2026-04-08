'use client';

import React, { useState, useEffect } from 'react';
import { User, Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Partial<User>) => Promise<void>;
  user?: User | null;
  companies?: Company[];
  isBackoffice?: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  role: User['role'];
  companyId?: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  role?: string;
  companyId?: string;
}

export function UserFormDialog({ isOpen, onClose, onSubmit, user, companies = [], isBackoffice = false }: UserFormDialogProps) {

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    role: 'client_user',
    companyId: undefined,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          position: user.position || '',
          role: user.role || 'client_user',
          companyId: user.companyId,
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          position: '',
          role: 'client_user',
          companyId: undefined,
        });
      }
      setErrors({});
    }
  }, [isOpen, user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    // Optional phone validation
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono no tiene un formato válido';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }

    // Company validation for client users
    if (isBackoffice && formData.role !== 'backoffice' && !formData.companyId) {
      newErrors.companyId = 'La empresa es requerida para usuarios cliente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || undefined,
        position: formData.position.trim() || undefined,
        role: formData.role,
        companyId: formData.role === 'backoffice' ? undefined : formData.companyId,
      };
      
      // Check if onSubmit is actually a function
      if (typeof onSubmit === 'function') {
        await onSubmit(submitData);
      } else {
        // DEMO MODE: Create user directly in localStorage
        const newUser = {
          id: `user-${Date.now()}`,
          email: submitData.email,
          firstName: submitData.firstName,
          lastName: submitData.lastName,
          role: submitData.role,
          companyId: submitData.companyId,
          phone: submitData.phone,
          position: submitData.position,
          status: 'active' as const,
          createdAt: new Date(),
        };
        
        // Get current mock data and add the new user
        const mockDataStr = localStorage.getItem('energeia_mock_data');
        if (mockDataStr) {
          const mockData = JSON.parse(mockDataStr);
          mockData.users.push(newUser);
          localStorage.setItem('energeia_mock_data', JSON.stringify(mockData));
        }
        
        // Trigger a custom event to notify the parent component
        window.dispatchEvent(new CustomEvent('userCreated', { detail: newUser }));
      }
      
      // Limpiar y cerrar tras submit exitoso
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        role: 'client_user',
        companyId: undefined,
      });
      setErrors({});
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Editar usuario' : 'Crear nuevo usuario'}
          </DialogTitle>
          <DialogDescription>
            {user 
              ? 'Modifica los datos del usuario. Los campos marcados con * son obligatorios.'
              : 'Completa los datos del nuevo usuario. Los campos marcados con * son obligatorios.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Nombre *
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Ingresa el nombre"
                disabled={isSubmitting}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Apellido *
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Ingresa el apellido"
                disabled={isSubmitting}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="usuario@empresa.com"
              disabled={isSubmitting || !!user} // Email can't be changed in edit mode
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
            {user && (
              <p className="text-sm text-slate-500">
                El email no se puede modificar
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">
              Cargo
            </Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="Ej: Gerente de Energía"
              disabled={isSubmitting}
              className={errors.position ? 'border-red-500' : ''}
            />
            {errors.position && (
              <p className="text-sm text-red-600">{errors.position}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Teléfono
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+54 11 1234-5678"
              disabled={isSubmitting}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {isBackoffice && (
            <>
              <div className="space-y-2">
                <Label htmlFor="role">
                  Rol *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value as User['role'])}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client_admin">Administrador Cliente</SelectItem>
                    <SelectItem value="client_user">Usuario Cliente</SelectItem>
                    <SelectItem value="backoffice">Backoffice Energeia</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role}</p>
                )}
              </div>

              {formData.role !== 'backoffice' && (
                <div className="space-y-2">
                  <Label htmlFor="company">
                    Empresa *
                  </Label>
                  <Select
                    value={formData.companyId || ''}
                    onValueChange={(value) => handleInputChange('companyId', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className={errors.companyId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona una empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.companyId && (
                    <p className="text-sm text-red-600">{errors.companyId}</p>
                  )}
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (user ? 'Guardar cambios' : 'Crear usuario')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}