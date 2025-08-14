import { useCallback, useEffect, useState } from 'react';
import type { DayLog, TaskId } from '../../../packages/domain/src/types';
import { TrackingPort } from '../domains/tracking.port';
import type { InstantDBClient } from '../domains/types/instantdb.types';

// Mock InstantDB client for now - will be replaced with real implementation
const mockInstantDBClient: InstantDBClient = {
  query: async () => ({ data: { daylogs: [] } }),
  createDayLog: async () => ({ id: 'mock-id' }),
  updateDayLog: async () => {},
  transact: async () => {},
};

interface UseTrackingSyncOptions {
  userId: string;
  date: string;
}

interface UseTrackingSyncReturn {
  dayLog: DayLog | null;
  isLoading: boolean;
  error: Error | null;
  toggleTask: (taskId: TaskId) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTrackingSync({
  userId,
  date,
}: UseTrackingSyncOptions): UseTrackingSyncReturn {
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create tracking port instance
  const trackingPort = new TrackingPort(mockInstantDBClient);

  // Fetch day log
  const fetchDayLog = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const log = await trackingPort.getDayLog(date, userId);
      setDayLog(log);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch day log')
      );
    } finally {
      setIsLoading(false);
    }
  }, [date, userId]);

  // Toggle task
  const toggleTask = useCallback(
    async (taskId: TaskId) => {
      try {
        setError(null);

        // Optimistic update
        if (dayLog) {
          setDayLog({
            ...dayLog,
            tasks: {
              ...dayLog.tasks,
              [taskId]: !dayLog.tasks[taskId],
            },
          });
        }

        await trackingPort.toggleTask(date, taskId, userId);

        // Refresh to ensure sync
        await fetchDayLog();
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to toggle task')
        );
        // Revert on error
        await fetchDayLog();
      }
    },
    [date, userId, dayLog, fetchDayLog]
  );

  // Initial fetch
  useEffect(() => {
    fetchDayLog();
  }, [fetchDayLog]);

  // Real-time subscription will be added when InstantDB is integrated
  // This will enable automatic updates when data changes on other devices

  return {
    dayLog,
    isLoading,
    error,
    toggleTask,
    refresh: fetchDayLog,
  };
}

// Hook for fetching multiple days (for heatmap)
interface UseTrackingRangeOptions {
  userId: string;
  startDate: string;
  endDate: string;
}

interface UseTrackingRangeReturn {
  logs: DayLog[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useTrackingRange({
  userId,
  startDate,
  endDate,
}: UseTrackingRangeOptions): UseTrackingRangeReturn {
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const trackingPort = new TrackingPort(mockInstantDBClient);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await trackingPort.getDateRange(
        startDate,
        endDate,
        userId
      );
      setLogs(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, userId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Real-time subscription for range updates will be added with InstantDB integration
  // This will enable live updates of the heatmap when tasks are completed

  return {
    logs,
    isLoading,
    error,
    refresh: fetchLogs,
  };
}
