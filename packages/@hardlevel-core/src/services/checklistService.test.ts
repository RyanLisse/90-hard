import { describe, expect, it } from "bun:test";
import { ChecklistService } from "./checklistService";
import type { DayLog } from "../domain/types";

class InMemoryRepo {
  private store = new Map<string, DayLog>();
  async getByDate(date: string): Promise<DayLog | null> {
    return this.store.get(date) ?? null;
  }
  async save(log: DayLog): Promise<void> {
    this.store.set(log.date, log);
  }
}

describe("ChecklistService (London style against repo port)", () => {
  it("toggles a task and updates completion", async () => {
    const repo = new InMemoryRepo();
    const svc = new ChecklistService(repo);
    const res1 = await svc.toggleTask("2024-03-01", "diet");
    expect(res1.log.tasks.diet).toBe(true);
    expect(res1.completionPct).toBe(17);

    const res2 = await svc.toggleTask("2024-03-01", "diet");
    expect(res2.log.tasks.diet).toBe(false);
    expect(res2.completionPct).toBe(0);
  });
});

