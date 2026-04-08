'use client';

import { useState } from 'react';
import { useStorageHealth, useSessionManagement } from '@/lib/hooks/use-persistence';
import { StoreCleanupManager } from '@/lib/state/cleanup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Clock, 
  RefreshCw, 
  Download, 
  Upload,
  Trash2,
  Settings
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useNotificationActions } from '@/lib/state/ui';

interface PersistenceStatusProps {
  showDetailed?: boolean;
  className?: string;
}

export function PersistenceStatus({ showDetailed = false, className }: PersistenceStatusProps) {
  const { health, runMaintenance, runValidation, runAutoFix, storageInfo } = useStorageHealth();
  const { sessionData, isSessionActive } = useSessionManagement();
  const { showSuccess, showError, showWarning } = useNotificationActions();
  const [isMaintenanceRunning, setIsMaintenanceRunning] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const getStorageStatusColor = () => {
    if (health.usage.percentage > 90) return 'destructive';
    if (health.usage.percentage > 70) return 'warning';
    return 'default';
  };

  const getStorageStatusIcon = () => {
    if (health.usage.percentage > 90) return AlertTriangle;
    return Database;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const handleMaintenance = async () => {
    setIsMaintenanceRunning(true);
    try {
      runMaintenance();
      showSuccess('Mantenimiento completado', 'Se ha limpiado el almacenamiento local');
    } catch (error) {
      showError('Error en mantenimiento', 'No se pudo completar el mantenimiento');
    } finally {
      setIsMaintenanceRunning(false);
    }
  };

  const handleValidation = () => {
    const result = runValidation();
    if (result.isValid) {
      showSuccess('Validación exitosa', 'No se encontraron problemas de integridad');
    } else {
      showWarning(
        'Problemas encontrados', 
        `Se encontraron ${result.issues.length} problemas de integridad`
      );
    }
  };

  const handleAutoFix = () => {
    const result = runAutoFix();
    if (result.issuesFixed > 0) {
      showSuccess(
        'Problemas corregidos', 
        `Se corrigieron ${result.issuesFixed} de ${result.issuesFound} problemas`
      );
    } else {
      showWarning('Sin correcciones', 'No se pudieron corregir automáticamente los problemas');
    }
  };

  const handleExportData = () => {
    try {
      const snapshot = StoreCleanupManager.getStateSnapshot();
      const dataStr = JSON.stringify(snapshot, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `energeia-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSuccess('Datos exportados', 'Se ha descargado el archivo de respaldo');
    } catch (error) {
      showError('Error al exportar', 'No se pudieron exportar los datos');
    }
  };

  const handleResetData = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
      try {
        StoreCleanupManager.resetAllStores();
        showSuccess('Datos eliminados', 'Se han eliminado todos los datos locales');
        setShowDetailsDialog(false);
      } catch (error) {
        showError('Error al eliminar', 'No se pudieron eliminar los datos');
      }
    }
  };

  const StatusIcon = getStorageStatusIcon();

  if (!showDetailed) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <StatusIcon 
          className={`h-4 w-4 ${
            health.usage.percentage > 90 ? 'text-red-500' : 
            health.usage.percentage > 70 ? 'text-yellow-500' : 'text-green-500'
          }`} 
        />
        <span className="text-sm text-gray-600">
          {Math.round(health.usage.percentage)}% usado
        </span>
        {health.maintenanceNeeded && (
          <Badge variant="outline" className="text-xs">
            Mantenimiento requerido
          </Badge>
        )}
      </div>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StatusIcon className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-base">Estado del Sistema</CardTitle>
            </div>
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Detalles
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Gestión de Persistencia</DialogTitle>
                  <DialogDescription>
                    Información detallada sobre el almacenamiento y la sesión actual
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="storage" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="storage">Almacenamiento</TabsTrigger>
                    <TabsTrigger value="session">Sesión</TabsTrigger>
                    <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="storage" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Uso del almacenamiento</span>
                          <span>{Math.round(health.usage.percentage)}%</span>
                        </div>
                        <Progress value={health.usage.percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{formatBytes(health.usage.used)} usado</span>
                          <span>{formatBytes(health.usage.available)} disponible</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Último mantenimiento:</span>
                          <p className="font-medium">
                            {health.lastMaintenance 
                              ? new Date(health.lastMaintenance).toLocaleString()
                              : 'Nunca'
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Estado:</span>
                          <p className="font-medium">
                            {health.maintenanceNeeded ? (
                              <Badge variant="destructive">Mantenimiento requerido</Badge>
                            ) : (
                              <Badge variant="default">Saludable</Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="session" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className={`h-4 w-4 ${isSessionActive ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-sm">
                          Sesión {isSessionActive ? 'activa' : 'inactiva'}
                        </span>
                      </div>
                      
                      {sessionData && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Inicio de sesión:</span>
                            <p className="font-medium">
                              {new Date(sessionData.startTime).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Última actividad:</span>
                            <p className="font-medium">
                              {new Date(sessionData.lastActivity).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Páginas visitadas:</span>
                            <p className="font-medium">{sessionData.pageViews}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Acciones realizadas:</span>
                            <p className="font-medium">{sessionData.actionsPerformed}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Duración:</span>
                            <p className="font-medium">
                              {formatDuration(new Date().getTime() - new Date(sessionData.startTime).getTime())}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="maintenance" className="space-y-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={handleMaintenance}
                          disabled={isMaintenanceRunning}
                          className="w-full"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isMaintenanceRunning ? 'animate-spin' : ''}`} />
                          {isMaintenanceRunning ? 'Ejecutando...' : 'Mantenimiento'}
                        </Button>
                        
                        <Button 
                          onClick={handleValidation}
                          variant="outline"
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Validar
                        </Button>
                        
                        <Button 
                          onClick={handleAutoFix}
                          variant="outline"
                          className="w-full"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Auto-reparar
                        </Button>
                        
                        <Button 
                          onClick={handleExportData}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </Button>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <Button 
                          onClick={handleResetData}
                          variant="destructive"
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar todos los datos
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Almacenamiento</span>
              <span>{Math.round(health.usage.percentage)}%</span>
            </div>
            <Progress 
              value={health.usage.percentage} 
              className="h-2"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">
                Sesión: {isSessionActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            
            {health.maintenanceNeeded && (
              <Badge variant="outline" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Mantenimiento
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default PersistenceStatus;