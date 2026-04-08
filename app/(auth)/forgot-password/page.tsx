'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthLayout } from '@/components/layout/auth-layout';
import { useAuthStore } from '@/lib/state/auth';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) {
      return 'El email es requerido';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Ingresa un email válido';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateEmail(email);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      await forgotPassword(email);
      setEmailSent(true);
      toast.success('Email enviado', {
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña',
      });
    } catch (error) {
      toast.error('Error al enviar email', {
        description: error instanceof Error ? error.message : 'Inténtalo nuevamente',
      });
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (validationError) {
      setValidationError('');
    }
  };

  if (emailSent) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Email Enviado</h2>
            <p className="text-sm text-slate-600 mt-2">
              Hemos enviado las instrucciones para restablecer tu contraseña a:
            </p>
            <p className="text-sm font-medium text-slate-900 mt-1">{email}</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 text-left">
            <h3 className="text-sm font-medium text-slate-900 mb-2">Próximos pasos:</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>1. Revisa tu bandeja de entrada</li>
              <li>2. Busca el email de Energeia</li>
              <li>3. Haz clic en el enlace para restablecer</li>
              <li>4. Crea una nueva contraseña</li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              ¿No recibiste el email? Revisa tu carpeta de spam o{' '}
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="text-orange-600 hover:text-orange-700 underline"
              >
                inténtalo nuevamente
              </button>
            </p>
            
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900">¿Olvidaste tu contraseña?</h2>
          <p className="text-sm text-slate-600 mt-1">
            Ingresa tu email y te enviaremos instrucciones para restablecerla
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={validationError ? 'border-red-500 focus:border-red-500' : ''}
              disabled={isLoading}
              autoFocus
            />
            {validationError && (
              <p className="text-sm text-red-600">{validationError}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar instrucciones'
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>

        {/* Demo note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Nota de demostración:</strong> En esta demo, no se envían emails reales. 
            El proceso simula el envío exitoso para cualquier email válido.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}