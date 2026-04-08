'use client';

import { ReportBuilder } from '@/components/constructor/report-builder';

export default function ConstructorInformesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Constructor de Informes</h1>
        <p className="text-gray-600 mt-2">
          Crea y personaliza informes usando el constructor visual de arrastrar y soltar
        </p>
      </div>
      
      <ReportBuilder />
    </div>
  );
}