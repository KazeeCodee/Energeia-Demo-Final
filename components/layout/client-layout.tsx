'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  FileText,
  History,
  User as UserIcon,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { User } from '@/lib/types';
import { useUIStore } from '@/lib/state/ui';
import { useAuthStore } from '@/lib/state/auth';
import { useNotificationActions } from '@/lib/state/ui';
import { usePersistence, useSessionManagement } from '@/lib/hooks/use-persistence';
import { StoreCleanupManager } from '@/lib/state/cleanup';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface ClientLayoutProps {
  children: React.ReactNode;
  user: User;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Inicio',
    href: '/cliente/inicio',
    icon: Home,
  },
  {
    title: 'Informes',
    href: '/cliente/informes',
    icon: FileText,
  },
  {
    title: 'Históricos',
    href: '/cliente/historicos',
    icon: History,
  },
  {
    title: 'Mi cuenta',
    href: '/cliente/mi-cuenta',
    icon: UserIcon,
  },
];

function ClientSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { showSuccess } = useNotificationActions();
  const { trackActivity } = usePersistence();

  // Track page views when pathname changes
  useEffect(() => {
    trackActivity('page_view', {
      page: pathname,
      userRole: user.role,
      companyId: user.companyId,
    });
  }, [pathname, trackActivity, user.role, user.companyId]);

  const handleLogout = () => {
    // Track logout activity before clearing data
    trackActivity('page_view', { action: 'logout' });
    
    // Use enhanced cleanup
    StoreCleanupManager.cleanupOnLogout({
      clearFilters: false, // Keep user's filter preferences
      clearPreferences: false, // Keep UI preferences
      clearHistory: true, // Clear session history
      clearSharedLinks: false, // Keep shared links
      performMaintenance: true, // Clean up expired data
    });
    
    logout();
    showSuccess('Sesión cerrada', 'Has cerrado sesión exitosamente');
    router.push('/login');
  };

  const filteredNavItems = navigationItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-slate-200">
        <div className="flex items-center gap-3 px-2 py-3">
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white font-semibold text-sm"
            role="img"
            aria-label="Logo de Energeia"
          >
            E
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">Portal del Cliente</span>
            <span className="text-xs text-slate-500">Energeia</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <nav role="navigation" aria-label="Navegación principal del cliente">
          <SidebarMenu>
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <a 
                      href={item.href} 
                      className="flex items-center gap-3 focus-visible-ring"
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={`Ir a ${item.title}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <UserIcon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/cliente/mi-cuenta')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ClientHeader({ user }: { user: User }) {
  const pathname = usePathname();
  
  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const breadcrumbs = [{ title: 'Portal del Cliente', href: '/inicio' }];
    
    // Find current page title
    const currentItem = navigationItems.find(item => item.href === pathname);
    if (currentItem && pathname !== '/cliente/inicio') {
      breadcrumbs.push({ title: currentItem.title, href: pathname });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header 
      className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6"
      role="banner"
    >
      <SidebarTrigger />
      
      <nav 
        className="flex items-center gap-2 text-sm text-slate-600 overflow-hidden"
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center gap-2">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
              <span 
                className={cn(
                  "truncate",
                  index === breadcrumbs.length - 1 
                    ? "text-slate-900 font-medium" 
                    : "hover:text-slate-900 cursor-pointer"
                )}
                aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                {crumb.title}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm text-slate-600 hidden sm:inline">
          {user.firstName} {user.lastName}
        </span>
      </div>
    </header>
  );
}

export function ClientLayout({ children, user }: ClientLayoutProps) {
  const { sidebarCollapsed } = useUIStore();
  const { sessionData, checkSessionTimeout } = useSessionManagement();
  const { showWarning } = useNotificationActions();
  const router = useRouter();

  // Check for session timeout periodically
  useEffect(() => {
    const checkTimeout = () => {
      if (checkSessionTimeout()) {
        showWarning(
          'Sesión expirada',
          'Tu sesión ha expirado por inactividad. Serás redirigido al login.'
        );
        
        setTimeout(() => {
          StoreCleanupManager.cleanupOnLogout();
          router.push('/login');
        }, 3000);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTimeout, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkSessionTimeout, showWarning, router]);

  // Initialize stores on mount
  useEffect(() => {
    StoreCleanupManager.initializeStores();
  }, []);

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <div className="flex min-h-screen w-full bg-slate-50">
        <ClientSidebar user={user} />
        <SidebarInset className="flex flex-1 flex-col">
          <ClientHeader user={user} />
          <main 
            id="main-content"
            className="flex-1 p-4 sm:p-6 focus:outline-none"
            tabIndex={-1}
            role="main"
            aria-label="Contenido principal del portal del cliente"
          >
            {children}
          </main>
        </SidebarInset>
      </div>
      
    </SidebarProvider>
  );
}