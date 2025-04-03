import React, { useState, useEffect } from 'react';
import { Users, UserPlus, X, Check, AlertTriangle, Clock, Shield, User, Edit, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import axios from 'axios';

// Define the props interface
interface ReportCollaboratorsProps {
  reportId: string;
  currentUserId: string;
  isOwner: boolean;
}

// Define the collaborator interface
interface Collaborator {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    badgeNumber?: string;
    department?: string;
  };
  role: 'owner' | 'editor' | 'viewer';
  addedAt: string;
  addedBy: {
    id: string;
    name: string;
  };
  status: 'active' | 'pending' | 'declined';
  lastActive?: string;
}

// Mock data for collaborators
const MOCK_COLLABORATORS: Collaborator[] = [
  {
    id: '1',
    user: {
      id: '101',
      name: 'Officer Johnson',
      email: 'johnson@lapd.gov',
      avatarUrl: '',
      badgeNumber: '12345',
      department: 'Patrol'
    },
    role: 'owner',
    addedAt: '2023-05-15T16:45:00Z',
    addedBy: {
      id: '101',
      name: 'Officer Johnson'
    },
    status: 'active',
    lastActive: '2023-05-15T17:30:00Z'
  },
  {
    id: '2',
    user: {
      id: '102',
      name: 'Officer Martinez',
      email: 'martinez@lapd.gov',
      avatarUrl: '',
      badgeNumber: '23456',
      department: 'Traffic'
    },
    role: 'editor',
    addedAt: '2023-05-15T17:00:00Z',
    addedBy: {
      id: '101',
      name: 'Officer Johnson'
    },
    status: 'active',
    lastActive: '2023-05-15T17:15:00Z'
  },
  {
    id: '3',
    user: {
      id: '103',
      name: 'Sergeant Williams',
      email: 'williams@lapd.gov',
      avatarUrl: '',
      badgeNumber: '34567',
      department: 'Supervision'
    },
    role: 'viewer',
    addedAt: '2023-05-15T17:30:00Z',
    addedBy: {
      id: '101',
      name: 'Officer Johnson'
    },
    status: 'pending'
  }
];

// Mock data for available users
const MOCK_AVAILABLE_USERS = [
  {
    id: '104',
    name: 'Officer Thompson',
    email: 'thompson@lapd.gov',
    avatarUrl: '',
    badgeNumber: '45678',
    department: 'Patrol'
  },
  {
    id: '105',
    name: 'Officer Davis',
    email: 'davis@lapd.gov',
    avatarUrl: '',
    badgeNumber: '56789',
    department: 'Investigation'
  },
  {
    id: '106',
    name: 'Lieutenant Rodriguez',
    email: 'rodriguez@lapd.gov',
    avatarUrl: '',
    badgeNumber: '67890',
    department: 'Command'
  }
];

const ReportCollaborators: React.FC<ReportCollaboratorsProps> = ({ 
  reportId, 
  currentUserId, 
  isOwner 
}) => {
  // State
  const [collaborators, setCollaborators] = useState<Collaborator[]>(MOCK_COLLABORATORS);
  const [availableUsers, setAvailableUsers] = useState(MOCK_AVAILABLE_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Function to get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Function to add a collaborator
  const addCollaborator = async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, you would call your API here
      // For now, we'll simulate a successful response
      
      const user = availableUsers.find(u => u.id === selectedUser);
      if (!user) throw new Error('User not found');
      
      const newCollaborator: Collaborator = {
        id: `new-${Date.now()}`,
        user: user,
        role: selectedRole,
        addedAt: new Date().toISOString(),
        addedBy: {
          id: currentUserId,
          name: 'Current User' // In a real app, you would use the current user's name
        },
        status: 'pending'
      };
      
      // Update state
      setCollaborators([...collaborators, newCollaborator]);
      setAvailableUsers(availableUsers.filter(u => u.id !== selectedUser));
      
      // Close dialog
      setIsAddDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole('editor');
    } catch (err) {
      console.error('Error adding collaborator:', err);
      setError('Failed to add collaborator. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to remove a collaborator
  const removeCollaborator = async (collaboratorId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, you would call your API here
      // For now, we'll simulate a successful response
      
      const collaborator = collaborators.find(c => c.id === collaboratorId);
      if (!collaborator) throw new Error('Collaborator not found');
      
      // Update state
      setCollaborators(collaborators.filter(c => c.id !== collaboratorId));
      
      // Add user back to available users if they were removed
      if (collaborator.user.id !== currentUserId) {
        setAvailableUsers([...availableUsers, collaborator.user]);
      }
    } catch (err) {
      console.error('Error removing collaborator:', err);
      setError('Failed to remove collaborator. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to change a collaborator's role
  const changeCollaboratorRole = async (collaboratorId: string, newRole: 'owner' | 'editor' | 'viewer') => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, you would call your API here
      // For now, we'll simulate a successful response
      
      // Update state
      setCollaborators(collaborators.map(c => 
        c.id === collaboratorId ? { ...c, role: newRole } : c
      ));
    } catch (err) {
      console.error('Error changing collaborator role:', err);
      setError('Failed to change collaborator role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter available users based on search query
  const filteredUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.badgeNumber?.includes(searchQuery) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Collaborators
        </CardTitle>
        <CardDescription>
          Manage who can view and edit this report
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Collaborators */}
        <div className="space-y-3">
          {collaborators.map((collaborator) => (
            <div 
              key={collaborator.id} 
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={collaborator.user.avatarUrl} />
                  <AvatarFallback>{getInitials(collaborator.user.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {collaborator.user.name}
                    {collaborator.status === 'pending' && (
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-xs">
                        Pending
                      </Badge>
                    )}
                    {collaborator.user.id === currentUserId && (
                      <Badge variant="outline" className="text-blue-500 border-blue-500 text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {collaborator.user.badgeNumber && (
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {collaborator.user.badgeNumber}
                      </span>
                    )}
                    {collaborator.user.department && (
                      <span>{collaborator.user.department}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Role Badge */}
                <Badge 
                  variant={
                    collaborator.role === 'owner' 
                      ? 'default' 
                      : collaborator.role === 'editor' 
                        ? 'secondary' 
                        : 'outline'
                  }
                  className="flex items-center gap-1"
                >
                  {collaborator.role === 'owner' && <Shield className="h-3 w-3" />}
                  {collaborator.role === 'editor' && <Edit className="h-3 w-3" />}
                  {collaborator.role === 'viewer' && <Eye className="h-3 w-3" />}
                  {collaborator.role === 'owner' ? 'Owner' : collaborator.role === 'editor' ? 'Editor' : 'Viewer'}
                </Badge>
                
                {/* Last Active */}
                {collaborator.lastActive && (
                  <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(collaborator.lastActive)}
                  </span>
                )}
                
                {/* Actions */}
                {isOwner && collaborator.user.id !== currentUserId && (
                  <div className="flex items-center">
                    {/* Role Selector (only if owner) */}
                    <Select 
                      value={collaborator.role} 
                      onValueChange={(value) => changeCollaboratorRole(
                        collaborator.id, 
                        value as 'owner' | 'editor' | 'viewer'
                      )}
                      disabled={!isOwner || isLoading}
                    >
                      <SelectTrigger className="h-8 w-[110px]">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCollaborator(collaborator.id)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Collaborator Button */}
        {isOwner && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                Add Collaborator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Collaborator</DialogTitle>
                <DialogDescription>
                  Invite someone to collaborate on this report.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="search-user" className="text-sm font-medium">
                    Search for a user
                  </label>
                  <Input
                    id="search-user"
                    placeholder="Search by name, badge number, or department"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select a user
                  </label>
                  <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No users found
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div 
                          key={user.id} 
                          className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${
                            selectedUser === user.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedUser(user.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{user.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                {user.badgeNumber && (
                                  <span className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    {user.badgeNumber}
                                  </span>
                                )}
                                {user.department && (
                                  <span>{user.department}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {selectedUser === user.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Role
                  </label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'editor' | 'viewer')}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">
                    <p><strong>Editor:</strong> Can edit the report content</p>
                    <p><strong>Viewer:</strong> Can only view the report</p>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={addCollaborator} 
                  disabled={!selectedUser || isLoading}
                >
                  Add Collaborator
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Error Message */}
        {error && !isAddDialogOpen && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportCollaborators;
