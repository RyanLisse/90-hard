import React, { useEffect, useRef, useState } from "react";
import { View, Text, cn } from "../styled";
import { Upload, X, AlertCircle, Loader2 } from "lucide-react";
import { useFileUpload, type UploadedFile } from "./useFileUpload";

export interface PhotoUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  onRemove?: (fileId: string) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  className?: string;
  isLoading?: boolean;
}

export function PhotoUpload({
  onUpload,
  onRemove,
  onError,
  maxFiles = 6,
  maxSizeInMB = 5,
  acceptedFormats = [
    "image/svg+xml",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
  ],
  className,
  isLoading = false,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const { files, error, addFiles, removeFile, isMaxFilesReached } =
    useFileUpload({
      maxFiles,
      maxSizeInMB,
      acceptedFormats,
    });

  // Notify parent when files change
  useEffect(() => {
    if (files.length > 0) {
      onUpload(files);
    }
  }, [files, onUpload]);

  // Notify parent when error occurs
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      addFiles(Array.from(selectedFiles));
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles) {
      addFiles(Array.from(droppedFiles));
    }
  };

  const handleRemoveFile = (fileId: string) => {
    removeFile(fileId);
    if (onRemove) {
      onRemove(fileId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isDisabled = isLoading || isMaxFilesReached;

  return (
    <View testID="photo-upload-container" className={cn("w-full", className)}>
      {/* Drop Zone */}
      <View
        testID="drop-zone"
        className={cn(
          "relative rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-700",
          isDisabled && "cursor-not-allowed opacity-50",
          !isDisabled && "cursor-pointer",
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isDisabled && fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Upload photos"
      >
        <input
          ref={fileInputRef}
          testID="file-input"
          type="file"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleFileSelect}
          disabled={isDisabled}
          className="hidden"
        />

        {isLoading ? (
          <View className="flex flex-col items-center justify-center space-y-4">
            <Loader2
              testID="loading-spinner"
              className="h-10 w-10 animate-spin text-primary"
            />
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Uploading...
            </Text>
          </View>
        ) : (
          <>
            <Upload className="mx-auto mb-4 h-10 w-10 text-gray-400" />
            <Text className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Drag and drop your image here, or{" "}
              <Text className="text-primary">click to select</Text>
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {acceptedFormats
                .map((format) => format.split("/")[1].toUpperCase())
                .join(", ")}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Max file size: {maxSizeInMB}MB
            </Text>
            {isMaxFilesReached && (
              <Text className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                Maximum files reached
              </Text>
            )}
          </>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View
          testID="error-message"
          className="mt-4 flex flex-row items-center rounded-md bg-red-50 p-3 dark:bg-red-900/20"
        >
          <AlertCircle className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
          <Text className="text-sm text-red-600 dark:text-red-400">
            {error}
          </Text>
        </View>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <View className="mt-6">
          <View className="mb-3 flex flex-row items-center justify-between">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Uploaded Files
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {files.length} of {maxFiles} files uploaded
            </Text>
          </View>

          <View className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file) => (
              <View
                key={file.id}
                testID={`file-preview-${file.id}`}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Image Preview */}
                <View className="aspect-square bg-gray-100 dark:bg-gray-900">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="h-full w-full object-cover"
                  />
                </View>

                {/* File Info */}
                <View className="p-3">
                  <Text className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                    {file.file.name}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.file.size)}
                  </Text>
                </View>

                {/* Remove Button */}
                <button
                  testID={`remove-file-${file.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(file.id);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 opacity-0 transition-opacity duration-200 hover:bg-black/70 group-hover:opacity-100"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
