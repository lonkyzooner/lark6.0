import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Button } from '../ui/button';

interface ContextualHelpProps {
  topic: string;
  children?: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

// Define help content for different topics
const HELP_CONTENT: Record<string, { title: string; content: string; link?: string }> = {
  'voice-assistant': {
    title: 'Voice Assistant',
    content: 'Activate the voice assistant by saying "Hey LARK" or clicking the microphone icon.',
    link: '/help/voice-assistant'
  },
  'miranda-rights': {
    title: 'Miranda Rights',
    content: 'Access Miranda rights in multiple languages and play audio recordings.',
    link: '/help/miranda-rights'
  },
  'statute-lookup': {
    title: 'Statute Lookup',
    content: 'Search for statutes by number, keyword, or description.',
    link: '/help/statute-lookup'
  },
  'report-writing': {
    title: 'Report Writing',
    content: 'Create and edit reports with voice dictation or text input.',
    link: '/help/report-writing'
  },
  'threat-assessment': {
    title: 'Threat Assessment',
    content: 'Analyze situations for potential threats and get safety recommendations.',
    link: '/help/threat-assessment'
  },
  'settings': {
    title: 'Settings',
    content: 'Customize LARK to your preferences and manage your account.',
    link: '/help/settings'
  },
  'subscription': {
    title: 'Subscription',
    content: 'Manage your subscription plan and billing information.',
    link: '/help/subscription'
  },
  'offline-mode': {
    title: 'Offline Mode',
    content: 'LARK continues to work with limited functionality when offline.',
    link: '/help/offline-mode'
  },
  'profile': {
    title: 'Profile',
    content: 'Manage your personal information and preferences.',
    link: '/help/profile'
  },
  'department': {
    title: 'Department',
    content: 'Connect with your department for enhanced features and collaboration.',
    link: '/help/department'
  }
};

const ContextualHelp: React.FC<ContextualHelpProps> = ({
  topic,
  children,
  position = 'top',
  className = '',
  iconSize = 'md',
  showIcon = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get help content for the topic
  const helpContent = HELP_CONTENT[topic] || {
    title: 'Help',
    content: 'No help content available for this topic.'
  };
  
  // Get icon size class
  const getIconSizeClass = () => {
    switch (iconSize) {
      case 'sm':
        return 'h-3.5 w-3.5';
      case 'lg':
        return 'h-5 w-5';
      case 'md':
      default:
        return 'h-4 w-4';
    }
  };
  
  // Handle view more click
  const handleViewMore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // In a real implementation, this would navigate to the help page
    console.log(`Navigate to: ${helpContent.link}`);
    
    // Close the tooltip
    setIsOpen(false);
  };
  
  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          {children ? (
            <span className={className}>{children}</span>
          ) : (
            showIcon && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-auto w-auto p-1 text-gray-400 hover:text-gray-600 ${className}`}
              >
                <HelpCircle className={getIconSizeClass()} />
                <span className="sr-only">Help for {helpContent.title}</span>
              </Button>
            )
          )}
        </TooltipTrigger>
        <TooltipContent side={position} className="max-w-xs p-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{helpContent.title}</h4>
            <p className="text-xs text-gray-600">{helpContent.content}</p>
            {helpContent.link && (
              <Button
                variant="link"
                size="sm"
                className="text-xs p-0 h-auto"
                onClick={handleViewMore}
              >
                View more
              </Button>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ContextualHelp;
