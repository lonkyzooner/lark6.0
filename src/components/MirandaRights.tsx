import React, { useState, useEffect } from 'react';
import { useLiveKitVoice } from '../hooks/useLiveKitVoice';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AlertCircle, CheckCircle2, Languages, Flag, VolumeIcon, VolumeXIcon, HelpCircle, Info } from 'lucide-react';

const languages = {
  english: 'English',
  spanish: 'Español',
  french: 'Français',
  vietnamese: 'Tiếng Việt',
  mandarin: '普通话',
  arabic: 'العربية'
};

// Complete Miranda Rights text according to Louisiana statutes (La. R.S. 15:451)
const mirandaText = {
  english: "You have the right to remain silent. Anything you say can and will be used against you in a court of law. You have the right to an attorney. If you cannot afford an attorney, one will be provided for you. Do you understand the rights I have just read to you? With these rights in mind, do you wish to speak to me?",

  spanish: "Tiene derecho a guardar silencio. Cualquier cosa que diga puede y será usada en su contra en un tribunal. Tiene derecho a un abogado. Si no puede pagar un abogado, se le proporcionará uno. ¿Entiende los derechos que le acabo de leer? Con estos derechos en mente, ¿desea hablar conmigo?",

  french: "Vous avez le droit de garder le silence. Tout ce que vous direz pourra être et sera utilisé contre vous devant un tribunal. Vous avez le droit à un avocat. Si vous ne pouvez pas vous permettre un avocat, un avocat vous sera fourni. Comprenez-vous les droits que je viens de vous lire? Avec ces droits à l'esprit, souhaitez-vous me parler?",

  vietnamese: "Bạn có quyền giữ im lặng. Bất cứ điều gì bạn nói có thể và sẽ được sử dụng chống lại bạn tại tòa án. Bạn có quyền có luật sư. Nếu bạn không có khả năng chi trả cho luật sư, một luật sư sẽ được cung cấp cho bạn. Bạn có hiểu các quyền tôi vừa đọc cho bạn không? Với những quyền này trong tâm trí, bạn có muốn nói chuyện với tôi không?",

  mandarin: "你有权保持沉默。你所说的任何话都可以并将被用作对你不利的证据。你有权请律师。如果你请不起律师，法院将为你指定一名律师。你明白我刚才向你宣读的权利吗？考虑到这些权利，你是否愿意和我谈话？",

  arabic: "لديك الحق في التزام الصمت. أي شيء تقوله يمكن وسوف يستخدم ضدك في المحكمة. لديك الحق في الاستعانة بمحام. إذا لم تكن قادرًا على تحمل تكاليف محام، سيتم توفير محام لك. هل تفهم الحقوق التي قرأتها للتو؟ مع وضع هذه الحقوق في الاعتبار، هل ترغب في التحدث معي؟"
};

const languageFlags = {
  english: "🇺🇸",
  spanish: "🇪🇸",
  french: "🇫🇷",
  vietnamese: "🇻🇳",
  mandarin: "🇨🇳",
  arabic: "🇸🇦"
};

export function MirandaRights() {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof languages>('english');
  const { speak, isSpeaking: speaking, stopSpeaking: stop, error } = useLiveKitVoice();
  const [playbackStatus, setPlaybackStatus] = useState<'idle' | 'playing' | 'complete'>('idle');
  const [readToSuspect, setReadToSuspect] = useState(false);

  // Listen for triggerMiranda events and fallback speech events
  useEffect(() => {
    const handleTriggerMiranda = (event: CustomEvent) => {
      console.log('Miranda rights triggered with event:', event);

      // Show visual feedback that the command was received
      // This is especially important when triggered from text commands
      document.dispatchEvent(new CustomEvent('mirandaRightsRequested', {
        detail: {
          timestamp: Date.now(),
          source: event.detail?.source || 'voice',
          isErrorRecovery: event.detail?.isErrorRecovery || false
        }
      }));

      try {
        // Get language from event detail
        const language = event.detail?.language || 'english';
        console.log('Requested language for Miranda rights:', language);

        // Set the language - validate it's supported
        if (languages[language.toLowerCase() as keyof typeof languages]) {
          // Convert to lowercase to handle case variations
          const normalizedLanguage = language.toLowerCase() as keyof typeof languages;
          setSelectedLanguage(normalizedLanguage);

          // Stop any current playback
          if (speaking) {
            stop();
            // Small delay to ensure audio system has reset
            setTimeout(() => {
              handlePlay();
            }, 300);
          } else {
            // Start reading immediately if not currently speaking
            handlePlay();
          }

          // Log success for debugging
          console.log(`Miranda rights will be read in ${languages[normalizedLanguage]}`);
        } else {
          // Handle unsupported language
          console.warn(`Language "${language}" not supported for Miranda rights. Using English instead.`);
          setSelectedLanguage('english');

          // Still read the rights, but in English
          if (speaking) {
            stop();
            setTimeout(() => {
              handlePlay();
            }, 300);
          } else {
            handlePlay();
          }
        }
      } catch (error) {
        // Robust error handling
        console.error('Error processing triggerMiranda event:', error);
        // Fallback to English
        setSelectedLanguage('english');
        if (!speaking) {
          handlePlay();
        }
      }
    };

    // Add event listener
    document.addEventListener('triggerMiranda', handleTriggerMiranda as EventListener);
    console.log('Added triggerMiranda event listener');

    // Cleanup
    return () => {
      document.removeEventListener('triggerMiranda', handleTriggerMiranda as EventListener);
      if (speaking) {
        stop();
      }
    };
  }, [speaking, stop]);

  // Stop audio if component unmounts
  useEffect(() => {
    return () => {
      if (speaking) {
        stop();
      }
    };
  }, [speaking, stop]);

  const handleLanguageChange = (language: string) => {
    // If currently speaking, stop before changing language
    if (speaking) {
      stop();
      setPlaybackStatus('idle');
    }
    setSelectedLanguage(language as keyof typeof languages);
  };

  const handlePlay = async () => {
    if (speaking) {
      stop();
      setPlaybackStatus('idle');
      return;
    }

    try {
      setPlaybackStatus('playing');
      console.log('Starting Miranda rights TTS with text:', mirandaText[selectedLanguage].substring(0, 50) + '...');

      // Add additional logging for debugging
      console.log(`Using language: ${selectedLanguage} (${languages[selectedLanguage]})`);
      console.log(`Text length: ${mirandaText[selectedLanguage].length} characters`);

      // Verify we have valid text before proceeding
      if (!mirandaText[selectedLanguage] || mirandaText[selectedLanguage].length < 10) {
        throw new Error(`Invalid or missing Miranda text for language: ${selectedLanguage}`);
      }

      // Notify that playback is starting
      document.dispatchEvent(new CustomEvent('mirandaRightsPlaying', {
        detail: {
          language: selectedLanguage,
          timestamp: Date.now()
        }
      }));

      // Use LiveKit Voice API with 'ash' voice for all speech output
      try {
        await speak(mirandaText[selectedLanguage], 'ash');
        console.log('Miranda rights TTS with LiveKit completed successfully');
      } catch (speakError) {
        console.error('LiveKit TTS method failed:', speakError);
        throw speakError; // Re-throw to be handled by the parent catch
      }

      setPlaybackStatus('complete');
      setReadToSuspect(true);

      // Dispatch event to notify other components that Miranda rights were read
      document.dispatchEvent(new CustomEvent('mirandaRightsRead', {
        detail: {
          language: selectedLanguage,
          timestamp: Date.now(),
          success: true
        }
      }));
    } catch (err) {
      console.error("Error playing Miranda rights:", err);
      setPlaybackStatus('idle');

      // Notify about the error
      document.dispatchEvent(new CustomEvent('mirandaRightsError', {
        detail: {
          language: selectedLanguage,
          timestamp: Date.now(),
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }));

      // Try fallback to English if another language failed
      if (selectedLanguage !== 'english') {
        console.log('Attempting fallback to English for Miranda rights');
        setSelectedLanguage('english');
        // Small delay before trying again
        setTimeout(() => {
          try {
            speak(mirandaText['english'], 'ash');
            setPlaybackStatus('playing');
          } catch (fallbackErr) {
            console.error("Fallback also failed:", fallbackErr);
            setPlaybackStatus('idle');

            // Notify about the fallback error
            document.dispatchEvent(new CustomEvent('mirandaRightsError', {
              detail: {
                language: 'english',
                timestamp: Date.now(),
                error: fallbackErr instanceof Error ? fallbackErr.message : 'Fallback to English failed',
                isFallback: true
              }
            }));
          }
        }, 500);
      }
    }
  };

  return (
    <div className="p-5">
      <Card className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#002166]/10 rounded-full">
                <Flag className="h-5 w-5 text-[#002166]" />
              </div>
              <div>
                <CardTitle className="text-[#002166]">Miranda Rights</CardTitle>
                <CardDescription>
                  Louisiana statute La. R.S. 15:451
                </CardDescription>
              </div>
            </div>

            {readToSuspect && (
              <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 rounded-full px-3 py-1 text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Rights delivered
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md mb-2">
            <p className="text-sm text-blue-700 leading-relaxed">
              {mirandaText[selectedLanguage]}
            </p>
          </div>

        <div className="flex flex-wrap items-center gap-4 mt-2">
          <div className="relative flex-grow max-w-[280px]">
            <label className="text-[#002166] font-medium text-sm mb-2 block">Select Language</label>
            <Select
              value={selectedLanguage}
              onValueChange={handleLanguageChange}
              disabled={speaking}
            >
              <SelectTrigger className="w-full border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{languageFlags[selectedLanguage]}</span>
                  <SelectValue placeholder="Select language" />
                </div>
              </SelectTrigger>
              <SelectContent className="border-white/50 bg-white shadow-md">
                {Object.entries(languages).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="focus:bg-[#002166] focus:text-white hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{languageFlags[key as keyof typeof languageFlags]}</span>
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Choose the language for Miranda Rights delivery</p>
          </div>

          <Button
            onClick={handlePlay}
            className={`rounded-full px-5 py-2 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active-press ${
              speaking
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                : playbackStatus === 'complete'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  : 'bg-gradient-to-r from-[#002166] to-[#0046c7] text-white'
            }`}
            disabled={error !== null}
          >
            {speaking ? (
              <div className="flex items-center gap-2">
                <VolumeXIcon className="w-4 h-4" />
                <span>Stop Reading</span>
              </div>
            ) : playbackStatus === 'complete' ? (
              <div className="flex items-center gap-2">
                <VolumeIcon className="w-4 h-4" />
                <span>Read Again</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <VolumeIcon className="w-4 h-4" />
                <span>Read Rights</span>
              </div>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 flex items-center bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {playbackStatus === 'complete' && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Miranda Rights Delivered
              </p>
              <p className="text-xs text-green-700 mt-1">
                Rights have been read to the subject in {languages[selectedLanguage]}
              </p>
            </div>
          </div>
        )}

        {error && playbackStatus !== 'playing' && (
          <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md flex items-center shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Audio Playback Issue
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Unable to read Miranda Rights due to audio issues. The text is still available above.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
