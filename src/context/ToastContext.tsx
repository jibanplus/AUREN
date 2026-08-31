import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, X, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-accent-500" />,
    error: <X className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-ink-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-brand-500" />,
  };

  const borders = {
    success: 'border-accent-200',
    error: 'border-red-200',
    info: 'border-ink-200',
    warning: 'border-brand-200',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-xl border ${borders[t.type]} bg-white px-4 py-3 shadow-lg animate-slide-up max-w-sm`}
          >
            {icons[t.type]}
            <span className="text-sm font-medium text-ink-800">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="ml-auto text-ink-400 hover:text-ink-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
