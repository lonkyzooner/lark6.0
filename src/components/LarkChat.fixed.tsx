import React, { useState, useRef, useEffect, useCallback, useContext, useMemo, memo } from 'react';
import '../styles/chat-fix.css';
import VoiceContext from '../contexts/VoiceContext';
import LiveKitVoiceContext from '../contexts/LiveKitVoiceContext';
import { useSettings } from '../lib/settings-store';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { SendIcon, VolumeIcon, StopCircleIcon, Mic, MicOff, AlertCircle, Info, MessageSquare } from 'lucide-react';
import { saveMessage, getMessages, queueOfflineMessage, getOfflineQueue, clearOfflineQueue } from '../lib/chat-storage';
import { queryOpenAI } from '../utils/openAIService';
import { huggingFaceService } from '../services/huggingface/HuggingFaceService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

type ChatHistory = Message[];

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Memoized message component to prevent unnecessary re-renders
const MessageBubble = memo(({ message, onSpeakText }: { message: Message, onSpeakText: (text: string) => void }) => {
  // Format the timestamp
  const formattedTime = useMemo(() => {
    const date = new Date(message.timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }, [message.timestamp]);

  return (
    <div className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'assistant' && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#002166] to-[#0046c7] flex items-center justify-center text-white font-semibold shadow-md ring-2 ring-white/50 transform transition-all duration-300 hover:scale-105">
            L
          </div>
        </div>
      )}

      <div
        className={`max-w-[85%] px-5 py-4 rounded-2xl shadow-lg ${
          message.role === 'user'
            ? 'bg-gradient-to-br from-[#002166] to-[#0046c7] text-white rounded-tr-none border border-blue-400/20 hover:shadow-blue-200/20 hover:shadow-xl transition-all duration-300'
            : 'bg-white/95 text-gray-800 rounded-tl-none border border-gray-200/50 backdrop-blur-lg hover:shadow-xl transition-all duration-300'
        }`}
      >
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs opacity-70">{message.role === 'assistant' ? 'LARK' : 'You'}</span>
            <span className="text-xs opacity-70">{formattedTime}</span>
          </div>
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.role === 'assistant' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSpeakText(message.content)}
                    className="self-end mt-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                  >
                    <VolumeIcon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Read this message aloud</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {message.role === 'user' && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 font-semibold shadow-sm">
            U
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the message content or timestamp changes
  return prevProps.message.content === nextProps.message.content &&
         prevProps.message.timestamp === nextProps.message.timestamp;
});

export const LarkChat: React.FC = () => {
  const voice = useContext(VoiceContext);
  const liveKitVoice = useContext(LiveKitVoiceContext);
  const { getOfficerName, getOfficerRank, getOfficerCodename } = useSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null); // Add info message state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInitialized, setIsInitialized] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  // Initialize OpenAI Chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('Initializing OpenAI chat model...');

        // Set initialized to true regardless of outcome to allow offline functionality
        setIsInitialized(true);

        if (!OPENAI_API_KEY) {
          console.error('OpenAI API key is missing. Please check your environment variables.');
          setError('API key configuration is missing. Using offline mode only.');
          setTimeout(() => setError(null), 5000);
          return;
        }

        // Load chat history from local storage
        const savedMessages = await getMessages();
        if (savedMessages && savedMessages.length > 0) {
          setMessages(savedMessages);
        }

        // Process any queued offline messages
        if (navigator.onLine) {
          const offlineQueue = await getOfflineQueue();
          if (offlineQueue && offlineQueue.length > 0) {
            setInfo(`Processing ${offlineQueue.length} offline message(s)...`);

            for (const item of offlineQueue) {
              try {
                const response = await queryOpenAI(item.message);
                if (response) {
                  const newMessage: Message = {
                    role: 'assistant',
                    content: response,
                    timestamp: Date.now()
                  };

                  await saveMessage(newMessage);
                  setMessages(prev => [...prev, newMessage]);
                }
              } catch (err) {
                console.error('Error processing offline message:', err);
              }
            }

            await clearOfflineQueue();
            setInfo('Offline messages processed successfully.');
            setTimeout(() => setInfo(null), 3000);
          }
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Failed to initialize chat. Please try again later.');
        setTimeout(() => setError(null), 5000);
      }
    };

    initializeChat();

    // Set up online/offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      setInfo('You are back online. Offline messages will be processed.');
      setTimeout(() => setInfo(null), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setInfo('You are offline. Messages will be queued for later processing.');
      setTimeout(() => setInfo(null), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Save user message to local storage
      await saveMessage(userMessage);

      if (!isOnline || !OPENAI_API_KEY) {
        // Queue message for later if offline or no API key
        await queueOfflineMessage(userMessage.content);
        setInfo(isOnline ? 'No API key available. Message queued for later.' : 'You are offline. Message queued for later processing.');
        setTimeout(() => setInfo(null), 3000);
        setIsProcessing(false);
        return;
      }

      // Get response from OpenAI
      const response = await queryOpenAI(userMessage.content);

      if (response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response,
          timestamp: Date.now()
        };

        // Add assistant message to chat
        setMessages(prev => [...prev, assistantMessage]);

        // Save assistant message to local storage
        await saveMessage(assistantMessage);
      }
    } catch (err) {
      console.error('Error processing message:', err);
      setError('Failed to process message. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle speaking text
  const speakText = useCallback((text: string) => {
    if (isSpeaking) {
      // Stop current speech
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    // Try to use LiveKit voice if available
    if (liveKitVoice && liveKitVoice.speak) {
      liveKitVoice.speak(text, () => {
        setIsSpeaking(false);
      });
      return;
    }

    // Fallback to browser speech synthesis
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setError('Speech synthesis failed. Please try again.');
        setTimeout(() => setError(null), 3000);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
      setError('Speech synthesis is not supported in this browser.');
      setTimeout(() => setError(null), 3000);
    }
  }, [isSpeaking, liveKitVoice]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Create error message component
  const errorMessage = useMemo(() => {
    if (!error) return null;
    return (
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center space-x-3 animate-in fade-in duration-300 shadow-md backdrop-blur-sm">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }, [error]);

  // Create info message component
  const infoMessage = useMemo(() => {
    if (!info) return null;
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg flex items-center space-x-3 animate-in fade-in duration-300 shadow-md backdrop-blur-sm">
        <Info className="h-5 w-5 flex-shrink-0" />
        <span>{info}</span>
      </div>
    );
  }, [info]);

  // Memoize the message list to prevent re-renders when other state changes
  const messageList = useMemo(() => {
    return messages.map((message, index) => (
      <MessageBubble
        key={`${message.timestamp}-${index}`}
        message={message}
        onSpeakText={speakText}
      />
    ));
  }, [messages, speakText]);

  return (
    <div className="chat-container max-w-2xl mx-auto p-4 space-y-4">
      {/* Error message */}
      {errorMessage}

      {/* Info message */}
      {infoMessage}

      <ScrollArea className="chat-messages p-5 rounded-xl border border-white/50 bg-white/95 shadow-lg backdrop-blur-lg transition-all duration-300 hover:shadow-xl">
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="mb-2">No messages yet. Start a conversation with LARK.</p>
              <p className="text-sm">Try asking about statutes, Miranda rights, or use voice commands.</p>
            </div>
          ) : (
            messageList
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {isProcessing ? (
        <div className="chat-loading p-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#002166] border-t-2 border-t-[#0046c7]/30 shadow-md"></div>
        </div>
      ) : (
        <div className="chat-input-container flex flex-col space-y-2">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isProcessing}
                className="flex-1 text-black border-white/50 focus:border-[#002166] focus:ring-[#002166] rounded-full py-6 pl-12 pr-5 shadow-md bg-white/95 backdrop-blur-lg transition-all duration-300 hover:shadow-lg"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Badge variant="outline" className="bg-blue-50 text-[#002166] border-blue-200 px-1.5 py-1 font-medium">
                  <MessageSquare className="h-4 w-4" />
                </Badge>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    disabled={isProcessing || !input.trim()}
                    variant="default"
                    className="bg-gradient-to-r from-[#002166] to-[#0046c7] hover:from-[#0046c7] hover:to-[#002166] transition-all duration-300 rounded-full p-6 h-auto w-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <SendIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {isSpeaking ? (
                    <Button
                      type="button"
                      onClick={stopSpeaking}
                      variant="destructive"
                      className="transition-all duration-300 rounded-full bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <StopCircleIcon className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => {
                        const lastAssistantMessage = [...messages]
                          .reverse()
                          .find(m => m.role === 'assistant');
                        if (lastAssistantMessage) {
                          speakText(lastAssistantMessage.content);
                        }
                      }}
                      variant="outline"
                      disabled={!messages.some(m => m.role === 'assistant')}
                      className="border-white/50 hover:bg-white/80 transition-all duration-300 rounded-full shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <VolumeIcon className="h-5 w-5" />
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isSpeaking ? "Stop speaking" : "Speak last message"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gradient-to-r from-[#002166]/10 to-[#0046c7]/10 border-[#002166]/20 hover:bg-gradient-to-r hover:from-[#002166]/20 hover:to-[#0046c7]/20 transition-all duration-300 rounded-full shadow-md hover:shadow-lg transform hover:scale-105"
                    onClick={async () => {
                      if (voice.isListening) {
                        voice.stopListening();
                      } else {
                        // Request microphone permission if needed
                        if (voice.micPermission === 'denied' || voice.micPermission === 'prompt') {
                          const granted = await voice.requestMicrophonePermission();
                          if (!granted) {
                            setError('Microphone access is required for voice commands. Using text input instead.');
                            setInfo('You can still use LARK by typing your messages in the text box below.');
                            setTimeout(() => {
                              setError(null);
                              setTimeout(() => setInfo(null), 3000);
                            }, 3000);
                            return;
                          }
                        }
                        voice.startListening();
                      }
                    }}
                    disabled={!isOnline}
                  >
                    {voice.isListening ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-green-400/30 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute inset-0 bg-green-300/30 rounded-full animate-pulse opacity-50"></div>
                        <Mic className="h-5 w-5 text-green-600 relative z-10" />
                      </div>
                    ) : voice.micPermission === 'denied' ? (
                      <div className="relative">
                        <MicOff className="h-5 w-5 text-red-500 relative z-10" />
                      </div>
                    ) : (
                      <div className="relative">
                        <Mic className="h-5 w-5 text-[#002166] relative z-10" />
                      </div>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{voice.isListening ? "Stop listening" : voice.micPermission === 'denied' ? "Microphone access denied" : "Start voice input"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </form>

          {isProcessing && (
            <div className="text-center text-sm text-gray-500 mt-2">
              <div className="inline-block animate-pulse">Processing your request...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { LarkChat };