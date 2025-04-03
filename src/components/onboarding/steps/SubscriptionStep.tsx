import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { CheckCircle2, Shield, Zap, Star, Building, Check, X } from 'lucide-react';

// Define subscription plans
const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    description: 'Essential tools for individual officers',
    features: [
      'Voice Assistant',
      'Miranda Rights',
      'Statute Lookup',
      'Basic Report Writing',
      'Offline Mode',
      'Email Support'
    ],
    notIncluded: [
      'Advanced Report Writing',
      'Threat Assessment',
      'Case Management',
      'Department Integration'
    ],
    popular: false,
    color: 'blue'
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 19.99,
    description: 'Complete toolkit for active duty officers',
    features: [
      'Voice Assistant',
      'Miranda Rights',
      'Statute Lookup',
      'Advanced Report Writing',
      'Threat Assessment',
      'Case Management',
      'Offline Mode',
      'Priority Support'
    ],
    notIncluded: [
      'Real-time Collaboration',
      'Advanced Analytics',
      'Department Integration'
    ],
    popular: true,
    color: 'indigo'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    description: 'Enhanced capabilities for specialized units',
    features: [
      'Voice Assistant',
      'Miranda Rights',
      'Statute Lookup',
      'Advanced Report Writing',
      'Threat Assessment',
      'Case Management',
      'Real-time Collaboration',
      'Advanced Analytics',
      'Offline Mode',
      '24/7 Priority Support'
    ],
    notIncluded: [
      'Department-wide Deployment',
      'Custom Training'
    ],
    popular: false,
    color: 'purple'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'Tailored solutions for entire departments',
    features: [
      'All Premium Features',
      'Department-wide Deployment',
      'Custom Training',
      'Dedicated Account Manager',
      'API Access',
      'Custom Integrations'
    ],
    notIncluded: [],
    popular: false,
    color: 'slate',
    contactRequired: true
  }
];

interface SubscriptionStepProps {
  onNext: (data: any) => void;
  data: {
    plan: string;
  };
  allData?: any;
}

const SubscriptionStep: React.FC<SubscriptionStepProps> = ({ onNext, data }) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(data.plan || 'basic');
  
  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };
  
  // Handle continue button click
  const handleContinue = () => {
    onNext({ plan: selectedPlan });
  };
  
  // Get color class based on plan color
  const getColorClass = (color: string, type: 'bg' | 'text' | 'border' | 'hover') => {
    const colorMap: Record<string, Record<string, string>> = {
      blue: {
        bg: 'bg-blue-600',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:border-blue-400 hover:bg-blue-50'
      },
      indigo: {
        bg: 'bg-indigo-600',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        hover: 'hover:border-indigo-400 hover:bg-indigo-50'
      },
      purple: {
        bg: 'bg-purple-600',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:border-purple-400 hover:bg-purple-50'
      },
      slate: {
        bg: 'bg-slate-800',
        text: 'text-slate-800',
        border: 'border-slate-200',
        hover: 'hover:border-slate-400 hover:bg-slate-50'
      }
    };
    
    return colorMap[color]?.[type] || colorMap.blue[type];
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Choose the subscription plan that best fits your needs. All plans include core LARK features.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card 
            key={plan.id}
            className={`border-2 transition-all duration-300 ${
              selectedPlan === plan.id 
                ? `border-${plan.color}-500 shadow-md shadow-${plan.color}-100` 
                : `border-gray-200 ${getColorClass(plan.color, 'hover')}`
            }`}
            onClick={() => handleSelectPlan(plan.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className={`text-xl font-bold ${getColorClass(plan.color, 'text')}`}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {plan.description}
                  </CardDescription>
                </div>
                
                {plan.popular && (
                  <Badge className="bg-indigo-600">
                    Most Popular
                  </Badge>
                )}
              </div>
              
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                </span>
                {typeof plan.price === 'number' && (
                  <span className="text-gray-500 ml-1">/month</span>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Included Features</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className={`h-5 w-5 ${getColorClass(plan.color, 'text')} shrink-0 mt-0.5`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {plan.notIncluded.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Not Included</h4>
                    <ul className="space-y-2">
                      {plan.notIncluded.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <X className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-500">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter>
              <Button
                variant={selectedPlan === plan.id ? 'default' : 'outline'}
                className={`w-full ${
                  selectedPlan === plan.id 
                    ? getColorClass(plan.color, 'bg') 
                    : 'border-gray-200'
                }`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {selectedPlan === plan.id ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Selected
                  </span>
                ) : (
                  'Select Plan'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full mt-0.5">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Secure Billing</h3>
            <p className="text-sm text-blue-700">
              All payments are processed securely through Stripe. Your payment information is never stored on our servers.
            </p>
          </div>
        </div>
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button 
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          Continue with {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionStep;
