'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/state/auth';
import { EnergyReport } from '@/components/reports/energy-report';
import { ClientEnergyFilters } from '@/components/reports/client-energy-filters';
import { Calendar } from 'lucide-react';

export default function ClientHomePage() {
  const { user } = useAuthStore();
  const [energyFilters, setEnergyFilters] = useState({
    period: '2025-08',
    companies: [user?.companyId || 'santa-rita'],
    supplyPoint: 'all',
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Energético</h1>
            <p className="text-gray-600">
              Informe personalizado de tu empresa
            </p>
          </div>
        </div>

      </div>

      {/* Energy Report Filters - Simplified for client */}
      <ClientEnergyFilters
        companyId={user?.companyId || 'santa-rita'}
        onFiltersChange={setEnergyFilters}
      />

      {/* Energy Report Display */}
      <EnergyReport 
        period={energyFilters.period}
        company={'SANTA RITA METALÚRGICA S.A.'}
        companies={[user?.companyId || 'santa-rita']}
        supplyPoint={energyFilters.supplyPoint}
        isBackoffice={false}
      />
    </div>
  );
}