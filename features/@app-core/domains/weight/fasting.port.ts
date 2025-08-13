import type { InstantDBClient } from '../types/instantdb.types';
import {
  calculateFastingDuration,
  calculateFastingStats,
} from './fasting.utils';
import type { FastingEntry, FastingStats } from './weight.types';

export class FastingPort {
  constructor(private readonly instantDB: InstantDBClient) {}

  async startFast(
    userId: string,
    startTime: string,
    targetHours: number,
    pattern?: string
  ): Promise<{ id: string }> {
    // Extract date from start time
    const date = startTime.split('T')[0];

    return await this.instantDB.createFastingEntry({
      userId,
      date,
      startTime,
      targetHours,
      pattern,
    });
  }

  async endFast(
    entryId: string,
    endTime: string,
    actualHours: number
  ): Promise<void> {
    await this.instantDB.updateFastingEntry(entryId, {
      endTime,
      actualHours,
    });
  }

  async getActiveFast(userId: string): Promise<FastingEntry | null> {
    const result = await this.instantDB.query({
      fastingEntries: {
        $: {
          where: {
            userId,
            endTime: { $exists: false },
          },
        },
      },
    });

    return result.data?.fastingEntries?.[0] || null;
  }

  async getFastingHistory(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<FastingEntry[]> {
    const result = await this.instantDB.query({
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

    return result.data?.fastingEntries || [];
  }

  async getFastingStats(
    userId: string,
    days: number
  ): Promise<FastingStats | null> {
    // Calculate start date based on days parameter
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const entries = await this.getFastingHistory(userId, startDate, endDate);

    if (entries.length === 0) {
      return null;
    }

    return calculateFastingStats(entries);
  }

  async updateFastingEntry(
    id: string,
    updates: Partial<
      Pick<FastingEntry, 'targetHours' | 'pattern' | 'endTime' | 'actualHours'>
    >
  ): Promise<void> {
    await this.instantDB.updateFastingEntry(id, updates);
  }

  async deleteFastingEntry(id: string): Promise<void> {
    await this.instantDB.deleteFastingEntry(id);
  }

  async getCurrentFastDuration(
    userId: string,
    currentTime?: string
  ): Promise<number> {
    const activeFast = await this.getActiveFast(userId);

    if (!activeFast) {
      return 0;
    }

    return calculateFastingDuration(
      activeFast.startTime,
      undefined,
      currentTime
    );
  }
}
