import type {
  AnalyticsData,
  Avatar,
  DayLog,
  FastingEntry,
  HealthData,
  JournalEntry,
  Photo,
  TaskId,
  TimeRange,
  User,
  WeightEntry,
} from '../types';

// ============================
// Base Repository Interface
// ============================

export interface BaseRepository<T> {
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// ============================
// User Repository
// ============================

export interface UserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  updateSettings(
    userId: string,
    settings: Partial<User['settings']>
  ): Promise<User>;
  updateStats(
    userId: string,
    stats: {
      xp?: number;
      level?: number;
      rank?: User['rank'];
      currentStreak?: number;
      longestStreak?: number;
      totalDaysCompleted?: number;
    }
  ): Promise<User>;
}

// ============================
// DayLog Repository
// ============================

export interface DayLogRepository extends BaseRepository<DayLog> {
  findByUserAndDate(userId: string, date: string): Promise<DayLog | null>;
  findByUserDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DayLog[]>;
  findRecentByUser(userId: string, limit: number): Promise<DayLog[]>;
  toggleTask(userId: string, date: string, taskId: TaskId): Promise<DayLog>;
  updateWeight(userId: string, date: string, weightKg: number): Promise<DayLog>;
  updateFasting(userId: string, date: string, hours: number): Promise<DayLog>;
  getStreakData(userId: string): Promise<{ current: number; longest: number }>;
}

// ============================
// Photo Repository
// ============================

export interface PhotoRepository extends BaseRepository<Photo> {
  findByUserAndDate(userId: string, date: string): Promise<Photo | null>;
  findByUser(userId: string, limit?: number): Promise<Photo[]>;
  findByUserDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Photo[]>;
  deleteByUserAndDate(userId: string, date: string): Promise<void>;
}

// ============================
// Avatar Repository
// ============================

export interface AvatarRepository extends BaseRepository<Avatar> {
  findByUserAndDate(userId: string, date: string): Promise<Avatar | null>;
  findLatestByUser(userId: string): Promise<Avatar | null>;
  findByUser(userId: string, limit?: number): Promise<Avatar[]>;
}

// ============================
// Weight Repository
// ============================

export interface WeightRepository extends BaseRepository<WeightEntry> {
  findByUserAndDate(userId: string, date: string): Promise<WeightEntry | null>;
  findByUserDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<WeightEntry[]>;
  findLatestByUser(userId: string): Promise<WeightEntry | null>;
  getWeightHistory(userId: string, limit?: number): Promise<WeightEntry[]>;
  getWeightStats(
    userId: string,
    range: TimeRange
  ): Promise<{
    current: number;
    start: number;
    change: number;
    average: number;
  } | null>;
}

// ============================
// Fasting Repository
// ============================

export interface FastingRepository extends BaseRepository<FastingEntry> {
  findByUserAndDate(userId: string, date: string): Promise<FastingEntry | null>;
  findByUserDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<FastingEntry[]>;
  getAverageHours(userId: string, range: TimeRange): Promise<number>;
  getSuccessRate(
    userId: string,
    targetHours: number,
    range: TimeRange
  ): Promise<number>;
}

// ============================
// Journal Repository
// ============================

export interface JournalRepository extends BaseRepository<JournalEntry> {
  findByUserAndDate(userId: string, date: string): Promise<JournalEntry | null>;
  findByUser(userId: string, limit?: number): Promise<JournalEntry[]>;
  findByUserDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<JournalEntry[]>;
  findByTags(userId: string, tags: string[]): Promise<JournalEntry[]>;
  searchByContent(userId: string, query: string): Promise<JournalEntry[]>;
  updateSummary(
    id: string,
    summary: string,
    mood?: JournalEntry['mood']
  ): Promise<JournalEntry>;
}

// ============================
// Analytics Repository
// ============================

export interface AnalyticsRepository {
  getAnalytics(userId: string, range: TimeRange): Promise<AnalyticsData>;
  getTaskCompletionStats(
    userId: string,
    range: TimeRange
  ): Promise<Record<TaskId, number>>;
  getComparisonData(
    userId: string,
    currentRange: TimeRange
  ): Promise<{
    current: AnalyticsData;
    previous: AnalyticsData;
    delta: number;
  }>;
  exportData(
    userId: string,
    range: TimeRange,
    format: 'csv' | 'json'
  ): Promise<string>;
}

// ============================
// Health Repository
// ============================

export interface HealthRepository extends BaseRepository<HealthData> {
  findByUserDateAndMetric(
    userId: string,
    date: string,
    metric: HealthData['metric']
  ): Promise<HealthData | null>;
  findByUserAndMetric(
    userId: string,
    metric: HealthData['metric'],
    limit?: number
  ): Promise<HealthData[]>;
  findByUserDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<HealthData[]>;
  getCorrelations(
    userId: string,
    metric: HealthData['metric'],
    range: TimeRange
  ): Promise<{
    completionRate: number;
    metricAverage: number;
    correlation: number;
  }>;
  syncFromSource(
    userId: string,
    source: HealthData['source'],
    startDate: string,
    endDate: string
  ): Promise<HealthData[]>;
}
