import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PhotoCaptureProps } from './PhotoCapture';
import { PhotoCapture } from './PhotoCapture';

// Mock dependencies
const mockOnCapture = vi.fn();
const mockOnError = vi.fn();
const mockCompress = vi.fn();

// Mock the image compression service
vi.mock('../../services/photo/imageCompression', () => ({
  compressImage: (imageData: string, options: any) =>
    mockCompress(imageData, options),
}));

// Mock the camera/image picker (React Native)
vi.mock('expo-image-picker', () => ({
  launchCameraAsync: vi.fn(),
  launchImageLibraryAsync: vi.fn(),
  requestCameraPermissionsAsync: vi.fn(),
  requestMediaLibraryPermissionsAsync: vi.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

describe('PhotoCapture', () => {
  const defaultProps: PhotoCaptureProps = {
    dayNumber: 15,
    onCapture: mockOnCapture,
    onError: mockOnError,
    isProcessing: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCompress.mockResolvedValue({
      data: 'compressed-base64-data',
      width: 1920,
      height: 1080,
      size: 1_024_000,
    });
  });

  describe('UI Rendering', () => {
    it('should render the large orange camera button', () => {
      render(<PhotoCapture {...defaultProps} />);

      const cameraButton = screen.getByTestId('camera-button');
      expect(cameraButton).toBeInTheDocument();
      expect(cameraButton).toHaveClass('bg-orange-500');
    });

    it('should display the current day number', () => {
      render(<PhotoCapture {...defaultProps} />);

      expect(screen.getByText('Day 15')).toBeInTheDocument();
    });

    it('should show progress ring around button', () => {
      render(<PhotoCapture {...defaultProps} />);

      const progressRing = screen.getByTestId('progress-ring');
      expect(progressRing).toBeInTheDocument();
      expect(progressRing).toHaveAttribute('data-progress', '16.67'); // 15/90 * 100
    });

    it('should show import from gallery option', () => {
      render(<PhotoCapture {...defaultProps} />);

      expect(screen.getByText('Import from Gallery')).toBeInTheDocument();
    });

    it('should disable buttons when processing', () => {
      render(<PhotoCapture {...defaultProps} isProcessing={true} />);

      const cameraButton = screen.getByTestId('camera-button');
      const galleryButton = screen.getByText('Import from Gallery');

      expect(cameraButton).toBeDisabled();
      expect(galleryButton.closest('button')).toBeDisabled();
    });

    it('should show processing state', () => {
      render(<PhotoCapture {...defaultProps} isProcessing={true} />);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  describe('Camera Capture', () => {
    it('should request camera permissions on first capture', async () => {
      const ImagePicker = await import('expo-image-picker');
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file://photo.jpg',
            base64: 'original-base64-data',
            width: 3000,
            height: 4000,
          },
        ],
      });

      render(<PhotoCapture {...defaultProps} />);

      const cameraButton = screen.getByTestId('camera-button');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('should capture and compress photo', async () => {
      const ImagePicker = await import('expo-image-picker');
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file://photo.jpg',
            base64: 'original-base64-data',
            width: 3000,
            height: 4000,
          },
        ],
      });

      render(<PhotoCapture {...defaultProps} />);

      const cameraButton = screen.getByTestId('camera-button');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(mockCompress).toHaveBeenCalledWith('original-base64-data', {
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1080,
          format: 'jpeg',
        });
      });

      await waitFor(() => {
        expect(mockOnCapture).toHaveBeenCalledWith({
          imageData: 'compressed-base64-data',
          metadata: {
            width: 1920,
            height: 1080,
            size: 1_024_000,
            mimeType: 'image/jpeg',
            orientation: 'portrait',
          },
        });
      });
    });

    it('should handle camera permission denied', async () => {
      const ImagePicker = await import('expo-image-picker');
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'denied',
      });

      render(<PhotoCapture {...defaultProps} />);

      const cameraButton = screen.getByTestId('camera-button');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          'Camera permission denied. Please enable camera access in your device settings.'
        );
      });
    });

    it('should handle camera cancellation', async () => {
      const ImagePicker = await import('expo-image-picker');
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: true,
      });

      render(<PhotoCapture {...defaultProps} />);

      const cameraButton = screen.getByTestId('camera-button');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(mockOnCapture).not.toHaveBeenCalled();
        expect(mockOnError).not.toHaveBeenCalled();
      });
    });
  });

  describe('Gallery Import', () => {
    it('should request gallery permissions on import', async () => {
      const ImagePicker = await import('expo-image-picker');
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file://gallery-photo.jpg',
            base64: 'gallery-base64-data',
            width: 2000,
            height: 2000,
          },
        ],
      });

      render(<PhotoCapture {...defaultProps} />);

      const galleryButton = screen.getByText('Import from Gallery');
      fireEvent.click(galleryButton);

      await waitFor(() => {
        expect(
          ImagePicker.requestMediaLibraryPermissionsAsync
        ).toHaveBeenCalled();
      });
    });

    it('should import and compress photo from gallery', async () => {
      const ImagePicker = await import('expo-image-picker');
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file://gallery-photo.jpg',
            base64: 'gallery-base64-data',
            width: 2000,
            height: 2000,
          },
        ],
      });

      render(<PhotoCapture {...defaultProps} />);

      const galleryButton = screen.getByText('Import from Gallery');
      fireEvent.click(galleryButton);

      await waitFor(() => {
        expect(mockCompress).toHaveBeenCalledWith('gallery-base64-data', {
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1080,
          format: 'jpeg',
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle compression errors', async () => {
      mockCompress.mockRejectedValue(new Error('Compression failed'));

      const ImagePicker = await import('expo-image-picker');
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file://photo.jpg',
            base64: 'original-base64-data',
            width: 3000,
            height: 4000,
          },
        ],
      });

      render(<PhotoCapture {...defaultProps} />);

      const cameraButton = screen.getByTestId('camera-button');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          'Failed to process image. Please try again.'
        );
      });
    });

    it('should handle missing image data', async () => {
      const ImagePicker = await import('expo-image-picker');
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file://photo.jpg',
            // Missing base64 data
            width: 3000,
            height: 4000,
          },
        ],
      });

      render(<PhotoCapture {...defaultProps} />);

      const cameraButton = screen.getByTestId('camera-button');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          'Failed to capture image. Please try again.'
        );
      });
    });
  });

  describe('Orientation Detection', () => {
    it('should detect portrait orientation', async () => {
      const ImagePicker = await import('expo-image-picker');
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file://photo.jpg',
            base64: 'portrait-base64-data',
            width: 1080,
            height: 1920,
          },
        ],
      });

      render(<PhotoCapture {...defaultProps} />);

      const cameraButton = screen.getByTestId('camera-button');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(mockOnCapture).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              orientation: 'portrait',
            }),
          })
        );
      });
    });

    it('should detect landscape orientation', async () => {
      const ImagePicker = await import('expo-image-picker');
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file://photo.jpg',
            base64: 'landscape-base64-data',
            width: 1920,
            height: 1080,
          },
        ],
      });

      render(<PhotoCapture {...defaultProps} />);

      const cameraButton = screen.getByTestId('camera-button');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(mockOnCapture).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              orientation: 'landscape',
            }),
          })
        );
      });
    });

    it('should detect square orientation', async () => {
      const ImagePicker = await import('expo-image-picker');
      ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file://photo.jpg',
            base64: 'square-base64-data',
            width: 1080,
            height: 1080,
          },
        ],
      });

      render(<PhotoCapture {...defaultProps} />);

      const cameraButton = screen.getByTestId('camera-button');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(mockOnCapture).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              orientation: 'square',
            }),
          })
        );
      });
    });
  });
});
