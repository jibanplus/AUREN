import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, Mail, Lock, ArrowLeft, ShoppingBag } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EmailVerificationProps {
  onBack: () => void;
}

export function EmailVerification({ onBack }: EmailVerificationProps) {
  const [status, setStatus] = useState<'loading' | 'verified' | 'error' | 'reset' | 'reset-success'>('loading');
  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const handleVerification = async () => {
      if (!supabase) {
        setStatus('error');
        setMessage('Authentication is not configured.');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const type = params.get('type');
      const hash = window.location.hash;

      if (type === 'reset' || hash.includes('type=recovery')) {
        setStatus('reset');
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        const code = params.get('code') || params.get('token') || params.get('token_hash');
        if (code) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: code,
            type: 'signup',
          });
          if (verifyError) {
            const { error: e2 } = await supabase.auth.verifyOtp({
              token_hash: code,
              type: 'recovery',
            });
            if (e2) {
              setStatus('error');
              setMessage(verifyError.message || 'Verification failed. The link may be invalid or expired.');
              return;
            }
          }
          setStatus('verified');
          setMessage('Your email has been verified successfully! You can now sign in to your account.');
          return;
        }
        setStatus('error');
        setMessage('No verification token found. Please use the link from your email.');
        return;
      }

      if (data.session) {
        setStatus('verified');
        setMessage('Your email has been verified successfully! You are now signed in.');
      }
    };

    handleVerification();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setUpdating(true);
    try {
      if (!supabase) throw new Error('Not configured');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setStatus('reset-success');
      setMessage('Your password has been updated successfully! You can now sign in with your new password.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl border border-ink-100 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900">
              <ShoppingBag className="h-5 w-5 text-brand-300" />
            </div>
            <span className="font-display text-2xl font-semibold text-ink-900">
              AUREN
            </span>
          </div>

          {status === 'loading' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-ink-400 mb-4" />
              <p className="text-sm text-ink-500">Verifying your email...</p>
            </div>
          )}

          {status === 'verified' && (
            <div className="flex flex-col items-center py-4 animate-fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 mb-4">
                <CheckCircle2 className="h-10 w-10 text-accent-500" />
              </div>
              <h2 className="font-display text-xl font-semibold text-ink-900 mb-2">Email Verified!</h2>
              <p className="text-sm text-ink-500 max-w-xs">{message}</p>
              <button onClick={onBack} className="btn-primary mt-6 w-full max-w-xs">
                Continue to Store
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center py-4 animate-fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 mb-4">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="font-display text-xl font-semibold text-ink-900 mb-2">Verification Failed</h2>
              <p className="text-sm text-ink-500 max-w-xs">{message}</p>
              <button onClick={onBack} className="btn-primary mt-6 w-full max-w-xs">
                Back to Store
              </button>
            </div>
          )}

          {status === 'reset' && (
            <div className="text-left animate-fade-in">
              <div className="flex flex-col items-center mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 mb-3">
                  <Lock className="h-7 w-7 text-brand-300" />
                </div>
                <h2 className="font-display text-xl font-semibold text-ink-900">Set New Password</h2>
                <p className="text-sm text-ink-500 mt-1 text-center">Enter your new password below</p>
              </div>
              {message && <p className="text-xs text-red-500 mb-3 text-center">{message}</p>}
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-ink-600">New Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-600">Confirm Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <button type="submit" disabled={updating} className="btn-primary w-full">
                  {updating ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</> : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {status === 'reset-success' && (
            <div className="flex flex-col items-center py-4 animate-fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 mb-4">
                <CheckCircle2 className="h-10 w-10 text-accent-500" />
              </div>
              <h2 className="font-display text-xl font-semibold text-ink-900 mb-2">Password Updated!</h2>
              <p className="text-sm text-ink-500 max-w-xs">{message}</p>
              <button onClick={onBack} className="btn-primary mt-6 w-full max-w-xs">
                Back to Store
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 mx-auto mt-4 text-sm text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to store
        </button>
      </div>
    </div>
  );
}
