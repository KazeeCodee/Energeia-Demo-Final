'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/backoffice/file-upload';
import { ProcessingModal } from '@/components/backoffice/processing-modal';
import { ProcessingJob } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export default function SubirArchivoPage() {
  const router = useRouter();
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);

  const handleFileProcessed = (file: UploadedFile) => {
    setCurrentFile(file);
    setShowProcessingModal(true);
  };

  const handleProcessingComplete = (result: ProcessingJob['result']) => {
    if (!result) return;
    toast.success('Procesamiento completado', {
      description: `Se generaron ${result.reportsGenerated} informes para ${result.companiesProcessed} empresas`,
    });
    
  // No redirect, user stays on this page after processing
  };

  const handleCloseProcessingModal = () => {
    setShowProcessingModal(false);
    setCurrentFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
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
          <h1 className="text-2xl font-bold text-slate-900">Subir Archivo Mensual</h1>
          <p className="text-slate-600">
            Sube el archivo de datos energéticos para generar los informes mensuales
          </p>
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <FileText className="h-5 w-5" />
            Instrucciones de Carga
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="space-y-3">
            <p>
              Para generar los informes mensuales, sube el archivo de datos energéticos 
              correspondiente al período que deseas procesar.
            </p>
            <div className="space-y-2">
              <p className="font-medium">Requisitos del archivo:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Formato: PDF, CSV o Excel (.xlsx, .xls)</li>
                <li>Tamaño máximo: 10MB</li>
                <li>Debe contener datos de todas las empresas activas</li>
                <li>Estructura de datos según el formato estándar de Energeia</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <FileUpload onFileProcessed={handleFileProcessed} />

      {/* Important Notes */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-amber-800">
              <p className="font-medium mb-2">Notas importantes:</p>
              <ul className="text-sm space-y-1">
                <li>• El procesamiento puede tomar entre 5-15 minutos dependiendo del tamaño del archivo</li>
                <li>• Una vez iniciado, el proceso no se puede cancelar</li>
                <li>• Los informes generados estarán disponibles inmediatamente para todas las empresas</li>
                <li>• Se enviará una notificación automática a los usuarios cuando estén listos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Modal */}
      <ProcessingModal
        isOpen={showProcessingModal}
        onClose={handleCloseProcessingModal}
        fileName={currentFile?.name || ''}
        onComplete={handleProcessingComplete}
      />
    </div>
  );
}