import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InstantDBClient } from "../types/instantdb.types";
import { AnalyticsPort } from "./analytics.port";
import type {
  TimeRange,
  TaskCompletionData,
  PeriodStats,
} from "./analytics.types";

describe("AnalyticsPort", () => {
  let instantDBClient: InstantDBClient;
  let analyticsPort: AnalyticsPort;
  let mockTrackingPort: any;
  let mockWeightPort: any;
  let mockFastingPort: any;

  beforeEach(() => {
    instantDBClient = {
      query: vi.fn(),
      createDayLog: vi.fn(),
      updateDayLog: vi.fn(),
      createWeightEntry: vi.fn(),
      updateWeightEntry: vi.fn(),
      deleteWeightEntry: vi.fn(),
      createWeightGoal: vi.fn(),
      updateWeightGoal: vi.fn(),
      createFastingEntry: vi.fn(),
      updateFastingEntry: vi.fn(),
      deleteFastingEntry: vi.fn(),
      transact: vi.fn(),
    };

    // Mock collaborating ports
    mockTrackingPort = {
      getDateRange: vi.fn(),
      getDayLog: vi.fn(),
    };

    mockWeightPort = {
      getWeightHistory: vi.fn(),
      getWeightStats: vi.fn(),
    };

    mockFastingPort = {
      getFastingHistory: vi.fn(),
      getFastingStats: vi.fn(),
    };

    analyticsPort = new AnalyticsPort(
      instantDBClient,
      mockTrackingPort,
      mockWeightPort,
      mockFastingPort,
    );
  });

  describe("getUserAnalytics", () => {
    it("should aggregate user data from all domains for 7D range", async () => {
      // Arrange
      const userId = "user-123";
      const timeRange: TimeRange = "7D";

      const mockTrackingData = [
        {
          id: "log-1",
          userId,
          date: "2025-01-13",
          tasks: {
            workout1: true,
            workout2: false,
            diet: true,
            water: true,
            reading: false,
            photo: true,
          },
        },
        {
          id: "log-2",
          userId,
          date: "2025-01-12",
          tasks: {
            workout1: true,
            workout2: true,
            diet: true,
            water: true,
            reading: true,
            photo: true,
          },
        },
      ];

      mockTrackingPort.getDateRange.mockResolvedValue(mockTrackingData);

      // Act
      const result = await analyticsPort.getUserAnalytics(userId, timeRange);

      // Assert
      expect(mockTrackingPort.getDateRange).toHaveBeenCalledWith(
        expect.stringMatching(/2025-01-\d{2}/), // startDate
        "2025-01-13", // endDate (today)
        userId,
      );

      expect(result).toEqual(
        expect.objectContaining({
          userId,
          timeRange,
          periodStats: expect.objectContaining({
            totalDays: 7,
            activeDays: 2,
            averageCompletion: expect.any(Number),
            perfectDays: 1, // Only log-2 is perfect
            currentStreak: expect.any(Number),
            taskBreakdown: expect.objectContaining({
              workout1: 2,
              workout2: 1,
              diet: 2,
              water: 2,
              reading: 1,
              photo: 2,
            }),
          }),
          completionTrend: expect.objectContaining({
            points: expect.any(Array),
            trend: expect.stringMatching(/up|down|stable/),
            trendPercentage: expect.any(Number),
          }),
          insights: expect.any(Array),
        }),
      );
    });

    it("should handle empty tracking data gracefully", async () => {
      // Arrange
      const userId = "user-123";
      const timeRange: TimeRange = "30D";

      mockTrackingPort.getDateRange.mockResolvedValue([]);

      // Act
      const result = await analyticsPort.getUserAnalytics(userId, timeRange);

      // Assert
      expect(result.periodStats).toEqual({
        totalDays: 30,
        activeDays: 0,
        averageCompletion: 0,
        perfectDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        taskBreakdown: {
          workout1: 0,
          workout2: 0,
          diet: 0,
          water: 0,
          reading: 0,
          photo: 0,
        },
      });
    });
  });

  describe("calculatePeriodStats", () => {
    it("should calculate statistics for given completion data", async () => {
      // Arrange
      const completionData: TaskCompletionData[] = [
        {
          date: "2025-01-10",
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
        {
          date: "2025-01-11",
          workout1: true,
          workout2: false,
          diet: true,
          water: false,
          reading: true,
          photo: false,
          completionPercentage: 50,
          totalTasks: 6,
          completedTasks: 3,
        },
        {
          date: "2025-01-12",
          workout1: false,
          workout2: false,
          diet: false,
          water: false,
          reading: false,
          photo: false,
          completionPercentage: 0,
          totalTasks: 6,
          completedTasks: 0,
        },
      ];

      // Act
      const stats = await analyticsPort.calculatePeriodStats(
        completionData,
        7, // totalDays
      );

      // Assert
      expect(stats).toEqual({
        totalDays: 7,
        activeDays: 2, // Days with any task completion (only first two days)
        averageCompletion: 50, // (100 + 50 + 0) / 3
        perfectDays: 1, // Only first day
        currentStreak: 0, // Last day was 0%
        longestStreak: 2, // First two consecutive days
        taskBreakdown: {
          workout1: 2,
          workout2: 1,
          diet: 2,
          water: 1,
          reading: 2,
          photo: 1,
        },
      });
    });
  });

  describe("getComparisonAnalytics", () => {
    it("should compare current and previous periods", async () => {
      // Arrange
      const userId = "user-123";
      const timeRange: TimeRange = "7D";

      // Mock current period data
      const currentData = [
        {
          id: "log-1",
          userId,
          date: "2025-01-13",
          tasks: {
            workout1: true,
            workout2: true,
            diet: true,
            water: true,
            reading: true,
            photo: true,
          },
        },
      ];

      // Mock previous period data
      const previousData = [
        {
          id: "log-2",
          userId,
          date: "2025-01-06",
          tasks: {
            workout1: true,
            workout2: false,
            diet: true,
            water: false,
            reading: false,
            photo: false,
          },
        },
      ];

      mockTrackingPort.getDateRange
        .mockResolvedValueOnce(currentData) // Current period
        .mockResolvedValueOnce(previousData); // Previous period

      // Act
      const result = await analyticsPort.getComparisonAnalytics(
        userId,
        timeRange,
      );

      // Assert
      expect(mockTrackingPort.getDateRange).toHaveBeenCalledTimes(2);
      expect(result).toEqual(
        expect.objectContaining({
          current: expect.objectContaining({
            averageCompletion: 100,
            perfectDays: 1,
          }),
          previous: expect.objectContaining({
            averageCompletion: 33, // Actual calculated value
            perfectDays: 0,
          }),
          improvements: expect.objectContaining({
            averageCompletion: 67, // 100 - 33
            perfectDays: 1, // 1 - 0
            currentStreak: expect.any(Number),
          }),
        }),
      );
    });
  });

  describe("generateInsights", () => {
    it("should generate achievement insights for perfect streaks", async () => {
      // Arrange
      const stats: PeriodStats = {
        totalDays: 7,
        activeDays: 7,
        averageCompletion: 95,
        perfectDays: 5,
        currentStreak: 5,
        longestStreak: 5,
        taskBreakdown: {
          workout1: 7,
          workout2: 6,
          diet: 7,
          water: 7,
          reading: 5,
          photo: 6,
        },
      };

      // Act
      const insights = await analyticsPort.generateInsights(stats, "7D");

      // Assert
      expect(insights).toContainEqual(
        expect.objectContaining({
          type: "achievement",
          priority: "high",
          title: expect.stringContaining("streak"),
          actionable: false,
        }),
      );
    });

    it("should generate warning insights for declining performance", async () => {
      // Arrange
      const stats: PeriodStats = {
        totalDays: 7,
        activeDays: 2,
        averageCompletion: 25,
        perfectDays: 0,
        currentStreak: 0,
        longestStreak: 1,
        taskBreakdown: {
          workout1: 1,
          workout2: 0,
          diet: 2,
          water: 1,
          reading: 0,
          photo: 1,
        },
      };

      // Act
      const insights = await analyticsPort.generateInsights(stats, "7D");

      // Assert
      expect(insights).toContainEqual(
        expect.objectContaining({
          type: "warning",
          priority: "high",
          title: "Low completion rate", // Exact match for the actual title
          actionable: true,
          actionText: expect.any(String),
        }),
      );
    });
  });

  describe("exportAnalyticsData", () => {
    it("should export data in CSV format", async () => {
      // Arrange
      const userId = "user-123";
      const timeRange: TimeRange = "30D";
      const exportType = "CSV";

      const mockData = [
        {
          id: "log-1",
          userId,
          date: "2025-01-13",
          tasks: {
            workout1: true,
            workout2: false,
            diet: true,
            water: true,
            reading: false,
            photo: true,
          },
        },
      ];

      mockTrackingPort.getDateRange.mockResolvedValue(mockData);

      // Act
      const result = await analyticsPort.exportAnalyticsData(
        userId,
        timeRange,
        exportType,
      );

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          userId,
          exportType,
          timeRange,
          data: expect.arrayContaining([
            expect.objectContaining({
              date: "2025-01-13",
              completionPercentage: expect.any(Number),
              totalTasks: 6,
              completedTasks: expect.any(Number),
            }),
          ]),
          metadata: expect.objectContaining({
            exportedAt: expect.any(String),
            totalRecords: 1,
            dateRange: expect.objectContaining({
              startDate: expect.any(String),
              endDate: expect.any(String),
            }),
          }),
        }),
      );
    });

    it("should export data in JSON format", async () => {
      // Arrange
      const userId = "user-123";
      const timeRange: TimeRange = "7D";
      const exportType = "JSON";

      mockTrackingPort.getDateRange.mockResolvedValue([]);

      // Act
      const result = await analyticsPort.exportAnalyticsData(
        userId,
        timeRange,
        exportType,
      );

      // Assert
      expect(result.exportType).toBe("JSON");
      expect(result.data).toEqual([]);
    });
  });

  describe("calculateTrend", () => {
    it("should identify upward trend in completion data", async () => {
      // Arrange
      const completionData: TaskCompletionData[] = [
        {
          date: "2025-01-10",
          workout1: false,
          workout2: false,
          diet: false,
          water: false,
          reading: false,
          photo: false,
          completionPercentage: 0,
          totalTasks: 6,
          completedTasks: 0,
        },
        {
          date: "2025-01-11",
          workout1: true,
          workout2: false,
          diet: true,
          water: false,
          reading: false,
          photo: false,
          completionPercentage: 33,
          totalTasks: 6,
          completedTasks: 2,
        },
        {
          date: "2025-01-12",
          workout1: true,
          workout2: true,
          diet: true,
          water: true,
          reading: false,
          photo: false,
          completionPercentage: 67,
          totalTasks: 6,
          completedTasks: 4,
        },
      ];

      // Act
      const trend = await analyticsPort.calculateTrend(completionData);

      // Assert
      expect(trend).toEqual(
        expect.objectContaining({
          trend: "up",
          trendPercentage: expect.any(Number),
          points: expect.arrayContaining([
            expect.objectContaining({
              date: "2025-01-10",
              value: 0,
            }),
            expect.objectContaining({
              date: "2025-01-12",
              value: 67,
            }),
          ]),
          movingAverage: expect.any(Array),
        }),
      );
    });
  });
});
