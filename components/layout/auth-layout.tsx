'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
  companyLogo?: string;
  companyName?: string;
}

export function AuthLayout({ 
  children, 
  companyLogo = '/energeia_ar_logo.jpg',
  companyName = 'Portal Informes Energeia'
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Company Name */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-lg p-2">
              <Image
                src={companyLogo}
                alt={`${companyName} logo`}
                width={64}
                height={64}
                className="object-contain max-w-full max-h-full"
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{companyName}</h1>
            <p className="text-slate-600 text-sm mt-1">
              Accede a tus informes energéticos
            </p>
          </div>
        </div>

        {/* Auth Form Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            {children}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <p>© 2024 Energeia. Todos los derechos reservados.</p>
          <p className="mt-1">
            ¿Necesitas ayuda?{' '}
            <a 
              href="mailto:soporte@energeia.com.ar" 
              className="text-orange-600 hover:text-orange-700 underline"
            >
              Contacta soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}