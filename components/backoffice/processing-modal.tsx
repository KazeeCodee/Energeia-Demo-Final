'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ProcessingJob, ProcessingStep } from '@/lib/types';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2, 
  FileText,
  Database,
  Zap,
  FileImage,
  Upload
} from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  onComplete?: (result: ProcessingJob['result']) => void;
}

const PROCESSING_STEPS = [
  { name: 'Extrayendo datos', icon: Database, duration: 1800 },
  { name: 'Mapeando información', icon: Zap, duration: 1200 },
  { name: 'Generando informes', icon: FileText, duration: 2000 },
  { name: 'Render PDF', icon: FileImage, duration: 1200 },
  { name: 'Publicando', icon: Upload, duration: 1000 },
];

export function ProcessingModal({ isOpen, onClose, fileName, onComplete }: ProcessingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [eta, setEta] = useState(0);
  const [result, setResult] = useState<ProcessingJob['result']>();

  useEffect(() => {
    if (isOpen && !isProcessing && !isCompleted && !isFailed) {
      startProcessing();
    }
  }, [isOpen]);

  const startProcessing = async () => {
    setIsProcessing(true);
    setCurrentStep(0);
    setStepProgress(0);
    setIsCompleted(false);
    setIsFailed(false);

    try {
      for (let i = 0; i < PROCESSING_STEPS.length; i++) {
        setCurrentStep(i);
        setStepProgress(0); // Reiniciar barra a 0 al iniciar cada paso
        // Calculate ETA
        const remainingSteps = PROCESSING_STEPS.slice(i + 1);
        const remainingTime = remainingSteps.reduce((sum, step) => sum + step.duration, 0);
        setEta(remainingTime);
        // Simulate step progress
        await simulateStepProgress(PROCESSING_STEPS[i].duration);
      }
      // Processing completed successfully
      const mockResult = {
        companiesProcessed: 4 + Math.floor(Math.random() * 2),
        reportsGenerated: 4 + Math.floor(Math.random() * 2),
        totalDuration: PROCESSING_STEPS.reduce((sum, step) => sum + step.duration, 0),
      };
      setResult(mockResult);
      setIsCompleted(true);
      setIsProcessing(false);
      onComplete?.(mockResult);
    } catch (error) {
      setIsFailed(true);
      setIsProcessing(false);
    }
  };

  const simulateStepProgress = (duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const steps = 100;
      const stepDuration = duration / steps;
      let progress = 0;

      const interval = setInterval(() => {
        progress += 1;
        setStepProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, stepDuration);
    });
  };

  const formatETA = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getStepStatus = (stepIndex: number): 'pending' | 'running' | 'completed' => {
    if (isCompleted || stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep && isProcessing) return 'running';
    return 'pending';
  };

  const getStepIcon = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const IconComponent = PROCESSING_STEPS[stepIndex].icon;
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />;
      default:
        return <IconComponent className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      // Reset state for next time
      setTimeout(() => {
        setCurrentStep(0);
        setStepProgress(0);
        setIsCompleted(false);
        setIsFailed(false);
        setResult(undefined);
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
  <DialogContent className="sm:max-w-md" showCloseButton={isCompleted}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Procesando Archivo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Info */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Archivo:</p>
            <p className="font-medium">{fileName}</p>
          </div>

          {/* Processing Steps */}
          <div className="space-y-3">
            {PROCESSING_STEPS.map((step, index) => {
              const status = getStepStatus(index);
              const isActive = index === currentStep && isProcessing;

              return (
                <div key={index} className="flex items-center gap-3">
                  {getStepIcon(index)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        status === 'completed' ? 'text-green-700' :
                        status === 'running' ? 'text-orange-700' :
                        'text-muted-foreground'
                      }`}>
                        {step.name}
                      </span>
                      <Badge variant={
                        status === 'completed' ? 'default' :
                        status === 'running' ? 'secondary' :
                        'outline'
                      } className="text-xs">
                        {status === 'completed' ? 'Completado' :
                         status === 'running' ? 'En progreso' :
                         'Pendiente'}
                      </Badge>
                    </div>
                    {isActive && (
                      <Progress value={stepProgress} className="mt-2 h-1" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ETA */}
          {isProcessing && eta > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Tiempo estimado restante: {formatETA(eta)}</span>
            </div>
          )}

          {/* Results */}
          {isCompleted && result && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="text-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                  <h3 className="font-semibold text-green-900">Procesamiento Completado</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-700">Empresas procesadas</p>
                      <p className="font-bold text-green-900">{result.companiesProcessed}</p>
                    </div>
                    <div>
                      <p className="text-green-700">Informes generados</p>
                      <p className="font-bold text-green-900">{result.reportsGenerated}</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-600">
                    Tiempo total: {Math.round(result.totalDuration / 1000)}s
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {isFailed && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
                  <h3 className="font-semibold text-red-900">Error en el Procesamiento</h3>
                  <p className="text-sm text-red-700">
                    Hubo un error durante el procesamiento del archivo. 
                    Verifica el formato y vuelve a intentar.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {isProcessing && (
              <Button variant="outline" disabled>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </Button>
            )}
            {(isCompleted || isFailed) && (
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}