'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/state/auth';

export function getRedirectPath(role: string): string {
  return role === 'backoffice' ? '/backoffice/dashboard' : '/cliente/inicio';
}

export function useAuthRedirect() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getRedirectPath(user.role));
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);
}

export function useAuthRedirectIfAuthenticated() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getRedirectPath(user.role));
    }
  }, [isAuthenticated, user, router]);
}
