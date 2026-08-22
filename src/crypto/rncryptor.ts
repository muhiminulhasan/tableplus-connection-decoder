import { timingSafeEqual } from './utils';

export class RNCryptorError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'RNCryptorError';
  }
}

/**
 * Decrypt RNCryptor v3 (password-based) encrypted data.
 * Format: version(1) | options(1) | encSalt(8) | hmacSalt(8) | iv(16) | ciphertext | hmac(32)
 */
export async function decryptRNCryptor(
  encryptedData: ArrayBuffer,
  password: string
): Promise<ArrayBuffer> {
  const data = new Uint8Array(encryptedData);

  // Minimum size: 2 header + 8 encSalt + 8 hmacSalt + 16 iv + 32 hmac = 66 bytes
  if (data.length < 66) {
    throw new RNCryptorError('CORRUPTED', 'File is too small to be a valid RNCryptor payload.');
  }

  const version = data[0];
  const options = data[1];

  if (version !== 0x03) {
    throw new RNCryptorError(
      'UNSUPPORTED_VERSION',
      `Unsupported encryption version (v${version}). Only RNCryptor v3 is supported.`
    );
  }
  if (options !== 0x01) {
    throw new RNCryptorError(
      'NOT_PASSWORD_BASED',
      'This file uses key-based encryption. Only password-based encryption is supported.'
    );
  }

  const encSalt = data.slice(2, 10);
  const hmacSalt = data.slice(10, 18);
  const iv = data.slice(18, 34);
  const ciphertext = data.slice(34, data.length - 32);
  const expectedHMAC = data.slice(data.length - 32);

  const passwordBytes = new TextEncoder().encode(password);

  // Derive encryption and HMAC keys via PBKDF2 (SHA-1, 10000 iterations — required by RNCryptor spec)
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    passwordBytes.buffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const encKey = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encSalt.buffer.slice(encSalt.byteOffset, encSalt.byteOffset + encSalt.byteLength), iterations: 10000, hash: 'SHA-1' },
    passwordKey,
    256
  );

  const hmacKey = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: hmacSalt.buffer.slice(hmacSalt.byteOffset, hmacSalt.byteOffset + hmacSalt.byteLength), iterations: 10000, hash: 'SHA-1' },
    passwordKey,
    256
  );

  // Verify HMAC-SHA256 over everything except the trailing 32-byte HMAC
  const hmacCryptoKey = await crypto.subtle.importKey(
    'raw',
    hmacKey,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const hmacData = data.slice(0, data.length - 32);
  const computedHMAC = new Uint8Array(
    await crypto.subtle.sign('HMAC', hmacCryptoKey, hmacData.buffer.slice(hmacData.byteOffset, hmacData.byteOffset + hmacData.byteLength))
  );

  if (!timingSafeEqual(computedHMAC, expectedHMAC)) {
    throw new RNCryptorError('WRONG_PASSWORD', 'Incorrect password. Please try again.');
  }

  // AES-256-CBC decrypt
  const aesKey = await crypto.subtle.importKey(
    'raw',
    encKey,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );

  let decrypted: ArrayBuffer;
  try {
    decrypted = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: iv.buffer.slice(iv.byteOffset, iv.byteOffset + iv.byteLength) },
      aesKey,
      ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength)
    );
  } catch {
    throw new RNCryptorError('CORRUPTED', 'Decryption failed. The file may be corrupted.');
  }

  // Zero out password bytes from memory
  passwordBytes.fill(0);

  return decrypted;
}
