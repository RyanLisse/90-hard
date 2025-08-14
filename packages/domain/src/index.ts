// Re-export all types

export type {
  AnalyticsPort,
  CachePort,
  EmailPort,
  GoogleFitPort,
  HealthKitPort,
  ImageGenerationPort,
  ImageProcessorPort,
  LLMPort,
  PushNotificationPort,
  RateLimiterPort,
  SpeechToTextPort,
  // External ports
  StoragePort,
} from './ports/external';
export * from './ports/external';
export type {
  AnalyticsRepository,
  AvatarRepository,
  // Repository interfaces
  BaseRepository,
  DayLogRepository,
  FastingRepository,
  HealthRepository,
  JournalRepository,
  PhotoRepository,
  UserRepository,
  WeightRepository,
} from './ports/repositories';
// Re-export all ports
export * from './ports/repositories';
export type {
  Achievement,
  AnalyticsService,
  // Service types
  AvatarGenerationRequest,
  AvatarService,
  FastingService,
  GamificationService,
  HealthIntegrationService,
  JournalService,
  LeaderboardEntry,
  NotificationService,
  PhotoService,
  // Service interfaces
  TaskTrackingService,
  VoiceService,
  WeightService,
} from './ports/services';
export * from './ports/services';
export * from './types';
// Re-export specific items for convenience
export {
  AnalyticsData,
  Avatar,
  AvatarMood,
  AvatarStyle,
  calculateLevel,
  // Domain functions
  computeDayCompletion,
  DayLog,
  FastingEntry,
  formatWeight,
  getRankForLevel,
  getStreakDates,
  HealthData,
  HealthMetric,
  isDateToday,
  JournalEntry,
  kgToLbs,
  lbsToKg,
  nextLevelAt,
  Photo,
  // Core types
  TaskId,
  TimeRange,
  User,
  WeightEntry,
  // Enums
  WeightUnit,
  xpForDay,
} from './types';
