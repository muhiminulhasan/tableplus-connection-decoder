const SENSITIVE_FIELDS = new Set([
  'DatabasePassword',
  'Password',
  'SSHPassword',
  'SSHPassphrase',
  'ServerPassword',
  'PrivateKeyPass',
  'TlsKeyPassword',
  'password',
]);

export function isSensitiveField(key: string): boolean {
  return SENSITIVE_FIELDS.has(key);
}

export const MASKED_VALUE = '••••••••';
