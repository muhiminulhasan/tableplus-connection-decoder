import { ConnectionRecord } from '@/types/connection';
import { downloadBlob, dateStamp } from '@/utils/download';

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // RFC 4180: wrap in quotes if value contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function valueToString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function exportCSV(connections: ConnectionRecord[]): void {
  if (connections.length === 0) return;

  // Collect all unique keys across all connections, preserving first-seen order
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

  const rows: string[] = [];
  rows.push(keys.map(escapeCSVValue).join(','));

  for (const conn of connections) {
    const row = keys.map((key) => escapeCSVValue(valueToString(conn[key])));
    rows.push(row.join(','));
  }

  // UTF-8 BOM for Excel compatibility
  const csv = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `tableplus-connections-${dateStamp()}.csv`);
}
