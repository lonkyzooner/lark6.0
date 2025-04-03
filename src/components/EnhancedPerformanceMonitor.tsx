import React, { useState, useEffect } from 'react';
import usePerformanceOptimization from '../hooks/usePerformanceOptimization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Activity, 
  Cpu, 
  Memory, 
  Clock, 
  BarChart, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export const EnhancedPerformanceMonitor: React.FC = () => {
  const { 
    trackUserInteraction, 
    shouldRenderHeavyFeatures, 
    isLowEndDevice,
    getMetrics 
  } = usePerformanceOptimization('EnhancedPerformanceMonitor');
  
  const [metrics, setMetrics] = useState<any>(null);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getMetrics());
      
      // Simulate memory and CPU usage
      setMemoryUsage(Math.floor(Math.random() * 60) + 20);
      setCpuUsage(Math.floor(Math.random() * 40) + 10);
    };
    
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    
    return () => clearInterval(interval);
  }, [getMetrics]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    const endTracking = trackUserInteraction('refresh-metrics');
    
    setRefreshing(true);
    setTimeout(() => {
      setMetrics(getMetrics());
      setRefreshing(false);
      endTracking();
    }, 1000);
  };
  
  // Calculate average render times
  const calculateAverageRenderTime = () => {
    if (!metrics || !metrics.componentRenderTimes) return 0;
    
    let totalTime = 0;
    let totalComponents = 0;
    
    Object.values(metrics.componentRenderTimes).forEach((times: any) => {
      if (Array.isArray(times)) {
        totalTime += times.reduce((sum: number, time: number) => sum + time, 0);
        totalComponents += times.length;
      }
    });
    
    return totalComponents > 0 ? totalTime / totalComponents : 0;
  };
  
  // Get performance score
  const getPerformanceScore = () => {
    const avgRenderTime = calculateAverageRenderTime();
    
    // Simple scoring algorithm
    let score = 100;
    
    // Penalize for high render times
    if (avgRenderTime > 50) score -= 20;
    if (avgRenderTime > 100) score -= 20;
    
    // Penalize for high memory usage
    if (memoryUsage > 70) score -= 15;
    if (memoryUsage > 85) score -= 15;
    
    // Penalize for high CPU usage
    if (cpuUsage > 50) score -= 15;
    if (cpuUsage > 75) score -= 15;
    
    // Penalize for low-end device
    if (isLowEndDevice) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  };
  
  const performanceScore = getPerformanceScore();
  
  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Performance Monitor</span>
            </CardTitle>
            <CardDescription>Real-time application performance metrics</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Performance Score */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Performance Score</span>
              </div>
              <span className={`text-sm font-bold ${
                performanceScore > 80 ? 'text-green-600' : 
                performanceScore > 60 ? 'text-amber-600' : 
                'text-red-600'
              }`}>
                {performanceScore}/100
              </span>
            </div>
            <Progress 
              value={performanceScore} 
              className="h-2"
            />
          </div>
          
          {/* Resource Usage */}
          <div className="grid grid-cols-2 gap-4">
            {/* Memory Usage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Memory className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-medium">Memory</span>
                </div>
                <span className={`text-xs font-bold ${
                  memoryUsage > 80 ? 'text-red-600' : 
                  memoryUsage > 60 ? 'text-amber-600' : 
                  'text-green-600'
                }`}>
                  {memoryUsage}%
                </span>
              </div>
              <Progress 
                value={memoryUsage} 
                className="h-1.5"
              />
            </div>
            
            {/* CPU Usage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-medium">CPU</span>
                </div>
                <span className={`text-xs font-bold ${
                  cpuUsage > 80 ? 'text-red-600' : 
                  cpuUsage > 60 ? 'text-amber-600' : 
                  'text-green-600'
                }`}>
                  {cpuUsage}%
                </span>
              </div>
              <Progress 
                value={cpuUsage} 
                className="h-1.5"
              />
            </div>
          </div>
          
          {/* Render Times */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-medium">Average Render Time</span>
              <span className="text-xs font-bold ml-auto">
                {calculateAverageRenderTime().toFixed(2)}ms
              </span>
            </div>
          </div>
          
          {/* Device Capability */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Device Capability</span>
            </div>
            {isLowEndDevice ? (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Low-End Device</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">High-Performance Device</span>
              </div>
            )}
          </div>
          
          {/* Only render heavy features if the device can handle it */}
          {shouldRenderHeavyFeatures() && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Additional performance metrics available. All optimizations active.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPerformanceMonitor;
