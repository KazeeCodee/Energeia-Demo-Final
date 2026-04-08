'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Activity,
  Database,
  Zap,
  Users,
  Settings,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { SystemValidationService, SystemValidationResult, ValidationCategory } from '../../lib/services/system-validation';

interface SystemValidatorProps {
  onValidationComplete?: (result: SystemValidationResult) => void;
}

export function SystemValidator({ onValidationComplete }: SystemValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<SystemValidationResult | null>(null);
  const [quickHealthResult, setQuickHealthResult] = useState<{
    isHealthy: boolean;
    issues: string[];
    score: number;
  } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Perform quick health check on mount
  useEffect(() => {
    performQuickHealthCheck();
  }, []);

  const performQuickHealthCheck = async () => {
    try {
      const result = await SystemValidationService.quickHealthCheck();
      setQuickHealthResult(result);
    } catch (error) {
      console.error('Error in quick health check:', error);
      setQuickHealthResult({
        isHealthy: false,
        issues: ['Error al realizar verificación rápida'],
        score: 0,
      });
    }
  };

  const performFullValidation = async () => {
    setIsValidating(true);
    
    try {
      const result = await SystemValidationService.validateCompleteSystem();
      setValidationResult(result);
      
      if (onValidationComplete) {
        onValidationComplete(result);
      }
    } catch (error) {
      console.error('Error in system validation:', error);
      // Create error result
      setValidationResult({
        isValid: false,
        score: 0,
        categories: {
          dataIntegrity: createErrorCategory('Data Integrity', 'Error al validar integridad de datos'),
          functionality: createErrorCategory('Functionality', 'Error al validar funcionalidad'),
          performance: createErrorCategory('Performance', 'Error al validar rendimiento'),
          userExperience: createErrorCategory('User Experience', 'Error al validar experiencia de usuario'),
          compatibility: createErrorCategory('Compatibility', 'Error al validar compatibilidad'),
        },
        recommendations: ['Error crítico durante la validación del sistema'],
        criticalIssues: ['Error crítico durante la validación del sistema'],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const createErrorCategory = (name: string, message: string): ValidationCategory => ({
    name,
    score: 0,
    status: 'critical',
    checks: [{
      name: 'System Error',
      passed: false,
      message,
      severity: 'critical',
    }],
  });

  const toggleCategoryExpansion = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'data integrity': return <Database className="h-4 w-4" />;
      case 'functionality': return <Settings className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'user experience': return <Users className="h-4 w-4" />;
      case 'compatibility': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: ValidationCategory['status']) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ValidationCategory['status']) => {
    switch (status) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'error': return <AlertCircle className="h-3 w-3 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-3 w-3 text-green-500" />;
      default: return <Activity className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Health Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estado del Sistema
          </CardTitle>
          <CardDescription>
            Verificación rápida del estado general del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quickHealthResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {quickHealthResult.isHealthy ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500" />
                  )}
                  <span className="font-medium">
                    {quickHealthResult.isHealthy ? 'Sistema Saludable' : 'Problemas Detectados'}
                  </span>
                </div>
                <Badge variant={quickHealthResult.isHealthy ? 'default' : 'destructive'}>
                  {quickHealthResult.score}%
                </Badge>
              </div>

              <Progress value={quickHealthResult.score} className="w-full" />

              {quickHealthResult.issues.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Problemas encontrados:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {quickHealthResult.issues.map((issue, index) => (
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
              <div className="text-sm text-gray-600">Verificando estado del sistema...</div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              onClick={performQuickHealthCheck}
              variant="outline"
              size="sm"
              disabled={isValidating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar Nuevamente
            </Button>
            <Button
              onClick={performFullValidation}
              disabled={isValidating}
              size="sm"
            >
              <Shield className="h-4 w-4 mr-2" />
              Validación Completa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Validation Results */}
      {(isValidating || validationResult) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Validación Completa del Sistema
            </CardTitle>
            <CardDescription>
              Análisis detallado de todos los aspectos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isValidating ? (
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-orange-500" />
                <div className="text-lg font-medium mb-2">Validando Sistema</div>
                <div className="text-sm text-gray-600">
                  Esto puede tomar unos momentos mientras se verifican todos los componentes...
                </div>
              </div>
            ) : validationResult && (
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    {validationResult.isValid ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-500" />
                    )}
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        {validationResult.score}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {validationResult.isValid ? 'Sistema Válido' : 'Requiere Atención'}
                      </div>
                    </div>
                  </div>
                  <Progress value={validationResult.score} className="w-full max-w-md mx-auto" />
                </div>

                <Separator />

                {/* Categories Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(validationResult.categories).map(([key, category]) => (
                    <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => toggleCategoryExpansion(category.name)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category.name)}
                            <span className="font-medium text-sm">{category.name}</span>
                          </div>
                          {getStatusIcon(category.status)}
                        </div>
                        <div className="space-y-2">
                          <Progress value={category.score} className="h-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">{category.score}%</span>
                            <Badge variant="outline" className="text-xs">
                              {category.checks.filter(c => c.passed).length}/{category.checks.length}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Detailed Results */}
                <Tabs defaultValue="categories" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="categories">Categorías</TabsTrigger>
                    <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
                    <TabsTrigger value="critical">Críticos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="categories" className="space-y-4">
                    {Object.entries(validationResult.categories).map(([key, category]) => (
                      <Collapsible key={key} 
                                   open={expandedCategories.has(category.name)}
                                   onOpenChange={() => toggleCategoryExpansion(category.name)}>
                        <CollapsibleTrigger asChild>
                          <Card className="cursor-pointer hover:shadow-sm transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {getCategoryIcon(category.name)}
                                  <div>
                                    <CardTitle className="text-lg">{category.name}</CardTitle>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Progress value={category.score} className="w-24 h-2" />
                                      <span className="text-sm font-medium">{category.score}%</span>
                                      {getStatusIcon(category.status)}
                                    </div>
                                  </div>
                                </div>
                                {expandedCategories.has(category.name) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                            </CardHeader>
                          </Card>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Card className="mt-2">
                            <CardContent className="pt-4">
                              <div className="space-y-3">
                                {category.checks.map((check, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                    {getSeverityIcon(check.severity)}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{check.name}</span>
                                        <Badge variant={check.passed ? 'default' : 'destructive'} className="text-xs">
                                          {check.passed ? 'Pasó' : 'Falló'}
                                        </Badge>
                                      </div>
                                      <div className="text-sm text-gray-600 mb-1">{check.message}</div>
                                      {check.details && (
                                        <div className="text-xs text-gray-500">{check.details}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-4">
                    {validationResult.recommendations.length > 0 ? (
                      <div className="space-y-3">
                        {validationResult.recommendations.map((recommendation, index) => (
                          <Alert key={index}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{recommendation}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          No hay recomendaciones específicas. El sistema está funcionando correctamente.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="critical" className="space-y-4">
                    {validationResult.criticalIssues.length > 0 ? (
                      <div className="space-y-3">
                        {validationResult.criticalIssues.map((issue, index) => (
                          <Alert key={index} className="border-red-200 bg-red-50">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                              <div className="font-medium">Problema Crítico</div>
                              <div>{issue}</div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          No se encontraron problemas críticos en el sistema.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}