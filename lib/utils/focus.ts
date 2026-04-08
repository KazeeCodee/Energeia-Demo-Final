/**
 * Focus management utilities for accessibility
 */

// Focus trap for modals and dialogs
export function createFocusTrap(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element when trap is created
  if (firstElement) {
    firstElement.focus();
  }

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// Restore focus to previously focused element
export function createFocusManager() {
  let previouslyFocused: HTMLElement | null = null;

  return {
    capture() {
      previouslyFocused = document.activeElement as HTMLElement;
    },
    restore() {
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
        previouslyFocused = null;
      }
    }
  };
}

// Skip to main content functionality
export function skipToMainContent() {
  const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
  if (mainContent) {
    (mainContent as HTMLElement).focus();
    (mainContent as HTMLElement).scrollIntoView();
  }
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Check if element is visible and focusable
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false;
  if (element.offsetParent === null) return false;
  if (window.getComputedStyle(element).visibility === 'hidden') return false;
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  
  return true;
}

// Get all focusable elements within a container
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  return elements.filter(isFocusable);
}

// Navigate with arrow keys (for custom components like menus)
export function handleArrowNavigation(
  e: KeyboardEvent, 
  elements: HTMLElement[], 
  currentIndex: number,
  options: {
    loop?: boolean;
    horizontal?: boolean;
  } = {}
): number {
  const { loop = true, horizontal = false } = options;
  const isNext = horizontal ? e.key === 'ArrowRight' : e.key === 'ArrowDown';
  const isPrev = horizontal ? e.key === 'ArrowLeft' : e.key === 'ArrowUp';
  
  if (!isNext && !isPrev) return currentIndex;
  
  e.preventDefault();
  
  let newIndex = currentIndex;
  
  if (isNext) {
    newIndex = currentIndex + 1;
    if (newIndex >= elements.length) {
      newIndex = loop ? 0 : elements.length - 1;
    }
  } else if (isPrev) {
    newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = loop ? elements.length - 1 : 0;
    }
  }
  
  elements[newIndex]?.focus();
  return newIndex;
}