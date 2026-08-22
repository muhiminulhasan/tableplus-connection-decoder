import { useState, useCallback } from 'react';
import { decryptRNCryptor, RNCryptorError } from '@/crypto/rncryptor';
import { parsePayload, ParseError } from '@/parsers';
import { ConnectionRecord } from '@/types/connection';

export type DecryptionStatus = 'idle' | 'decrypting' | 'success' | 'error';

export interface DecryptionState {
  status: DecryptionStatus;
  error: string;
  connections: ConnectionRecord[];
}

export function useDecryption() {
  const [state, setState] = useState<DecryptionState>({
    status: 'idle',
    error: '',
    connections: [],
  });

  const decrypt = useCallback(async (buffer: ArrayBuffer, password: string): Promise<ConnectionRecord[]> => {
    setState({ status: 'decrypting', error: '', connections: [] });

    try {
      const decrypted = await decryptRNCryptor(buffer, password);
      const connections = parsePayload(decrypted);
      setState({ status: 'success', error: '', connections });
      return connections;
    } catch (e) {
      let message: string;
      if (e instanceof RNCryptorError) {
        message = e.message;
      } else if (e instanceof ParseError) {
        message = e.message;
      } else {
        message = 'An unexpected error occurred during decryption.';
      }
      setState({ status: 'error', error: message, connections: [] });
      throw e;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle', error: '', connections: [] });
  }, []);

  return { state, decrypt, reset };
}
