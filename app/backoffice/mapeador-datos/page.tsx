'use client';

import { useState, useRef } from 'react';
import { ColumnBinding } from '@/lib/types/mapper';
import { SYSTEM_FIELDS } from '@/lib/data/system-fields';
import { FieldMappingTable } from '@/components/mapeador/field-mapping-table';
import { parseExcelFile } from '@/lib/utils/excel-parser';
import { Button } from '@/components/ui/button';
import {
  Map, Save, ChevronLeft, CheckCircle2, XCircle,
  Upload, Loader2, FlaskConical,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Default bindings — pre-loaded so the demo looks functional ─────────────

function buildDefaultBindings(): ColumnBinding[] {
  return SYSTEM_FIELDS.map(f => ({
    fieldId:    f.id,
    sheet:      f.defaultSheet,
    column:     f.defaultColumn,
    startRow:   f.defaultStartRow,
    lastValue:  undefined,
    lastStatus: undefined,
    updatedAt:  new Date('2026-02-05T09:00:00'),
  }));
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function MapeadorDatosPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bindings, setBindings] = useState<ColumnBinding[]>(buildDefaultBindings);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [lastTestedFile, setLastTestedFile] = useState<string | null>(null);

  const okCount    = bindings.filter(b => b.lastStatus === 'ok').length;
  const errorCount = bindings.filter(b => b.lastStatus === 'error').length;
  const hasErrors  = errorCount > 0;
  const wasTested  = bindings.some(b => b.lastStatus !== undefined);

  // ── Actions ──────────────────────────────────────────────────────────────

  function handleSave() {
    setSaved(true);
    toast.success('Configuración guardada', {
      description: `${SYSTEM_FIELDS.length} campos configurados correctamente`,
    });
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleTestFile(file: File) {
    setTesting(true);
    try {
      const doc = await parseExcelFile(file);

      const updated = bindings.map(b => {
        const sheet = doc.sheets.find(s => s.name === b.sheet);
        const col   = sheet?.columns.find(c => c.letter === b.column);
        const ok       = !!col && col.type !== 'empty';

        return {
          ...b,
          lastStatus: ok ? ('ok' as const) : ('error' as const),
          lastValue:  ok ? col!.sampleValue : undefined,
          updatedAt:  new Date(),
        };
      });

      setBindings(updated);
      setLastTestedFile(file.name);

      const newOk    = updated.filter(b => b.lastStatus === 'ok').length;
      const newError = updated.filter(b => b.lastStatus === 'error').length;

      if (newError === 0) {
        toast.success('Prueba exitosa', {
          description: `Los ${newOk} campos se leyeron correctamente`,
        });
      } else {
        toast.warning(`${newError} campo${newError !== 1 ? 's' : ''} con problemas`, {
          description: 'Revisá las columnas marcadas en rojo',
        });
      }
    } catch {
      toast.error('No se pudo leer el archivo');
    } finally {
      setTesting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400" />
        <div className="px-6 py-5">

          {/* Breadcrumb */}
          <button
            onClick={() => router.push('/backoffice/configuracion')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-3"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Volver a Configuración
          </button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
                <Map className="h-4.5 w-4.5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Origen de datos</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Indicá en qué columna del Excel está cada dato que usa el sistema
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saved}
              size="sm"
              className={cn(
                'gap-2 flex-shrink-0',
                saved
                  ? 'bg-green-500 hover:bg-green-500 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              )}
            >
              {saved
                ? <><CheckCircle2 className="h-4 w-4" />Guardado</>
                : <><Save className="h-4 w-4" />Guardar</>}
            </Button>
          </div>

          {/* Status after test */}
          {wasTested && (
            <div className={cn(
              'mt-4 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium',
              hasErrors
                ? 'bg-red-50 border border-red-200 text-red-700'
                : 'bg-green-50 border border-green-200 text-green-700'
            )}>
              {hasErrors
                ? <XCircle className="h-4 w-4 flex-shrink-0" />
                : <CheckCircle2 className="h-4 w-4 flex-shrink-0" />}
              <span>
                {hasErrors
                  ? `${errorCount} campo${errorCount !== 1 ? 's' : ''} no se encontró en "${lastTestedFile}" — revisá las filas en rojo`
                  : `Prueba OK — los ${okCount} campos se leyeron correctamente desde "${lastTestedFile}"`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
        <FieldMappingTable
          bindings={bindings}
          onBindingsChange={setBindings}
        />
      </div>

      {/* ── Probar con archivo ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4">
          <p className="text-sm font-semibold text-slate-800">Probar con un archivo</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Subí el Excel de CAMMESA para verificar que todas las columnas configuradas
            se lean correctamente. Si cambiaron alguna columna, lo vas a ver al instante.
          </p>
        </div>

        <div
          onClick={() => !testing && fileInputRef.current?.click()}
          className={cn(
            'mx-5 mb-5 cursor-pointer rounded-xl border-2 border-dashed px-6 py-7 text-center transition-all',
            testing
              ? 'border-orange-300 bg-orange-50 cursor-wait'
              : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleTestFile(e.target.files[0])}
          />
          {testing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
              <span className="text-sm text-slate-500">Leyendo archivo...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <Upload className="h-4 w-4 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">
                Arrastrá o hacé click para subir el Excel
              </p>
              <p className="text-xs text-slate-400">Archivos .xlsx o .xls</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer save ────────────────────────────────────────────────── */}
      <div className="flex justify-end pb-6">
        <Button
          onClick={handleSave}
          disabled={saved}
          className={cn(
            'gap-2',
            saved
              ? 'bg-green-500 hover:bg-green-500 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          )}
        >
          {saved
            ? <><CheckCircle2 className="h-4 w-4" />Cambios guardados</>
            : <><Save className="h-4 w-4" />Guardar cambios</>}
        </Button>
      </div>
    </div>
  );
}
