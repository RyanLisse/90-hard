import { describe, expect, it } from "bun:test";
import { computeDayCompletion } from "./compute";
import { emptyTasks, type DayLog } from "./types";

const makeLog = (done: number): DayLog => {
  const tasks = emptyTasks();
  const ids = Object.keys(tasks) as (keyof typeof tasks)[];
  for (let i = 0; i < done; i++) tasks[ids[i]] = true;
  return { date: "2024-01-01", tasks };
};

describe("computeDayCompletion", () => {
  it("returns 0 for none", () => {
    expect(computeDayCompletion(makeLog(0))).toBe(0);
  });

  it("returns correct rounded percent", () => {
    expect(computeDayCompletion(makeLog(3))).toBe(50);
    expect(computeDayCompletion(makeLog(5))).toBe(83);
  });

  it("caps at 100", () => {
    expect(computeDayCompletion(makeLog(8))).toBe(100);
  });
});

