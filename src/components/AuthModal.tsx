import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, ShoppingBag, Loader2, Phone, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { checkEmailExists, checkPhoneExists, getEmailByPhone } from '@/lib/store';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup' | 'forgot';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
}

const isEmailFormat = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhoneFormat = (v: string) => /^[0-9]{10}$/.test(v.replace(/\D/g, ''));

export function AuthModal({ open, onClose, initialMode = 'login' }: AuthModalProps) {
  const { signInWithPhoneOrEmail, signUp, resetPassword } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [infoMessage, setInfoMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpHash, setOtpHash] = useState('');

  if (!open) return null;

  const reset = () => {
    setIdentifier('');
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setOtp('');
    setNewPassword('');
    setErrors({});
    setInfoMessage('');
    setShowPassword(false);
    setOtpSent(false);
    setOtpVerified(false);
    setOtpHash('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
    setInfoMessage('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpHash('');
  };

  const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

  const sendOtpEmail = async (targetEmail: string, code: string) => {
    if (!supabase) throw new Error('Authentication service is not configured. Please contact support.');
    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: { shouldCreateUser: false, data: { otp_code: code } },
    });
    if (error) throw error;
  };

  const validateLogin = (): boolean => {
    const e: Record<string, string> = {};
    if (!identifier.trim()) e.identifier = 'Email or mobile number is required';
    else if (!isEmailFormat(identifier.trim()) && !isPhoneFormat(identifier.trim()))
      e.identifier = 'Enter a valid email or 10-digit mobile number';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSignup = (): boolean => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!isEmailFormat(email.trim())) e.email = 'Enter a valid email';
    if (!phone.trim()) e.phone = 'Mobile number is required';
    else if (!isPhoneFormat(phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateForgot = (): boolean => {
    const e: Record<string, string> = {};
    if (!identifier.trim()) e.identifier = 'Email or mobile number is required';
    else if (!isEmailFormat(identifier.trim()) && !isPhoneFormat(identifier.trim()))
      e.identifier = 'Enter a valid email or 10-digit mobile number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---- LOGIN ----
  const handleLogin = async () => {
    if (!validateLogin()) return;
    setLoading(true);
    setErrors({});
    try {
      await signInWithPhoneOrEmail(identifier.trim(), password);
      toast('Welcome back!', 'success');
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (msg.includes('not registered')) {
        setErrors({ identifier: 'This account is not registered.' });
      } else if (msg.toLowerCase().includes('invalid')) {
        setErrors({ password: 'Invalid password. Please try again.' });
      } else {
        toast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // ---- SIGNUP: send OTP ----
  const handleSignupSendOtp = async () => {
    if (!validateSignup()) return;
    setLoading(true);
    setErrors({});
    setInfoMessage('');
    try {
      const emailExists = await checkEmailExists(email.trim());
      if (emailExists) {
        setErrors({ email: 'This email is already registered. Please login instead.' });
        setLoading(false);
        return;
      }
      const phoneExists = await checkPhoneExists(phone.trim());
      if (phoneExists) {
        setErrors({ phone: 'This mobile number is already registered. Please login instead.' });
        setLoading(false);
        return;
      }
      const code = generateOtp();
      setOtpHash(code);
      await sendOtpEmail(email.trim(), code);
      setOtpSent(true);
      setInfoMessage(`A 6-digit OTP has been sent to ${email.trim()}. Enter it below to verify.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      console.error('OTP send error:', err);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---- SIGNUP: verify OTP and create account ----
  const handleSignupVerifyAndCreate = async () => {
    if (!otp.trim()) {
      setErrors({ otp: 'Enter the 6-digit OTP' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      if (otp.trim() !== otpHash) {
        setErrors({ otp: 'Invalid OTP. Please check and try again.' });
        setLoading(false);
        return;
      }
      const { needsVerification } = await signUp(email.trim(), password, fullName.trim(), phone.trim());
      if (needsVerification) {
        setInfoMessage('Account created! Please check your email to verify your account, then login.');
        setMode('login');
        reset();
      } else {
        toast('Account created successfully!', 'success');
        handleClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      if (msg.toLowerCase().includes('already registered')) {
        setErrors({ email: 'This email is already registered. Please login instead.' });
      } else {
        toast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // ---- FORGOT: send OTP ----
  const handleForgotSendOtp = async () => {
    if (!validateForgot()) return;
    setLoading(true);
    setErrors({});
    setInfoMessage('');
    try {
      const trimmed = identifier.trim();
      let targetEmail = trimmed;
      if (!isEmailFormat(trimmed)) {
        const emailFound = await getEmailByPhone(trimmed);
        if (!emailFound) {
          setErrors({ identifier: 'This email/mobile number is not registered.' });
          setLoading(false);
          return;
        }
        targetEmail = emailFound;
      } else {
        const exists = await checkEmailExists(trimmed);
        if (!exists) {
          setErrors({ identifier: 'This email/mobile number is not registered.' });
          setLoading(false);
          return;
        }
      }
      const code = generateOtp();
      setOtpHash(code);
      await sendOtpEmail(targetEmail, code);
      setOtpSent(true);
      setInfoMessage(`A 6-digit OTP has been sent to ${targetEmail}. Enter it below to reset your password.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      console.error('Forgot password error:', err);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---- FORGOT: verify OTP ----
  const handleForgotVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrors({ otp: 'Enter the 6-digit OTP' });
      return;
    }
    if (otp.trim() !== otpHash) {
      setErrors({ otp: 'Invalid OTP. Please check and try again.' });
      return;
    }
    setOtpVerified(true);
    setErrors({});
    setInfoMessage('OTP verified. Please enter your new password.');
  };

  // ---- FORGOT: update password ----
  const handleForgotUpdatePassword = async () => {
    if (!newPassword) {
      setErrors({ newPassword: 'New password is required' });
      return;
    }
    if (newPassword.length < 6) {
      setErrors({ newPassword: 'Minimum 6 characters' });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const trimmed = identifier.trim();
      let targetEmail = trimmed;
      if (!isEmailFormat(trimmed)) {
        const emailFound = await getEmailByPhone(trimmed);
        if (!emailFound) {
          setErrors({ identifier: 'This email/mobile number is not registered.' });
          setLoading(false);
          return;
        }
        targetEmail = emailFound;
      }
      await resetPassword(targetEmail);
      setInfoMessage('Password reset link sent! Check your email and click the link to set your new password.');
      setOtpVerified(false);
      setOtpSent(false);
      setOtpHash('');
      setNewPassword('');
      setOtp('');
      setIdentifier('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      console.error('Password reset error:', err);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (mode === 'login') {
      await handleLogin();
    } else if (mode === 'signup') {
      if (!otpSent) await handleSignupSendOtp();
      else await handleSignupVerifyAndCreate();
    } else if (mode === 'forgot') {
      if (!otpSent) await handleForgotSendOtp();
      else if (!otpVerified) await handleForgotVerifyOtp();
      else await handleForgotUpdatePassword();
    }
  };

  const submitLabel = () => {
    if (loading) return 'Please wait...';
    if (mode === 'login') return 'Sign In';
    if (mode === 'signup') return otpSent ? 'Verify & Create Account' : 'Send OTP';
    if (mode === 'forgot') {
      if (!otpSent) return 'Send OTP';
      if (!otpVerified) return 'Verify OTP';
      return 'Reset Password';
    }
    return 'Submit';
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in" onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-ink-900 px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <ShoppingBag className="h-4 w-4 text-brand-300" />
            </div>
            <span className="font-display text-lg font-semibold text-white">
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </span>
          </div>
          <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-300 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {infoMessage && (
            <div className="mb-4 rounded-lg bg-accent-50 border border-accent-100 px-4 py-3 text-sm text-accent-700 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Signup: full name */}
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-ink-600">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="input-field pl-10"
                    disabled={otpSent}
                  />
                </div>
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
            )}

            {/* Login / Forgot: email or phone */}
            {(mode === 'login' || mode === 'forgot') && (
              <div>
                <label className="text-xs font-medium text-ink-600">Email or Mobile Number</label>
                <div className="relative mt-1">
                  {isEmailFormat(identifier.trim()) || (!identifier.trim() && mode === 'login') ? (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  )}
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com or 9876543210"
                    className="input-field pl-10"
                    disabled={otpSent && mode === 'forgot'}
                  />
                </div>
                {errors.identifier && <p className="mt-1 text-xs text-red-500">{errors.identifier}</p>}
              </div>
            )}

            {/* Signup: email */}
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-ink-600">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field pl-10"
                    disabled={otpSent}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
            )}

            {/* Signup: phone */}
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-ink-600">Mobile Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="input-field pl-10"
                    disabled={otpSent}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
            )}

            {/* Login: password */}
            {mode === 'login' && (
              <div>
                <label className="text-xs font-medium text-ink-600">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
            )}

            {/* Signup: password (before OTP) */}
            {mode === 'signup' && !otpSent && (
              <div>
                <label className="text-xs font-medium text-ink-600">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
            )}

            {/* OTP field (signup after send, forgot after send) */}
            {((mode === 'signup' && otpSent) || (mode === 'forgot' && otpSent && !otpVerified)) && (
              <div>
                <label className="text-xs font-medium text-ink-600">Enter OTP</label>
                <div className="relative mt-1">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="input-field pl-10 tracking-widest"
                  />
                </div>
                {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp}</p>}
              </div>
            )}

            {/* Forgot: new password (after verify) */}
            {mode === 'forgot' && otpVerified && (
              <div>
                <label className="text-xs font-medium text-ink-600">New Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Please wait...</>
              ) : (
                submitLabel()
              )}
            </button>
          </form>

          {/* Mode switch */}
          <div className="mt-5 space-y-2 text-center text-sm">
            {mode === 'login' && (
              <>
                <button onClick={() => switchMode('forgot')} className="text-ink-500 hover:text-ink-900">
                  Forgot password?
                </button>
                <p className="text-ink-500">
                  Don't have an account?{' '}
                  <button onClick={() => switchMode('signup')} className="font-medium text-brand-600 hover:text-brand-700">
                    Sign up
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-ink-500">
                Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="font-medium text-brand-600 hover:text-brand-700">
                  Sign in
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button onClick={() => switchMode('login')} className="text-ink-500 hover:text-ink-900">
                Back to login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
