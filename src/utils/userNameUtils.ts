/**
 * Utility functions for handling user names and preferences
 */

import { UserProfile } from '../contexts/AuthContext';

/**
 * Gets the user's preferred display name based on their profile settings
 * Priority: codename > first name > full name > "Officer"
 * 
 * @param user The user profile object
 * @param fallbackToRank Whether to use rank + last name as fallback (default: true)
 * @returns The preferred name to display
 */
export function getPreferredUserName(user: UserProfile | null | undefined, fallbackToRank: boolean = true): string {
  if (!user) return 'Officer';
  
  // Check if user has a codename in metadata
  if (user.metadata?.codename) {
    return user.metadata.codename;
  }
  
  // If no codename, use first name
  const firstName = user.name.split(' ')[0];
  if (firstName) {
    return firstName;
  }
  
  // If fallback to rank is enabled and user has a rank
  if (fallbackToRank && user.metadata?.rank) {
    const lastName = user.name.split(' ').slice(-1)[0];
    return `${user.metadata.rank} ${lastName}`;
  }
  
  // Default fallback
  return 'Officer';
}

/**
 * Gets the user's formal name for official contexts
 * Format: Rank LastName (e.g., "Officer Smith")
 * 
 * @param user The user profile object
 * @returns The formal name
 */
export function getFormalUserName(user: UserProfile | null | undefined): string {
  if (!user) return 'Officer';
  
  const lastName = user.name.split(' ').slice(-1)[0];
  const rank = user.metadata?.rank || 'Officer';
  
  return `${rank} ${lastName}`;
}

/**
 * Gets the user's full name
 * 
 * @param user The user profile object
 * @returns The user's full name
 */
export function getFullUserName(user: UserProfile | null | undefined): string {
  if (!user) return 'Officer';
  return user.name || 'Officer';
}

/**
 * Updates the user's codename in their metadata
 * 
 * @param user The user profile object
 * @param codename The new codename
 * @returns Updated user profile object
 */
export function updateUserCodename(user: UserProfile, codename: string): UserProfile {
  return {
    ...user,
    metadata: {
      ...user.metadata,
      codename
    }
  };
}
