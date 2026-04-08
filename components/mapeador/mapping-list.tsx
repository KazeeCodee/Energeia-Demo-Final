'use client';

import { FieldMapping, ExcelFieldType } from '@/lib/types/mapper';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Hash, Calendar, Type, FileSpreadsheet, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<ExcelFieldType, React.ComponentType<{ className?: string }>> = {
  number: Hash,
  date:   Calendar,
  text:   Type,
  empty:  Type,
};

const TYPE_COLOR: Record<ExcelFieldType, string> = {
  number: 'text-blue-600 bg-blue-50 border-blue-200',
  date:   'text-purple-600 bg-purple-50 border-purple-200',
  text:   'text-green-600 bg-green-50 border-green-200',
  empty:  'text-slate-500 bg-slate-50 border-slate-200',
};

interface MappingListProps {
  mappings: FieldMapping[];
  onEdit: (mapping: FieldMapping) => void;
  onDelete: (id: string) => void;
}

export function MappingList({ mappings, onEdit, onDelete }: MappingListProps) {
  if (mappings.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 py-14 text-center">
        <div className="mx-auto w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
          <FileSpreadsheet className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-500">Sin mapeos definidos</p>
        <p className="text-xs text-slate-400 mt-1">
          Creá el primer mapeo para vincular columnas del Excel con campos del sistema
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {mappings.map(mapping => {
        const Icon = TYPE_ICON[mapping.dataType];
        return (
          <div
            key={mapping.id}
            className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            {/* Type icon */}
            <div className={cn(
              'w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5',
              TYPE_COLOR[mapping.dataType]
            )}>
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{mapping.targetLabel}</p>
              {mapping.description && (
                <p className="text-xs text-slate-500 mt-0.5">{mapping.description}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {/* Column letter + sheet */}
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-slate-100 text-xs font-mono font-semibold text-slate-700">
                    {mapping.sourceColumn}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Layers className="h-3 w-3 text-slate-400" />
                    {mapping.sourceSheet}
                  </div>
                </div>

                {/* Source path (truncated) */}
                <span className="text-xs text-slate-500 truncate max-w-xs" title={mapping.sourcePath}>
                  {mapping.sourcePath}
                </span>

                {/* File */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <FileSpreadsheet className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{mapping.sourceFileName}</span>
                </div>

                {/* Field slug */}
                <code className="text-xs font-mono text-orange-600 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">
                  {mapping.targetField}
                </code>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                onClick={() => onEdit(mapping)}
                title="Editar"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm(`¿Eliminar el mapeo "${mapping.targetLabel}"?`)) {
                    onDelete(mapping.id);
                  }
                }}
                title="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
