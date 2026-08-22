export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoke on a slight delay to ensure download has started
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function dateStamp(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}
