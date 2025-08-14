import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExportService } from "./export.service";
import type {
  AnalyticsExportData,
  TaskCompletionData,
  TimeRange,
} from "./analytics.types";

describe("ExportService", () => {
  let exportService: ExportService;
  let mockAnalyticsPort: any;
  let mockFileSystem: any;

  beforeEach(() => {
    // Mock analytics port
    mockAnalyticsPort = {
      exportAnalyticsData: vi.fn(),
      getUserAnalytics: vi.fn(),
    };

    // Mock file system operations
    mockFileSystem = {
      writeFile: vi.fn(),
      createBlob: vi.fn(),
      generateDownloadUrl: vi.fn(),
    };

    exportService = new ExportService(mockAnalyticsPort, mockFileSystem);
  });

  describe("exportToCSV", () => {
    it("should export analytics data to CSV format", async () => {
      // Arrange
      const userId = "user-123";
      const timeRange: TimeRange = "30D";
      
      const mockExportData: AnalyticsExportData = {
        userId,
        exportType: "CSV",
        timeRange,
        data: [
          {
            date: "2025-01-10",
            workout1: true,
            workout2: false,
            diet: true,
            water: true,
            reading: false,
            photo: true,
            completionPercentage: 67,
            totalTasks: 6,
            completedTasks: 4,
          },
          {
            date: "2025-01-11",
            workout1: true,
            workout2: true,
            diet: true,
            water: true,
            reading: true,
            photo: true,
            completionPercentage: 100,
            totalTasks: 6,
            completedTasks: 6,
          },
        ],
        metadata: {
          exportedAt: "2025-01-13T10:00:00Z",
          totalRecords: 2,
          dateRange: {
            startDate: "2025-01-01",
            endDate: "2025-01-13",
          },
        },
      };

      mockAnalyticsPort.exportAnalyticsData.mockResolvedValue(mockExportData);
      mockFileSystem.writeFile.mockResolvedValue("file-123.csv");
      mockFileSystem.generateDownloadUrl.mockResolvedValue("https://example.com/download/file-123.csv");

      // Act
      const result = await exportService.exportToCSV(userId, timeRange);

      // Assert
      expect(mockAnalyticsPort.exportAnalyticsData).toHaveBeenCalledWith(
        userId,
        timeRange,
        "CSV",
      );

      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("csv"),
        expect.stringContaining("Date,Workout1,Workout2,Diet,Water,Reading,Photo,Completion%,Completed Tasks"),
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          filename: expect.stringContaining(".csv"),
          downloadUrl: "https://example.com/download/file-123.csv",
          metadata: mockExportData.metadata,
        }),
      );
    });

    it("should handle empty data gracefully", async () => {
      // Arrange
      const userId = "user-123";
      const timeRange: TimeRange = "7D";

      const mockEmptyData: AnalyticsExportData = {
        userId,
        exportType: "CSV",
        timeRange,
        data: [],
        metadata: {
          exportedAt: "2025-01-13T10:00:00Z",
          totalRecords: 0,
          dateRange: {
            startDate: "2025-01-06",
            endDate: "2025-01-13",
          },
        },
      };

      mockAnalyticsPort.exportAnalyticsData.mockResolvedValue(mockEmptyData);
      mockFileSystem.writeFile.mockResolvedValue("empty-file.csv");
      mockFileSystem.generateDownloadUrl.mockResolvedValue("https://example.com/download/empty-file.csv");

      // Act
      const result = await exportService.exportToCSV(userId, timeRange);

      // Assert
      expect(result.success).toBe(true);
      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("csv"),
        expect.stringContaining("Date,Workout1,Workout2,Diet,Water,Reading,Photo,Completion%,Completed Tasks"),
      );
    });

    it("should include metadata in CSV export", async () => {
      // Arrange
      const userId = "user-123";
      const timeRange: TimeRange = "90D";
      const includeMetadata = true;

      const mockData: AnalyticsExportData = {
        userId,
        exportType: "CSV",
        timeRange,
        data: [
          {
            date: "2025-01-13",
            workout1: true,
            workout2: true,
            diet: false,
            water: true,
            reading: true,
            photo: false,
            completionPercentage: 67,
            totalTasks: 6,
            completedTasks: 4,
          },
        ],
        metadata: {
          exportedAt: "2025-01-13T10:00:00Z",
          totalRecords: 1,
          dateRange: {
            startDate: "2024-10-15",
            endDate: "2025-01-13",
          },
        },
      };

      mockAnalyticsPort.exportAnalyticsData.mockResolvedValue(mockData);
      mockFileSystem.writeFile.mockResolvedValue("metadata-file.csv");

      // Act
      const result = await exportService.exportToCSV(userId, timeRange, { includeMetadata });

      // Assert
      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("# Export Metadata"),
      );
      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(`# User ID: ${userId}`),
      );
      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("# Time Range: 90D"),
      );
    });
  });

  describe("exportToJSON", () => {
    it("should export analytics data to JSON format", async () => {
      // Arrange
      const userId = "user-456";
      const timeRange: TimeRange = "7D";

      const mockExportData: AnalyticsExportData = {
        userId,
        exportType: "JSON",
        timeRange,
        data: [
          {
            date: "2025-01-13",
            workout1: false,
            workout2: false,
            diet: true,
            water: false,
            reading: true,
            photo: false,
            completionPercentage: 33,
            totalTasks: 6,
            completedTasks: 2,
          },
        ],
        metadata: {
          exportedAt: "2025-01-13T10:00:00Z",
          totalRecords: 1,
          dateRange: {
            startDate: "2025-01-07",
            endDate: "2025-01-13",
          },
        },
      };

      mockAnalyticsPort.exportAnalyticsData.mockResolvedValue(mockExportData);
      mockFileSystem.writeFile.mockResolvedValue("file-456.json");
      mockFileSystem.generateDownloadUrl.mockResolvedValue("https://example.com/download/file-456.json");

      // Act
      const result = await exportService.exportToJSON(userId, timeRange);

      // Assert
      expect(mockAnalyticsPort.exportAnalyticsData).toHaveBeenCalledWith(
        userId,
        timeRange,
        "JSON",
      );

      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("json"),
        expect.stringContaining(JSON.stringify(mockExportData, null, 2)),
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          filename: expect.stringContaining(".json"),
          downloadUrl: "https://example.com/download/file-456.json",
          format: "JSON",
        }),
      );
    });

    it("should pretty-print JSON with proper formatting", async () => {
      // Arrange
      const userId = "user-789";
      const timeRange: TimeRange = "30D";

      const mockData: AnalyticsExportData = {
        userId,
        exportType: "JSON",
        timeRange,
        data: [],
        metadata: {
          exportedAt: "2025-01-13T10:00:00Z",
          totalRecords: 0,
          dateRange: {
            startDate: "2024-12-14",
            endDate: "2025-01-13",
          },
        },
      };

      mockAnalyticsPort.exportAnalyticsData.mockResolvedValue(mockData);
      mockFileSystem.writeFile.mockResolvedValue("pretty-file.json");

      // Act
      await exportService.exportToJSON(userId, timeRange);

      // Assert
      const writeCallArgs = mockFileSystem.writeFile.mock.calls[0];
      const jsonContent = writeCallArgs[1];
      
      // Verify JSON is properly formatted with indentation
      expect(jsonContent).toContain("{\n  ");
      expect(jsonContent).toContain("\n}");
    });
  });

  describe("generateFilename", () => {
    it("should generate unique filenames with proper format", async () => {
      // Arrange
      const userId = "user-123";
      const timeRange: TimeRange = "30D";
      const format = "CSV";

      // Mock Date to ensure consistent timestamps
      const mockDate = new Date("2025-01-13T10:30:45.123Z");
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      // Act
      const filename1 = await exportService.generateFilename(userId, timeRange, format);
      
      // Advance time by 1ms to ensure uniqueness
      vi.advanceTimersByTime(1);
      
      const filename2 = await exportService.generateFilename(userId, timeRange, format);

      // Restore timers
      vi.useRealTimers();

      // Assert
      expect(filename1).toMatch(/^90hard_analytics_user-123_30D_\d{8}_\d{6}_\d{3}\.csv$/);
      expect(filename2).toMatch(/^90hard_analytics_user-123_30D_\d{8}_\d{6}_\d{3}\.csv$/);
      expect(filename1).not.toBe(filename2); // Should be unique
    });

    it("should handle different formats correctly", async () => {
      // Arrange
      const userId = "user-test";
      const timeRange: TimeRange = "ALL";

      // Mock Date for consistency
      const mockDate = new Date("2025-01-13T10:30:45.123Z");
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      // Act
      const csvFilename = await exportService.generateFilename(userId, timeRange, "CSV");
      const jsonFilename = await exportService.generateFilename(userId, timeRange, "JSON");

      // Restore timers
      vi.useRealTimers();

      // Assert
      expect(csvFilename).toMatch(/\.csv$/);
      expect(jsonFilename).toMatch(/\.json$/);
      expect(csvFilename).toContain("ALL");
      expect(jsonFilename).toContain("ALL");
    });
  });

  describe("validateExportData", () => {
    it("should validate export data structure", async () => {
      // Arrange
      const validData: AnalyticsExportData = {
        userId: "user-123",
        exportType: "CSV",
        timeRange: "7D",
        data: [
          {
            date: "2025-01-13",
            workout1: true,
            workout2: false,
            diet: true,
            water: true,
            reading: false,
            photo: true,
            completionPercentage: 67,
            totalTasks: 6,
            completedTasks: 4,
          },
        ],
        metadata: {
          exportedAt: "2025-01-13T10:00:00Z",
          totalRecords: 1,
          dateRange: {
            startDate: "2025-01-07",
            endDate: "2025-01-13",
          },
        },
      };

      // Act
      const isValid = await exportService.validateExportData(validData);

      // Assert
      expect(isValid).toBe(true);
    });

    it("should reject invalid export data", async () => {
      // Arrange
      const invalidData = {
        userId: "user-123",
        // Missing required fields
        data: [],
      };

      // Act
      const isValid = await exportService.validateExportData(invalidData as any);

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should handle file system errors gracefully", async () => {
      // Arrange
      const userId = "user-123";
      const timeRange: TimeRange = "7D";

      const mockData: AnalyticsExportData = {
        userId,
        exportType: "CSV",
        timeRange,
        data: [],
        metadata: {
          exportedAt: "2025-01-13T10:00:00Z",
          totalRecords: 0,
          dateRange: { startDate: "2025-01-07", endDate: "2025-01-13" },
        },
      };

      mockAnalyticsPort.exportAnalyticsData.mockResolvedValue(mockData);
      mockFileSystem.writeFile.mockRejectedValue(new Error("Disk full"));

      // Act & Assert
      await expect(exportService.exportToCSV(userId, timeRange)).rejects.toThrow("Export failed");
    });

    it("should handle analytics port errors", async () => {
      // Arrange
      const userId = "user-123";
      const timeRange: TimeRange = "30D";

      mockAnalyticsPort.exportAnalyticsData.mockRejectedValue(new Error("Database error"));

      // Act & Assert
      await expect(exportService.exportToJSON(userId, timeRange)).rejects.toThrow("Export failed");
    });
  });

  describe("batch export", () => {
    it("should support exporting multiple users", async () => {
      // Arrange
      const userIds = ["user-1", "user-2", "user-3"];
      const timeRange: TimeRange = "30D";
      const format = "CSV";

      const mockData: AnalyticsExportData = {
        userId: "batch",
        exportType: "CSV",
        timeRange,
        data: [],
        metadata: {
          exportedAt: "2025-01-13T10:00:00Z",
          totalRecords: 0,
          dateRange: { startDate: "2024-12-14", endDate: "2025-01-13" },
        },
      };

      mockAnalyticsPort.exportAnalyticsData.mockResolvedValue(mockData);
      mockFileSystem.writeFile.mockResolvedValue("batch-export.csv");
      mockFileSystem.generateDownloadUrl.mockResolvedValue("https://example.com/batch-export.csv");

      // Act
      const result = await exportService.batchExport(userIds, timeRange, format);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          exportCount: 3,
          filename: expect.stringContaining("batch"),
          downloadUrl: expect.stringContaining("batch-export.csv"),
        }),
      );

      expect(mockAnalyticsPort.exportAnalyticsData).toHaveBeenCalledTimes(3);
    });
  });
});