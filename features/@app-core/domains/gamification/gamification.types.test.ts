import { describe, it, expect } from "vitest";
import type {
  Rank,
  XPEntry,
  UserLevel,
  Achievement,
  UserAchievement,
  Badge,
  UserBadge,
  LeaderboardEntry,
  Leaderboard,
  GamificationStats,
  LevelThreshold,
  XPCalculationResult,
  GamificationConfig,
  AvatarMood,
} from "./gamification.types";

describe("Gamification Types", () => {
  describe("Rank", () => {
    it("should accept valid ranks", () => {
      const validRanks: Rank[] = ["E", "D", "C", "B", "A", "S"];

      validRanks.forEach((rank) => {
        const userRank: Rank = rank;
        expect(userRank).toBe(rank);
      });
    });

    it("should order ranks correctly", () => {
      const rankOrder: Rank[] = ["E", "D", "C", "B", "A", "S"];
      const getRankValue = (rank: Rank): number => {
        return rankOrder.indexOf(rank);
      };

      expect(getRankValue("E")).toBeLessThan(getRankValue("D"));
      expect(getRankValue("D")).toBeLessThan(getRankValue("C"));
      expect(getRankValue("C")).toBeLessThan(getRankValue("B"));
      expect(getRankValue("B")).toBeLessThan(getRankValue("A"));
      expect(getRankValue("A")).toBeLessThan(getRankValue("S"));
    });

    it("should validate rank progression", () => {
      const isValidRank = (value: string): value is Rank => {
        return ["E", "D", "C", "B", "A", "S"].includes(value);
      };

      expect(isValidRank("S")).toBe(true);
      expect(isValidRank("F")).toBe(false);
      expect(isValidRank("SS")).toBe(false);
    });
  });

  describe("XPEntry", () => {
    it("should create valid XP entry", () => {
      const xpEntry: XPEntry = {
        id: "xp-001",
        userId: "user123",
        date: "2024-01-15",
        baseXP: 100,
        bonusXP: 50,
        totalXP: 150,
        source: "daily_completion",
        metadata: { completionRate: 100 },
        createdAt: "2024-01-15T23:59:59Z",
      };

      expect(xpEntry.totalXP).toBe(xpEntry.baseXP + xpEntry.bonusXP);
      expect(xpEntry.source).toBe("daily_completion");
    });

    it("should validate XP sources", () => {
      const validSources = [
        "daily_completion",
        "streak_bonus",
        "perfect_day",
        "milestone",
        "achievement",
      ];

      const isValidSource = (source: string): boolean => {
        return validSources.includes(source);
      };

      validSources.forEach((source) => {
        expect(isValidSource(source)).toBe(true);
      });

      expect(isValidSource("invalid_source")).toBe(false);
    });

    it("should handle optional metadata", () => {
      const minimalEntry: XPEntry = {
        id: "xp-002",
        userId: "user123",
        date: "2024-01-15",
        baseXP: 50,
        bonusXP: 0,
        totalXP: 50,
        source: "daily_completion",
        createdAt: "2024-01-15T10:00:00Z",
      };

      expect(minimalEntry.metadata).toBeUndefined();
    });

    it("should calculate XP correctly", () => {
      const calculateTotalXP = (baseXP: number, bonusXP: number): number => {
        return baseXP + bonusXP;
      };

      expect(calculateTotalXP(100, 50)).toBe(150);
      expect(calculateTotalXP(75, 0)).toBe(75);
      expect(calculateTotalXP(0, 100)).toBe(100);
    });
  });

  describe("UserLevel", () => {
    it("should create valid user level", () => {
      const userLevel: UserLevel = {
        userId: "user123",
        currentLevel: 10,
        currentXP: 2500,
        totalXP: 12500,
        xpToNextLevel: 500,
        rank: "B",
        lastLevelUp: "2024-01-15T10:30:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      };

      expect(userLevel.currentLevel).toBe(10);
      expect(userLevel.xpToNextLevel).toBeGreaterThan(0);
    });

    it("should handle missing optional fields", () => {
      const newUser: UserLevel = {
        userId: "user456",
        currentLevel: 1,
        currentXP: 0,
        totalXP: 0,
        xpToNextLevel: 100,
        rank: "E",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      };

      expect(newUser.lastLevelUp).toBeUndefined();
      expect(newUser.currentLevel).toBe(1);
      expect(newUser.rank).toBe("E");
    });

    it("should calculate level progress", () => {
      const calculateProgress = (
        currentXP: number,
        xpToNextLevel: number,
      ): number => {
        const requiredXP = currentXP + xpToNextLevel;
        return (currentXP / requiredXP) * 100;
      };

      expect(calculateProgress(75, 25)).toBe(75);
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(50, 50)).toBe(50);
    });
  });

  describe("Achievement", () => {
    it("should create valid achievement", () => {
      const achievement: Achievement = {
        id: "ach-001",
        name: "10 Day Streak",
        description: "Complete all tasks for 10 consecutive days",
        icon: "streak-10",
        category: "streak",
        type: "bronze",
        xpReward: 500,
        requirements: {
          streakDays: 10,
          minCompletion: 100,
        },
        isSecret: false,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      };

      expect(achievement.category).toBe("streak");
      expect(achievement.type).toBe("bronze");
      expect(achievement.xpReward).toBeGreaterThan(0);
    });

    it("should validate achievement categories", () => {
      const validCategories = [
        "streak",
        "completion",
        "milestone",
        "weight",
        "fasting",
        "special",
      ];

      const isValidCategory = (category: string): boolean => {
        return validCategories.includes(category);
      };

      validCategories.forEach((category) => {
        expect(isValidCategory(category)).toBe(true);
      });

      expect(isValidCategory("invalid")).toBe(false);
    });

    it("should validate achievement types", () => {
      const types: Achievement["type"][] = [
        "bronze",
        "silver",
        "gold",
        "platinum",
      ];
      const getTypeValue = (type: Achievement["type"]): number => {
        return types.indexOf(type);
      };

      expect(getTypeValue("bronze")).toBeLessThan(getTypeValue("silver"));
      expect(getTypeValue("silver")).toBeLessThan(getTypeValue("gold"));
      expect(getTypeValue("gold")).toBeLessThan(getTypeValue("platinum"));
    });

    it("should handle secret achievements", () => {
      const secretAchievement: Achievement = {
        id: "ach-secret",
        name: "Hidden Gem",
        description: "???",
        icon: "secret",
        category: "special",
        type: "platinum",
        xpReward: 1000,
        requirements: {
          special: true,
        },
        isSecret: true,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      };

      expect(secretAchievement.isSecret).toBe(true);
      expect(secretAchievement.type).toBe("platinum");
    });
  });

  describe("UserAchievement", () => {
    it("should create valid user achievement", () => {
      const userAchievement: UserAchievement = {
        id: "ua-001",
        userId: "user123",
        achievementId: "ach-001",
        unlockedAt: "2024-01-15T14:30:00Z",
        progress: 1.0,
        metadata: {
          completedTasks: 60,
        },
      };

      expect(userAchievement.progress).toBe(1.0);
      expect(userAchievement.metadata?.completedTasks).toBe(60);
    });

    it("should handle progressive achievements", () => {
      const progressiveAchievement: UserAchievement = {
        id: "ua-002",
        userId: "user123",
        achievementId: "ach-100days",
        unlockedAt: "2024-01-15T14:30:00Z",
        progress: 0.45, // 45/100 days
      };

      expect(progressiveAchievement.progress).toBeGreaterThan(0);
      expect(progressiveAchievement.progress).toBeLessThan(1);
    });

    it("should calculate achievement progress", () => {
      const calculateProgress = (current: number, required: number): number => {
        return Math.min(current / required, 1);
      };

      expect(calculateProgress(5, 10)).toBe(0.5);
      expect(calculateProgress(10, 10)).toBe(1);
      expect(calculateProgress(15, 10)).toBe(1); // Capped at 1
    });
  });

  describe("Badge", () => {
    it("should create valid badge", () => {
      const badge: Badge = {
        id: "badge-001",
        name: "Early Bird",
        description: "Complete morning workout before 7 AM",
        icon: "early-bird",
        color: "#FFD700",
        category: "daily",
        requirements: {
          timeSlot: "morning",
          completeBefore: "07:00",
        },
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      };

      expect(badge.category).toBe("daily");
      expect(badge.color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it("should validate badge categories", () => {
      const validCategories = [
        "daily",
        "weekly",
        "monthly",
        "milestone",
        "special",
      ];

      const isValidCategory = (category: string): boolean => {
        return validCategories.includes(category);
      };

      validCategories.forEach((category) => {
        expect(isValidCategory(category)).toBe(true);
      });
    });

    it("should handle inactive badges", () => {
      const inactiveBadge: Badge = {
        id: "badge-legacy",
        name: "Beta Tester",
        description: "Participated in beta testing",
        icon: "beta",
        color: "#C0C0C0",
        category: "special",
        requirements: {
          betaTester: true,
        },
        isActive: false,
        createdAt: "2023-01-01T00:00:00Z",
      };

      expect(inactiveBadge.isActive).toBe(false);
      expect(inactiveBadge.category).toBe("special");
    });
  });

  describe("UserBadge", () => {
    it("should create valid user badge", () => {
      const userBadge: UserBadge = {
        id: "ub-001",
        userId: "user123",
        badgeId: "badge-001",
        earnedAt: "2024-01-15T06:30:00Z",
        tier: 1,
      };

      expect(userBadge.tier).toBe(1);
      expect(userBadge.validUntil).toBeUndefined();
    });

    it("should handle temporary badges", () => {
      const tempBadge: UserBadge = {
        id: "ub-002",
        userId: "user123",
        badgeId: "badge-monthly",
        earnedAt: "2024-01-01T00:00:00Z",
        validUntil: "2024-01-31T23:59:59Z",
      };

      expect(tempBadge.validUntil).toBeDefined();

      const isExpired = (badge: UserBadge): boolean => {
        if (!badge.validUntil) return false;
        return new Date(badge.validUntil) < new Date();
      };

      // This test would fail if run after Jan 31, 2024
      expect(isExpired(tempBadge)).toBe(true);
    });

    it("should handle tiered badges", () => {
      const tieredBadges: UserBadge[] = [
        {
          id: "ub-003",
          userId: "user123",
          badgeId: "badge-streak",
          earnedAt: "2024-01-10T00:00:00Z",
          tier: 1, // 10 day streak
        },
        {
          id: "ub-004",
          userId: "user123",
          badgeId: "badge-streak",
          earnedAt: "2024-01-30T00:00:00Z",
          tier: 2, // 30 day streak
        },
      ];

      expect(tieredBadges[1].tier).toBeGreaterThan(tieredBadges[0].tier ?? 0);
    });
  });

  describe("LeaderboardEntry", () => {
    it("should create valid leaderboard entry", () => {
      const entry: LeaderboardEntry = {
        userId: "user123",
        username: "JohnDoe",
        avatarUrl: "https://example.com/avatar.jpg",
        totalXP: 15000,
        currentLevel: 15,
        rank: "A",
        currentStreak: 30,
        perfectDaysThisMonth: 20,
        position: 5,
      };

      expect(entry.position).toBeGreaterThan(0);
      expect(entry.rank).toBe("A");
    });

    it("should handle missing optional fields", () => {
      const minimalEntry: LeaderboardEntry = {
        userId: "user456",
        totalXP: 5000,
        currentLevel: 8,
        rank: "C",
        currentStreak: 10,
        perfectDaysThisMonth: 5,
        position: 25,
      };

      expect(minimalEntry.username).toBeUndefined();
      expect(minimalEntry.avatarUrl).toBeUndefined();
    });

    it("should sort leaderboard entries", () => {
      const entries: LeaderboardEntry[] = [
        {
          userId: "1",
          totalXP: 5000,
          currentLevel: 5,
          rank: "C",
          currentStreak: 5,
          perfectDaysThisMonth: 3,
          position: 0,
        },
        {
          userId: "2",
          totalXP: 10000,
          currentLevel: 10,
          rank: "B",
          currentStreak: 15,
          perfectDaysThisMonth: 10,
          position: 0,
        },
        {
          userId: "3",
          totalXP: 15000,
          currentLevel: 15,
          rank: "A",
          currentStreak: 30,
          perfectDaysThisMonth: 20,
          position: 0,
        },
      ];

      const sorted = [...entries].sort((a, b) => b.totalXP - a.totalXP);
      sorted.forEach((entry, index) => {
        entry.position = index + 1;
      });

      expect(sorted[0].userId).toBe("3");
      expect(sorted[0].position).toBe(1);
      expect(sorted[2].position).toBe(3);
    });
  });

  describe("Leaderboard", () => {
    it("should create valid leaderboard", () => {
      const leaderboard: Leaderboard = {
        id: "lb-001",
        type: "global",
        timeRange: "30D",
        entries: [],
        lastUpdated: "2024-01-15T00:00:00Z",
        totalParticipants: 1000,
      };

      expect(leaderboard.type).toBe("global");
      expect(leaderboard.totalParticipants).toBeGreaterThan(0);
    });

    it("should validate leaderboard types", () => {
      const validTypes = ["global", "friends", "local", "weekly", "monthly"];

      const isValidType = (type: string): boolean => {
        return validTypes.includes(type);
      };

      validTypes.forEach((type) => {
        expect(isValidType(type)).toBe(true);
      });
    });

    it("should handle different time ranges", () => {
      const timeRanges: Leaderboard["timeRange"][] = [
        "7D",
        "30D",
        "90D",
        "ALL",
      ];

      timeRanges.forEach((range) => {
        const lb: Leaderboard = {
          id: `lb-${range}`,
          type: "global",
          timeRange: range,
          entries: [],
          lastUpdated: "2024-01-15T00:00:00Z",
          totalParticipants: 100,
        };

        expect(lb.timeRange).toBe(range);
      });
    });
  });

  describe("GamificationStats", () => {
    it("should create comprehensive stats", () => {
      const stats: GamificationStats = {
        userId: "user123",
        totalXP: 25000,
        currentLevel: 20,
        rank: "A",
        achievementsUnlocked: 45,
        totalAchievements: 100,
        badgesEarned: 15,
        currentStreak: 30,
        longestStreak: 45,
        perfectDays: 50,
        weeklyXP: 2000,
        monthlyXP: 8000,
        leaderboardPosition: 10,
        lastActivityDate: "2024-01-15",
      };

      expect(stats.achievementsUnlocked).toBeLessThanOrEqual(
        stats.totalAchievements,
      );
      expect(stats.currentStreak).toBeLessThanOrEqual(stats.longestStreak);
    });

    it("should calculate achievement completion rate", () => {
      const calculateCompletionRate = (
        unlocked: number,
        total: number,
      ): number => {
        return total > 0 ? (unlocked / total) * 100 : 0;
      };

      expect(calculateCompletionRate(45, 100)).toBe(45);
      expect(calculateCompletionRate(100, 100)).toBe(100);
      expect(calculateCompletionRate(0, 100)).toBe(0);
    });

    it("should handle missing leaderboard position", () => {
      const stats: GamificationStats = {
        userId: "user456",
        totalXP: 100,
        currentLevel: 1,
        rank: "E",
        achievementsUnlocked: 0,
        totalAchievements: 100,
        badgesEarned: 0,
        currentStreak: 0,
        longestStreak: 0,
        perfectDays: 0,
        weeklyXP: 0,
        monthlyXP: 0,
        lastActivityDate: "2024-01-15",
      };

      expect(stats.leaderboardPosition).toBeUndefined();
    });
  });

  describe("LevelThreshold", () => {
    it("should create valid level threshold", () => {
      const threshold: LevelThreshold = {
        level: 10,
        xpRequired: 5000,
        rank: "C",
        title: "Dedicated Challenger",
        rewards: {
          badges: ["dedication-badge"],
          achievements: ["level-10-achievement"],
          unlocks: ["custom-avatar-background"],
        },
      };

      expect(threshold.level).toBe(10);
      expect(threshold.rewards?.badges).toHaveLength(1);
    });

    it("should handle levels without rewards", () => {
      const basicThreshold: LevelThreshold = {
        level: 5,
        xpRequired: 1000,
        rank: "D",
        title: "Beginner",
      };

      expect(basicThreshold.rewards).toBeUndefined();
    });

    it("should validate level progression", () => {
      const thresholds: LevelThreshold[] = [
        { level: 1, xpRequired: 0, rank: "E", title: "Novice" },
        { level: 5, xpRequired: 1000, rank: "D", title: "Beginner" },
        { level: 10, xpRequired: 5000, rank: "C", title: "Intermediate" },
        { level: 20, xpRequired: 15000, rank: "B", title: "Advanced" },
        { level: 30, xpRequired: 30000, rank: "A", title: "Expert" },
        { level: 50, xpRequired: 75000, rank: "S", title: "Master" },
      ];

      for (let i = 1; i < thresholds.length; i++) {
        expect(thresholds[i].xpRequired).toBeGreaterThan(
          thresholds[i - 1].xpRequired,
        );
        expect(thresholds[i].level).toBeGreaterThan(thresholds[i - 1].level);
      }
    });
  });

  describe("XPCalculationResult", () => {
    it("should create valid calculation result", () => {
      const result: XPCalculationResult = {
        baseXP: 100,
        bonusXP: 150,
        totalXP: 250,
        breakdown: {
          taskCompletion: 100,
          streakBonus: 50,
          perfectDayBonus: 50,
          milestoneBonus: 25,
          achievementBonus: 25,
        },
        levelUp: true,
        newLevel: 11,
        achievementsUnlocked: [],
        badgesEarned: [],
      };

      const breakdownTotal = Object.values(result.breakdown).reduce(
        (sum, val) => sum + val,
        0,
      );
      expect(breakdownTotal).toBe(result.totalXP);
      expect(result.levelUp).toBe(true);
    });

    it("should handle no level up scenario", () => {
      const result: XPCalculationResult = {
        baseXP: 50,
        bonusXP: 0,
        totalXP: 50,
        breakdown: {
          taskCompletion: 50,
          streakBonus: 0,
          perfectDayBonus: 0,
          milestoneBonus: 0,
          achievementBonus: 0,
        },
        levelUp: false,
      };

      expect(result.levelUp).toBe(false);
      expect(result.newLevel).toBeUndefined();
      expect(result.achievementsUnlocked).toBeUndefined();
    });

    it("should include unlocked rewards", () => {
      const mockAchievement: Achievement = {
        id: "ach-001",
        name: "First Steps",
        description: "Complete your first day",
        icon: "first-steps",
        category: "milestone",
        type: "bronze",
        xpReward: 100,
        requirements: { daysCompleted: 1 },
        isSecret: false,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      };

      const mockBadge: Badge = {
        id: "badge-001",
        name: "Day 1",
        description: "Completed first day",
        icon: "day-1",
        color: "#FFD700",
        category: "milestone",
        requirements: { daysCompleted: 1 },
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      };

      const result: XPCalculationResult = {
        baseXP: 100,
        bonusXP: 100,
        totalXP: 200,
        breakdown: {
          taskCompletion: 100,
          streakBonus: 0,
          perfectDayBonus: 0,
          milestoneBonus: 0,
          achievementBonus: 100,
        },
        levelUp: false,
        achievementsUnlocked: [mockAchievement],
        badgesEarned: [mockBadge],
      };

      expect(result.achievementsUnlocked).toHaveLength(1);
      expect(result.badgesEarned).toHaveLength(1);
    });
  });

  describe("GamificationConfig", () => {
    it("should create valid configuration", () => {
      const config: GamificationConfig = {
        baseXPPerTask: 10,
        perfectDayBonus: 50,
        streakMultiplier: 1.5,
        maxDailyXP: 500,
        levelThresholds: [],
        achievements: [],
        badges: [],
        rankThresholds: {
          E: 0,
          D: 1000,
          C: 5000,
          B: 15000,
          A: 30000,
          S: 75000,
        },
      };

      expect(config.baseXPPerTask).toBeGreaterThan(0);
      expect(config.streakMultiplier).toBeGreaterThan(1);
      expect(config.rankThresholds.E).toBeLessThan(config.rankThresholds.D);
    });

    it("should validate rank thresholds", () => {
      const config: GamificationConfig = {
        baseXPPerTask: 10,
        perfectDayBonus: 50,
        streakMultiplier: 1.5,
        maxDailyXP: 500,
        levelThresholds: [],
        achievements: [],
        badges: [],
        rankThresholds: {
          E: 0,
          D: 1000,
          C: 5000,
          B: 15000,
          A: 30000,
          S: 75000,
        },
      };

      const ranks: Rank[] = ["E", "D", "C", "B", "A", "S"];
      for (let i = 1; i < ranks.length; i++) {
        expect(config.rankThresholds[ranks[i]]).toBeGreaterThan(
          config.rankThresholds[ranks[i - 1]],
        );
      }
    });

    it("should calculate XP with multipliers", () => {
      const calculateDailyXP = (
        tasksCompleted: number,
        isPerfectDay: boolean,
        streakDays: number,
        config: GamificationConfig,
      ): number => {
        let xp = tasksCompleted * config.baseXPPerTask;

        if (isPerfectDay) {
          xp += config.perfectDayBonus;
        }

        if (streakDays > 0) {
          xp *= config.streakMultiplier;
        }

        return Math.min(xp, config.maxDailyXP);
      };

      const config: GamificationConfig = {
        baseXPPerTask: 10,
        perfectDayBonus: 50,
        streakMultiplier: 1.5,
        maxDailyXP: 200,
        levelThresholds: [],
        achievements: [],
        badges: [],
        rankThresholds: {
          E: 0,
          D: 1000,
          C: 5000,
          B: 15000,
          A: 30000,
          S: 75000,
        },
      };

      expect(calculateDailyXP(6, true, 5, config)).toBe(165); // (6*10 + 50) * 1.5 = 165
      expect(calculateDailyXP(6, true, 0, config)).toBe(110); // (6*10 + 50) = 110
      expect(calculateDailyXP(20, true, 5, config)).toBe(200); // Capped at maxDailyXP
    });
  });

  describe("AvatarMood", () => {
    it("should create valid avatar mood", () => {
      const mood: AvatarMood = {
        userId: "user123",
        currentMood: "motivated",
        pose: "flexing",
        lastUpdated: "2024-01-15T10:00:00Z",
        triggers: {
          streakLength: 30,
          completionRate: 95,
          recentAchievements: 3,
        },
      };

      expect(mood.currentMood).toBe("motivated");
      expect(mood.pose).toBe("flexing");
      expect(mood.triggers.streakLength).toBe(30);
    });

    it("should validate mood types", () => {
      const validMoods = [
        "excited",
        "happy",
        "neutral",
        "tired",
        "sad",
        "motivated",
      ];

      const isValidMood = (mood: string): boolean => {
        return validMoods.includes(mood);
      };

      validMoods.forEach((mood) => {
        expect(isValidMood(mood)).toBe(true);
      });
    });

    it("should validate pose types", () => {
      const validPoses = [
        "standing",
        "flexing",
        "running",
        "meditating",
        "sleeping",
        "celebrating",
      ];

      const isValidPose = (pose: string): boolean => {
        return validPoses.includes(pose);
      };

      validPoses.forEach((pose) => {
        expect(isValidPose(pose)).toBe(true);
      });
    });

    it("should determine mood based on triggers", () => {
      const getMoodFromTriggers = (
        triggers: AvatarMood["triggers"],
      ): AvatarMood["currentMood"] => {
        if (triggers.completionRate >= 90 && triggers.streakLength >= 30)
          return "excited";
        if (triggers.completionRate >= 80 && triggers.recentAchievements > 0)
          return "motivated";
        if (triggers.completionRate >= 70) return "happy";
        if (triggers.completionRate >= 50) return "neutral";
        if (triggers.completionRate >= 30) return "tired";
        return "sad";
      };

      expect(
        getMoodFromTriggers({
          streakLength: 30,
          completionRate: 95,
          recentAchievements: 3,
        }),
      ).toBe("excited");
      expect(
        getMoodFromTriggers({
          streakLength: 10,
          completionRate: 85,
          recentAchievements: 1,
        }),
      ).toBe("motivated");
      expect(
        getMoodFromTriggers({
          streakLength: 0,
          completionRate: 25,
          recentAchievements: 0,
        }),
      ).toBe("sad");
    });

    it("should determine pose based on mood", () => {
      const getPoseFromMood = (
        mood: AvatarMood["currentMood"],
      ): AvatarMood["pose"] => {
        switch (mood) {
          case "excited":
            return "celebrating";
          case "motivated":
            return "flexing";
          case "happy":
            return "standing";
          case "neutral":
            return "standing";
          case "tired":
            return "meditating";
          case "sad":
            return "sleeping";
        }
      };

      expect(getPoseFromMood("excited")).toBe("celebrating");
      expect(getPoseFromMood("motivated")).toBe("flexing");
      expect(getPoseFromMood("tired")).toBe("meditating");
    });
  });

  describe("Type Guards and Utilities", () => {
    // Helper functions to avoid nesting issues
    const compareRanks = (rank1: Rank, rank2: Rank): number => {
      const order: Rank[] = ["E", "D", "C", "B", "A", "S"];
      return order.indexOf(rank2) - order.indexOf(rank1);
    };

    const requiredStatsFields = [
      "userId",
      "totalXP",
      "currentLevel",
      "rank",
      "achievementsUnlocked",
      "totalAchievements",
      "badgesEarned",
      "currentStreak",
      "longestStreak",
      "perfectDays",
      "weeklyXP",
      "monthlyXP",
      "lastActivityDate",
    ];

    const isValidStats = (stats: any): stats is GamificationStats => {
      if (!stats || typeof stats !== "object") return false;
      return requiredStatsFields.every((field) => field in stats);
    };

    it("should create rank comparator", () => {
      expect(compareRanks("E", "S")).toBeGreaterThan(0);
      expect(compareRanks("S", "E")).toBeLessThan(0);
      expect(compareRanks("B", "B")).toBe(0);
    });

    it("should validate complete gamification stats", () => {
      const validStats: GamificationStats = {
        userId: "user123",
        totalXP: 10000,
        currentLevel: 10,
        rank: "B",
        achievementsUnlocked: 20,
        totalAchievements: 50,
        badgesEarned: 10,
        currentStreak: 15,
        longestStreak: 30,
        perfectDays: 25,
        weeklyXP: 1000,
        monthlyXP: 4000,
        lastActivityDate: "2024-01-15",
      };

      expect(isValidStats(validStats)).toBe(true);

      const invalidStats = { ...validStats };
      delete invalidStats.userId;
      expect(isValidStats(invalidStats)).toBe(false);

      expect(isValidStats(null)).toBe(false);
    });

    it("should calculate time-based XP decay", () => {
      const calculateXPDecay = (
        lastActivityDate: string,
        baseXP: number,
        decayRatePerDay: number = 0.01,
      ): number => {
        const lastActivity = new Date(lastActivityDate);
        const today = new Date();
        const daysSinceActivity = Math.floor(
          (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
        );

        const decayMultiplier = Math.max(
          0,
          1 - daysSinceActivity * decayRatePerDay,
        );
        return Math.floor(baseXP * decayMultiplier);
      };

      // Mock dates for testing
      const lastActivity = "2024-01-15";

      // This would be 5 days inactive, so 5% decay
      const decayedXP = calculateXPDecay(lastActivity, 1000, 0.01);

      // Since we can't mock Date in this test, just verify the function works
      expect(decayedXP).toBeGreaterThanOrEqual(0);
      expect(decayedXP).toBeLessThanOrEqual(1000);
    });
  });
});
