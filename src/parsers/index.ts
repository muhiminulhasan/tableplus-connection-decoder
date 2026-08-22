import { parse as parsePlist, parseBinary as parseBinaryPlist } from 'plist';
import { ConnectionRecord } from '@/types/connection';
import { bytesToString } from '@/crypto/utils';

export class ParseError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

function isBinaryPlist(bytes: Uint8Array): boolean {
  // Binary plist magic: "bplist00"
  return bytes.length >= 8 &&
    bytes[0] === 0x62 && bytes[1] === 0x70 &&
    bytes[2] === 0x6c && bytes[3] === 0x69 &&
    bytes[4] === 0x73 && bytes[5] === 0x74 &&
    bytes[6] === 0x30 && bytes[7] === 0x30;
}

function isXmlPlist(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith('<?xml') || trimmed.startsWith('<!DOCTYPE plist') || trimmed.startsWith('<plist');
}

function isJson(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith('[') || trimmed.startsWith('{');
}

function normalizeParsedValue(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.map(normalizeParsedValue);
    }
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = normalizeParsedValue(v);
    }
    return result;
  }
  // plist may return Buffer objects for data types; convert to string
  if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'Buffer' && 'data' in value) {
    return String(value.data);
  }
  return value;
}

function toConnectionArray(parsed: unknown): ConnectionRecord[] {
  const normalized = normalizeParsedValue(parsed);

  if (Array.isArray(normalized)) {
    const records: ConnectionRecord[] = [];

    for (const item of normalized) {
      if (item === null || typeof item !== 'object') continue;
      const candidate = item as Record<string, unknown>;

      // A full TablePlus export stores connections inside group objects.
      if (Array.isArray(candidate.connections)) {
        for (const connection of candidate.connections) {
          if (connection !== null && typeof connection === 'object') {
            const record = connection as ConnectionRecord;
            if (candidate.Name && record.GroupName === undefined) {
              record.GroupName = candidate.Name;
            }
            records.push(record);
          }
        }
      } else {
        records.push(candidate as ConnectionRecord);
      }
    }

    return records;
  }

  if (normalized !== null && typeof normalized === 'object') {
    return [normalized as ConnectionRecord];
  }

  return [];
}

/**
 * Auto-detect the payload format and parse into connection records.
 * Supports binary plist, XML plist, and JSON.
 */
export function parsePayload(decrypted: ArrayBuffer): ConnectionRecord[] {
  const bytes = new Uint8Array(decrypted);

  // Try binary plist first (check magic bytes)
  if (isBinaryPlist(bytes)) {
    try {
      const parsed = parseBinaryPlist(bytes) as unknown;
      const records = toConnectionArray(parsed);
      if (records.length === 0) {
        throw new ParseError('EMPTY', 'The file was decrypted but contains no connections.');
      }
      return records;
    } catch (e) {
      if (e instanceof ParseError) throw e;
      // Binary plist may not parse correctly with text decoder; try with Buffer-like approach
      throw new ParseError(
        'UNRECOGNIZED_FORMAT',
        'Decryption succeeded but the binary plist data could not be parsed. The file may be from an unsupported TablePlus version.'
      );
    }
  }

  // Try text-based formats
  const text = bytesToString(decrypted);

  if (isXmlPlist(text)) {
    try {
      const parsed = parsePlist(text) as unknown;
      const records = toConnectionArray(parsed);
      if (records.length === 0) {
        throw new ParseError('EMPTY', 'The file was decrypted but contains no connections.');
      }
      return records;
    } catch {
      throw new ParseError(
        'UNRECOGNIZED_FORMAT',
        'Decryption succeeded but the XML plist data could not be parsed. The file may be from an unsupported TablePlus version.'
      );
    }
  }

  if (isJson(text)) {
    try {
      const parsed = JSON.parse(text);
      const records = toConnectionArray(parsed);
      if (records.length === 0) {
        throw new ParseError('EMPTY', 'The file was decrypted but contains no connections.');
      }
      return records;
    } catch {
      throw new ParseError(
        'UNRECOGNIZED_FORMAT',
        'Decryption succeeded but the JSON data could not be parsed. The file may be from an unsupported TablePlus version.'
      );
    }
  }

  throw new ParseError(
    'UNRECOGNIZED_FORMAT',
    'Decryption succeeded but the data format is unrecognized. The file may be from an unsupported TablePlus version.'
  );
}
