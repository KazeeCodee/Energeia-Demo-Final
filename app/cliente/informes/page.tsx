'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/state/auth';
import { CustomizableEnergyReport } from '@/components/reports/customizable-energy-report';
import { ReportUpdateNotifications } from '@/components/reports/report-update-notifications';
import { ClientEnergyFilters } from '@/components/reports/client-energy-filters';
import { FileBarChart } from 'lucide-react';

export default function InformesPage() {
  const { user } = useAuthStore();
  const [energyFilters, setEnergyFilters] = useState({
    period: '2025-08',
    companies: ['all'],
    supplyPoint: 'all',
  });

  return (
    <div className="space-y-6">
      {/* Report Update Notifications */}
      <ReportUpdateNotifications 
        clientId={user?.companyId || 'santa-rita'}
      />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileBarChart className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Informes</h1>
            <p className="text-gray-600">
              Filtra y analiza informes energéticos con diferentes modos de visualización
            </p>
          </div>
        </div>

      </div>

      {/* Energy Report Filters */}
      <ClientEnergyFilters
        companyId={user?.companyId || 'santa-rita'}
        onFiltersChange={setEnergyFilters}
      />

      {/* Energy Report Display */}
      <CustomizableEnergyReport 
        period={energyFilters.period}
        company={'SANTA RITA METALÚRGICA S.A.'}
        companies={energyFilters.companies}
        supplyPoint={energyFilters.supplyPoint}
        isBackoffice={false}
      />
    </div>
  );
}