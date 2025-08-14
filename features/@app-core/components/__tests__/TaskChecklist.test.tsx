import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DayLog, TaskId } from '../../../../packages/domain/src/types';
import { fireEvent, render, screen } from '../../../../test/test-utils';
import { TaskChecklist } from '../TaskChecklist.web';

describe('TaskChecklist', () => {
  const mockOnToggleTask = vi.fn();
  const mockDayLog: DayLog = {
    id: 'test-log',
    userId: 'user-123',
    date: '2025-01-13',
    tasks: {
      workout1: false,
      workout2: false,
      diet: false,
      water: false,
      reading: false,
      photo: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all six tasks', () => {
    render(
      <TaskChecklist dayLog={mockDayLog} onToggleTask={mockOnToggleTask} />
    );

    expect(screen.getByText('Workout 1')).toBeInTheDocument();
    expect(screen.getByText('Workout 2')).toBeInTheDocument();
    expect(screen.getByText('Diet')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
    expect(screen.getByText('Photo')).toBeInTheDocument();
  });

  it('should show unchecked tasks correctly', () => {
    render(
      <TaskChecklist dayLog={mockDayLog} onToggleTask={mockOnToggleTask} />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(6);

    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('should show checked tasks correctly', () => {
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
      <TaskChecklist
        dayLog={dayLogWithCheckedTasks}
        onToggleTask={mockOnToggleTask}
      />
    );

    expect(screen.getByLabelText('Workout 1')).toBeChecked();
    expect(screen.getByLabelText('Workout 2')).not.toBeChecked();
    expect(screen.getByLabelText('Diet')).toBeChecked();
    expect(screen.getByLabelText('Water')).toBeChecked();
    expect(screen.getByLabelText('Reading')).not.toBeChecked();
    expect(screen.getByLabelText('Photo')).not.toBeChecked();
  });

  it('should call onToggleTask when a checkbox is clicked', () => {
    render(
      <TaskChecklist dayLog={mockDayLog} onToggleTask={mockOnToggleTask} />
    );

    const workout1Checkbox = screen.getByLabelText('Workout 1');
    fireEvent.click(workout1Checkbox);

    expect(mockOnToggleTask).toHaveBeenCalledWith('workout1');
    expect(mockOnToggleTask).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple task toggles', () => {
    render(
      <TaskChecklist dayLog={mockDayLog} onToggleTask={mockOnToggleTask} />
    );

    const tasks: TaskId[] = ['workout1', 'diet', 'water'];

    tasks.forEach((taskId) => {
      const checkbox = screen.getByLabelText(
        taskId === 'workout1'
          ? 'Workout 1'
          : taskId === 'diet'
            ? 'Diet'
            : 'Water'
      );
      fireEvent.click(checkbox);
    });

    expect(mockOnToggleTask).toHaveBeenCalledTimes(3);
    expect(mockOnToggleTask).toHaveBeenNthCalledWith(1, 'workout1');
    expect(mockOnToggleTask).toHaveBeenNthCalledWith(2, 'diet');
    expect(mockOnToggleTask).toHaveBeenNthCalledWith(3, 'water');
  });

  it('should display loading state when no dayLog is provided', () => {
    render(<TaskChecklist dayLog={null} onToggleTask={mockOnToggleTask} />);

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('should disable interaction when in loading state', () => {
    render(
      <TaskChecklist
        dayLog={mockDayLog}
        loading={true}
        onToggleTask={mockOnToggleTask}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('should show completion percentage', () => {
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
      <TaskChecklist
        dayLog={partiallyCompletedLog}
        onToggleTask={mockOnToggleTask}
      />
    );

    expect(screen.getByText('50% Complete')).toBeInTheDocument();
  });

  it('should show celebration when all tasks are complete', () => {
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
      <TaskChecklist dayLog={completedLog} onToggleTask={mockOnToggleTask} />
    );

    expect(screen.getByText('100% Complete')).toBeInTheDocument();
    expect(screen.getByText('🎉 All tasks completed!')).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    render(
      <TaskChecklist dayLog={mockDayLog} onToggleTask={mockOnToggleTask} />
    );

    const firstCheckbox = screen.getByLabelText('Workout 1');
    firstCheckbox.focus();
    expect(document.activeElement).toBe(firstCheckbox);

    // Simulate spacebar press
    fireEvent.keyDown(firstCheckbox, { key: ' ', code: 'Space' });
    expect(mockOnToggleTask).toHaveBeenCalledWith('workout1');
  });
});
