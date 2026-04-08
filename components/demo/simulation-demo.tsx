'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  AnimatedProgress, 
  CircularProgress, 
  StepProgress, 
  MultiStageProgress,
  LoadingDots,
  PulseLoader,
  RetryButton
} from '../ui/progress-indicators';
import { LoadingOverlay, ProcessingLoader, FileUploadProgress } from '../ui/loading-states';
import { ErrorBoundary } from '../ui/error-boundary';
import { useSimulation } from '../../lib/services/simulation';
import { useToast } from '../../lib/utils/toast';
import { SimulationManager } from '../../lib/mock/simulators/delays';
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  Upload, 
  Users, 
  FileText,
  Settings,
  Activity,
  AlertTriangle
} from 'lucide-react';

export function SimulationDemo() {
  const simulation = useSimulation();
  const toast = useToast();
  
  // State for various demos
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'processing' | 'completed' | 'error'>('uploading');
  const [retryCountdown, setRetryCountdown] = useState(0);

  const processingSteps = [
    'Validando datos',
    'Extrayendo información',
    'Procesando cálculos',
    'Generando gráficos',
    'Creando informe'
  ];

  const multiStageSteps = [
    { name: 'Preparación', weight: 1 },
    { name: 'Procesamiento', weight: 3 },
    { name: 'Validación', weight: 1 },
    { name: 'Finalización', weight: 1 }
  ];

  // Demo functions
  const startProgressDemo = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast.success('Progreso completado');
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
  };

  const startProcessingDemo = async () => {
    setIsProcessing(true);
    setCurrentStep(0);
    
    try {
      await simulation.simulateProcessing(
        processingSteps,
        (stepIndex, progress) => {
          setCurrentStep(stepIndex);
          // Update progress for current step
        }
      );
      toast.success('Procesamiento completado');
    } catch (error) {
      toast.error('Error en el procesamiento');
    } finally {
      setIsProcessing(false);
    }
  };

  const startFileUploadDemo = async () => {
    setUploadProgress(0);
    setUploadStatus('uploading');
    
    try {
      await simulation.simulateFileUpload(
        { name: 'informe-mensual.pdf', size: 2048000 },
        (progress) => setUploadProgress(progress)
      );
      setUploadStatus('completed');
      toast.success('Archivo subido correctamente');
    } catch (error) {
      setUploadStatus('error');
      toast.error('Error al subir archivo');
    }
  };

  const startDownloadDemo = async () => {
    try {
      const url = await simulation.simulateDownload('pdf');
      toast.success('Descarga lista');
      // In a real app, you would trigger the download here
      console.log('Download URL:', url);
    } catch (error) {
      toast.error('Error al generar descarga');
    }
  };

  const startAuthDemo = async () => {
    try {
      await simulation.simulateAuth('demo@energeia.com', 'password123');
      toast.auth.success();
    } catch (error) {
      toast.auth.error();
    }
  };

  const startUserOperationDemo = async () => {
    try {
      await simulation.simulateUserOperation(
        async () => ({ success: true }),
        'create',
        'Juan Pérez'
      );
    } catch (error) {
      toast.user.error('crear');
    }
  };

  const startReportDemo = async () => {
    try {
      await simulation.simulateReportGeneration('Informe Mensual', {
        period: '2024-01',
        company: 'demo'
      });
    } catch (error) {
      toast.error('Error al generar informe');
    }
  };

  const triggerError = () => {
    throw new Error('Error de demostración');
  };

  const startRetryDemo = () => {
    setRetryCountdown(5);
    const interval = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const patterns = SimulationManager.getAvailablePatterns();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Demo de Simulación</h1>
        <p className="text-muted-foreground">
          Demostración de todas las funcionalidades de simulación y estados de carga
        </p>
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="operations">Operaciones</TabsTrigger>
          <TabsTrigger value="errors">Errores</TabsTrigger>
          <TabsTrigger value="patterns">Patrones</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoreo</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Animated Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Progreso Animado
                </CardTitle>
                <CardDescription>
                  Barras de progreso con animaciones y diferentes estilos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatedProgress value={progress} color="primary" />
                <AnimatedProgress value={progress * 0.8} color="success" size="sm" />
                <AnimatedProgress value={progress * 0.6} color="warning" size="lg" />
                <Button onClick={startProgressDemo} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Demo
                </Button>
              </CardContent>
            </Card>

            {/* Circular Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progreso Circular</CardTitle>
                <CardDescription>
                  Indicadores circulares de progreso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <CircularProgress value={progress} color="primary" />
                  <CircularProgress value={progress * 0.7} color="success" size={48} />
                  <CircularProgress value={progress * 0.5} color="warning" size={32} />
                </div>
                <div className="text-center">
                  <LoadingDots />
                </div>
              </CardContent>
            </Card>

            {/* Step Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progreso por Pasos</CardTitle>
                <CardDescription>
                  Indicador de progreso paso a paso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StepProgress
                  steps={processingSteps}
                  currentStep={currentStep}
                  completedSteps={Array.from({ length: currentStep }, (_, i) => i)}
                />
                <Button onClick={startProcessingDemo} disabled={isProcessing} className="w-full">
                  {isProcessing ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Procesamiento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Multi-stage Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progreso Multi-etapa</CardTitle>
                <CardDescription>
                  Progreso complejo con múltiples etapas y ETA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MultiStageProgress
                  stages={multiStageSteps}
                  currentStage={Math.floor(currentStep / 2)}
                  stageProgress={(currentStep % 2) * 50}
                  eta={120}
                />
              </CardContent>
            </Card>
          </div>

          {/* File Upload Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Progreso de Subida de Archivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploadProgress
                fileName="informe-energetico-enero-2024.pdf"
                progress={uploadProgress}
                status={uploadStatus}
              />
              <Button onClick={startFileUploadDemo} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Simular Subida
              </Button>
            </CardContent>
          </Card>

          {/* Processing Loader */}
          {isProcessing && (
            <Card>
              <CardContent className="pt-6">
                <ProcessingLoader
                  steps={processingSteps}
                  currentStep={currentStep}
                  progress={((currentStep + 1) / processingSteps.length) * 100}
                  eta={60}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Autenticación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={startAuthDemo} className="w-full">
                  Simular Login
                </Button>
              </CardContent>
            </Card>

            {/* File Download */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Descarga
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={startDownloadDemo} className="w-full">
                  Simular Descarga PDF
                </Button>
              </CardContent>
            </Card>

            {/* User Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gestión de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={startUserOperationDemo} className="w-full">
                  Crear Usuario
                </Button>
              </CardContent>
            </Card>

            {/* Report Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generación de Informes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={startReportDemo} className="w-full">
                  Generar Informe
                </Button>
              </CardContent>
            </Card>

            {/* Loading Overlay */}
            <Card>
              <CardHeader>
                <CardTitle>Overlay de Carga</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => {
                    setShowOverlay(true);
                    setTimeout(() => setShowOverlay(false), 3000);
                  }} 
                  className="w-full"
                >
                  Mostrar Overlay
                </Button>
              </CardContent>
            </Card>

            {/* Retry Mechanism */}
            <Card>
              <CardHeader>
                <CardTitle>Mecanismo de Reintento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <RetryButton
                  onRetry={startRetryDemo}
                  countdown={retryCountdown}
                />
                <PulseLoader lines={2} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Boundaries
                </CardTitle>
                <CardDescription>
                  Demostración de manejo de errores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ErrorBoundary context="demo">
                  <Button onClick={triggerError} variant="destructive" className="w-full">
                    Provocar Error
                  </Button>
                </ErrorBoundary>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notificaciones de Error</CardTitle>
                <CardDescription>
                  Diferentes tipos de notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => toast.success('Operación exitosa')}
                  variant="outline"
                  className="w-full"
                >
                  Toast Éxito
                </Button>
                <Button 
                  onClick={() => toast.error('Error en la operación')}
                  variant="outline"
                  className="w-full"
                >
                  Toast Error
                </Button>
                <Button 
                  onClick={() => toast.warning('Advertencia importante')}
                  variant="outline"
                  className="w-full"
                >
                  Toast Advertencia
                </Button>
                <Button 
                  onClick={() => toast.info('Información relevante')}
                  variant="outline"
                  className="w-full"
                >
                  Toast Info
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Patrones de Simulación
              </CardTitle>
              <CardDescription>
                Diferentes patrones de velocidad y comportamiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(patterns).map(([key, pattern]) => (
                  <Card key={key} className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{pattern.name}</h4>
                          <Badge variant="outline">
                            {pattern.baseDelay}ms
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pattern.description}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            simulation.setPattern(key as any);
                            toast.info(`Patrón cambiado a: ${pattern.name}`);
                          }}
                          className="w-full"
                        >
                          Aplicar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Simulación</CardTitle>
              <CardDescription>
                Monitoreo de rendimiento y estadísticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    const metrics = simulation.getMetrics();
                    console.log('Simulation Metrics:', metrics);
                    toast.info('Métricas mostradas en consola');
                  }}
                  className="w-full"
                >
                  Ver Métricas en Consola
                </Button>
                <Button
                  onClick={() => {
                    simulation.resetMetrics();
                    toast.info('Métricas reiniciadas');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Reiniciar Métricas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {showOverlay && (
        <LoadingOverlay
          message="Procesando operación..."
          progress={progress}
          onCancel={() => setShowOverlay(false)}
        />
      )}
    </div>
  );
}