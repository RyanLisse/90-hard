import type { PhotoCompression } from '../../domains/photo';

export interface CompressedImage {
  data: string; // base64 without data URL prefix
  width: number;
  height: number;
  size: number; // in bytes
}

/**
 * Compress an image using canvas API
 * Works in both browser and React Native (with polyfill)
 */
export async function compressImage(
  base64Data: string,
  options: PhotoCompression
): Promise<CompressedImage> {
  // Validate quality
  if (options.quality < 0 || options.quality > 1) {
    throw new Error('Quality must be between 0 and 1');
  }

  // Validate dimensions
  if (options.maxWidth <= 0 || options.maxHeight <= 0) {
    throw new Error('Invalid dimensions');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while preserving aspect ratio
        let { width, height } = img;

        // Scale down if needed, but never scale up
        if (width > options.maxWidth || height > options.maxHeight) {
          const widthRatio = options.maxWidth / width;
          const heightRatio = options.maxHeight / height;
          const ratio = Math.min(widthRatio, heightRatio);

          // Use Math.ceil to avoid off-by-one downsizing due to FP rounding
          width = Math.ceil(width * ratio);
          height = Math.ceil(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to desired format
        const mimeType = `image/${options.format}`;
        // PNG ignores quality; call without the optional arg to match expectations
        const dataUrl =
          options.format === 'png'
            ? canvas.toDataURL(mimeType)
            : canvas.toDataURL(mimeType, options.quality);

        // Extract base64 data without the data URL prefix
        const base64 = dataUrl.split(',')[1] || '';

        // Calculate approximate file size (base64 is ~33% larger than binary)
        const size = Math.floor((base64.length * 3) / 4);

        resolve({
          data: base64,
          width,
          height,
          size,
        });
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Add data URL prefix if not present
    const src = base64Data.startsWith('data:')
      ? base64Data
      : `data:image/jpeg;base64,${base64Data}`;

    img.src = src;
  });
}

/**
 * React Native specific compression using expo-image-manipulator
 * This should be used instead of the canvas-based compression in React Native
 */
export async function compressImageNative(
  uri: string,
  options: PhotoCompression
): Promise<CompressedImage> {
  // This would be implemented using expo-image-manipulator
  // For now, we'll use the canvas-based implementation
  // which works with React Native canvas polyfills
  throw new Error(
    'Native compression not implemented. Use canvas-based compression.'
  );
}
