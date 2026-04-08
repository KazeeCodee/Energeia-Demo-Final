'use client';

import { GridSpace as GridSpaceType, ChartComponent, GridPosition } from '@/lib/types/constructor';
import { GridSpace } from '@/components/constructor/grid-space';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Column layout picker ───────────────────────────────────────────────────

function ColumnLayoutIcon({ columns }: { columns: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5 w-9 h-5">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1 rounded-[2px] bg-current opacity-70" />
      ))}
    </div>
  );
}

interface LayoutButtonProps {
  columns: 1 | 2 | 3;
  label: string;
  onClick: () => void;
}

function LayoutButton({ columns, label, onClick }: LayoutButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-5 py-4',
        'border-slate-200 text-slate-400 bg-white',
        'hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50',
        'transition-all duration-150 cursor-pointer'
      )}
    >
      <ColumnLayoutIcon columns={columns} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface DesignCanvasProps {
  spaces: GridSpaceType[];
  onAddSpace: (columns: 1 | 2 | 3) => void;
  onRemoveSpace: (spaceId: string) => void;
  onMoveSpaceUp: (spaceId: string) => void;
  onMoveSpaceDown: (spaceId: string) => void;
  onComponentAdd: (component: ChartComponent, position: GridPosition) => void;
  onComponentRemove: (componentId: string) => void;
  onComponentSelect?: (component: ChartComponent) => void;
  selectedComponentId?: string;
  className?: string;
}

export function DesignCanvas({
  spaces,
  onAddSpace,
  onRemoveSpace,
  onMoveSpaceUp,
  onMoveSpaceDown,
  onComponentAdd,
  onComponentRemove,
  onComponentSelect,
  selectedComponentId,
  className,
}: DesignCanvasProps) {
  const sorted = [...spaces].sort((a, b) => a.order - b.order);

  function handleRemoveSpace(spaceId: string) {
    const space = spaces.find(s => s.id === spaceId);
    if (space?.components.length) {
      if (!window.confirm('Esta sección tiene gráficos. ¿Eliminarla igualmente?')) return;
    }
    onRemoveSpace(spaceId);
  }

  return (
    <div className={cn('space-y-4', className)}>

      {/* ── Add section bar ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Agregar sección
          </p>
          <div className="flex gap-3 flex-wrap">
            <LayoutButton columns={1} label="1 columna"   onClick={() => onAddSpace(1)} />
            <LayoutButton columns={2} label="2 columnas"  onClick={() => onAddSpace(2)} />
            <LayoutButton columns={3} label="3 columnas"  onClick={() => onAddSpace(3)} />
          </div>
        </div>
        <p className="px-5 pb-3 text-xs text-slate-400">
          Cada sección es una fila del informe. Podés agregar tantas como necesites.
        </p>
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {sorted.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
            <ColumnLayoutIcon columns={2} />
          </div>
          <p className="text-sm font-medium text-slate-500">El informe está vacío</p>
          <p className="text-xs text-slate-400 mt-1">Seleccioná un layout arriba para empezar</p>
        </div>
      )}

      {/* ── Sections ─────────────────────────────────────────────────────── */}
      {sorted.map((space, index) => (
        <div
          key={space.id}
          className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
        >
          {/* Section header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-0.5 w-6 h-3.5 text-slate-400">
                {Array.from({ length: space.columns }).map((_, i) => (
                  <div key={i} className="flex-1 rounded-[2px] bg-current" />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-700">
                Sección {index + 1}
              </span>
              <span className="text-xs text-slate-400">
                {space.columns} columna{space.columns > 1 ? 's' : ''}
              </span>
              {space.components.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                  {space.components.length} gráfico{space.components.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                disabled={index === 0}
                onClick={() => onMoveSpaceUp(space.id)}
                title="Subir sección"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                disabled={index === sorted.length - 1}
                onClick={() => onMoveSpaceDown(space.id)}
                title="Bajar sección"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 ml-1"
                onClick={() => handleRemoveSpace(space.id)}
                title="Eliminar sección"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Section content */}
          <div className="p-4">
            <GridSpace
              space={space}
              onComponentAdd={(component, columnIndex) =>
                onComponentAdd(component, { spaceId: space.id, columnIndex })
              }
              onComponentRemove={onComponentRemove}
              onComponentSelect={onComponentSelect}
              selectedComponentId={selectedComponentId}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
