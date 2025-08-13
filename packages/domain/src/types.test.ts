import { describe, it, expect } from "bun:test";
import {
  TaskId,
  DayLog,
  computeDayCompletion,
  xpForDay,
  nextLevelAt,
  calculateLevel,
  getRankForLevel,
  kgToLbs,
  lbsToKg,
  getStreakDates,
} from "./types";

describe("Domain Types", () => {
  describe("TaskId", () => {
    it("should validate valid task IDs", () => {
      const validIds = [
        "workout1",
        "workout2",
        "diet",
        "water",
        "reading",
        "photo",
      ];
      // Test each valid ID
      for (const id of validIds) {
        const result = TaskId.safeParse(id);
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid task IDs", () => {
      expect(() => TaskId.parse("invalid")).toThrow();
    });
  });

  describe("DayLog", () => {
    it("should create a valid day log", () => {
      const log = DayLog.parse({
        id: "1",
        userId: "user1",
        date: "2024-01-01",
        tasks: {
          workout1: true,
          workout2: false,
          diet: true,
          water: true,
          reading: false,
          photo: true,
        },
        weightKg: 75.5,
        fastingH: 16,
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-01T10:00:00Z",
      });

      expect(log.id).toBe("1");
      expect(log.tasks.workout1).toBe(true);
      expect(log.weightKg).toBe(75.5);
    });
  });

  describe("computeDayCompletion", () => {
    it("should calculate 0% for no tasks completed", () => {
      const log = {
        tasks: {
          workout1: false,
          workout2: false,
          diet: false,
          water: false,
          reading: false,
          photo: false,
        },
      } as DayLog;

      expect(computeDayCompletion(log)).toBe(0);
    });

    it("should calculate 100% for all tasks completed", () => {
      const log = {
        tasks: {
          workout1: true,
          workout2: true,
          diet: true,
          water: true,
          reading: true,
          photo: true,
        },
      } as DayLog;

      expect(computeDayCompletion(log)).toBe(100);
    });

    it("should calculate 50% for half tasks completed", () => {
      const log = {
        tasks: {
          workout1: true,
          workout2: true,
          diet: true,
          water: false,
          reading: false,
          photo: false,
        },
      } as DayLog;

      expect(computeDayCompletion(log)).toBe(50);
    });
  });

  describe("XP and Level calculations", () => {
    it("should award XP equal to completion percentage", () => {
      expect(xpForDay(100)).toBe(100);
      expect(xpForDay(75)).toBe(75);
      expect(xpForDay(0)).toBe(0);
    });

    it("should calculate next level XP requirements", () => {
      expect(nextLevelAt(1)).toBe(200); // 100 * 1 * 2
      expect(nextLevelAt(2)).toBe(600); // 100 * 2 * 3
      expect(nextLevelAt(3)).toBe(1200); // 100 * 3 * 4
    });

    it("should calculate current level from total XP", () => {
      expect(calculateLevel(0)).toEqual({ level: 1, xpToNext: 200 });
      expect(calculateLevel(199)).toEqual({ level: 1, xpToNext: 1 });
      expect(calculateLevel(200)).toEqual({ level: 2, xpToNext: 400 });
      expect(calculateLevel(599)).toEqual({ level: 2, xpToNext: 1 });
      expect(calculateLevel(600)).toEqual({ level: 3, xpToNext: 600 });
    });

    it("should assign ranks based on level", () => {
      expect(getRankForLevel(1)).toBe("E");
      expect(getRankForLevel(9)).toBe("E");
      expect(getRankForLevel(10)).toBe("D");
      expect(getRankForLevel(19)).toBe("D");
      expect(getRankForLevel(20)).toBe("C");
      expect(getRankForLevel(30)).toBe("B");
      expect(getRankForLevel(40)).toBe("A");
      expect(getRankForLevel(50)).toBe("S");
      expect(getRankForLevel(100)).toBe("S");
    });
  });

  describe("Weight conversions", () => {
    it("should convert kg to lbs", () => {
      expect(kgToLbs(1)).toBe(2.2);
      expect(kgToLbs(75)).toBe(165.3);
      expect(kgToLbs(100)).toBe(220.5);
    });

    it("should convert lbs to kg", () => {
      expect(lbsToKg(2.2)).toBe(1);
      expect(lbsToKg(165.3)).toBe(75);
      expect(lbsToKg(220.5)).toBe(100);
    });
  });

  describe("Streak calculations", () => {
    it("should return 0 for empty logs", () => {
      expect(getStreakDates([])).toEqual({ current: 0, longest: 0 });
    });

    it("should calculate current streak", () => {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];
      const twoDaysAgo = new Date(Date.now() - 172800000)
        .toISOString()
        .split("T")[0];

      const logs = [
        {
          date: today,
          tasks: {
            workout1: true,
            workout2: true,
            diet: true,
            water: true,
            reading: true,
            photo: true,
          },
        },
        {
          date: yesterday,
          tasks: {
            workout1: true,
            workout2: true,
            diet: true,
            water: true,
            reading: true,
            photo: true,
          },
        },
        {
          date: twoDaysAgo,
          tasks: {
            workout1: true,
            workout2: true,
            diet: true,
            water: true,
            reading: true,
            photo: true,
          },
        },
      ] as DayLog[];

      const result = getStreakDates(logs);
      expect(result.current).toBe(3);
      expect(result.longest).toBe(3);
    });
  });
});
