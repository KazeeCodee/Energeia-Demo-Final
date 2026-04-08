'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { useKeyboardDragDrop, useScreenReaderAnnouncements, useAriaAttributes } from '@/hooks/use-accessibility';
import { cn } from '@/lib/utils';

interface AccessibleDragDropProps {
  children: React.ReactNode;
  itemId: string;
  itemLabel: string;
  onDragStart?: (itemId: string) => void;
  onDragEnd?: () => void;
  onKeyboardDrop?: (itemId: string, targetElement: HTMLElement) => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

/**
 * Accessible drag and drop wrapper that supports both mouse and keyboard interaction
 */
export function AccessibleDragDrop({
  children,
  itemId,
  itemLabel,
  onDragStart,
  onDragEnd,
  onKeyboardDrop,
  className,
  style,
  disabled = false,
}: AccessibleDragDropProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { announce } = useScreenReaderAnnouncements();
  const { setAriaLabel, setRole, setAriaPressed } = useAriaAttributes();
  const {
    selectedItem,
    dragMode,
    enterDragMode,
    exitDragMode,
    navigateDropTargets,
    dropItem,
  } = useKeyboardDragDrop();

  const isSelected = selectedItem === itemId;
  const isDragging = dragMode && isSelected;

  // Set up ARIA attributes
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    setAriaLabel(element, `${itemLabel}. Presiona Espacio para activar modo arrastrar, o arrastra con el mouse.`);
    setRole(element, 'button');
    element.setAttribute('tabindex', disabled ? '-1' : '0');
    element.setAttribute('aria-grabbed', isDragging ? 'true' : 'false');
    
    if (disabled) {
      element.setAttribute('aria-disabled', 'true');
    } else {
      element.removeAttribute('aria-disabled');
    }
  }, [itemLabel, isDragging, disabled, setAriaLabel, setRole]);

  // Handle mouse drag events
  const handleMouseDragStart = useCallback((e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    onDragStart?.(itemId);
    announce(`Arrastrando ${itemLabel}`);
    
    // Set drag data
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'accessible-drag-item',
      itemId,
      itemLabel,
    }));
    
    e.dataTransfer.effectAllowed = 'move';
  }, [disabled, onDragStart, itemId, announce, itemLabel]);

  const handleMouseDragEnd = useCallback(() => {
    if (disabled) return;
    
    onDragEnd?.();
    announce(`Terminó de arrastrar ${itemLabel}`);
  }, [disabled, onDragEnd, announce, itemLabel]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        if (!dragMode) {
          enterDragMode(itemId);
          onDragStart?.(itemId);
        } else if (isSelected) {
          dropItem(onKeyboardDrop);
          onDragEnd?.();
        }
        break;
        
      case 'Escape':
        if (dragMode && isSelected) {
          e.preventDefault();
          exitDragMode();
          onDragEnd?.();
          announce(`Cancelado arrastrar ${itemLabel}`);
        }
        break;
        
      case 'ArrowDown':
      case 'ArrowRight':
        if (dragMode && isSelected) {
          e.preventDefault();
          navigateDropTargets('next');
        }
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        if (dragMode && isSelected) {
          e.preventDefault();
          navigateDropTargets('previous');
        }
        break;
    }
  }, [
    disabled,
    dragMode,
    isSelected,
    itemId,
    itemLabel,
    enterDragMode,
    exitDragMode,
    navigateDropTargets,
    dropItem,
    onDragStart,
    onDragEnd,
    onKeyboardDrop,
    announce,
  ]);

  const handleFocus = useCallback(() => {
    if (disabled) return;
    
    const element = elementRef.current;
    if (element) {
      setAriaLabel(
        element,
        dragMode && isSelected
          ? `${itemLabel}. Modo arrastrar activo. Usa las flechas para navegar destinos. Enter para soltar, Escape para cancelar.`
          : `${itemLabel}. Presiona Espacio para activar modo arrastrar.`
      );
    }
  }, [disabled, dragMode, isSelected, itemLabel, setAriaLabel]);

  return (
    <div
      ref={elementRef}
      draggable={!disabled}
      onDragStart={handleMouseDragStart}
      onDragEnd={handleMouseDragEnd}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      style={style}
      className={cn(
        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
        'transition-all duration-200',
        isDragging && 'ring-2 ring-orange-500 ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-grab active:cursor-grabbing',
        className
      )}
      data-drag-item={itemId}
      data-drag-label={itemLabel}
    >
      {children}
      
      {/* Screen reader only instructions */}
      <div className="sr-only">
        {dragMode && isSelected && (
          <div aria-live="polite">
            Modo arrastrar activo. Usa las teclas de flecha para navegar entre destinos válidos. 
            Presiona Enter para soltar en el destino actual o Escape para cancelar.
          </div>
        )}
      </div>
    </div>
  );
}

interface AccessibleDropZoneProps {
  children: React.ReactNode;
  onDrop: (itemId: string, itemLabel: string) => void;
  onKeyboardDrop?: (itemId: string, targetElement: HTMLElement) => void;
  dropLabel: string;
  className?: string;
  disabled?: boolean;
  accepts?: string[]; // Array of accepted item types
}

/**
 * Accessible drop zone that works with both mouse and keyboard
 */
export function AccessibleDropZone({
  children,
  onDrop,
  onKeyboardDrop,
  dropLabel,
  className,
  disabled = false,
  accepts = [],
}: AccessibleDropZoneProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { announce } = useScreenReaderAnnouncements();
  const { setAriaLabel, setRole } = useAriaAttributes();

  // Set up ARIA attributes
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    setAriaLabel(element, `Zona de destino: ${dropLabel}`);
    setRole(element, 'button');
    element.setAttribute('data-drop-target', 'true');
    element.setAttribute('tabindex', disabled ? '-1' : '0');
    
    if (disabled) {
      element.setAttribute('aria-disabled', 'true');
    } else {
      element.removeAttribute('aria-disabled');
    }
  }, [dropLabel, disabled, setAriaLabel, setRole]);

  // Handle mouse drop events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    
    try {
      const dragData = e.dataTransfer.getData('application/json');
      if (dragData) {
        const { itemId, itemLabel } = JSON.parse(dragData);
        
        // Check if this drop zone accepts this item type
        if (accepts.length > 0 && !accepts.includes(itemId)) {
          announce(`No se puede soltar ${itemLabel} en ${dropLabel}`);
          return;
        }
        
        onDrop(itemId, itemLabel);
        announce(`${itemLabel} soltado en ${dropLabel}`);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
      announce('Error al soltar el elemento');
    }
  }, [disabled, accepts, onDrop, dropLabel, announce]);

  // Handle keyboard events for drop zone
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      
      // This will be handled by the drag item's keyboard drop logic
      // The drop zone just needs to be focusable for navigation
    }
  }, [disabled]);

  const handleFocus = useCallback(() => {
    if (disabled) return;
    
    announce(`Enfocado en zona de destino: ${dropLabel}`);
  }, [disabled, dropLabel, announce]);

  return (
    <div
      ref={elementRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      className={cn(
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'transition-all duration-200',
        disabled && 'opacity-50',
        className
      )}
      data-drop-target="true"
      data-drop-label={dropLabel}
    >
      {children}
    </div>
  );
}