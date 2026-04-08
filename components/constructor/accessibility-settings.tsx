'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ColorContrastChecker } from '@/components/ui/color-contrast-checker';
import { 
  Accessibility, 
  Eye, 
  Keyboard, 
  Volume2, 
  MousePointer,
  Palette,
  Settings
} from 'lucide-react';
import { useReducedMotion } from '@/hooks/use-accessibility';
import { cn } from '@/lib/utils';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largerText: boolean;
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
  announcements: boolean;
  focusIndicators: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  largerText: false,
  keyboardNavigation: true,
  screenReaderOptimized: true,
  announcements: true,
  focusIndicators: true,
};

export function AccessibilitySettingsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const systemReducedMotion = useReducedMotion();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }

    // Auto-detect system preferences
    if (systemReducedMotion) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }
  }, [systemReducedMotion]);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    // Apply settings to document
    applySettingsToDocument(settings);
  }, [settings]);

  const applySettingsToDocument = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Larger text
    if (settings.largerText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // Enhanced focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
    
    // Reduced motion (respects system preference)
    if (settings.reducedMotion || systemReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          aria-label="Configuración de accesibilidad"
        >
          <Accessibility className="h-4 w-4" />
          <span className="hidden sm:inline">Accesibilidad</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-blue-600" />
            Configuración de Accesibilidad
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5" />
                Configuración Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="high-contrast">Alto Contraste</Label>
                  <p className="text-sm text-muted-foreground">
                    Aumenta el contraste para mejor visibilidad
                  </p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="larger-text">Texto Más Grande</Label>
                  <p className="text-sm text-muted-foreground">
                    Aumenta el tamaño del texto en toda la aplicación
                  </p>
                </div>
                <Switch
                  id="larger-text"
                  checked={settings.largerText}
                  onCheckedChange={(checked) => updateSetting('largerText', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="reduced-motion">Movimiento Reducido</Label>
                  <p className="text-sm text-muted-foreground">
                    {systemReducedMotion ? 'Detectado automáticamente' : 'Reduce animaciones y transiciones'}
                  </p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion || systemReducedMotion}
                  onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                  disabled={systemReducedMotion}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="focus-indicators">Indicadores de Foco Mejorados</Label>
                  <p className="text-sm text-muted-foreground">
                    Hace más visibles los elementos enfocados
                  </p>
                </div>
                <Switch
                  id="focus-indicators"
                  checked={settings.focusIndicators}
                  onCheckedChange={(checked) => updateSetting('focusIndicators', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Interaction Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Keyboard className="h-5 w-5" />
                Configuración de Interacción
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="keyboard-navigation">Navegación por Teclado</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilita navegación completa con teclado
                  </p>
                </div>
                <Switch
                  id="keyboard-navigation"
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="screen-reader">Optimizado para Lectores de Pantalla</Label>
                  <p className="text-sm text-muted-foreground">
                    Mejora la experiencia con tecnologías asistivas
                  </p>
                </div>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReaderOptimized}
                  onCheckedChange={(checked) => updateSetting('screenReaderOptimized', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="announcements">Anuncios de Voz</Label>
                  <p className="text-sm text-muted-foreground">
                    Anuncia cambios importantes en la interfaz
                  </p>
                </div>
                <Switch
                  id="announcements"
                  checked={settings.announcements}
                  onCheckedChange={(checked) => updateSetting('announcements', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Contrast Checker */}
        <div className="mt-6">
          <ColorContrastChecker />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Restaurar Valores por Defecto
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Aplicar Configuración
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Floating accessibility button
 */
export function FloatingAccessibilityButton() {
  return (
    <div className="fixed bottom-16 right-4 z-50">
      <AccessibilitySettingsDialog />
    </div>
  );
}