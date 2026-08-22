import { ConnectionRecord } from '@/types/connection';
import { downloadBlob, dateStamp } from '@/utils/download';

export function exportJSON(connections: ConnectionRecord[]): void {
  const json = JSON.stringify(connections, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `tableplus-connections-${dateStamp()}.json`);
}
