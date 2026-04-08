'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useAuthStore } from '@/lib/state/auth';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPassword, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [passwordSet, setPasswordSet] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast.error('Token inválido', {
        description: 'El enlace de restablecimiento es inválido o ha expirado',
      });
      router.replace('/login');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) {
      return;
    }

    try {
      await setPassword(token, formData.password);
      setPasswordSet(true);
      toast.success('Contraseña establecida', {
        description: 'Tu contraseña ha sido actualizada correctamente',
      });
    } catch (error) {
      toast.error('Error al establecer contraseña', {
        description: error instanceof Error ? error.message : 'Inténtalo nuevamente',
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

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  if (passwordSet) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-slate-900">¡Contraseña Establecida!</h2>
            <p className="text-sm text-slate-600 mt-2">
              Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>

          <Link href="/login">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">Establecer Nueva Contraseña</h2>
          <p className="text-sm text-slate-600 mt-1">
            Crea una contraseña segura para tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tu nueva contraseña"
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
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        level <= passwordStrength 
                          ? strengthColors[passwordStrength - 1] 
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  Fortaleza: {strengthLabels[passwordStrength - 1] || 'Muy débil'}
                </p>
              </div>
            )}
            
            {validationErrors.password && (
              <p className="text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500 pr-10' : 'pr-10'}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-slate-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Requisitos de contraseña:</h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li className={formData.password.length >= 6 ? 'text-green-600' : ''}>
                ✓ Al menos 6 caracteres
              </li>
              <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                ✓ Una letra minúscula
              </li>
              <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                ✓ Una letra mayúscula
              </li>
              <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                ✓ Un número
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading || passwordStrength < 3}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Estableciendo contraseña...
              </>
            ) : (
              'Establecer Contraseña'
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>

        {/* Demo note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Nota de demostración:</strong> En esta demo, el proceso simula 
            el establecimiento de contraseña sin validar tokens reales.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
export
 default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  );
}