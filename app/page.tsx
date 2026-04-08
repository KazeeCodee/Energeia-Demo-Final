'use client';

import { useAuthRedirect } from '@/lib/hooks/use-auth-redirect';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  useAuthRedirect();

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-600" />
        <p className="text-slate-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
