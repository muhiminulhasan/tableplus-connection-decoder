import { ShieldCheck } from 'lucide-react';

export function SecurityBanner() {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-emerald-50 dark:bg-emerald-500/5 border-b border-emerald-200 dark:border-emerald-500/10 text-emerald-700 dark:text-emerald-400/90">
      <ShieldCheck className="w-4 h-4 flex-shrink-0 dark:drop-shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
      <span className="font-medium tracking-tight">
        100% client-side. Your data never leaves your browser.
      </span>
    </div>
  );
}
