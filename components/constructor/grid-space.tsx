'use client';

import { useState } from 'react';
import { GridSpace as GridSpaceType, ChartComponent } from '@/lib/types/constructor';
import { ChartComponentPreview } from '@/components/constructor/chart-component-preview';
import { ChartPickerModal } from '@/components/constructor/chart-picker-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GridSpaceProps {
  space: GridSpaceType;
  onComponentAdd: (component: ChartComponent, columnIndex: number) => void;
  onComponentRemove: (componentId: string) => void;
  onComponentSelect?: (component: ChartComponent) => void;
  selectedComponentId?: string;
  className?: string;
}

export function GridSpace({
  space,
  onComponentAdd,
  onComponentRemove,
  onComponentSelect,
  selectedComponentId,
  className,
}: GridSpaceProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState(0);

  const componentsByColumn = space.components.reduce<Record<number, ChartComponent[]>>(
    (acc, comp) => {
      (acc[comp.columnIndex] ??= []).push(comp);
      return acc;
    },
    {}
  );

  function openPicker(columnIndex: number) {
    setTargetColumn(columnIndex);
    setPickerOpen(true);
  }

  function handleRemove(componentId: string) {
    if (window.confirm('¿Eliminar este gráfico?')) {
      onComponentRemove(componentId);
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'grid gap-4',
          space.columns === 1 && 'grid-cols-1',
          space.columns === 2 && 'grid-cols-1 md:grid-cols-2',
          space.columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        )}
      >
        {Array.from({ length: space.columns }).map((_, colIdx) => {
          const colComponents = componentsByColumn[colIdx] ?? [];
          const canAdd = colComponents.length < 3;

          return (
            <div key={colIdx} className="space-y-3">
              {/* Existing components */}
              {colComponents.map((component) => (
                <Card
                  key={component.id}
                  className={cn(
                    'relative group cursor-pointer transition-all duration-200',
                    selectedComponentId === component.id
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  )}
                  onClick={() => onComponentSelect?.(component)}
                >
                  {/* Remove button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(component.id);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <ChartComponentPreview component={component} />

                  {selectedComponentId === component.id && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                      Seleccionado
                    </div>
                  )}
                </Card>
              ))}

              {/* Add chart button */}
              {canAdd && (
                <button
                  onClick={() => openPicker(colIdx)}
                  className={cn(
                    'w-full min-h-24 rounded-lg border-2 border-dashed',
                    'border-muted-foreground/25 hover:border-orange-400 hover:bg-orange-50',
                    'flex flex-col items-center justify-center gap-2 transition-all',
                    'text-muted-foreground hover:text-orange-600'
                  )}
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs font-medium">Agregar gráfico</span>
                  {space.columns > 1 && (
                    <span className="text-xs opacity-60">Columna {colIdx + 1}</span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-center text-muted-foreground">
        {space.columns} columna{space.columns > 1 ? 's' : ''} · {space.components.length} gráfico{space.components.length !== 1 ? 's' : ''}
      </p>

      <ChartPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        columnIndex={targetColumn}
        onSelect={(component) => onComponentAdd(component, targetColumn)}
      />
    </div>
  );
}
