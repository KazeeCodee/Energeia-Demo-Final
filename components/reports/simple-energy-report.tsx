'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface SimpleEnergyReportProps {
  period: string;
  company: string;
}

export function SimpleEnergyReport({ period, company }: SimpleEnergyReportProps) {
  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Informe energético</h1>
            <p className="text-gray-600">{period}</p>
            <p className="text-sm text-gray-500">{company}</p>
          </div>
        </div>
      </div>

      {/* Simple KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-3xl font-bold text-gray-900">88 MWh</h3>
            <p className="text-gray-600">Acuerdo Energía Mes</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-3xl font-bold text-gray-900">189 MWh</h3>
            <p className="text-gray-600">Acuerdo Energía Año</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-3xl font-bold text-gray-900">0.18 GWh</h3>
            <p className="text-gray-600">Demanda Mes</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <h3 className="text-3xl font-bold text-gray-900">1.18 GWh</h3>
            <p className="text-gray-600">Demanda Año Móvil</p>
          </CardContent>
        </Card>
      </div>

      {/* Simple Chart Placeholder */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Demanda año móvil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico de demanda energética</p>
          </div>
        </CardContent>
      </Card>

      {/* Test Message */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <p className="text-green-800">
            ✅ Componente de informe energético cargado correctamente para {company}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}