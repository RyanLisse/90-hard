import type { AnalyticsPort } from "./analytics.port";
import type {
  AnalyticsExportData,
  TimeRange,
  TaskCompletionData,
} from "./analytics.types";

export interface FileSystemAdapter {
  writeFile(filename: string, content: string): Promise<string>;
  createBlob(content: string, mimeType: string): Promise<Blob>;
  generateDownloadUrl(fileId: string): Promise<string>;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  downloadUrl: string;
  format: "CSV" | "JSON";
  metadata: AnalyticsExportData["metadata"];
  size?: number;
}

export interface BatchExportResult {
  success: boolean;
  exportCount: number;
  filename: string;
  downloadUrl: string;
  format: "CSV" | "JSON";
  metadata: {
    exportedAt: string;
    totalUsers: number;
    timeRange: TimeRange;
  };
}

export interface ExportOptions {
  includeMetadata?: boolean;
  includeHeaders?: boolean;
  dateFormat?: "iso" | "readable";
  delimiter?: string; // For CSV
}

export class ExportService {
  constructor(
    private readonly analyticsPort: AnalyticsPort,
    private readonly fileSystem: FileSystemAdapter,
  ) {}

  async exportToCSV(
    userId: string,
    timeRange: TimeRange,
    options: ExportOptions = {},
  ): Promise<ExportResult> {
    try {
      const exportData = await this.analyticsPort.exportAnalyticsData(
        userId,
        timeRange,
        "CSV",
      );

      if (!this.validateExportData(exportData)) {
        throw new Error("Invalid export data received");
      }

      const csvContent = this.formatAsCSV(exportData, options);
      const filename = await this.generateFilename(userId, timeRange, "CSV");
      const fileId = await this.fileSystem.writeFile(filename, csvContent);
      const downloadUrl = await this.fileSystem.generateDownloadUrl(fileId);

      return {
        success: true,
        filename,
        downloadUrl,
        format: "CSV",
        metadata: exportData.metadata,
        size: csvContent.length,
      };
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  async exportToJSON(
    userId: string,
    timeRange: TimeRange,
    options: ExportOptions = {},
  ): Promise<ExportResult> {
    try {
      const exportData = await this.analyticsPort.exportAnalyticsData(
        userId,
        timeRange,
        "JSON",
      );

      if (!this.validateExportData(exportData)) {
        throw new Error("Invalid export data received");
      }

      const jsonContent = this.formatAsJSON(exportData, options);
      const filename = await this.generateFilename(userId, timeRange, "JSON");
      const fileId = await this.fileSystem.writeFile(filename, jsonContent);
      const downloadUrl = await this.fileSystem.generateDownloadUrl(fileId);

      return {
        success: true,
        filename,
        downloadUrl,
        format: "JSON",
        metadata: exportData.metadata,
        size: jsonContent.length,
      };
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  async batchExport(
    userIds: string[],
    timeRange: TimeRange,
    format: "CSV" | "JSON",
    options: ExportOptions = {},
  ): Promise<BatchExportResult> {
    try {
      const allData: AnalyticsExportData[] = [];

      // Collect data from all users
      for (const userId of userIds) {
        const userData = await this.analyticsPort.exportAnalyticsData(
          userId,
          timeRange,
          format,
        );
        allData.push(userData);
      }

      // Combine all data
      const combinedData: AnalyticsExportData = {
        userId: "batch",
        exportType: format,
        timeRange,
        data: allData.flatMap((d) => d.data),
        metadata: {
          exportedAt: new Date().toISOString(),
          totalRecords: allData.reduce((sum, d) => sum + d.data.length, 0),
          dateRange: {
            startDate: Math.min(
              ...allData.map((d) => d.metadata.dateRange.startDate),
            ),
            endDate: Math.max(
              ...allData.map((d) => d.metadata.dateRange.endDate),
            ),
          },
        },
      };

      const content =
        format === "CSV"
          ? this.formatAsCSV(combinedData, options)
          : this.formatAsJSON(combinedData, options);

      const filename = await this.generateBatchFilename(
        userIds.length,
        timeRange,
        format,
      );
      const fileId = await this.fileSystem.writeFile(filename, content);
      const downloadUrl = await this.fileSystem.generateDownloadUrl(fileId);

      return {
        success: true,
        exportCount: userIds.length,
        filename,
        downloadUrl,
        format,
        metadata: {
          exportedAt: new Date().toISOString(),
          totalUsers: userIds.length,
          timeRange,
        },
      };
    } catch (error) {
      throw new Error(`Batch export failed: ${error.message}`);
    }
  }

  async generateFilename(
    userId: string,
    timeRange: TimeRange,
    format: "CSV" | "JSON",
  ): Promise<string> {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\..+/, "")
      .replace("T", "_");

    // Add milliseconds for uniqueness in tests
    const ms = Date.now().toString().slice(-3);
    const extension = format.toLowerCase();
    return `90hard_analytics_${userId}_${timeRange}_${timestamp}_${ms}.${extension}`;
  }

  async validateExportData(data: any): Promise<boolean> {
    if (!data || typeof data !== "object") return false;

    const required = ["userId", "exportType", "timeRange", "data", "metadata"];
    return required.every((field) => field in data);
  }

  private formatAsCSV(
    exportData: AnalyticsExportData,
    options: ExportOptions,
  ): string {
    const {
      includeMetadata = false,
      includeHeaders = true,
      delimiter = ",",
      dateFormat = "iso",
    } = options;

    let csv = "";

    // Add metadata as comments if requested
    if (includeMetadata) {
      csv += "# Export Metadata\n";
      csv += `# User ID: ${exportData.userId}\n`;
      csv += `# Time Range: ${exportData.timeRange}\n`;
      csv += `# Exported At: ${exportData.metadata.exportedAt}\n`;
      csv += `# Total Records: ${exportData.metadata.totalRecords}\n`;
      csv += `# Date Range: ${exportData.metadata.dateRange.startDate} to ${exportData.metadata.dateRange.endDate}\n`;
      csv += "#\n";
    }

    // Add headers
    if (includeHeaders) {
      const headers = [
        "Date",
        "Workout1",
        "Workout2",
        "Diet",
        "Water",
        "Reading",
        "Photo",
        "Completion%",
        "Completed Tasks",
      ];
      csv += headers.join(delimiter) + "\n";
    }

    // Add data rows
    for (const row of exportData.data) {
      const formattedDate =
        dateFormat === "readable"
          ? new Date(row.date).toLocaleDateString()
          : row.date;

      const values = [
        formattedDate,
        row.workout1 ? "1" : "0",
        row.workout2 ? "1" : "0",
        row.diet ? "1" : "0",
        row.water ? "1" : "0",
        row.reading ? "1" : "0",
        row.photo ? "1" : "0",
        row.completionPercentage.toString(),
        row.completedTasks.toString(),
      ];

      csv += values.join(delimiter) + "\n";
    }

    return csv;
  }

  private formatAsJSON(
    exportData: AnalyticsExportData,
    options: ExportOptions,
  ): string {
    // Create a clean copy for export
    const exportObject = {
      ...exportData,
      data: exportData.data.map((row) => ({
        ...row,
        date:
          options.dateFormat === "readable"
            ? new Date(row.date).toLocaleDateString()
            : row.date,
      })),
    };

    return JSON.stringify(exportObject, null, 2);
  }

  private async generateBatchFilename(
    userCount: number,
    timeRange: TimeRange,
    format: "CSV" | "JSON",
  ): Promise<string> {
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\..+/, "")
      .replace("T", "_");

    const extension = format.toLowerCase();
    return `90hard_batch_${userCount}users_${timeRange}_${timestamp}.${extension}`;
  }
}

// Default file system adapter for browser environments
export class BrowserFileSystemAdapter implements FileSystemAdapter {
  async writeFile(filename: string, content: string): Promise<string> {
    // In browser environment, we'll return the filename as the file ID
    // The actual file creation will be handled by the download mechanism
    return filename;
  }

  async createBlob(content: string, mimeType: string): Promise<Blob> {
    return new Blob([content], { type: mimeType });
  }

  async generateDownloadUrl(fileId: string): Promise<string> {
    // In browser environment, this would typically create a blob URL
    // For now, return a placeholder URL
    return `blob:${window.location.origin}/${fileId}`;
  }
}

// Node.js file system adapter
export class NodeFileSystemAdapter implements FileSystemAdapter {
  private uploadDirectory: string;

  constructor(uploadDirectory = "./uploads") {
    this.uploadDirectory = uploadDirectory;
  }

  async writeFile(filename: string, content: string): Promise<string> {
    // In Node.js environment, write to actual file system
    const fs = await import("fs/promises");
    const path = await import("path");

    const fullPath = path.join(this.uploadDirectory, filename);
    await fs.writeFile(fullPath, content, "utf8");

    return filename;
  }

  async createBlob(content: string, mimeType: string): Promise<Blob> {
    // Node.js doesn't have Blob, so we'll create a buffer-based substitute
    return new Blob([content], { type: mimeType });
  }

  async generateDownloadUrl(fileId: string): Promise<string> {
    // Generate a download URL for the uploaded file
    return `/api/downloads/${fileId}`;
  }
}

// Export utility functions
export function formatTaskCompletionForExport(
  data: TaskCompletionData[],
  format: "CSV" | "JSON",
): string {
  if (format === "CSV") {
    let csv = "Date,Workout1,Workout2,Diet,Water,Reading,Photo,Completion%\n";

    for (const row of data) {
      csv +=
        [
          row.date,
          row.workout1 ? "1" : "0",
          row.workout2 ? "1" : "0",
          row.diet ? "1" : "0",
          row.water ? "1" : "0",
          row.reading ? "1" : "0",
          row.photo ? "1" : "0",
          row.completionPercentage,
        ].join(",") + "\n";
    }

    return csv;
  }

  return JSON.stringify(data, null, 2);
}

export function validateExportFormat(format: string): format is "CSV" | "JSON" {
  return format === "CSV" || format === "JSON";
}

export function calculateExportSize(
  data: AnalyticsExportData,
  format: "CSV" | "JSON",
): number {
  const content =
    format === "CSV"
      ? formatTaskCompletionForExport(data.data, "CSV")
      : JSON.stringify(data, null, 2);

  return new Blob([content]).size;
}
