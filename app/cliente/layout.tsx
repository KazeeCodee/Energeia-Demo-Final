'use client';

import { ClientRouteGuard } from '@/components/auth/route-guard';
import { ClientLayout } from '@/components/layout/client-layout';
import { useUser } from '@/lib/state/auth';

export default function ClientGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();

  return (
    <ClientRouteGuard>
      {user && (
        <ClientLayout user={user}>
          {children}
        </ClientLayout>
      )}
    </ClientRouteGuard>
  );
}