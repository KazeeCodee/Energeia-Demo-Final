'use client';

import { Globe, Users, CheckCircle } from 'lucide-react';
import { useConstructorStore } from '@/lib/state/constructor';

export function ConfigStatus() {
  const { selectedClientId, currentConfig } = useConstructorStore();

  const isGlobal = !selectedClientId;
  const hasCustom = currentConfig && currentConfig.clientId === selectedClientId;

  if (isGlobal) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5">
        <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
        <span className="text-sm text-blue-800 font-medium">Configuración Global</span>
        <span className="text-sm text-blue-600">— Base heredada por todos los clientes sin configuración propia</span>
      </div>
    );
  }

  if (hasCustom) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
        <span className="text-sm text-green-800 font-medium">Configuración personalizada</span>
        <span className="text-sm text-green-600">
          — Modificado el {currentConfig?.updatedAt?.toLocaleDateString('es-AR')}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5">
      <Users className="h-4 w-4 text-orange-500 flex-shrink-0" />
      <span className="text-sm text-orange-800 font-medium">Usando configuración global</span>
      <span className="text-sm text-orange-600">— Los cambios crearán una configuración exclusiva para este cliente</span>
    </div>
  );
}
