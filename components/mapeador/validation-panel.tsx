'use client';

import { useState, useRef } from 'react';
import { FieldMapping, ValidationRun, ValidationResult } from '@/lib/types/mapper';
import { validateColumns } from '@/lib/utils/excel-parser';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2, XCircle, Upload, Loader2, FileSpreadsheet,
  ChevronDown, ChevronUp, ShieldCheck, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationPanelProps {
  mappings: FieldMapping[];
}

function StatusIcon({ status }: { status: ValidationResult['status'] }) {
  if (status === 'ok') return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
  return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
}

export function ValidationPanel({ mappings }: ValidationPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<ValidationRun | null>(null);
  const [expanded, setExpanded] = useState(true);

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      setError('Solo se aceptan archivos .xlsx o .xls');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const checkResults = await validateColumns(file, mappings.map(m => ({
        mappingId:    m.id,
        targetLabel:  m.targetLabel,
        sourcePath:   m.sourcePath,
        sourceSheet:  m.sourceSheet,
        sourceColumn: m.sourceColumn,
      })));

      const results: ValidationResult[] = mappings.map(m => {
        const check = checkResults.get(m.id);
        return {
          mappingId:    m.id,
          targetLabel:  m.targetLabel,
          sourcePath:   m.sourcePath,
          sourceColumn: m.sourceColumn,
          sourceSheet:  m.sourceSheet,
          status:       check?.found ? 'ok' : 'missing',
          foundValue:   check?.value,
          message:      check?.found
            ? `Encontrado: "${check.value}"`
            : 'Columna no encontrada en el archivo',
        };
      });

      setRun({
        id:           `${Date.now()}`,
        fileName:     file.name,
        runAt:        new Date(),
        results,
        totalOk:      results.filter(r => r.status === 'ok').length,
        totalMissing: results.filter(r => r.status === 'missing').length,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  }

  if (mappings.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 py-10 text-center">
        <p className="text-sm text-slate-400">
          Primero definí mapeos para poder validar archivos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onClick={() => !loading && inputRef.current?.click()}
        className={cn(
          'group cursor-pointer rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all',
          'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
            <span className="text-sm">Validando...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
              <Upload className="h-4 w-4 text-slate-400 group-hover:text-orange-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Subí un Excel para validar</p>
            <p className="text-xs text-slate-400">
              Se verificará que los {mappings.length} mapeos definidos sigan funcionando
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {run && (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div
            className={cn(
              'flex items-center justify-between px-4 py-3 border-b border-slate-100 cursor-pointer',
              run.totalMissing === 0 ? 'bg-green-50' : 'bg-red-50'
            )}
            onClick={() => setExpanded(e => !e)}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className={cn('h-5 w-5', run.totalMissing === 0 ? 'text-green-500' : 'text-red-400')} />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Validación: <span className="font-mono text-xs font-normal text-slate-500">{run.fileName}</span>
                </p>
                <p className={cn('text-xs font-medium mt-0.5', run.totalMissing === 0 ? 'text-green-700' : 'text-red-600')}>
                  {run.totalMissing === 0
                    ? `✓ Todos los ${run.totalOk} mapeos son válidos`
                    : `${run.totalOk} OK · ${run.totalMissing} con problemas`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {run.totalOk > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 border border-green-200 px-2 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-3 w-3" /> {run.totalOk}
                  </span>
                )}
                {run.totalMissing > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-700">
                    <XCircle className="h-3 w-3" /> {run.totalMissing}
                  </span>
                )}
              </div>
              {expanded
                ? <ChevronUp className="h-4 w-4 text-slate-400" />
                : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </div>
          </div>

          {/* Detail rows */}
          {expanded && (
            <div className="divide-y divide-slate-100">
              {run.results.map(r => (
                <div
                  key={r.mappingId}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3',
                    r.status === 'missing' && 'bg-red-50/50'
                  )}
                >
                  <StatusIcon status={r.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{r.targetLabel}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center justify-center w-5 h-4 rounded bg-slate-100 text-xs font-mono font-semibold text-slate-600">
                        {r.sourceColumn}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Layers className="h-3 w-3" />
                        {r.sourceSheet}
                      </div>
                      <span className="text-xs text-slate-400 truncate max-w-xs" title={r.sourcePath}>
                        {r.sourcePath}
                      </span>
                    </div>
                    {r.status === 'ok' && r.foundValue && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Valor: <span className="text-slate-600">{r.foundValue}</span>
                      </p>
                    )}
                    {r.status === 'missing' && (
                      <p className="text-xs text-red-500 font-medium mt-0.5">
                        Columna no encontrada en el archivo
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-right">
            <span className="text-xs text-slate-400">
              {run.runAt.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
