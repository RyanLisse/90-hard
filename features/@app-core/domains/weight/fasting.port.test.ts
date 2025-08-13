import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InstantDBClient } from '../types/instantdb.types';
import { FastingPort } from './fasting.port';
import type { FastingEntry } from './weight.types';

describe('FastingPort', () => {
  let instantDBClient: InstantDBClient;
  let fastingPort: FastingPort;

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
    fastingPort = new FastingPort(instantDBClient);
  });

  describe('startFast', () => {
    it('should create a new fasting entry', async () => {
      // Arrange
      const userId = 'user-123';
      const startTime = '2025-01-13T20:00:00Z';
      const targetHours = 16;
      const pattern = '16:8';

      (instantDBClient.createFastingEntry as any).mockResolvedValue({
        id: 'fasting-entry-id',
      });

      // Act
      const result = await fastingPort.startFast(
        userId,
        startTime,
        targetHours,
        pattern
      );

      // Assert
      expect(instantDBClient.createFastingEntry).toHaveBeenCalledWith({
        userId,
        date: '2025-01-13', // Extracted from startTime
        startTime,
        targetHours,
        pattern,
      });
      expect(result.id).toBe('fasting-entry-id');
    });
  });

  describe('endFast', () => {
    it('should update fasting entry with end time and actual hours', async () => {
      // Arrange
      const entryId = 'fasting-1';
      const endTime = '2025-01-14T12:00:00Z';
      const actualHours = 16;

      // Act
      await fastingPort.endFast(entryId, endTime, actualHours);

      // Assert
      expect(instantDBClient.updateFastingEntry).toHaveBeenCalledWith(entryId, {
        endTime,
        actualHours,
      });
    });
  });

  describe('getActiveFast', () => {
    it('should return active fast for user', async () => {
      // Arrange
      const userId = 'user-123';
      const activeFast: FastingEntry = {
        id: 'fast-1',
        userId,
        date: '2025-01-13',
        startTime: '2025-01-13T20:00:00Z',
        targetHours: 16,
        pattern: '16:8',
        createdAt: '2025-01-13T20:00:00Z',
        updatedAt: '2025-01-13T20:00:00Z',
      };

      (instantDBClient.query as any).mockResolvedValue({
        data: { fastingEntries: [activeFast] },
      });

      // Act
      const result = await fastingPort.getActiveFast(userId);

      // Assert
      expect(instantDBClient.query).toHaveBeenCalledWith({
        fastingEntries: {
          $: {
            where: {
              userId,
              endTime: { $exists: false },
            },
          },
        },
      });
      expect(result).toEqual(activeFast);
    });

    it('should return null when no active fast exists', async () => {
      // Arrange
      const userId = 'user-123';

      (instantDBClient.query as any).mockResolvedValue({
        data: { fastingEntries: [] },
      });

      // Act
      const result = await fastingPort.getActiveFast(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getFastingHistory', () => {
    it('should return fasting entries within date range', async () => {
      // Arrange
      const userId = 'user-123';
      const startDate = '2025-01-01';
      const endDate = '2025-01-07';
      const entries: FastingEntry[] = [
        {
          id: 'fast-1',
          userId,
          date: '2025-01-01',
          startTime: '2025-01-01T20:00:00Z',
          endTime: '2025-01-02T12:00:00Z',
          targetHours: 16,
          actualHours: 16,
          pattern: '16:8',
          createdAt: '2025-01-01T20:00:00Z',
          updatedAt: '2025-01-02T12:00:00Z',
        },
      ];

      (instantDBClient.query as any).mockResolvedValue({
        data: { fastingEntries: entries },
      });

      // Act
      const result = await fastingPort.getFastingHistory(
        userId,
        startDate,
        endDate
      );

      // Assert
      expect(instantDBClient.query).toHaveBeenCalledWith({
        fastingEntries: {
          $: {
            where: {
              userId,
              date: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
        },
      });
      expect(result).toEqual(entries);
    });
  });

  describe('getFastingStats', () => {
    it('should calculate fasting statistics', async () => {
      // Arrange
      const userId = 'user-123';
      const days = 30;
      const entries: FastingEntry[] = [
        {
          id: 'fast-1',
          userId,
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
          userId,
          date: '2025-01-02',
          startTime: '2025-01-02T20:00:00Z',
          endTime: '2025-01-03T14:00:00Z',
          targetHours: 18,
          actualHours: 18,
          pattern: '18:6',
          createdAt: '2025-01-02T20:00:00Z',
          updatedAt: '2025-01-03T14:00:00Z',
        },
      ];

      // Mock the getFastingHistory method
      vi.spyOn(fastingPort, 'getFastingHistory').mockResolvedValue(entries);

      // Act
      const stats = await fastingPort.getFastingStats(userId, days);

      // Assert
      expect(stats).toEqual({
        currentStreak: 2,
        longestStreak: 2,
        weeklyAverage: 17.0, // (16 + 18) / 2
        successRate: 100.0, // Both fasts successful
        totalFasts: 2,
        completedFasts: 2,
      });
    });

    it('should return null when no fasting history exists', async () => {
      // Arrange
      const userId = 'user-123';
      const days = 30;

      // Mock the getFastingHistory method to return empty array
      vi.spyOn(fastingPort, 'getFastingHistory').mockResolvedValue([]);

      // Act
      const stats = await fastingPort.getFastingStats(userId, days);

      // Assert
      expect(stats).toBeNull();
    });
  });

  describe('updateFastingEntry', () => {
    it('should update fasting entry', async () => {
      // Arrange
      const entryId = 'fast-1';
      const updates = { targetHours: 18, pattern: '18:6' };

      // Act
      await fastingPort.updateFastingEntry(entryId, updates);

      // Assert
      expect(instantDBClient.updateFastingEntry).toHaveBeenCalledWith(
        entryId,
        updates
      );
    });
  });

  describe('deleteFastingEntry', () => {
    it('should delete fasting entry', async () => {
      // Arrange
      const entryId = 'fast-1';

      // Act
      await fastingPort.deleteFastingEntry(entryId);

      // Assert
      expect(instantDBClient.deleteFastingEntry).toHaveBeenCalledWith(entryId);
    });
  });

  describe('getCurrentFastDuration', () => {
    it('should calculate current fast duration', async () => {
      // Arrange
      const userId = 'user-123';
      const startTime = '2025-01-13T20:00:00Z';
      const activeFast: FastingEntry = {
        id: 'fast-1',
        userId,
        date: '2025-01-13',
        startTime,
        targetHours: 16,
        pattern: '16:8',
        createdAt: '2025-01-13T20:00:00Z',
        updatedAt: '2025-01-13T20:00:00Z',
      };

      const currentTime = '2025-01-14T06:00:00Z'; // 10 hours later

      // Mock the getActiveFast method
      vi.spyOn(fastingPort, 'getActiveFast').mockResolvedValue(activeFast);

      // Act
      const duration = await fastingPort.getCurrentFastDuration(
        userId,
        currentTime
      );

      // Assert
      expect(duration).toBe(10.0); // 10 hours
    });

    it('should return 0 when no active fast', async () => {
      // Arrange
      const userId = 'user-123';
      const currentTime = '2025-01-14T06:00:00Z';

      // Mock the getActiveFast method to return null
      vi.spyOn(fastingPort, 'getActiveFast').mockResolvedValue(null);

      // Act
      const duration = await fastingPort.getCurrentFastDuration(
        userId,
        currentTime
      );

      // Assert
      expect(duration).toBe(0);
    });
  });
});
