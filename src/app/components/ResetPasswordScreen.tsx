import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token || !email) {
      setError('Invalid reset link');
      return;
    }

    setIsLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ token, email, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccess(true);
      toast.success('Password updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Error updating password');
      toast.error(err.message || 'Error updating password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold' }}>
            Password updated
          </h1>
          <p className="text-[#717182] mb-6" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            Your password has been reset successfully. You can now sign in.
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
          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            className="bg-[#f3f3f5] border-none h-12"
            autoFocus
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            className="bg-[#f3f3f5] border-none h-12"
          />
          {error && (
            <p className="text-[#d4183d]" style={{ fontSize: '14px' }}>{error}</p>
          )}
          <Button
            type="submit"
            className="w-full bg-[#0B3B2E] text-white hover:bg-[#0B3B2E]/90 h-12 disabled:opacity-50"
            disabled={isLoading}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600' }}
          >
            {isLoading ? 'Updating...' : 'Reset Password'}
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
