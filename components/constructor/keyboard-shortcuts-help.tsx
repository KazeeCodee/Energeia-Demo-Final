'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Keyboard, HelpCircle } from 'lucide-react';
import { CONSTRUCTOR_SHORTCUTS, formatShortcut } from '@/hooks/use-keyboard-shortcuts';
import { ANIMATION_CLASSES } from '@/lib/utils/animations';
import { cn } from '@/lib/utils';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    key: string;
    description: string;
    shortcut: string;
  }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Acciones Generales',
    shortcuts: [
      {
        key: 'save',
        description: 'Guardar configuración',
        shortcut: formatShortcut(CONSTRUCTOR_SHORTCUTS.save),
      },
      {
        key: 'undo',
        description: 'Deshacer última acción',
        shortcut: formatShortcut(CONSTRUCTOR_SHORTCUTS.undo),
      },
      {
        key: 'redo',
        description: 'Rehacer acción',
        shortcut: formatShortcut(CONSTRUCTOR_SHORTCUTS.redo),
      },
      {
        key: 'escape',
        description: 'Cancelar acción actual',
        shortcut: formatShortcut(CONSTRUCTOR_SHORTCUTS.escape),
      },
    ],
  },
  {
    title: 'Gestión de Espacios',
    shortcuts: [
      {
        key: 'addSpace1',
        description: 'Añadir espacio de 1 columna',
        shortcut: formatShortcut(CONSTRUCTOR_SHORTCUTS.addSpace1),
      },
      {
        key: 'addSpace2',
        description: 'Añadir espacio de 2 columnas',
        shortcut: formatShortcut(CONSTRUCTOR_SHORTCUTS.addSpace2),
      },
      {
        key: 'addSpace3',
        description: 'Añadir espacio de 3 columnas',
        shortcut: formatShortcut(CONSTRUCTOR_SHORTCUTS.addSpace3),
      },
    ],
  },
  {
    title: 'Edición de Componentes',
    shortcuts: [
      {
        key: 'delete',
        description: 'Eliminar elemento seleccionado',
        shortcut: formatShortcut(CONSTRUCTOR_SHORTCUTS.delete),
      },
      {
        key: 'selectAll',
        description: 'Seleccionar todos los componentes',
        shortcut: formatShortcut(CONSTRUCTOR_SHORTCUTS.selectAll),
      },
      {
        key: 'copy',
        description: 'Copiar componente seleccionado',
        shortcut: formatShortcut(CONSTRUCTOR_SHORTCUTS.copy),
      },
      {
        key: 'paste',
        description: 'Pegar componente',
        shortcut: formatShortcut(CONSTRUCTOR_SHORTCUTS.paste),
      },
    ],
  },
];

interface KeyboardShortcutsHelpProps {
  trigger?: React.ReactNode;
}

export function KeyboardShortcutsHelp({ trigger }: KeyboardShortcutsHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
    >
      <Keyboard className="h-4 w-4" />
      <span className="hidden sm:inline">Atajos</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className={cn('max-w-2xl max-h-[80vh] overflow-y-auto', ANIMATION_CLASSES.dropIn)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-orange-500" />
            Atajos de Teclado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Tip: Los atajos no funcionan mientras escribes en campos de texto
              </p>
              <p className="text-xs text-blue-700">
                Haz clic fuera de cualquier campo de entrada para activar los atajos de teclado.
              </p>
            </div>
          </div>

          {SHORTCUT_GROUPS.map((group, groupIndex) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {group.title}
                <Badge variant="outline" className="text-xs">
                  {group.shortcuts.length}
                </Badge>
              </h3>
              
              <div className="grid gap-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={shortcut.key}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      'hover:bg-gray-50 transition-colors',
                      ANIMATION_CLASSES.fadeIn
                    )}
                    style={{
                      animationDelay: `${(groupIndex * 100) + (index * 50)}ms`,
                    }}
                  >
                    <span className="text-sm text-gray-700">
                      {shortcut.description}
                    </span>
                    <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                      {shortcut.shortcut}
                    </kbd>
                  </div>
                ))}
              </div>
              
              {groupIndex < SHORTCUT_GROUPS.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>¿Necesitas más ayuda?</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Could open a more comprehensive help system
                  window.open('/help', '_blank');
                }}
              >
                Documentación completa
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Floating help button for keyboard shortcuts
 */
export function FloatingShortcutsHelp() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <KeyboardShortcutsHelp
        trigger={
          <Button
            size="sm"
            className={cn(
              'rounded-full shadow-lg',
              'bg-orange-500 hover:bg-orange-600 text-white',
              'transition-all duration-200 hover:scale-105',
              ANIMATION_CLASSES.popIn
            )}
          >
            <Keyboard className="h-4 w-4" />
            <span className="sr-only">Mostrar atajos de teclado</span>
          </Button>
        }
      />
    </div>
  );
}