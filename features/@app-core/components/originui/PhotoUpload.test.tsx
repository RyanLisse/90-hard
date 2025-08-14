import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PhotoUpload } from "./PhotoUpload";
import type { PhotoUploadProps } from "./PhotoUpload";
import { useFileUpload } from "./useFileUpload";

// Mock dependencies
const mockOnUpload = vi.fn();
const mockOnRemove = vi.fn();
const mockOnError = vi.fn();

// Mock the useFileUpload hook
vi.mock("./useFileUpload");

describe("PhotoUpload - TDD London School", () => {
  const defaultProps: PhotoUploadProps = {
    onUpload: mockOnUpload,
    onRemove: mockOnRemove,
    onError: mockOnError,
    maxFiles: 6,
    maxSizeInMB: 5,
    acceptedFormats: [
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render upload area with correct instructions", () => {
      render(<PhotoUpload {...defaultProps} />);

      expect(screen.getByTestId("photo-upload-container")).toBeInTheDocument();
      expect(
        screen.getByText(/drag and drop your image here/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/click to select/i)).toBeInTheDocument();
      expect(screen.getByText(/SVG, PNG, JPEG, JPG, GIF/i)).toBeInTheDocument();
      expect(screen.getByText(/max file size: 5MB/i)).toBeInTheDocument();
    });

    it("should render file input with correct attributes", () => {
      render(<PhotoUpload {...defaultProps} />);

      const fileInput = screen.getByTestId("file-input");
      expect(fileInput).toHaveAttribute("type", "file");
      expect(fileInput).toHaveAttribute("multiple");
      expect(fileInput).toHaveAttribute(
        "accept",
        "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif",
      );
    });

    it("should apply custom className when provided", () => {
      render(<PhotoUpload {...defaultProps} className="custom-class" />);

      const container = screen.getByTestId("photo-upload-container");
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("File Selection Behavior", () => {
    it("should handle file selection via click", async () => {
      const mockAddFiles = vi.fn();
      vi.mocked(useFileUpload).mockReturnValue({
        files: [],
        addFiles: mockAddFiles,
        removeFile: vi.fn(),
        error: null,
        resetError: vi.fn(),
        reset: vi.fn(),
        isMaxFilesReached: false,
      });

      render(<PhotoUpload {...defaultProps} />);

      const fileInput = screen.getByTestId("file-input");
      const testFile = new File(["test"], "test.png", { type: "image/png" });

      await userEvent.upload(fileInput, testFile);

      expect(mockAddFiles).toHaveBeenCalledWith([testFile]);
    });

    it("should call onUpload when files are added", async () => {
      const uploadedFile = {
        id: "1",
        file: new File(["test"], "test.png", { type: "image/png" }),
        preview: "data:image/png;base64,test",
      };

      vi.mocked(useFileUpload).mockReturnValue({
        files: [uploadedFile],
        addFiles: vi.fn(),
        removeFile: vi.fn(),
        error: null,
        resetError: vi.fn(),
        reset: vi.fn(),
        isMaxFilesReached: false,
      });

      render(<PhotoUpload {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith([uploadedFile]);
      });
    });
  });

  describe("Drag and Drop Behavior", () => {
    it("should show drag over state when dragging files", () => {
      render(<PhotoUpload {...defaultProps} />);

      const dropZone = screen.getByTestId("drop-zone");

      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass("border-primary");
      expect(dropZone).toHaveClass("bg-primary/5");

      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass("border-primary");
      expect(dropZone).not.toHaveClass("bg-primary/5");
    });

    it("should handle file drop", async () => {
      const mockAddFiles = vi.fn();
      vi.mocked(useFileUpload).mockReturnValue({
        files: [],
        addFiles: mockAddFiles,
        removeFile: vi.fn(),
        error: null,
        resetError: vi.fn(),
        reset: vi.fn(),
        isMaxFilesReached: false,
      });

      render(<PhotoUpload {...defaultProps} />);

      const dropZone = screen.getByTestId("drop-zone");
      const testFile = new File(["test"], "test.png", { type: "image/png" });

      const dataTransfer = {
        files: [testFile],
        types: ["Files"],
      };

      fireEvent.drop(dropZone, { dataTransfer });

      expect(mockAddFiles).toHaveBeenCalledWith([testFile]);
    });

    it("should prevent default drag behavior", () => {
      render(<PhotoUpload {...defaultProps} />);

      const dropZone = screen.getByTestId("drop-zone");

      const dragOverEvent = new Event("dragover", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(dragOverEvent, "preventDefault");

      dropZone.dispatchEvent(dragOverEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("File Preview and Management", () => {
    it("should display uploaded files with preview", () => {
      const uploadedFiles = [
        {
          id: "1",
          file: new File(["test1"], "test1.png", { type: "image/png" }),
          preview: "data:image/png;base64,test1",
        },
        {
          id: "2",
          file: new File(["test2"], "test2.jpg", { type: "image/jpeg" }),
          preview: "data:image/jpeg;base64,test2",
        },
      ];

      vi.mocked(useFileUpload).mockReturnValue({
        files: uploadedFiles,
        addFiles: vi.fn(),
        removeFile: vi.fn(),
        error: null,
        resetError: vi.fn(),
        reset: vi.fn(),
        isMaxFilesReached: false,
      });

      render(<PhotoUpload {...defaultProps} />);

      expect(screen.getByText("test1.png")).toBeInTheDocument();
      expect(screen.getByText("test2.jpg")).toBeInTheDocument();
      expect(screen.getAllByTestId(/file-preview-/)).toHaveLength(2);
    });

    it("should handle file removal", async () => {
      const mockRemoveFile = vi.fn();
      const uploadedFile = {
        id: "1",
        file: new File(["test"], "test.png", { type: "image/png" }),
        preview: "data:image/png;base64,test",
      };

      vi.mocked(useFileUpload).mockReturnValue({
        files: [uploadedFile],
        addFiles: vi.fn(),
        removeFile: mockRemoveFile,
        error: null,
        resetError: vi.fn(),
        reset: vi.fn(),
        isMaxFilesReached: false,
      });

      render(<PhotoUpload {...defaultProps} />);

      const removeButton = screen.getByTestId("remove-file-1");
      await userEvent.click(removeButton);

      expect(mockRemoveFile).toHaveBeenCalledWith("1");
      expect(mockOnRemove).toHaveBeenCalledWith("1");
    });

    it("should display file count status", () => {
      const uploadedFiles = [
        {
          id: "1",
          file: new File(["test1"], "test1.png", { type: "image/png" }),
          preview: "data:image/png;base64,test1",
        },
        {
          id: "2",
          file: new File(["test2"], "test2.jpg", { type: "image/jpeg" }),
          preview: "data:image/jpeg;base64,test2",
        },
      ];

      vi.mocked(useFileUpload).mockReturnValue({
        files: uploadedFiles,
        addFiles: vi.fn(),
        removeFile: vi.fn(),
        error: null,
        resetError: vi.fn(),
        reset: vi.fn(),
        isMaxFilesReached: false,
      });

      render(<PhotoUpload {...defaultProps} />);

      expect(screen.getByText("2 of 6 files uploaded")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should display error message when error exists", () => {
      const errorMessage = "File size exceeds maximum limit";

      vi.mocked(useFileUpload).mockReturnValue({
        files: [],
        addFiles: vi.fn(),
        removeFile: vi.fn(),
        error: errorMessage,
        resetError: vi.fn(),
        reset: vi.fn(),
        isMaxFilesReached: false,
      });

      render(<PhotoUpload {...defaultProps} />);

      expect(screen.getByTestId("error-message")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("should call onError when error occurs", async () => {
      const errorMessage = "Invalid file format";

      vi.mocked(useFileUpload).mockReturnValue({
        files: [],
        addFiles: vi.fn(),
        removeFile: vi.fn(),
        error: errorMessage,
        resetError: vi.fn(),
        reset: vi.fn(),
        isMaxFilesReached: false,
      });

      render(<PhotoUpload {...defaultProps} />);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      });
    });

    it("should disable upload when max files reached", () => {
      const maxFiles = Array.from({ length: 6 }, (_, i) => ({
        id: `${i + 1}`,
        file: new File([`test${i}`], `test${i}.png`, { type: "image/png" }),
        preview: `data:image/png;base64,test${i}`,
      }));

      vi.mocked(useFileUpload).mockReturnValue({
        files: maxFiles,
        addFiles: vi.fn(),
        removeFile: vi.fn(),
        error: null,
        resetError: vi.fn(),
        reset: vi.fn(),
        isMaxFilesReached: true,
      });

      render(<PhotoUpload {...defaultProps} />);

      const fileInput = screen.getByTestId("file-input");
      expect(fileInput).toBeDisabled();
      expect(screen.getByText("Maximum files reached")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<PhotoUpload {...defaultProps} />);

      const dropZone = screen.getByTestId("drop-zone");
      expect(dropZone).toHaveAttribute("aria-label", "Upload photos");
      expect(dropZone).toHaveAttribute("role", "button");
      expect(dropZone).toHaveAttribute("tabIndex", "0");
    });

    it("should handle keyboard interaction", async () => {
      render(<PhotoUpload {...defaultProps} />);

      const dropZone = screen.getByTestId("drop-zone");
      const fileInput = screen.getByTestId("file-input");

      // Mock click on file input
      const clickSpy = vi.spyOn(fileInput, "click");

      // Simulate Enter key press
      fireEvent.keyDown(dropZone, { key: "Enter" });
      expect(clickSpy).toHaveBeenCalled();

      // Simulate Space key press
      clickSpy.mockClear();
      fireEvent.keyDown(dropZone, { key: " " });
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should show loading state when uploading", () => {
      render(<PhotoUpload {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.getByText("Uploading...")).toBeInTheDocument();
      expect(screen.getByTestId("file-input")).toBeDisabled();
    });
  });
});
