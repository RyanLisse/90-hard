import * as ImagePicker from "expo-image-picker";
import type React from "react";
import { useCallback, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import type { PhotoOrientation } from "../../domains/photo";
import { compressImage } from "../../services/photo/imageCompression";

export interface PhotoCaptureProps {
  dayNumber: number;
  onCapture: (data: {
    imageData: string;
    metadata: {
      width: number;
      height: number;
      size: number;
      mimeType: string;
      orientation: PhotoOrientation;
    };
  }) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  dayNumber,
  onCapture,
  onError,
  isProcessing = false,
}) => {
  const [hasRequestedCameraPermission, setHasRequestedCameraPermission] =
    useState(false);
  const [hasRequestedGalleryPermission, setHasRequestedGalleryPermission] =
    useState(false);

  const getOrientation = (width: number, height: number): PhotoOrientation => {
    const aspectRatio = width / height;
    if (Math.abs(aspectRatio - 1) < 0.1) return "square";
    return width > height ? "landscape" : "portrait";
  };

  const processImage = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      if (!asset.base64) {
        throw new Error("No image data available");
      }

      // Determine orientation from original image dimensions
      const orientation = getOrientation(asset.width, asset.height);

      const compressed = await compressImage(asset.base64, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "jpeg",
      });

      onCapture({
        imageData: compressed.data,
        metadata: {
          width: compressed.width,
          height: compressed.height,
          size: compressed.size,
          mimeType: "image/jpeg",
          orientation,
        },
      });
    } catch (error) {
      console.error("Image processing error:", error);
      onError("Failed to process image. Please try again.");
    }
  };

  const handleCameraCapture = async () => {
    try {
      // Request permission if not already done
      if (!hasRequestedCameraPermission) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        setHasRequestedCameraPermission(true);

        if (status !== "granted") {
          onError(
            "Camera permission denied. Please enable camera access in your device settings.",
          );
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
        base64: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets[0]) {
        // Check if base64 data exists before processing
        if (!result.assets[0].base64) {
          onError("Failed to capture image. Please try again.");
          return;
        }
        await processImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Camera capture error:", error);
      onError("Failed to capture image. Please try again.");
    }
  };

  const handleGalleryImport = async () => {
    try {
      // Request permission if not already done
      if (!hasRequestedGalleryPermission) {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasRequestedGalleryPermission(true);

        if (status !== "granted") {
          onError(
            "Gallery permission denied. Please enable photo library access in your device settings.",
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 1,
        base64: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets[0]) {
        // Check if base64 data exists before processing
        if (!result.assets[0].base64) {
          onError("Failed to import image. Please try again.");
          return;
        }
        await processImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Gallery import error:", error);
      onError("Failed to import image. Please try again.");
    }
  };

  const progressPercentage = (dayNumber / 90) * 100;

  return (
    <View className="flex-1 items-center justify-center p-6">
      {/* Day Number */}
      <Text className="mb-8 font-bold text-2xl text-gray-800">
        Day {dayNumber}
      </Text>

      {/* Camera Button with Progress Ring */}
      <View className="relative mb-8">
        {/* Progress Ring */}
        <View
          className="absolute inset-0 rounded-full"
          data-progress={progressPercentage.toFixed(2)}
          style={{
            borderWidth: 4,
            borderColor: "#f97316",
            opacity: 0.3,
          }}
          testID="progress-ring"
        />

        {/* Camera Button */}
        <TouchableOpacity
          className={`h-32 w-32 items-center justify-center rounded-full bg-orange-500 ${
            isProcessing ? "opacity-50" : ""
          }`}
          disabled={isProcessing}
          onPress={handleCameraCapture}
          testID="camera-button"
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <View className="h-16 w-16 rounded-lg bg-white" />
          )}
        </TouchableOpacity>
      </View>

      {/* Processing State */}
      {isProcessing && (
        <Text className="mb-4 text-gray-600">Processing...</Text>
      )}

      {/* Gallery Import Option */}
      <TouchableOpacity
        className={`rounded-lg bg-gray-200 px-6 py-3 ${
          isProcessing ? "opacity-50" : ""
        }`}
        disabled={isProcessing}
        onPress={handleGalleryImport}
      >
        <Text className="font-medium text-gray-700">Import from Gallery</Text>
      </TouchableOpacity>
    </View>
  );
};
