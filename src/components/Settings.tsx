import React, { useState, useEffect } from 'react';
import { useSettings } from '../lib/settings-store';
import { useAccessibility } from '../hooks/useAccessibility';
import { useVoice } from '../contexts/VoiceContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  User,
  Save,
  Volume2,
  Mic,
  UserCircle,
  WifiOff,
  MessageSquare,
  Check,
  HelpCircle,
  RefreshCw,
  Accessibility
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';

export function Settings() {
  // Get settings from hooks
  const { settings, updateOfficerName, updateOfficerRank, updateOfficerCodename, updateVoicePreferences, updateOfflineMode, updateCommandContext } = useSettings();
  const { settings: accessibilitySettings, updateSetting, resetSettings } = useAccessibility();
  const { speak } = useVoice();

  // Local state for form values
  const [localName, setLocalName] = useState(settings.officerName);
  const [localRank, setLocalRank] = useState(settings.officerRank || 'Officer');
  const [localCodename, setLocalCodename] = useState(settings.officerCodename || '');

  // State for UI feedback
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Test voice settings with current configuration
  const testVoiceSettings = async () => {
    const greeting = settings.officerName
      ? `Hello ${settings.officerName}, this is how I will sound with the current settings.`
      : 'This is how I will sound with the current settings.';
    await speak(greeting);
  };

  // Save officer profile when input is complete
  const handleProfileSave = () => {
    // Trim values to remove extra spaces
    const trimmedName = localName.trim();
    const trimmedRank = localRank.trim();
    const trimmedCodename = localCodename.trim();

    // Update state with trimmed values
    updateOfficerName(trimmedName);
    updateOfficerRank(trimmedRank);
    updateOfficerCodename(trimmedCodename);

    // Store to localStorage with trimmed values for redundancy
    localStorage.setItem('lark-officer-name', trimmedName);
    localStorage.setItem('lark-officer-rank', trimmedRank);
    localStorage.setItem('lark-officer-codename', trimmedCodename);

    // Construct appropriate greeting using rank and name or codename
    let greeting = '';
    let displayName = '';

    if (trimmedCodename) {
      // Codename takes priority when set
      displayName = trimmedCodename;
      greeting = `Thank you, I'll remember to call you ${displayName}.`;
    } else if (trimmedName) {
      // When no codename, use rank and name
      displayName = `${trimmedRank} ${trimmedName}`;
      greeting = `Thank you, I'll address you as ${displayName}.`;
    } else {
      greeting = 'Profile updated successfully.';
    }

    // Display confirmation to user
    speak(greeting);

    // Update local state with trimmed values
    setLocalName(trimmedName);
    setLocalRank(trimmedRank);
    setLocalCodename(trimmedCodename);

    // Show success message
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);

    // Notify other components about the profile update
    document.dispatchEvent(new CustomEvent('officerProfileUpdated', {
      detail: {
        name: trimmedName,
        rank: trimmedRank,
        codename: trimmedCodename,
        displayName: displayName || trimmedRank // Fallback to rank if nothing else
      }
    }));
  };

  // Load profile from localStorage on component mount
  useEffect(() => {
    // Load name
    const savedName = localStorage.getItem('lark-officer-name');
    if (savedName && savedName !== settings.officerName) {
      setLocalName(savedName);
      updateOfficerName(savedName);
    }

    // Load rank
    const savedRank = localStorage.getItem('lark-officer-rank');
    if (savedRank && savedRank !== settings.officerRank) {
      setLocalRank(savedRank);
      updateOfficerRank(savedRank);
    }

    // Load codename
    const savedCodename = localStorage.getItem('lark-officer-codename');
    if (savedCodename && savedCodename !== settings.officerCodename) {
      setLocalCodename(savedCodename);
      updateOfficerCodename(savedCodename);
    }
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#002166] to-[#0046c7]">Settings</h2>
          {showSaveSuccess && (
            <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300 animate-in fade-in slide-in-from-top-5 duration-300">
              <Check size={12} />
              <span>Saved successfully</span>
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 rounded-full border-white/50 shadow-md hover:bg-white/80 hover-lift active-press"
          onClick={() => window.open(window.location.origin + '/account', '_blank')}
        >
          <User size={16} />
          <span>Account</span>
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 fluid-glass enhanced-card rounded-2xl p-2 flex flex-wrap md:flex-nowrap justify-between border border-[rgba(255,255,255,0.5)] shadow-lg gap-2 backdrop-blur-lg bg-white/30 transition-all duration-300 hover:shadow-xl">
          <TabsTrigger
            value="profile"
            className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press flex items-center justify-center gap-2"
            onClick={() => setActiveTab('profile')}
          >
            <UserCircle className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="voice"
            className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press flex items-center justify-center gap-2"
            onClick={() => setActiveTab('voice')}
          >
            <Volume2 className="h-4 w-4" />
            <span>Voice</span>
          </TabsTrigger>
          <TabsTrigger
            value="offline"
            className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press flex items-center justify-center gap-2"
            onClick={() => setActiveTab('offline')}
          >
            <WifiOff className="h-4 w-4" />
            <span>Offline Mode</span>
          </TabsTrigger>
          <TabsTrigger
            value="commands"
            className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press flex items-center justify-center gap-2"
            onClick={() => setActiveTab('commands')}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Commands</span>
          </TabsTrigger>
          <TabsTrigger
            value="accessibility"
            className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press flex items-center justify-center gap-2"
            onClick={() => setActiveTab('accessibility')}
          >
            <Accessibility className="h-4 w-4" />
            <span>Accessibility</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <UserCircle className="h-6 w-6 text-[#002166]" />
                <div>
                  <CardTitle className="text-[#002166]">User Profile</CardTitle>
                  <CardDescription>
                    Configure how LARK addresses you
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="officerRank" className="flex items-center gap-2 text-[#002166] font-medium">
                    Rank
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-sm">Select your official rank in the department</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Select
                    value={localRank}
                    onValueChange={setLocalRank}
                  >
                    <SelectTrigger id="officerRank" className="w-full border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300">
                      <SelectValue placeholder="Select your rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Officer">Officer</SelectItem>
                      <SelectItem value="Deputy">Deputy</SelectItem>
                      <SelectItem value="Sergeant">Sergeant</SelectItem>
                      <SelectItem value="Corporal">Corporal</SelectItem>
                      <SelectItem value="Detective">Detective</SelectItem>
                      <SelectItem value="Lieutenant">Lieutenant</SelectItem>
                      <SelectItem value="Captain">Captain</SelectItem>
                      <SelectItem value="Chief">Chief</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officerName" className="flex items-center gap-2 text-[#002166] font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="officerName"
                    placeholder="Enter your last name"
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officerCodename" className="flex items-center gap-2 text-[#002166] font-medium">
                    Codename (Optional)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[200px] text-sm">If provided, LARK will call you by this name instead of your rank and last name</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="officerCodename"
                    placeholder="Enter a preferred name"
                    value={localCodename}
                    onChange={(e) => setLocalCodename(e.target.value)}
                    className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    If provided, LARK will call you this instead of your rank and name
                  </p>
                </div>

                <Button
                  onClick={handleProfileSave}
                  className="mt-4 w-full bg-gradient-to-r from-[#002166] to-[#0046c7] hover:from-[#0046c7] hover:to-[#002166] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active-press flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <Card className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-[#002166]" />
                <div>
                  <CardTitle className="text-[#002166]">Voice Settings</CardTitle>
                  <CardDescription>
                    Customize LARK's voice behavior
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md mb-2">
                <p className="text-sm text-blue-700">Voice settings affect how LARK speaks to you. Adjust these settings to your preference.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">Volume</Label>
                    <Badge variant="outline" className="bg-white/80 border-white/50">
                      {Math.round(settings.voicePreferences.volume * 100)}%
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.voicePreferences.volume * 100]}
                    onValueChange={(value) =>
                      updateVoicePreferences({ volume: value[0] / 100 })
                    }
                    max={100}
                    step={1}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">Speed</Label>
                    <Badge variant="outline" className="bg-white/80 border-white/50">
                      {Math.round(settings.voicePreferences.speed * 100)}%
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.voicePreferences.speed * 100]}
                    onValueChange={(value) =>
                      updateVoicePreferences({ speed: value[0] / 100 })
                    }
                    max={200}
                    step={1}
                    className="py-2"
                  />
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">Urgency Levels</Label>
                    <p className="text-xs text-muted-foreground mt-1">Adjust voice tone based on urgency of information</p>
                  </div>
                  <Switch
                    checked={settings.voicePreferences.urgencyLevels}
                    onCheckedChange={(checked) =>
                      updateVoicePreferences({ urgencyLevels: checked })
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">Adaptive Speed</Label>
                    <p className="text-xs text-muted-foreground mt-1">Automatically adjust speech rate based on content</p>
                  </div>
                  <Switch
                    checked={settings.voicePreferences.adaptiveSpeed}
                    onCheckedChange={(checked) =>
                      updateVoicePreferences({ adaptiveSpeed: checked })
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">Audio Feedback</Label>
                    <p className="text-xs text-muted-foreground mt-1">Play subtle sounds for actions and events</p>
                  </div>
                  <Switch
                    checked={settings.voicePreferences.audioFeedback}
                    onCheckedChange={(checked) =>
                      updateVoicePreferences({ audioFeedback: checked })
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[#002166] font-medium">
                  Voice Synthesis Method
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[250px] text-sm">LiveKit provides higher quality voices but requires microphone access. Browser synthesis works without permissions.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select
                  value={settings.voicePreferences.synthesisMethod}
                  onValueChange={(value: 'livekit' | 'browser' | 'auto') =>
                    updateVoicePreferences({ synthesisMethod: value })
                  }
                >
                  <SelectTrigger className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300">
                    <SelectValue placeholder="Select voice synthesis method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="livekit">LiveKit (Requires Microphone)</SelectItem>
                    <SelectItem value="browser">Browser Speech Synthesis</SelectItem>
                    <SelectItem value="auto">Auto (Fallback to Browser)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  LiveKit provides higher quality voices but requires microphone access. Browser synthesis works without permissions.
                </p>
              </div>

              <Button
                onClick={testVoiceSettings}
                className="mt-4 w-full bg-gradient-to-r from-[#002166] to-[#0046c7] hover:from-[#0046c7] hover:to-[#002166] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active-press flex items-center justify-center gap-2"
              >
                <Mic className="h-4 w-4" />
                Test Voice Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline">
          <Card className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <WifiOff className="h-6 w-6 text-[#002166]" />
                <div>
                  <CardTitle className="text-[#002166]">Offline Mode</CardTitle>
                  <CardDescription>
                    Configure offline capabilities
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-md mb-2">
                <p className="text-sm text-amber-700">Offline mode allows LARK to function without an internet connection. Cached data will be stored on your device.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">Enable Cache</Label>
                    <p className="text-xs text-muted-foreground mt-1">Store data locally for offline use</p>
                  </div>
                  <Switch
                    checked={settings.offlineMode.enableCache}
                    onCheckedChange={(checked) =>
                      updateOfflineMode({ enableCache: checked })
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">
                      Cache Statutes
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[200px] text-sm">Store statute information locally for offline access</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Store legal statutes for offline reference</p>
                  </div>
                  <Switch
                    checked={settings.offlineMode.cacheStatutes}
                    onCheckedChange={(checked) =>
                      updateOfflineMode({ cacheStatutes: checked })
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">Cache Miranda Rights</Label>
                    <p className="text-xs text-muted-foreground mt-1">Store Miranda Rights text for offline use</p>
                  </div>
                  <Switch
                    checked={settings.offlineMode.cacheMiranda}
                    onCheckedChange={(checked) =>
                      updateOfflineMode({ cacheMiranda: checked })
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[#002166] font-medium">Max Cache Size (MB)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={settings.offlineMode.maxCacheSize}
                    onChange={(e) =>
                      updateOfflineMode({ maxCacheSize: parseInt(e.target.value) || 100 })
                    }
                    min={50}
                    max={1000}
                    className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input"
                  />
                  <Badge variant="outline" className="bg-white/80 border-white/50 whitespace-nowrap">
                    {settings.offlineMode.maxCacheSize} MB
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 100MB minimum. Larger values allow more data to be stored offline.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands">
          <Card className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-[#002166]" />
                <div>
                  <CardTitle className="text-[#002166]">Command Context</CardTitle>
                  <CardDescription>
                    Configure how LARK maintains conversation context
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-md mb-2">
                <p className="text-sm text-indigo-700">Command context settings determine how LARK remembers previous commands and maintains conversation flow.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">
                      Enable Command Chaining
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[250px] text-sm">When enabled, LARK will remember previous commands and maintain context between interactions.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Allow LARK to remember previous commands</p>
                  </div>
                  <Switch
                    checked={settings.commandContext.enableChaining}
                    onCheckedChange={(checked) =>
                      updateCommandContext({ enableChaining: checked })
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-[#002166] font-medium">Context Timeout (seconds)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={settings.commandContext.contextTimeout}
                      onChange={(e) =>
                        updateCommandContext({ contextTimeout: parseInt(e.target.value) || 300 })
                      }
                      min={60}
                      max={3600}
                      className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input"
                    />
                    <Badge variant="outline" className="bg-white/80 border-white/50 whitespace-nowrap">
                      {Math.floor(settings.commandContext.contextTimeout / 60)} min
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    How long LARK should remember previous commands (60-3600 seconds)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-[#002166] font-medium">Max Context Length</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={settings.commandContext.maxContextLength}
                      onChange={(e) =>
                        updateCommandContext({ maxContextLength: parseInt(e.target.value) || 5 })
                      }
                      min={1}
                      max={10}
                      className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input"
                    />
                    <Badge variant="outline" className="bg-white/80 border-white/50 whitespace-nowrap">
                      {settings.commandContext.maxContextLength} commands
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum number of previous commands to remember (1-10)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility">
          <Card className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Accessibility className="h-6 w-6 text-[#002166]" />
                <div>
                  <CardTitle className="text-[#002166]">Accessibility</CardTitle>
                  <CardDescription>
                    Configure accessibility features
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-md mb-2">
                <p className="text-sm text-green-700">Accessibility settings help make LARK more usable for everyone. These settings can improve your experience based on your needs.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">High Contrast</Label>
                    <p className="text-xs text-muted-foreground mt-1">Increase contrast for better visibility</p>
                  </div>
                  <Switch
                    checked={accessibilitySettings.highContrast}
                    onCheckedChange={(checked) =>
                      updateSetting('highContrast', checked)
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">Large Text</Label>
                    <p className="text-xs text-muted-foreground mt-1">Increase text size throughout the app</p>
                  </div>
                  <Switch
                    checked={accessibilitySettings.largeText}
                    onCheckedChange={(checked) =>
                      updateSetting('largeText', checked)
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">Reduce Motion</Label>
                    <p className="text-xs text-muted-foreground mt-1">Minimize animations and motion effects</p>
                  </div>
                  <Switch
                    checked={accessibilitySettings.reduceMotion}
                    onCheckedChange={(checked) =>
                      updateSetting('reduceMotion', checked)
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">
                      Text-to-Speech
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-[250px] text-sm">When enabled, LARK will read text aloud to assist users with visual impairments.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Read text content aloud</p>
                  </div>
                  <Switch
                    checked={accessibilitySettings.textToSpeech}
                    onCheckedChange={(checked) =>
                      updateSetting('textToSpeech', checked)
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">Voice Control</Label>
                    <p className="text-xs text-muted-foreground mt-1">Control LARK using voice commands</p>
                  </div>
                  <Switch
                    checked={accessibilitySettings.voiceControl}
                    onCheckedChange={(checked) =>
                      updateSetting('voiceControl', checked)
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label className="flex items-center gap-2 text-[#002166] font-medium">Simplified UI</Label>
                    <p className="text-xs text-muted-foreground mt-1">Use a simpler interface with fewer visual elements</p>
                  </div>
                  <Switch
                    checked={accessibilitySettings.simplifiedUI}
                    onCheckedChange={(checked) =>
                      updateSetting('simplifiedUI', checked)
                    }
                    className="data-[state=checked]:bg-[#002166]"
                  />
                </div>
              </div>

              <Button
                onClick={resetSettings}
                className="mt-4 w-full bg-gradient-to-r from-[#002166] to-[#0046c7] hover:from-[#0046c7] hover:to-[#002166] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.01] active-press flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset to Default Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
