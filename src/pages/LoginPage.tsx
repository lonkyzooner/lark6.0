import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Shield, LogIn, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, isLoading, error } = useAuth0();

  const handleLogin = async () => {
    console.log('[LoginPage] Initiating Auth0 login');
    try {
      await loginWithRedirect({
        appState: {
          returnTo: '/',
          timestamp: new Date().getTime()
        }
      });
    } catch (err) {
      console.error('[LoginPage] Auth0 login error:', err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#edf5fc] to-[#d1e6f9]">
      <div className="fluid-wave"></div>
      <div className="fluid-wave-gold"></div>

      <Card className="fluid-card enhanced-card border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 w-full max-w-md mx-auto backdrop-blur-xl bg-white/90">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="p-3 bg-[#002166]/10 rounded-full inline-flex">
              <Shield className="h-12 w-12 text-[#002166]" />
            </div>
          </div>
          <div>
            <CardTitle className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#002166] to-[#0046c7]">LARK</CardTitle>
            <CardDescription className="text-[#0046c7]/80 mt-2 text-base">
              Law Enforcement Assistance and Response Kit
            </CardDescription>
          </div>
          <Badge className="bg-gradient-to-r from-[#002166] to-[#0046c7] text-white border-0 mx-auto px-3 py-1 shadow-sm">
            Secure Authentication
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-semibold text-[#002166]">Welcome</h3>
            <p className="text-sm text-muted-foreground">
              Sign in to access your LARK assistant
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-6 flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-[#002166] animate-spin" />
              <p className="text-[#002166]">Loading authentication...</p>
            </div>
          ) : isAuthenticated ? (
            <div className="text-center py-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
              <p className="text-blue-700">You are already authenticated. Redirecting...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">Authentication error: {error.message}</p>
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-[#002166] to-[#0046c7] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active-press py-6 text-lg flex items-center justify-center gap-2"
                onClick={handleLogin}
              >
                <LogIn className="h-5 w-5" />
                Sign in with Auth0
              </Button>

              <div className="text-xs text-center text-muted-foreground mt-4 p-3 bg-blue-50 rounded-md">
                <p>Auth0 Domain: {import.meta.env.VITE_AUTH0_DOMAIN}</p>
                <p className="mt-1">Client ID: {import.meta.env.VITE_AUTH0_CLIENT_ID.substring(0, 6)}...</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-[#002166]/10 pt-4">
          <p className="text-xs text-muted-foreground">
            © 2025 LARK - Secure Authentication
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
