'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Building, 
  Factory, 
  Zap,
  Play,
  RotateCcw
} from 'lucide-react';
import { DemoInitializationService } from '../../lib/services/demo-initialization';
import { useConstructorStore } from '../../lib/state/constructor';

interface DemoManagerProps {
  onDemoInitialized?: () => void;
}

export function DemoManager({ onDemoInitialized }: DemoManagerProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    globalConfigExists: boolean;
    clientConfigsCount: number;
    dataSourcesCount: number;
    issues: string[];
  } | null>(null);
  const [initializationResult, setInitializationResult] = useState<{
    success: boolean;
    message: string;
    configurationsCreated: number;
    errors?: string[];
  } | null>(null);

  const { loadDataSources } = useConstructorStore();

  // Validate demo data on component mount
  useEffect(() => {
    validateDemoData();
  }, []);

  const validateDemoData = async () => {
    try {
      const validation = await DemoInitializationService.validateDemoData();
      setValidationStatus(validation);
    } catch (error) {
      console.error('Error validating demo data:', error);
      setValidationStatus({
        isValid: false,
        globalConfigExists: false,
        clientConfigsCount: 0,
        dataSourcesCount: 0,
        issues: ['Error al validar datos de demostración'],
      });
    }
  };

  const initializeAllDemo = async () => {
    setIsInitializing(true);
    setInitializationResult(null);

    try {
      const result = await DemoInitializationService.initializeAllDemoData();
      setInitializationResult(result);
      
      // Reload data sources in constructor store
      await loadDataSources();
      
      // Revalidate after initialization
      await validateDemoData();
      
      if (result.success && onDemoInitialized) {
        onDemoInitialized();
      }
    } catch (error) {
      setInitializationResult({
        success: false,
        message: `Error durante la inicialización: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        configurationsCreated: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const resetAllDemo = async () => {
    setIsInitializing(true);
    setInitializationResult(null);

    try {
      const result = await DemoInitializationService.resetAllDemoData();
      setInitializationResult(result);
      
      // Reload data sources in constructor store
      await loadDataSources();
      
      // Revalidate after reset
      await validateDemoData();
      
      if (result.success && onDemoInitialized) {
        onDemoInitialized();
      }
    } catch (error) {
      setInitializationResult({
        success: false,
        message: `Error durante la reinicialización: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        configurationsCreated: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const initializeClientDemo = async (clientId: string) => {
    setIsInitializing(true);
    setInitializationResult(null);

    try {
      const result = await DemoInitializationService.initializeClientDemo(clientId);
      setInitializationResult(result);
      
      // Revalidate after client initialization
      await validateDemoData();
      
      if (result.success && onDemoInitialized) {
        onDemoInitialized();
      }
    } catch (error) {
      setInitializationResult({
        success: false,
        message: `Error al inicializar cliente ${clientId}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        configurationsCreated: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const initializeScenario = async (scenarioName: string) => {
    setIsInitializing(true);
    setInitializationResult(null);

    try {
      const result = await DemoInitializationService.initializeDemoScenario(scenarioName);
      setInitializationResult(result);
      
      // Revalidate after scenario initialization
      await validateDemoData();
      
      if (result.success && onDemoInitialized) {
        onDemoInitialized();
      }
    } catch (error) {
      setInitializationResult({
        success: false,
        message: `Error al inicializar escenario ${scenarioName}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        configurationsCreated: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const getClientIcon = (clientId: string) => {
    switch (clientId) {
      case 'client-1': return <Zap className="h-4 w-4" />;
      case 'client-2': return <Factory className="h-4 w-4" />;
      case 'client-3': return <Users className="h-4 w-4" />;
      case 'client-4': return <Building className="h-4 w-4" />;
      case 'client-5': return <Factory className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const demoClients = DemoInitializationService.getDemoClientsInfo();
  const demoScenarios = DemoInitializationService.getDemoScenarios();

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado de Datos de Demostración
          </CardTitle>
          <CardDescription>
            Información sobre las configuraciones y datos de demostración disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationStatus ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {validationStatus.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {validationStatus.isValid ? 'Datos válidos' : 'Problemas detectados'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {validationStatus.globalConfigExists ? '1' : '0'}
                  </div>
                  <div className="text-sm text-gray-600">Config. Global</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {validationStatus.clientConfigsCount}
                  </div>
                  <div className="text-sm text-gray-600">Config. Clientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {validationStatus.dataSourcesCount}
                  </div>
                  <div className="text-sm text-gray-600">Fuentes de Datos</div>
                </div>
              </div>

              {validationStatus.issues.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Problemas encontrados:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {validationStatus.issues.map((issue, index) => (
                          <li key={index} className="text-sm">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
              <div className="text-sm text-gray-600">Validando datos...</div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              onClick={validateDemoData}
              variant="outline"
              size="sm"
              disabled={isInitializing}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Revalidar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Initialization Results */}
      {initializationResult && (
        <Alert className={initializationResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {initializationResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">{initializationResult.message}</div>
              {initializationResult.errors && initializationResult.errors.length > 0 && (
                <div className="text-sm">
                  <div className="font-medium mb-1">Errores:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {initializationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Demo Management Tabs */}
      <Tabs defaultValue="quick-actions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quick-actions">Acciones Rápidas</TabsTrigger>
          <TabsTrigger value="clients">Clientes Demo</TabsTrigger>
          <TabsTrigger value="scenarios">Escenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inicialización Rápida</CardTitle>
              <CardDescription>
                Configura rápidamente todos los datos de demostración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={initializeAllDemo}
                  disabled={isInitializing}
                  className="h-auto p-4 flex flex-col items-start gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    <span className="font-medium">Inicializar Todo</span>
                  </div>
                  <span className="text-sm opacity-90 text-left">
                    Crea configuraciones para todos los clientes y el informe global
                  </span>
                </Button>

                <Button
                  onClick={resetAllDemo}
                  disabled={isInitializing}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2"
                >
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    <span className="font-medium">Reinicializar</span>
                  </div>
                  <span className="text-sm opacity-70 text-left">
                    Limpia y recrea todas las configuraciones de demostración
                  </span>
                </Button>
              </div>

              {isInitializing && (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Procesando...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoClients.map((client) => (
              <Card key={client.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getClientIcon(client.id)}
                    {client.name}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mb-2">
                      {client.type}
                    </Badge>
                    <div>{client.description}</div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-2">Características:</div>
                      <ul className="text-sm space-y-1">
                        {client.keyFeatures.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <Button
                      onClick={() => initializeClientDemo(client.id)}
                      disabled={isInitializing}
                      size="sm"
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Inicializar Cliente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="space-y-4">
            {demoScenarios.map((scenario) => (
              <Card key={scenario.name}>
                <CardHeader>
                  <CardTitle>{scenario.name}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-2">Casos de prueba:</div>
                      <ul className="text-sm space-y-1">
                        {scenario.testCases.map((testCase, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                            {testCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <Button
                      onClick={() => initializeScenario(scenario.name)}
                      disabled={isInitializing}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Cargar Escenario
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}