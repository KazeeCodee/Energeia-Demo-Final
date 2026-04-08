'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Globe, 
  Copy, 
  AlertCircle, 
  CheckCircle,
  Trash2
} from 'lucide-react';
import { useConstructorStore } from '@/lib/state/constructor';
import { ReportPersistenceService } from '@/lib/services/report-persistence';

interface ClientInfo {
  id: string;
  name: string;
  hasCustomConfig: boolean;
}

interface ClientSelectorProps {
  onClientChange?: (clientId?: string) => void;
}

export function ClientSelector({ onClientChange }: ClientSelectorProps) {
  const {
    selectedClientId,
    currentConfig,
    setSelectedClient,
    loadClientConfig,
    createNewConfig,
    getAvailableClients,
  } = useConstructorStore();

  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load client configurations status on mount
  useEffect(() => {
    loadClientConfigStatus();
  }, []);

  const loadClientConfigStatus = async () => {
    try {
      const clientsWithStatus = await getAvailableClients();
      setClients(clientsWithStatus);
    } catch (error) {
      console.warn('Error loading client config status:', error);
    }
  };

  const handleClientChange = async (value: string) => {
    const clientId = value === 'global' ? undefined : value;
    
    try {
      setSelectedClient(clientId);
      await loadClientConfig(clientId);
      onClientChange?.(clientId);
    } catch (error) {
      console.error('Error changing client:', error);
      setMessage({ type: 'error', text: 'Error al cambiar de cliente' });
    }
  };

  const handleCreateCustomConfig = () => {
    if (!selectedClientId) return;
    
    createNewConfig(selectedClientId);
    setMessage({ 
      type: 'success', 
      text: `Configuración personalizada creada para ${getClientName(selectedClientId)}` 
    });
    
    // Update client status
    setClients(prev => prev.map(client => 
      client.id === selectedClientId 
        ? { ...client, hasCustomConfig: true }
        : client
    ));
  };

  const handleDuplicateFromGlobal = async () => {
    if (!selectedClientId) return;

    setIsProcessing(true);
    try {
      const result = await ReportPersistenceService.duplicateConfig(undefined, selectedClientId);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        await loadClientConfig(selectedClientId);
        
        // Update client status
        setClients(prev => prev.map(client => 
          client.id === selectedClientId 
            ? { ...client, hasCustomConfig: true }
            : client
        ));
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al duplicar configuración' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicateToClient = async () => {
    if (!duplicateTarget || !selectedClientId) return;

    setIsProcessing(true);
    try {
      const result = await ReportPersistenceService.duplicateConfig(selectedClientId, duplicateTarget);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setShowDuplicateDialog(false);
        
        // Update client status
        setClients(prev => prev.map(client => 
          client.id === duplicateTarget 
            ? { ...client, hasCustomConfig: true }
            : client
        ));
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al duplicar configuración' });
    } finally {
      setIsProcessing(false);
      setDuplicateTarget('');
    }
  };

  const handleDeleteCustomConfig = async () => {
    if (!selectedClientId) return;

    setIsProcessing(true);
    try {
      const result = await ReportPersistenceService.deleteConfig(selectedClientId);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setShowDeleteDialog(false);
        
        // Load global config as fallback
        await loadClientConfig(selectedClientId);
        
        // Update client status
        setClients(prev => prev.map(client => 
          client.id === selectedClientId 
            ? { ...client, hasCustomConfig: false }
            : client
        ));
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al eliminar configuración' });
    } finally {
      setIsProcessing(false);
    }
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || clientId;
  };

  const getCurrentClient = () => {
    return clients.find(c => c.id === selectedClientId);
  };

  const currentClient = getCurrentClient();
  const hasCustomConfig = currentClient?.hasCustomConfig || false;
  const isGlobalSelected = !selectedClientId;

  return (
    <div className="space-y-4">
      {/* Client Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isGlobalSelected ? (
            <Globe className="h-4 w-4 text-blue-600" />
          ) : (
            <Users className="h-4 w-4 text-green-600" />
          )}
          <label htmlFor="client-select" className="text-sm font-medium">
            Tipo de informe:
          </label>
        </div>
        
        <Select
          value={selectedClientId || 'global'}
          onValueChange={handleClientChange}
        >
          <SelectTrigger className="w-80">
            <SelectValue placeholder="Seleccionar tipo de informe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Informe Global (Por defecto)
              </div>
            </SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {client.name}
                  {client.hasCustomConfig && (
                    <Badge variant="secondary" className="text-xs">
                      Personalizado
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status and Actions */}
      {!isGlobalSelected && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Cliente: {currentClient?.name}</h4>
              {hasCustomConfig ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Configuración personalizada
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Usando configuración global
                </Badge>
              )}
            </div>
          </div>

          {/* Inheritance Info */}
          {!hasCustomConfig && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Este cliente está usando la configuración global por defecto. 
                Puedes crear una configuración personalizada o duplicar la global.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!hasCustomConfig ? (
              <>
                <Button
                  size="sm"
                  onClick={handleCreateCustomConfig}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Crear Personalizada
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDuplicateFromGlobal}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicar Global
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDuplicateDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicar a Otro Cliente
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar Personalizada
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Global Config Info */}
      {isGlobalSelected && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-900">Configuración Global</h4>
          </div>
          <p className="text-sm text-blue-700">
            Esta es la configuración por defecto que verán todos los clientes 
            que no tengan una configuración personalizada.
          </p>
        </div>
      )}

      {/* Messages */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Duplicate Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Configuración</DialogTitle>
            <DialogDescription>
              Selecciona el cliente al que quieres duplicar la configuración actual.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={duplicateTarget} onValueChange={setDuplicateTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente destino" />
              </SelectTrigger>
              <SelectContent>
                {clients
                  .filter(client => client.id !== selectedClientId)
                  .map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {client.name}
                        {client.hasCustomConfig && (
                          <Badge variant="secondary" className="text-xs">
                            Ya tiene personalizada
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {duplicateTarget && clients.find(c => c.id === duplicateTarget)?.hasCustomConfig && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Este cliente ya tiene una configuración personalizada. 
                  La duplicación la sobrescribirá.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDuplicateDialog(false);
                setDuplicateTarget('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDuplicateToClient}
              disabled={!duplicateTarget || isProcessing}
            >
              {isProcessing ? 'Duplicando...' : 'Duplicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Configuración Personalizada</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar la configuración personalizada 
              para {currentClient?.name}? El cliente volverá a usar la configuración global.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCustomConfig}
              disabled={isProcessing}
            >
              {isProcessing ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}