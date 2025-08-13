import { computeDayCompletion } from "../domain/compute";
import { emptyTasks, type DayLog, type ISODate, type TaskId } from "../domain/types";
import type { ChecklistServicePort, ChecklistServiceResult, LogRepository } from "../ports/logRepository";

export class ChecklistService implements ChecklistServicePort {
  private readonly repo: LogRepository;

  constructor(repo: LogRepository) {
    this.repo = repo;
  }

  async toggleTask(date: ISODate, taskId: TaskId): Promise<ChecklistServiceResult> {
    const existing = await this.repo.getByDate(date);
    const next: DayLog = existing ?? { date, tasks: emptyTasks() };
    next.tasks[taskId] = !next.tasks[taskId];
    await this.repo.save(next);
    return { log: next, completionPct: computeDayCompletion(next) };
  }
}

