import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStripe } from '../contexts/StripeContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle2, ArrowRight, Shield, User } from 'lucide-react';
import App from '../App';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscriptionTier } = useStripe();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if we're coming from a successful subscription
    const urlParams = new URLSearchParams(location.search);
    const isSuccess = urlParams.get('subscription') === 'success';

    if (isSuccess) {
      setShowSuccess(true);

      // Remove the query parameter after a delay
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Determine subscription level for display
  const subscriptionName = subscriptionTier === 'premium'
    ? 'Premium'
    : subscriptionTier === 'standard'
      ? 'Standard'
      : subscriptionTier === 'enterprise'
        ? 'Enterprise'
        : 'Basic';

  // If showing success message, render that first
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-green-500 bg-blue-950/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-green-500/20 p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-white">Subscription Activated!</CardTitle>
            <CardDescription className="text-blue-200">
              Your {subscriptionName} plan is now active
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-blue-100">
            <p>Thank you for subscribing to LARK. You now have access to all {subscriptionName} features.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => setShowSuccess(false)}
              className="bg-blue-600 hover:bg-blue-500"
            >
              Continue to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Otherwise show the main dashboard with the App component
  return (
    <div className="min-h-screen">
      {/* Enhanced header with modern law enforcement gradient */}
      <div className="p-5 bg-gradient-to-r from-[#002166] to-[#0046c7] shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/circuit-board.svg')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/15 p-3 rounded-xl shadow-lg border border-white/10 backdrop-blur-sm group transition-all duration-300 hover:bg-white/20">
              <Shield className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                LARK
                <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full shadow-sm border border-white/10">
                  {subscriptionTier ? subscriptionName : 'Basic'}
                </span>
              </h1>
              <p className="text-blue-100 text-sm mt-0.5 opacity-80">
                Law Enforcement Assistance & Response Kit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 md:mt-0 relative z-10">
            {/* Enhanced status badge */}
            <div className="bg-white/15 px-4 py-2 rounded-full flex items-center text-sm text-white border border-white/10 backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-white/20 group">
              <div className="relative mr-2">
                <div className="absolute inset-0 bg-green-400/50 rounded-full animate-ping opacity-75"></div>
                <div className="h-3 w-3 rounded-full bg-green-400 relative"></div>
              </div>
              <span className="font-medium">System Active</span>
            </div>

            {/* Enhanced account button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/account')}
              className="text-[#002166] bg-white/90 border-white/20 hover:bg-white rounded-full px-5 py-5 font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <div className="bg-[#002166]/10 p-1 rounded-full">
                  <User className="h-4 w-4 text-[#002166]" />
                </div>
                <span>My Account</span>
              </div>
            </Button>
          </div>
        </div>
      </div>

      <App />
    </div>
  );
};

export default DashboardPage;
