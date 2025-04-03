import { useState, useEffect } from 'react';
import { useSettings } from '../lib/settings-store';

/**
 * Hook to get the user's preferred name for display throughout the app
 * Follows the priority: codename > rank + last name > "Officer"
 */
export function useUserName() {
  const settings = useSettings();
  const [displayName, setDisplayName] = useState<string>('');
  
  useEffect(() => {
    // Determine the display name based on available settings
    if (settings.officerCodename) {
      // Codename takes priority when set
      setDisplayName(settings.officerCodename);
    } else if (settings.officerName) {
      // When no codename, use rank and name
      setDisplayName(`${settings.officerRank || 'Officer'} ${settings.officerName}`);
    } else {
      // Fallback
      setDisplayName(settings.officerRank || 'Officer');
    }
    
    // Listen for profile updates from Settings component
    const handleProfileUpdate = (event: CustomEvent) => {
      const { codename, rank, name } = event.detail;
      
      if (codename) {
        setDisplayName(codename);
      } else if (name) {
        setDisplayName(`${rank || 'Officer'} ${name}`);
      } else {
        setDisplayName(rank || 'Officer');
      }
    };
    
    // Add event listener
    document.addEventListener('officerProfileUpdated', handleProfileUpdate as EventListener);
    
    // Clean up
    return () => {
      document.removeEventListener('officerProfileUpdated', handleProfileUpdate as EventListener);
    };
  }, [settings.officerCodename, settings.officerName, settings.officerRank]);
  
  return {
    displayName,
    hasCodename: !!settings.officerCodename,
    officerName: settings.officerName,
    officerRank: settings.officerRank || 'Officer',
    officerCodename: settings.officerCodename,
    
    // Helper function to get formal name (rank + last name)
    getFormalName: () => {
      return settings.officerName 
        ? `${settings.officerRank || 'Officer'} ${settings.officerName}` 
        : (settings.officerRank || 'Officer');
    }
  };
}
