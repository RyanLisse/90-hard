import type { DayLog, TaskId } from '../../../packages/domain/src/types';
import type { InstantDBClient } from './types/instantdb.types';

export class TrackingPort {
  constructor(private readonly instantDB: InstantDBClient) {}

  async toggleTask(
    date: string,
    taskId: TaskId,
    userId: string
  ): Promise<void> {
    // Check if a day log exists for this date
    const result = await this.instantDB.query({
      daylogs: {
        $: {
          where: {
            date,
            userId,
          },
        },
      },
    });

    const existingLog = result.data?.daylogs?.[0];

    if (existingLog) {
      // Toggle the existing task
      const updatedTasks = { ...existingLog.tasks };
      updatedTasks[taskId] = !updatedTasks[taskId];

      await this.instantDB.updateDayLog(existingLog.id, {
        tasks: updatedTasks,
      });
    } else {
      // Create new day log with the task toggled on
      const newTasks = {
        workout1: false,
        workout2: false,
        diet: false,
        water: false,
        reading: false,
        photo: false,
      };
      newTasks[taskId] = true;

      await this.instantDB.createDayLog({
        userId,
        date,
        tasks: newTasks,
      });
    }
  }

  async getDayLog(date: string, userId: string): Promise<DayLog | null> {
    const result = await this.instantDB.query({
      daylogs: {
        $: {
          where: {
            date,
            userId,
          },
        },
      },
    });

    return result.data?.daylogs?.[0] || null;
  }

  async getDateRange(
    startDate: string,
    endDate: string,
    userId: string
  ): Promise<DayLog[]> {
    const result = await this.instantDB.query({
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

    return result.data?.daylogs || [];
  }
}
