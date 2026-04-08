'use client';

import { useState, useMemo } from 'react';
import { ExcelDocument, ExcelColumn, ExcelFieldType } from '@/lib/types/mapper';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Copy, Check, Hash, Calendar, Type, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Type badge ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ExcelFieldType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  number:  { label: 'Número',  icon: Hash,     color: 'bg-blue-100 text-blue-700 border-blue-200'   },
  date:    { label: 'Fecha',   icon: Calendar, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  text:    { label: 'Texto',   icon: Type,     color: 'bg-green-100 text-green-700 border-green-200' },
  empty:   { label: 'Vacío',   icon: Minus,    color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

function TypeBadge({ type }: { type: ExcelFieldType }) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ── Copy button ────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
      title="Copiar ruta"
    >
      {copied
        ? <Check className="h-3.5 w-3.5 text-green-500" />
        : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Sheet table ────────────────────────────────────────────────────────────

function SheetTable({ doc, sheetName }: { doc: ExcelDocument; sheetName: string }) {
  const sheet = doc.sheets.find(s => s.name === sheetName);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ExcelFieldType | 'all'>('all');

  const columns: ExcelColumn[] = sheet?.columns ?? [];

  const filtered = useMemo(() => {
    return columns.filter(col => {
      const matchSearch = !search
        || col.path.toLowerCase().includes(search.toLowerCase())
        || col.columnName.toLowerCase().includes(search.toLowerCase())
        || col.sampleValue.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || col.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [columns, search, typeFilter]);

  const stats = useMemo(() => {
    const counts: Record<ExcelFieldType, number> = { number: 0, date: 0, text: 0, empty: 0 };
    columns.forEach(c => counts[c.type]++);
    return counts;
  }, [columns]);

  if (!sheet) return null;

  return (
    <div className="space-y-3">
      {/* Info bar */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="rounded-md bg-slate-100 px-2 py-1 font-medium">
          {sheet.columns.length} columnas
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-1 font-medium">
          {sheet.dataRows.toLocaleString('es-AR')} filas de datos
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-1 font-medium">
          {sheet.headerRows} fila{sheet.headerRows !== 1 ? 's' : ''} de encabezado
        </span>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('all')}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
            typeFilter === 'all'
              ? 'border-orange-400 bg-orange-50 text-orange-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          )}
        >
          Todas ({columns.length})
        </button>
        {(Object.entries(stats) as [ExcelFieldType, number][])
          .filter(([, count]) => count > 0)
          .map(([type, count]) => {
            const cfg = TYPE_CONFIG[type];
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                  typeFilter === type
                    ? cn('border-current', cfg.color)
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                )}
              >
                <Icon className="h-3 w-3" />
                {cfg.label} ({count})
              </button>
            );
          })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar por columna, encabezado o valor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-[auto_2fr_1fr_auto] text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200 px-4 py-2.5 gap-3">
          <span>Col</span>
          <span>Encabezado / Ruta</span>
          <span>Valor de ejemplo</span>
          <span className="text-right pr-1">Tipo</span>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              No hay columnas que coincidan con la búsqueda
            </div>
          ) : (
            filtered.map(col => (
              <div
                key={col.index}
                className="group grid grid-cols-[auto_2fr_1fr_auto] items-center px-4 py-2 hover:bg-slate-50 transition-colors gap-3"
              >
                {/* Column letter badge */}
                <span className="inline-flex items-center justify-center w-7 h-6 rounded bg-slate-100 text-xs font-mono font-semibold text-slate-600 flex-shrink-0">
                  {col.letter}
                </span>

                {/* Path */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs text-slate-700 truncate" title={col.path}>
                    {col.path}
                  </span>
                  <CopyButton text={col.path} />
                </div>

                {/* Sample value */}
                <span className="text-xs text-slate-500 truncate pr-3">
                  {col.sampleValue || <span className="italic text-slate-300">—</span>}
                </span>

                <TypeBadge type={col.type} />
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-right">
        Mostrando {filtered.length} de {columns.length} columnas
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface XmlStructureTableProps {
  documents: ExcelDocument[];
}

export function XmlStructureTable({ documents }: XmlStructureTableProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
        <p className="text-sm text-slate-400">Subí un Excel para explorar su estructura</p>
      </div>
    );
  }

  const doc = documents[0];

  // Single sheet: no tabs needed
  if (doc.sheets.length === 1) {
    return <SheetTable doc={doc} sheetName={doc.sheets[0].name} />;
  }

  return (
    <Tabs defaultValue={doc.sheets[0].name}>
      <TabsList className="mb-4 flex-wrap h-auto gap-1">
        {doc.sheets.map(sheet => (
          <TabsTrigger key={sheet.name} value={sheet.name} className="text-xs">
            {sheet.name}
            <span className="ml-1.5 text-slate-400">({sheet.columns.length})</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {doc.sheets.map(sheet => (
        <TabsContent key={sheet.name} value={sheet.name}>
          <SheetTable doc={doc} sheetName={sheet.name} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
