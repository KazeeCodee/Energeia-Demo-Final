'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook for managing focus and keyboard navigation
 */
export function useFocusManagement() {
  const focusableElementsRef = useRef<HTMLElement[]>([]);
  const currentFocusIndex = useRef(-1);

  const updateFocusableElements = useCallback((container: HTMLElement) => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
    ].join(', ');

    focusableElementsRef.current = Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, []);

  const focusNext = useCallback(() => {
    if (focusableElementsRef.current.length === 0) return;
    
    currentFocusIndex.current = (currentFocusIndex.current + 1) % focusableElementsRef.current.length;
    focusableElementsRef.current[currentFocusIndex.current]?.focus();
  }, []);

  const focusPrevious = useCallback(() => {
    if (focusableElementsRef.current.length === 0) return;
    
    currentFocusIndex.current = currentFocusIndex.current <= 0 
      ? focusableElementsRef.current.length - 1 
      : currentFocusIndex.current - 1;
    focusableElementsRef.current[currentFocusIndex.current]?.focus();
  }, []);

  const focusFirst = useCallback(() => {
    if (focusableElementsRef.current.length === 0) return;
    
    currentFocusIndex.current = 0;
    focusableElementsRef.current[0]?.focus();
  }, []);

  const focusLast = useCallback(() => {
    if (focusableElementsRef.current.length === 0) return;
    
    currentFocusIndex.current = focusableElementsRef.current.length - 1;
    focusableElementsRef.current[currentFocusIndex.current]?.focus();
  }, []);

  return {
    updateFocusableElements,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusableElements: focusableElementsRef.current,
  };
}

/**
 * Hook for keyboard navigation in drag and drop contexts
 */
export function useKeyboardDragDrop() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState(false);
  const [dropTargets, setDropTargets] = useState<HTMLElement[]>([]);
  const [currentDropTarget, setCurrentDropTarget] = useState<number>(-1);

  const enterDragMode = useCallback((itemId: string) => {
    setSelectedItem(itemId);
    setDragMode(true);
    
    // Find all valid drop targets
    const targets = Array.from(
      document.querySelectorAll('[data-drop-target="true"]')
    ) as HTMLElement[];
    setDropTargets(targets);
    setCurrentDropTarget(0);
    
    // Announce drag mode to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Modo arrastrar activado para ${itemId}. Usa las flechas para navegar entre destinos válidos. Presiona Enter para soltar o Escape para cancelar.`;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const exitDragMode = useCallback(() => {
    setSelectedItem(null);
    setDragMode(false);
    setDropTargets([]);
    setCurrentDropTarget(-1);
  }, []);

  const navigateDropTargets = useCallback((direction: 'next' | 'previous') => {
    if (!dragMode || dropTargets.length === 0) return;

    const newIndex = direction === 'next'
      ? (currentDropTarget + 1) % dropTargets.length
      : currentDropTarget <= 0 ? dropTargets.length - 1 : currentDropTarget - 1;

    setCurrentDropTarget(newIndex);
    
    // Focus the drop target
    dropTargets[newIndex]?.focus();
    
    // Announce current target
    const targetName = dropTargets[newIndex]?.getAttribute('aria-label') || 
                      dropTargets[newIndex]?.textContent || 
                      'Destino sin nombre';
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Destino actual: ${targetName}`;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 500);
  }, [dragMode, dropTargets, currentDropTarget]);

  const dropItem = useCallback((onDrop?: (itemId: string, targetElement: HTMLElement) => void) => {
    if (!dragMode || !selectedItem || currentDropTarget < 0) return;

    const targetElement = dropTargets[currentDropTarget];
    if (targetElement && onDrop) {
      onDrop(selectedItem, targetElement);
    }

    exitDragMode();
  }, [dragMode, selectedItem, currentDropTarget, dropTargets, exitDragMode]);

  return {
    selectedItem,
    dragMode,
    currentDropTarget,
    dropTargets,
    enterDragMode,
    exitDragMode,
    navigateDropTargets,
    dropItem,
  };
}

/**
 * Hook for screen reader announcements
 */
export function useScreenReaderAnnouncements() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Clean up after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, []);

  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Éxito: ${message}`, 'polite');
  }, [announce]);

  const announceStatus = useCallback((status: string) => {
    announce(status, 'polite');
  }, [announce]);

  return {
    announce,
    announceError,
    announceSuccess,
    announceStatus,
  };
}

/**
 * Hook for managing ARIA attributes dynamically
 */
export function useAriaAttributes() {
  const setAriaLabel = useCallback((element: HTMLElement | null, label: string) => {
    if (element) {
      element.setAttribute('aria-label', label);
    }
  }, []);

  const setAriaDescribedBy = useCallback((element: HTMLElement | null, describedById: string) => {
    if (element) {
      element.setAttribute('aria-describedby', describedById);
    }
  }, []);

  const setAriaExpanded = useCallback((element: HTMLElement | null, expanded: boolean) => {
    if (element) {
      element.setAttribute('aria-expanded', expanded.toString());
    }
  }, []);

  const setAriaSelected = useCallback((element: HTMLElement | null, selected: boolean) => {
    if (element) {
      element.setAttribute('aria-selected', selected.toString());
    }
  }, []);

  const setAriaPressed = useCallback((element: HTMLElement | null, pressed: boolean) => {
    if (element) {
      element.setAttribute('aria-pressed', pressed.toString());
    }
  }, []);

  const setRole = useCallback((element: HTMLElement | null, role: string) => {
    if (element) {
      element.setAttribute('role', role);
    }
  }, []);

  return {
    setAriaLabel,
    setAriaDescribedBy,
    setAriaExpanded,
    setAriaSelected,
    setAriaPressed,
    setRole,
  };
}

/**
 * Hook for color contrast validation
 */
export function useColorContrast() {
  const checkContrast = useCallback((foreground: string, background: string): number => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Calculate relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);

    if (!fg || !bg) return 0;

    const fgLuminance = getLuminance(fg.r, fg.g, fg.b);
    const bgLuminance = getLuminance(bg.r, bg.g, bg.b);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  const isAccessibleContrast = useCallback((foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = checkContrast(foreground, background);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }, [checkContrast]);

  return {
    checkContrast,
    isAccessibleContrast,
  };
}

/**
 * Hook for reduced motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}