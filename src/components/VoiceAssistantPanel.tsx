import React, { useState, useEffect, useRef } from 'react';

// -------------------------------------------------------------------------
// IMPORTANT: This is a UI SHELL ONLY - No actual API functionality is implemented
// -------------------------------------------------------------------------
// This component provides the UI for the voice assistant but does not implement
// any actual voice processing, command handling, or API calls.
//
// The actual functionality will be implemented by connecting to your backend API.
// This is intentionally left as a placeholder to be integrated with your services.
// -------------------------------------------------------------------------
import { useVoice } from '../contexts/VoiceContext';
import { useLiveKitVoice } from '../hooks/useLiveKitVoice';
import { useSettings } from '../lib/settings-store';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Info,
  FileText,
  BookOpen,
  Shield,
  Search,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

// Define types for voice commands and responses
interface VoiceCommand {
  id: string;
  text: string;
  timestamp: Date;
  confidence: number;
}

interface VoiceResponse {
  id: string;
  text: string;
  timestamp: Date;
  type: 'success' | 'error' | 'info' | 'warning';
  category: 'statute' | 'report' | 'miranda' | 'search' | 'general' | 'system';
  action?: string;
}

interface VoiceInteraction {
  command: VoiceCommand;
  response: VoiceResponse;
}

// Sample voice commands for suggestions
const SAMPLE_COMMANDS = [
  { text: "Look up statute 14:67", category: "statute" },
  { text: "Read Miranda rights in Spanish", category: "miranda" },
  { text: "Start a new incident report", category: "report" },
  { text: "Search for vehicle plate ABC123", category: "search" },
  { text: "What's the weather forecast", category: "general" },
  { text: "Turn on offline mode", category: "system" }
];

export const VoiceAssistantPanel: React.FC = () => {
  const voice = useVoice();
  const liveKitVoice = useLiveKitVoice();
  const { getOfficerCodename } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('interactions');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interactions, setInteractions] = useState<VoiceInteraction[]>([]);
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(20).fill(5));
  const [assistantName, setAssistantName] = useState<string>('LARK');
  const interactionsEndRef = useRef<HTMLDivElement>(null);

  // Get officer's codename for personalization
  useEffect(() => {
    const codename = getOfficerCodename();
    if (codename) {
      setAssistantName(codename);
    }
  }, [getOfficerCodename]);

  // Scroll to bottom when new interactions are added
  useEffect(() => {
    if (interactionsEndRef.current) {
      interactionsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [interactions]);

  // Simulate voice activity visualization
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (voice.isListening) {
      interval = setInterval(() => {
        const newData = Array(20).fill(0).map(() => Math.floor(Math.random() * 30) + 5);
        setVisualizerData(newData);
      }, 100);
    } else {
      setVisualizerData(Array(20).fill(5));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [voice.isListening]);

  // This effect just captures the transcript for display purposes
  // The actual processing will be handled by your API implementation
  useEffect(() => {
    if (voice.transcript && voice.transcript.trim() !== '') {
      // Just create a command object to display what the user said
      // No processing or response generation happens here
      const command: VoiceCommand = {
        id: Date.now().toString(),
        text: voice.transcript,
        timestamp: new Date(),
        confidence: voice.confidence || 0.8
      };

      // In a real implementation, this would be handled by your API
      // For now, we'll just add a placeholder message
      const placeholderResponse: VoiceResponse = {
        id: Date.now().toString(),
        text: "[API integration pending] Your command will be processed by the backend API.",
        timestamp: new Date(),
        type: 'info',
        category: 'system'
      };

      // Add the interaction to the history
      setInteractions(prev => [...prev, { command, response: placeholderResponse }]);

      // Note: The actual API call and response handling will be implemented later
      // No simulated responses or processing is done here
    }
  }, [voice.transcript, voice.confidence]);

  // Get icon for response category
  const getCategoryIcon = (category: VoiceResponse['category']) => {
    switch (category) {
      case 'statute':
        return <BookOpen className="h-4 w-4" />;
      case 'miranda':
        return <Shield className="h-4 w-4" />;
      case 'report':
        return <FileText className="h-4 w-4" />;
      case 'search':
        return <Search className="h-4 w-4" />;
      case 'system':
        return <Info className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Get icon and color for response type
  const getResponseTypeStyles = (type: VoiceResponse['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200'
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-4 w-4" />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Clear all interactions
  const clearInteractions = () => {
    setInteractions([]);
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle voice activation
  const handleVoiceActivation = async () => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      // Request microphone permission if needed
      if (voice.micPermission === 'denied' || voice.micPermission === 'prompt') {
        const granted = await voice.requestMicrophonePermission();
        if (!granted) {
          // Add error interaction
          const errorCommand: VoiceCommand = {
            id: Date.now().toString(),
            text: "Attempted to activate voice",
            timestamp: new Date(),
            confidence: 1.0
          };

          const errorResponse: VoiceResponse = {
            id: Date.now().toString(),
            text: "Microphone access is required for voice commands. Please enable microphone access in your browser settings.",
            timestamp: new Date(),
            type: 'error',
            category: 'system'
          };

          setInteractions(prev => [...prev, { command: errorCommand, response: errorResponse }]);
          return;
        }
      }
      voice.startListening();
    }
  };

  return (
    <div className={`voice-assistant-container fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'w-96' : 'w-auto'}`}>
      {/* Collapsed state - just show the activation button */}
      {!isExpanded && (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleExpanded}
                  className="rounded-full p-4 bg-gradient-to-r from-[#002166] to-[#0046c7] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open Voice Assistant</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Expanded state - show the full interface */}
      {isExpanded && (
        <Card className="fluid-card enhanced-card border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#002166]/10 rounded-full">
                <Sparkles className="h-5 w-5 text-[#002166]" />
              </div>
              <div>
                <CardTitle className="text-[#002166]">{assistantName} Assistant</CardTitle>
                <CardDescription>Voice-activated law enforcement assistant</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpanded}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mx-4 mb-2">
              <TabsTrigger value="interactions" className="data-[state=active]:bg-[#002166] data-[state=active]:text-white">
                Interactions
              </TabsTrigger>
              <TabsTrigger value="help" className="data-[state=active]:bg-[#002166] data-[state=active]:text-white">
                Help
              </TabsTrigger>
            </TabsList>

            <TabsContent value="interactions" className="m-0">
              <CardContent className="p-4 space-y-4">
                {/* Voice visualizer */}
                <div className="voice-visualizer h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {voice.isListening ? (
                    <div className="flex items-center justify-center w-full h-full gap-0.5">
                      {visualizerData.map((height, index) => (
                        <div
                          key={index}
                          className="bg-[#002166] rounded-full w-1"
                          style={{ height: `${height}px`, transition: 'height 0.1s ease-in-out' }}
                        ></div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      <span>Voice assistant ready</span>
                    </div>
                  )}
                </div>

                {/* Transcript display */}
                {voice.isListening && voice.transcript && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 animate-pulse">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Hearing: </span>
                      {voice.transcript}
                    </p>
                    {voice.confidence > 0 && (
                      <div className="mt-1 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${voice.confidence * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}

                {/* Interactions history */}
                <ScrollArea className="h-60 rounded-md border">
                  <div className="p-4 space-y-4">
                    {interactions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <Lightbulb className="h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No interactions yet. Try asking a question or giving a command.</p>
                      </div>
                    ) : (
                      interactions.map(({ command, response }) => (
                        <div key={command.id} className="space-y-2">
                          {/* User command */}
                          <div className="flex items-start gap-2">
                            <div className="bg-gray-100 rounded-full p-1.5 mt-0.5">
                              <Mic className="h-3.5 w-3.5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500">You</p>
                                <p className="text-xs text-gray-400">{formatTime(command.timestamp)}</p>
                              </div>
                              <p className="text-sm">{command.text}</p>
                            </div>
                          </div>

                          {/* Assistant response */}
                          <div className="flex items-start gap-2 pl-6">
                            <div className={`${getResponseTypeStyles(response.type).bgColor} rounded-full p-1.5 mt-0.5`}>
                              {getCategoryIcon(response.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs text-gray-500">{assistantName}</p>
                                  <Badge variant="outline" className="text-[0.65rem] px-1 py-0 h-4">
                                    {response.category}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-400">{formatTime(response.timestamp)}</p>
                              </div>
                              <p className="text-sm">{response.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={interactionsEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
            </TabsContent>

            <TabsContent value="help" className="m-0">
              <CardContent className="p-4 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Voice Command Examples
                  </h3>
                  <ul className="space-y-2">
                    {SAMPLE_COMMANDS.map((command, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                          {getCategoryIcon(command.category as VoiceResponse['category'])}
                        </div>
                        <div>
                          <p className="text-sm text-blue-800">"{command.text}"</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Tips for Better Recognition</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5" />
                      <span>Speak clearly and at a moderate pace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5" />
                      <span>Use command keywords like "lookup", "start", "search"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5" />
                      <span>Reduce background noise when possible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5" />
                      <span>Wait for the listening indicator before speaking</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-between p-4 pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearInteractions}
                className="text-xs"
                disabled={interactions.length === 0}
              >
                Clear History
              </Button>

              {isSpeaking && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (liveKitVoice) {
                      liveKitVoice.stopSpeaking();
                      setIsSpeaking(false);
                    }
                  }}
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  <VolumeX className="h-3.5 w-3.5 mr-1" />
                  Stop Speaking
                </Button>
              )}
            </div>

            <Button
              onClick={handleVoiceActivation}
              className={`rounded-full px-4 py-2 ${
                voice.isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gradient-to-r from-[#002166] to-[#0046c7] hover:from-[#0046c7] hover:to-[#002166] text-white'
              } shadow-md hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-center gap-2">
                {voice.isListening ? (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-400/30 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute inset-0 bg-red-300/30 rounded-full animate-pulse opacity-50"></div>
                      <MicOff className="h-4 w-4 relative z-10" />
                    </div>
                    <span>Stop</span>
                  </>
                ) : voice.micPermission === 'denied' ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    <span>Enable Mic</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    <span>Listen</span>
                  </>
                )}
              </div>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default VoiceAssistantPanel;
