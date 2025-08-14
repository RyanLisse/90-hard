import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DayLog, TaskId } from "../../../../packages/domain/src/types";
import { fireEvent, render, screen } from "../../../../test/test-utils";
import { TaskChecklistEnhanced } from "../TaskChecklistEnhanced.web";

describe("TaskChecklistEnhanced", () => {
  const mockOnToggleTask = vi.fn();
  const mockDayLog: DayLog = {
    id: "test-log",
    userId: "user-123",
    date: "2025-01-13",
    dayNumber: 1,
    tasks: {
      workout1: false,
      workout2: false,
      diet: false,
      water: false,
      reading: false,
      photo: false,
    },
    photos: [],
    journalEntries: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all six tasks in a card layout", () => {
    render(
      <TaskChecklistEnhanced
        dayLog={mockDayLog}
        onToggleTask={mockOnToggleTask}
      />,
    );

    expect(screen.getByText("Workout 1")).toBeInTheDocument();
    expect(screen.getByText("Workout 2")).toBeInTheDocument();
    expect(screen.getByText("Diet")).toBeInTheDocument();
    expect(screen.getByText("Water")).toBeInTheDocument();
    expect(screen.getByText("Reading")).toBeInTheDocument();
    expect(screen.getByText("Photo")).toBeInTheDocument();
  });

  it("should show progress using shadcn Progress component", () => {
    render(
      <TaskChecklistEnhanced
        dayLog={mockDayLog}
        onToggleTask={mockOnToggleTask}
      />,
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("data-value", "0");
  });

  it("should use shadcn Checkbox component for tasks", () => {
    render(
      <TaskChecklistEnhanced
        dayLog={mockDayLog}
        onToggleTask={mockOnToggleTask}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(6);

    checkboxes.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute("data-state", "unchecked");
    });
  });

  it("should show checked state correctly", () => {
    const dayLogWithCheckedTasks: DayLog = {
      ...mockDayLog,
      tasks: {
        workout1: true,
        workout2: false,
        diet: true,
        water: true,
        reading: false,
        photo: false,
      },
    };

    render(
      <TaskChecklistEnhanced
        dayLog={dayLogWithCheckedTasks}
        onToggleTask={mockOnToggleTask}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toHaveAttribute("data-state", "checked"); // workout1
    expect(checkboxes[1]).toHaveAttribute("data-state", "unchecked"); // workout2
    expect(checkboxes[2]).toHaveAttribute("data-state", "checked"); // diet
    expect(checkboxes[3]).toHaveAttribute("data-state", "checked"); // water
  });

  it("should call onToggleTask when checkbox is clicked", () => {
    render(
      <TaskChecklistEnhanced
        dayLog={mockDayLog}
        onToggleTask={mockOnToggleTask}
      />,
    );

    const firstCheckbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(firstCheckbox);

    expect(mockOnToggleTask).toHaveBeenCalledWith("workout1");
    expect(mockOnToggleTask).toHaveBeenCalledTimes(1);
  });

  it("should display loading state when no dayLog is provided", () => {
    render(
      <TaskChecklistEnhanced dayLog={null} onToggleTask={mockOnToggleTask} />,
    );

    expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
  });

  it("should disable interaction when in loading state", () => {
    render(
      <TaskChecklistEnhanced
        dayLog={mockDayLog}
        loading={true}
        onToggleTask={mockOnToggleTask}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it("should show completion percentage in card header", () => {
    const partiallyCompletedLog: DayLog = {
      ...mockDayLog,
      tasks: {
        workout1: true,
        workout2: true,
        diet: true,
        water: false,
        reading: false,
        photo: false,
      },
    };

    render(
      <TaskChecklistEnhanced
        dayLog={partiallyCompletedLog}
        onToggleTask={mockOnToggleTask}
      />,
    );

    expect(screen.getByText("50% Complete")).toBeInTheDocument();
  });

  it("should show celebration badge when all tasks are complete", () => {
    const completedLog: DayLog = {
      ...mockDayLog,
      tasks: {
        workout1: true,
        workout2: true,
        diet: true,
        water: true,
        reading: true,
        photo: true,
      },
    };

    render(
      <TaskChecklistEnhanced
        dayLog={completedLog}
        onToggleTask={mockOnToggleTask}
      />,
    );

    expect(screen.getByText("100% Complete")).toBeInTheDocument();
    expect(screen.getByText("All tasks completed!")).toBeInTheDocument();
  });

  it("should be keyboard accessible", () => {
    render(
      <TaskChecklistEnhanced
        dayLog={mockDayLog}
        onToggleTask={mockOnToggleTask}
      />,
    );

    const firstCheckbox = screen.getAllByRole("checkbox")[0];
    firstCheckbox.focus();
    expect(document.activeElement).toBe(firstCheckbox);

    // Simulate spacebar press
    fireEvent.keyDown(firstCheckbox, { key: " ", code: "Space" });
    expect(mockOnToggleTask).toHaveBeenCalledWith("workout1");
  });
});
