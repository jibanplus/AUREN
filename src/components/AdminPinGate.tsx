import { useState } from 'react';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';

const ADMIN_PIN = '523352';

interface AdminPinGateProps {
  onSuccess: () => void;
  onExit: () => void;
}

export function AdminPinGate({ onSuccess, onExit }: AdminPinGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (pin === ADMIN_PIN) {
        onSuccess();
      } else {
        setError('Incorrect PIN. Please try again.');
        setLoading(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </button>
        <div className="rounded-2xl bg-white shadow-xl border border-ink-100 p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 mb-4">
              <Lock className="h-7 w-7 text-brand-300" />
            </div>
            <h1 className="font-display text-xl font-semibold text-ink-900">Admin Access</h1>
            <p className="text-sm text-ink-500 mt-1">Enter your PIN to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="Enter PIN"
                maxLength={6}
                autoFocus
                className="input-field text-center tracking-[0.5em] text-lg font-semibold"
              />
              {error && <p className="mt-2 text-xs text-red-500 text-center">{error}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : 'Unlock'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
