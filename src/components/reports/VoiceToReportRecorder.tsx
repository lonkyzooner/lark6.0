import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, FileText, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';

// Define the props interface
interface VoiceToReportRecorderProps {
  onReportGenerated?: (reportData: any) => void;
}

const VoiceToReportRecorder: React.FC<VoiceToReportRecorderProps> = ({ onReportGenerated }) => {
  // State for recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState('incident');
  const [success, setSuccess] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Effect to handle recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      setSuccess(false);
      
      // Reset state
      setRecordingTime(0);
      audioChunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Auto-transcribe
        transcribeAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions and try again.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  // Transcribe audio using OpenAI Whisper API
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      setError(null);
      
      // In a real implementation, you would send the audio to your backend API
      // which would then use OpenAI's Whisper API to transcribe it
      
      // For demo purposes, we'll simulate a delay and use a mock response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock transcript - in a real app, this would come from the API
      const mockTranscript = 
        "On June 15th, 2023, at approximately 2200 hours, I responded to a call at 123 Main Street regarding a reported disturbance. " +
        "Upon arrival, I observed two individuals engaged in a verbal altercation on the front lawn. " +
        "I identified myself as Officer Johnson with the police department and separated the parties. " +
        "The first individual identified as John Smith, DOB 05/12/1985, stated that his neighbor, identified as Robert Jones, DOB 11/30/1990, " +
        "had been playing loud music and refused to lower the volume despite multiple requests. " +
        "Mr. Jones stated that the complaint was exaggerated and that he had already turned down the music when asked. " +
        "I observed no signs of physical altercation and both parties agreed to resolve the matter civilly. " +
        "No further action was taken at this time. End of report.";
      
      setTranscript(mockTranscript);
      setIsTranscribing(false);
    } catch (err) {
      console.error('Error transcribing audio:', err);
      setError('Failed to transcribe audio. Please try again or type your report manually.');
      setIsTranscribing(false);
    }
  };
  
  // Generate report from transcript
  const generateReport = async () => {
    try {
      setIsGeneratingReport(true);
      setError(null);
      
      // Call the API to generate a report from the transcript
      const response = await axios.post('/api/reports/voice-to-report', {
        transcript,
        reportType
      });
      
      // Check if the request was successful
      if (response.data.success) {
        // Call the callback with the generated report data
        if (onReportGenerated) {
          onReportGenerated(response.data.data);
        }
        
        setSuccess(true);
      } else {
        throw new Error(response.data.error || 'Failed to generate report');
      }
      
      setIsGeneratingReport(false);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again or create a report manually.');
      setIsGeneratingReport(false);
    }
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice-to-Report Recorder
        </CardTitle>
        <CardDescription>
          Record your report verbally and let AI convert it into a structured report
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Recording UI */}
        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/20">
          {isRecording ? (
            <>
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping"></div>
                <div className="relative bg-red-500 text-white p-4 rounded-full">
                  <Mic className="h-8 w-8" />
                </div>
              </div>
              <div className="text-2xl font-mono mb-2">{formatTime(recordingTime)}</div>
              <Badge variant="outline" className="mb-4 animate-pulse">Recording</Badge>
              <Button 
                variant="destructive" 
                size="lg" 
                className="gap-2"
                onClick={stopRecording}
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            </>
          ) : (
            <>
              <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                <Mic className="h-8 w-8" />
              </div>
              <Button 
                variant="default" 
                size="lg" 
                className="gap-2"
                onClick={startRecording}
                disabled={isTranscribing || isGeneratingReport}
              >
                <Mic className="h-4 w-4" />
                Start Recording
              </Button>
              {audioBlob && (
                <div className="mt-4 w-full">
                  <audio controls className="w-full mt-2">
                    <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Transcription UI */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="transcript">Transcript</Label>
            {isTranscribing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Transcribing...
              </div>
            )}
          </div>
          <Textarea 
            id="transcript" 
            value={transcript} 
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your recording will be transcribed here. You can also type or edit the text manually."
            className="min-h-[200px]"
            disabled={isTranscribing}
          />
        </div>
        
        {/* Report Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="report-type">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger id="report-type">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="incident">Incident Report</SelectItem>
              <SelectItem value="arrest">Arrest Report</SelectItem>
              <SelectItem value="traffic">Traffic Report</SelectItem>
              <SelectItem value="investigation">Investigation Report</SelectItem>
              <SelectItem value="use_of_force">Use of Force Report</SelectItem>
              <SelectItem value="field_interview">Field Interview Report</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 text-green-500 p-3 rounded-md flex items-start gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>Report successfully generated!</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setTranscript('');
            setAudioBlob(null);
            setError(null);
            setSuccess(false);
          }}
          disabled={isRecording || isTranscribing || isGeneratingReport || (!transcript && !audioBlob)}
        >
          Clear
        </Button>
        <Button 
          variant="default" 
          className="gap-2"
          onClick={generateReport}
          disabled={isRecording || isTranscribing || isGeneratingReport || !transcript}
        >
          {isGeneratingReport ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VoiceToReportRecorder;
