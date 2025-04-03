import { useEffect, useState } from 'react';

export function VoiceIndicator() {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    // Listen for audio detection events
    const handleAudioDetected = (event: CustomEvent) => {
      setIsActive(true);
      setTranscript(event.detail.transcript);
      setConfidence(event.detail.confidence || 0);

      // Show the indicator for 3 seconds
      setTimeout(() => {
        setIsActive(false);
      }, 3000);
    };

    // Listen for interim transcript events
    const handleInterimTranscript = (event: CustomEvent) => {
      setIsActive(true);
      setTranscript(event.detail.transcript);

      // Show the indicator for 2 seconds
      setTimeout(() => {
        setIsActive(false);
      }, 2000);
    };

    // Add event listeners
    window.addEventListener('lark-audio-detected', handleAudioDetected as EventListener);
    window.addEventListener('lark-interim-transcript', handleInterimTranscript as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('lark-audio-detected', handleAudioDetected as EventListener);
      window.removeEventListener('lark-interim-transcript', handleInterimTranscript as EventListener);
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50
                    bg-gradient-to-r from-[#002166] to-[#0046c7] text-white px-5 py-3 rounded-full
                    shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 border border-white/20 backdrop-blur-md">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-0 bg-blue-300 rounded-full animate-pulse opacity-50"></div>
        <div className="relative h-4 w-4 bg-blue-200 rounded-full"></div>
      </div>
      <div className="text-sm font-medium tracking-wide">
        {transcript ? `Heard: "${transcript}"` : "Voice detected"}
      </div>
      {confidence > 0 && (
        <div className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">
          {Math.round(confidence * 100)}%
        </div>
      )}
    </div>
  );
}
