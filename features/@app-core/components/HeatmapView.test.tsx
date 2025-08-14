import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DayLog } from '../../../packages/domain/src/types';
import { HeatmapView, type HeatmapViewProps } from './HeatmapView';

// Mock dependencies
const mockOnDateClick = vi.fn();

// Mock GitHubCalendar component
vi.mock('react-github-calendar', () => ({
  default: ({ data, renderBlock, renderTooltip, theme, blockMargin, blockRadius, blockSize, fontSize, weekStart, ...props }: any) => (
    <div 
      data-testid="github-calendar"
      {...props}
      blockmargin={blockMargin}
      blockradius={blockRadius}
      blocksize={blockSize}
      fontsize={fontSize}
      weekstart={weekStart}
    >
      {/* Render activities as blocks */}
      {data.map((activity: any, index: number) => {
        const block = {
          x: (index % 11) * 15,
          y: Math.floor(index / 11) * 15,
          width: 13,
          height: 13,
          rx: 2,
          fill: theme.light[activity.level],
        };
        return (
          <div key={activity.date} data-testid={`activity-${activity.date}`}>
            {renderBlock ? renderBlock(block, activity) : (
              <rect
                {...block}
                data-date={activity.date}
                data-count={activity.count}
                data-level={activity.level}
              />
            )}
            {/* Render tooltip if needed */}
            {renderTooltip && (
              <div data-testid={`tooltip-${activity.date}`} style={{ display: 'none' }}>
                {renderTooltip(activity)}
              </div>
            )}
          </div>
        );
      })}
      {/* Render legend */}
      <div data-testid="color-legend">
        {theme.light.map((color: string, index: number) => (
          <div
            key={index}
            data-testid={`legend-${index}`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  ),
}));

// Mock utility functions
vi.mock('../utils/heatmap', () => ({
  getColorForCompletion: (percentage: number) => {
    if (percentage === 0) return '#ebedf0';
    if (percentage <= 40) return '#9be9a8';
    if (percentage <= 80) return '#40c463';
    if (percentage < 100) return '#30a14e';
    return '#216e39';
  },
  getDateRange: () => {
    const dates = [];
    const today = new Date('2024-01-15');
    for (let i = 76; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  },
}));

// Mock computeDayCompletion
vi.mock('../../../packages/domain/src/types', () => ({
  computeDayCompletion: (log: DayLog) => {
    // Handle malformed log data gracefully
    if (!log || !log.tasks || typeof log.tasks !== 'object') {
      return 0;
    }
    const tasks = Object.values(log.tasks);
    const completed = tasks.filter(Boolean).length;
    return Math.round((completed / 6) * 100);
  },
}));

describe('HeatmapView', () => {
  const mockLogs: DayLog[] = [
    {
      date: '2024-01-01',
      tasks: {
        task1: true,
        task2: true,
        task3: true,
        task4: false,
        task5: false,
        task6: false,
      },
      photos: [],
      journalEntries: [],
      metrics: {},
    },
    {
      date: '2024-01-10',
      tasks: {
        task1: true,
        task2: true,
        task3: true,
        task4: true,
        task5: true,
        task6: true,
      },
      photos: [],
      journalEntries: [],
      metrics: {},
    },
    {
      date: '2024-01-15',
      tasks: {
        task1: false,
        task2: false,
        task3: false,
        task4: false,
        task5: false,
        task6: false,
      },
      photos: [],
      journalEntries: [],
      metrics: {},
    },
  ];

  const defaultProps: HeatmapViewProps = {
    logs: mockLogs,
    onDateClick: mockOnDateClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the heatmap container', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const container = screen.getByTestId('github-calendar').parentElement?.parentElement;
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('rounded-lg', 'bg-white', 'shadow-sm');
    });

    it('should display the title', () => {
      render(<HeatmapView {...defaultProps} />);
      
      expect(screen.getByText('77-Day Progress')).toBeInTheDocument();
      const title = screen.getByText('77-Day Progress');
      expect(title).toHaveClass('font-semibold', 'text-lg');
    });

    it('should render GitHubCalendar component', () => {
      render(<HeatmapView {...defaultProps} />);
      
      expect(screen.getByTestId('github-calendar')).toBeInTheDocument();
    });

    it('should render custom legend', () => {
      render(<HeatmapView {...defaultProps} />);
      
      expect(screen.getByText('Less')).toBeInTheDocument();
      expect(screen.getByText('More')).toBeInTheDocument();
      
      // Check legend colors
      const legendItems = screen.getAllByRole('generic').filter(el => 
        el.className.includes('h-3 w-3 rounded-sm')
      );
      expect(legendItems).toHaveLength(5);
    });
  });

  describe('Data Processing', () => {
    it('should convert logs to activity format', () => {
      render(<HeatmapView {...defaultProps} />);
      
      // Check that activities are rendered
      const activity1 = screen.getByTestId('activity-2024-01-01');
      expect(activity1).toBeInTheDocument();
      
      const activity2 = screen.getByTestId('activity-2024-01-10');
      expect(activity2).toBeInTheDocument();
    });

    it('should calculate correct completion levels', () => {
      render(<HeatmapView {...defaultProps} />);
      
      // 50% completion (3/6 tasks) = level 2
      const activity1 = within(screen.getByTestId('activity-2024-01-01'))
        .getByRole('button');
      expect(activity1).toHaveAttribute('aria-label', '2024-01-01: 50% complete');
      
      // 100% completion (6/6 tasks) = level 4
      const activity2 = within(screen.getByTestId('activity-2024-01-10'))
        .getByRole('button');
      expect(activity2).toHaveAttribute('aria-label', '2024-01-10: 100% complete');
      
      // 0% completion (0/6 tasks) = level 0
      const activity3 = within(screen.getByTestId('activity-2024-01-15'))
        .getByRole('button');
      expect(activity3).toHaveAttribute('aria-label', '2024-01-15: 0% complete');
    });

    it('should handle empty logs array', () => {
      render(<HeatmapView logs={[]} />);
      
      expect(screen.getByTestId('github-calendar')).toBeInTheDocument();
      // Should still render 77 days worth of activities
      const activities = screen.getAllByTestId(/^activity-/);
      expect(activities).toHaveLength(77);
    });

    it('should create activities for all 77 days', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const activities = screen.getAllByTestId(/^activity-/);
      expect(activities).toHaveLength(77);
    });
  });

  describe('GitHubCalendar Props', () => {
    it('should pass correct props to GitHubCalendar', () => {
      const { container } = render(<HeatmapView {...defaultProps} />);
      
      const calendar = screen.getByTestId('github-calendar');
      expect(calendar).toHaveAttribute('blockmargin', '3');
      expect(calendar).toHaveAttribute('blockradius', '2');
      expect(calendar).toHaveAttribute('blocksize', '13');
      expect(calendar).toHaveAttribute('fontsize', '12');
      expect(calendar).toHaveAttribute('weekstart', '0');
    });

    it('should use custom theme colors', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const legendColors = screen.getAllByTestId(/^legend-/);
      expect(legendColors).toHaveLength(5);
      
      // Check light theme colors
      expect(legendColors[0]).toHaveStyle({ backgroundColor: '#ebedf0' });
      expect(legendColors[1]).toHaveStyle({ backgroundColor: '#9be9a8' });
      expect(legendColors[2]).toHaveStyle({ backgroundColor: '#40c463' });
      expect(legendColors[3]).toHaveStyle({ backgroundColor: '#30a14e' });
      expect(legendColors[4]).toHaveStyle({ backgroundColor: '#216e39' });
    });
  });

  describe('Tooltip Functionality', () => {
    it('should render tooltip with date information', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const tooltip = screen.getByTestId('tooltip-2024-01-10');
      const tooltipContent = within(tooltip);
      
      // Check date formatting
      expect(tooltipContent.getByText(/January 10, 2024/)).toBeInTheDocument();
      
      // Check completion percentage
      expect(tooltipContent.getByText('100% Complete (6/6 tasks)')).toBeInTheDocument();
      
      // Check completed tasks list
      expect(tooltipContent.getByText(/Completed:/)).toBeInTheDocument();
    });

    it('should show correct task count in tooltip', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const tooltip = screen.getByTestId('tooltip-2024-01-01');
      const tooltipContent = within(tooltip);
      
      expect(tooltipContent.getByText('50% Complete (3/6 tasks)')).toBeInTheDocument();
    });

    it('should handle empty log in tooltip', () => {
      render(<HeatmapView {...defaultProps} />);
      
      // For a date without a log
      const tooltip = screen.getByTestId('tooltip-2023-12-01');
      const tooltipContent = within(tooltip);
      
      expect(tooltipContent.getByText('0% Complete (0/6 tasks)')).toBeInTheDocument();
    });

    it('should apply tooltip styling', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const tooltip = within(screen.getByTestId('tooltip-2024-01-10')).getByText(/January 10, 2024/).parentElement;
      expect(tooltip).toHaveClass('max-w-xs', 'rounded-md', 'bg-gray-900', 'p-2', 'text-sm', 'text-white');
    });
  });

  describe('Click Interactions', () => {
    it('should handle click on activity block', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const activity = within(screen.getByTestId('activity-2024-01-10'))
        .getByRole('button');
      fireEvent.click(activity);
      
      expect(mockOnDateClick).toHaveBeenCalledWith('2024-01-10');
    });

    it('should handle keyboard navigation with Enter', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const activity = within(screen.getByTestId('activity-2024-01-10'))
        .getByRole('button');
      fireEvent.keyDown(activity, { key: 'Enter' });
      
      expect(mockOnDateClick).toHaveBeenCalledWith('2024-01-10');
    });

    it('should handle keyboard navigation with Space', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const activity = within(screen.getByTestId('activity-2024-01-10'))
        .getByRole('button');
      fireEvent.keyDown(activity, { key: ' ' });
      
      expect(mockOnDateClick).toHaveBeenCalledWith('2024-01-10');
    });

    it('should not trigger click for other keys', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const activity = within(screen.getByTestId('activity-2024-01-10'))
        .getByRole('button');
      fireEvent.keyDown(activity, { key: 'Tab' });
      
      expect(mockOnDateClick).not.toHaveBeenCalled();
    });

    it('should not error when onDateClick is not provided', () => {
      render(<HeatmapView logs={mockLogs} />);
      
      const activity = within(screen.getByTestId('activity-2024-01-10'))
        .getByRole('button');
      
      // Should not throw error
      expect(() => fireEvent.click(activity)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on activity blocks', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const activities = screen.getAllByRole('button');
      activities.forEach(activity => {
        expect(activity).toHaveAttribute('aria-label');
        expect(activity.getAttribute('aria-label')).toMatch(/^\d{4}-\d{2}-\d{2}: \d+% complete$/);
      });
    });

    it('should have proper tabIndex for keyboard navigation', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const activities = screen.getAllByRole('button');
      activities.forEach(activity => {
        expect(activity).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should have hover styles on activity blocks', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const activity = within(screen.getByTestId('activity-2024-01-10'))
        .getByRole('button');
      expect(activity).toHaveClass('cursor-pointer', 'hover:stroke-2', 'hover:stroke-gray-600');
    });

    it('should have proper ARIA labels on legend items', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const legendItems = screen.getAllByRole('generic').filter(el => 
        el.getAttribute('aria-label')?.includes('Level')
      );
      
      expect(legendItems[0]).toHaveAttribute('aria-label', 'Level 0: 0%');
      expect(legendItems[1]).toHaveAttribute('aria-label', 'Level 1: 1-40%');
      expect(legendItems[2]).toHaveAttribute('aria-label', 'Level 2: 41-80%');
      expect(legendItems[3]).toHaveAttribute('aria-label', 'Level 3: 81-99%');
      expect(legendItems[4]).toHaveAttribute('aria-label', 'Level 4: 100%');
    });
  });

  describe('Responsive Design', () => {
    it('should have overflow-x-auto for horizontal scrolling', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const scrollContainer = screen.getByTestId('github-calendar').parentElement;
      expect(scrollContainer).toHaveClass('overflow-x-auto');
    });

    it('should support dark mode classes', () => {
      render(<HeatmapView {...defaultProps} />);
      
      const container = screen.getByTestId('github-calendar').parentElement?.parentElement;
      expect(container).toHaveClass('dark:bg-gray-900');
      
      const title = screen.getByText('77-Day Progress');
      expect(title).toHaveClass('dark:text-white');
      
      const legendText = screen.getByText('Less').parentElement;
      expect(legendText).toHaveClass('dark:text-gray-400');
    });
  });

  describe('Edge Cases', () => {
    it('should handle logs with dates outside the 77-day range', () => {
      const futureLogs: DayLog[] = [
        {
          date: '2024-12-31',
          tasks: {
            task1: true,
            task2: true,
            task3: true,
            task4: true,
            task5: true,
            task6: true,
          },
          photos: [],
          journalEntries: [],
          metrics: {},
        },
      ];
      
      render(<HeatmapView logs={futureLogs} onDateClick={mockOnDateClick} />);
      
      // Should still render without errors
      expect(screen.getByTestId('github-calendar')).toBeInTheDocument();
    });

    it('should handle malformed log data gracefully', () => {
      const malformedLogs: any[] = [
        {
          date: '2024-01-01',
          // Missing tasks property
        },
        {
          date: '2024-01-02',
          tasks: null, // Null tasks
        },
        {
          date: '2024-01-03',
          tasks: {}, // Empty tasks object
        },
      ];
      
      // Should not throw error
      expect(() => render(<HeatmapView logs={malformedLogs} />)).not.toThrow();
    });

    it('should handle duplicate dates in logs', () => {
      const duplicateLogs: DayLog[] = [
        ...mockLogs,
        {
          date: '2024-01-01', // Duplicate date
          tasks: {
            task1: false,
            task2: false,
            task3: false,
            task4: false,
            task5: false,
            task6: false,
          },
          photos: [],
          journalEntries: [],
          metrics: {},
        },
      ];
      
      render(<HeatmapView logs={duplicateLogs} />);
      
      // Should use the last occurrence of the duplicate date
      const activity = within(screen.getByTestId('activity-2024-01-01'))
        .getByRole('button');
      expect(activity).toHaveAttribute('aria-label', '2024-01-01: 0% complete');
    });

    it('should handle very large logs array', () => {
      const largeLogs: DayLog[] = Array.from({ length: 1000 }, (_, i) => ({
        date: new Date(2024, 0, 1 + (i % 365)).toISOString().split('T')[0],
        tasks: {
          task1: Math.random() > 0.5,
          task2: Math.random() > 0.5,
          task3: Math.random() > 0.5,
          task4: Math.random() > 0.5,
          task5: Math.random() > 0.5,
          task6: Math.random() > 0.5,
        },
        photos: [],
        journalEntries: [],
        metrics: {},
      }));
      
      // Should render without performance issues
      const { container } = render(<HeatmapView logs={largeLogs} />);
      expect(container).toBeTruthy();
    });
  });

  describe('Activity Level Calculation', () => {
    it('should assign level 0 for 0% completion', () => {
      const zeroLog: DayLog[] = [{
        date: '2024-01-01',
        tasks: {
          task1: false,
          task2: false,
          task3: false,
          task4: false,
          task5: false,
          task6: false,
        },
        photos: [],
        journalEntries: [],
        metrics: {},
      }];
      
      render(<HeatmapView logs={zeroLog} />);
      
      const activity = within(screen.getByTestId('activity-2024-01-01'))
        .getByRole('button');
      expect(activity).toHaveAttribute('aria-label', '2024-01-01: 0% complete');
    });

    it('should assign level 1 for 1-40% completion', () => {
      const lowLog: DayLog[] = [{
        date: '2024-01-01',
        tasks: {
          task1: true,
          task2: true,
          task3: false,
          task4: false,
          task5: false,
          task6: false,
        },
        photos: [],
        journalEntries: [],
        metrics: {},
      }];
      
      render(<HeatmapView logs={lowLog} />);
      
      const activity = within(screen.getByTestId('activity-2024-01-01'))
        .getByRole('button');
      expect(activity).toHaveAttribute('aria-label', '2024-01-01: 33% complete');
    });

    it('should assign level 2 for 41-80% completion', () => {
      const mediumLog: DayLog[] = [{
        date: '2024-01-01',
        tasks: {
          task1: true,
          task2: true,
          task3: true,
          task4: true,
          task5: false,
          task6: false,
        },
        photos: [],
        journalEntries: [],
        metrics: {},
      }];
      
      render(<HeatmapView logs={mediumLog} />);
      
      const activity = within(screen.getByTestId('activity-2024-01-01'))
        .getByRole('button');
      expect(activity).toHaveAttribute('aria-label', '2024-01-01: 67% complete');
    });

    it('should assign level 3 for 81-99% completion', () => {
      const highLog: DayLog[] = [{
        date: '2024-01-01',
        tasks: {
          task1: true,
          task2: true,
          task3: true,
          task4: true,
          task5: true,
          task6: false,
        },
        photos: [],
        journalEntries: [],
        metrics: {},
      }];
      
      render(<HeatmapView logs={highLog} />);
      
      const activity = within(screen.getByTestId('activity-2024-01-01'))
        .getByRole('button');
      expect(activity).toHaveAttribute('aria-label', '2024-01-01: 83% complete');
    });

    it('should assign level 4 for 100% completion', () => {
      const perfectLog: DayLog[] = [{
        date: '2024-01-01',
        tasks: {
          task1: true,
          task2: true,
          task3: true,
          task4: true,
          task5: true,
          task6: true,
        },
        photos: [],
        journalEntries: [],
        metrics: {},
      }];
      
      render(<HeatmapView logs={perfectLog} />);
      
      const activity = within(screen.getByTestId('activity-2024-01-01'))
        .getByRole('button');
      expect(activity).toHaveAttribute('aria-label', '2024-01-01: 100% complete');
    });
  });
});