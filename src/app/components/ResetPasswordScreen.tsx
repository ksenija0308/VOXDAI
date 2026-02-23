import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '@/lib/supabaseClient.ts';
import { toast } from 'sonner';

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('access_token');

  const validatePassword = (pw: string): string | null => {
    if (pw.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pw)) return 'Password must contain at least 1 uppercase letter';
    if (!/[0-9]/.test(pw)) return 'Password must contain at least 1 number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid or expired reset link');
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser(
        { password },
        { accessToken: token }
      );

      if (updateError) throw updateError;

      setSuccess(true);
      toast.success('Password updated successfully');
    } catch (err: any) {
      console.error('Reset password error:', err);
      const message = err.message || 'Failed to update password';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
              Password updated
            </h1>
            <p className="text-[#717182] mb-6" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Button
              className="w-full bg-[#0B3B2E] text-white hover:bg-[#0B3B2E]/90 h-12"
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
            Set new password
          </h1>
          <p className="text-[#717182]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="pl-11 pr-11 bg-[#f3f3f5] border-none h-12"
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-2" style={{ fontSize: '14px', fontWeight: '600' }}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717182]" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                className="pl-11 pr-11 bg-[#f3f3f5] border-none h-12"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717182]"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error && (
              <p className="text-[#d4183d] mt-1" style={{ fontSize: '14px' }}>{error}</p>
            )}
          </div>

          <p className="text-[#717182]" style={{ fontSize: '12px' }}>
            Password must be at least 8 characters with 1 uppercase letter and 1 number.
          </p>

          <Button
            type="submit"
            className="w-full bg-[#0B3B2E] text-white hover:bg-[#0B3B2E]/90 h-12 disabled:opacity-50"
            disabled={isLoading}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
          >
            {isLoading ? 'Updating...' : 'Reset password'}
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
