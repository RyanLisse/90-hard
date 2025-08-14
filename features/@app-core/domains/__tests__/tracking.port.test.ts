import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DayLog } from '../../../../packages/domain/src/types';
import { TrackingPort } from '../tracking.port';
import type { InstantDBClient } from '../types/instantdb.types';

describe('TrackingPort', () => {
  let instantDBClient: InstantDBClient;
  let trackingPort: TrackingPort;

  beforeEach(() => {
    instantDBClient = {
      query: vi.fn(),
      createDayLog: vi.fn(),
      updateDayLog: vi.fn(),
      transact: vi.fn(),
    };
    trackingPort = new TrackingPort(instantDBClient);
  });

  describe('toggleTask', () => {
    it('should create a new day log when none exists for the date', async () => {
      // Arrange
      const date = '2025-01-13';
      const taskId = 'workout1';
      const userId = 'user-123';

      (instantDBClient.query as any).mockResolvedValue({ data: [] });
      (instantDBClient.createDayLog as any).mockResolvedValue({
        id: 'new-daylog-id',
      });

      // Act
      await trackingPort.toggleTask(date, taskId, userId);

      // Assert
      expect(instantDBClient.query).toHaveBeenCalledWith({
        daylogs: {
          $: {
            where: {
              date,
              userId,
            },
          },
        },
      });

      expect(instantDBClient.createDayLog).toHaveBeenCalledWith({
        userId,
        date,
        tasks: {
          workout1: true,
          workout2: false,
          diet: false,
          water: false,
          reading: false,
          photo: false,
        },
      });
    });

    it('should toggle task to true when it is currently false', async () => {
      // Arrange
      const date = '2025-01-13';
      const taskId = 'diet';
      const userId = 'user-123';
      const existingLog: Partial<DayLog> = {
        id: 'existing-log-id',
        userId,
        date,
        tasks: {
          workout1: true,
          workout2: false,
          diet: false,
          water: false,
          reading: false,
          photo: false,
        },
      };

      (instantDBClient.query as any).mockResolvedValue({
        data: { daylogs: [existingLog] },
      });

      // Act
      await trackingPort.toggleTask(date, taskId, userId);

      // Assert
      expect(instantDBClient.updateDayLog).toHaveBeenCalledWith(
        'existing-log-id',
        {
          tasks: {
            workout1: true,
            workout2: false,
            diet: true,
            water: false,
            reading: false,
            photo: false,
          },
        }
      );
    });

    it('should toggle task to false when it is currently true', async () => {
      // Arrange
      const date = '2025-01-13';
      const taskId = 'workout1';
      const userId = 'user-123';
      const existingLog: Partial<DayLog> = {
        id: 'existing-log-id',
        userId,
        date,
        tasks: {
          workout1: true,
          workout2: false,
          diet: true,
          water: true,
          reading: false,
          photo: false,
        },
      };

      (instantDBClient.query as any).mockResolvedValue({
        data: { daylogs: [existingLog] },
      });

      // Act
      await trackingPort.toggleTask(date, taskId, userId);

      // Assert
      expect(instantDBClient.updateDayLog).toHaveBeenCalledWith(
        'existing-log-id',
        {
          tasks: {
            workout1: false,
            workout2: false,
            diet: true,
            water: true,
            reading: false,
            photo: false,
          },
        }
      );
    });
  });

  describe('getDayLog', () => {
    it('should return null when no log exists for the date', async () => {
      // Arrange
      const date = '2025-01-13';
      const userId = 'user-123';

      (instantDBClient.query as any).mockResolvedValue({
        data: { daylogs: [] },
      });

      // Act
      const result = await trackingPort.getDayLog(date, userId);

      // Assert
      expect(result).toBeNull();
      expect(instantDBClient.query).toHaveBeenCalledWith({
        daylogs: {
          $: {
            where: {
              date,
              userId,
            },
          },
        },
      });
    });

    it('should return the day log when it exists', async () => {
      // Arrange
      const date = '2025-01-13';
      const userId = 'user-123';
      const expectedLog: DayLog = {
        id: 'log-id',
        userId,
        date,
        tasks: {
          workout1: true,
          workout2: false,
          diet: true,
          water: true,
          reading: false,
          photo: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (instantDBClient.query as any).mockResolvedValue({
        data: { daylogs: [expectedLog] },
      });

      // Act
      const result = await trackingPort.getDayLog(date, userId);

      // Assert
      expect(result).toEqual(expectedLog);
    });
  });

  describe('getDateRange', () => {
    it('should return logs within the specified date range', async () => {
      // Arrange
      const startDate = '2025-01-01';
      const endDate = '2025-01-07';
      const userId = 'user-123';
      const logs: DayLog[] = [
        {
          id: 'log-1',
          userId,
          date: '2025-01-01',
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
        {
          id: 'log-2',
          userId,
          date: '2025-01-05',
          tasks: {
            workout1: true,
            workout2: false,
            diet: true,
            water: true,
            reading: false,
            photo: false,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      (instantDBClient.query as any).mockResolvedValue({
        data: { daylogs: logs },
      });

      // Act
      const result = await trackingPort.getDateRange(
        startDate,
        endDate,
        userId
      );

      // Assert
      expect(result).toEqual(logs);
      expect(instantDBClient.query).toHaveBeenCalledWith({
        daylogs: {
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
    });

    it('should return empty array when no logs exist in range', async () => {
      // Arrange
      const startDate = '2025-01-01';
      const endDate = '2025-01-07';
      const userId = 'user-123';

      (instantDBClient.query as any).mockResolvedValue({
        data: { daylogs: [] },
      });

      // Act
      const result = await trackingPort.getDateRange(
        startDate,
        endDate,
        userId
      );

      // Assert
      expect(result).toEqual([]);
    });
  });
});
