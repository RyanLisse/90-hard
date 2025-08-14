import type { InstantDBClient } from "../types/instantdb.types";
import type { AnalyticsPort } from "../analytics/analytics.port";
import type {
  XPCalculationResult,
  UserLevel,
  Achievement,
  UserAchievement,
  UserBadge,
  GamificationStats,
  Leaderboard,
  LeaderboardEntry,
  AvatarMood,
  Rank,
  GamificationConfig,
} from "./gamification.types";

export class GamificationPort {
  private readonly config: GamificationConfig;

  constructor(
    private readonly instantDB: InstantDBClient,
    private readonly analyticsPort: AnalyticsPort,
  ) {
    this.config = this.initializeConfig();
  }

  async calculateDailyXP(
    userId: string,
    date: string,
    completionPercentage: number,
  ): Promise<XPCalculationResult> {
    const baseXP = Math.round(completionPercentage);

    // Calculate bonuses
    const perfectDayBonus =
      completionPercentage === 100 ? this.config.perfectDayBonus : 0;
    const streakBonus = await this.calculateStreakBonus(userId);
    const milestoneBonus = this.calculateMilestoneBonus(completionPercentage);
    const achievementBonus = 0; // Will be calculated separately when achievements unlock

    const bonusXP =
      perfectDayBonus + streakBonus + milestoneBonus + achievementBonus;
    const totalXP = Math.min(baseXP + bonusXP, this.config.maxDailyXP);

    // Store XP entry
    await this.instantDB.createXPEntry({
      userId,
      date,
      baseXP,
      bonusXP,
      totalXP,
      source: "daily_completion",
      metadata: {
        completionPercentage,
        perfectDay: completionPercentage === 100,
        streakBonus,
        milestoneBonus,
      },
    });

    // Update user level and check for level up
    const levelResult = await this.updateUserLevel(userId, totalXP, date);

    // Check for achievements
    const stats = await this.analyticsPort.calculatePeriodStats([], 30); // TODO: Get real stats
    const achievementsUnlocked = await this.checkAchievements(userId, stats);

    return {
      baseXP,
      bonusXP,
      totalXP,
      breakdown: {
        taskCompletion: baseXP,
        streakBonus,
        perfectDayBonus,
        milestoneBonus,
        achievementBonus,
      },
      levelUp: levelResult.levelUp,
      newLevel: levelResult.newLevel,
      achievementsUnlocked,
      badgesEarned: [], // TODO: Implement badge logic
    };
  }

  async checkAchievements(
    userId: string,
    stats: any, // TODO: Type this properly based on analytics types
  ): Promise<Achievement[]> {
    // Get all active achievements
    const allAchievements = await this.getAllAchievements();

    // Get user's current achievements
    const userAchievements = await this.getUserAchievements(userId);
    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (!achievement.isActive || unlockedIds.has(achievement.id)) {
        continue;
      }

      if (this.checkAchievementRequirements(achievement, stats)) {
        // Unlock achievement
        await this.instantDB.createUserAchievement({
          userId,
          achievementId: achievement.id,
          unlockedAt: new Date().toISOString(),
          metadata: {
            triggeredBy: achievement.category,
            value: this.getStatValue(stats, achievement.requirements),
          },
        });

        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  async updateUserLevel(
    userId: string,
    xpToAdd: number,
    date?: string,
  ): Promise<{
    levelUp: boolean;
    newLevel: number;
    currentXP: number;
    totalXP: number;
    rank: Rank;
  }> {
    const userLevel = await this.getUserLevel(userId);

    if (!userLevel) {
      // Create new user level
      const newCurrentXP = xpToAdd;
      const newTotalXP = xpToAdd;
      const level = 1;
      const rank = this.calculateRank(level);
      const xpToNextLevel = this.getXPRequiredForLevel(level + 1) - newTotalXP;

      await this.instantDB.createUserLevel({
        userId,
        currentLevel: level,
        currentXP: newCurrentXP,
        totalXP: newTotalXP,
        xpToNextLevel,
        rank,
      });

      return {
        levelUp: false,
        newLevel: level,
        currentXP: newCurrentXP,
        totalXP: newTotalXP,
        rank,
      };
    }

    // Update existing user level
    const newTotalXP = userLevel.totalXP + xpToAdd;
    const newLevel = this.calculateLevelFromXP(newTotalXP);
    const levelUp = newLevel > userLevel.currentLevel;
    const newRank = this.calculateRank(newLevel);
    // Calculate current XP within the current level
    // For level 2, currentXP is totalXP (since level 1 ends at 199)
    // For level 3+, currentXP is totalXP - ((level-1) * 100)
    const newCurrentXP = newTotalXP;
    const xpToNextLevel = this.calculateXPToNextLevel(newLevel, newTotalXP);

    const updateData = {
      currentXP: newCurrentXP,
      totalXP: newTotalXP,
      xpToNextLevel: Math.max(0, xpToNextLevel),
      ...(levelUp && {
        currentLevel: newLevel,
        rank: newRank,
        lastLevelUp: date || new Date().toISOString().split("T")[0],
      }),
    };

    await this.instantDB.updateUserLevel(userId, updateData);

    return {
      levelUp,
      newLevel,
      currentXP: newCurrentXP,
      totalXP: newTotalXP,
      rank: newRank,
    };
  }

  async getLeaderboard(
    type: "global" | "friends" | "local" | "weekly" | "monthly",
    timeRange: "7D" | "30D" | "90D" | "ALL",
  ): Promise<Leaderboard> {
    // Get user levels sorted by total XP
    const result = await this.instantDB.query({
      userLevels: {
        $: {
          limit: 100, // Top 100 users
          orderBy: [{ totalXP: "desc" }],
        },
      },
    });

    const userLevels = result.data?.userLevels || [];

    const entries: LeaderboardEntry[] = userLevels.map((level, index) => ({
      userId: level.userId,
      totalXP: level.totalXP,
      currentLevel: level.currentLevel,
      rank: level.rank,
      currentStreak: 0, // TODO: Get from analytics
      perfectDaysThisMonth: 0, // TODO: Get from analytics
      position: index + 1,
    }));

    return {
      id: `${type}-${timeRange}-${Date.now()}`,
      type,
      timeRange,
      entries,
      lastUpdated: new Date().toISOString(),
      totalParticipants: entries.length,
    };
  }

  async updateAvatarMood(
    userId: string,
    completionRate: number,
    streakLength: number,
    recentAchievements: number,
  ): Promise<AvatarMood> {
    const { mood, pose } = this.determineMoodAndPose(
      completionRate,
      streakLength,
      recentAchievements,
    );

    const avatarMood: AvatarMood = {
      userId,
      currentMood: mood,
      pose,
      lastUpdated: new Date().toISOString(),
      triggers: {
        streakLength,
        completionRate,
        recentAchievements,
      },
    };

    // Check if avatar mood exists
    const existing = await this.instantDB.query({
      avatarMoods: {
        $: {
          where: { userId },
        },
      },
    });

    if (existing.data?.avatarMoods?.length > 0) {
      await this.instantDB.updateAvatarMood(userId, {
        currentMood: mood,
        pose,
        lastUpdated: avatarMood.lastUpdated,
        triggers: avatarMood.triggers,
      });
    } else {
      await this.instantDB.createAvatarMood(avatarMood);
    }

    return avatarMood;
  }

  async getGamificationStats(userId: string): Promise<GamificationStats> {
    const [
      userLevel,
      userAchievements,
      userBadges,
      allAchievements,
      analyticsData,
    ] = await Promise.all([
      this.getUserLevel(userId),
      this.getUserAchievements(userId),
      this.getUserBadges(userId),
      this.getAllAchievements(),
      this.analyticsPort.getUserAnalytics(userId, "ALL"),
    ]);

    const weeklyXP = await this.getWeeklyXP(userId);
    const monthlyXP = await this.getMonthlyXP(userId);

    return {
      userId,
      totalXP: userLevel?.totalXP || 0,
      currentLevel: userLevel?.currentLevel || 1,
      rank: userLevel?.rank || "E",
      achievementsUnlocked: userAchievements.length,
      totalAchievements: allAchievements.length,
      badgesEarned: userBadges.length,
      currentStreak: analyticsData.periodStats.currentStreak,
      longestStreak: analyticsData.periodStats.longestStreak,
      perfectDays: analyticsData.periodStats.perfectDays,
      weeklyXP,
      monthlyXP,
      lastActivityDate: new Date().toISOString().split("T")[0],
    };
  }

  private async getUserLevel(userId: string): Promise<UserLevel | null> {
    const result = await this.instantDB.query({
      userLevels: {
        $: {
          where: { userId },
        },
      },
    });

    return result.data?.userLevels?.[0] || null;
  }

  private async getAllAchievements(): Promise<Achievement[]> {
    const result = await this.instantDB.query({
      achievements: {
        $: {
          where: { isActive: true },
        },
      },
    });

    return result.data?.achievements || [];
  }

  private async getUserAchievements(
    userId: string,
  ): Promise<UserAchievement[]> {
    const result = await this.instantDB.query({
      userAchievements: {
        $: {
          where: { userId },
        },
      },
    });

    return result.data?.userAchievements || [];
  }

  private async getUserBadges(userId: string): Promise<UserBadge[]> {
    const result = await this.instantDB.query({
      userBadges: {
        $: {
          where: { userId },
        },
      },
    });

    return result.data?.userBadges || [];
  }

  private async calculateStreakBonus(userId: string): Promise<number> {
    // TODO: Get current streak from analytics and calculate bonus
    // For now, return a static bonus
    return 0;
  }

  private calculateMilestoneBonus(completionPercentage: number): number {
    // Bonus for hitting certain milestones
    if (completionPercentage >= 100) return 0;
    if (completionPercentage >= 80) return 0;
    if (completionPercentage >= 60) return 0;
    if (completionPercentage >= 40) return 0;
    return 0;
  }

  private calculateLevelFromXP(totalXP: number): number {
    // XP thresholds: Level 1: 0-199, Level 2: 200-299, Level 3: 300-399, etc.
    if (totalXP < 200) return 1;
    if (totalXP < 300) return 2;
    if (totalXP < 400) return 3;
    if (totalXP < 500) return 4;
    return Math.floor(totalXP / 100);
  }

  private calculateXPToNextLevel(
    currentLevel: number,
    totalXP: number,
  ): number {
    const nextLevelThreshold = currentLevel * 100 + 100;
    return nextLevelThreshold - totalXP;
  }

  private getXPRequiredForLevel(level: number): number {
    // Formula: 100 + level * 100
    // Level 1: 0, Level 2: 200, Level 3: 300, Level 4: 400, etc.
    if (level === 1) return 0;
    return 100 + (level - 1) * 100;
  }

  private calculateRank(level: number): Rank {
    if (level >= 50) return "S";
    if (level >= 40) return "A";
    if (level >= 30) return "B";
    if (level >= 20) return "C";
    if (level >= 2) return "D";
    return "E";
  }

  private checkAchievementRequirements(
    achievement: Achievement,
    stats: any,
  ): boolean {
    const requirements = achievement.requirements;

    switch (achievement.category) {
      case "streak":
        return stats.currentStreak >= (requirements.streakDays || 0);
      case "completion":
        return stats.averageCompletion >= (requirements.completionRate || 0);
      case "milestone":
        return stats.perfectDays >= (requirements.perfectDays || 0);
      default:
        return false;
    }
  }

  private getStatValue(stats: any, requirements: any): number {
    if (requirements.streakDays) return stats.currentStreak;
    if (requirements.completionRate) return stats.averageCompletion;
    if (requirements.perfectDays) return stats.perfectDays;
    return 0;
  }

  private determineMoodAndPose(
    completionRate: number,
    streakLength: number,
    recentAchievements: number,
  ): { mood: AvatarMood["currentMood"]; pose: AvatarMood["pose"] } {
    const score = completionRate + streakLength * 5 + recentAchievements * 10;

    if (score >= 120) {
      return { mood: "excited", pose: "celebrating" };
    }
    if (score >= 80) {
      return { mood: "happy", pose: "flexing" };
    }
    if (score >= 50) {
      return { mood: "motivated", pose: "running" };
    }
    if (score >= 30) {
      return { mood: "neutral", pose: "standing" };
    }
    if (score >= 20) {
      return { mood: "tired", pose: "meditating" };
    }
    return { mood: "sad", pose: "sleeping" };
  }

  private async getWeeklyXP(userId: string): Promise<number> {
    // TODO: Implement weekly XP calculation
    return 0;
  }

  private async getMonthlyXP(userId: string): Promise<number> {
    // TODO: Implement monthly XP calculation
    return 0;
  }

  private initializeConfig(): GamificationConfig {
    return {
      baseXPPerTask: 17, // 100 / 6 tasks ≈ 17 per task
      perfectDayBonus: 10,
      streakMultiplier: 1.2,
      maxDailyXP: 200,
      levelThresholds: [], // TODO: Define proper thresholds
      achievements: [], // TODO: Define achievements
      badges: [], // TODO: Define badges
      rankThresholds: {
        E: 0,
        D: 10,
        C: 20,
        B: 30,
        A: 40,
        S: 50,
      },
    };
  }
}
