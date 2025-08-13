// Re-export all types
export * from "./types";

// Re-export all ports
export * from "./ports/repositories";
export * from "./ports/services";
export * from "./ports/external";

// Re-export specific items for convenience
export {
  // Core types
  TaskId,
  DayLog,
  User,
  Photo,
  Avatar,
  WeightEntry,
  FastingEntry,
  JournalEntry,
  AnalyticsData,
  HealthData,

  // Enums
  WeightUnit,
  AvatarStyle,
  AvatarMood,
  TimeRange,
  HealthMetric,

  // Domain functions
  computeDayCompletion,
  xpForDay,
  nextLevelAt,
  calculateLevel,
  getRankForLevel,
  kgToLbs,
  lbsToKg,
  formatWeight,
  isDateToday,
  getStreakDates,
} from "./types";

export type {
  // Repository interfaces
  BaseRepository,
  UserRepository,
  DayLogRepository,
  PhotoRepository,
  AvatarRepository,
  WeightRepository,
  FastingRepository,
  JournalRepository,
  AnalyticsRepository,
  HealthRepository,
} from "./ports/repositories";

export type {
  // Service interfaces
  TaskTrackingService,
  PhotoService,
  AvatarService,
  WeightService,
  FastingService,
  JournalService,
  VoiceService,
  AnalyticsService,
  GamificationService,
  NotificationService,
  HealthIntegrationService,

  // Service types
  AvatarGenerationRequest,
  Achievement,
  LeaderboardEntry,
} from "./ports/services";

export type {
  // External ports
  StoragePort,
  ImageProcessorPort,
  ImageGenerationPort,
  SpeechToTextPort,
  LLMPort,
  EmailPort,
  PushNotificationPort,
  AnalyticsPort,
  HealthKitPort,
  GoogleFitPort,
  RateLimiterPort,
  CachePort,
} from "./ports/external";
