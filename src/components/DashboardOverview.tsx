import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useUserDisplayName } from '../hooks/useUserDisplayName';
import { Button } from './ui/button';
import {
  Bell,
  FileText,
  Mic,
  Shield,
  Users
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  // Use our custom hook to get the user's display name and greeting
  const { displayName, getGreeting } = useUserDisplayName();

  // Function to handle tab navigation
  const navigateToTab = (tabId: string) => {
    // Create and dispatch a custom event to change the active tab
    const event = new CustomEvent('changeTab', { detail: { tabId } });
    document.dispatchEvent(event);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-[#002166]">{getGreeting()}</h2>
        <p className="text-gray-600 mt-1">Welcome to your LARK dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions Card */}
        <Card className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#002166]">Quick Actions</CardTitle>
            <CardDescription>
              Frequently used commands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start bg-gradient-to-r from-[#002166] to-[#0046c7] text-white"
                onClick={() => navigateToTab('miranda')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Miranda Rights
              </Button>
              <Button 
                className="w-full justify-start bg-gradient-to-r from-[#002166] to-[#0046c7] text-white"
                onClick={() => navigateToTab('reports')}
              >
                <FileText className="h-4 w-4 mr-2" />
                New Report
              </Button>
              <Button 
                className="w-full justify-start bg-gradient-to-r from-[#002166] to-[#0046c7] text-white"
                onClick={() => navigateToTab('statutes')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Statute Lookup
              </Button>
              <Button 
                className="w-full justify-start bg-gradient-to-r from-[#002166] to-[#0046c7] text-white"
                onClick={() => navigateToTab('voice')}
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice Assistant
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#002166]">Recent Activity</CardTitle>
            <CardDescription>
              Your recent actions and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Mic className="h-4 w-4 text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Voice command processed</p>
                  <p className="text-xs text-muted-foreground">Statute lookup for RS 14:67</p>
                </div>
                <div className="text-xs text-muted-foreground">2m ago</div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100">
                <div className="p-2 bg-green-100 rounded-full">
                  <FileText className="h-4 w-4 text-green-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Report generated</p>
                  <p className="text-xs text-muted-foreground">Field interview report #F-2023-0426</p>
                </div>
                <div className="text-xs text-muted-foreground">15m ago</div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Bell className="h-4 w-4 text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reminder</p>
                  <p className="text-xs text-muted-foreground">Complete your shift report before end of day</p>
                </div>
                <div className="text-xs text-muted-foreground">1h ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
