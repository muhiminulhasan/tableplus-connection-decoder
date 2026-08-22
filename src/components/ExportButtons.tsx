import { FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { ConnectionRecord } from '@/types/connection';
import { exportJSON } from '@/exporters/json';
import { exportCSV } from '@/exporters/csv';
import { exportXLSX } from '@/exporters/xlsx';

interface ExportButtonsProps {
  connections: ConnectionRecord[];
  allConnections: ConnectionRecord[];
  onExportAll: boolean;
  onToggleExportScope: (all: boolean) => void;
}

export function ExportButtons({
  connections,
  allConnections,
  onExportAll,
  onToggleExportScope,
}: ExportButtonsProps) {
  const data = onExportAll ? allConnections : connections;

  const handleExportJSON = () => {
    if (data.length > 0) exportJSON(data);
  };

  const handleExportCSV = () => {
    if (data.length > 0) exportCSV(data);
  };

  const handleExportXLSX = () => {
    if (data.length > 0) exportXLSX(data);
  };

  const btnBase =
    'flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
        <span>Export:</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onExportAll}
            onChange={(e) => onToggleExportScope(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-600/60 accent-blue-600"
          />
          <span>All connections</span>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleExportJSON} disabled={data.length === 0} className={btnBase}>
          <FileJson className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          JSON
        </button>
        <button onClick={handleExportCSV} disabled={data.length === 0} className={btnBase}>
          <FileText className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          CSV
        </button>
        <button onClick={handleExportXLSX} disabled={data.length === 0} className={btnBase}>
          <FileSpreadsheet className="w-4 h-4 text-green-600 dark:text-green-400" />
          XLSX
        </button>
      </div>
    </div>
  );
}
