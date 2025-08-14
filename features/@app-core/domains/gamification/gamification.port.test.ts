import { beforeEach, describe, expect, it, vi } from "vitest";
import type { InstantDBClient } from "../types/instantdb.types";
import { GamificationPort } from "./gamification.port";
import type {
  XPCalculationResult,
  UserLevel,
  Achievement,
  UserAchievement,
  Badge,
  UserBadge,
  GamificationStats,
  Leaderboard,
  AvatarMood,
  Rank,
} from "./gamification.types";

describe("GamificationPort", () => {
  let instantDBClient: InstantDBClient;
  let gamificationPort: GamificationPort;
  let mockAnalyticsPort: any;

  beforeEach(() => {
    instantDBClient = {
      query: vi.fn(),
      createDayLog: vi.fn(),
      updateDayLog: vi.fn(),
      createWeightEntry: vi.fn(),
      updateWeightEntry: vi.fn(),
      deleteWeightEntry: vi.fn(),
      createWeightGoal: vi.fn(),
      updateWeightGoal: vi.fn(),
      createFastingEntry: vi.fn(),
      updateFastingEntry: vi.fn(),
      deleteFastingEntry: vi.fn(),
      transact: vi.fn(),
      createXPEntry: vi.fn(),
      updateUserLevel: vi.fn(),
      createUserLevel: vi.fn(),
      createUserAchievement: vi.fn(),
      createUserBadge: vi.fn(),
      updateAvatarMood: vi.fn(),
      createAvatarMood: vi.fn(),
    };

    // Mock analytics port for getting user stats
    mockAnalyticsPort = {
      getUserAnalytics: vi.fn(),
      calculatePeriodStats: vi.fn(),
    };

    gamificationPort = new GamificationPort(instantDBClient, mockAnalyticsPort);
  });

  describe("calculateDailyXP", () => {
    it("should calculate XP based on task completion percentage", async () => {
      // Arrange
      const userId = "user-123";
      const date = "2025-01-13";
      const completionPercentage = 83; // 5 out of 6 tasks completed

      const mockUserLevel = {
        userId,
        currentLevel: 5,
        currentXP: 450,
        totalXP: 450,
        xpToNextLevel: 150,
        rank: "C" as Rank,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-13T10:00:00Z",
      };

      (instantDBClient.query as any).mockResolvedValue({
        data: { userLevels: [mockUserLevel] },
      });

      (instantDBClient.createXPEntry as any).mockResolvedValue({
        id: "xp-entry-123",
      });

      // Act
      const result = await gamificationPort.calculateDailyXP(
        userId,
        date,
        completionPercentage,
      );

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          baseXP: 83, // Same as completion percentage
          bonusXP: expect.any(Number),
          totalXP: expect.any(Number),
          breakdown: expect.objectContaining({
            taskCompletion: 83,
            streakBonus: expect.any(Number),
            perfectDayBonus: 0, // Not a perfect day
            milestoneBonus: expect.any(Number),
            achievementBonus: expect.any(Number),
          }),
          levelUp: expect.any(Boolean),
        }),
      );

      expect(instantDBClient.createXPEntry).toHaveBeenCalledWith({
        userId,
        date,
        baseXP: result.baseXP,
        bonusXP: result.bonusXP,
        totalXP: result.totalXP,
        source: "daily_completion",
        metadata: expect.any(Object),
      });
    });

    it("should award perfect day bonus for 100% completion", async () => {
      // Arrange
      const userId = "user-123";
      const date = "2025-01-13";
      const completionPercentage = 100;

      const mockUserLevel = {
        userId,
        currentLevel: 3,
        currentXP: 200,
        totalXP: 200,
        xpToNextLevel: 100,
        rank: "D" as Rank,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-13T10:00:00Z",
      };

      (instantDBClient.query as any).mockResolvedValue({
        data: { userLevels: [mockUserLevel] },
      });

      (instantDBClient.createXPEntry as any).mockResolvedValue({
        id: "xp-entry-123",
      });

      // Act
      const result = await gamificationPort.calculateDailyXP(
        userId,
        date,
        completionPercentage,
      );

      // Assert
      expect(result.breakdown.perfectDayBonus).toBeGreaterThan(0);
      expect(result.baseXP).toBe(100);
    });

    it("should trigger level up when XP threshold is reached", async () => {
      // Arrange
      const userId = "user-123";
      const date = "2025-01-13";
      const completionPercentage = 100;

      const mockUserLevel = {
        userId,
        currentLevel: 2,
        currentXP: 280, // Close to level 3 threshold (300)
        totalXP: 280,
        xpToNextLevel: 20,
        rank: "D" as Rank,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-13T10:00:00Z",
      };

      (instantDBClient.query as any).mockResolvedValue({
        data: { userLevels: [mockUserLevel] },
      });

      (instantDBClient.createXPEntry as any).mockResolvedValue({
        id: "xp-entry-123",
      });

      (instantDBClient.updateUserLevel as any).mockResolvedValue({});

      // Act
      const result = await gamificationPort.calculateDailyXP(
        userId,
        date,
        completionPercentage,
      );

      // Assert
      expect(result.levelUp).toBe(true);
      expect(result.newLevel).toBe(3);

      expect(instantDBClient.updateUserLevel).toHaveBeenCalledWith(
        mockUserLevel.userId,
        expect.objectContaining({
          currentLevel: 3,
          currentXP: expect.any(Number),
          totalXP: expect.any(Number),
          xpToNextLevel: expect.any(Number),
          rank: expect.any(String),
          lastLevelUp: date,
        }),
      );
    });
  });

  describe("checkAchievements", () => {
    it("should unlock streak achievements", async () => {
      // Arrange
      const userId = "user-123";
      const mockStats = {
        currentStreak: 7,
        longestStreak: 7,
        perfectDays: 2,
        averageCompletion: 85,
      };

      mockAnalyticsPort.calculatePeriodStats.mockResolvedValue(mockStats);

      const mockAchievements = [
        {
          id: "streak-7",
          name: "Week Warrior",
          description: "Complete tasks for 7 consecutive days",
          category: "streak",
          type: "silver",
          xpReward: 50,
          requirements: { streakDays: 7 },
          isSecret: false,
          isActive: true,
        },
      ];

      (instantDBClient.query as any)
        .mockResolvedValueOnce({
          data: { achievements: mockAchievements },
        })
        .mockResolvedValueOnce({
          data: { userAchievements: [] }, // No previous achievements
        });

      (instantDBClient.createUserAchievement as any).mockResolvedValue({
        id: "user-achievement-123",
      });

      // Act
      const unlockedAchievements = await gamificationPort.checkAchievements(
        userId,
        mockStats,
      );

      // Assert
      expect(unlockedAchievements).toHaveLength(1);
      expect(unlockedAchievements[0]).toEqual(
        expect.objectContaining({
          id: "streak-7",
          name: "Week Warrior",
          xpReward: 50,
        }),
      );

      expect(instantDBClient.createUserAchievement).toHaveBeenCalledWith({
        userId,
        achievementId: "streak-7",
        unlockedAt: expect.any(String),
        metadata: { triggeredBy: "streak", value: 7 },
      });
    });

    it("should not unlock already earned achievements", async () => {
      // Arrange
      const userId = "user-123";
      const mockStats = {
        currentStreak: 7,
        longestStreak: 7,
        perfectDays: 2,
        averageCompletion: 85,
      };

      mockAnalyticsPort.calculatePeriodStats.mockResolvedValue(mockStats);

      const mockAchievements = [
        {
          id: "streak-7",
          name: "Week Warrior",
          requirements: { streakDays: 7 },
          isActive: true,
        },
      ];

      const mockUserAchievements = [
        {
          id: "user-achievement-123",
          userId,
          achievementId: "streak-7",
          unlockedAt: "2025-01-10T10:00:00Z",
        },
      ];

      (instantDBClient.query as any)
        .mockResolvedValueOnce({
          data: { achievements: mockAchievements },
        })
        .mockResolvedValueOnce({
          data: { userAchievements: mockUserAchievements },
        });

      // Act
      const unlockedAchievements = await gamificationPort.checkAchievements(
        userId,
        mockStats,
      );

      // Assert
      expect(unlockedAchievements).toHaveLength(0);
      expect(instantDBClient.createUserAchievement).not.toHaveBeenCalled();
    });
  });

  describe("updateUserLevel", () => {
    it("should create new user level for first-time user", async () => {
      // Arrange
      const userId = "user-123";
      const xpToAdd = 75;

      (instantDBClient.query as any).mockResolvedValue({
        data: { userLevels: [] },
      });

      (instantDBClient.createUserLevel as any).mockResolvedValue({
        id: "user-level-123",
      });

      // Act
      const result = await gamificationPort.updateUserLevel(userId, xpToAdd);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          levelUp: false,
          newLevel: 1,
          currentXP: 75,
          totalXP: 75,
          rank: "E",
        }),
      );

      expect(instantDBClient.createUserLevel).toHaveBeenCalledWith({
        userId,
        currentLevel: 1,
        currentXP: 75,
        totalXP: 75,
        xpToNextLevel: 125, // 200 - 75
        rank: "E",
      });
    });

    it("should update existing user level", async () => {
      // Arrange
      const userId = "user-123";
      const xpToAdd = 50;

      const mockUserLevel = {
        userId,
        currentLevel: 2,
        currentXP: 150,
        totalXP: 150,
        xpToNextLevel: 150,
        rank: "D" as Rank,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-13T10:00:00Z",
      };

      (instantDBClient.query as any).mockResolvedValue({
        data: { userLevels: [mockUserLevel] },
      });

      (instantDBClient.updateUserLevel as any).mockResolvedValue({});

      // Act
      const result = await gamificationPort.updateUserLevel(userId, xpToAdd);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          levelUp: false,
          newLevel: 2,
          currentXP: 200,
          totalXP: 200,
          rank: "D",
        }),
      );

      expect(instantDBClient.updateUserLevel).toHaveBeenCalledWith(userId, {
        currentXP: 200,
        totalXP: 200,
        xpToNextLevel: 100, // 300 - 200
      });
    });
  });

  describe("getLeaderboard", () => {
    it("should return global leaderboard with user rankings", async () => {
      // Arrange
      const type = "global";
      const timeRange = "30D";

      const mockLeaderboardData = [
        {
          userId: "user-1",
          totalXP: 1500,
          currentLevel: 8,
          rank: "A" as Rank,
          currentStreak: 15,
          perfectDaysThisMonth: 20,
        },
        {
          userId: "user-2",
          totalXP: 1200,
          currentLevel: 6,
          rank: "B" as Rank,
          currentStreak: 8,
          perfectDaysThisMonth: 15,
        },
      ];

      (instantDBClient.query as any).mockResolvedValue({
        data: { userLevels: mockLeaderboardData },
      });

      // Act
      const leaderboard = await gamificationPort.getLeaderboard(
        type,
        timeRange,
      );

      // Assert
      expect(leaderboard).toEqual(
        expect.objectContaining({
          type,
          timeRange,
          entries: expect.arrayContaining([
            expect.objectContaining({
              userId: "user-1",
              totalXP: 1500,
              position: 1,
              rank: "A",
            }),
            expect.objectContaining({
              userId: "user-2",
              totalXP: 1200,
              position: 2,
              rank: "B",
            }),
          ]),
          totalParticipants: 2,
          lastUpdated: expect.any(String),
        }),
      );

      expect(leaderboard.entries[0].position).toBe(1);
      expect(leaderboard.entries[1].position).toBe(2);
    });
  });

  describe("updateAvatarMood", () => {
    it("should set excited mood for high performance", async () => {
      // Arrange
      const userId = "user-123";
      const completionRate = 95;
      const streakLength = 10;
      const recentAchievements = 2;

      (instantDBClient.query as any).mockResolvedValue({
        data: { avatarMoods: [] },
      });

      (instantDBClient.createAvatarMood as any).mockResolvedValue({
        id: "avatar-mood-123",
      });

      // Act
      const mood = await gamificationPort.updateAvatarMood(
        userId,
        completionRate,
        streakLength,
        recentAchievements,
      );

      // Assert
      expect(mood).toEqual(
        expect.objectContaining({
          userId,
          currentMood: "excited",
          pose: "celebrating",
          triggers: {
            streakLength: 10,
            completionRate: 95,
            recentAchievements: 2,
          },
        }),
      );

      expect(instantDBClient.createAvatarMood).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          currentMood: "excited",
          pose: "celebrating",
        }),
      );
    });

    it("should set sad mood for poor performance", async () => {
      // Arrange
      const userId = "user-123";
      const completionRate = 15;
      const streakLength = 0;
      const recentAchievements = 0;

      (instantDBClient.query as any).mockResolvedValue({
        data: { avatarMoods: [] },
      });

      (instantDBClient.createAvatarMood as any).mockResolvedValue({
        id: "avatar-mood-123",
      });

      // Act
      const mood = await gamificationPort.updateAvatarMood(
        userId,
        completionRate,
        streakLength,
        recentAchievements,
      );

      // Assert
      expect(mood.currentMood).toBe("sad");
      expect(mood.pose).toBe("sleeping");
    });
  });

  describe("getGamificationStats", () => {
    it("should aggregate user gamification statistics", async () => {
      // Arrange
      const userId = "user-123";

      const mockUserLevel = {
        userId,
        currentLevel: 5,
        currentXP: 450,
        totalXP: 450,
        rank: "C" as Rank,
      };

      const mockUserAchievements = [
        { id: "1", achievementId: "streak-7", unlockedAt: "2025-01-10" },
        { id: "2", achievementId: "perfect-5", unlockedAt: "2025-01-12" },
      ];

      const mockUserBadges = [
        { id: "1", badgeId: "daily-warrior", earnedAt: "2025-01-13" },
      ];

      const mockAnalyticsData = {
        periodStats: {
          currentStreak: 8,
          longestStreak: 10,
          perfectDays: 5,
        },
      };

      (instantDBClient.query as any)
        .mockResolvedValueOnce({
          data: { userLevels: [mockUserLevel] },
        })
        .mockResolvedValueOnce({
          data: { userAchievements: mockUserAchievements },
        })
        .mockResolvedValueOnce({
          data: { userBadges: mockUserBadges },
        })
        .mockResolvedValueOnce({
          data: { achievements: [{ id: "1" }, { id: "2" }, { id: "3" }] },
        });

      mockAnalyticsPort.getUserAnalytics.mockResolvedValue(mockAnalyticsData);

      // Act
      const stats = await gamificationPort.getGamificationStats(userId);

      // Assert
      expect(stats).toEqual(
        expect.objectContaining({
          userId,
          totalXP: 450,
          currentLevel: 5,
          rank: "C",
          achievementsUnlocked: 2,
          totalAchievements: 3,
          badgesEarned: 1,
          currentStreak: 8,
          longestStreak: 10,
          perfectDays: 5,
          lastActivityDate: expect.any(String),
        }),
      );
    });
  });
});