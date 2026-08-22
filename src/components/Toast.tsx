import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (toast) {
      timerRef.current = setTimeout(() => onDismiss(), 3000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  const styles = {
    success:
      'bg-emerald-600 text-white dark:bg-emerald-500/15 dark:text-emerald-300 dark:backdrop-blur-xl dark:border dark:border-emerald-500/20 dark:shadow-[0_8px_32px_rgba(16,185,129,0.15)]',
    error:
      'bg-red-600 text-white dark:bg-red-500/15 dark:text-red-300 dark:backdrop-blur-xl dark:border dark:border-red-500/20 dark:shadow-[0_8px_32px_rgba(239,68,68,0.15)]',
    info:
      'bg-slate-800 text-white dark:bg-slate-700/40 dark:text-slate-200 dark:backdrop-blur-xl dark:border dark:border-slate-600/30 dark:shadow-[0_8px_32px_rgba(15,23,42,0.4)]',
  };

  const iconColors = {
    success: 'dark:drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]',
    error: 'dark:drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]',
    info: '',
  };

  const icons = {
    success: <CheckCircle2 className={`w-5 h-5 ${iconColors.success}`} />,
    error: <AlertCircle className={`w-5 h-5 ${iconColors.error}`} />,
    info: <CheckCircle2 className="w-5 h-5" />,
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${styles[toast.type]}`}>
        {icons[toast.type]}
        <span className="text-sm font-medium">{toast.message}</span>
        <button onClick={onDismiss} className="opacity-70 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    setToast({ id: Date.now(), message, type });
  };
  const dismissToast = () => setToast(null);
  return { toast, showToast, dismissToast };
}
