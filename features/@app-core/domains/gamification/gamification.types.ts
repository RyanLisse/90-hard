export type Rank = "E" | "D" | "C" | "B" | "A" | "S";

export interface XPEntry {
  id: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  baseXP: number; // XP from task completion percentage
  bonusXP: number; // Bonus XP from streaks, perfect days, etc.
  totalXP: number;
  source:
    | "daily_completion"
    | "streak_bonus"
    | "perfect_day"
    | "milestone"
    | "achievement";
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserLevel {
  userId: string;
  currentLevel: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;
  rank: Rank;
  lastLevelUp?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | "streak"
    | "completion"
    | "milestone"
    | "weight"
    | "fasting"
    | "special";
  type: "bronze" | "silver" | "gold" | "platinum";
  xpReward: number;
  requirements: {
    [key: string]: any; // Flexible requirements structure
  };
  isSecret: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  progress?: number; // 0-1 for progressive achievements
  metadata?: Record<string, any>;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: "daily" | "weekly" | "monthly" | "milestone" | "special";
  requirements: {
    [key: string]: any;
  };
  isActive: boolean;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  validUntil?: string; // For temporary badges
  tier?: number; // For tiered badges (1, 2, 3...)
}

export interface LeaderboardEntry {
  userId: string;
  username?: string;
  avatarUrl?: string;
  totalXP: number;
  currentLevel: number;
  rank: Rank;
  currentStreak: number;
  perfectDaysThisMonth: number;
  position: number;
}

export interface Leaderboard {
  id: string;
  type: "global" | "friends" | "local" | "weekly" | "monthly";
  timeRange: "7D" | "30D" | "90D" | "ALL";
  entries: LeaderboardEntry[];
  lastUpdated: string;
  totalParticipants: number;
}

export interface GamificationStats {
  userId: string;
  totalXP: number;
  currentLevel: number;
  rank: Rank;
  achievementsUnlocked: number;
  totalAchievements: number;
  badgesEarned: number;
  currentStreak: number;
  longestStreak: number;
  perfectDays: number;
  weeklyXP: number;
  monthlyXP: number;
  leaderboardPosition?: number;
  lastActivityDate: string;
}

export interface LevelThreshold {
  level: number;
  xpRequired: number;
  rank: Rank;
  title: string;
  rewards?: {
    badges?: string[];
    achievements?: string[];
    unlocks?: string[];
  };
}

export interface XPCalculationResult {
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  breakdown: {
    taskCompletion: number;
    streakBonus: number;
    perfectDayBonus: number;
    milestoneBonus: number;
    achievementBonus: number;
  };
  levelUp: boolean;
  newLevel?: number;
  achievementsUnlocked?: Achievement[];
  badgesEarned?: Badge[];
}

export interface GamificationConfig {
  baseXPPerTask: number;
  perfectDayBonus: number;
  streakMultiplier: number;
  maxDailyXP: number;
  levelThresholds: LevelThreshold[];
  achievements: Achievement[];
  badges: Badge[];
  rankThresholds: {
    [key in Rank]: number;
  };
}

export interface AvatarMood {
  userId: string;
  currentMood: "excited" | "happy" | "neutral" | "tired" | "sad" | "motivated";
  pose:
    | "standing"
    | "flexing"
    | "running"
    | "meditating"
    | "sleeping"
    | "celebrating";
  lastUpdated: string;
  triggers: {
    streakLength: number;
    completionRate: number;
    recentAchievements: number;
  };
}
