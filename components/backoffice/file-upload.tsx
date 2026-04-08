'use client';

import { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SimulationManager } from '@/lib/mock/simulators/delays';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface FileUploadProps {
  onFileProcessed?: (file: UploadedFile) => void;
}

export const FileUpload = forwardRef(function FileUpload({ onFileProcessed }: FileUploadProps, ref) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setUploadedFile(null);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }));

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulación de barra de progreso con estado 'pending'
  const totalTime = 1000 + Math.random() * 1000; // 1-2s
    const intervalMs = 100;
    let elapsed = 0;
    let progress = 0;

    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        elapsed += intervalMs;
        progress = Math.min(100, Math.round((elapsed / totalTime) * 100));
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, intervalMs);
    });

    const uploadedFile: UploadedFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    };

    setUploadedFile(uploadedFile);
    toast.success('Archivo subido correctamente', {
      description: `${file.name} está listo para procesar`,
    });

    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleProcessFile = () => {
    if (uploadedFile && onFileProcessed) {
      onFileProcessed(uploadedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (type: string): string => {
    switch (type) {
      case 'application/pdf':
        return 'PDF';
      case 'text/csv':
        return 'CSV';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'Excel';
      default:
        return 'Archivo';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Subir Archivo Mensual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedFile ? (
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragOver 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-slate-300 hover:border-slate-400'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={handleFileInput}
              disabled={isUploading}
              aria-label="Seleccionar archivo para subir"
            />
            
            {isUploading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto" />
                <div>
                  <p className="text-sm font-medium">Subiendo archivo...</p>
                  <p className="text-xs text-muted-foreground">{uploadProgress}% completado</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-sm font-medium">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Puedes subir cualquier archivo para la simulación de carga demo.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="font-medium text-sm">{uploadedFile.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {getFileTypeLabel(uploadedFile.type)}
                    </Badge>
                    <span>{formatFileSize(uploadedFile.size)}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-muted-foreground hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Archivo listo para procesar</p>
                <p className="text-blue-700">
                  El archivo ha sido validado y está listo para generar los informes mensuales.
                </p>
              </div>
            </div>

            <Button 
              onClick={handleProcessFile}
              className="w-full"
              size="lg"
            >
              Procesar Archivo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});