// App.tsx - LARK Voice Assistant
import React, { useState, useEffect, lazy, Suspense } from 'react';
import './styles/voice-assistant.css';
import './styles/fluid-theme.css';
import './styles/chat-fix.css';
import './styles/enhanced-ui.css';
import './styles/mobile-optimizations.css'; // Mobile-specific optimizations
// Import smaller components directly
import { VoiceIndicator } from './components/VoiceIndicator';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import LarkLogo from './components/LarkLogo';

// Lazy load larger components
// Use named import for LarkChat to avoid TypeScript issues
import { LarkChat } from './components/LarkChat';
const MirandaRights = lazy(() => import('./components/MirandaRights').then(module => ({ default: module.MirandaRights })));
const RSCodes = lazy(() => import('./components/RSCodes').then(module => ({ default: module.RSCodes })));
const ThreatDetection = lazy(() => import('./components/ThreatDetection').then(module => ({ default: module.ThreatDetection })));
const Tools = lazy(() => import('./components/Tools').then(module => ({ default: module.Tools })));
const Settings = lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));
const FluidDesignDemo = lazy(() => import('./components/FluidDesignDemo').then(module => ({ default: module.FluidDesignDemo })));
// LiveKitRealtimeVoiceTest import removed
const AdvancedDashboard = lazy(() => import('./components/AdvancedDashboard').then(module => ({ default: module.AdvancedDashboard })));
const DashboardOverview = lazy(() => import('./components/DashboardOverview').then(module => ({ default: module.DashboardOverview })));
const VoiceAssistantPanel = lazy(() => import('./components/VoiceAssistantPanel'));
import { LiveKitVoiceProvider } from './contexts/LiveKitVoiceContext';
import ErrorBoundary from './components/ErrorBoundary';
import MirandaErrorBoundary from './components/MirandaErrorBoundary';
import { initNetworkMonitoring } from './utils/networkOptimizer';
import initializePerformanceOptimizations from './utils/performanceOptimizer';
import { initLocationTracking, getCurrentLocation, onLocationUpdate, LocationData } from './utils/locationTracker';
import {
  ShieldIcon,
  BookTextIcon,
  AlertTriangleIcon,
  MicIcon,
  Activity,
  Radio,
  BatteryMedium,
  Clock,
  MapPin,
  WifiIcon,
  CheckCircle2,
  WrenchIcon,
  Settings as SettingsIcon,
  Volume as VolumeUpIcon
} from 'lucide-react';

interface AppProps {
  initialTab?: string;
}

function App({ initialTab = 'voice' }: AppProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  // Fluid design is now the default and only design
  // Removed unused variable: const [showVoiceTest, setShowVoiceTest] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState(87);
  const [connected, setConnected] = useState(true);
  const [location, setLocation] = useState('Baton Rouge, LA');
  // Location state is now managed by the locationTracker utility

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initialize network monitoring, performance optimizations, and location tracking
  useEffect(() => {
    // Initialize network monitoring
    initNetworkMonitoring();

    // Initialize performance optimizations
    initializePerformanceOptimizations();

    // Initialize location tracking
    initLocationTracking().then(success => {
      if (success) {
        console.log('Location tracking initialized successfully');
        // Update location when it changes
        onLocationUpdate((locationData: LocationData) => {
          if (locationData.address) {
            setLocation(locationData.address);
          } else {
            setLocation(`${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`);
          }
        });

        // Set initial location if available
        const initialLocation = getCurrentLocation();
        if (initialLocation && initialLocation.address) {
          setLocation(initialLocation.address);
        } else if (initialLocation) {
          setLocation(`${initialLocation.latitude.toFixed(4)}, ${initialLocation.longitude.toFixed(4)}`);
        }
      } else {
        console.warn('Location tracking initialization failed');
      }
    });
  }, []);

  // Simulate battery drain
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(prev - 1, 5));
    }, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Listen for tab change events from the dashboard
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const { tabId } = event.detail;
      if (tabId && typeof tabId === 'string') {
        setActiveTab(tabId);
      }
    };

    document.addEventListener('changeTab', handleTabChange as EventListener);

    return () => {
      document.removeEventListener('changeTab', handleTabChange as EventListener);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <LiveKitVoiceProvider>
      <div className="min-h-screen fluid-background text-foreground p-4 md:p-6 overflow-hidden antialiased selection:bg-primary/20 selection:text-primary relative" style={{ background: 'linear-gradient(145deg, #edf5fc 0%, #d1e6f9 100%)' }}>
        {/* Decorative wave elements for fluid design */}
        <div className="fluid-wave"></div>
        <div className="fluid-wave-gold"></div>
        {/* Voice detection indicator - shows when voice is detected */}
        <VoiceIndicator />

        {/* Enhanced Voice Assistant Panel */}
        <Suspense fallback={null}>
          <VoiceAssistantPanel />
        </Suspense>
        <div className="max-w-6xl mx-auto relative">
        {/* Enhanced background accents for visual interest */}
                {/* Modern header with sleek design */}
        <header className="mb-8 relative fluid-card enhanced-header rounded-2xl p-4 border border-[rgba(255,255,255,0.6)] backdrop-blur-lg shadow-lg transform transition-all duration-300 hover:shadow-xl" style={{ background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(16px)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md group-hover:blur-xl transition-all duration-500 opacity-0 group-hover:opacity-70"></div>
                <LarkLogo width={60} height={60} className="mr-1 relative z-10 transition-transform duration-500 transform group-hover:scale-105" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground tracking-tight leading-none flex items-center">
                  <span className="fluid-heading bg-clip-text text-transparent bg-gradient-to-r from-[#002166] to-[#0046c7]">LARK</span>
                  <span className="ml-2 text-xs font-medium fluid-badge px-2 py-1 rounded-full shadow-md">1.0</span>
                </h1>
                <p className="text-muted-foreground text-sm font-light tracking-wide mt-1">
                  Law Enforcement Assistance and Response Kit
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0 w-full md:w-auto">
              {/* Location indicator */}
              <div className="flex items-center px-4 py-2 rounded-full bg-white/80 text-card-foreground border border-white/30 shadow-sm transition-all hover:bg-white/90 hover:shadow-md group hover-lift active-press">
                <MapPin className="w-4 h-4 text-black/70 group-hover:text-black" />
                <span className="text-foreground text-sm font-medium ml-2 group-hover:text-black">{location}</span>
              </div>

              {/* Status indicators group */}
              <div className="flex items-center gap-4 px-5 py-2 rounded-full bg-white/80 text-card-foreground border border-white/30 shadow-sm backdrop-blur-sm hover:bg-white/90 hover:shadow-md transition-all duration-300 hover-lift active-press">
                {/* Time */}
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground text-sm font-medium ml-1.5 font-mono">{formatTime(currentTime)}</span>
                </div>

                <span className="w-[1px] h-4 bg-border"></span>

                {/* Battery */}
                <div className="flex items-center gap-1.5">
                  <BatteryMedium
                    className={`w-4 h-4 ${batteryLevel < 20 ? 'text-destructive' : batteryLevel > 50 ? 'text-success' : 'text-warning'}`}
                  />
                  <span className={`text-xs font-medium ml-0.5 ${batteryLevel < 20 ? 'text-destructive' : batteryLevel > 50 ? 'text-foreground' : 'text-warning'}`}>
                    {batteryLevel}%
                  </span>
                </div>

                {/* Connection status */}
                {connected ? (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      <span className="status-indicator online"></span>
                      <span className="text-xs font-medium text-success">Online</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      <span className="status-indicator offline"></span>
                      <span className="text-xs font-medium text-destructive">Offline</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="relative mb-8 space-y-6 z-10">
          {/* Dashboard and Performance Monitor removed as requested */}


          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 fluid-glass enhanced-card rounded-2xl p-3 flex flex-wrap md:flex-nowrap justify-between border border-[rgba(255,255,255,0.5)] shadow-lg gap-2 backdrop-blur-lg sticky top-0 z-20 bg-white/30 transition-all duration-300 hover:shadow-xl TabsList">
              <TabsTrigger
                value="dashboard"
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press TabsTrigger"
                style={{ color: activeTab === 'dashboard' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/30 rounded-full p-1.5 shadow-inner data-[state=active]:bg-white/40">
                    <Activity className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Dashboard</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="voice"
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press TabsTrigger"
                style={{ color: activeTab === 'voice' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/30 rounded-full p-1.5 shadow-inner data-[state=active]:bg-white/40">
                    <MicIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Assistant</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="miranda"
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] TabsTrigger"
                style={{ color: activeTab === 'miranda' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/30 rounded-full p-1.5 shadow-inner data-[state=active]:bg-white/40">
                    <BookTextIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Miranda</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="statutes"
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] TabsTrigger"
                style={{ color: activeTab === 'statutes' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/30 rounded-full p-1.5 shadow-inner data-[state=active]:bg-white/40">
                    <ShieldIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Statutes</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="threats"
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] TabsTrigger"
                style={{ color: activeTab === 'threats' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/30 rounded-full p-1.5 shadow-inner data-[state=active]:bg-white/40">
                    <AlertTriangleIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Threats</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="tools"
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] TabsTrigger"
                style={{ color: activeTab === 'tools' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/30 rounded-full p-1.5 shadow-inner data-[state=active]:bg-white/40">
                    <WrenchIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Tools</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] TabsTrigger"
                style={{ color: activeTab === 'settings' ? 'white' : 'inherit' }}
              >
                <div className="flex items-center justify-center gap-2 w-full">
                  <div className="bg-white/30 rounded-full p-1.5 shadow-inner data-[state=active]:bg-white/40">
                    <SettingsIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">Settings</span>
                </div>
              </TabsTrigger>

            </TabsList>

            <div className="api-key-warning">
              <AlertTriangleIcon className="api-key-warning-icon h-5 w-5" />
              <span className="api-key-warning-text">API key configuration is missing. Using offline mode only.</span>
            </div>

            <div className="fluid-card enhanced-card rounded-xl overflow-hidden border border-[rgba(255,255,255,0.5)] shadow-lg backdrop-blur-lg bg-opacity-95 transition-all duration-300 hover:shadow-xl" style={{ background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(16px)' }}>
              <TabsContent value="dashboard" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <ErrorBoundary
                  onError={(error, errorInfo) => {
                    console.error('Dashboard Error:', error);
                    console.error('Component Stack:', errorInfo.componentStack);
                  }}
                  fallback={
                    <div className="p-6 text-center">
                      <p className="text-red-500 mb-2">There was an error loading the dashboard.</p>
                      <Button onClick={() => window.location.reload()}>Reload</Button>
                    </div>
                  }
                >
                  <Suspense fallback={<div className="p-8 text-center">Loading dashboard...</div>}>
                    <DashboardOverview />
                  </Suspense>
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="voice" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <ErrorBoundary
                  onError={(error, errorInfo) => {
                    console.error('Voice Assistant Error:', error);
                    console.error('Component Stack:', errorInfo.componentStack);
                  }}
                  fallback={
                    <div className="p-6 text-center">
                      <h2 className="text-xl font-semibold text-destructive mb-3">Voice Assistant Error</h2>
                      <p className="mb-4 text-muted-foreground">The voice assistant encountered an error. Please try refreshing the page.</p>
                      <Button
                        onClick={() => window.location.reload()}
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        Reload Application
                      </Button>
                    </div>
                  }
                >
                  <MirandaErrorBoundary
                    onMirandaError={(error) => {
                      console.error('Miranda functionality error:', error);
                      // Try to dispatch a fallback event to ensure Miranda rights can still be triggered
                      try {
                        document.dispatchEvent(new CustomEvent('mirandaErrorRecovery', {
                          detail: { timestamp: Date.now() }
                        }));
                      } catch (e) {
                        console.error('Failed to dispatch recovery event:', e);
                      }
                    }}
                  >
                    <Suspense fallback={<div className="p-8 text-center">Loading voice assistant...</div>}>
                      <LarkChat />
                    </Suspense>
                  </MirandaErrorBoundary>
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="miranda" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <Suspense fallback={<div className="p-8 text-center">Loading Miranda Rights...</div>}>
                  <MirandaRights />
                </Suspense>
              </TabsContent>

              <TabsContent value="statutes" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <Suspense fallback={<div className="p-8 text-center">Loading Statutes...</div>}>
                  <RSCodes />
                </Suspense>
              </TabsContent>

              <TabsContent value="threats" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <Suspense fallback={<div className="p-8 text-center">Loading Threat Detection...</div>}>
                  <ThreatDetection />
                </Suspense>
              </TabsContent>

              <TabsContent value="tools" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <Suspense fallback={<div className="p-8 text-center">Loading Tools...</div>}>
                  <Tools />
                </Suspense>
              </TabsContent>

              <TabsContent value="settings" className="focus-visible:outline-none focus-visible:ring-0 m-0 animate-in fade-in-50 data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0 data-[state=active]:duration-300">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <Suspense fallback={<div className="p-4 text-center">Loading Settings...</div>}>
                        <Settings />
                      </Suspense>
                    </div>
                    {/* Voice System Test section removed */}
                  </div>
                </div>
              </TabsContent>


            </div>
          </Tabs>
        </main>

        {/* Status indicators removed as requested */}

        <footer className="mt-8 text-center text-xs text-muted-foreground pt-6 border-t border-border">
          <p className="flex items-center justify-center gap-1 font-medium">
            <span>© 2025 Zooner Enterprises</span>
            <span className="text-border/80">•</span>
            <span>All Rights Reserved</span>
          </p>
        </footer>
      </div>
      </div>
    </LiveKitVoiceProvider>
  );
}

export default App;
