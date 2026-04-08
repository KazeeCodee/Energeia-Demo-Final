'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Building2,
  Users,
  Share2,
  Settings,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Zap,
  Wrench,
  Map
} from 'lucide-react';
import { User } from '@/lib/types';
import { useUIStore } from '@/lib/state/ui';
import { useAuthStore } from '@/lib/state/auth';
import { useNotificationActions } from '@/lib/state/ui';
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


interface BackofficeLayoutProps {
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
    title: 'Dashboard',
    href: '/backoffice/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Informes',
    href: '/backoffice/informes',
    icon: FileText,
  },
  {
    title: 'Constructor de Informes',
    href: '/backoffice/constructor-informes',
    icon: Wrench,
  },
  {
    title: 'Empresas',
    href: '/backoffice/empresas',
    icon: Building2,
  },
  {
    title: 'Enlaces compartidos',
    href: '/backoffice/enlaces-compartidos',
    icon: Share2,
  },
  {
    title: 'Configuración',
    href: '/backoffice/configuracion',
    icon: Settings,
  },
];

function BackofficeSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { showSuccess } = useNotificationActions();

  const handleLogout = () => {
    logout();
    showSuccess('Sesión cerrada', 'Has cerrado sesión exitosamente');
    router.push('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-slate-200">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white font-semibold text-sm">
            <Zap className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">Backoffice Energeia</span>
            <span className="text-xs text-slate-500">Administración</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <a href={item.href} className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
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
                <DropdownMenuItem onClick={() => router.push('/backoffice/configuracion')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
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

function BackofficeHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const isConstructorPage = pathname === '/backoffice/constructor-informes';

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const breadcrumbs = [{ title: 'Backoffice Energeia', href: '/dashboard' }];

    // Find current page title
    const currentItem = navigationItems.find(item => item.href === pathname);
    if (currentItem && pathname !== '/backoffice/dashboard') {
      breadcrumbs.push({ title: currentItem.title, href: pathname });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
      {!isConstructorPage && <SidebarTrigger />}

      {isConstructorPage ? (
        // Constructor page header with back button
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/backoffice/informes')}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Volver a Informes
          </button>
          <div className="h-6 w-px bg-slate-300" />
          <h1 className="text-lg font-semibold text-slate-900">Constructor de Informes</h1>
        </div>
      ) : (
        // Regular breadcrumbs
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.href}>
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              <span className={cn(
                index === breadcrumbs.length - 1
                  ? "text-slate-900 font-medium"
                  : "hover:text-slate-900 cursor-pointer"
              )}>
                {crumb.title}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-slate-600">Sistema activo</span>
        </div>
        <span className="text-sm text-slate-600">
          {user.firstName} {user.lastName}
        </span>
      </div>
    </header>
  );
}

export function BackofficeLayout({ children, user }: BackofficeLayoutProps) {
  const { sidebarCollapsed } = useUIStore();
  const pathname = usePathname();

  // Hide sidebar in constructor page for more space
  const isConstructorPage = pathname === '/backoffice/constructor-informes';

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed && !isConstructorPage}>
      <div className="flex min-h-screen w-full bg-slate-50">
        {!isConstructorPage && <BackofficeSidebar user={user} />}
        <SidebarInset className="flex flex-1 flex-col">
          <BackofficeHeader user={user} />
          <main
            id="main-content"
            className={cn(
              "flex-1 focus:outline-none",
              isConstructorPage ? "p-3 sm:p-4" : "p-4 sm:p-6"
            )}
            tabIndex={-1}
            role="main"
            aria-label="Contenido principal del backoffice"
          >
            {children}
          </main>
        </SidebarInset>
      </div>

    </SidebarProvider>
  );
}