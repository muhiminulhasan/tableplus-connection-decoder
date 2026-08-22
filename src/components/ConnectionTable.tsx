import { useMemo, useState, useCallback } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef as TanstackColumnDef,
  type SortingState,
  type Column as TanstackColumn,
} from '@tanstack/react-table';
import { ArrowUp, ArrowDown, Eye, EyeOff, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConnectionRecord, ColumnDef } from '@/types/connection';
import { getFieldDisplayName } from '@/utils/fieldMapping';
import { isSensitiveField, MASKED_VALUE } from '@/utils/sensitiveFields';

interface ConnectionTableProps {
  connections: ConnectionRecord[];
  columns: ColumnDef[];
  search: string;
  onCopy: (message: string) => void;
}

function valueToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function ConnectionTable({ connections, columns, search, onCopy }: ConnectionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());

  const visibleColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);

  const tableColumns = useMemo<TanstackColumnDef<ConnectionRecord>[]>(() => {
    return visibleColumns.map((col) => ({
      id: col.key,
      // Read the literal connection key instead of treating dots as nested paths.
      accessorFn: (row) => row[col.key],
      header: () => col.displayName,
      cell: ({ row }) => {
        const rawValue = row.original[col.key];
        const strValue = valueToString(rawValue);
        const rowIndex = row.index;
        const cellKey = `${rowIndex}-${col.key}`;

        if (col.sensitive) {
          const isRevealed = revealedCells.has(cellKey);
          if (!strValue) return <span className="text-slate-400 dark:text-slate-600">-</span>;
          return (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {isRevealed ? strValue : MASKED_VALUE}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealedCells((prev) => {
                    const next = new Set(prev);
                    if (next.has(cellKey)) next.delete(cellKey);
                    else next.add(cellKey);
                    return next;
                  });
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label={isRevealed ? 'Hide value' : 'Reveal value'}
              >
                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        }

        if (!strValue) {
          return <span className="text-slate-400 dark:text-slate-600">-</span>;
        }

        return (
          <span
            className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(strValue).then(() => onCopy('Copied to clipboard'));
            }}
            title="Click to copy"
          >
            {strValue}
          </span>
        );
      },
    }));
  }, [visibleColumns, revealedCells, onCopy]);

  const globalFilterFn = useCallback(
    (row: { original: ConnectionRecord }, columnId: string, filterValue: string) => {
      const search = filterValue.toLowerCase();
      // Search across ALL fields (including hidden), not just the current column
      const connection = row.original;
      for (const value of Object.values(connection)) {
        const str = valueToString(value).toLowerCase();
        if (str.includes(search)) return true;
      }
      return false;
    },
    []
  );

  const table = useReactTable({
    data: connections,
    columns: tableColumns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: globalFilterFn,
    enableGlobalFilter: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const sortedRows = table.getRowModel().rows;
  const pageCount = table.getPageCount();

  const renderSortIcon = (column: TanstackColumn<ConnectionRecord>) => {
    if (!column.getCanSort()) return null;
    const sorted = column.getIsSorted();
    if (sorted === 'asc') return <ArrowUp className="w-3.5 h-3.5" />;
    if (sorted === 'desc') return <ArrowDown className="w-3.5 h-3.5" />;
    return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
  };

  if (sortedRows.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 dark:text-slate-400">
        <p className="text-lg font-medium dark:text-slate-300">No connections found</p>
        <p className="text-sm mt-1 dark:text-slate-500">Try adjusting your search.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] overflow-hidden">
      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={`
                    px-4 py-3.5 text-left font-semibold text-slate-700 dark:text-slate-300
                    bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/50
                    cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors
                    whitespace-nowrap
                    ${idx === 0 ? 'sticky left-0 z-10 bg-slate-50 dark:bg-slate-800/60' : ''}
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {renderSortIcon(header.column)}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {sortedRows.map((row, rowIdx) => (
            <tr
              key={row.id}
              className={`
                transition-colors
                ${rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-900/40' : 'bg-slate-50/50 dark:bg-slate-800/20'}
                hover:bg-blue-50 dark:hover:bg-blue-500/5
              `}
            >
              {row.getVisibleCells().map((cell, idx) => (
                <td
                  key={cell.id}
                  className={`
                    px-4 py-3 text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50
                    whitespace-nowrap max-w-xs truncate
                    ${idx === 0 ? 'sticky left-0 z-10 font-medium text-slate-800 dark:text-slate-200' : ''}
                    ${idx === 0 && rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-900/40' : ''}
                    ${idx === 0 && rowIdx % 2 !== 0 ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}
                  `}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50/70 dark:bg-slate-800/30">
        <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          Rows per page
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-700 dark:text-slate-200"
          >
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {table.getState().pagination.pageIndex + 1} of {pageCount}
          </span>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
            className="rounded-md border border-slate-300 dark:border-slate-700 p-1.5 text-slate-600 dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700/50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
            className="rounded-md border border-slate-300 dark:border-slate-700 p-1.5 text-slate-600 dark:text-slate-300 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white dark:hover:bg-slate-700/50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function buildColumnDefs(connections: ConnectionRecord[]): ColumnDef[] {
  const keys: string[] = [];
  const seen = new Set<string>();

  // First pass: collect all keys in first-seen order
  for (const conn of connections) {
    for (const key of Object.keys(conn)) {
      if (!seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    }
  }

  // Default visible columns
  const DEFAULT_VISIBLE = new Set([
    'ConnectionName',
    'Driver',
    'DatabaseHost',
    'DatabasePort',
    'DatabaseName',
    'DatabaseUser',
    'DatabasePassword',
    'GroupName',
  ]);

  return keys.map((key) => ({
    key,
    displayName: getFieldDisplayName(key),
    sensitive: isSensitiveField(key),
    visible: DEFAULT_VISIBLE.has(key),
  }));
}
