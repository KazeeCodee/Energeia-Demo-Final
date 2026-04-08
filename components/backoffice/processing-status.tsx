'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Utility function to safely handle dates
const safeDate = (date: Date | string): Date => {
  return date instanceof Date ? date : new Date(date);
};
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getMockData } from '@/lib/mock/data/seeds';
import { ProcessingJob } from '@/lib/types';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Loader2,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export function ProcessingStatus() {
  const data = getMockData();
  const processingJobs = data?.processingJobs || [];

  // Sort jobs by most recent first
  const sortedJobs = [...processingJobs].sort((a, b) => {
    const dateA = safeDate(a.startedAt);
    const dateB = safeDate(b.startedAt);
    return dateB.getTime() - dateA.getTime();
  });

  const handleRetry = (jobId: string) => {
    toast.info('Reintentando procesamiento', {
      description: 'Se ha iniciado un nuevo procesamiento del archivo',
    });
  };

  const handleDownloadResults = (jobId: string) => {
    const job = sortedJobs.find(j => j.id === jobId);
    if (!job || !job.result) return;
    const lines = [
      `Archivo: ${job.fileName}`,
      `Empresas procesadas: ${job.result.companiesProcessed}`,
      `Informes generados: ${job.result.reportsGenerated}`,
      `Duración total: ${formatDuration(job.result.totalDuration)}`,
    ];
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultado_${job.fileName.replace(/\.[^/.]+$/, '')}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    toast.success('Descarga iniciada', {
      description: 'Los resultados del procesamiento se están descargando',
    });
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ProcessingJob['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'processing':
        return <Badge className="bg-orange-100 text-orange-800">Procesando</Badge>;
      case 'failed':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  const getCurrentStepProgress = (job: ProcessingJob): number => {
    if (job.status !== 'processing') return 0;
    
    const completedSteps = job.steps.filter(s => s.status === 'completed').length;
    const totalSteps = job.steps.length;
    const currentStepProgress = job.currentStep < job.steps.length ? 
      (job.steps[job.currentStep]?.status === 'running' ? 50 : 0) : 0;
    
    return ((completedSteps + currentStepProgress / 100) / totalSteps) * 100;
  };

  if (sortedJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Estado de Procesamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay trabajos de procesamiento recientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Estado de Procesamiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedJobs.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 space-y-3">
              {/* Job Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <p className="font-medium text-sm">{job.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(job.fileSize)} • 
                      Iniciado: {safeDate(job.startedAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {getStatusBadge(job.status)}
              </div>

              {/* Progress for processing jobs */}
              {job.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progreso general</span>
                    <span>{Math.round(getCurrentStepProgress(job))}%</span>
                  </div>
                  <Progress value={getCurrentStepProgress(job)} className="h-2" />
                  
                  {/* Current step info */}
                  {job.currentStep < job.steps.length && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>{job.steps[job.currentStep].name}</span>
                      {job.steps[job.currentStep].eta && (
                        <span>• ETA: {Math.ceil(job.steps[job.currentStep].eta! / 1000)}s</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Results for completed jobs */}
              {job.status === 'completed' && job.result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-green-700">Empresas</p>
                      <p className="font-bold text-green-900">{job.result.companiesProcessed}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-700">Informes</p>
                      <p className="font-bold text-green-900">{job.result.reportsGenerated}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-700">Duración</p>
                      <p className="font-bold text-green-900">{formatDuration(job.result.totalDuration)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors for failed jobs */}
              {job.status === 'failed' && job.result?.errors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-900 mb-2">Errores encontrados:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {job.result.errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                {job.status === 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadResults(job.id)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Descargar Resultados
                  </Button>
                )}
                {job.status === 'failed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRetry(job.id)}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reintentar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}