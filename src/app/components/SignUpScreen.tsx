import { useState } from 'react';
import { Mail, Lock, Linkedin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { FormData } from '../App';
import { authAPI } from '../../utils/api';

interface SignUpScreenProps {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  nextScreen: () => void;
  onShowSignIn?: () => void;
}

export default function SignUpScreen({ formData, updateFormData, nextScreen, onShowSignIn }: SignUpScreenProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get user type friendly name
  const userTypeName = formData.userType === 'organizer' ? 'Event Organizer' : 'Speaker';
  const userTypeDescription = formData.userType === 'organizer' 
    ? 'Create your organizer profile and start finding speakers'
    : 'Create your speaker profile and get discovered by organizers';

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 1 uppercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 1 number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.terms = 'You must accept the Terms and Conditions';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Create account via backend
      setIsLoading(true);
      try {
        // Determine user name based on type (will be filled in later screens)
        const name = formData.userType === 'organizer' ? 'Organizer' : 'Speaker';
        
        const response = await authAPI.signUp(
          formData.email,
          formData.password,
          name,
          formData.userType as 'organizer' | 'speaker'
        );

        // Sign in automatically after signup
        const signInData = await authAPI.signIn(formData.email, formData.password);
        
        console.log('User created and signed in successfully:', signInData);
        nextScreen();
      } catch (error: any) {
        console.error('Signup error:', error);
        setErrors({ ...newErrors, email: error.message || 'Failed to create account' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'linkedin_oidc') => {
    if (!formData.acceptTerms) {
      setErrors({ terms: 'You must accept the Terms and Conditions' });
      return;
    }

    try {
      await authAPI.signInWithOAuth(provider);
      // Supabase will redirect to the OAuth provider
      // After successful auth, user will be redirected back to the app
    } catch (error: any) {
      console.error('OAuth sign up error:', error);
      setErrors({ ...errors, email: error.message || 'Failed to sign up with OAuth' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
            Create Your {userTypeName} Profile
          </h1>
          <p className="text-[#717182]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            {userTypeDescription}
          </p>
        </div>

        <div className="space-y-4">
          {/* LinkedIn Button */}
          <Button
            variant="outline"
            className="w-full justify-center gap-3 h-12 border-[#d1d5db]"
            onClick={() => handleOAuthSignup('linkedin_oidc')}
          >
            <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </Button>

          {/* Google Button */}
          <Button
            variant="outline"
            className="w-full justify-center gap-3 h-12 border-[#d1d5db]"
            onClick={() => handleOAuthSignup('google')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          {/* OR divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e9ebef]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[#717182]" style={{ fontSize: '14px' }}>or</span>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => {
                  updateFormData({ email: e.target.value });
                  setErrors({ ...errors, email: '' });
                }}
                className="pl-11 bg-[#f3f3f5] border-none h-12"
              />
            </div>
            {errors.email && (
              <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  updateFormData({ password: e.target.value });
                  setErrors({ ...errors, password: '' });
                }}
                className="pl-11 bg-[#f3f3f5] border-none h-12"
              />
            </div>
            <p className="text-[#717182] mt-1" style={{ fontSize: '12px' }}>
              Min. 8 characters, 1 uppercase, 1 number
            </p>
            {errors.password && (
              <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({ ...errors, confirmPassword: '' });
                }}
                className="pl-11 bg-[#f3f3f5] border-none h-12"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => {
                updateFormData({ acceptTerms: checked as boolean });
                setErrors({ ...errors, terms: '' });
              }}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-[#717182] cursor-pointer" style={{ fontSize: '14px' }}>
              I accept the{' '}
              <a href="#" className="text-[#0B3B2E] underline">Terms and Conditions</a>
              {' '}and{' '}
              <a href="#" className="text-[#0B3B2E] underline">Privacy Policy</a>
            </label>
          </div>
          {errors.terms && (
            <p className="text-[#d4183d]" style={{ fontSize: '14px' }}>{errors.terms}</p>
          )}

          {/* Create Account Button */}
          <Button
            className="w-full bg-[#0B3B2E] text-white hover:bg-[#0B3B2E]/90 h-12 disabled:opacity-50"
            onClick={handleContinue}
            disabled={isLoading}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Sign in link */}
          <p className="text-center text-[#717182]" style={{ fontSize: '14px' }}>
            Already have an account?{' '}
            <a
              href="#"
              className="text-[#0B3B2E] underline"
              style={{ fontWeight: '600' }}
              onClick={(e) => {
                e.preventDefault();
                if (onShowSignIn) {
                  onShowSignIn();
                }
              }}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
