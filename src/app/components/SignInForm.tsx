import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Users, Mic, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { authAPI } from '@/api';
import { toast } from 'sonner';

interface SignInFormProps {
  onSignInSuccess?: () => void;
  onNavigateToSignUp?: (userType: 'organizer' | 'speaker') => void;
}

export default function SignInForm({ onSignInSuccess, onNavigateToSignUp }: SignInFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        await authAPI.signIn(email, password);

        // Call the success callback if provided
        if (onSignInSuccess) {
          onSignInSuccess();
        }
      } catch (error: any) {
        console.error('Sign in error:', error);
        const errorMessage = error.message || 'Failed to sign in';
        setErrors({ email: errorMessage });
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'linkedin_oidc') => {
    try {
      await authAPI.signInWithOAuth(provider);
    } catch (error: any) {
      console.error('OAuth sign in error:', error);
      toast.error(error.message || 'Failed to sign in with OAuth');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  const handleSelectUserType = (userType: 'organizer' | 'speaker') => {
    setShowUserTypeModal(false);
    if (onNavigateToSignUp) {
      onNavigateToSignUp(userType);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
            Welcome Back
          </h1>
          <p className="text-[#717182]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            Sign in to your VOXDAI account
          </p>
        </div>

        <div className="space-y-4">
          {/* LinkedIn Button */}
          <Button
            variant="outline"
            className="w-full cursor-pointer justify-center gap-3 h-12 border-[#d1d5db]"
            onClick={() => handleOAuthSignIn('linkedin_oidc')}
          >
            <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </Button>

          {/* Google Button */}
          <Button
            variant="outline"
            className="w-full cursor-pointer justify-center gap-3 h-12 border-[#d1d5db]"
            onClick={() => handleOAuthSignIn('google')}
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
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({ ...errors, email: '' });
                }}
                onKeyPress={handleKeyPress}
                className="pl-11 bg-[#f3f3f5] border-none h-12"
              />
            </div>
            {errors.email && (
              <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" style={{ fontSize: '14px', fontWeight: '600' }}>Password</label>
              <button
                type="button"
                className="text-[#0B3B2E] text-[14px] hover:underline bg-transparent border-none cursor-pointer p-0"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: '' });
                }}
                onKeyPress={handleKeyPress}
                className="pl-11 pr-11 bg-[#f3f3f5] border-none h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182] hover:text-[#0B3B2E] transition-colors bg-transparent border-none cursor-pointer p-0"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{errors.password}</p>
            )}
          </div>

          {/* Sign In Button */}
          <Button
            className="w-full cursor-pointer bg-[#0B3B2E] text-white hover:bg-[#0B3B2E]/90 h-12 disabled:opacity-50"
            onClick={handleSignIn}
            disabled={isLoading}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Sign up link */}
          <p className="text-center text-[#717182]" style={{ fontSize: '14px' }}>
            Don't have an account?{' '}
            <a
              href="#"
              className="text-[#0B3B2E] underline"
              style={{ fontWeight: '600' }}
              onClick={(e) => {
                e.preventDefault();
                setShowUserTypeModal(true);
              }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* User Type Selection Modal */}
      <Dialog open={showUserTypeModal} onOpenChange={setShowUserTypeModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
              Create Your Account
            </DialogTitle>
            <DialogDescription className="text-center text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
              Choose your account type to get started
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {/* Event Organizer Option */}
            <button
              onClick={() => handleSelectUserType('organizer')}
              className="w-full p-6 border-2 border-[#e9ebef] rounded-2xl hover:border-[#0B3B2E] hover:bg-[#0B3B2E]/5 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#0B3B2E] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl mb-2"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
                  >
                    I'm an Event Organizer
                  </h3>
                  <p
                    className="text-[#717182] text-sm"
                    style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
                  >
                    Find and book professional speakers for your events, conferences, and podcasts
                  </p>
                </div>
              </div>
            </button>

            {/* Speaker Option */}
            <button
              onClick={() => handleSelectUserType('speaker')}
              className="w-full p-6 border-2 border-[#e9ebef] rounded-2xl hover:border-[#0B3B2E] hover:bg-[#0B3B2E]/5 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#0B3B2E] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mic className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl mb-2"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}
                  >
                    I'm a Speaker
                  </h3>
                  <p
                    className="text-[#717182] text-sm"
                    style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}
                  >
                    Get discovered by event organizers and showcase your expertise to wider audiences
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Cancel button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => setShowUserTypeModal(false)}
              className="text-[#717182] hover:text-[#0B3B2E]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
