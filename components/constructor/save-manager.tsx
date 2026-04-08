'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download,
  Upload
} from 'lucide-react';
import { useConstructorStore } from '@/lib/state/constructor';
import { ReportPersistenceService } from '@/lib/services/report-persistence';
import { ReportSyncService } from '@/lib/services/report-sync';

interface SaveManagerProps {
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
}

export function SaveManager({ onSaveSuccess, onSaveError }: SaveManagerProps) {
  const {
    currentConfig,
    isSaving,
    error,
    validationErrors,
    saveConfig,
    clearError,
    autoSaveEnabled,
    enableAutoSave,
    disableAutoSave,
  } = useConstructorStore();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Handle save success
  useEffect(() => {
    if (!isSaving && !error && showConfirmDialog && currentConfig) {
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      setSaveMessage('Configuración guardada exitosamente');
      setLastSaveTime(new Date());
      
      // Broadcast configuration update for real-time sync
      ReportSyncService.broadcastConfigUpdate(currentConfig, 'config_updated');
      
      // Invalidate cache to force refresh in other views
      ReportSyncService.invalidateCache(currentConfig.clientId);
      
      onSaveSuccess?.();
    }
  }, [isSaving, error, showConfirmDialog, currentConfig, onSaveSuccess]);

  // Handle save error
  useEffect(() => {
    if (error) {
      setShowConfirmDialog(false);
      setShowErrorDialog(true);
      onSaveError?.(error);
    }
  }, [error, onSaveError]);

  const handleSave = async () => {
    if (!currentConfig) return;

    // Check for validation errors
    if (validationErrors.length > 0) {
      setShowErrorDialog(true);
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSave = async () => {
    try {
      await saveConfig();
    } catch (error) {
      // Error handling is done in the store
    }
  };

  const handleAutoSaveToggle = () => {
    if (autoSaveEnabled) {
      disableAutoSave();
    } else {
      enableAutoSave();
    }
  };

  const handleExport = async () => {
    try {
      const exportData = await ReportPersistenceService.exportConfigurations();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `energeia-report-configs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const result = await ReportPersistenceService.importConfigurations(text);
        
        if (result.success) {
          setSaveMessage(result.message);
          setShowSuccessDialog(true);
        } else {
          setSaveMessage(result.message);
          setShowErrorDialog(true);
        }
      } catch (error) {
        setSaveMessage('Error al importar configuraciones');
        setShowErrorDialog(true);
      }
    };
    input.click();
  };

  const canSave = currentConfig && !isSaving && validationErrors.length === 0;

  return (
    <div className="flex items-center gap-2">
      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={!canSave}
        className="flex items-center gap-2"
      >
        {isSaving ? (
          <Clock className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isSaving ? 'Guardando...' : 'Guardar'}
      </Button>

      {/* Auto-save Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAutoSaveToggle}
        className="flex items-center gap-2"
      >
        <Clock className="h-4 w-4" />
        Auto-guardado
        <Badge variant={autoSaveEnabled ? "default" : "secondary"}>
          {autoSaveEnabled ? 'ON' : 'OFF'}
        </Badge>
      </Button>

      {/* Export/Import */}
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          title="Exportar configuraciones"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleImport}
          title="Importar configuraciones"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>

      {/* Last Save Time */}
      {lastSaveTime && (
        <div className="text-sm text-muted-foreground">
          Último guardado: {lastSaveTime.toLocaleTimeString()}
        </div>
      )}

      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {validationErrors.length} error(es) de validación. 
            Corrige los errores antes de guardar.
          </AlertDescription>
        </Alert>
      )}

      {/* Confirm Save Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Guardado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres guardar la configuración actual?
              {currentConfig?.clientId 
                ? ` Esta configuración será específica para el cliente ${currentConfig.clientId}.`
                : ' Esta será la configuración global por defecto.'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Clock className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Guardado Exitoso
            </DialogTitle>
            <DialogDescription>
              {saveMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={(open) => {
        setShowErrorDialog(open);
        if (!open) {
          clearError();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Error al Guardar
            </DialogTitle>
            <DialogDescription>
              {error || saveMessage}
            </DialogDescription>
          </DialogHeader>
          
          {validationErrors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Errores de validación:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.map((err, index) => (
                  <li key={index} className="text-red-600">
                    {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowErrorDialog(false);
                clearError();
              }}
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}