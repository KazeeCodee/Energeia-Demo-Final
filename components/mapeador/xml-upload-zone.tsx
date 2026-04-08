'use client';

import { useRef, useState } from 'react';
import { ExcelDocument } from '@/lib/types/mapper';
import { parseExcelFile } from '@/lib/utils/excel-parser';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, X, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExcelUploadZoneProps {
  documents: ExcelDocument[];
  onDocumentsChange: (docs: ExcelDocument[]) => void;
}

export function XmlUploadZone({ documents, onDocumentsChange }: ExcelUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function processFiles(files: FileList | File[]) {
    setError(null);
    setLoading(true);

    const arr = Array.from(files).filter(f =>
      f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls')
    );

    if (arr.length === 0) {
      setError('Solo se aceptan archivos .xlsx o .xls');
      setLoading(false);
      return;
    }

    const newDocs: ExcelDocument[] = [];
    const errors: string[] = [];

    for (const file of arr) {
      if (documents.some(d => d.fileName === file.name)) continue;

      try {
        const doc = await parseExcelFile(file);
        newDocs.push(doc);
      } catch (e) {
        errors.push(e instanceof Error ? e.message : `Error en ${file.name}`);
      }
    }

    if (errors.length) setError(errors.join(' · '));
    if (newDocs.length) onDocumentsChange([...documents, ...newDocs]);
    setLoading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  }

  function removeDoc(id: string) {
    onDocumentsChange(documents.filter(d => d.id !== id));
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'group relative cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all',
          dragOver
            ? 'border-orange-400 bg-orange-50'
            : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          multiple
          className="hidden"
          onChange={e => e.target.files && processFiles(e.target.files)}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
            <span className="text-sm">Procesando archivo...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
              dragOver ? 'bg-orange-100' : 'bg-white border border-slate-200 group-hover:bg-orange-50'
            )}>
              <Upload className={cn('h-5 w-5', dragOver ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-400')} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                {dragOver ? 'Soltá el archivo aquí' : 'Arrastrá o hacé click para subir un Excel'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Archivos .xlsx o .xls — se detectan las hojas y encabezados automáticamente
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Uploaded files list */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Archivos cargados
          </p>
          {documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileSpreadsheet className="h-4 w-4 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{doc.fileName}</p>
                  <p className="text-xs text-slate-400">
                    {doc.sheets.length} {doc.sheets.length === 1 ? 'hoja' : 'hojas'} ·{' '}
                    {doc.totalColumns} columnas ·{' '}
                    {doc.sheets.map(s => s.name).join(', ')}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                onClick={() => removeDoc(doc.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
