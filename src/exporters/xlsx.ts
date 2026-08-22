import * as XLSX from 'xlsx';
import { ConnectionRecord } from '@/types/connection';
import { downloadBlob, dateStamp } from '@/utils/download';

function valueToString(value: unknown): string | number | boolean {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function exportXLSX(connections: ConnectionRecord[]): void {
  if (connections.length === 0) return;

  // Collect all unique keys
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const conn of connections) {
    for (const key of Object.keys(conn)) {
      if (!seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    }
  }

  const rows = connections.map((conn) => {
    const row: Record<string, string | number | boolean> = {};
    for (const key of keys) {
      row[key] = valueToString(conn[key]);
    }
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows, { header: keys });

  // Auto-width columns based on content
  const colWidths = keys.map((key) => {
    let maxLen = key.length;
    for (const row of rows) {
      const val = String(row[key] ?? '');
      if (val.length > maxLen) maxLen = val.length;
    }
    return { wch: Math.min(Math.max(maxLen + 2, 8), 50) };
  });
  worksheet['!cols'] = colWidths;

  // Freeze the header row
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Connections');

  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `tableplus-connections-${dateStamp()}.xlsx`);
}
