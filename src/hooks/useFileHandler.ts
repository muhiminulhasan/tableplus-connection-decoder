import { useCallback, useState, useRef } from 'react';

export interface FileData {
  name: string;
  size: number;
  buffer: ArrayBuffer;
}

export function useFileHandler() {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const VALID_EXTENSIONS = ['.tableplusconnection', '.tpconnection'];

  const isValidFile = useCallback((name: string): boolean => {
    const lower = name.toLowerCase();
    return VALID_EXTENSIONS.some((ext) => lower.endsWith(ext));
  }, []);

  const processFile = useCallback((file: File) => {
    setFileError(null);

    if (!isValidFile(file.name)) {
      setFileError('Please drop a .tableplusconnection file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileData({
        name: file.name,
        size: file.size,
        buffer: reader.result as ArrayBuffer,
      });
    };
    reader.onerror = () => {
      setFileError('Failed to read the file. Please try again.');
    };
    reader.readAsArrayBuffer(file);
  }, [isValidFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset so selecting the same file again still fires
    e.target.value = '';
  }, [processFile]);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);

  const clearFile = useCallback(() => {
    setFileData(null);
    setFileError(null);
  }, []);

  return {
    fileData,
    isDragging,
    fileError,
    inputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileSelect,
    openFileDialog,
    clearFile,
    setFileError,
  };
}
