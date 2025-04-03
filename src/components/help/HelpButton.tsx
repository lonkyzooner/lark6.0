import React, { useState } from 'react';
import { Button } from '../ui/button';
import { HelpCircle } from 'lucide-react';
import HelpCenter from './HelpCenter';

interface HelpButtonProps {
  variant?: 'default' | 'subtle' | 'floating';
  className?: string;
}

const HelpButton: React.FC<HelpButtonProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const openHelp = () => {
    setIsHelpOpen(true);
  };
  
  const closeHelp = () => {
    setIsHelpOpen(false);
  };
  
  if (variant === 'floating') {
    return (
      <>
        <Button
          className={`rounded-full fixed bottom-24 right-6 shadow-lg z-40 bg-blue-600 hover:bg-blue-700 ${className}`}
          size="icon"
          onClick={openHelp}
        >
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
        <HelpCenter isOpen={isHelpOpen} onClose={closeHelp} />
      </>
    );
  }
  
  if (variant === 'subtle') {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className={`text-gray-500 hover:text-gray-700 ${className}`}
          onClick={openHelp}
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Help
        </Button>
        <HelpCenter isOpen={isHelpOpen} onClose={closeHelp} />
      </>
    );
  }
  
  return (
    <>
      <Button
        variant="outline"
        className={`flex items-center gap-2 ${className}`}
        onClick={openHelp}
      >
        <HelpCircle className="h-4 w-4" />
        Help Center
      </Button>
      <HelpCenter isOpen={isHelpOpen} onClose={closeHelp} />
    </>
  );
};

export default HelpButton;
