'use client';

import { useState } from 'react';
import { ReportData, SharedLink } from '@/lib/types';
import { useAuthStore } from '@/lib/state/auth';
import { SimulationManager } from '@/lib/mock/simulators/delays';
import { SharedLinksService } from '@/lib/services/shared-links';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Copy, Check, Calendar, Clock, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData;
  origin: 'home' | 'reports';
  filters?: any;
}

type ExpirationOption = '2h' | '1d' | '1w' | '1m' | 'custom';

export function ShareModal({ 
  isOpen, 
  onClose, 
  reportData, 
  origin, 
  filters 
}: ShareModalProps) {
  const { user } = useAuthStore();
  const [expiration, setExpiration] = useState<ExpirationOption>('1d');
  const [customDate, setCustomDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<SharedLink | null>(null);
  const [copied, setCopied] = useState(false);

  const expirationOptions = [
    { value: '2h', label: '2 horas' },
    { value: '1d', label: '1 día' },
    { value: '1w', label: '1 semana' },
    { value: '1m', label: '1 mes' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const calculateExpirationDate = (option: ExpirationOption, customDate?: string): Date => {
    const now = new Date();
    
    switch (option) {
      case '2h':
        return new Date(now.getTime() + 2 * 60 * 60 * 1000);
      case '1d':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case '1w':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '1m':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'custom':
        return customDate ? new Date(customDate) : new Date(now.getTime() + 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  };

  const generateShareLink = async () => {
    if (!user) return;

    // Validate custom date if selected
    if (expiration === 'custom' && customDate) {
      const selectedDate = new Date(customDate);
      const now = new Date();
      
      if (selectedDate <= now) {
        toast.error('Fecha inválida', {
          description: 'La fecha de vencimiento debe ser futura',
        });
        return;
      }
      
      // Check if date is too far in the future (max 1 year)
      const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      if (selectedDate > maxDate) {
        toast.error('Fecha inválida', {
          description: 'La fecha de vencimiento no puede ser mayor a 1 año',
        });
        return;
      }
    }

    setIsGenerating(true);
    
    try {
      // Simulate network delay
      await SimulationManager.delay();

      const sharedLink = await SharedLinksService.createSharedLink({
        createdBy: user.id,
        companyIds: user.companyId ? [user.companyId] : [],
        origin,
        filters,
        expirationOption: expiration,
        customExpirationDate: customDate ? new Date(customDate) : undefined,
      });

      setGeneratedLink(sharedLink);
      
      toast.success('Enlace generado', {
        description: 'El enlace compartido ha sido creado exitosamente',
      });
      
    } catch (error) {
      toast.error('Error al generar enlace', {
        description: 'No se pudo crear el enlace compartido',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink.url);
      setCopied(true);
      
      toast.success('Enlace copiado', {
        description: 'El enlace ha sido copiado al portapapeles',
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar', {
        description: 'No se pudo copiar el enlace al portapapeles',
      });
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setExpiration('1d');
    setCustomDate('');
    setCopied(false);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isCustomDateValid = () => {
    if (expiration !== 'custom' || !customDate) return true;
    
    const selectedDate = new Date(customDate);
    const now = new Date();
    const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    
    return selectedDate > now && selectedDate <= maxDate;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <LinkIcon className="h-5 w-5 text-orange-500" />
            <span>Compartir Informe</span>
          </DialogTitle>
          <DialogDescription>
            Genera un enlace para compartir este informe con acceso temporal.
          </DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expiration">Vencimiento del enlace</Label>
              <Select value={expiration} onValueChange={(value: ExpirationOption) => setExpiration(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expirationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {expiration === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="customDate">Fecha y hora de vencimiento</Label>
                <Input
                  id="customDate"
                  type="datetime-local"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                  className={!isCustomDateValid() ? 'border-red-500' : ''}
                />
                {!isCustomDateValid() && (
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>La fecha debe ser futura y no mayor a 1 año</span>
                  </div>
                )}
              </div>
            )}

            <Card className="p-4 bg-orange-50 border-orange-200">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Información del informe
                  </p>
                  <p className="text-sm text-orange-700">
                    Período: {reportData.period} • Origen: {origin === 'home' ? 'Inicio' : 'Informes'}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    El enlace vencerá el {formatDate(calculateExpirationDate(expiration, customDate))}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Enlace generado exitosamente
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Vence el {formatDate(generatedLink.expiresAt)}
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Label>Enlace compartido</Label>
              <div className="flex space-x-2">
                <Input
                  value={generatedLink.url}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                El enlace estará disponible hasta el {formatDate(generatedLink.expiresAt)}
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          {!generatedLink ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={generateShareLink} 
                disabled={isGenerating || (expiration === 'custom' && (!customDate || !isCustomDateValid()))}
              >
                {isGenerating ? 'Generando...' : 'Generar Enlace'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}