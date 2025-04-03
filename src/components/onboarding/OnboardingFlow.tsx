import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Shield, 
  User, 
  Building, 
  CreditCard,
  Sparkles,
  BookOpen,
  Lightbulb,
  Zap
} from 'lucide-react';

// Import individual steps
import WelcomeStep from './steps/WelcomeStep';
import ProfileSetupStep from './steps/ProfileSetupStep';
import DepartmentSetupStep from './steps/DepartmentSetupStep';
import SubscriptionStep from './steps/SubscriptionStep';
import PaymentStep from './steps/PaymentStep';
import FeaturesOverviewStep from './steps/FeaturesOverviewStep';
import CompletionStep from './steps/CompletionStep';

// Define the steps in the onboarding flow
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to LARK',
    description: 'Law Enforcement Assistance & Response Kit',
    icon: <Sparkles className="h-6 w-6 text-blue-600" />,
    component: WelcomeStep
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'Tell us about yourself',
    icon: <User className="h-6 w-6 text-blue-600" />,
    component: ProfileSetupStep
  },
  {
    id: 'department',
    title: 'Department Details',
    description: 'Connect with your department',
    icon: <Building className="h-6 w-6 text-blue-600" />,
    component: DepartmentSetupStep
  },
  {
    id: 'subscription',
    title: 'Choose Your Plan',
    description: 'Select the right subscription',
    icon: <Shield className="h-6 w-6 text-blue-600" />,
    component: SubscriptionStep
  },
  {
    id: 'payment',
    title: 'Payment Details',
    description: 'Secure subscription setup',
    icon: <CreditCard className="h-6 w-6 text-blue-600" />,
    component: PaymentStep
  },
  {
    id: 'features',
    title: 'Feature Overview',
    description: 'Discover what LARK can do',
    icon: <BookOpen className="h-6 w-6 text-blue-600" />,
    component: FeaturesOverviewStep
  },
  {
    id: 'completion',
    title: 'All Set!',
    description: 'You\'re ready to get started',
    icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
    component: CompletionStep
  }
];

interface OnboardingFlowProps {
  onComplete: () => void;
  initialStep?: number;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ 
  onComplete,
  initialStep = 0
}) => {
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [onboardingData, setOnboardingData] = useState<any>({
    profile: {
      name: user?.name || '',
      codename: user?.codename || '',
      badgeNumber: user?.badgeNumber || ''
    },
    department: {
      name: user?.department || '',
      location: '',
      role: user?.role || 'officer'
    },
    subscription: {
      plan: user?.subscriptionPlan || 'basic'
    },
    payment: {
      completed: false
    },
    features: {
      viewed: false
    }
  });
  
  // Calculate progress percentage
  const progressPercentage = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  
  // Get current step component
  const CurrentStepComponent = ONBOARDING_STEPS[currentStep].component;
  
  // Handle next step
  const handleNext = async (stepData?: any) => {
    try {
      if (stepData) {
        // Update the onboarding data with the step data
        setOnboardingData(prev => ({
          ...prev,
          [ONBOARDING_STEPS[currentStep].id]: {
            ...prev[ONBOARDING_STEPS[currentStep].id],
            ...stepData
          }
        }));
      }
      
      // If this is the last step, complete onboarding
      if (currentStep === ONBOARDING_STEPS.length - 1) {
        setIsSubmitting(true);
        
        // Save all onboarding data to user profile
        await updateProfile({
          name: onboardingData.profile.name,
          codename: onboardingData.profile.codename,
          badgeNumber: onboardingData.profile.badgeNumber,
          department: onboardingData.department.name,
          role: onboardingData.department.role,
          // Other fields would be updated by the subscription process
        });
        
        // Call the onComplete callback
        onComplete();
      } else {
        // Move to the next step
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Handle skip (only available for certain steps)
  const handleSkip = () => {
    // Skip to the next step without saving data
    setCurrentStep(prev => prev + 1);
  };
  
  // Check if the current step can be skipped
  const canSkipCurrentStep = () => {
    const skipableSteps = ['department', 'features'];
    return skipableSteps.includes(ONBOARDING_STEPS[currentStep].id);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <Card className="w-full max-w-4xl shadow-xl border-blue-100">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              {ONBOARDING_STEPS[currentStep].icon}
              <div>
                <CardTitle className="text-2xl font-bold text-blue-900">
                  {ONBOARDING_STEPS[currentStep].title}
                </CardTitle>
                <CardDescription className="text-blue-600">
                  {ONBOARDING_STEPS[currentStep].description}
                </CardDescription>
              </div>
            </div>
            <div className="text-sm font-medium text-blue-600">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </div>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </CardHeader>
        
        <CardContent className="pt-6">
          <CurrentStepComponent 
            data={onboardingData[ONBOARDING_STEPS[currentStep].id]}
            onNext={handleNext}
            allData={onboardingData}
          />
        </CardContent>
        
        <CardFooter className="flex justify-between pt-6 border-t border-blue-100">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex gap-3">
            {canSkipCurrentStep() && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                Skip for now
              </Button>
            )}
            
            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <Button
                onClick={() => handleNext()}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => handleNext()}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Completing...' : 'Complete Setup'}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
