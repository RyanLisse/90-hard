import { useState, useCallback } from "react";

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { maxFiles = 6, maxSizeInMB = 5, acceptedFormats = [] } = options;
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      const maxSizeBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File "${file.name}" exceeds the maximum size of ${maxSizeInMB}MB`;
      }

      // Check file format
      if (acceptedFormats.length > 0 && !acceptedFormats.includes(file.type)) {
        return `File "${file.name}" has an unsupported format`;
      }

      return null;
    },
    [maxSizeInMB, acceptedFormats],
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      setError(null);

      // Check if adding these files would exceed the limit
      if (files.length + newFiles.length > maxFiles) {
        setError(`Cannot upload more than ${maxFiles} files`);
        return;
      }

      // Validate each file
      for (const file of newFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      // Create preview URLs and add files
      const uploadedFiles: UploadedFile[] = newFiles.map((file) => {
        const preview = URL.createObjectURL(file);

        return {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          file,
          preview,
        };
      });

      setFiles((prev) => [...prev, ...uploadedFiles]);
    },
    [files.length, maxFiles, validateFile],
  );

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file) {
        // Revoke the preview URL to free up memory
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
    setError(null);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    // Revoke all preview URLs
    files.forEach((file) => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setError(null);
  }, [files]);

  return {
    files,
    error,
    addFiles,
    removeFile,
    resetError,
    reset,
    isMaxFilesReached: files.length >= maxFiles,
  };
}
