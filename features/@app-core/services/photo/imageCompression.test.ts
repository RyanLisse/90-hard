import { describe, it, expect, vi, beforeEach } from "vitest";
import { compressImage } from "./imageCompression";

// Mock the Canvas API for image manipulation
global.Image = vi.fn(() => ({
  onload: null,
  onerror: null,
  src: "",
  width: 0,
  height: 0,
})) as any;

global.document = {
  createElement: vi.fn((tag) => {
    if (tag === "canvas") {
      return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
          getImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(4), // RGBA
          })),
        })),
        toDataURL: vi.fn(() => "data:image/jpeg;base64,compressed-data"),
      };
    }
    return {};
  }),
} as any;

describe("imageCompression", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Compression", () => {
    it("should compress image with default settings", async () => {
      const mockImage = new Image();
      mockImage.width = 3000;
      mockImage.height = 4000;

      // Trigger onload immediately
      vi.spyOn(global, "Image").mockImplementation(() => {
        const img = mockImage;
        setTimeout(() => img.onload?.(new Event("load")), 0);
        return img;
      });

      const result = await compressImage("base64-image-data", {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "jpeg",
      });

      expect(result).toEqual({
        data: "compressed-data", // Without the data URL prefix
        width: 810, // Calculated to maintain aspect ratio
        height: 1080,
        size: expect.any(Number),
      });
    });

    it("should handle different quality levels", async () => {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toDataURL: vi.fn(() => "data:image/jpeg;base64,compressed-data"),
      };

      document.createElement = vi.fn(() => mockCanvas);

      const mockImage = new Image();
      mockImage.width = 1000;
      mockImage.height = 1000;

      vi.spyOn(global, "Image").mockImplementation(() => {
        const img = mockImage;
        setTimeout(() => img.onload?.(new Event("load")), 0);
        return img;
      });

      await compressImage("base64-image-data", {
        quality: 0.5,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "jpeg",
      });

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.5);
    });
  });

  describe("Aspect Ratio Preservation", () => {
    it("should preserve aspect ratio for portrait images", async () => {
      const mockImage = new Image();
      mockImage.width = 1080;
      mockImage.height = 1920;

      vi.spyOn(global, "Image").mockImplementation(() => {
        const img = mockImage;
        setTimeout(() => img.onload?.(new Event("load")), 0);
        return img;
      });

      const result = await compressImage("base64-image-data", {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "jpeg",
      });

      // Should scale down to fit height constraint
      expect(result.width).toBe(608); // 1080 * (1080/1920)
      expect(result.height).toBe(1080);
    });

    it("should preserve aspect ratio for landscape images", async () => {
      const mockImage = new Image();
      mockImage.width = 4000;
      mockImage.height = 3000;

      vi.spyOn(global, "Image").mockImplementation(() => {
        const img = mockImage;
        setTimeout(() => img.onload?.(new Event("load")), 0);
        return img;
      });

      const result = await compressImage("base64-image-data", {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "jpeg",
      });

      // Should scale down to fit width constraint
      expect(result.width).toBe(1440); // Calculated to maintain aspect ratio
      expect(result.height).toBe(1080);
    });

    it("should not upscale smaller images", async () => {
      const mockImage = new Image();
      mockImage.width = 800;
      mockImage.height = 600;

      vi.spyOn(global, "Image").mockImplementation(() => {
        const img = mockImage;
        setTimeout(() => img.onload?.(new Event("load")), 0);
        return img;
      });

      const result = await compressImage("base64-image-data", {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "jpeg",
      });

      // Should keep original dimensions
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });
  });

  describe("Format Support", () => {
    it("should support JPEG format", async () => {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toDataURL: vi.fn(() => "data:image/jpeg;base64,jpeg-data"),
      };

      document.createElement = vi.fn(() => mockCanvas);

      const mockImage = new Image();
      mockImage.width = 1000;
      mockImage.height = 1000;

      vi.spyOn(global, "Image").mockImplementation(() => {
        const img = mockImage;
        setTimeout(() => img.onload?.(new Event("load")), 0);
        return img;
      });

      const result = await compressImage("base64-image-data", {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "jpeg",
      });

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.8);
      expect(result.data).toBe("jpeg-data");
    });

    it("should support PNG format", async () => {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toDataURL: vi.fn(() => "data:image/png;base64,png-data"),
      };

      document.createElement = vi.fn(() => mockCanvas);

      const mockImage = new Image();
      mockImage.width = 1000;
      mockImage.height = 1000;

      vi.spyOn(global, "Image").mockImplementation(() => {
        const img = mockImage;
        setTimeout(() => img.onload?.(new Event("load")), 0);
        return img;
      });

      const result = await compressImage("base64-image-data", {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "png",
      });

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/png");
      expect(result.data).toBe("png-data");
    });

    it("should support WebP format", async () => {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toDataURL: vi.fn(() => "data:image/webp;base64,webp-data"),
      };

      document.createElement = vi.fn(() => mockCanvas);

      const mockImage = new Image();
      mockImage.width = 1000;
      mockImage.height = 1000;

      vi.spyOn(global, "Image").mockImplementation(() => {
        const img = mockImage;
        setTimeout(() => img.onload?.(new Event("load")), 0);
        return img;
      });

      const result = await compressImage("base64-image-data", {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "webp",
      });

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/webp", 0.8);
      expect(result.data).toBe("webp-data");
    });
  });

  describe("Error Handling", () => {
    it("should handle image load errors", async () => {
      const mockImage = new Image();

      vi.spyOn(global, "Image").mockImplementation(() => {
        const img = mockImage;
        setTimeout(() => img.onerror?.(new Event("error")), 0);
        return img;
      });

      await expect(
        compressImage("invalid-base64", {
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1080,
          format: "jpeg",
        }),
      ).rejects.toThrow("Failed to load image");
    });

    it("should handle invalid quality values", async () => {
      await expect(
        compressImage("base64-image-data", {
          quality: -0.5,
          maxWidth: 1920,
          maxHeight: 1080,
          format: "jpeg",
        }),
      ).rejects.toThrow("Quality must be between 0 and 1");

      await expect(
        compressImage("base64-image-data", {
          quality: 1.5,
          maxWidth: 1920,
          maxHeight: 1080,
          format: "jpeg",
        }),
      ).rejects.toThrow("Quality must be between 0 and 1");
    });

    it("should handle invalid dimensions", async () => {
      await expect(
        compressImage("base64-image-data", {
          quality: 0.8,
          maxWidth: 0,
          maxHeight: 1080,
          format: "jpeg",
        }),
      ).rejects.toThrow("Invalid dimensions");

      await expect(
        compressImage("base64-image-data", {
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: -100,
          format: "jpeg",
        }),
      ).rejects.toThrow("Invalid dimensions");
    });
  });

  describe("Size Calculation", () => {
    it("should estimate compressed size from base64 length", async () => {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => ({
          drawImage: vi.fn(),
        })),
        toDataURL: vi.fn(() => "data:image/jpeg;base64," + "A".repeat(1000)),
      };

      document.createElement = vi.fn(() => mockCanvas);

      const mockImage = new Image();
      mockImage.width = 1000;
      mockImage.height = 1000;

      vi.spyOn(global, "Image").mockImplementation(() => {
        const img = mockImage;
        setTimeout(() => img.onload?.(new Event("load")), 0);
        return img;
      });

      const result = await compressImage("base64-image-data", {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: "jpeg",
      });

      // Base64 to bytes conversion: length * 3/4
      expect(result.size).toBe(750); // 1000 * 3/4
    });
  });
});
