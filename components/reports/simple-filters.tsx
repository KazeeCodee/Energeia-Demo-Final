'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface SimpleFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export function SimpleFilters({ onFiltersChange }: SimpleFiltersProps) {
  const handleApply = () => {
    onFiltersChange({
      period: '2025-08',
      companies: ['all'],
      supplyPoint: 'all',
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
          <Filter className="h-5 w-5 mr-2 text-orange-500" />
          Filtros Simplificados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Filtros configurados: Agosto 2025, Todas las empresas
          </p>
          <Button onClick={handleApply} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}