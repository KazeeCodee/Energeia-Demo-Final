/**
 * Accessibility utilities and helpers
 */

// Generate unique IDs for form elements
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// ARIA label generators
export function getAriaLabel(element: string, context?: string): string {
  const labels: Record<string, string> = {
    'close-button': 'Cerrar',
    'menu-button': 'Abrir menú',
    'search-input': 'Buscar',
    'filter-button': 'Filtrar resultados',
    'sort-button': 'Ordenar',
    'expand-button': 'Expandir',
    'collapse-button': 'Contraer',
    'edit-button': 'Editar',
    'delete-button': 'Eliminar',
    'save-button': 'Guardar',
    'cancel-button': 'Cancelar',
    'submit-button': 'Enviar',
    'download-button': 'Descargar',
    'share-button': 'Compartir',
    'copy-button': 'Copiar',
    'refresh-button': 'Actualizar',
    'back-button': 'Volver',
    'next-button': 'Siguiente',
    'previous-button': 'Anterior',
    'play-button': 'Reproducir',
    'pause-button': 'Pausar',
    'stop-button': 'Detener',
  };

  const baseLabel = labels[element] || element;
  return context ? `${baseLabel} ${context}` : baseLabel;
}

// Screen reader announcements
export function announceToScreenReader(
  message: string, 
  priority: 'polite' | 'assertive' = 'polite',
  delay: number = 100
): void {
  setTimeout(() => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only absolute -left-[10000px] w-[1px] h-[1px] overflow-hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, delay);
}

// Keyboard navigation helpers
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

export function isActivationKey(key: string): boolean {
  return key === KeyboardKeys.ENTER || key === KeyboardKeys.SPACE;
}

export function isNavigationKey(key: string): boolean {
  const navigationKeys = [
    KeyboardKeys.ARROW_UP,
    KeyboardKeys.ARROW_DOWN,
    KeyboardKeys.ARROW_LEFT,
    KeyboardKeys.ARROW_RIGHT,
    KeyboardKeys.HOME,
    KeyboardKeys.END,
    KeyboardKeys.PAGE_UP,
    KeyboardKeys.PAGE_DOWN,
  ] as const;
  return navigationKeys.includes(key as (typeof navigationKeys)[number]);
}

// Form validation messages
export function getValidationMessage(field: string, error: string): string {
  const messages: Record<string, Record<string, string>> = {
    email: {
      required: 'El email es requerido',
      invalid: 'Ingresa un email válido',
    },
    password: {
      required: 'La contraseña es requerida',
      minLength: 'La contraseña debe tener al menos 8 caracteres',
      weak: 'La contraseña debe contener mayúsculas, minúsculas y números',
    },
    name: {
      required: 'El nombre es requerido',
      minLength: 'El nombre debe tener al menos 2 caracteres',
    },
    phone: {
      required: 'El teléfono es requerido',
      invalid: 'Ingresa un número de teléfono válido',
    },
  };

  return messages[field]?.[error] || `Error en ${field}: ${error}`;
}

// Color contrast utilities
export function getContrastRatio(_color1: string, _color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd convert colors to RGB and calculate luminance
  return 4.5; // Placeholder - should meet WCAG AA standards
}

export function meetsContrastRequirement(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

// Focus management
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== KeyboardKeys.TAB) return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  }

  container.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// High contrast mode detection
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

// Screen reader detection
export function isScreenReaderActive(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for common screen reader indicators
  const indicators = [
    'speechSynthesis' in window,
    navigator.userAgent.includes('NVDA'),
    navigator.userAgent.includes('JAWS'),
    navigator.userAgent.includes('VoiceOver'),
  ];
  
  return indicators.some(Boolean);
}

// ARIA live region manager
class LiveRegionManager {
  private regions: Map<string, HTMLElement> = new Map();

  getRegion(priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
    if (!this.regions.has(priority)) {
      const region = document.createElement('div');
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only absolute -left-[10000px] w-[1px] h-[1px] overflow-hidden';
      document.body.appendChild(region);
      this.regions.set(priority, region);
    }
    return this.regions.get(priority)!;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const region = this.getRegion(priority);
    region.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }

  cleanup(): void {
    this.regions.forEach(region => {
      if (document.body.contains(region)) {
        document.body.removeChild(region);
      }
    });
    this.regions.clear();
  }
}

export const liveRegionManager = new LiveRegionManager();

// Semantic HTML helpers
export function getSemanticRole(element: string): string {
  const roles: Record<string, string> = {
    'navigation-menu': 'navigation',
    'search-form': 'search',
    'main-content': 'main',
    'sidebar': 'complementary',
    'footer': 'contentinfo',
    'header': 'banner',
    'article': 'article',
    'section': 'region',
    'list': 'list',
    'listitem': 'listitem',
    'button': 'button',
    'link': 'link',
    'heading': 'heading',
    'dialog': 'dialog',
    'alert': 'alert',
    'status': 'status',
    'progressbar': 'progressbar',
    'tab': 'tab',
    'tabpanel': 'tabpanel',
    'tablist': 'tablist',
  };

  return roles[element] || '';
}

// Form accessibility helpers
export function getFormFieldProps(
  id: string,
  label: string,
  error?: string,
  description?: string,
  required?: boolean
) {
  const describedBy = [];
  if (description) describedBy.push(`${id}-description`);
  if (error) describedBy.push(`${id}-error`);

  return {
    id,
    'aria-label': label,
    'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
    'aria-invalid': error ? 'true' : undefined,
    'aria-required': required ? 'true' : undefined,
  };
}