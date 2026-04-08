'use client';

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
  disabled?: boolean;
}

export interface ShortcutDefinition {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
  target?: HTMLElement | null;
}

/**
 * Hook for managing keyboard shortcuts with proper cleanup and accessibility
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
  target,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: Event) => {
    const keyboardEvent = event as KeyboardEvent;
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in inputs
    const activeElement = document.activeElement;
    const isTyping = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true'
    );

    if (isTyping) return;

    const matchingShortcut = shortcutsRef.current.find(shortcut => {
      if (shortcut.disabled) return false;

      const keyMatches = shortcut.key.toLowerCase() === keyboardEvent.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrlKey === keyboardEvent.ctrlKey;
      const altMatches = !!shortcut.altKey === keyboardEvent.altKey;
      const shiftMatches = !!shortcut.shiftKey === keyboardEvent.shiftKey;
      const metaMatches = !!shortcut.metaKey === keyboardEvent.metaKey;

      return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        keyboardEvent.preventDefault();
      }
      matchingShortcut.action();
    }
  }, [enabled]);

  useEffect(() => {
    const element = target || document;
    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, target]);

  return {
    shortcuts: shortcutsRef.current,
  };
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: ShortcutDefinition | KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push('Cmd');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
}

/**
 * Common keyboard shortcuts for the constructor
 */
export const CONSTRUCTOR_SHORTCUTS = {
  save: {
    key: 's',
    ctrlKey: true,
    description: 'Guardar configuración',
  },
  undo: {
    key: 'z',
    ctrlKey: true,
    description: 'Deshacer última acción',
  },
  redo: {
    key: 'y',
    ctrlKey: true,
    description: 'Rehacer acción',
  },
  delete: {
    key: 'Delete',
    description: 'Eliminar elemento seleccionado',
  },
  escape: {
    key: 'Escape',
    description: 'Cancelar acción actual',
  },
  addSpace1: {
    key: '1',
    ctrlKey: true,
    description: 'Añadir espacio de 1 columna',
  },
  addSpace2: {
    key: '2',
    ctrlKey: true,
    description: 'Añadir espacio de 2 columnas',
  },
  addSpace3: {
    key: '3',
    ctrlKey: true,
    description: 'Añadir espacio de 3 columnas',
  },
  selectAll: {
    key: 'a',
    ctrlKey: true,
    description: 'Seleccionar todos los componentes',
  },
  copy: {
    key: 'c',
    ctrlKey: true,
    description: 'Copiar componente seleccionado',
  },
  paste: {
    key: 'v',
    ctrlKey: true,
    description: 'Pegar componente',
  },
  help: {
    key: '?',
    shiftKey: true,
    description: 'Mostrar ayuda de atajos',
  },
} as const;

/**
 * Hook specifically for constructor keyboard shortcuts
 */
export function useConstructorShortcuts({
  onSave,
  onUndo,
  onRedo,
  onDelete,
  onEscape,
  onAddSpace,
  onSelectAll,
  onCopy,
  onPaste,
  onHelp,
  enabled = true,
}: {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onEscape?: () => void;
  onAddSpace?: (columns: 1 | 2 | 3) => void;
  onSelectAll?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onHelp?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      ...CONSTRUCTOR_SHORTCUTS.save,
      action: () => onSave?.(),
      disabled: !onSave,
    },
    {
      ...CONSTRUCTOR_SHORTCUTS.undo,
      action: () => onUndo?.(),
      disabled: !onUndo,
    },
    {
      ...CONSTRUCTOR_SHORTCUTS.redo,
      action: () => onRedo?.(),
      disabled: !onRedo,
    },
    {
      ...CONSTRUCTOR_SHORTCUTS.delete,
      action: () => onDelete?.(),
      disabled: !onDelete,
    },
    {
      ...CONSTRUCTOR_SHORTCUTS.escape,
      action: () => onEscape?.(),
      disabled: !onEscape,
    },
    {
      ...CONSTRUCTOR_SHORTCUTS.addSpace1,
      action: () => onAddSpace?.(1),
      disabled: !onAddSpace,
    },
    {
      ...CONSTRUCTOR_SHORTCUTS.addSpace2,
      action: () => onAddSpace?.(2),
      disabled: !onAddSpace,
    },
    {
      ...CONSTRUCTOR_SHORTCUTS.addSpace3,
      action: () => onAddSpace?.(3),
      disabled: !onAddSpace,
    },
    {
      ...CONSTRUCTOR_SHORTCUTS.selectAll,
      action: () => onSelectAll?.(),
      disabled: !onSelectAll,
    },
    {
      ...CONSTRUCTOR_SHORTCUTS.copy,
      action: () => onCopy?.(),
      disabled: !onCopy,
    },
    {
      ...CONSTRUCTOR_SHORTCUTS.paste,
      action: () => onPaste?.(),
      disabled: !onPaste,
    },
    {
      ...CONSTRUCTOR_SHORTCUTS.help,
      action: () => onHelp?.(),
      disabled: !onHelp,
    },
  ];

  return useKeyboardShortcuts({ shortcuts, enabled });
}