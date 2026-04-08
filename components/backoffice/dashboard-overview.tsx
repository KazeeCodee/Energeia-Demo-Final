'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMockData } from '@/lib/mock/data/seeds';
import { Building2, Users, FileText, Clock } from 'lucide-react';

interface DashboardStats {
  activeCompanies: number;
  totalUsers: number;
  reportsThisMonth: number;
  lastRun: Date | null;
}

export function DashboardOverview() {
  const stats = getDashboardStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empresas Activas</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCompanies}</div>
          <p className="text-xs text-muted-foreground">
            Empresas con informes activos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Usuarios registrados en el sistema
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Informes Este Mes</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.reportsThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            Informes generados en diciembre
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Última Corrida</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.lastRun ? formatLastRun(stats.lastRun) : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.lastRun ? (
              <>
                {formatDate(stats.lastRun)} - 
                <Badge variant="secondary" className="ml-1">
                  Completado
                </Badge>
              </>
            ) : (
              'No hay corridas recientes'
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getDashboardStats(): DashboardStats {
  const data = getMockData();
  
  if (!data) {
    return {
      activeCompanies: 0,
      totalUsers: 0,
      reportsThisMonth: 0,
      lastRun: null,
    };
  }

  const activeCompanies = data.companies.filter(c => c.status === 'active').length;
  const totalUsers = data.users.length;
  
  // Count reports for current month (December 2024)
  const currentMonth = '2024-12';
  const reportsThisMonth = data.reports.filter(r => r.period === currentMonth).length;
  
  // Get last completed processing job
  const completedJobs = data.processingJobs
    .filter(j => j.status === 'completed' && j.completedAt)
    .sort((a, b) => {
      const dateA = a.completedAt instanceof Date ? a.completedAt : new Date(a.completedAt!);
      const dateB = b.completedAt instanceof Date ? b.completedAt : new Date(b.completedAt!);
      return dateB.getTime() - dateA.getTime();
    });
  
  const lastRun = completedJobs.length > 0 ? 
    (completedJobs[0].completedAt instanceof Date ? 
      completedJobs[0].completedAt : 
      new Date(completedJobs[0].completedAt!)) : null;

  return {
    activeCompanies,
    totalUsers,
    reportsThisMonth,
    lastRun,
  };
}

function formatLastRun(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d`;
  } else if (diffHours > 0) {
    return `${diffHours}h`;
  } else {
    return '<1h';
  }
}

function formatDate(date: Date | string): string {
  const safeDate = date instanceof Date ? date : new Date(date);
  return safeDate.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}