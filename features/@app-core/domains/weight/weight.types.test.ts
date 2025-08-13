import { describe, expect, it } from 'vitest';
import type { FastingEntry, WeightEntry, WeightStats } from './weight.types';

describe('Weight Types', () => {
  describe('WeightEntry', () => {
    it('should have all required fields', () => {
      const entry: WeightEntry = {
        id: 'weight-1',
        userId: 'user-123',
        date: '2025-01-13',
        weight: 75.5,
        unit: 'kg',
        createdAt: '2025-01-13T10:00:00Z',
        updatedAt: '2025-01-13T10:00:00Z',
      };

      expect(entry.id).toBe('weight-1');
      expect(entry.userId).toBe('user-123');
      expect(entry.date).toBe('2025-01-13');
      expect(entry.weight).toBe(75.5);
      expect(entry.unit).toBe('kg');
    });

    it('should support both kg and lbs units', () => {
      const kgEntry: WeightEntry = {
        id: 'weight-1',
        userId: 'user-123',
        date: '2025-01-13',
        weight: 75.5,
        unit: 'kg',
        createdAt: '2025-01-13T10:00:00Z',
        updatedAt: '2025-01-13T10:00:00Z',
      };

      const lbsEntry: WeightEntry = {
        id: 'weight-2',
        userId: 'user-123',
        date: '2025-01-13',
        weight: 166.4,
        unit: 'lbs',
        createdAt: '2025-01-13T10:00:00Z',
        updatedAt: '2025-01-13T10:00:00Z',
      };

      expect(kgEntry.unit).toBe('kg');
      expect(lbsEntry.unit).toBe('lbs');
    });
  });

  describe('WeightStats', () => {
    it('should have trend indicators', () => {
      const stats: WeightStats = {
        currentWeight: 75.0,
        currentUnit: 'kg',
        previousWeight: 75.5,
        delta: -0.5,
        movingAverage7Day: 75.3,
        movingAverage30Day: 76.0,
        trend: 'down',
      };

      expect(stats.trend).toBe('down');
      expect(stats.delta).toBe(-0.5);
    });
  });

  describe('FastingEntry', () => {
    it('should track fasting periods', () => {
      const fast: FastingEntry = {
        id: 'fast-1',
        userId: 'user-123',
        date: '2025-01-13',
        startTime: '2025-01-13T20:00:00Z',
        endTime: '2025-01-14T12:00:00Z',
        targetHours: 16,
        actualHours: 16,
        pattern: '16:8',
        createdAt: '2025-01-13T20:00:00Z',
        updatedAt: '2025-01-14T12:00:00Z',
      };

      expect(fast.pattern).toBe('16:8');
      expect(fast.targetHours).toBe(16);
      expect(fast.actualHours).toBe(16);
    });

    it('should support ongoing fasts without endTime', () => {
      const ongoingFast: FastingEntry = {
        id: 'fast-2',
        userId: 'user-123',
        date: '2025-01-13',
        startTime: '2025-01-13T20:00:00Z',
        targetHours: 18,
        pattern: '18:6',
        createdAt: '2025-01-13T20:00:00Z',
        updatedAt: '2025-01-13T20:00:00Z',
      };

      expect(ongoingFast.endTime).toBeUndefined();
      expect(ongoingFast.actualHours).toBeUndefined();
    });
  });
});
