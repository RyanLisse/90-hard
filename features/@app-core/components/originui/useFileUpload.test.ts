/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileUpload } from "./useFileUpload";

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();

describe("useFileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock createObjectURL to return a unique URL for each call
    (global.URL.createObjectURL as any).mockImplementation(
      (file: File) => `blob:${file.name}`,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should initialize with empty files and no error", () => {
      const { result } = renderHook(() => useFileUpload());

      expect(result.current.files).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isMaxFilesReached).toBe(false);
    });

    it("should respect custom options", () => {
      const { result } = renderHook(() => useFileUpload({ maxFiles: 1 }));

      expect(result.current.files).toEqual([]);
      expect(result.current.isMaxFilesReached).toBe(false);
    });
  });

  describe("adding files", () => {
    it("should add a single file successfully", () => {
      const { result } = renderHook(() => useFileUpload());
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([mockFile]);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0]).toMatchObject({
        file: mockFile,
        preview: "blob:test.jpg",
      });
      expect(result.current.files[0].id).toBeTruthy();
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it("should add multiple files successfully", () => {
      const { result } = renderHook(() => useFileUpload());
      const mockFiles = [
        new File(["content1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "test2.jpg", { type: "image/jpeg" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.files[0].file).toBe(mockFiles[0]);
      expect(result.current.files[1].file).toBe(mockFiles[1]);
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    });

    it("should generate unique IDs for files", () => {
      const { result } = renderHook(() => useFileUpload());
      const mockFiles = [
        new File(["content1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "test2.jpg", { type: "image/jpeg" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
      });

      const ids = result.current.files.map((f) => f.id);
      expect(new Set(ids).size).toBe(2); // All IDs should be unique
    });
  });

  describe("file validation", () => {
    it("should reject files exceeding size limit", () => {
      const { result } = renderHook(() => useFileUpload({ maxSizeInMB: 1 }));

      // Create a file larger than 1MB
      const largeContent = new Array(1024 * 1024 + 1).fill("a").join("");
      const largeFile = new File([largeContent], "large.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([largeFile]);
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.error).toBe(
        'File "large.jpg" exceeds the maximum size of 1MB',
      );
    });

    it("should reject files with unsupported formats", () => {
      const { result } = renderHook(() =>
        useFileUpload({ acceptedFormats: ["image/jpeg", "image/png"] }),
      );

      const pdfFile = new File(["content"], "document.pdf", {
        type: "application/pdf",
      });

      act(() => {
        result.current.addFiles([pdfFile]);
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.error).toBe(
        'File "document.pdf" has an unsupported format',
      );
    });

    it("should accept files with supported formats", () => {
      const { result } = renderHook(() =>
        useFileUpload({ acceptedFormats: ["image/jpeg", "image/png"] }),
      );

      const jpegFile = new File(["content"], "image.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([jpegFile]);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.error).toBeNull();
    });

    it("should reject when exceeding max files limit", () => {
      const { result } = renderHook(() => useFileUpload({ maxFiles: 2 }));

      const files = [
        new File(["content1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "test2.jpg", { type: "image/jpeg" }),
      ];

      act(() => {
        result.current.addFiles(files);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.isMaxFilesReached).toBe(true);

      const extraFile = new File(["content3"], "test3.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([extraFile]);
      });

      expect(result.current.files).toHaveLength(2);
      expect(result.current.error).toBe("Cannot upload more than 2 files");
    });

    it("should stop validation on first error", () => {
      const { result } = renderHook(() => useFileUpload({ maxSizeInMB: 1 }));

      const largeContent = new Array(1024 * 1024 + 1).fill("a").join("");
      const files = [
        new File([largeContent], "large1.jpg", { type: "image/jpeg" }),
        new File([largeContent], "large2.jpg", { type: "image/jpeg" }),
      ];

      act(() => {
        result.current.addFiles(files);
      });

      // Should only report error for the first file
      expect(result.current.error).toBe(
        'File "large1.jpg" exceeds the maximum size of 1MB',
      );
      expect(result.current.files).toHaveLength(0);
    });
  });

  describe("removing files", () => {
    it("should remove a file by ID", () => {
      const { result } = renderHook(() => useFileUpload());
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([mockFile]);
      });

      const fileId = result.current.files[0].id;

      act(() => {
        result.current.removeFile(fileId);
      });

      expect(result.current.files).toHaveLength(0);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:test.jpg");
    });

    it("should clear error when removing a file", () => {
      const { result } = renderHook(() => useFileUpload({ maxFiles: 1 }));

      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([mockFile]);
      });

      // Try to add another file to trigger error
      act(() => {
        result.current.addFiles([mockFile]);
      });

      expect(result.current.error).toBeTruthy();

      const fileId = result.current.files[0].id;

      act(() => {
        result.current.removeFile(fileId);
      });

      expect(result.current.error).toBeNull();
    });

    it("should handle removing non-existent file ID gracefully", () => {
      const { result } = renderHook(() => useFileUpload());
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([mockFile]);
      });

      act(() => {
        result.current.removeFile("non-existent-id");
      });

      expect(result.current.files).toHaveLength(1); // File should still be there
    });

    it("should update isMaxFilesReached when removing files", () => {
      const { result } = renderHook(() => useFileUpload({ maxFiles: 1 }));

      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([mockFile]);
      });

      expect(result.current.isMaxFilesReached).toBe(true);

      const fileId = result.current.files[0].id;

      act(() => {
        result.current.removeFile(fileId);
      });

      expect(result.current.isMaxFilesReached).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should reset error", () => {
      const { result } = renderHook(() => useFileUpload({ maxSizeInMB: 1 }));

      const largeContent = new Array(1024 * 1024 + 1).fill("a").join("");
      const largeFile = new File([largeContent], "large.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([largeFile]);
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.resetError();
      });

      expect(result.current.error).toBeNull();
    });

    it("should clear error when successfully adding files", () => {
      const { result } = renderHook(() => useFileUpload({ maxSizeInMB: 1 }));

      const largeContent = new Array(1024 * 1024 + 1).fill("a").join("");
      const largeFile = new File([largeContent], "large.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([largeFile]);
      });

      expect(result.current.error).toBeTruthy();

      const smallFile = new File(["small"], "small.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([smallFile]);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.files).toHaveLength(1);
    });
  });

  describe("reset functionality", () => {
    it("should reset all state", () => {
      const { result } = renderHook(() => useFileUpload());
      const mockFiles = [
        new File(["content1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "test2.jpg", { type: "image/jpeg" }),
      ];

      act(() => {
        result.current.addFiles(mockFiles);
      });

      expect(result.current.files).toHaveLength(2);

      act(() => {
        result.current.reset();
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.error).toBeNull();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledTimes(2);
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:test1.jpg");
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:test2.jpg");
    });

    it("should reset error state", () => {
      const { result } = renderHook(() => useFileUpload({ maxSizeInMB: 1 }));

      const largeContent = new Array(1024 * 1024 + 1).fill("a").join("");
      const largeFile = new File([largeContent], "large.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([largeFile]);
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle empty acceptedFormats array", () => {
      const { result } = renderHook(() =>
        useFileUpload({ acceptedFormats: [] }),
      );

      const anyFile = new File(["content"], "any.xyz", {
        type: "application/xyz",
      });

      act(() => {
        result.current.addFiles([anyFile]);
      });

      expect(result.current.files).toHaveLength(1); // Should accept any format
    });

    it("should handle adding empty array of files", () => {
      const { result } = renderHook(() => useFileUpload());

      act(() => {
        result.current.addFiles([]);
      });

      expect(result.current.files).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });

    it("should maintain file order when adding multiple batches", () => {
      const { result } = renderHook(() => useFileUpload());

      const batch1 = [new File(["1"], "file1.jpg", { type: "image/jpeg" })];
      const batch2 = [new File(["2"], "file2.jpg", { type: "image/jpeg" })];

      act(() => {
        result.current.addFiles(batch1);
      });

      act(() => {
        result.current.addFiles(batch2);
      });

      expect(result.current.files[0].file.name).toBe("file1.jpg");
      expect(result.current.files[1].file.name).toBe("file2.jpg");
    });
  });

  describe("default values", () => {
    it("should use default maxFiles of 6", () => {
      const { result } = renderHook(() => useFileUpload());

      const files = Array.from(
        { length: 7 },
        (_, i) =>
          new File([`content${i}`], `file${i}.jpg`, { type: "image/jpeg" }),
      );

      act(() => {
        result.current.addFiles(files.slice(0, 6));
      });

      expect(result.current.files).toHaveLength(6);
      expect(result.current.isMaxFilesReached).toBe(true);

      act(() => {
        result.current.addFiles([files[6]]);
      });

      expect(result.current.error).toBe("Cannot upload more than 6 files");
    });

    it("should use default maxSizeInMB of 5", () => {
      const { result } = renderHook(() => useFileUpload());

      // Create a file larger than 5MB
      const largeContent = new Array(5 * 1024 * 1024 + 1).fill("a").join("");
      const largeFile = new File([largeContent], "large.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.addFiles([largeFile]);
      });

      expect(result.current.error).toBe(
        'File "large.jpg" exceeds the maximum size of 5MB',
      );
    });
  });
});
