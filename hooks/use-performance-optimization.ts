'use client';

import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { debounce, throttle } from 'lodash';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
  lastUpdate: Date;
}

/**
 * Hook for optimizing performance with large configurations
 */
export function usePerformanceOptimization() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    lastUpdate: new Date(),
  });
  
  const renderStartTime = useRef<number>(0);
  const frameId = useRef<number>(0);

  // Start performance measurement
  const startMeasurement = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // End performance measurement
  const endMeasurement = useCallback((componentCount: number) => {
    const renderTime = performance.now() - renderStartTime.current;
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      componentCount,
      lastUpdate: new Date(),
    }));
  }, []);

  // Debounced update function for frequent changes
  const debouncedUpdate = useMemo(
    () => debounce((callback: () => void) => {
      callback();
    }, 300),
    []
  );

  // Throttled update function for real-time changes
  const throttledUpdate = useMemo(
    () => throttle((callback: () => void) => {
      callback();
    }, 100),
    []
  );

  // Virtual scrolling calculator for large lists
  const calculateVirtualScrolling = useCallback((
    items: unknown[],
    itemHeight: number,
    containerHeight: number,
    scrollTop: number
  ) => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    const visibleItems = items.slice(visibleStart, visibleEnd);
    const totalHeight = items.length * itemHeight;
    const offsetY = visibleStart * itemHeight;
    
    return {
      visibleItems,
      totalHeight,
      offsetY,
      visibleStart,
      visibleEnd,
    };
  }, []);

  // Memoization helper for expensive calculations
  const createMemoizedCalculation = useCallback(<T>(
    calculation: () => T,
    dependencies: unknown[]
  ): T => {
    // This function returns a factory that should be used with useMemo at the component level
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return calculation();
  }, []);

  // Intersection observer factory for lazy loading
  const createIntersectionObserver = useCallback((
    callback: (isVisible: boolean) => void,
    threshold = 0.1,
    rootMargin = '50px'
  ) => {
    return new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );
  }, []);

  // Batch updates helper
  const pendingUpdatesRef = useRef<(() => void)[]>([]);
  
  const batchUpdate = useCallback((update: () => void) => {
    pendingUpdatesRef.current.push(update);
    
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
    }
    
    frameId.current = requestAnimationFrame(() => {
      const updates = pendingUpdatesRef.current;
      pendingUpdatesRef.current = [];
      
      updates.forEach(updateFn => updateFn());
    });
  }, []);

  // Memory usage monitoring (if available)
  useEffect(() => {
    if ('memory' in performance) {
      const updateMemoryUsage = () => {
        const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
        if (memory) {
          setMetrics(prev => ({
            ...prev,
            memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
          }));
        }
      };

      const interval = setInterval(updateMemoryUsage, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  // Performance recommendations
  const getPerformanceRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    
    if (metrics.renderTime > 100) {
      recommendations.push('Considera usar virtualización para listas grandes');
    }
    
    if (metrics.componentCount > 50) {
      recommendations.push('Usa lazy loading para componentes no visibles');
    }
    
    if (metrics.memoryUsage && metrics.memoryUsage > 100) {
      recommendations.push('Optimiza el uso de memoria eliminando referencias no utilizadas');
    }
    
    return recommendations;
  }, [metrics]);

  return {
    metrics,
    startMeasurement,
    endMeasurement,
    debouncedUpdate,
    throttledUpdate,
    calculateVirtualScrolling,
    createMemoizedCalculation,
    createIntersectionObserver,
    batchUpdate,
    getPerformanceRecommendations,
  };
}

/**
 * Hook for optimizing drag and drop performance
 */
export function useDragDropOptimization() {
  const [isDragging, setIsDragging] = useState(false);
  const dragPreviewRef = useRef<HTMLElement | null>(null);

  // Optimize drag preview
  const createOptimizedDragPreview = useCallback((element: HTMLElement) => {
    const preview = element.cloneNode(true) as HTMLElement;
    
    // Optimize preview for performance
    preview.style.position = 'absolute';
    preview.style.top = '-1000px';
    preview.style.left = '-1000px';
    preview.style.pointerEvents = 'none';
    preview.style.transform = 'scale(0.8)';
    preview.style.opacity = '0.8';
    preview.style.zIndex = '9999';
    
    // Remove heavy content from preview
    const charts = preview.querySelectorAll('canvas, svg');
    charts.forEach(chart => {
      const placeholder = document.createElement('div');
      placeholder.className = 'bg-gray-200 rounded';
      placeholder.style.width = chart.clientWidth + 'px';
      placeholder.style.height = chart.clientHeight + 'px';
      chart.parentNode?.replaceChild(placeholder, chart);
    });
    
    document.body.appendChild(preview);
    dragPreviewRef.current = preview;
    
    return preview;
  }, []);

  // Cleanup drag preview
  const cleanupDragPreview = useCallback(() => {
    if (dragPreviewRef.current) {
      document.body.removeChild(dragPreviewRef.current);
      dragPreviewRef.current = null;
    }
  }, []);

  // Throttled drag over handler
  const throttledDragOver = useMemo(
    () => throttle((callback: (e: DragEvent) => void) => {
      return (e: DragEvent) => {
        e.preventDefault();
        callback(e);
      };
    }, 16), // ~60fps
    []
  );

  return {
    isDragging,
    setIsDragging,
    createOptimizedDragPreview,
    cleanupDragPreview,
    throttledDragOver,
  };
}

/**
 * Hook for component-level performance monitoring
 */
export function useComponentPerformance(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    lastRenderTime.current = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCount.current} times`);
    }
  });

  const logPerformance = useCallback((operation: string, startTime: number) => {
    const duration = performance.now() - startTime;
    
    if (process.env.NODE_ENV === 'development' && duration > 10) {
      console.warn(`${componentName} - ${operation} took ${duration.toFixed(2)}ms`);
    }
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    logPerformance,
  };
}