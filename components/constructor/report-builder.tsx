'use client';

import { useEffect, useState, useCallback } from 'react';
import { useConstructorStore } from '@/lib/state/constructor';
import { ChartComponent, GridPosition } from '@/lib/types/constructor';
import { DesignCanvas } from './design-canvas';
import { ChartComponentConfig } from './chart-component-config';
import { ClientSelector } from './client-selector';
import { ConfigStatus } from './config-status';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, LayoutTemplate } from 'lucide-react';
import { SaveManager } from './save-manager';

export function ReportBuilder() {
  const {
    currentConfig,
    isLoading,
    error,
    availableDataSources,
    createNewConfig,
    addGridSpace,
    removeGridSpace,
    reorderGridSpaces,
    removeComponent,
    updateComponent,
    clearError,
    addComponent,
  } = useConstructorStore();

  const [selectedComponent, setSelectedComponent] = useState<ChartComponent | null>(null);

  useEffect(() => {
    if (!currentConfig) createNewConfig();
  }, [currentConfig, createNewConfig]);

  // ── Space handlers ──────────────────────────────────────────────────────

  const handleAddSpace = useCallback(
    (columns: 1 | 2 | 3) => addGridSpace(columns),
    [addGridSpace]
  );

  const handleRemoveSpace = useCallback(
    (spaceId: string) => removeGridSpace(spaceId),
    [removeGridSpace]
  );

  const handleMoveSpaceUp = useCallback(
    (spaceId: string) => {
      if (!currentConfig) return;
      const sorted = [...currentConfig.spaces].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(s => s.id === spaceId);
      if (idx <= 0) return;
      const ids = sorted.map(s => s.id);
      [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
      reorderGridSpaces(ids);
    },
    [currentConfig, reorderGridSpaces]
  );

  const handleMoveSpaceDown = useCallback(
    (spaceId: string) => {
      if (!currentConfig) return;
      const sorted = [...currentConfig.spaces].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex(s => s.id === spaceId);
      if (idx < 0 || idx >= sorted.length - 1) return;
      const ids = sorted.map(s => s.id);
      [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
      reorderGridSpaces(ids);
    },
    [currentConfig, reorderGridSpaces]
  );

  // ── Component handlers ──────────────────────────────────────────────────

  const handleAddComponent = useCallback(
    (component: ChartComponent, position: GridPosition) => {
      try {
        addComponent(position.spaceId, position.columnIndex, component);
      } catch (err) {
        console.error('Error al agregar componente:', err);
      }
    },
    [addComponent]
  );

  const handleRemoveComponent = useCallback(
    (componentId: string) => {
      if (selectedComponent?.id === componentId) setSelectedComponent(null);
      removeComponent(componentId);
    },
    [selectedComponent?.id, removeComponent]
  );

  const handleConfigChange = (componentId: string, updates: Partial<ChartComponent>) => {
    updateComponent(componentId, updates);
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handlePreview = () => {
    if (!currentConfig) return;
    try {
      const configData = encodeURIComponent(JSON.stringify(currentConfig));
      const w = window.open(`/preview-informe?config=${configData}`, '_blank');
      if (!w) alert('Permite las ventanas emergentes para ver la vista previa');
    } catch {
      alert('Error al abrir la vista previa.');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        <span className="text-sm">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-full">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200">
        {/* Top accent strip */}
        <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400" />

        <div className="bg-white px-6 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0">
                <LayoutTemplate className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  Constructor de Informes
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Agrega secciones, elige los gráficos y personaliza cada uno
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="default"
                size="sm"
                onClick={handlePreview}
                disabled={!currentConfig || currentConfig.spaces.length === 0}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm gap-2"
              >
                <Eye className="h-4 w-4" />
                Vista Previa
              </Button>
            </div>
          </div>
        </div>

        {/* Controls bar */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <ClientSelector onClientChange={() => {}} />
          </div>
          <div className="flex-shrink-0">
            <SaveManager onSaveSuccess={() => {}} onSaveError={() => {}} />
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
          <Button variant="ghost" size="sm" onClick={clearError} className="text-red-600 hover:text-red-700 hover:bg-red-100 h-7 px-2">
            Cerrar
          </Button>
        </div>
      )}

      {/* Config status */}
      <ConfigStatus />

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      {currentConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Canvas */}
          <div className={selectedComponent ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <DesignCanvas
              spaces={currentConfig.spaces}
              onAddSpace={handleAddSpace}
              onRemoveSpace={handleRemoveSpace}
              onMoveSpaceUp={handleMoveSpaceUp}
              onMoveSpaceDown={handleMoveSpaceDown}
              onComponentAdd={handleAddComponent}
              onComponentRemove={handleRemoveComponent}
              onComponentSelect={setSelectedComponent}
              selectedComponentId={selectedComponent?.id}
            />
          </div>

          {/* Config panel */}
          {selectedComponent && (
            <div className="lg:col-span-4">
              <div className="sticky top-5">
                <ChartComponentConfig
                  component={selectedComponent}
                  availableDataSources={availableDataSources}
                  onConfigChange={handleConfigChange}
                  onClose={() => setSelectedComponent(null)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
