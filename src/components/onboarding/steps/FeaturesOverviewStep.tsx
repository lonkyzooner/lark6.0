import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Mic, 
  BookOpen, 
  Shield, 
  FileText, 
  AlertTriangle, 
  Settings,
  CheckCircle2,
  ArrowRight,
  Play
} from 'lucide-react';

interface FeaturesOverviewStepProps {
  onNext: (data: any) => void;
  data: {
    viewed: boolean;
  };
  allData?: any;
}

const FeaturesOverviewStep: React.FC<FeaturesOverviewStepProps> = ({ onNext, data }) => {
  const [activeTab, setActiveTab] = useState('voice');
  const [featuresViewed, setFeaturesViewed] = useState<Record<string, boolean>>({
    voice: false,
    miranda: false,
    statutes: false,
    reports: false,
    threats: false,
    settings: false
  });
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFeaturesViewed(prev => ({
      ...prev,
      [value]: true
    }));
  };
  
  // Check if all features have been viewed
  const allFeaturesViewed = Object.values(featuresViewed).every(viewed => viewed);
  
  // Handle continue button click
  const handleContinue = () => {
    onNext({ viewed: true });
  };
  
  // Handle play demo click
  const handlePlayDemo = (feature: string) => {
    // In a real implementation, this would play a demo video or walkthrough
    console.log(`Playing demo for ${feature}`);
    
    // Mark feature as viewed
    setFeaturesViewed(prev => ({
      ...prev,
      [feature]: true
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Let's explore the key features of LARK to help you get started quickly.
        </p>
      </div>
      
      <Tabs defaultValue="voice" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger value="voice" className="relative">
            <Mic className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Voice</span>
            {featuresViewed.voice && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="miranda" className="relative">
            <BookOpen className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Miranda</span>
            {featuresViewed.miranda && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="statutes" className="relative">
            <Shield className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Statutes</span>
            {featuresViewed.statutes && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports" className="relative">
            <FileText className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Reports</span>
            {featuresViewed.reports && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="threats" className="relative">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Threats</span>
            {featuresViewed.threats && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="relative">
            <Settings className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Settings</span>
            {featuresViewed.settings && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3"></div>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="voice" className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Mic className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">Voice Assistant</h3>
              <p className="text-gray-600">Hands-free operation with natural language commands</p>
            </div>
          </div>
          
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handlePlayDemo('voice')}
            >
              <Play className="h-5 w-5" />
              Play Demo
            </Button>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Key Features:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Activate with "Hey LARK" voice command</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Natural language processing for intuitive interactions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Hands-free operation for safety in the field</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Quick access to all LARK features through voice</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Pro Tip</h4>
            <p className="text-blue-700 text-sm">
              Try saying "Hey LARK, read Miranda rights in Spanish" or "Hey LARK, look up statute 14:67" for quick access to key features.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="miranda" className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">Miranda Rights</h3>
              <p className="text-gray-600">Quick access to Miranda warnings in multiple languages</p>
            </div>
          </div>
          
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handlePlayDemo('miranda')}
            >
              <Play className="h-5 w-5" />
              Play Demo
            </Button>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Key Features:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Miranda warnings in multiple languages</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Audio playback for consistent delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Documentation of Miranda delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Customizable for jurisdiction-specific requirements</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Pro Tip</h4>
            <p className="text-blue-700 text-sm">
              Use the voice command "Read Miranda rights" followed by the language for quick access in the field.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="statutes" className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">Statute Lookup</h3>
              <p className="text-gray-600">Quick access to legal statutes and codes</p>
            </div>
          </div>
          
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handlePlayDemo('statutes')}
            >
              <Play className="h-5 w-5" />
              Play Demo
            </Button>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Key Features:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Comprehensive database of state and local statutes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Quick search by keyword, number, or description</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Plain language explanations of legal terms</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Offline access to frequently used statutes</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Pro Tip</h4>
            <p className="text-blue-700 text-sm">
              Bookmark frequently used statutes for quick access, or use voice commands like "Look up statute" followed by the statute number.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">Report Writing</h3>
              <p className="text-gray-600">Efficient and accurate report creation</p>
            </div>
          </div>
          
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handlePlayDemo('reports')}
            >
              <Play className="h-5 w-5" />
              Play Demo
            </Button>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Key Features:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Voice-to-text dictation for hands-free report writing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>AI-assisted grammar and clarity improvements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Templates for common report types</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Integration with department systems (with Enterprise plan)</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Pro Tip</h4>
            <p className="text-blue-700 text-sm">
              Use the "Review Report" feature to have LARK analyze your report for potential issues before submission.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="threats" className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">Threat Assessment</h3>
              <p className="text-gray-600">Situational awareness and risk evaluation</p>
            </div>
          </div>
          
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handlePlayDemo('threats')}
            >
              <Play className="h-5 w-5" />
              Play Demo
            </Button>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Key Features:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Real-time situation analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Risk factor identification</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>De-escalation guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Officer safety recommendations</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Pro Tip</h4>
            <p className="text-blue-700 text-sm">
              Use the voice command "Assess situation" to quickly activate the threat assessment feature in dynamic situations.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-900">Settings & Customization</h3>
              <p className="text-gray-600">Personalize LARK to your preferences</p>
            </div>
          </div>
          
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => handlePlayDemo('settings')}
            >
              <Play className="h-5 w-5" />
              Play Demo
            </Button>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Key Features:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Profile customization</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Voice recognition training</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Notification preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <span>Accessibility options</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Pro Tip</h4>
            <p className="text-blue-700 text-sm">
              Take time to train the voice recognition system with your voice for optimal performance in different environments.
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="pt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {Object.values(featuresViewed).filter(Boolean).length} of 6 features explored
        </div>
        
        <Button 
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          disabled={!allFeaturesViewed}
        >
          {allFeaturesViewed ? (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            'Explore All Features to Continue'
          )}
        </Button>
      </div>
    </div>
  );
};

export default FeaturesOverviewStep;
