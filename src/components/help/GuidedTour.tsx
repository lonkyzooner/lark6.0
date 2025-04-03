import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2,
  Lightbulb
} from 'lucide-react';

// Define tour step interface
interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  spotlightPadding?: number;
  disableOverlay?: boolean;
  disableBeacon?: boolean;
}

// Define tour interface
interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
}

// Define available tours
const AVAILABLE_TOURS: Record<string, Tour> = {
  'getting-started': {
    id: 'getting-started',
    name: 'Getting Started',
    steps: [
      {
        target: '.dashboard-tab',
        title: 'Dashboard',
        content: 'This is your main dashboard where you can see an overview of your activity and quick access to key features.',
        position: 'bottom'
      },
      {
        target: '.voice-assistant-button',
        title: 'Voice Assistant',
        content: 'Click here or say "Hey LARK" to activate the voice assistant for hands-free operation.',
        position: 'left'
      },
      {
        target: '.miranda-tab',
        title: 'Miranda Rights',
        content: 'Access Miranda rights in multiple languages and play audio recordings.',
        position: 'bottom'
      },
      {
        target: '.statutes-tab',
        title: 'Statute Lookup',
        content: 'Quickly search and reference legal statutes and codes.',
        position: 'bottom'
      },
      {
        target: '.help-button',
        title: 'Help Center',
        content: 'Access tutorials, FAQs, and support resources anytime you need assistance.',
        position: 'left'
      }
    ]
  },
  'voice-assistant': {
    id: 'voice-assistant',
    name: 'Voice Assistant',
    steps: [
      {
        target: '.voice-assistant-button',
        title: 'Activate Voice Assistant',
        content: 'Click here or say "Hey LARK" to activate the voice assistant.',
        position: 'left'
      },
      {
        target: '.voice-commands-list',
        title: 'Voice Commands',
        content: 'Browse available voice commands or try saying "What can I say?" for help.',
        position: 'right'
      },
      {
        target: '.voice-settings',
        title: 'Voice Settings',
        content: 'Customize voice recognition and response settings here.',
        position: 'top'
      }
    ]
  },
  'report-writing': {
    id: 'report-writing',
    name: 'Report Writing',
    steps: [
      {
        target: '.new-report-button',
        title: 'Create New Report',
        content: 'Click here to start a new report or use the voice command "Start new report".',
        position: 'bottom'
      },
      {
        target: '.report-templates',
        title: 'Report Templates',
        content: 'Choose from various report templates to get started quickly.',
        position: 'right'
      },
      {
        target: '.dictation-button',
        title: 'Voice Dictation',
        content: 'Click here to dictate your report using voice recognition.',
        position: 'left'
      },
      {
        target: '.report-review',
        title: 'Report Review',
        content: 'Use this feature to have LARK review your report for potential issues.',
        position: 'top'
      }
    ]
  }
};

interface GuidedTourProps {
  tourId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
  tourId,
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tour, setTour] = useState<Tour | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  // Get tour data
  useEffect(() => {
    if (tourId && AVAILABLE_TOURS[tourId]) {
      setTour(AVAILABLE_TOURS[tourId]);
      setCurrentStep(0);
    }
  }, [tourId]);
  
  // Find target element and position tooltip
  useEffect(() => {
    if (!isOpen || !tour) return;
    
    const step = tour.steps[currentStep];
    if (!step) return;
    
    const target = document.querySelector(step.target) as HTMLElement;
    if (target) {
      setTargetElement(target);
      
      // Position tooltip relative to target
      const targetRect = target.getBoundingClientRect();
      const padding = step.spotlightPadding || 10;
      
      let top = 0;
      let left = 0;
      
      switch (step.position) {
        case 'top':
          top = targetRect.top - padding - 120;
          left = targetRect.left + (targetRect.width / 2) - 150;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - 60;
          left = targetRect.right + padding;
          break;
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + (targetRect.width / 2) - 150;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - 60;
          left = targetRect.left - padding - 300;
          break;
        default:
          top = targetRect.bottom + padding;
          left = targetRect.left + (targetRect.width / 2) - 150;
      }
      
      // Ensure tooltip stays within viewport
      if (top < 20) top = 20;
      if (left < 20) left = 20;
      if (left + 300 > window.innerWidth - 20) left = window.innerWidth - 320;
      
      setTooltipPosition({ top, left });
      
      // Scroll target into view if needed
      if (
        targetRect.top < 0 ||
        targetRect.left < 0 ||
        targetRect.bottom > window.innerHeight ||
        targetRect.right > window.innerWidth
      ) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
      
      // Add highlight to target
      target.classList.add('tour-highlight');
      
      return () => {
        // Remove highlight when step changes
        target.classList.remove('tour-highlight');
      };
    }
  }, [isOpen, tour, currentStep]);
  
  // Handle next step
  const handleNext = () => {
    if (!tour) return;
    
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle tour completion
  const handleComplete = () => {
    onComplete();
    onClose();
    
    // In a real implementation, this would save the tour completion status
    console.log(`Tour ${tourId} completed`);
  };
  
  // Handle tour close
  const handleClose = () => {
    onClose();
    
    // In a real implementation, this would save the tour progress
    console.log(`Tour ${tourId} closed at step ${currentStep + 1}`);
  };
  
  if (!isOpen || !tour) return null;
  
  const currentTourStep = tour.steps[currentStep];
  const progress = ((currentStep + 1) / tour.steps.length) * 100;
  
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 pointer-events-auto" onClick={handleClose} />
      
      {/* Tooltip */}
      <div 
        className="fixed z-50 w-[300px] bg-white rounded-lg shadow-xl pointer-events-auto"
        style={{ 
          top: `${tooltipPosition.top}px`, 
          left: `${tooltipPosition.left}px` 
        }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium text-gray-900">{currentTourStep.title}</h3>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">{currentTourStep.content}</p>
          
          <Progress value={progress} className="h-1 mb-4" />
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Step {currentStep + 1} of {tour.steps.length}
            </div>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              
              {currentStep < tour.steps.length - 1 ? (
                <Button 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={handleNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  className="h-8 px-2 bg-green-600 hover:bg-green-700"
                  onClick={handleComplete}
                >
                  Complete
                  <CheckCircle2 className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Target spotlight */}
      {targetElement && (
        <div 
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, transparent 0, transparent 50%, rgba(0,0,0,0.5) 51%, rgba(0,0,0,0.5) 100%)',
            backgroundSize: '100% 100%',
            backgroundPosition: `${targetElement.getBoundingClientRect().left + (targetElement.getBoundingClientRect().width / 2)}px ${targetElement.getBoundingClientRect().top + (targetElement.getBoundingClientRect().height / 2)}px`,
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}
    </>
  );
};

export default GuidedTour;
