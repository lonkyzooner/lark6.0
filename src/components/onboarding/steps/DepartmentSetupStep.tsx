import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Checkbox } from '../../ui/checkbox';
import { Building, MapPin, CheckCircle2, Search } from 'lucide-react';

// Define form schema
const departmentSchema = z.object({
  name: z.string().min(2, { message: 'Department name must be at least 2 characters' }),
  location: z.string().optional(),
  role: z.enum(['officer', 'supervisor', 'admin']),
  state: z.string().optional(),
  isVerified: z.boolean().default(false)
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

// Mock list of states
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

interface DepartmentSetupStepProps {
  onNext: (data: any) => void;
  data: {
    name: string;
    location?: string;
    role: 'officer' | 'supervisor' | 'admin';
    state?: string;
    isVerified?: boolean;
  };
  allData?: any;
}

const DepartmentSetupStep: React.FC<DepartmentSetupStepProps> = ({ onNext, data }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Initialize form with existing data
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: data.name || '',
      location: data.location || '',
      role: data.role || 'officer',
      state: data.state || 'LA',
      isVerified: data.isVerified || false
    }
  });
  
  // Handle form submission
  const onSubmit = (values: DepartmentFormValues) => {
    // Pass data to parent component
    onNext(values);
  };
  
  // Handle department search
  const handleDepartmentSearch = () => {
    setIsSearching(true);
    
    // In a real implementation, this would call your API to search for departments
    // For now, we'll just simulate a search with mock data
    setTimeout(() => {
      const mockResults = [
        { id: 1, name: 'Baton Rouge Police Department', location: 'Baton Rouge, LA' },
        { id: 2, name: 'East Baton Rouge Sheriff\'s Office', location: 'Baton Rouge, LA' },
        { id: 3, name: 'Louisiana State Police - Troop A', location: 'Baton Rouge, LA' }
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };
  
  // Handle department selection from search results
  const handleSelectDepartment = (department: any) => {
    form.setValue('name', department.name);
    form.setValue('location', department.location);
    form.setValue('isVerified', true);
    setSearchResults([]);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Connect with your department to access department-specific features and resources.
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full mt-0.5">
            <Search className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Find Your Department</h3>
            <p className="text-sm text-blue-700 mb-3">
              Search for your department to automatically fill in details and verify your affiliation.
            </p>
            
            <div className="flex gap-2">
              <Input 
                placeholder="Search department name..." 
                className="max-w-md"
                value={form.watch('name')}
                onChange={(e) => form.setValue('name', e.target.value)}
              />
              <Button 
                variant="secondary" 
                onClick={handleDepartmentSearch}
                disabled={isSearching || !form.watch('name')}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-3 border border-blue-200 rounded-md bg-white max-h-48 overflow-y-auto">
                <ul className="divide-y divide-blue-100">
                  {searchResults.map((dept) => (
                    <li 
                      key={dept.id} 
                      className="p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectDepartment(dept)}
                    >
                      <div className="font-medium">{dept.name}</div>
                      <div className="text-sm text-gray-500">{dept.location}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department Name</FormLabel>
                <FormControl>
                  <Input placeholder="Baton Rouge Police Department" {...field} />
                </FormControl>
                <FormDescription>
                  The full official name of your department
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Baton Rouge, LA" {...field} />
                  </FormControl>
                  <FormDescription>
                    City and state of your department
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    State where your department is located
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Your Role</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="officer" id="role-officer" />
                      <label htmlFor="role-officer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Officer
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="supervisor" id="role-supervisor" />
                      <label htmlFor="role-supervisor" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Supervisor
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="role-admin" />
                      <label htmlFor="role-admin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Administrator
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  Your position within the department
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isVerified"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Verify Department Information
                  </FormLabel>
                  <FormDescription>
                    I confirm that the department information provided is accurate and I am authorized to use LARK in connection with this department.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              Save Department Info
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DepartmentSetupStep;
