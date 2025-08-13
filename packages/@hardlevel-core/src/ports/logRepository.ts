import type { DayLog, ISODate, TaskId } from "../domain/types";

export interface LogRepository {
  getByDate(date: ISODate): Promise<DayLog | null>;
  save(log: DayLog): Promise<void>;
}

export interface ChecklistServiceResult {
  log: DayLog;
  completionPct: number;
}

/** Toggle a task and persist using the repository port */
export interface ChecklistServicePort {
  toggleTask(date: ISODate, taskId: TaskId): Promise<ChecklistServiceResult>;
}

