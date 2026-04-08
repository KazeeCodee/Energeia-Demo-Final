'use client';

import React, { useEffect, useState } from 'react';
import { useColorContrast } from '@/hooks/use-accessibility';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPair {
  foreground: string;
  background: string;
  label: string;
  context: string; // e.g., 'button', 'text', 'link'
}

const SYSTEM_COLORS: ColorPair[] = [
  {
    foreground: '#ffffff',
    background: '#FF7A00', // Primary orange
    label: 'Botón primario',
    context: 'button',
  },
  {
    foreground: '#1f2937', // Gray 800
    background: '#ffffff',
    label: 'Texto principal',
    context: 'text',
  },
  {
    foreground: '#6b7280', // Gray 500
    background: '#ffffff',
    label: 'Texto secundario',
    context: 'text',
  },
  {
    foreground: '#FF7A00',
    background: '#ffffff',
    label: 'Enlaces',
    context: 'link',
  },
  {
    foreground: '#ffffff',
    background: '#dc2626', // Red 600
    label: 'Botón de error',
    context: 'button',
  },
  {
    foreground: '#ffffff',
    background: '#16a34a', // Green 600
    label: 'Botón de éxito',
    context: 'button',
  },
  {
    foreground: '#1f2937',
    background: '#f3f4f6', // Gray 100
    label: 'Fondo de tarjeta',
    context: 'background',
  },
];

interface ColorContrastCheckerProps {
  className?: string;
  showSystemColors?: boolean;
  customColors?: ColorPair[];
}

export function ColorContrastChecker({
  className,
  showSystemColors = true,
  customColors = [],
}: ColorContrastCheckerProps) {
  const { checkContrast, isAccessibleContrast } = useColorContrast();
  const [results, setResults] = useState<Array<{
    pair: ColorPair;
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
  }>>([]);

  const colorsToCheck = [
    ...(showSystemColors ? SYSTEM_COLORS : []),
    ...customColors,
  ];

  useEffect(() => {
    const newResults = colorsToCheck.map(pair => {
      const ratio = checkContrast(pair.foreground, pair.background);
      return {
        pair,
        ratio,
        passesAA: isAccessibleContrast(pair.foreground, pair.background, 'AA'),
        passesAAA: isAccessibleContrast(pair.foreground, pair.background, 'AAA'),
      };
    });
    setResults(newResults);
  }, [checkContrast, isAccessibleContrast]);

  const getStatusIcon = (passesAA: boolean, passesAAA: boolean) => {
    if (passesAAA) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (passesAA) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusText = (passesAA: boolean, passesAAA: boolean) => {
    if (passesAAA) return 'Excelente (AAA)';
    if (passesAA) return 'Bueno (AA)';
    return 'Falla';
  };

  const getStatusColor = (passesAA: boolean, passesAAA: boolean) => {
    if (passesAAA) return 'bg-green-100 text-green-800 border-green-200';
    if (passesAA) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const failingResults = results.filter(r => !r.passesAA);
  const warningResults = results.filter(r => r.passesAA && !r.passesAAA);
  const passingResults = results.filter(r => r.passesAAA);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Verificación de Contraste de Colores
        </CardTitle>
        <div className="flex gap-2 text-sm">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {passingResults.length} Excelente
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {warningResults.length} Bueno
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            {failingResults.length} Falla
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {failingResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-900 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Requieren Atención
            </h4>
            <div className="space-y-2">
              {failingResults.map((result, index) => (
                <ContrastResult key={index} result={result} />
              ))}
            </div>
          </div>
        )}

        {warningResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pueden Mejorarse
            </h4>
            <div className="space-y-2">
              {warningResults.map((result, index) => (
                <ContrastResult key={index} result={result} />
              ))}
            </div>
          </div>
        )}

        {passingResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-green-900 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Excelente Contraste
            </h4>
            <div className="space-y-2">
              {passingResults.map((result, index) => (
                <ContrastResult key={index} result={result} />
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t text-sm text-gray-600">
          <p className="mb-2">
            <strong>Estándares WCAG:</strong>
          </p>
          <ul className="space-y-1 text-xs">
            <li>• <strong>AA:</strong> Ratio mínimo 4.5:1 para texto normal</li>
            <li>• <strong>AAA:</strong> Ratio mínimo 7:1 para texto normal</li>
            <li>• <strong>Texto grande:</strong> Ratios menores permitidos (3:1 AA, 4.5:1 AAA)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

interface ContrastResultProps {
  result: {
    pair: ColorPair;
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
  };
}

function ContrastResult({ result }: ContrastResultProps) {
  const { pair, ratio, passesAA, passesAAA } = result;

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        {/* Color preview */}
        <div
          className="w-12 h-8 rounded border flex items-center justify-center text-xs font-medium"
          style={{
            backgroundColor: pair.background,
            color: pair.foreground,
          }}
        >
          Aa
        </div>
        
        <div>
          <div className="font-medium text-sm">{pair.label}</div>
          <div className="text-xs text-gray-500">
            {pair.foreground} sobre {pair.background}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-sm font-mono">
            {ratio.toFixed(2)}:1
          </div>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              passesAAA ? 'bg-green-100 text-green-800 border-green-200' :
              passesAA ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
              'bg-red-100 text-red-800 border-red-200'
            )}
          >
            {passesAAA ? 'AAA' : passesAA ? 'AA' : 'Falla'}
          </Badge>
        </div>
        
        {passesAAA ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : passesAA ? (
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
      </div>
    </div>
  );
}