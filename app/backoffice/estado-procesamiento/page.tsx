'use client';

import { ProcessingStatus } from '@/components/backoffice/processing-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Activity, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EstadoProcesamientoPage() {
  const router = useRouter();

  const handleRefresh = () => {
    toast.info('Actualizando estado', {
      description: 'Obteniendo el estado más reciente de los procesamientos',
    });
    // In a real app, this would refresh the data
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="h-6 w-6" />
              Estado de Procesamiento
            </h1>
            <p className="text-slate-600">
              Monitoreo en tiempo real de los trabajos de procesamiento
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Processing Status */}
      <ProcessingStatus />

      {/* Help Information */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Información sobre Estados</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-700">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Estados de Procesamiento:</h4>
              <ul className="space-y-1 text-sm">
                <li><span className="font-medium text-orange-600">Procesando:</span> El archivo se está procesando actualmente</li>
                <li><span className="font-medium text-green-600">Completado:</span> Procesamiento exitoso, informes generados</li>
                <li><span className="font-medium text-red-600">Error:</span> Falló el procesamiento, revisar detalles</li>
                <li><span className="font-medium text-slate-600">Pendiente:</span> En cola para procesamiento</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Pasos del Procesamiento:</h4>
              <ul className="space-y-1 text-sm">
                <li>1. <span className="font-medium">Extrayendo datos:</span> Lectura del archivo fuente</li>
                <li>2. <span className="font-medium">Mapeando información:</span> Validación y estructuración</li>
                <li>3. <span className="font-medium">Generando informes:</span> Cálculos y análisis</li>
                <li>4. <span className="font-medium">Render PDF:</span> Generación de documentos</li>
                <li>5. <span className="font-medium">Publicando:</span> Disponibilización para usuarios</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}