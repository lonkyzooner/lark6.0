/**
 * Performance Optimization Utilities for LARK
 * 
 * This module provides utilities to optimize the performance of the LARK application.
 * It includes functions for:
 * - Lazy loading and code splitting
 * - Resource preloading and prefetching
 * - Memory management
 * - Rendering optimization
 * - Performance monitoring
 */

// Performance monitoring
let performanceMetrics: {
  initialLoadTime?: number;
  componentRenderTimes: Record<string, number[]>;
  interactionTimes: Record<string, number[]>;
  memoryUsage: number[];
  networkRequests: {
    url: string;
    duration: number;
    size: number;
    timestamp: number;
  }[];
} = {
  componentRenderTimes: {},
  interactionTimes: {},
  memoryUsage: [],
  networkRequests: []
};

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  // Record initial load time
  if (window.performance) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    performanceMetrics.initialLoadTime = pageLoadTime;
    
    // Log initial performance data
    console.log(`[Performance] Initial page load: ${pageLoadTime}ms`);
  }
  
  // Set up periodic memory usage monitoring if available
  if ((window.performance as any).memory) {
    setInterval(() => {
      const memoryInfo = (window.performance as any).memory;
      performanceMetrics.memoryUsage.push(memoryInfo.usedJSHeapSize);
      
      // Check for memory leaks
      if (performanceMetrics.memoryUsage.length > 10) {
        const recentUsage = performanceMetrics.memoryUsage.slice(-10);
        const increasing = recentUsage.every((val, i, arr) => i === 0 || val >= arr[i - 1]);
        
        if (increasing) {
          console.warn('[Performance] Possible memory leak detected. Memory usage consistently increasing.');
        }
      }
    }, 30000); // Check every 30 seconds
  }
  
  // Monitor network requests
  if (window.PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            performanceMetrics.networkRequests.push({
              url: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize || 0,
              timestamp: Date.now()
            });
            
            // Log slow requests
            if (resourceEntry.duration > 1000) {
              console.warn(`[Performance] Slow network request: ${resourceEntry.name} (${resourceEntry.duration.toFixed(2)}ms)`);
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.error('[Performance] Error setting up PerformanceObserver:', e);
    }
  }
}

/**
 * Track component render time
 * @param componentName Name of the component
 * @param startTime Start time of the render
 */
export function trackComponentRender(componentName: string, startTime: number): void {
  const renderTime = performance.now() - startTime;
  
  if (!performanceMetrics.componentRenderTimes[componentName]) {
    performanceMetrics.componentRenderTimes[componentName] = [];
  }
  
  performanceMetrics.componentRenderTimes[componentName].push(renderTime);
  
  // Log slow renders
  if (renderTime > 50) {
    console.warn(`[Performance] Slow render for ${componentName}: ${renderTime.toFixed(2)}ms`);
  }
}

/**
 * Track user interaction time
 * @param interactionName Name of the interaction
 * @param startTime Start time of the interaction
 */
export function trackInteraction(interactionName: string, startTime: number): void {
  const interactionTime = performance.now() - startTime;
  
  if (!performanceMetrics.interactionTimes[interactionName]) {
    performanceMetrics.interactionTimes[interactionName] = [];
  }
  
  performanceMetrics.interactionTimes[interactionName].push(interactionTime);
  
  // Log slow interactions
  if (interactionTime > 100) {
    console.warn(`[Performance] Slow interaction for ${interactionName}: ${interactionTime.toFixed(2)}ms`);
  }
}

/**
 * Prefetch resources that will likely be needed soon
 * @param urls Array of URLs to prefetch
 */
export function prefetchResources(urls: string[]): void {
  if (!window.requestIdleCallback) {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      urls.forEach(createPrefetchLink);
    }, 1000);
    return;
  }
  
  window.requestIdleCallback(() => {
    urls.forEach(createPrefetchLink);
  });
}

/**
 * Create a prefetch link for a URL
 * @param url URL to prefetch
 */
function createPrefetchLink(url: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Get performance metrics
 * @returns Current performance metrics
 */
export function getPerformanceMetrics() {
  return { ...performanceMetrics };
}

/**
 * Clear cached resources to free up memory
 */
export function clearCaches(): Promise<void> {
  if (!('caches' in window)) {
    return Promise.resolve();
  }
  
  return caches.keys()
    .then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
    .then(() => {
      console.log('[Performance] Caches cleared successfully');
    });
}

/**
 * Optimize images by loading appropriate sizes based on device
 * @param imageUrl Original image URL
 * @param width Desired width
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(imageUrl: string, width: number): string {
  // This is a placeholder implementation
  // In a real app, this would connect to an image optimization service
  // or use responsive image URLs
  
  // For now, we'll just append a width parameter
  if (imageUrl.includes('?')) {
    return `${imageUrl}&w=${width}`;
  }
  return `${imageUrl}?w=${width}`;
}

/**
 * Create a debounced function
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create a throttled function
 * @param func Function to throttle
 * @param limit Limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Check if the device is low-end based on hardware concurrency
 * @returns Whether the device is low-end
 */
export function isLowEndDevice(): boolean {
  // Check for hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    return true;
  }
  
  // Check for device memory
  if ((navigator as any).deviceMemory && (navigator as any).deviceMemory <= 2) {
    return true;
  }
  
  return false;
}

/**
 * Apply performance optimizations based on device capabilities
 */
export function applyAdaptivePerformance(): void {
  const isLowEnd = isLowEndDevice();
  
  if (isLowEnd) {
    console.log('[Performance] Low-end device detected, applying performance optimizations');
    
    // Add a class to the body for CSS optimizations
    document.body.classList.add('low-end-device');
    
    // Disable animations
    document.body.classList.add('reduce-animations');
    
    // Reduce effects
    document.body.classList.add('reduce-effects');
  }
}

// Export a default function to initialize all performance optimizations
export default function initializePerformanceOptimizations(): void {
  initPerformanceMonitoring();
  applyAdaptivePerformance();
  
  // Prefetch common resources
  prefetchResources([
    '/assets/icons/dashboard.svg',
    '/assets/icons/voice.svg',
    '/assets/icons/miranda.svg',
    '/assets/icons/statutes.svg'
  ]);
  
  console.log('[Performance] Performance optimizations initialized');
}
