import { describe, expect, it } from 'vitest';
import {
  calculateFastingDuration,
  calculateFastingStats,
  isActiveFast,
  parseFastingPattern,
} from './fasting.utils';
import type { FastingEntry } from './weight.types';

describe('Fasting Utilities', () => {
  describe('calculateFastingDuration', () => {
    it('should calculate duration for completed fast', () => {
      const startTime = '2025-01-13T20:00:00Z';
      const endTime = '2025-01-14T12:00:00Z';

      const duration = calculateFastingDuration(startTime, endTime);
      expect(duration).toBe(16); // 16 hours
    });

    it('should calculate duration for ongoing fast', () => {
      const startTime = '2025-01-13T20:00:00Z';
      const currentTime = '2025-01-14T06:00:00Z';

      const duration = calculateFastingDuration(
        startTime,
        undefined,
        currentTime
      );
      expect(duration).toBe(10); // 10 hours so far
    });

    it('should return 0 for invalid times', () => {
      const startTime = '2025-01-14T12:00:00Z';
      const endTime = '2025-01-13T20:00:00Z'; // End before start

      const duration = calculateFastingDuration(startTime, endTime);
      expect(duration).toBe(0);
    });
  });

  describe('isActiveFast', () => {
    it('should return true for ongoing fast', () => {
      const entry: FastingEntry = {
        id: 'fast-1',
        userId: 'user-123',
        date: '2025-01-13',
        startTime: '2025-01-13T20:00:00Z',
        targetHours: 16,
        createdAt: '2025-01-13T20:00:00Z',
        updatedAt: '2025-01-13T20:00:00Z',
      };

      expect(isActiveFast(entry)).toBe(true);
    });

    it('should return false for completed fast', () => {
      const entry: FastingEntry = {
        id: 'fast-1',
        userId: 'user-123',
        date: '2025-01-13',
        startTime: '2025-01-13T20:00:00Z',
        endTime: '2025-01-14T12:00:00Z',
        targetHours: 16,
        actualHours: 16,
        createdAt: '2025-01-13T20:00:00Z',
        updatedAt: '2025-01-14T12:00:00Z',
      };

      expect(isActiveFast(entry)).toBe(false);
    });
  });

  describe('calculateFastingStats', () => {
    const mockEntries: FastingEntry[] = [
      {
        id: 'fast-1',
        userId: 'user-123',
        date: '2025-01-01',
        startTime: '2025-01-01T20:00:00Z',
        endTime: '2025-01-02T12:00:00Z',
        targetHours: 16,
        actualHours: 16,
        pattern: '16:8',
        createdAt: '2025-01-01T20:00:00Z',
        updatedAt: '2025-01-02T12:00:00Z',
      },
      {
        id: 'fast-2',
        userId: 'user-123',
        date: '2025-01-02',
        startTime: '2025-01-02T20:00:00Z',
        endTime: '2025-01-03T14:00:00Z',
        targetHours: 18,
        actualHours: 18,
        pattern: '18:6',
        createdAt: '2025-01-02T20:00:00Z',
        updatedAt: '2025-01-03T14:00:00Z',
      },
      {
        id: 'fast-3',
        userId: 'user-123',
        date: '2025-01-03',
        startTime: '2025-01-03T20:00:00Z',
        endTime: '2025-01-04T10:00:00Z',
        targetHours: 16,
        actualHours: 14,
        pattern: '16:8',
        createdAt: '2025-01-03T20:00:00Z',
        updatedAt: '2025-01-04T10:00:00Z',
      },
    ];

    it('should calculate fasting statistics correctly', () => {
      const stats = calculateFastingStats(mockEntries);

      expect(stats).toEqual({
        currentStreak: 0, // Last entry (14h) didn't meet target (16h)
        longestStreak: 2, // First two entries were successful
        weeklyAverage: 16.0, // (16 + 18 + 14) / 3
        successRate: 66.7, // 2 out of 3 completed successfully
        totalFasts: 3,
        completedFasts: 3, // All 3 have actualHours
      });
    });

    it('should handle empty entries', () => {
      const stats = calculateFastingStats([]);

      expect(stats).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        weeklyAverage: 0,
        successRate: 0,
        totalFasts: 0,
        completedFasts: 0,
      });
    });

    it('should handle single entry', () => {
      const singleEntry = [mockEntries[0]];
      const stats = calculateFastingStats(singleEntry);

      expect(stats).toEqual({
        currentStreak: 1,
        longestStreak: 1,
        weeklyAverage: 16.0,
        successRate: 100.0,
        totalFasts: 1,
        completedFasts: 1,
      });
    });
  });

  describe('parseFastingPattern', () => {
    it('should parse common fasting patterns', () => {
      expect(parseFastingPattern('16:8')).toEqual({
        fastingHours: 16,
        eatingHours: 8,
        description: '16 hour fast, 8 hour eating window',
      });

      expect(parseFastingPattern('18:6')).toEqual({
        fastingHours: 18,
        eatingHours: 6,
        description: '18 hour fast, 6 hour eating window',
      });

      expect(parseFastingPattern('20:4')).toEqual({
        fastingHours: 20,
        eatingHours: 4,
        description: '20 hour fast, 4 hour eating window',
      });
    });

    it('should handle invalid patterns', () => {
      expect(parseFastingPattern('invalid')).toEqual({
        fastingHours: 0,
        eatingHours: 0,
        description: 'Unknown fasting pattern',
      });

      expect(parseFastingPattern('25:5')).toEqual({
        fastingHours: 0,
        eatingHours: 0,
        description: 'Unknown fasting pattern',
      });
    });

    it('should handle undefined pattern', () => {
      expect(parseFastingPattern()).toEqual({
        fastingHours: 0,
        eatingHours: 0,
        description: 'Unknown fasting pattern',
      });
    });
  });
});
