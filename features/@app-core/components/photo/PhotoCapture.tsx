import React, { useState, useCallback } from "react";
import { View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { compressImage } from "../../services/photo/imageCompression";
import type { PhotoOrientation } from "../../domains/photo";

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
  const [hasRequestedCameraPermission, setHasRequestedCameraPermission] = useState(false);
  const [hasRequestedGalleryPermission, setHasRequestedGalleryPermission] = useState(false);

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

      const compressed = await compressImage(asset.base64, {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "jpeg",
      });

      const orientation = getOrientation(compressed.width, compressed.height);

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
          onError("Camera permission denied. Please enable camera access in your device settings.");
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
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasRequestedGalleryPermission(true);
        
        if (status !== "granted") {
          onError("Gallery permission denied. Please enable photo library access in your device settings.");
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
      <Text className="text-2xl font-bold text-gray-800 mb-8">
        Day {dayNumber}
      </Text>

      {/* Camera Button with Progress Ring */}
      <View className="relative mb-8">
        {/* Progress Ring */}
        <View
          testID="progress-ring"
          data-progress={progressPercentage.toFixed(2)}
          className="absolute inset-0 rounded-full"
          style={{
            borderWidth: 4,
            borderColor: "#f97316",
            opacity: 0.3,
          }}
        />
        
        {/* Camera Button */}
        <TouchableOpacity
          testID="camera-button"
          onPress={handleCameraCapture}
          disabled={isProcessing}
          className={`w-32 h-32 rounded-full bg-orange-500 items-center justify-center ${
            isProcessing ? "opacity-50" : ""
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <View className="w-16 h-16 bg-white rounded-lg" />
          )}
        </TouchableOpacity>
      </View>

      {/* Processing State */}
      {isProcessing && (
        <Text className="text-gray-600 mb-4">Processing...</Text>
      )}

      {/* Gallery Import Option */}
      <TouchableOpacity
        onPress={handleGalleryImport}
        disabled={isProcessing}
        className={`px-6 py-3 bg-gray-200 rounded-lg ${
          isProcessing ? "opacity-50" : ""
        }`}
      >
        <Text className="text-gray-700 font-medium">Import from Gallery</Text>
      </TouchableOpacity>
    </View>
  );
};