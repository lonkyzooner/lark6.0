import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Settings, CreditCard } from 'lucide-react';
import AuthModal from './AuthModal';
import OnboardingFlow from '../onboarding/OnboardingFlow';

interface AuthButtonProps {
  variant?: 'default' | 'subtle';
  className?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  
  // Open auth modal with login tab
  const openLogin = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };
  
  // Open auth modal with signup tab
  const openSignup = () => {
    setAuthModalTab('signup');
    setIsAuthModalOpen(true);
  };
  
  // Close auth modal
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };
  
  // Handle successful authentication
  const handleAuthSuccess = () => {
    // If user doesn't have a subscription plan, open onboarding
    if (!user?.subscriptionPlan) {
      setIsOnboardingOpen(true);
    }
  };
  
  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // If user is authenticated, show user menu
  if (isAuthenticated && user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={`p-0 h-auto ${className}`}>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {user.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                {variant === 'default' && (
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{user.codename || user.name.split(' ')[0]}</span>
                    <span className="text-xs text-gray-500">{user.subscriptionPlan || 'No Plan'}</span>
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>My Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Subscription</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {isOnboardingOpen && (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}
      </>
    );
  }
  
  // If user is not authenticated, show login/signup buttons
  if (variant === 'subtle') {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={openLogin}>
            Login
          </Button>
          <Button size="sm" onClick={openSignup}>
            Sign Up
          </Button>
        </div>
        
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={closeAuthModal} 
          initialTab={authModalTab}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }
  
  return (
    <>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={openLogin}>
          Login
        </Button>
        <Button onClick={openSignup}>
          Sign Up
        </Button>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
        initialTab={authModalTab}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default AuthButton;
