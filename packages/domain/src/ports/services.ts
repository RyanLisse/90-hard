import type {
  User,
  DayLog,
  Photo,
  Avatar,
  WeightEntry,
  FastingEntry,
  JournalEntry,
  AnalyticsData,
  TaskId,
  TimeRange,
  AvatarStyle,
  AvatarMood,
  WeightUnit
} from "../types";

// ============================
// Task Tracking Service
// ============================

export interface TaskTrackingService {
  /**
   * Get or create today's log for a user
   */
  getTodayLog(userId: string): Promise<DayLog>;
  
  /**
   * Toggle a task completion status
   */
  toggleTask(userId: string, taskId: TaskId): Promise<DayLog>;
  
  /**
   * Get completion percentage for a specific date
   */
  getCompletionForDate(userId: string, date: string): Promise<number>;
  
  /**
   * Check if all tasks are completed for today
   */
  isDayComplete(userId: string): Promise<boolean>;
  
  /**
   * Get streak information
   */
  getStreakInfo(userId: string): Promise<{ current: number; longest: number }>;
}

// ============================
// Photo Service
// ============================

export interface PhotoService {
  /**
   * Upload and compress a photo
   */
  uploadPhoto(userId: string, file: File | Blob, date?: string): Promise<Photo>;
  
  /**
   * Get photo for a specific date
   */
  getPhotoForDate(userId: string, date: string): Promise<Photo | null>;
  
  /**
   * Delete a photo
   */
  deletePhoto(photoId: string): Promise<void>;
  
  /**
   * Generate photo comparison (before/after)
   */
  generateComparison(userId: string, startDate: string, endDate: string): Promise<{
    beforeUrl: string;
    afterUrl: string;
    daysApart: number;
  }>;
}

// ============================
// Avatar Service
// ============================

export interface AvatarGenerationRequest {
  style: AvatarStyle;
  mood: AvatarMood;
  seed?: string;
  dailyProgress?: number;
  streakDays?: number;
}

export interface AvatarService {
  /**
   * Generate a new avatar based on style and mood
   */
  generateAvatar(userId: string, request: AvatarGenerationRequest): Promise<Avatar>;
  
  /**
   * Get today's avatar or generate if missing
   */
  getTodayAvatar(userId: string): Promise<Avatar>;
  
  /**
   * Update avatar mood based on journal sentiment
   */
  updateAvatarMood(userId: string, mood: AvatarMood): Promise<Avatar>;
  
  /**
   * Get avatar evolution timeline
   */
  getAvatarEvolution(userId: string, days: number): Promise<Avatar[]>;
}

// ============================
// Weight & Fasting Service
// ============================

export interface WeightService {
  /**
   * Record weight for a date
   */
  recordWeight(userId: string, weight: number, unit: WeightUnit, date?: string): Promise<WeightEntry>;
  
  /**
   * Get weight trend data
   */
  getWeightTrend(userId: string, range: TimeRange): Promise<{
    entries: WeightEntry[];
    trend: "up" | "down" | "stable";
    changeKg: number;
    changePercent: number;
  }>;
  
  /**
   * Get goal progress
   */
  getGoalProgress(userId: string): Promise<{
    current: number;
    goal: number;
    remaining: number;
    estimatedDays: number;
  } | null>;
}

export interface FastingService {
  /**
   * Start a fasting session
   */
  startFasting(userId: string): Promise<FastingEntry>;
  
  /**
   * End current fasting session
   */
  endFasting(userId: string): Promise<FastingEntry>;
  
  /**
   * Record completed fasting hours
   */
  recordFasting(userId: string, hours: number, date?: string): Promise<FastingEntry>;
  
  /**
   * Get fasting statistics
   */
  getFastingStats(userId: string, range: TimeRange): Promise<{
    averageHours: number;
    successRate: number;
    totalSessions: number;
    longestFast: number;
  }>;
}

// ============================
// Journal Service
// ============================

export interface JournalService {
  /**
   * Create or update journal entry
   */
  saveEntry(
    userId: string, 
    content: string, 
    tags?: string[], 
    audioUrl?: string
  ): Promise<JournalEntry>;
  
  /**
   * Get journal entry for date
   */
  getEntryForDate(userId: string, date: string): Promise<JournalEntry | null>;
  
  /**
   * Generate AI summary and mood
   */
  generateSummary(entryId: string): Promise<{
    summary: string;
    mood: AvatarMood;
    insights?: string[];
  }>;
  
  /**
   * Search journal entries
   */
  searchEntries(userId: string, query: string): Promise<JournalEntry[]>;
  
  /**
   * Get mood trends
   */
  getMoodTrends(userId: string, range: TimeRange): Promise<{
    moods: Record<AvatarMood, number>;
    dominant: AvatarMood;
    improvements: string[];
  }>;
}

// ============================
// Voice Service
// ============================

export interface VoiceService {
  /**
   * Start voice recording
   */
  startRecording(): Promise<{ recorderId: string }>;
  
  /**
   * Stop recording and get audio
   */
  stopRecording(recorderId: string): Promise<Blob>;
  
  /**
   * Transcribe audio to text
   */
  transcribeAudio(audio: Blob): Promise<{
    text: string;
    confidence: number;
    duration: number;
  }>;
  
  /**
   * Upload audio to storage
   */
  uploadAudio(userId: string, audio: Blob): Promise<string>;
}

// ============================
// Analytics Service
// ============================

export interface AnalyticsService {
  /**
   * Get comprehensive analytics
   */
  getAnalytics(userId: string, range: TimeRange): Promise<AnalyticsData>;
  
  /**
   * Get AI insights
   */
  getInsights(userId: string, analyticsData: AnalyticsData): Promise<{
    strengths: string[];
    improvements: string[];
    predictions: string[];
    recommendations: string[];
  }>;
  
  /**
   * Export analytics data
   */
  exportAnalytics(
    userId: string, 
    range: TimeRange, 
    format: "csv" | "pdf" | "json"
  ): Promise<Blob>;
  
  /**
   * Compare periods
   */
  comparePeriods(
    userId: string, 
    period1: TimeRange, 
    period2: TimeRange
  ): Promise<{
    period1: AnalyticsData;
    period2: AnalyticsData;
    improvements: string[];
    regressions: string[];
  }>;
}

// ============================
// Gamification Service
// ============================

export interface GamificationService {
  /**
   * Award XP for completed tasks
   */
  awardXP(userId: string, completion: number): Promise<{
    xpAwarded: number;
    totalXp: number;
    levelUp: boolean;
    newLevel?: number;
    newRank?: User["rank"];
  }>;
  
  /**
   * Get achievements
   */
  getAchievements(userId: string): Promise<{
    unlocked: Achievement[];
    locked: Achievement[];
    recent: Achievement[];
  }>;
  
  /**
   * Get leaderboard
   */
  getLeaderboard(timeframe: "weekly" | "monthly" | "all"): Promise<{
    rank: number;
    total: number;
    top: LeaderboardEntry[];
    nearby: LeaderboardEntry[];
  }>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  requirement: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  level: number;
  xp: number;
  streak: number;
  completionRate: number;
}

// ============================
// Notification Service
// ============================

export interface NotificationService {
  /**
   * Schedule daily reminders
   */
  scheduleReminders(userId: string, reminders: {
    photo?: string; // HH:MM
    journal?: string; // HH:MM
    workout?: string[]; // Array of HH:MM
  }): Promise<void>;
  
  /**
   * Send streak warning
   */
  sendStreakWarning(userId: string): Promise<void>;
  
  /**
   * Send achievement notification
   */
  sendAchievement(userId: string, achievement: Achievement): Promise<void>;
  
  /**
   * Get notification settings
   */
  getSettings(userId: string): Promise<{
    enabled: boolean;
    reminders: Record<string, string>;
    achievements: boolean;
    streakWarnings: boolean;
  }>;
}

// ============================
// Health Integration Service
// ============================

export interface HealthIntegrationService {
  /**
   * Connect to health data source
   */
  connect(source: "healthkit" | "googlefit"): Promise<void>;
  
  /**
   * Sync health data
   */
  syncHealthData(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{
    synced: number;
    errors: string[];
  }>;
  
  /**
   * Get health correlations
   */
  getCorrelations(userId: string, range: TimeRange): Promise<{
    sleepVsCompletion: number;
    stepsVsCompletion: number;
    hrvVsStreak: number;
    insights: string[];
  }>;
  
  /**
   * Check permissions
   */
  checkPermissions(): Promise<{
    steps: boolean;
    heartRate: boolean;
    sleep: boolean;
    workouts: boolean;
  }>;
}