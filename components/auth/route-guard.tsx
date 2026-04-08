'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/state/auth';
import { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function RouteGuard({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state from localStorage
    initializeAuth();
    setIsInitialized(true);
  }, [initializeAuth]);

  useEffect(() => {
    if (!isInitialized) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    // If user is authenticated but doesn't have required role
    if (isAuthenticated && user && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user role
        const redirectPath = user.role === 'backoffice' 
          ? '/backoffice/dashboard' 
          : '/cliente/inicio';
        
        if (pathname !== redirectPath) {
          router.replace(redirectPath);
          return;
        }
      }
    }
  }, [isInitialized, isAuthenticated, user, allowedRoles, requireAuth, router, pathname]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-600" />
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If user doesn't have required role, don't render children
  if (isAuthenticated && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

// Convenience components for specific route protection
export function ClientRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['client_admin', 'client_user']}>
      {children}
    </RouteGuard>
  );
}

export function BackofficeRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['backoffice']}>
      {children}
    </RouteGuard>
  );
}

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['client_admin', 'backoffice']}>
      {children}
    </RouteGuard>
  );
}