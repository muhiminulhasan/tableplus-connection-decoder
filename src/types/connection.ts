export interface ConnectionRecord {
  [key: string]: unknown;
}

export interface DecryptionResult {
  connections: ConnectionRecord[];
  fileName: string;
  fileSize: number;
}

export type SortDirection = 'asc' | 'desc';

export interface ColumnDef {
  key: string;
  displayName: string;
  sensitive: boolean;
  visible: boolean;
}
