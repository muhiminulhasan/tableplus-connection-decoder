import { useEffect, useRef } from 'react';
import { Columns3, Check } from 'lucide-react';
import { ColumnDef } from '@/types/connection';

interface ColumnToggleProps {
  columns: ColumnDef[];
  onToggle: (key: string) => void;
  onToggleAll: (visible: boolean) => void;
}

export function ColumnToggle({ columns, onToggle, onToggleAll }: ColumnToggleProps) {
  const open = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        dropdownRef.current.removeAttribute('data-open');
        open.current = false;
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    open.current = !open.current;
    const el = dropdownRef.current;
    if (el) {
      if (open.current) el.setAttribute('data-open', 'true');
      else el.removeAttribute('data-open');
    }
  };

  const visibleCount = columns.filter((c) => c.visible).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all duration-200 text-sm font-medium"
      >
        <Columns3 className="w-4 h-4" />
        <span>Columns</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">({visibleCount})</span>
      </button>

      <div
        className="dropdown-menu absolute top-full right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl dark:shadow-[0_16px_48px_rgba(0,0,0,0.5)] z-30"
        role="menu"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700/40">
          <button
            onClick={() => onToggleAll(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Show all
          </button>
          <button
            onClick={() => onToggleAll(false)}
            className="text-xs text-slate-500 dark:text-slate-500 hover:underline font-medium"
          >
            Hide all
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto p-1.5">
          {columns.map((col) => (
            <button
              key={col.key}
              onClick={() => onToggle(col.key)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors text-sm"
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded border transition-all duration-200 ${
                  col.visible
                    ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500 dark:shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                    : 'border-slate-300 dark:border-slate-600/60'
                }`}
              >
                {col.visible && <Check className="w-3.5 h-3.5" />}
              </span>
              <span className="text-slate-700 dark:text-slate-200 text-left flex-1">
                {col.displayName}
              </span>
              {col.sensitive && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400/80 font-medium uppercase tracking-wider">
                  Sensitive
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
