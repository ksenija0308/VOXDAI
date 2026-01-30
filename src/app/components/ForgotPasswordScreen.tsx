import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { authAPI } from '../../utils/api';
import { toast } from 'sonner';

export default function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPasswordForEmail(email);
      setSubmitted(true);
      toast.success('Check your email for the reset link');
    } catch (err: any) {
      console.error('Reset password error:', err);
      const message = err.message || 'Failed to send reset email';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
              Check your email
            </h1>
            <p className="text-[#717182] mb-6" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
              We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
            </p>
            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => navigate('/login')}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
            Forgot password?
          </h1>
          <p className="text-[#717182]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="pl-11 bg-[#f3f3f5] border-none h-12"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0B3B2E] text-white hover:bg-[#0B3B2E]/90 h-12 disabled:opacity-50"
            disabled={isLoading}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
          >
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              className="text-[#0B3B2E] text-[14px] hover:underline font-medium"
              onClick={() => navigate('/login')}
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
