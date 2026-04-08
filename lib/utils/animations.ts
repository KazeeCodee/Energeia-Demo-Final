/**
 * Animation utilities for smooth transitions and enhanced UX
 */

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const;

export const EASING = {
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const SPRING_CONFIG = {
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
} as const;

/**
 * CSS classes for common animations
 */
export const ANIMATION_CLASSES = {
  // Fade animations
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-150',
  
  // Slide animations
  slideInFromTop: 'animate-in slide-in-from-top-2 duration-200',
  slideInFromBottom: 'animate-in slide-in-from-bottom-2 duration-200',
  slideInFromLeft: 'animate-in slide-in-from-left-2 duration-200',
  slideInFromRight: 'animate-in slide-in-from-right-2 duration-200',
  
  // Scale animations
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-150',
  
  // Combined animations
  dropIn: 'animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200',
  popIn: 'animate-in fade-in zoom-in-95 duration-200',
  
  // Hover animations
  hoverScale: 'transition-transform duration-200 hover:scale-105',
  hoverLift: 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
  
  // Loading animations
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
} as const;

/**
 * Stagger animation delays for lists
 */
export const getStaggerDelay = (index: number, baseDelay = 50): string => {
  return `${index * baseDelay}ms`;
};

/**
 * Create a smooth transition style object
 */
export const createTransition = (
  properties: string[] = ['all'],
  duration = ANIMATION_DURATIONS.normal,
  easing = EASING.easeOut
): React.CSSProperties => ({
  transition: properties.map(prop => `${prop} ${duration}ms ${easing}`).join(', '),
});

/**
 * Animation variants for framer-motion (if used)
 */
export const motionVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  card: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
  dragItem: {
    idle: { scale: 1, rotate: 0 },
    dragging: { 
      scale: 1.05, 
      rotate: 5,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
};

/**
 * Performance optimized animation hook
 */
export const useOptimizedAnimation = () => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  return {
    shouldAnimate: !prefersReducedMotion,
    duration: prefersReducedMotion ? 0 : ANIMATION_DURATIONS.normal,
  };
};