'use client';

import { BackofficeRouteGuard } from '@/components/auth/route-guard';
import { BackofficeLayout } from '@/components/layout/backoffice-layout';
import { useUser } from '@/lib/state/auth';

export default function BackofficeGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();

  return (
    <BackofficeRouteGuard>
      {user && (
        <BackofficeLayout user={user}>
          {children}
        </BackofficeLayout>
      )}
    </BackofficeRouteGuard>
  );
}