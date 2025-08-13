import { z } from "zod";

// ============================
// Core Task Types
// ============================

export const TaskId = z.enum([
  "workout1",
  "workout2", 
  "diet",
  "water",
  "reading",
  "photo"
]);
export type TaskId = z.infer<typeof TaskId>;

export const DayLog = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(), // ISO date string
  tasks: z.record(TaskId, z.boolean()).default({
    workout1: false,
    workout2: false,
    diet: false,
    water: false,
    reading: false,
    photo: false
  }),
  weightKg: z.number().optional(),
  fastingH: z.number().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type DayLog = z.infer<typeof DayLog>;

// ============================
// User & Settings Types
// ============================

export const WeightUnit = z.enum(["kg", "lbs"]);
export type WeightUnit = z.infer<typeof WeightUnit>;

export const AvatarStyle = z.enum(["solo-leveling", "ghibli"]);
export type AvatarStyle = z.infer<typeof AvatarStyle>;

export const UserSettings = z.object({
  weightUnit: WeightUnit.default("kg"),
  avatarStyle: AvatarStyle.default("solo-leveling"),
  notificationsEnabled: z.boolean().default(true),
  photoReminder: z.string().optional(), // Time in HH:MM format
  journalReminder: z.string().optional(), // Time in HH:MM format
  privacyMode: z.boolean().default(false)
});
export type UserSettings = z.infer<typeof UserSettings>;

export const User = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  settings: UserSettings,
  currentStreak: z.number().default(0),
  longestStreak: z.number().default(0),
  totalDaysCompleted: z.number().default(0),
  xp: z.number().default(0),
  level: z.number().default(1),
  rank: z.enum(["E", "D", "C", "B", "A", "S"]).default("E"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type User = z.infer<typeof User>;

// ============================
// Photo & Avatar Types
// ============================

export const Photo = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(), // ISO date
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  compressed: z.boolean().default(false),
  sizeBytes: z.number().optional(),
  createdAt: z.string().datetime()
});
export type Photo = z.infer<typeof Photo>;

export const AvatarMood = z.enum([
  "determined",
  "confident", 
  "tired",
  "struggling",
  "triumphant",
  "focused"
]);
export type AvatarMood = z.infer<typeof AvatarMood>;

export const Avatar = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(), // ISO date
  style: AvatarStyle,
  mood: AvatarMood,
  url: z.string().url(),
  seed: z.string().optional(),
  prompt: z.string().optional(),
  createdAt: z.string().datetime()
});
export type Avatar = z.infer<typeof Avatar>;

// ============================
// Weight & Fasting Types
// ============================

export const WeightEntry = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(), // ISO date
  weightKg: z.number(),
  createdAt: z.string().datetime()
});
export type WeightEntry = z.infer<typeof WeightEntry>;

export const FastingEntry = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(), // ISO date
  hours: z.number().min(0).max(24),
  startTime: z.string().optional(), // ISO datetime
  endTime: z.string().optional(), // ISO datetime
  createdAt: z.string().datetime()
});
export type FastingEntry = z.infer<typeof FastingEntry>;

// ============================
// Journal Types
// ============================

export const JournalEntry = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(), // ISO date
  content: z.string(), // Rich text content (Tiptap JSON)
  audioUrl: z.string().url().optional(),
  transcription: z.string().optional(),
  summary: z.string().optional(),
  mood: AvatarMood.optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type JournalEntry = z.infer<typeof JournalEntry>;

// ============================
// Analytics Types
// ============================

export const TimeRange = z.enum(["7D", "30D", "90D", "ALL"]);
export type TimeRange = z.infer<typeof TimeRange>;

export const AnalyticsData = z.object({
  range: TimeRange,
  startDate: z.string(),
  endDate: z.string(),
  totalDays: z.number(),
  completedDays: z.number(),
  completionRate: z.number(), // 0-100
  taskBreakdown: z.record(TaskId, z.number()), // Count per task
  weightTrend: z.array(z.object({
    date: z.string(),
    weight: z.number()
  })).optional(),
  fastingAverage: z.number().optional(),
  currentStreak: z.number(),
  comparison: z.object({
    previousPeriod: z.object({
      completionRate: z.number(),
      completedDays: z.number()
    }).optional(),
    delta: z.number().optional() // Percentage change
  }).optional()
});
export type AnalyticsData = z.infer<typeof AnalyticsData>;

// ============================
// Health Integration Types
// ============================

export const HealthMetric = z.enum([
  "steps",
  "heartRate",
  "hrv", // Heart Rate Variability
  "sleep",
  "activeCalories"
]);
export type HealthMetric = z.infer<typeof HealthMetric>;

export const HealthData = z.object({
  userId: z.string(),
  date: z.string(),
  metric: HealthMetric,
  value: z.number(),
  unit: z.string(),
  source: z.enum(["healthkit", "googlefit", "manual"]),
  createdAt: z.string().datetime()
});
export type HealthData = z.infer<typeof HealthData>;

// ============================
// Domain Functions
// ============================

export function computeDayCompletion(log: DayLog): number {
  const total = 6;
  const done = Object.values(log.tasks).filter(Boolean).length;
  return Math.round((done / total) * 100);
}

export function xpForDay(completionPercentage: number): number {
  return Math.round(completionPercentage);
}

export function nextLevelAt(level: number): number {
  return Math.round(100 * level * (level + 1));
}

export function calculateLevel(totalXp: number): { level: number; xpToNext: number } {
  let level = 1;
  let xpRequired = nextLevelAt(level);
  
  while (totalXp >= xpRequired) {
    level++;
    xpRequired = nextLevelAt(level);
  }
  
  const currentLevelXp = level > 1 ? nextLevelAt(level - 1) : 0;
  const xpToNext = xpRequired - totalXp;
  
  return { level, xpToNext };
}

export function getRankForLevel(level: number): User["rank"] {
  if (level >= 50) return "S";
  if (level >= 40) return "A";
  if (level >= 30) return "B";
  if (level >= 20) return "C";
  if (level >= 10) return "D";
  return "E";
}

// ============================
// Utility Functions
// ============================

export const kgToLbs = (kg: number): number => +(kg * 2.2046226218).toFixed(1);
export const lbsToKg = (lbs: number): number => +(lbs / 2.2046226218).toFixed(1);

export function formatWeight(weightKg: number, unit: WeightUnit): string {
  if (unit === "lbs") {
    return `${kgToLbs(weightKg)} lbs`;
  }
  return `${weightKg} kg`;
}

export function isDateToday(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return date === today;
}

export function getStreakDates(logs: DayLog[]): { current: number; longest: number } {
  if (logs.length === 0) return { current: 0, longest: 0 };
  
  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let current = 0;
  let longest = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;
  
  for (const log of sortedLogs) {
    const completion = computeDayCompletion(log);
    const logDate = new Date(log.date);
    
    if (completion === 100) {
      if (lastDate === null || 
          (lastDate.getTime() - logDate.getTime()) === 86400000) { // 1 day difference
        tempStreak++;
        if (current === 0) current = tempStreak;
      } else {
        // Streak broken
        longest = Math.max(longest, tempStreak);
        tempStreak = 1;
      }
      lastDate = logDate;
    } else {
      // Day not completed
      longest = Math.max(longest, tempStreak);
      tempStreak = 0;
      lastDate = null;
    }
  }
  
  longest = Math.max(longest, tempStreak);
  
  return { current, longest };
}