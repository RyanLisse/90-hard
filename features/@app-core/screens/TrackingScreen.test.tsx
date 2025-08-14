import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Set up mocks before imports
vi.mock("../components/HeatmapView", () => {
  const React = require("react");
  return {
    HeatmapView: ({ logs, onDateClick }) =>
      React.createElement("div", {
        "data-testid": "heatmap-view",
        onClick: () => onDateClick?.("2024-01-01"),
        children: `HeatmapView with ${logs?.length || 0} logs`,
      }),
  };
});

vi.mock("../components/TaskChecklist.web", () => {
  const React = require("react");
  return {
    TaskChecklist: ({ dayLog, loading, onToggleTask }) =>
      React.createElement("div", {
        "data-testid": "task-checklist",
        "data-loading": loading,
        children: loading
          ? "Loading tasks..."
          : React.createElement("div", {}, [
              React.createElement(
                "div",
                { key: "title" },
                `Tasks for ${dayLog?.date || "no date"}`,
              ),
              React.createElement(
                "button",
                {
                  key: "button",
                  onClick: () => onToggleTask?.("workout1"),
                },
                "Toggle Workout1",
              ),
            ]),
      }),
  };
});

vi.mock("../hooks/useTrackingSync", () => ({
  useTrackingSync: vi.fn(),
  useTrackingRange: vi.fn(),
}));

vi.mock("../utils/heatmap", () => ({
  getDateRange: vi.fn(() => [
    new Date("2024-01-01"),
    new Date("2024-01-02"),
    new Date("2024-01-03"),
  ]),
}));

// Import after mocks are set up
import { TrackingScreen } from "./TrackingScreen";
import type { DayLog } from "../../../packages/domain/src/types";

// Mock dependencies
const mockToggleTask = vi.fn();
const mockHandleDateClick = vi.fn();

// Mock console.log to test handleDateClick
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

describe("TrackingScreen", () => {
  const mockDayLog: DayLog = {
    id: "log-1",
    date: "2024-01-15",
    userId: "user-123",
    tasks: {
      workout1: true,
      workout2: false,
      diet: true,
      water: true,
      reading: false,
      photo: true,
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  };

  const mockLogs: DayLog[] = [
    {
      ...mockDayLog,
      date: "2024-01-01",
      tasks: {
        workout1: true,
        workout2: true,
        diet: true,
        water: true,
        reading: true,
        photo: true,
      },
    },
    {
      ...mockDayLog,
      date: "2024-01-02",
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
      ...mockDayLog,
      date: "2024-01-03",
      tasks: {
        workout1: false,
        workout2: false,
        diet: false,
        water: false,
        reading: false,
        photo: false,
      },
    },
  ];

  const defaultProps = {
    userId: "user-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock current date
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T10:00:00Z"));

    // Default successful hook returns
    const {
      useTrackingSync,
      useTrackingRange,
    } = require("../hooks/useTrackingSync");

    useTrackingSync.mockReturnValue({
      dayLog: mockDayLog,
      isLoading: false,
      error: null,
      toggleTask: mockToggleTask,
    });

    useTrackingRange.mockReturnValue({
      logs: mockLogs,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Component Rendering", () => {
    it("should render the tracking screen with all components", () => {
      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("75 Hard Tracker")).toBeInTheDocument();
      expect(
        screen.getByText("Track your daily progress and build lasting habits"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("task-checklist")).toBeInTheDocument();
      expect(screen.getByTestId("heatmap-view")).toBeInTheDocument();
    });

    it("should render stats summary cards", () => {
      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("Current Streak")).toBeInTheDocument();
      expect(screen.getByText("Total Completed")).toBeInTheDocument();
      expect(screen.getByText("Completion Rate")).toBeInTheDocument();
    });

    it("should calculate and display correct completion stats", () => {
      render(<TrackingScreen {...defaultProps} />);

      // Should show 1 perfect day (only first log has all tasks completed)
      expect(screen.getByText("1 days")).toBeInTheDocument();

      // Should show 33% completion rate (1 perfect day out of 3 total days)
      expect(screen.getByText("33%")).toBeInTheDocument();
    });

    it("should display current streak as 0 days", () => {
      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("0 days")).toBeInTheDocument();
    });
  });

  describe("Data Loading States", () => {
    it("should show loading state for task checklist", () => {
      const { useTrackingSync } = require("../hooks/useTrackingSync");
      useTrackingSync.mockReturnValue({
        dayLog: null,
        isLoading: true,
        error: null,
        toggleTask: mockToggleTask,
      });

      render(<TrackingScreen {...defaultProps} />);

      const taskChecklist = screen.getByTestId("task-checklist");
      expect(taskChecklist).toHaveAttribute("data-loading", "true");
      expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
    });

    it("should show loading state for heatmap", () => {
      const { useTrackingRange } = require("../hooks/useTrackingRange");
      useTrackingRange.mockReturnValue({
        logs: [],
        isLoading: true,
        error: null,
      });

      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("Loading progress data...")).toBeInTheDocument();
      expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument(); // Loading spinner
    });

    it("should pass correct props to TaskChecklist", () => {
      render(<TrackingScreen {...defaultProps} />);

      const taskChecklist = screen.getByTestId("task-checklist");
      expect(taskChecklist).toHaveAttribute("data-loading", "false");
      expect(screen.getByText("Tasks for 2024-01-15")).toBeInTheDocument();
    });

    it("should pass correct props to HeatmapView", () => {
      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("HeatmapView with 3 logs")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should display error for day loading failure", () => {
      const { useTrackingSync } = require("../hooks/useTrackingSync");
      useTrackingSync.mockReturnValue({
        dayLog: null,
        isLoading: false,
        error: new Error("Failed to load day data"),
        toggleTask: mockToggleTask,
      });

      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("Error loading data")).toBeInTheDocument();
      expect(screen.getByText("Failed to load day data")).toBeInTheDocument();
    });

    it("should display error for range loading failure", () => {
      const { useTrackingRange } = require("../hooks/useTrackingRange");
      useTrackingRange.mockReturnValue({
        logs: [],
        isLoading: false,
        error: new Error("Failed to load range data"),
      });

      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("Error loading data")).toBeInTheDocument();
      expect(screen.getByText("Failed to load range data")).toBeInTheDocument();
    });

    it("should show day error message when both errors exist", () => {
      const {
        useTrackingSync,
        useTrackingRange,
      } = require("../hooks/useTrackingSync");

      useTrackingSync.mockReturnValue({
        dayLog: null,
        isLoading: false,
        error: new Error("Day error"),
        toggleTask: mockToggleTask,
      });

      useTrackingRange.mockReturnValue({
        logs: [],
        isLoading: false,
        error: new Error("Range error"),
      });

      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("Day error")).toBeInTheDocument();
    });

    it("should apply error styling correctly", () => {
      const { useTrackingSync } = require("../hooks/useTrackingSync");
      useTrackingSync.mockReturnValue({
        dayLog: null,
        isLoading: false,
        error: new Error("Test error"),
        toggleTask: mockToggleTask,
      });

      const { container } = render(<TrackingScreen {...defaultProps} />);

      const errorContainer = container.querySelector(".border-red-200");
      expect(errorContainer).toBeInTheDocument();
    });
  });

  describe("Date Range Calculation", () => {
    it("should calculate correct date range for hooks", () => {
      const {
        useTrackingSync,
        useTrackingRange,
      } = require("../hooks/useTrackingSync");

      render(<TrackingScreen {...defaultProps} />);

      // Should call useTrackingSync with today's date
      expect(useTrackingSync).toHaveBeenCalledWith({
        userId: "user-123",
        date: "2024-01-15",
      });

      // Should call useTrackingRange with date range
      expect(useTrackingRange).toHaveBeenCalledWith({
        userId: "user-123",
        startDate: "2024-01-01",
        endDate: "2024-01-03",
      });
    });

    it("should handle different current dates", () => {
      vi.setSystemTime(new Date("2024-06-15T15:30:00Z"));

      const { useTrackingSync } = require("../hooks/useTrackingSync");

      render(<TrackingScreen {...defaultProps} />);

      expect(useTrackingSync).toHaveBeenCalledWith({
        userId: "user-123",
        date: "2024-06-15",
      });
    });
  });

  describe("User Interactions", () => {
    it("should handle task toggle from TaskChecklist", () => {
      render(<TrackingScreen {...defaultProps} />);

      const toggleButton = screen.getByText("Toggle Workout1");
      toggleButton.click();

      expect(mockToggleTask).toHaveBeenCalledWith("workout1");
    });

    it("should handle date click from HeatmapView", () => {
      render(<TrackingScreen {...defaultProps} />);

      const heatmapView = screen.getByTestId("heatmap-view");
      heatmapView.click();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "Date clicked:",
        "2024-01-01",
      );
    });
  });

  describe("Stats Calculations", () => {
    it("should handle empty logs array", () => {
      const { useTrackingRange } = require("../hooks/useTrackingRange");
      useTrackingRange.mockReturnValue({
        logs: [],
        isLoading: false,
        error: null,
      });

      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("0 days")).toBeInTheDocument(); // Total completed
      expect(screen.getByText("0%")).toBeInTheDocument(); // Completion rate
    });

    it("should calculate stats for all perfect days", () => {
      const perfectLogs = mockLogs.map((log) => ({
        ...log,
        tasks: {
          workout1: true,
          workout2: true,
          diet: true,
          water: true,
          reading: true,
          photo: true,
        },
      }));

      const { useTrackingRange } = require("../hooks/useTrackingRange");
      useTrackingRange.mockReturnValue({
        logs: perfectLogs,
        isLoading: false,
        error: null,
      });

      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("3 days")).toBeInTheDocument(); // All 3 days completed
      expect(screen.getByText("100%")).toBeInTheDocument(); // 100% completion rate
    });

    it("should calculate stats for no perfect days", () => {
      const incompleteLogs = mockLogs.map((log) => ({
        ...log,
        tasks: {
          workout1: true,
          workout2: false,
          diet: true,
          water: false,
          reading: false,
          photo: false,
        },
      }));

      const { useTrackingRange } = require("../hooks/useTrackingRange");
      useTrackingRange.mockReturnValue({
        logs: incompleteLogs,
        isLoading: false,
        error: null,
      });

      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("0 days")).toBeInTheDocument(); // No perfect days
      expect(screen.getByText("0%")).toBeInTheDocument(); // 0% completion rate
    });
  });

  describe("Responsive Design", () => {
    it("should apply responsive grid classes", () => {
      const { container } = render(<TrackingScreen {...defaultProps} />);

      const statsGrid = container.querySelector(
        ".grid-cols-1.md\\:grid-cols-3",
      );
      expect(statsGrid).toBeInTheDocument();
    });

    it("should apply dark mode classes", () => {
      const { container } = render(<TrackingScreen {...defaultProps} />);

      const darkElements = container.querySelectorAll(
        ".dark\\:bg-gray-950, .dark\\:bg-gray-900, .dark\\:text-white",
      );
      expect(darkElements.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle null dayLog gracefully", () => {
      const { useTrackingSync } = require("../hooks/useTrackingSync");
      useTrackingSync.mockReturnValue({
        dayLog: null,
        isLoading: false,
        error: null,
        toggleTask: mockToggleTask,
      });

      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("Tasks for no date")).toBeInTheDocument();
    });

    it("should handle logs with malformed tasks", () => {
      const malformedLogs = [
        { ...mockDayLog, tasks: null },
        { ...mockDayLog, tasks: undefined },
        { ...mockDayLog, tasks: "invalid" },
      ] as any[];

      const { useTrackingRange } = require("../hooks/useTrackingRange");
      useTrackingRange.mockReturnValue({
        logs: malformedLogs,
        isLoading: false,
        error: null,
      });

      expect(() => {
        render(<TrackingScreen {...defaultProps} />);
      }).not.toThrow();
    });

    it("should handle very large numbers of logs", () => {
      const largeLogs = Array.from({ length: 1000 }, (_, i) => ({
        ...mockDayLog,
        id: `log-${i}`,
        date: `2024-01-${(i % 31) + 1}`,
        tasks: {
          workout1: true,
          workout2: true,
          diet: true,
          water: true,
          reading: true,
          photo: true,
        },
      }));

      const { useTrackingRange } = require("../hooks/useTrackingRange");
      useTrackingRange.mockReturnValue({
        logs: largeLogs,
        isLoading: false,
        error: null,
      });

      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("1000 days")).toBeInTheDocument();
      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<TrackingScreen {...defaultProps} />);

      const mainHeading = screen.getByRole("heading", { level: 1 });
      expect(mainHeading).toHaveTextContent("75 Hard Tracker");

      const subHeadings = screen.getAllByRole("heading", { level: 3 });
      expect(subHeadings).toHaveLength(3);
      expect(subHeadings[0]).toHaveTextContent("Current Streak");
      expect(subHeadings[1]).toHaveTextContent("Total Completed");
      expect(subHeadings[2]).toHaveTextContent("Completion Rate");
    });

    it("should have descriptive text for screen readers", () => {
      render(<TrackingScreen {...defaultProps} />);

      expect(
        screen.getByText("Track your daily progress and build lasting habits"),
      ).toBeInTheDocument();
    });

    it("should handle loading states accessibly", () => {
      const { useTrackingRange } = require("../hooks/useTrackingRange");
      useTrackingRange.mockReturnValue({
        logs: [],
        isLoading: true,
        error: null,
      });

      render(<TrackingScreen {...defaultProps} />);

      expect(screen.getByText("Loading progress data...")).toBeInTheDocument();
    });
  });
});
