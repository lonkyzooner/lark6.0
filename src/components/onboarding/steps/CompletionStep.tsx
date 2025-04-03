import React from 'react';
import { Button } from '../../ui/button';
import { CheckCircle2, ArrowRight, BookOpen, Zap, MessageSquare, Shield } from 'lucide-react';
import LarkLogo from '../../LarkLogo';
import confetti from 'canvas-confetti';

interface CompletionStepProps {
  onNext: (data?: any) => void;
  data?: any;
  allData?: any;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ onNext, allData }) => {
  // Get user name from profile data
  const userName = allData?.profile?.name || 'Officer';
  const codename = allData?.profile?.codename;
  
  // Get subscription plan from subscription data
  const subscriptionPlan = allData?.subscription?.plan || 'basic';
  const planName = 
    subscriptionPlan === 'basic' ? 'Basic' :
    subscriptionPlan === 'standard' ? 'Standard' :
    subscriptionPlan === 'premium' ? 'Premium' : 'Enterprise';
  
  // Trigger confetti on mount
  React.useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Trigger another burst after a short delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 }
      });
      
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 }
      });
    }, 500);
  }, []);
  
  return (
    <div className="space-y-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group w-24 h-24 mb-2">
          <div className="absolute inset-0 bg-green-500/20 rounded-full blur-md group-hover:blur-xl transition-all duration-500 opacity-70"></div>
          <div className="relative z-10 bg-green-100 rounded-full w-24 h-24 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-green-900">Setup Complete!</h1>
        <p className="text-lg text-green-700 max-w-2xl">
          Welcome to LARK, {codename || userName}
        </p>
        
        <p className="text-gray-600 max-w-2xl">
          Your {planName} subscription is now active. You're all set to start using LARK's powerful features.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-green-900 mb-1">Quick Start Guide</h3>
              <p className="text-gray-600 text-sm">
                Access the quick start guide to get up and running with LARK in minutes.
              </p>
              <Button variant="link" className="text-green-600 p-0 h-auto mt-2">
                View Guide
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-green-900 mb-1">Training Resources</h3>
              <p className="text-gray-600 text-sm">
                Access training videos and documentation to master all LARK features.
              </p>
              <Button variant="link" className="text-green-600 p-0 h-auto mt-2">
                Browse Resources
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-green-900 mb-1">Voice Command Guide</h3>
              <p className="text-gray-600 text-sm">
                Learn all the voice commands available to control LARK hands-free.
              </p>
              <Button variant="link" className="text-green-600 p-0 h-auto mt-2">
                View Commands
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-green-900 mb-1">Support Center</h3>
              <p className="text-gray-600 text-sm">
                Get help with any questions or issues you may encounter while using LARK.
              </p>
              <Button variant="link" className="text-green-600 p-0 h-auto mt-2">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <Button 
          onClick={() => onNext()} 
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-full flex items-center gap-2 text-lg"
        >
          Start Using LARK
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CompletionStep;
