import type { DayLog } from '../../../packages/domain/src/types';
import { computeDayCompletion } from '../../../packages/domain/src/types';

export interface HeatmapCell {
  date: string;
  log?: DayLog;
  completionPercentage: number;
}

export type HeatmapGrid = (HeatmapCell | null)[][];

/**
 * Get color for completion percentage following GitHub's color scheme
 */
export function getColorForCompletion(percentage: number): string {
  if (percentage === 0) return '#ebedf0'; // No data
  if (percentage <= 40) return '#9be9a8'; // Light green
  if (percentage <= 80) return '#40c463'; // Medium green
  if (percentage < 100) return '#30a14e'; // Dark green
  return '#216e39'; // Darkest green (100%)
}

/**
 * Get date range for the heatmap (77 days = 11 weeks)
 */
export function getDateRange(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start 76 days ago (77 days total including today)
  for (let i = 76; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }

  return dates;
}

/**
 * Map days and logs to a 7x11 grid for heatmap display
 * Rows represent days of the week (0=Sunday to 6=Saturday)
 * Columns represent weeks
 */
export function mapDaysToGrid(dateRange: Date[], logs: DayLog[]): HeatmapGrid {
  // Create a map of date strings to logs for quick lookup
  const logMap = new Map<string, DayLog>();
  logs.forEach((log) => {
    logMap.set(log.date, log);
  });

  // Initialize 7x11 grid with nulls
  const grid: HeatmapGrid = Array(7)
    .fill(null)
    .map(() => Array(11).fill(null));

  if (dateRange.length === 0) return grid;

  // Process each date and place it in the correct position
  dateRange.forEach((date, index) => {
    const dateStr = date.toISOString().split('T')[0];
    const log = logMap.get(dateStr);
    const completionPercentage = log ? computeDayCompletion(log) : 0;

    // Get the day of week (0-6)
    const dayOfWeek = date.getDay();

    // Calculate which week column this date belongs to
    // We work backwards from the end to ensure proper alignment
    const daysFromEnd = dateRange.length - 1 - index;
    const weeksFromEnd = Math.floor(daysFromEnd / 7);
    const weekColumn = 10 - weeksFromEnd;

    if (weekColumn >= 0 && weekColumn < 11) {
      grid[dayOfWeek][weekColumn] = {
        date: dateStr,
        log,
        completionPercentage,
      };
    }
  });

  return grid;
}

/**
 * Format date for tooltip display
 */
export function formatDateForTooltip(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get week labels for the heatmap
 */
export function getWeekLabels(dateRange: Date[]): string[] {
  const labels: string[] = [];
  const weeks = Math.ceil(dateRange.length / 7);

  for (let i = 0; i < weeks; i++) {
    const weekStart = i * 7;
    if (weekStart < dateRange.length) {
      const date = dateRange[weekStart];
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      labels.push(month);
    }
  }

  return labels;
}

/**
 * Get month boundaries for the heatmap
 */
export function getMonthBoundaries(grid: HeatmapGrid): number[] {
  const boundaries: number[] = [];
  let lastMonth = -1;

  for (let col = 0; col < 11; col++) {
    for (let row = 0; row < 7; row++) {
      const cell = grid[row][col];
      if (cell) {
        const date = new Date(cell.date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          boundaries.push(col);
          lastMonth = month;
          break;
        }
      }
    }
  }

  return boundaries;
}
