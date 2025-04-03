import { useState, useEffect } from 'react';
import { useSettings } from '../lib/settings-store';

/**
 * Hook to get the user's preferred display name
 * Follows the priority: codename > rank + last name > "Officer"
 * 
 * @returns The user's preferred display name and related information
 */
export function useUserDisplayName() {
  const settings = useSettings();
  const [displayName, setDisplayName] = useState<string>('');
  
  useEffect(() => {
    // Get user settings
    const userCodename = settings.officerCodename;
    const userName = settings.officerName;
    const userRank = settings.officerRank || 'Officer';
    
    // Determine how to address the user - prioritize codename
    const preferredName = userCodename || (userName ? `${userRank} ${userName}` : userRank);
    setDisplayName(preferredName);
    
    // Listen for profile updates from Settings component
    const handleProfileUpdate = (event: CustomEvent) => {
      const { codename, name, rank } = event.detail;
      
      // Determine how to address the user - prioritize codename
      const updatedName = codename || (name ? `${rank || 'Officer'} ${name}` : (rank || 'Officer'));
      setDisplayName(updatedName);
    };
    
    // Add event listener
    document.addEventListener('officerProfileUpdated', handleProfileUpdate as EventListener);
    
    // Clean up
    return () => {
      document.removeEventListener('officerProfileUpdated', handleProfileUpdate as EventListener);
    };
  }, [settings.officerCodename, settings.officerName, settings.officerRank]);
  
  /**
   * Get a time-appropriate greeting with the user's name
   * @returns A greeting string like "Good morning, Officer Smith"
   */
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    let greeting = 'Hello';
    
    if (currentHour < 12) {
      greeting = 'Good morning';
    } else if (currentHour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    return `${greeting}, ${displayName}`;
  };
  
  /**
   * Get the user's formal name (rank + last name)
   * @returns The formal name string
   */
  const getFormalName = () => {
    const userName = settings.officerName;
    const userRank = settings.officerRank || 'Officer';
    
    if (!userName) return userRank;
    
    const lastName = userName.split(' ').slice(-1)[0];
    return `${userRank} ${lastName}`;
  };
  
  return {
    displayName,
    getGreeting,
    getFormalName,
    hasCodename: !!settings.officerCodename,
    firstName: settings.officerName ? settings.officerName.split(' ')[0] : '',
    lastName: settings.officerName ? settings.officerName.split(' ').slice(-1)[0] : '',
    rank: settings.officerRank || 'Officer',
    codename: settings.officerCodename
  };
}
