'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/lib/state/auth';
import { ReportPersistenceService } from '@/lib/services/report-persistence';
import { ReportSyncService, SyncNotification } from '@/lib/services/report-sync';
import { ReportConfig } from '@/lib/types/constructor';
import { EnergyReport } from './energy-report';
import { ConfigurableChartWrapper } from '../constructor/configurable-chart-wrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CustomizableEnergyReportProps {
  period: string;
  company: string;
  companies?: string[];
  supplyPoint?: string;
  isBackoffice?: boolean;
}

export function CustomizableEnergyReport({ 
  period, 
  company, 
  companies = ['santa-rita'], 
  supplyPoint = 'all',
  isBackoffice = false 
}: CustomizableEnergyReportProps) {
  const { user } = useAuthStore();
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useDefaultReport, setUseDefaultReport] = useState(false);

  // Determine client ID for configuration loading
  const clientId = useMemo(() => {
    if (isBackoffice) return undefined; // Global config for backoffice
    return user?.companyId || 'santa-rita';
  }, [isBackoffice, user?.companyId]);

  // Load report configuration on mount and when dependencies change
  useEffect(() => {
    loadReportConfiguration();
  }, [clientId, period]);

  const loadReportConfiguration = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to load client-specific configuration
      let loadResult = await ReportPersistenceService.loadConfig(clientId);
      
      // If no client-specific config and we're not in backoffice, try global config
      if (!loadResult.success && clientId) {
        loadResult = await ReportPersistenceService.loadConfig(undefined);
      }
      
      if (loadResult.success && loadResult.config) {
        // Validate that the configuration is active
        if (loadResult.config.isActive) {
          setReportConfig(loadResult.config);
          setUseDefaultReport(false);
        } else {
          // Configuration exists but is inactive, use default
          setUseDefaultReport(true);
        }
      } else {
        // No configuration found, use default report
        setUseDefaultReport(true);
      }
    } catch (err) {
      console.error('Error loading report configuration:', err);
      setError('Error al cargar la configuración del informe');
      setUseDefaultReport(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle configuration updates (for real-time sync)
  useEffect(() => {
    const listenerId = `report-${clientId || 'global'}-${Date.now()}`;
    
    const handleSyncNotification = (notification: SyncNotification) => {
      // Check if this notification affects our configuration
      const affectsUs = 
        (!clientId && !notification.clientId) || // Both global
        (clientId === notification.clientId) || // Same client
        (!notification.clientId && clientId); // Global update affects client (fallback)
      
      if (affectsUs) {
        // Reload configuration when it changes
        loadReportConfiguration();
      }
    };

    // Register sync listener
    ReportSyncService.addListener(listenerId, handleSyncNotification);

    // Listen for cache invalidation events
    const handleCacheInvalidation = (event: CustomEvent<{ clientId?: string }>) => {
      const affectsUs = 
        (!clientId && !event.detail.clientId) || 
        (clientId === event.detail.clientId) ||
        (!event.detail.clientId && clientId);
      
      if (affectsUs) {
        loadReportConfiguration();
      }
    };

    window.addEventListener('report-cache-invalidated', handleCacheInvalidation as EventListener);
    
    // Listen for force refresh events
    const handleForceRefresh = () => {
      loadReportConfiguration();
    };

    window.addEventListener('report-force-refresh', handleForceRefresh);
    
    return () => {
      ReportSyncService.removeListener(listenerId);
      window.removeEventListener('report-cache-invalidated', handleCacheInvalidation as EventListener);
      window.removeEventListener('report-force-refresh', handleForceRefresh);
    };
  }, [clientId]);

  // Render loading state
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center p-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            <span className="text-gray-600">Cargando configuración del informe...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}. Se mostrará el informe por defecto.
        </AlertDescription>
      </Alert>
    );
  }

  // Render default report if no custom configuration
  if (useDefaultReport || !reportConfig) {
    return (
      <EnergyReport 
        period={period}
        company={company}
        companies={companies}
        supplyPoint={supplyPoint}
        isBackoffice={isBackoffice}
      />
    );
  }

  // Render custom report based on configuration
  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-600 p-2 rounded-lg">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{reportConfig.name}</h1>
            <p className="text-gray-600">Informe personalizado</p>
            <p className="text-sm text-gray-500">
              {clientId ? `Cliente: ${clientId}` : 'Configuración global'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Image src="/api/placeholder/120/40" alt="Energeia Logo" className="h-10" width={120} height={40} />
        </div>
      </div>

      {/* Render custom spaces and components */}
      {reportConfig.spaces
        .sort((a, b) => a.order - b.order)
        .map((space) => (
          <div key={space.id} className="space-y-4">
            {/* Grid container based on columns */}
            <div 
              className={`grid gap-4 ${
                space.columns === 1 
                  ? 'grid-cols-1' 
                  : space.columns === 2 
                  ? 'grid-cols-1 md:grid-cols-2' 
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {/* Render components in their respective columns */}
              {Array.from({ length: space.columns }, (_, columnIndex) => {
                const componentsInColumn = space.components.filter(
                  component => component.columnIndex === columnIndex
                );

                return (
                  <div key={columnIndex} className="space-y-4">
                    {componentsInColumn.map((component) => (
                      <ConfigurableChartWrapper
                        key={component.id}
                        component={component}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      {/* Footer info */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
        Configuración actualizada: {reportConfig.updatedAt.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
}