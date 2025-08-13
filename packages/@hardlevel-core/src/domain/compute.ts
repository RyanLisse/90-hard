import type { DayLog } from "./types";

/** Compute completion percentage for a day's log (0-100) */
export const computeDayCompletion = (log: DayLog): number => {
  const total = 6; // fixed set
  const done = Object.values(log.tasks).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);
  return Math.min(100, Math.max(0, pct));
};

