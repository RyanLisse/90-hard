import type { InstantDBClient } from '../types/instantdb.types';
import type {
  WeightEntry,
  WeightGoal,
  WeightStats,
  WeightUnit,
} from './weight.types';
import {
  calculateMovingAverage,
  calculateWeightDelta,
  determineTrend,
} from './weight.utils';

export class WeightPort {
  constructor(private readonly instantDB: InstantDBClient) {}

  async addWeightEntry(
    userId: string,
    date: string,
    weight: number,
    unit: WeightUnit
  ): Promise<{ id: string }> {
    return await this.instantDB.createWeightEntry({
      userId,
      date,
      weight,
      unit,
    });
  }

  async getWeightEntry(
    userId: string,
    date: string
  ): Promise<WeightEntry | null> {
    const result = await this.instantDB.query({
      weightEntries: {
        $: {
          where: {
            userId,
            date,
          },
        },
      },
    });

    return result.data?.weightEntries?.[0] || null;
  }

  async getWeightHistory(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<WeightEntry[]> {
    const result = await this.instantDB.query({
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

    return result.data?.weightEntries || [];
  }

  async updateWeightEntry(
    id: string,
    updates: Partial<Pick<WeightEntry, 'weight' | 'unit'>>
  ): Promise<void> {
    await this.instantDB.updateWeightEntry(id, updates);
  }

  async deleteWeightEntry(id: string): Promise<void> {
    await this.instantDB.deleteWeightEntry(id);
  }

  async getWeightStats(
    userId: string,
    days: number
  ): Promise<WeightStats | null> {
    // Calculate start date based on days parameter
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const entries = await this.getWeightHistory(userId, startDate, endDate);

    if (entries.length === 0) {
      return null;
    }

    // Sort entries by date (oldest first)
    const sortedEntries = entries.sort((a, b) => a.date.localeCompare(b.date));

    const currentEntry = sortedEntries[sortedEntries.length - 1];
    const previousEntry =
      sortedEntries.length > 1
        ? sortedEntries[sortedEntries.length - 2]
        : undefined;

    return {
      currentWeight: currentEntry.weight,
      currentUnit: currentEntry.unit,
      previousWeight: previousEntry?.weight,
      delta: calculateWeightDelta(currentEntry.weight, previousEntry?.weight),
      movingAverage7Day: calculateMovingAverage(sortedEntries, 7),
      movingAverage30Day: calculateMovingAverage(sortedEntries, 30),
      trend: determineTrend(sortedEntries),
    };
  }

  async createWeightGoal(
    userId: string,
    targetWeight: number,
    targetUnit: WeightUnit,
    startDate: string,
    endDate?: string
  ): Promise<{ id: string }> {
    return await this.instantDB.createWeightGoal({
      userId,
      targetWeight,
      targetUnit,
      startDate,
      endDate,
    });
  }

  async getActiveWeightGoal(
    userId: string,
    currentDate: string
  ): Promise<WeightGoal | null> {
    const result = await this.instantDB.query({
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

    return result.data?.weightGoals?.[0] || null;
  }

  async updateWeightGoal(
    id: string,
    updates: Partial<
      Pick<WeightGoal, 'targetWeight' | 'targetUnit' | 'endDate'>
    >
  ): Promise<void> {
    await this.instantDB.updateWeightGoal(id, updates);
  }
}
