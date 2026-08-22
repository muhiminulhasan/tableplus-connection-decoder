import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Lock, Loader2, AlertCircle, X } from 'lucide-react';

interface PasswordModalProps {
  fileName: string;
  fileSize: number;
  isDecrypting: boolean;
  error: string | null;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PasswordModal({
  fileName,
  fileSize,
  isDecrypting,
  error,
  onSubmit,
  onCancel,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDecrypting) onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onCancel, isDecrypting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && !isDecrypting) {
      onSubmit(password);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/70 dark:backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDecrypting) onCancel();
      }}
    >
      <div
        className={`w-full max-w-md rounded-2xl bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl shadow-2xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-slate-700/50 dark:ring-1 dark:ring-slate-800/50 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 dark:shadow-[0_0_16px_rgba(59,130,246,0.15)]">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Enter Decryption Password
            </h2>
          </div>
          {!isDecrypting && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 dark:border dark:border-slate-700/30 p-3.5 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-500">File:</span>
              <span className="font-medium text-slate-700 dark:text-slate-200 truncate ml-2 max-w-[250px]">
                {fileName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-500">Size:</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {formatFileSize(fileSize)}
              </span>
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                disabled={isDecrypting}
                className={`w-full px-4 py-3 pr-12 rounded-xl border bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-200 ${
                  error
                    ? 'border-red-400 dark:border-red-500/60 dark:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                    : 'border-slate-300 dark:border-slate-700/50 focus:border-blue-500 dark:focus:border-blue-500/50 dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="mt-2.5 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 dark:drop-shadow-[0_0_4px_rgba(248,113,113,0.4)]" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-500">
            This is the password you set when exporting connections from TablePlus.
          </p>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDecrypting}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password || isDecrypting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-[0_4px_20px_rgba(59,130,246,0.25)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDecrypting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isDecrypting ? 'Decrypting...' : 'Decrypt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
