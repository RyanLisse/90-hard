import { describe, expect, it } from 'vitest';
import type { DayLog } from '../../../../packages/domain/src/types';
import {
  formatDateForTooltip,
  getColorForCompletion,
  getDateRange,
  mapDaysToGrid,
} from '../heatmap';

describe('heatmap utilities', () => {
  describe('getColorForCompletion', () => {
    it('should return correct color for 0% completion', () => {
      expect(getColorForCompletion(0)).toBe('#ebedf0');
    });

    it('should return correct color for 1-40% completion', () => {
      expect(getColorForCompletion(1)).toBe('#9be9a8');
      expect(getColorForCompletion(20)).toBe('#9be9a8');
      expect(getColorForCompletion(40)).toBe('#9be9a8');
    });

    it('should return correct color for 41-80% completion', () => {
      expect(getColorForCompletion(41)).toBe('#40c463');
      expect(getColorForCompletion(60)).toBe('#40c463');
      expect(getColorForCompletion(80)).toBe('#40c463');
    });

    it('should return correct color for 81-99% completion', () => {
      expect(getColorForCompletion(81)).toBe('#30a14e');
      expect(getColorForCompletion(90)).toBe('#30a14e');
      expect(getColorForCompletion(99)).toBe('#30a14e');
    });

    it('should return correct color for 100% completion', () => {
      expect(getColorForCompletion(100)).toBe('#216e39');
    });
  });

  describe('getDateRange', () => {
    it('should return 77 days (11 weeks) ending today', () => {
      const today = new Date();
      const range = getDateRange();

      expect(range.length).toBe(77);

      // Check last date is today
      const lastDate = range[range.length - 1];
      expect(lastDate.toDateString()).toBe(today.toDateString());

      // Check first date is 76 days ago
      const firstDate = range[0];
      const daysDiff = Math.floor(
        (today.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).toBe(76);
    });

    it('should return dates in chronological order', () => {
      const range = getDateRange();

      for (let i = 1; i < range.length; i++) {
        expect(range[i].getTime()).toBeGreaterThan(range[i - 1].getTime());
      }
    });
  });

  describe('mapDaysToGrid', () => {
    it('should create 7x11 grid with all dates', () => {
      const dateRange = getDateRange();
      const logs: DayLog[] = [];

      const grid = mapDaysToGrid(dateRange, logs);

      expect(grid.length).toBe(7); // 7 rows (days of week)
      grid.forEach((row) => {
        expect(row.length).toBe(11); // 11 columns (weeks)
      });
    });

    it('should place dates in correct weekday rows', () => {
      const dateRange = getDateRange();
      const logs: DayLog[] = [];

      const grid = mapDaysToGrid(dateRange, logs);

      // Check that each date is in the correct row based on its day of week
      dateRange.forEach((date) => {
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0];

        // Find the date in the grid
        let found = false;
        for (let col = 0; col < 11; col++) {
          if (grid[dayOfWeek][col]?.date === dateStr) {
            found = true;
            break;
          }
        }
        expect(found).toBe(true);
      });
    });

    it('should include log data when available', () => {
      const dateRange = getDateRange();
      const testDate = dateRange[10]; // arbitrary date
      const testDateStr = testDate.toISOString().split('T')[0];

      const logs: DayLog[] = [
        {
          id: 'test-log',
          userId: 'user-123',
          date: testDateStr,
          tasks: {
            workout1: true,
            workout2: true,
            diet: true,
            water: true,
            reading: true,
            photo: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const grid = mapDaysToGrid(dateRange, logs);

      // Find the cell with our log
      let foundCell = null;
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 11; col++) {
          if (grid[row][col]?.date === testDateStr) {
            foundCell = grid[row][col];
            break;
          }
        }
      }

      expect(foundCell).not.toBeNull();
      expect(foundCell?.log).toBeDefined();
      expect(foundCell?.completionPercentage).toBe(100);
    });

    it('should have null cells for days outside the date range', () => {
      const dateRange = getDateRange();
      const logs: DayLog[] = [];

      const grid = mapDaysToGrid(dateRange, logs);

      // Count non-null cells
      let nonNullCount = 0;
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 11; col++) {
          if (grid[row][col] !== null) {
            nonNullCount++;
          }
        }
      }

      expect(nonNullCount).toBe(77); // Should match our date range
    });
  });

  describe('formatDateForTooltip', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-13');
      expect(formatDateForTooltip(date)).toBe('Mon, Jan 13, 2025');
    });

    it('should handle different months', () => {
      expect(formatDateForTooltip(new Date('2025-12-25'))).toBe(
        'Thu, Dec 25, 2025'
      );
      expect(formatDateForTooltip(new Date('2025-07-04'))).toBe(
        'Fri, Jul 4, 2025'
      );
    });
  });
});
