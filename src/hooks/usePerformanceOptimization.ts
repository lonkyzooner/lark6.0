import { useEffect, useRef } from 'react';
import { 
  trackComponentRender, 
  trackInteraction,
  getPerformanceMetrics,
  isLowEndDevice
} from '../utils/performanceOptimizer';

/**
 * Hook for component performance optimization and tracking
 * @param componentName Name of the component for tracking
 * @returns Performance optimization utilities
 */
export function usePerformanceOptimization(componentName: string) {
  const renderStartTime = useRef(performance.now());
  const isLowEnd = useRef(isLowEndDevice());
  
  // Track component render time
  useEffect(() => {
    trackComponentRender(componentName, renderStartTime.current);
    
    // Reset render start time for next render
    renderStartTime.current = performance.now();
    
    // Cleanup function
    return () => {
      // Track unmount time if needed
      const unmountTime = performance.now() - renderStartTime.current;
      if (unmountTime > 50) {
        console.warn(`[Performance] Slow unmount for ${componentName}: ${unmountTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
  
  /**
   * Track a user interaction
   * @param interactionName Name of the interaction
   */
  const trackUserInteraction = (interactionName: string) => {
    const startTime = performance.now();
    return () => {
      trackInteraction(`${componentName}:${interactionName}`, startTime);
    };
  };
  
  /**
   * Start tracking an interaction
   * @param interactionName Name of the interaction
   * @returns Function to call when interaction is complete
   */
  const startInteractionTracking = (interactionName: string) => {
    const startTime = performance.now();
    return () => {
      trackInteraction(`${componentName}:${interactionName}`, startTime);
    };
  };
  
  /**
   * Check if the component should render certain heavy features
   * @returns Whether to render heavy features
   */
  const shouldRenderHeavyFeatures = () => {
    return !isLowEnd.current;
  };
  
  /**
   * Get the current performance metrics
   * @returns Current performance metrics
   */
  const getMetrics = () => {
    return getPerformanceMetrics();
  };
  
  return {
    trackUserInteraction,
    startInteractionTracking,
    shouldRenderHeavyFeatures,
    isLowEndDevice: isLowEnd.current,
    getMetrics
  };
}

export default usePerformanceOptimization;
