import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { User, Upload, CheckCircle2 } from 'lucide-react';

// Define form schema
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  codename: z.string().optional(),
  badgeNumber: z.string().optional(),
  profileImage: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSetupStepProps {
  onNext: (data: any) => void;
  data: {
    name: string;
    codename?: string;
    badgeNumber?: string;
    profileImage?: string;
  };
  allData?: any;
}

const ProfileSetupStep: React.FC<ProfileSetupStepProps> = ({ onNext, data }) => {
  const [profileImage, setProfileImage] = useState<string | null>(data.profileImage || null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Initialize form with existing data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: data.name || '',
      codename: data.codename || '',
      badgeNumber: data.badgeNumber || '',
      profileImage: data.profileImage || ''
    }
  });
  
  // Handle form submission
  const onSubmit = (values: ProfileFormValues) => {
    // Add profile image to form values
    const profileData = {
      ...values,
      profileImage: profileImage || undefined
    };
    
    // Pass data to parent component
    onNext(profileData);
  };
  
  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // In a real implementation, this would upload the file to your storage service
    // For now, we'll just create a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target?.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
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
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Let's set up your profile information. This helps personalize your LARK experience.
        </p>
      </div>
      
      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            {profileImage ? (
              <AvatarImage src={profileImage} alt="Profile" />
            ) : (
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                {getInitials(form.watch('name') || 'LA')}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="absolute -bottom-2 -right-2">
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                id="profile-image"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              <Button
                size="sm"
                className="rounded-full w-8 h-8 p-0 bg-blue-600"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          {profileImage ? 'Change photo' : 'Add photo (optional)'}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormDescription>
                  Your legal name as it appears on your credentials
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="codename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codename (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Eagle" {...field} />
                  </FormControl>
                  <FormDescription>
                    A name LARK will use to address you
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="badgeNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Badge Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your official badge or ID number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              Save Profile
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileSetupStep;
