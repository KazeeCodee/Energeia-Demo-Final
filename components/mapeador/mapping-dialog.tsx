'use client';

import { useState, useEffect } from 'react';
import { FieldMapping, ExcelDocument, ExcelFieldType } from '@/lib/types/mapper';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface MappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: ExcelDocument[];
  editing: FieldMapping | null;
  onSave: (mapping: Omit<FieldMapping, 'id' | 'createdAt'>) => void;
}

const DATA_TYPES: { value: ExcelFieldType; label: string }[] = [
  { value: 'number', label: 'Número' },
  { value: 'text',   label: 'Texto'  },
  { value: 'date',   label: 'Fecha'  },
];

const EMPTY: Omit<FieldMapping, 'id' | 'createdAt'> = {
  targetField:    '',
  targetLabel:    '',
  description:    '',
  sourcePath:     '',
  sourceColumn:   '',
  sourceSheet:    '',
  sourceFileName: '',
  dataType:       'number',
};

export function MappingDialog({
  open, onOpenChange, documents, editing, onSave,
}: MappingDialogProps) {
  const [form, setForm] = useState(EMPTY);
  const [colSearch, setColSearch] = useState('');

  useEffect(() => {
    if (editing) {
      setForm({
        targetField:    editing.targetField,
        targetLabel:    editing.targetLabel,
        description:    editing.description,
        sourcePath:     editing.sourcePath,
        sourceColumn:   editing.sourceColumn,
        sourceSheet:    editing.sourceSheet,
        sourceFileName: editing.sourceFileName,
        dataType:       editing.dataType,
      });
    } else {
      setForm(EMPTY);
    }
    setColSearch('');
  }, [editing, open]);

  function set<K extends keyof typeof EMPTY>(key: K, value: typeof EMPTY[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const selectedDoc = documents.find(d => d.fileName === form.sourceFileName);
  const selectedSheet = selectedDoc?.sheets.find(s => s.name === form.sourceSheet);

  const filteredColumns = selectedSheet
    ? selectedSheet.columns
        .filter(c => c.type !== 'empty')
        .filter(c =>
          !colSearch
          || c.path.toLowerCase().includes(colSearch.toLowerCase())
          || c.columnName.toLowerCase().includes(colSearch.toLowerCase())
        )
        .slice(0, 100)
    : [];

  function handleSave() {
    if (!form.targetLabel || !form.sourcePath || !form.sourceFileName) return;

    const targetField = form.targetField.trim()
      || form.targetLabel.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '');

    onSave({ ...form, targetField });
    onOpenChange(false);
  }

  const isValid = form.targetLabel.trim() && form.sourcePath && form.sourceFileName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar mapeo' : 'Nuevo mapeo'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Label */}
          <div>
            <Label htmlFor="mp-label" className="text-sm">
              Nombre del campo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mp-label"
              placeholder="ej: Energía Generada Inicial"
              value={form.targetLabel}
              onChange={e => set('targetLabel', e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="mp-desc" className="text-sm">Descripción</Label>
            <Input
              id="mp-desc"
              placeholder="Para qué se usa este dato"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Data type */}
          <div>
            <Label className="text-sm">Tipo de dato</Label>
            <Select value={form.dataType} onValueChange={v => set('dataType', v as ExcelFieldType)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATA_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source file */}
          <div>
            <Label className="text-sm">
              Archivo de origen <span className="text-red-500">*</span>
            </Label>
            {documents.length === 0 ? (
              <p className="mt-1 text-sm text-slate-400 italic">
                Primero subí un archivo Excel en la pestaña Explorador
              </p>
            ) : (
              <Select
                value={form.sourceFileName}
                onValueChange={v => {
                  set('sourceFileName', v);
                  set('sourceSheet', '');
                  set('sourcePath', '');
                  set('sourceColumn', '');
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar archivo" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map(d => (
                    <SelectItem key={d.id} value={d.fileName}>{d.fileName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Source sheet */}
          {selectedDoc && (
            <div>
              <Label className="text-sm">
                Hoja <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.sourceSheet}
                onValueChange={v => {
                  set('sourceSheet', v);
                  set('sourcePath', '');
                  set('sourceColumn', '');
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seleccionar hoja" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDoc.sheets.map(s => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.name} ({s.columns.length} cols · {s.dataRows.toLocaleString('es-AR')} filas)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Source column */}
          {selectedSheet && (
            <div>
              <Label className="text-sm">
                Columna <span className="text-red-500">*</span>
              </Label>
              <div className="mt-1 space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Filtrar columnas..."
                    value={colSearch}
                    onChange={e => setColSearch(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>

                {/* Selected column display */}
                {form.sourcePath && (
                  <div className="rounded-md border border-orange-300 bg-orange-50 px-3 py-2">
                    <p className="text-xs text-orange-600 font-medium mb-0.5">Seleccionada:</p>
                    <span className="text-xs font-mono text-orange-800">{form.sourcePath}</span>
                    <span className="ml-2 text-xs text-orange-500">(col. {form.sourceColumn})</span>
                  </div>
                )}

                {/* Column list */}
                <div className="rounded-md border border-slate-200 max-h-44 overflow-y-auto divide-y divide-slate-100">
                  {filteredColumns.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">Sin resultados</p>
                  ) : (
                    filteredColumns.map(col => (
                      <button
                        key={col.index}
                        onClick={() => {
                          set('sourcePath', col.path);
                          set('sourceColumn', col.letter);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-orange-50 transition-colors flex items-center gap-2.5 ${
                          form.sourcePath === col.path ? 'bg-orange-50' : ''
                        }`}
                      >
                        <span className="flex-shrink-0 w-6 h-5 rounded bg-slate-100 text-xs font-mono font-semibold text-slate-600 flex items-center justify-center">
                          {col.letter}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs text-slate-700 block truncate">{col.path}</span>
                          {col.sampleValue && (
                            <span className="text-xs text-slate-400 truncate block">
                              {col.sampleValue}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {editing ? 'Guardar cambios' : 'Crear mapeo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
