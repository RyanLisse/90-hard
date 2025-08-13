import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InstantDBClient } from '../types/instantdb.types';
import { WeightPort } from './weight.port';
import type { WeightEntry, WeightGoal, WeightStats } from './weight.types';

describe('WeightPort', () => {
  let instantDBClient: InstantDBClient;
  let weightPort: WeightPort;

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
    weightPort = new WeightPort(instantDBClient);
  });

  describe('addWeightEntry', () => {
    it('should create a new weight entry', async () => {
      // Arrange
      const userId = 'user-123';
      const date = '2025-01-13';
      const weight = 75.5;
      const unit = 'kg';

      (instantDBClient.createWeightEntry as any).mockResolvedValue({
        id: 'weight-entry-id',
      });

      // Act
      const result = await weightPort.addWeightEntry(
        userId,
        date,
        weight,
        unit
      );

      // Assert
      expect(instantDBClient.createWeightEntry).toHaveBeenCalledWith({
        userId,
        date,
        weight,
        unit,
      });
      expect(result.id).toBe('weight-entry-id');
    });
  });

  describe('getWeightEntry', () => {
    it('should return weight entry for a specific date', async () => {
      // Arrange
      const userId = 'user-123';
      const date = '2025-01-13';
      const expectedEntry: WeightEntry = {
        id: 'weight-1',
        userId,
        date,
        weight: 75.5,
        unit: 'kg',
        createdAt: '2025-01-13T10:00:00Z',
        updatedAt: '2025-01-13T10:00:00Z',
      };

      (instantDBClient.query as any).mockResolvedValue({
        data: { weightEntries: [expectedEntry] },
      });

      // Act
      const result = await weightPort.getWeightEntry(userId, date);

      // Assert
      expect(instantDBClient.query).toHaveBeenCalledWith({
        weightEntries: {
          $: {
            where: {
              userId,
              date,
            },
          },
        },
      });
      expect(result).toEqual(expectedEntry);
    });

    it('should return null when no entry exists for the date', async () => {
      // Arrange
      const userId = 'user-123';
      const date = '2025-01-13';

      (instantDBClient.query as any).mockResolvedValue({
        data: { weightEntries: [] },
      });

      // Act
      const result = await weightPort.getWeightEntry(userId, date);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getWeightHistory', () => {
    it('should return weight entries within date range', async () => {
      // Arrange
      const userId = 'user-123';
      const startDate = '2025-01-01';
      const endDate = '2025-01-07';
      const entries: WeightEntry[] = [
        {
          id: 'weight-1',
          userId,
          date: '2025-01-01',
          weight: 76.0,
          unit: 'kg',
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: 'weight-2',
          userId,
          date: '2025-01-03',
          weight: 75.5,
          unit: 'kg',
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-03T10:00:00Z',
        },
      ];

      (instantDBClient.query as any).mockResolvedValue({
        data: { weightEntries: entries },
      });

      // Act
      const result = await weightPort.getWeightHistory(
        userId,
        startDate,
        endDate
      );

      // Assert
      expect(instantDBClient.query).toHaveBeenCalledWith({
        weightEntries: {
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

  describe('updateWeightEntry', () => {
    it('should update an existing weight entry', async () => {
      // Arrange
      const entryId = 'weight-1';
      const updates = { weight: 74.8, unit: 'kg' as const };

      // Act
      await weightPort.updateWeightEntry(entryId, updates);

      // Assert
      expect(instantDBClient.updateWeightEntry).toHaveBeenCalledWith(
        entryId,
        updates
      );
    });
  });

  describe('deleteWeightEntry', () => {
    it('should delete a weight entry', async () => {
      // Arrange
      const entryId = 'weight-1';

      // Act
      await weightPort.deleteWeightEntry(entryId);

      // Assert
      expect(instantDBClient.deleteWeightEntry).toHaveBeenCalledWith(entryId);
    });
  });

  describe('getWeightStats', () => {
    it('should calculate weight statistics', async () => {
      // Arrange
      const userId = 'user-123';
      const entries: WeightEntry[] = [
        {
          id: 'weight-1',
          userId,
          date: '2025-01-01',
          weight: 76.0,
          unit: 'kg',
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: 'weight-2',
          userId,
          date: '2025-01-02',
          weight: 75.5,
          unit: 'kg',
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T10:00:00Z',
        },
        {
          id: 'weight-3',
          userId,
          date: '2025-01-03',
          weight: 75.0,
          unit: 'kg',
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-03T10:00:00Z',
        },
      ];

      (instantDBClient.query as any).mockResolvedValue({
        data: { weightEntries: entries },
      });

      // Act
      const stats = await weightPort.getWeightStats(userId, 30);

      // Assert
      expect(stats).toEqual({
        currentWeight: 75.0,
        currentUnit: 'kg',
        previousWeight: 75.5,
        delta: -0.5,
        movingAverage7Day: 75.5, // (76.0 + 75.5 + 75.0) / 3
        movingAverage30Day: 75.5,
        trend: 'down',
      });
    });

    it('should handle single entry', async () => {
      // Arrange
      const userId = 'user-123';
      const entries: WeightEntry[] = [
        {
          id: 'weight-1',
          userId,
          date: '2025-01-01',
          weight: 75.0,
          unit: 'kg',
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
      ];

      (instantDBClient.query as any).mockResolvedValue({
        data: { weightEntries: entries },
      });

      // Act
      const stats = await weightPort.getWeightStats(userId, 30);

      // Assert
      expect(stats).toEqual({
        currentWeight: 75.0,
        currentUnit: 'kg',
        previousWeight: undefined,
        delta: 0,
        movingAverage7Day: 75.0,
        movingAverage30Day: 75.0,
        trend: 'stable',
      });
    });

    it('should handle empty weight history', async () => {
      // Arrange
      const userId = 'user-123';

      (instantDBClient.query as any).mockResolvedValue({
        data: { weightEntries: [] },
      });

      // Act
      const stats = await weightPort.getWeightStats(userId, 30);

      // Assert
      expect(stats).toBeNull();
    });
  });

  describe('createWeightGoal', () => {
    it('should create a new weight goal', async () => {
      // Arrange
      const userId = 'user-123';
      const targetWeight = 70.0;
      const targetUnit = 'kg';
      const startDate = '2025-01-01';
      const endDate = '2025-06-01';

      (instantDBClient.createWeightGoal as any).mockResolvedValue({
        id: 'goal-id',
      });

      // Act
      const result = await weightPort.createWeightGoal(
        userId,
        targetWeight,
        targetUnit,
        startDate,
        endDate
      );

      // Assert
      expect(instantDBClient.createWeightGoal).toHaveBeenCalledWith({
        userId,
        targetWeight,
        targetUnit,
        startDate,
        endDate,
      });
      expect(result.id).toBe('goal-id');
    });
  });

  describe('getActiveWeightGoal', () => {
    it('should return the active weight goal for a user', async () => {
      // Arrange
      const userId = 'user-123';
      const currentDate = '2025-01-13';
      const goal: WeightGoal = {
        id: 'goal-1',
        userId,
        targetWeight: 70.0,
        targetUnit: 'kg',
        startDate: '2025-01-01',
        endDate: '2025-06-01',
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T10:00:00Z',
      };

      (instantDBClient.query as any).mockResolvedValue({
        data: { weightGoals: [goal] },
      });

      // Act
      const result = await weightPort.getActiveWeightGoal(userId, currentDate);

      // Assert
      expect(instantDBClient.query).toHaveBeenCalledWith({
        weightGoals: {
          $: {
            where: {
              userId,
              startDate: { $lte: currentDate },
              $or: [
                { endDate: { $gte: currentDate } },
                { endDate: { $exists: false } },
              ],
            },
          },
        },
      });
      expect(result).toEqual(goal);
    });

    it('should return null when no active goal exists', async () => {
      // Arrange
      const userId = 'user-123';
      const currentDate = '2025-01-13';

      (instantDBClient.query as any).mockResolvedValue({
        data: { weightGoals: [] },
      });

      // Act
      const result = await weightPort.getActiveWeightGoal(userId, currentDate);

      // Assert
      expect(result).toBeNull();
    });
  });
});
