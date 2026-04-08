'use client';

import { useState } from 'react';
import { ColumnBinding } from '@/lib/types/mapper';
import { SystemField, SYSTEM_FIELDS, FIELD_CATEGORIES } from '@/lib/data/system-fields';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, Hash, Calendar, Type, Zap, Clock, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Category config ────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  'Identificadores':    { color: 'text-slate-700 bg-slate-100 border-slate-200',   icon: Tag   },
  'Energía mensual':    { color: 'text-blue-700 bg-blue-50 border-blue-200',        icon: Zap   },
  'Potencias horarias': { color: 'text-orange-700 bg-orange-50 border-orange-200',  icon: Clock },
};

// ── Column letters list (A..Z, AA..AZ) ────────────────────────────────────

const COLUMN_LETTERS = [
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  ...Array.from({ length: 26 }, (_, i) => 'A' + String.fromCharCode(65 + i)),
];

// Known sheet names from the CAMMESA DTE file
const KNOWN_SHEETS = [
  ...new Set(SYSTEM_FIELDS.map(f => f.defaultSheet)),
];

// ── Single field row ───────────────────────────────────────────────────────

interface FieldRowProps {
  field: SystemField;
  binding: ColumnBinding;
  onChange: (fieldId: string, patch: Partial<Pick<ColumnBinding, 'sheet' | 'column' | 'startRow'>>) => void;
}

function FieldRow({ field, binding, onChange }: FieldRowProps) {
  const [rowInput, setRowInput] = useState(String(binding.startRow));

  function handleRowBlur() {
    const n = parseInt(rowInput);
    if (!isNaN(n) && n >= 1) {
      onChange(field.id, { startRow: n });
    } else {
      setRowInput(String(binding.startRow));
    }
  }

  const status = binding.lastStatus;

  return (
    <div className={cn(
      'grid items-center gap-3 px-5 py-3.5 border-b border-slate-100 last:border-0 transition-colors',
      'grid-cols-[1fr_auto_auto_auto_180px]',
      status === 'ok'    && 'hover:bg-green-50/40',
      status === 'error' && 'bg-red-50/40 hover:bg-red-50/60',
      !status            && 'hover:bg-slate-50/60',
    )}>

      {/* Campo del sistema (read-only) */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{field.label}</span>
          {field.unit && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
              {field.unit}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{field.description}</p>
      </div>

      {/* Hoja */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Hoja</span>
        <select
          value={binding.sheet}
          onChange={e => onChange(field.id, { sheet: e.target.value })}
          className="h-8 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 px-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent cursor-pointer hover:border-orange-300 transition-colors max-w-[160px]"
          title={binding.sheet}
        >
          {KNOWN_SHEETS.map(s => (
            <option key={s} value={s}>
              {/* Show short label: last word of sheet name */}
              {s.split(' ').pop()}
            </option>
          ))}
        </select>
      </div>

      {/* Columna */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Columna</span>
        <select
          value={binding.column}
          onChange={e => onChange(field.id, { column: e.target.value })}
          className="w-16 h-8 rounded-md border border-slate-200 bg-white text-sm font-mono font-semibold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent cursor-pointer hover:border-orange-300 transition-colors"
        >
          {COLUMN_LETTERS.map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Desde fila */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Desde fila</span>
        <Input
          value={rowInput}
          onChange={e => setRowInput(e.target.value)}
          onBlur={handleRowBlur}
          className="w-16 h-8 text-sm font-mono text-center"
          type="number"
          min={1}
          max={100}
        />
      </div>

      {/* Estado / último valor */}
      <div className="flex items-center gap-2 justify-end">
        {status === 'ok' && (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-600 truncate max-w-[130px]" title={binding.lastValue}>
              {binding.lastValue}
            </span>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-500 font-medium">Columna no encontrada</span>
          </>
        )}
        {!status && (
          <span className="text-xs text-slate-300 italic">Sin probar</span>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface FieldMappingTableProps {
  bindings: ColumnBinding[];
  onBindingsChange: (bindings: ColumnBinding[]) => void;
}

export function FieldMappingTable({ bindings, onBindingsChange }: FieldMappingTableProps) {

  function handleChange(fieldId: string, patch: Partial<Pick<ColumnBinding, 'sheet' | 'column' | 'startRow'>>) {
    onBindingsChange(
      bindings.map(b =>
        b.fieldId === fieldId ? { ...b, ...patch, updatedAt: new Date() } : b
      )
    );
  }

  const okCount = bindings.filter(b => b.lastStatus === 'ok').length;
  const errorCount = bindings.filter(b => b.lastStatus === 'error').length;
  const untestedCount = bindings.filter(b => !b.lastStatus).length;

  return (
    <div className="space-y-5">

      {/* Summary pills */}
      {(okCount > 0 || errorCount > 0) && (
        <div className="flex items-center gap-2">
          {okCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 border border-green-200 px-3 py-1 text-xs font-semibold text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {okCount} {okCount === 1 ? 'campo leyendo OK' : 'campos leyendo OK'}
            </span>
          )}
          {errorCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 border border-red-200 px-3 py-1 text-xs font-semibold text-red-600">
              <XCircle className="h-3.5 w-3.5" />
              {errorCount} {errorCount === 1 ? 'campo con error' : 'campos con error'}
            </span>
          )}
          {untestedCount > 0 && (
            <span className="text-xs text-slate-400">{untestedCount} sin probar</span>
          )}
        </div>
      )}

      {/* Table header */}
      <div className="rounded-t-xl border border-b-0 border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_180px] items-center gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Dato del sistema
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
            Hoja
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 w-16 text-center">
            Columna
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 w-16 text-center">
            Desde fila
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
            Último valor leído
          </span>
        </div>
      </div>

      {/* Rows grouped by category */}
      <div className="rounded-b-xl border border-t-0 border-slate-200 overflow-hidden -mt-5">
        {FIELD_CATEGORIES.map((category, idx) => {
          const fields = SYSTEM_FIELDS.filter(f => f.category === category);
          const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG['Identificadores'];
          const CatIcon = cfg.icon;

          return (
            <div key={category}>
              {/* Category separator */}
              <div className={cn(
                'flex items-center gap-2 px-5 py-2 border-b border-slate-100',
                idx > 0 && 'border-t border-slate-200',
                'bg-slate-50/80'
              )}>
                <span className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
                  cfg.color
                )}>
                  <CatIcon className="h-3 w-3" />
                  {category}
                </span>
                <span className="text-xs text-slate-400">
                  {fields.length} {fields.length === 1 ? 'campo' : 'campos'}
                </span>
              </div>

              {/* Fields */}
              {fields.map(field => {
                const binding = bindings.find(b => b.fieldId === field.id)!;
                return (
                  <FieldRow
                    key={field.id}
                    field={field}
                    binding={binding}
                    onChange={handleChange}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
