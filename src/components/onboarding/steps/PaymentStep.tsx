import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Checkbox } from '../../ui/checkbox';
import { CreditCard, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';

// Define form schema
const paymentSchema = z.object({
  cardName: z.string().min(2, { message: 'Name on card is required' }),
  cardNumber: z.string()
    .min(13, { message: 'Card number must be at least 13 digits' })
    .max(19, { message: 'Card number must be at most 19 digits' })
    .regex(/^\d+$/, { message: 'Card number must contain only digits' }),
  expiryMonth: z.string().min(1, { message: 'Expiry month is required' }),
  expiryYear: z.string().min(1, { message: 'Expiry year is required' }),
  cvv: z.string()
    .min(3, { message: 'CVV must be at least 3 digits' })
    .max(4, { message: 'CVV must be at most 4 digits' })
    .regex(/^\d+$/, { message: 'CVV must contain only digits' }),
  saveCard: z.boolean().default(false),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentStepProps {
  onNext: (data: any) => void;
  data: {
    completed?: boolean;
  };
  allData?: any;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ onNext, data, allData }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Get selected plan from previous step
  const selectedPlanId = allData?.subscription?.plan || 'basic';
  
  // Find plan details
  const selectedPlan = {
    id: selectedPlanId,
    name: selectedPlanId === 'basic' ? 'Basic' : 
          selectedPlanId === 'standard' ? 'Standard' : 
          selectedPlanId === 'premium' ? 'Premium' : 'Enterprise',
    price: selectedPlanId === 'basic' ? 9.99 : 
           selectedPlanId === 'standard' ? 19.99 : 
           selectedPlanId === 'premium' ? 29.99 : 'Custom'
  };
  
  // Initialize form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      saveCard: true,
      agreeToTerms: false
    }
  });
  
  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      value: month.toString().padStart(2, '0'),
      label: month.toString().padStart(2, '0')
    };
  });
  
  // Generate year options (current year + 20 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => {
    const year = currentYear + i;
    return {
      value: year.toString(),
      label: year.toString()
    };
  });
  
  // Handle form submission
  const onSubmit = async (values: PaymentFormValues) => {
    try {
      setIsProcessing(true);
      setPaymentError(null);
      
      // In a real implementation, this would call your payment processor API (Stripe)
      // For now, we'll just simulate a successful payment
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      setPaymentSuccess(true);
      
      // Pass data to parent component
      onNext({ 
        completed: true,
        cardLast4: values.cardNumber.slice(-4)
      });
    } catch (error: any) {
      console.error('Payment processing error:', error);
      setPaymentError(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-gray-600">
          Set up your payment method to complete your subscription.
        </p>
      </div>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-800 mb-2">Order Summary</h3>
        <div className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="text-gray-600">{selectedPlan.name} Plan</span>
          <span className="font-medium">
            {typeof selectedPlan.price === 'number' ? `$${selectedPlan.price.toFixed(2)}` : selectedPlan.price}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Billed</span>
          <span className="text-gray-600">Monthly</span>
        </div>
        <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2">
          <span className="font-medium">Total</span>
          <span className="font-bold text-lg">
            {typeof selectedPlan.price === 'number' ? `$${selectedPlan.price.toFixed(2)}/month` : 'Contact Sales'}
          </span>
        </div>
      </div>
      
      {paymentError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}
      
      {paymentSuccess ? (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Payment Successful</AlertTitle>
          <AlertDescription className="text-green-700">
            Your payment has been processed successfully. Your subscription is now active.
          </AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-gray-800">Payment Details</h3>
            </div>
            
            <FormField
              control={form.control}
              name="cardName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name on Card</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="4242 4242 4242 4242" 
                      {...field} 
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                      maxLength={19}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="expiryMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Month</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expiryYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Year</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="YYYY" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123" 
                        {...field} 
                        maxLength={4}
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="saveCard"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Save card for future payments
                    </FormLabel>
                    <FormDescription>
                      Your payment information will be stored securely for future billing.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the Terms of Service and Privacy Policy
                    </FormLabel>
                    <FormDescription>
                      By checking this box, you agree to our{' '}
                      <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
                      <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
              <Lock className="h-4 w-4" />
              <span>Your payment information is encrypted and secure.</span>
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Payment
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default PaymentStep;
