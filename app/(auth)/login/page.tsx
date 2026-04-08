'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/layout/auth-layout';
import { AuthErrorBoundary } from '@/components/ui/error-boundary';
import { useAuthStore } from '@/lib/state/auth';
import { useAuthRedirectIfAuthenticated } from '@/lib/hooks/use-auth-redirect';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuthStore();
  useAuthRedirectIfAuthenticated();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Clear error when component mounts or form changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData, clearError, error]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ingresa un email válido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      toast.success('¡Bienvenido!', {
        description: 'Has iniciado sesión correctamente',
      });
    } catch (error) {
      toast.error('Error de autenticación', {
        description: error instanceof Error ? error.message : 'Credenciales inválidas',
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific validation error
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Demo credentials helper
  const fillDemoCredentials = (role: 'client' | 'backoffice') => {
    const demoCredentials = {
      client: { email: 'admin@industriasmetalurgicas.com.ar', password: 'demo123' },
      backoffice: { email: 'admin@energeia.com.ar', password: 'demo123' },
    };
    
    setFormData(demoCredentials[role]);
    setValidationErrors({});
  };

  return (
    <AuthErrorBoundary>
      <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Iniciar Sesión</h2>
          <p className="text-sm text-slate-600 mt-1">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={validationErrors.email ? 'border-red-500 focus:border-red-500' : ''}
              disabled={isLoading}
            />
            {validationErrors.email && (
              <p className="text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={validationErrors.password ? 'border-red-500 focus:border-red-500 pr-10' : 'pr-10'}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                aria-label="Recordar sesión"
              />
              <Label htmlFor="remember" className="text-slate-600">
                Recordarme
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-orange-600 hover:text-orange-700 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="border-t pt-4">
          <p className="text-xs text-slate-500 text-center mb-3">
            Credenciales de demostración:
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => fillDemoCredentials('client')}
              disabled={isLoading}
            >
              Cliente
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => fillDemoCredentials('backoffice')}
              disabled={isLoading}
            >
              Backoffice
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
    </AuthErrorBoundary>
  );
}