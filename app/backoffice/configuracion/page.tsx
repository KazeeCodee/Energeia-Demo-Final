'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Save, RefreshCw, Map, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SimulationService } from '@/lib/services/simulation';
import { resetMockData } from '@/lib/mock/init';

export default function BackofficeConfiguracionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [settings, setSettings] = useState({
    simulationDelay: 1000,
    networkCondition: 'fast' as 'fast' | 'slow' | 'unstable',
    enableErrorSimulation: false,
    enableDebugLogs: false,
    autoSave: true,
    dataRetentionDays: 30,
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await SimulationService.simulateAuth('', '', 'login');
      
      // Store settings in localStorage
      localStorage.setItem('app_settings', JSON.stringify(settings));
      
      toast.success('Configuración guardada');
    } catch (_error) {
      toast.error('Error al guardar configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetMockData = async () => {
    setIsLoading(true);
    try {
      await SimulationService.simulateAuth('', '', 'login');
      resetMockData();
      toast.success('Datos reiniciados');
    } catch (_error) {
      toast.error('Error al reiniciar datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
            <Settings className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
            <p className="text-slate-600">
              Administra la configuración del sistema y simulaciones
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isLoading}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuración de Simulación */}
        <Card>
          <CardHeader>
            <CardTitle>Simulación del Sistema</CardTitle>
            <CardDescription>
              Ajusta los parámetros de simulación para testing y desarrollo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delay">Retraso de simulación (ms)</Label>
              <Input
                id="delay"
                type="number"
                value={settings.simulationDelay}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  simulationDelay: parseInt(e.target.value) || 0 
                }))}
                min="0"
                max="5000"
                step="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="network">Condición de red</Label>
              <Select
                value={settings.networkCondition}
                onValueChange={(value: 'fast' | 'slow' | 'unstable') => 
                  setSettings(prev => ({ ...prev, networkCondition: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Rápida</SelectItem>
                  <SelectItem value="slow">Lenta</SelectItem>
                  <SelectItem value="unstable">Inestable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="error-sim">Simular errores</Label>
              <Switch
                id="error-sim"
                checked={settings.enableErrorSimulation}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, enableErrorSimulation: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="debug-logs">Logs de debug</Label>
              <Switch
                id="debug-logs"
                checked={settings.enableDebugLogs}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, enableDebugLogs: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Datos */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Datos</CardTitle>
            <CardDescription>
              Administra los datos mock y configuraciones de almacenamiento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retention">Días de retención de datos</Label>
              <Input
                id="retention"
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  dataRetentionDays: parseInt(e.target.value) || 30 
                }))}
                min="1"
                max="365"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save">Guardado automático</Label>
              <Switch
                id="auto-save"
                checked={settings.autoSave}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoSave: checked }))
                }
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Acciones de datos</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetMockData}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar Datos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integraciones de Datos */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Integraciones de datos
        </h2>
        <button
          onClick={() => router.push('/backoffice/mapeador-datos')}
          className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-orange-300 hover:shadow-sm transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
              <Map className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Mapeador de Datos</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Configurá cómo se leen las columnas de los archivos Excel de CAMMESA · <span className="text-green-600 font-medium">16/16 campos configurados</span>
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors flex-shrink-0" />
        </button>
      </div>

      {/* Panel de Estado del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
          <CardDescription>
            Información sobre el estado actual del sistema y logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-800">Activo</div>
              <div className="text-sm text-green-600">Sistema</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-800">4</div>
              <div className="text-sm text-blue-600">Empresas Activas</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-800">
                {new Date().toLocaleDateString('es-AR')}
              </div>
              <div className="text-sm text-orange-600">Última Actualización</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
