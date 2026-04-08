'use client';

import React, { useState } from 'react';
import { CustomizableEnergyReport } from '@/components/reports/customizable-energy-report';
import { ReportUpdateNotifications } from '@/components/reports/report-update-notifications';
import { EnergyReportFilters } from '@/components/reports/energy-report-filters';
import { Button } from '@/components/ui/button';
import { FileText, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BackofficeInformesPage() {
  const [energyFilters, setEnergyFilters] = useState({
    period: '2025-08',
    companies: ['all'],
    supplyPoint: 'all',
  });

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      toast.loading(`Generando archivo ${format.toUpperCase()}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const filename = `informe_consolidado_${new Date().toISOString().slice(0, 10)}.${format}`;
      toast.dismiss();
      toast.success(`Archivo ${filename} generado correctamente`);
    } catch (error) {
      toast.dismiss();
      toast.error(`Error al generar archivo ${format.toUpperCase()}`);
    }
  };

  const handleShare = async () => {
    try {
      toast.loading('Generando enlace compartido...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      const token = Math.random().toString(36).substring(2, 15);
      const shareUrl = `${window.location.origin}/shared/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.dismiss();
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al generar enlace compartido');
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Update Notifications */}
      <ReportUpdateNotifications />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <FileText className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Informes Consolidados</h1>
            <p className="text-slate-600">
              Visualiza informes energéticos de todas las empresas
            </p>
          </div>
        </div>

        {/* Export and Share Actions */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Energy Report Filters */}
      <EnergyReportFilters onFiltersChange={setEnergyFilters} />

      {/* Energy Report Display */}
      <CustomizableEnergyReport 
        period={energyFilters.period}
        company="INFORME CONSOLIDADO"
        companies={energyFilters.companies}
        supplyPoint={energyFilters.supplyPoint}
        isBackoffice={true}
      />
    </div>
  );
}