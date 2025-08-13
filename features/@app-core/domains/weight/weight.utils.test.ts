import { describe, expect, it } from 'vitest';
import type { WeightEntry } from './weight.types';
import {
  calculateMovingAverage,
  calculateWeightDelta,
  determineTrend,
  kgToLbs,
  lbsToKg,
} from './weight.utils';

describe('Weight Utilities', () => {
  describe('kgToLbs', () => {
    it('should convert kilograms to pounds correctly', () => {
      expect(kgToLbs(0)).toBe(0);
      expect(kgToLbs(1)).toBe(2.2);
      expect(kgToLbs(75)).toBe(165.3);
      expect(kgToLbs(100)).toBe(220.5);
      expect(kgToLbs(50.5)).toBe(111.3);
    });

    it('should handle negative values', () => {
      expect(kgToLbs(-10)).toBe(-22.0);
    });

    it('should round to 1 decimal place', () => {
      expect(kgToLbs(75.123_456)).toBe(165.6);
    });
  });

  describe('lbsToKg', () => {
    it('should convert pounds to kilograms correctly', () => {
      expect(lbsToKg(0)).toBe(0);
      expect(lbsToKg(2.204_622_621_8)).toBe(1.0);
      expect(lbsToKg(165.3)).toBe(75.0);
      expect(lbsToKg(220.5)).toBe(100.0);
      expect(lbsToKg(111.3)).toBe(50.5);
    });

    it('should handle negative values', () => {
      expect(lbsToKg(-22.0)).toBe(-10.0);
    });

    it('should round to 1 decimal place', () => {
      expect(lbsToKg(165.6789)).toBe(75.2);
    });
  });

  describe('calculateWeightDelta', () => {
    it('should calculate positive delta when weight increases', () => {
      expect(calculateWeightDelta(75.0, 74.0)).toBe(1.0);
      expect(calculateWeightDelta(80.5, 78.3)).toBe(2.2);
    });

    it('should calculate negative delta when weight decreases', () => {
      expect(calculateWeightDelta(74.0, 75.0)).toBe(-1.0);
      expect(calculateWeightDelta(78.3, 80.5)).toBe(-2.2);
    });

    it('should return 0 when weights are equal', () => {
      expect(calculateWeightDelta(75.0, 75.0)).toBe(0);
    });

    it('should handle undefined previous weight', () => {
      expect(calculateWeightDelta(75.0)).toBe(0);
    });
  });

  describe('calculateMovingAverage', () => {
    const mockEntries: WeightEntry[] = [
      {
        id: '1',
        userId: 'user-123',
        date: '2025-01-01',
        weight: 75.0,
        unit: 'kg',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        userId: 'user-123',
        date: '2025-01-02',
        weight: 75.2,
        unit: 'kg',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '3',
        userId: 'user-123',
        date: '2025-01-03',
        weight: 74.8,
        unit: 'kg',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '4',
        userId: 'user-123',
        date: '2025-01-04',
        weight: 74.6,
        unit: 'kg',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '5',
        userId: 'user-123',
        date: '2025-01-05',
        weight: 74.4,
        unit: 'kg',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '6',
        userId: 'user-123',
        date: '2025-01-06',
        weight: 74.2,
        unit: 'kg',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '7',
        userId: 'user-123',
        date: '2025-01-07',
        weight: 74.0,
        unit: 'kg',
        createdAt: '',
        updatedAt: '',
      },
    ];

    it('should calculate 7-day moving average', () => {
      const average = calculateMovingAverage(mockEntries, 7);
      expect(average).toBe(74.6); // (75.0 + 75.2 + 74.8 + 74.6 + 74.4 + 74.2 + 74.0) / 7
    });

    it('should handle fewer entries than requested days', () => {
      const shortEntries = mockEntries.slice(0, 3);
      const average = calculateMovingAverage(shortEntries, 7);
      expect(average).toBe(75.0); // (75.0 + 75.2 + 74.8) / 3
    });

    it('should return 0 for empty array', () => {
      expect(calculateMovingAverage([], 7)).toBe(0);
    });

    it('should take most recent entries when more than needed', () => {
      const average = calculateMovingAverage(mockEntries, 3);
      expect(average).toBe(74.2); // (74.6 + 74.2 + 74.0) / 3
    });
  });

  describe('determineTrend', () => {
    it("should return 'down' for decreasing weight", () => {
      const entries: WeightEntry[] = [
        {
          id: '1',
          userId: 'user-123',
          date: '2025-01-01',
          weight: 76.0,
          unit: 'kg',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          userId: 'user-123',
          date: '2025-01-02',
          weight: 75.5,
          unit: 'kg',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '3',
          userId: 'user-123',
          date: '2025-01-03',
          weight: 75.0,
          unit: 'kg',
          createdAt: '',
          updatedAt: '',
        },
      ];
      expect(determineTrend(entries)).toBe('down');
    });

    it("should return 'up' for increasing weight", () => {
      const entries: WeightEntry[] = [
        {
          id: '1',
          userId: 'user-123',
          date: '2025-01-01',
          weight: 74.0,
          unit: 'kg',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          userId: 'user-123',
          date: '2025-01-02',
          weight: 74.5,
          unit: 'kg',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '3',
          userId: 'user-123',
          date: '2025-01-03',
          weight: 75.0,
          unit: 'kg',
          createdAt: '',
          updatedAt: '',
        },
      ];
      expect(determineTrend(entries)).toBe('up');
    });

    it("should return 'stable' for minimal change", () => {
      const entries: WeightEntry[] = [
        {
          id: '1',
          userId: 'user-123',
          date: '2025-01-01',
          weight: 75.0,
          unit: 'kg',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '2',
          userId: 'user-123',
          date: '2025-01-02',
          weight: 75.1,
          unit: 'kg',
          createdAt: '',
          updatedAt: '',
        },
        {
          id: '3',
          userId: 'user-123',
          date: '2025-01-03',
          weight: 75.0,
          unit: 'kg',
          createdAt: '',
          updatedAt: '',
        },
      ];
      expect(determineTrend(entries)).toBe('stable');
    });

    it("should return 'stable' for insufficient data", () => {
      expect(determineTrend([])).toBe('stable');
      expect(
        determineTrend([
          {
            id: '1',
            userId: 'user-123',
            date: '2025-01-01',
            weight: 75.0,
            unit: 'kg',
            createdAt: '',
            updatedAt: '',
          },
        ])
      ).toBe('stable');
    });
  });
});
