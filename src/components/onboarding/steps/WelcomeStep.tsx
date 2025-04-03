import React from 'react';
import { Button } from '../../ui/button';
import { ArrowRight, Shield, Sparkles, Zap, BookOpen, MessageSquare } from 'lucide-react';
import LarkLogo from '../../LarkLogo';

interface WelcomeStepProps {
  onNext: (data?: any) => void;
  data?: any;
  allData?: any;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative group w-24 h-24 mb-2">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md group-hover:blur-xl transition-all duration-500 opacity-70"></div>
          <LarkLogo width={96} height={96} className="relative z-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-blue-900">Welcome to LARK</h1>
        <p className="text-lg text-blue-700 max-w-2xl">
          Your AI-powered Law Enforcement Assistance & Response Kit
        </p>
        
        <p className="text-gray-600 max-w-2xl">
          We'll guide you through a quick setup process to customize LARK for your needs.
          This will only take a few minutes.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Secure & Compliant</h3>
              <p className="text-gray-600 text-sm">
                Built with law enforcement security standards in mind, ensuring your data remains protected.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">AI-Powered Assistance</h3>
              <p className="text-gray-600 text-sm">
                Advanced AI technology to help with reports, statutes, and critical decision-making.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Instant Access</h3>
              <p className="text-gray-600 text-sm">
                Quick access to critical information when you need it most, even in offline situations.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Voice-Activated</h3>
              <p className="text-gray-600 text-sm">
                Hands-free operation with natural language voice commands for safer field use.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <Button 
          onClick={() => onNext()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full flex items-center gap-2 text-lg"
        >
          Let's Get Started
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default WelcomeStep;
