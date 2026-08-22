import { UploadCloud, FileWarning } from 'lucide-react';

interface DropZoneProps {
  isDragging: boolean;
  error: string | null;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onClick: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}

export function DropZone({
  isDragging,
  error,
  onDrop,
  onDragOver,
  onDragLeave,
  onClick,
  onFileSelect,
  inputRef,
  disabled = false,
}: DropZoneProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={disabled ? undefined : onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) onClick();
        }}
        className={`
          relative flex flex-col items-center justify-center gap-5
          rounded-2xl border-2 border-dashed
          px-8 py-16 text-center cursor-pointer
          transition-all duration-300
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400/60 dark:bg-blue-500/10 scale-[1.02] dark:shadow-[0_0_40px_rgba(59,130,246,0.15)]'
              : 'border-slate-300 dark:border-slate-700/50 hover:border-blue-400 dark:hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/30'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <div
          className={`p-6 rounded-2xl transition-all duration-300 ${
            isDragging
              ? 'bg-blue-100 dark:bg-blue-500/20 dark:shadow-[0_0_24px_rgba(59,130,246,0.2)]'
              : 'bg-slate-100 dark:bg-slate-800/60 dark:shadow-lg dark:shadow-slate-950/50'
          }`}
        >
          <UploadCloud
            className={`w-12 h-12 transition-all duration-300 ${
              isDragging
                ? 'text-blue-600 dark:text-blue-400 dark:drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Drop your .tableplusconnection file here
          </p>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-500">
            or click to browse
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".tableplusconnection,.tpconnection"
        onChange={onFileSelect}
        className="hidden"
      />

      {error && (
        <div className="mt-4 flex items-center gap-2 justify-center text-sm text-red-600 dark:text-red-400">
          <FileWarning className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
