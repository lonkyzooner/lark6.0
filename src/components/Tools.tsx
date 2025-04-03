import React, { useState, useEffect, useRef } from 'react';
import { useSimulatedTTS } from '../hooks/useSimulatedTTS.tsx';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { getGeneralKnowledge, getLegalInformation } from '../lib/openai-service';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import OpenAIVoiceTest from './OpenAIVoiceTest';
import {
  FileTextIcon,
  MicIcon,
  StopCircleIcon,
  CameraIcon,
  ScanLineIcon,
  ScaleIcon,
  ShieldIcon,
  GlobeIcon,
  MapIcon,
  UserIcon,
  CarIcon,
  FileSpreadsheetIcon,
  LoaderIcon,
  CheckCircleIcon,
  FlameIcon,
  BookIcon,
  ImageIcon,
  Mic2Icon,
  BuildingIcon,
  TargetIcon,
  VolumeIcon,
  ClipboardIcon,
  PrinterIcon,
  DownloadIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-react';

export function Tools() {
  const [activeTab, setActiveTab] = useState('interview');
  const { speak, speaking, stop } = useSimulatedTTS();
  const { transcript, listening, startListening, stopListening } = useSpeechRecognition();
  const [isProcessing, setIsProcessing] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [interviewData, setInterviewData] = useState({ name: '', license: '', address: '', reason: '' });
  const [reportText, setReportText] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<Array<{title: string, description: string}> | null>(null);
  const [useOfForceDescription, setUseOfForceDescription] = useState('');
  const [forcePolicyResult, setForcePolicyResult] = useState('');
  const [caseLawQuery, setCaseLawQuery] = useState('');
  const [caseLawResult, setCaseLawResult] = useState('');
  const [statuteQuery, setStatuteQuery] = useState('');
  const [statuteResult, setStatuteResult] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedDocument, setScannedDocument] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);
  const [mapLocation, setMapLocation] = useState('');
  const [showMap, setShowMap] = useState(false);

  // Handle voice recording for reports
  const handleReportRecording = () => {
    if (listening) {
      stopListening();
      if (transcript) {
        setReportText(transcript);
      }
    } else {
      startListening();
    }
  };

  // Generate police report from dictation
  const generateReport = async () => {
    if (!reportText.trim()) return;

    setIsProcessing(true);
    setReviewFeedback(null); // Clear any previous review

    try {
      const prompt = `
        As a police report generator, convert this officer's dictation into a properly formatted police report:

        ${reportText}

        Format it with proper sections including:
        - Incident information
        - Parties involved
        - Narrative
        - Actions taken
        - Evidence collected (if any)
        - Follow-up needed (if any)
      `;

      const response = await getGeneralKnowledge(prompt);
      setGeneratedReport(response);
      speak("Report has been generated based on your dictation");
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate defense attorney review feedback
  const generateDefenseAttorneyReview = (report: string) => {
    // This is a simplified implementation - in a real app, this would use AI to analyze the report
    // The feedback should identify potential weaknesses without adding details

    const feedback = [];

    // Check for vague language
    if (report.includes('I believe') || report.includes('I think') || report.includes('probably')) {
      feedback.push({
        title: 'Subjective Language',
        description: 'Consider replacing subjective phrases like "I believe" or "probably" with more definitive statements based on your observations.'
      });
    }

    // Check for missing time references
    if (!report.includes('a.m.') && !report.includes('p.m.') && !report.includes('hours')) {
      feedback.push({
        title: 'Time Specificity',
        description: 'Consider adding specific times for key events in the report to establish a clear timeline.'
      });
    }

    // Check for potential lack of probable cause articulation
    if (!report.includes('probable cause') && !report.includes('reasonable suspicion')) {
      feedback.push({
        title: 'Legal Basis',
        description: 'Consider clearly articulating the legal basis for any searches, seizures, or detentions mentioned in the report.'
      });
    }

    // Check for witness statements
    if (!report.includes('witness') && !report.includes('stated') && report.length > 200) {
      feedback.push({
        title: 'Witness Corroboration',
        description: 'Consider including statements from witnesses if available, or explicitly note if no witnesses were present.'
      });
    }

    // Check for Miranda warnings if there's an arrest
    if ((report.includes('arrest') || report.includes('custody') || report.includes('detained')) &&
        !report.includes('Miranda')) {
      feedback.push({
        title: 'Miranda Warnings',
        description: 'If the subject was arrested or in custody, consider documenting when Miranda warnings were given.'
      });
    }

    // Check for officer safety actions
    if (report.includes('weapon') && !report.includes('secure')) {
      feedback.push({
        title: 'Weapon Security',
        description: 'Consider documenting how any weapons mentioned were secured or made safe.'
      });
    }

    // If no specific issues found, provide general feedback
    if (feedback.length === 0) {
      feedback.push({
        title: 'Consider Additional Context',
        description: 'Consider providing more context about the circumstances leading up to the incident.'
      });

      feedback.push({
        title: 'Document Chain of Custody',
        description: 'If evidence was collected, consider explicitly documenting the chain of custody.'
      });
    }

    return feedback;
  };

  // Simulate license plate lookup
  const lookupPlate = () => {
    if (!plateNumber.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      // Simulated plate data
      const plateData = {
        plate: plateNumber.toUpperCase(),
        vehicle: "2020 Toyota Camry",
        color: "Black",
        status: "Valid Registration",
        owner: "John Doe",
        violations: "None",
        alerts: "None"
      };

      // Text-to-speech response
      const response = `Plate ${plateNumber.toUpperCase()} belongs to a 2020 Toyota Camry. Registration is valid. No alerts.`;
      speak(response);

      setIsProcessing(false);
    }, 2000);
  };

  // Simulate document scanning
  const scanDocument = () => {
    setShowScanner(true);
    setIsProcessing(true);

    // Simulate scanning process
    setTimeout(() => {
      // Mock data for Louisiana driver's license
      setScannedDocument('/driver-license-la.jpg');
      setScannedData({
        type: "Louisiana Driver's License",
        number: "1234567",
        name: "SMITH, JOHN D",
        address: "123 MAIN ST, BATON ROUGE LA 70801",
        dob: "01/15/1985",
        expiration: "01/15/2026",
        class: "E",
        restrictions: "NONE"
      });

      speak("Document scan complete. Louisiana driver's license for John Smith identified.");
      setIsProcessing(false);
    }, 3000);
  };

  // Handle use of force policy inquiry
  const analyzeUseOfForce = async () => {
    if (!useOfForceDescription.trim()) return;

    setIsProcessing(true);
    try {
      const prompt = `
        As a use-of-force policy expert for Louisiana law enforcement, analyze this situation and provide guidance:

        Situation: ${useOfForceDescription}

        Provide:
        1. Analysis of appropriate force level
        2. Relevant department policies that apply
        3. Key considerations for officer safety
        4. Documentation requirements
        5. Any warnings or cautions

        Format your response in clear sections.
      `;

      const response = await getGeneralKnowledge(prompt);
      setForcePolicyResult(response);
      speak("Force analysis complete. Please review on screen.");
    } catch (error) {
      console.error("Error analyzing use of force:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Look up case law
  const lookupCaseLaw = async () => {
    if (!caseLawQuery.trim()) return;

    setIsProcessing(true);
    try {
      const prompt = `
        As a legal expert on Louisiana and federal case law relevant to law enforcement, provide a summary of significant cases and precedents related to:

        ${caseLawQuery}

        Include:
        - Names of relevant cases
        - Brief facts of each case
        - The court's decision
        - How it affects police procedure
        - Current best practices based on this case law
      `;

      const response = await getGeneralKnowledge(prompt);
      setCaseLawResult(response);
      speak("Case law analysis complete.");
    } catch (error) {
      console.error("Error looking up case law:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Look up statutes and criminal codes
  const lookupStatute = async () => {
    if (!statuteQuery.trim()) return;

    setIsProcessing(true);
    try {
      const prompt = `
        As a legal expert on Louisiana criminal statutes and laws, provide detailed information about:

        ${statuteQuery}

        Include:
        - The specific statute number and title if applicable
        - Elements of the crime or violation
        - Classification (felony/misdemeanor) and potential penalties
        - Common defenses or exceptions
        - Important considerations for law enforcement
        - Related statutes or charges that might apply

        If this describes behavior but doesn't mention a specific statute, identify which Louisiana criminal statutes would apply to this situation.
      `;

      const response = await getGeneralKnowledge(prompt);
      setStatuteResult(response);
      speak("Statute information retrieved.");
    } catch (error) {
      console.error("Error looking up statute:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Load tactical map
  const loadTacticalMap = () => {
    if (!mapLocation.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      setShowMap(true);
      speak(`Tactical map loaded for ${mapLocation}. Showing building layout and entry points.`);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-xl overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#002166]/10 rounded-full">
            <TargetIcon className="h-5 w-5 text-[#002166]" />
          </div>
          <h2 className="text-xl font-bold text-[#002166]">LARK Tools & Resources</h2>
        </div>
        <Badge className="bg-gradient-to-r from-[#002166] to-[#0046c7] text-white border-0 px-3 py-1 shadow-sm">
          Law Enforcement Tools
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 fluid-glass enhanced-card rounded-2xl p-2 flex flex-wrap md:flex-nowrap justify-between border border-[rgba(255,255,255,0.5)] shadow-lg gap-2 backdrop-blur-lg bg-white/30 transition-all duration-300 hover:shadow-xl">
          <TabsTrigger
            value="interview"
            className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press flex items-center justify-center gap-2"
          >
            <UserIcon className="h-4 w-4" />
            <span>Field Interview</span>
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press flex items-center justify-center gap-2"
          >
            <FileTextIcon className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger
            value="lookup"
            className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press flex items-center justify-center gap-2"
          >
            <CarIcon className="h-4 w-4" />
            <span>Vehicle/ID</span>
          </TabsTrigger>
          <TabsTrigger
            value="legal"
            className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press flex items-center justify-center gap-2"
          >
            <ScaleIcon className="h-4 w-4" />
            <span>Legal</span>
          </TabsTrigger>
          <TabsTrigger
            value="voice"
            className="flex-1 rounded-full py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#002166] data-[state=active]:to-[#0046c7] data-[state=active]:text-white text-muted-foreground font-medium transition-all duration-300 hover:text-foreground focus-ring hover:bg-white/70 data-[state=active]:shadow-lg data-[state=active]:scale-[1.02] enhanced-tab active-press flex items-center justify-center gap-2"
          >
            <VolumeIcon className="h-4 w-4" />
            <span>Voice Test</span>
          </TabsTrigger>
        </TabsList>

        {/* Field Interview Tab */}
        <TabsContent value="interview" className="space-y-4 mt-0">
          <Card className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#002166]/10 rounded-full">
                  <FileSpreadsheetIcon className="h-5 w-5 text-[#002166]" />
                </div>
                <div>
                  <CardTitle className="text-[#002166]">Field Interview Data Collection</CardTitle>
                  <CardDescription>
                    Voice-guided interview template
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md mb-2">
                <p className="text-sm text-blue-700">Enter subject information for field interview documentation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#002166] font-medium">Subject Name</label>
                  <Input
                    placeholder="Full name"
                    className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input"
                    value={interviewData.name}
                    onChange={(e) => setInterviewData({...interviewData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#002166] font-medium">ID/License #</label>
                  <Input
                    placeholder="Identification number"
                    className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input"
                    value={interviewData.license}
                    onChange={(e) => setInterviewData({...interviewData, license: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#002166] font-medium">Address</label>
                  <Input
                    placeholder="Current address"
                    className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input"
                    value={interviewData.address}
                    onChange={(e) => setInterviewData({...interviewData, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-[#002166] font-medium">Reason for Contact</label>
                  <Input
                    placeholder="Reason for interview"
                    className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input"
                    value={interviewData.reason}
                    onChange={(e) => setInterviewData({...interviewData, reason: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#002166] font-medium">Notes</label>
                <Textarea
                  placeholder="Officer notes and observations"
                  className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">Include any relevant observations or additional information</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#002166] to-[#0046c7] text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active-press flex items-center gap-2"
              >
                <Mic2Icon className="h-4 w-4" />
                Start Guided Interview
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4 mt-0">
          <Card className="fluid-card enhanced-card border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#002166]/10 rounded-full">
                  <FileTextIcon className="h-5 w-5 text-[#002166]" />
                </div>
                <div>
                  <CardTitle className="text-[#002166]">Report Writer</CardTitle>
                  <CardDescription>
                    Create professional police reports with voice dictation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md mb-2">
                <p className="text-sm text-blue-700">Create detailed police reports using templates or voice dictation. The AI will format your input into a professional report.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#002166] font-medium flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4 text-[#002166]/70" />
                    Case Number
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter case number"
                    defaultValue={`CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`}
                    className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input w-full"
                  />
                  <p className="text-xs text-muted-foreground">Unique identifier for this report</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#002166] font-medium flex items-center gap-2">
                    <FileSpreadsheetIcon className="h-4 w-4 text-[#002166]/70" />
                    Report Template</label>
                  <Select
                    value="incident"
                    onValueChange={(value) => {
                      // In a real implementation, this would load a template
                      console.log('Selected template:', value);
                    }}
                  >
                    <SelectTrigger className="w-full border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incident">Incident Report</SelectItem>
                      <SelectItem value="field_interview">Field Interview</SelectItem>
                      <SelectItem value="use_of_force">Use of Force Report</SelectItem>
                      <SelectItem value="traffic_stop">Traffic Stop</SelectItem>
                      <SelectItem value="blank">Blank Report</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Choose a template to start with or use a blank report</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[#002166] font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-[#002166]/70" />
                      Incident Date
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input w-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Date when the incident occurred</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-[#002166] font-medium flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-[#002166]/70" />
                      Incident Time
                    </label>
                    <div className="relative">
                      <Input
                        type="time"
                        defaultValue={new Date().toTimeString().slice(0, 5)}
                        className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input w-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Time when the incident occurred</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#002166] font-medium flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-[#002166]/70" />
                    Incident Location
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter the location of the incident"
                    className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 enhanced-input w-full"
                  />
                  <p className="text-xs text-muted-foreground">Address or description of where the incident occurred</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-[#002166] font-medium">Voice Dictation</label>
                    <p className="text-xs text-muted-foreground">Record your report details using voice</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleReportRecording}
                    className={listening ?
                      "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 transition-all duration-300 flex items-center gap-2" :
                      "bg-blue-50 text-[#002166] border-blue-200 hover:bg-blue-100 hover:text-[#003087] transition-all duration-300 flex items-center gap-2"}
                  >
                    {listening ? (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 bg-red-400/30 rounded-full animate-ping opacity-75"></div>
                          <div className="absolute inset-0 bg-red-300/30 rounded-full animate-pulse opacity-50"></div>
                          <StopCircleIcon className="h-4 w-4 relative z-10" />
                        </div>
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <MicIcon className="h-4 w-4" />
                        <span>Start Recording</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {listening && (
                <div className="rounded-lg p-4 bg-red-50 border border-red-200 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-400/30 rounded-full animate-ping opacity-75"></div>
                      <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-red-700 font-medium">Recording in progress...</span>
                  </div>
                  <div className="text-xs text-red-600">{transcript ? transcript.length : 0} characters</div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-[#002166] font-medium">Report Content</label>
                <Textarea
                  placeholder="Your dictation will appear here... or type manually"
                  className="border-white/50 bg-white/80 focus:border-[#002166] focus:ring-[#002166] shadow-sm hover:shadow-md transition-all duration-300 min-h-[200px]"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">{reportText ? reportText.length : 0} characters</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReportText('')}
                      disabled={!reportText.trim() || isProcessing}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // In a real implementation, this would save the draft
                        speak("Draft saved");
                      }}
                      disabled={!reportText.trim() || isProcessing}
                      className="border-blue-200 text-[#002166] hover:bg-blue-50"
                    >
                      Save Draft
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={generateReport}
                disabled={!reportText.trim() || isProcessing}
                className="w-full bg-gradient-to-r from-[#002166] to-[#0046c7] hover:from-[#0046c7] hover:to-[#002166] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] active-press py-6 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <LoaderIcon className="h-5 w-5 animate-spin" />
                    <span>Processing Report...</span>
                  </>
                ) : (
                  <>
                    <FileTextIcon className="h-5 w-5" />
                    <span>Generate Formatted Report</span>
                  </>
                )}
              </Button>

              {generatedReport && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-[#002166] font-medium">Generated Report</h3>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 rounded-full px-3 py-1 text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-1">
                      <CheckCircleIcon className="h-3.5 w-3.5" /> Ready
                    </Badge>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="max-h-[500px] overflow-y-auto">
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-[#002166]">Police Report</h3>
                            <p className="text-sm text-gray-600">Case #: CASE-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Date: {new Date().toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">Time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Officer:</p>
                            <p className="text-gray-600">Officer John Doe</p>
                          </div>
                          <div>
                            <p className="font-medium">Location:</p>
                            <p className="text-gray-600">123 Main Street, Anytown</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-800 whitespace-pre-line">
                        {generatedReport}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="outline"
                      className="w-full border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 transition-all duration-300 flex items-center justify-center gap-2 py-4 mb-4"
                      onClick={() => {
                        // In a real implementation, this would trigger the defense attorney review
                        setIsReviewing(true);
                        setTimeout(() => {
                          setReviewFeedback(generateDefenseAttorneyReview(generatedReport));
                          setIsReviewing(false);
                        }, 2000);
                      }}
                      disabled={isReviewing}
                    >
                      {isReviewing ? (
                        <>
                          <LoaderIcon className="h-5 w-5 animate-spin" />
                          <span>Analyzing Report...</span>
                        </>
                      ) : (
                        <>
                          <ScaleIcon className="h-5 w-5" />
                          <span>Review as Defense Attorney</span>
                        </>
                      )}
                    </Button>

                    {reviewFeedback && (
                      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-md">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 bg-amber-100 rounded-full">
                            <ScaleIcon className="h-5 w-5 text-amber-700" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-amber-800">Defense Attorney Review</h3>
                            <p className="text-sm text-amber-700">Areas that may benefit from additional clarity or detail</p>
                          </div>
                        </div>

                        <div className="space-y-3 mt-4">
                          {reviewFeedback.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="p-1 bg-amber-200 rounded-full mt-0.5">
                                <AlertTriangleIcon className="h-3 w-3 text-amber-700" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-amber-800">{item.title}</p>
                                <p className="text-xs text-amber-700">{item.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-amber-200">
                          <p className="text-xs text-amber-700 italic">Note: This review highlights potential areas for improvement from a defense perspective. Consider addressing these points to strengthen your report.</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3">
                      <Button
                        variant="outline"
                        className="border-blue-200 text-[#002166] hover:bg-blue-50 flex items-center gap-2"
                        onClick={() => {
                          // In a real implementation, this would copy to clipboard
                          navigator.clipboard.writeText(generatedReport);
                          speak("Report copied to clipboard");
                        }}
                      >
                        <ClipboardIcon className="h-4 w-4" />
                        <span>Copy</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="border-blue-200 text-[#002166] hover:bg-blue-50 flex items-center gap-2"
                        onClick={() => {
                          // In a real implementation, this would print the report
                          speak("Preparing report for printing");
                        }}
                      >
                        <PrinterIcon className="h-4 w-4" />
                        <span>Print</span>
                      </Button>

                      <Button
                        className="bg-gradient-to-r from-[#002166] to-[#0046c7] hover:from-[#0046c7] hover:to-[#002166] text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] active-press flex items-center gap-2"
                        onClick={() => {
                          // In a real implementation, this would export as PDF
                          speak("Exporting report as PDF");
                        }}
                      >
                        <DownloadIcon className="h-4 w-4" />
                        <span>Export as PDF</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle/ID Lookup Tab */}
        <TabsContent value="lookup" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* License Plate Recognition */}
            <Card className="bg-blue-950/10 border-blue-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-300 text-sm flex items-center gap-2">
                  <CarIcon className="h-4 w-4" />
                  License Plate Lookup
                </CardTitle>
                <CardDescription className="text-blue-400/70 text-xs">
                  Scan or enter plate number
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter plate #"
                    className="bg-black/70 border-blue-900/50"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="bg-blue-900/30 border-blue-900/50"
                  >
                    <CameraIcon className="h-4 w-4 text-blue-300" />
                  </Button>
                </div>

                <Button
                  onClick={lookupPlate}
                  disabled={!plateNumber.trim() || isProcessing}
                  className="w-full bg-blue-700 hover:bg-blue-800"
                >
                  {isProcessing ? (
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    "Lookup Plate"
                  )}
                </Button>

                {plateNumber && !isProcessing && (
                  <div className="p-2 rounded bg-blue-900/20 text-sm text-blue-300">
                    Plate: {plateNumber.toUpperCase()}<br/>
                    Vehicle: 2020 Toyota Camry<br/>
                    Status: Valid Registration<br/>
                    Alerts: None
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Scanner */}
            <Card className="bg-blue-950/10 border-blue-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-300 text-sm flex items-center gap-2">
                  <ScanLineIcon className="h-4 w-4" />
                  Document Scanner
                </CardTitle>
                <CardDescription className="text-blue-400/70 text-xs">
                  Scan IDs and documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-2">
                {!showScanner && !scannedDocument && (
                  <div className="border-2 border-dashed border-blue-900/30 rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="h-8 w-8 text-blue-900/50" />
                    <p className="text-blue-400/70 text-xs text-center">
                      Tap button below to scan ID or document
                    </p>
                  </div>
                )}

                {showScanner && isProcessing && (
                  <div className="border-2 border-blue-500/30 rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-blue-900/10">
                    <LoaderIcon className="h-8 w-8 text-blue-400 animate-spin" />
                    <p className="text-blue-300 text-xs">Scanning document...</p>
                  </div>
                )}

                {scannedDocument && scannedData && (
                  <div className="border rounded-lg bg-black/50 p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-blue-300">{scannedData.type}</span>
                      <Badge className="bg-green-900/30 text-green-400 text-xs">Verified</Badge>
                    </div>
                    <div className="text-white/90 text-sm space-y-1">
                      <p>Name: {scannedData.name}</p>
                      <p>ID #: {scannedData.number}</p>
                      <p>DOB: {scannedData.dob}</p>
                      <p>Address: {scannedData.address}</p>
                      <p>Expiration: {scannedData.expiration}</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={scanDocument}
                  disabled={isProcessing}
                  className="w-full bg-blue-700 hover:bg-blue-800"
                >
                  {isProcessing ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-1 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <ScanLineIcon className="h-4 w-4 mr-1" /> {scannedDocument ? "Scan New Document" : "Scan Document"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Statutes and Criminal Codes */}
            <Card className="bg-blue-950/10 border-blue-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-300 text-sm flex items-center gap-2">
                  <BookIcon className="h-4 w-4" />
                  Statutes & Criminal Codes
                </CardTitle>
                <CardDescription className="text-blue-400/70 text-xs">
                  Check crimes and applicable laws
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-2">
                <div className="space-y-2">
                  <label className="text-xs text-blue-300">Describe crime or enter statute:</label>
                  <Textarea
                    placeholder="e.g., 'Breaking into a vehicle at night' or 'RS 14:62 burglary'"
                    className="bg-black/70 border-blue-900/50 min-h-[80px]"
                    value={statuteQuery}
                    onChange={(e) => setStatuteQuery(e.target.value)}
                  />
                </div>

                <Button
                  onClick={lookupStatute}
                  disabled={!statuteQuery.trim() || isProcessing}
                  className="w-full bg-blue-700 hover:bg-blue-800"
                >
                  {isProcessing ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-1 animate-spin" /> Searching...
                    </>
                  ) : (
                    <>
                      <BookIcon className="h-4 w-4 mr-1" /> Check Applicable Laws
                    </>
                  )}
                </Button>

                {statuteResult && (
                  <div className="rounded border border-blue-900/50 bg-black/70 p-3 mt-2 max-h-[300px] overflow-y-auto">
                    <div className="text-white/90 text-sm whitespace-pre-line">
                      {statuteResult}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Case Law Summaries */}
            <Card className="bg-blue-950/10 border-blue-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-300 text-sm flex items-center gap-2">
                  <ScaleIcon className="h-4 w-4" />
                  Case Law Lookup
                </CardTitle>
                <CardDescription className="text-blue-400/70 text-xs">
                  Get relevant legal precedents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-2">
                <div className="space-y-2">
                  <label className="text-xs text-blue-300">Search for cases related to:</label>
                  <Input
                    placeholder="e.g., 'traffic stop consent search'"
                    className="bg-black/70 border-blue-900/50"
                    value={caseLawQuery}
                    onChange={(e) => setCaseLawQuery(e.target.value)}
                  />
                </div>

                <Button
                  onClick={lookupCaseLaw}
                  disabled={!caseLawQuery.trim() || isProcessing}
                  className="w-full bg-blue-700 hover:bg-blue-800"
                >
                  {isProcessing ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-1 animate-spin" /> Searching...
                    </>
                  ) : (
                    <>
                      <ScaleIcon className="h-4 w-4 mr-1" /> Find Relevant Cases
                    </>
                  )}
                </Button>

                {caseLawResult && (
                  <div className="rounded border border-blue-900/50 bg-black/70 p-3 mt-2 max-h-[300px] overflow-y-auto">
                    <div className="text-white/90 text-sm whitespace-pre-line">
                      {caseLawResult}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Use-of-Force Guidance */}
            <Card className="bg-blue-950/10 border-blue-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-300 text-sm flex items-center gap-2">
                  <ShieldIcon className="h-4 w-4" />
                  Use-of-Force Guidance
                </CardTitle>
                <CardDescription className="text-blue-400/70 text-xs">
                  Policy analysis for force situations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-2">
                <div className="space-y-2">
                  <label className="text-xs text-blue-300">Describe the situation:</label>
                  <Textarea
                    placeholder="e.g., 'Subject is resisting arrest by pulling away, showing aggressive posture, but no weapons visible'"
                    className="bg-black/70 border-blue-900/50 min-h-[80px]"
                    value={useOfForceDescription}
                    onChange={(e) => setUseOfForceDescription(e.target.value)}
                  />
                </div>

                <Button
                  onClick={analyzeUseOfForce}
                  disabled={!useOfForceDescription.trim() || isProcessing}
                  className="w-full bg-blue-700 hover:bg-blue-800"
                >
                  {isProcessing ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-1 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <FlameIcon className="h-4 w-4 mr-1" /> Analyze Force Options
                    </>
                  )}
                </Button>

                {forcePolicyResult && (
                  <div className="rounded border border-blue-900/50 bg-black/70 p-3 mt-2 max-h-[300px] overflow-y-auto">
                    <div className="text-white/90 text-sm whitespace-pre-line">
                      {forcePolicyResult}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tactical Maps */}
          <Card className="bg-blue-950/10 border-blue-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-300 text-sm flex items-center gap-2">
                <MapIcon className="h-4 w-4" />
                Tactical Maps
              </CardTitle>
              <CardDescription className="text-blue-400/70 text-xs">
                Building layouts and tactical positioning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter location or building name"
                  className="bg-black/70 border-blue-900/50 flex-1"
                  value={mapLocation}
                  onChange={(e) => setMapLocation(e.target.value)}
                />
                <Button
                  onClick={loadTacticalMap}
                  disabled={!mapLocation.trim() || isProcessing}
                  className="bg-blue-700 hover:bg-blue-800 whitespace-nowrap"
                >
                  {isProcessing ? (
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    "Load Map"
                  )}
                </Button>
              </div>

              {showMap && (
                <div className="border rounded-lg bg-black/50 p-3 h-[250px] relative">
                  <div className="absolute inset-0 bg-blue-950/40 flex flex-col items-center justify-center p-4">
                    <BuildingIcon className="h-16 w-16 text-blue-500/50 mb-2" />
                    <div className="text-center">
                      <h3 className="text-blue-300 text-sm mb-1">{mapLocation}</h3>
                      <p className="text-blue-400/70 text-xs">Building layout loaded</p>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <TargetIcon className="h-6 w-6 text-blue-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* OpenAI Voice Test Tab */}
        <TabsContent value="voice" className="space-y-4 mt-0">
          <Card className="bg-blue-950/10 border-blue-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-blue-300 text-sm flex items-center gap-2">
                <VolumeIcon className="h-4 w-4" />
                OpenAI Voice Synthesis Test
              </CardTitle>
              <CardDescription className="text-blue-400/70 text-xs">
                Test the new OpenAI text-to-speech functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OpenAIVoiceTest />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}