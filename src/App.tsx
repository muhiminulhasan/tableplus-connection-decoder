import { useState, useMemo, useCallback } from 'react';
import { Database, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SecurityBanner } from '@/components/SecurityBanner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DropZone } from '@/components/DropZone';
import { PasswordModal } from '@/components/PasswordModal';
import { ConnectionTable, buildColumnDefs } from '@/components/ConnectionTable';
import { ColumnToggle } from '@/components/ColumnToggle';
import { ExportButtons } from '@/components/ExportButtons';
import { SearchBar } from '@/components/SearchBar';
import { Toast, useToast } from '@/components/Toast';
import { useTheme } from '@/hooks/useTheme';
import { useFileHandler } from '@/hooks/useFileHandler';
import { useDecryption } from '@/hooks/useDecryption';
import { ColumnDef } from '@/types/connection';
import { RNCryptorError } from '@/crypto/rncryptor';
import { ParseError } from '@/parsers';

export default function App() {
  const { theme, toggle } = useTheme();
  const { toast, showToast, dismissToast } = useToast();
  const { fileData, isDragging, fileError, inputRef, handleDrop, handleDragOver, handleDragLeave, handleFileSelect, openFileDialog, clearFile, setFileError } = useFileHandler();
  const { state: decryptionState, decrypt, reset: resetDecryption } = useDecryption();

  const [columns, setColumns] = useState<ColumnDef[]>([]);
  const [search, setSearch] = useState('');
  const [exportAll, setExportAll] = useState(true);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  const connections = decryptionState.connections;

  // Filtered connections for display count
  const filteredCount = useMemo(() => {
    if (!search) return connections.length;
    const lower = search.toLowerCase();
    return connections.filter((conn) =>
      Object.values(conn).some((v) => {
        if (v === null || v === undefined) return false;
        return String(v).toLowerCase().includes(lower);
      })
    ).length;
  }, [connections, search]);

  const handleDecryptSubmit = useCallback(async (password: string) => {
    if (!fileData) return;
    setDecryptError(null);
    try {
      const result = await decrypt(fileData.buffer, password);
      const colDefs = buildColumnDefs(result);
      setColumns(colDefs);
      showToast(`Successfully decrypted ${result.length} connection${result.length !== 1 ? 's' : ''}`, 'success');
    } catch (e) {
      if (e instanceof RNCryptorError || e instanceof ParseError) {
        setDecryptError(e.message);
      } else {
        setDecryptError('An unexpected error occurred during decryption.');
      }
    }
  }, [fileData, decrypt, showToast]);

  const handleCancelPassword = useCallback(() => {
    clearFile();
    setDecryptError(null);
  }, [clearFile]);

  const handleToggleColumn = useCallback((key: string) => {
    setColumns((prev) => prev.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)));
  }, []);

  const handleToggleAllColumns = useCallback((visible: boolean) => {
    setColumns((prev) => prev.map((c) => ({ ...c, visible })));
  }, []);

  const handleLoadAnother = useCallback(() => {
    // Decrypted records are scrubbed inside useDecryption.reset()
    resetDecryption();
    clearFile();
    setColumns([]);
    setSearch('');
    setDecryptError(null);
    setFileError(null);
  }, [resetDecryption, clearFile, setFileError]);

  const showDropZone = !fileData && decryptionState.status !== 'success';
  const showPasswordModal = fileData !== null && decryptionState.status !== 'success';
  const showTable = decryptionState.status === 'success' && connections.length > 0;
  const showEmptyState = decryptionState.status === 'success' && connections.length === 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 dark:text-slate-100 text-slate-900 flex flex-col dark-mesh-bg transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white dark:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                TablePlus Connection Decoder
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-500 hidden sm:block">
                Decrypt and export your TablePlus connections
              </p>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </header>

      <SecurityBanner />

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {showDropZone && (
          <div className="flex flex-col items-center gap-8 py-8 animate-fade-in">
            <div className="text-center max-w-lg">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 tracking-tight">
                Decrypt Your TablePlus Connections
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Upload your encrypted <code className="text-sm bg-slate-100 dark:bg-slate-800/60 dark:border dark:border-slate-700/30 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">.tableplusconnection</code> file,
                enter your password, and export your connections to JSON, CSV, or XLSX.
              </p>
            </div>
            <DropZone
              isDragging={isDragging}
              error={fileError}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFileDialog}
              onFileSelect={handleFileSelect}
              inputRef={inputRef}
            />
          </div>
        )}

        {showPasswordModal && fileData && (
          <PasswordModal
            fileName={fileData.name}
            fileSize={fileData.size}
            isDecrypting={decryptionState.status === 'decrypting'}
            error={decryptError}
            onSubmit={handleDecryptSubmit}
            onCancel={handleCancelPassword}
          />
        )}

        {showEmptyState && (
          <div className="text-center py-20 animate-fade-in">
            <AlertTriangle className="w-12 h-12 text-amber-500 dark:text-amber-400/70 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
              No connections found
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              The file was decrypted but contains no connections.
            </p>
            <button
              onClick={handleLoadAnother}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-500 dark:shadow-[0_4px_20px_rgba(59,130,246,0.25)] transition-all duration-200 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Load Another File
            </button>
          </div>
        )}

        {showTable && (
          <div className="space-y-5 animate-fade-in">
            {/* Success banner */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 dark:border dark:border-emerald-500/15 border border-emerald-200 dark:shadow-[0_0_24px_rgba(16,185,129,0.06)]">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 dark:drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
              <span className="font-medium text-emerald-700 dark:text-emerald-400/90">
                Successfully decrypted {connections.length} connection{connections.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <SearchBar value={search} onChange={setSearch} />
              <div className="flex items-center gap-3">
                <ColumnToggle
                  columns={columns}
                  onToggle={handleToggleColumn}
                  onToggleAll={handleToggleAllColumns}
                />
              </div>
            </div>

            {/* Table */}
            <ConnectionTable
              connections={connections}
              columns={columns}
              search={search}
              onCopy={(msg) => showToast(msg, 'success')}
            />

            {/* Row count */}
            <div className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
              Showing {filteredCount} of {connections.length} connections
            </div>

            {/* Export + Load Another */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/60">
              <ExportButtons
                connections={connections.filter((conn) =>
                  search
                    ? Object.values(conn).some((v) =>
                        v !== null && v !== undefined && String(v).toLowerCase().includes(search.toLowerCase())
                      )
                    : true
                )}
                allConnections={connections}
                onExportAll={exportAll}
                onToggleExportScope={setExportAll}
              />
              <button
                onClick={handleLoadAnother}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700/60 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                Load Another File
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-400 dark:text-slate-600 space-y-1">
          <p>All processing happens locally in your browser. No data is sent to any server.</p>
          <p>
            Built by{' '}
            <a
              href="https://muhiminulhasan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              A. S. M. Muhiminul Hasan
            </a>
          </p>
        </div>
      </footer>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
