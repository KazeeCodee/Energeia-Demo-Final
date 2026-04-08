'use client';

import React from 'react';
import { 
  FileText, 
  Users, 
  Download, 
  Share2, 
  Building2, 
  Search,
  AlertCircle,
  Plus,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon = FileText, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-4">
        <Icon className="h-10 w-10 text-slate-400" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 max-w-md mb-6">{description}</p>
      {action && (
        <Button 
          onClick={action.onClick}
          variant={action.variant || 'default'}
          className="focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Specific empty states for different sections
export function NoReportsEmpty({ onCreateReport }: { onCreateReport?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No hay informes disponibles"
      description="Aún no se han generado informes para este período. Los informes se crean automáticamente cada mes."
      action={onCreateReport ? {
        label: "Generar informe",
        onClick: onCreateReport
      } : undefined}
    />
  );
}

export function NoUsersEmpty({ onAddUser }: { onAddUser?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No hay usuarios registrados"
      description="No se encontraron usuarios en tu empresa. Agrega el primer usuario para comenzar."
      action={onAddUser ? {
        label: "Agregar usuario",
        onClick: onAddUser
      } : undefined}
    />
  );
}

export function NoDownloadsEmpty() {
  return (
    <EmptyState
      icon={Download}
      title="No hay descargas disponibles"
      description="Aún no has descargado ningún archivo. Las descargas aparecerán aquí una vez que generes reportes en PDF o CSV."
    />
  );
}

export function NoSharedLinksEmpty({ onCreateLink }: { onCreateLink?: () => void }) {
  return (
    <EmptyState
      icon={Share2}
      title="No hay enlaces compartidos"
      description="No has creado ningún enlace compartido. Comparte informes con personas externas de forma segura."
      action={onCreateLink ? {
        label: "Crear enlace",
        onClick: onCreateLink
      } : undefined}
    />
  );
}

export function NoCompaniesEmpty({ onAddCompany }: { onAddCompany?: () => void }) {
  return (
    <EmptyState
      icon={Building2}
      title="No hay empresas registradas"
      description="No se encontraron empresas en el sistema. Agrega la primera empresa para comenzar."
      action={onAddCompany ? {
        label: "Agregar empresa",
        onClick: onAddCompany
      } : undefined}
    />
  );
}

export function SearchEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No se encontraron resultados"
      description={`No se encontraron resultados para "${query}". Intenta con otros términos de búsqueda.`}
    />
  );
}

export function ErrorEmpty({ 
  title = "Algo salió mal", 
  description = "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
  onRetry 
}: { 
  title?: string; 
  description?: string; 
  onRetry?: () => void; 
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={description}
      action={onRetry ? {
        label: "Intentar nuevamente",
        onClick: onRetry,
        variant: 'outline'
      } : undefined}
    />
  );
}

export function NoFilesEmpty({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={Upload}
      title="No hay archivos subidos"
      description="Sube tu primer archivo mensual para comenzar a generar informes automáticamente."
      action={onUpload ? {
        label: "Subir archivo",
        onClick: onUpload
      } : undefined}
    />
  );
}