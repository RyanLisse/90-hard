export type WeightUnit = 'kg' | 'lbs';

export interface WeightEntry {
  id: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  weight: number;
  unit: WeightUnit;
  createdAt: string;
  updatedAt: string;
}

export interface WeightGoal {
  id: string;
  userId: string;
  targetWeight: number;
  targetUnit: WeightUnit;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeightStats {
  currentWeight: number;
  currentUnit: WeightUnit;
  previousWeight?: number;
  delta?: number;
  movingAverage7Day?: number;
  movingAverage30Day?: number;
  trend: 'up' | 'down' | 'stable';
}

export interface FastingEntry {
  id: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // ISO datetime string
  endTime?: string; // ISO datetime string
  targetHours: number; // e.g., 16 for 16:8
  actualHours?: number;
  pattern?: string; // e.g., "16:8", "18:6"
  createdAt: string;
  updatedAt: string;
}

export interface FastingStats {
  currentStreak: number;
  longestStreak: number;
  weeklyAverage: number;
  successRate: number; // percentage
  totalFasts: number;
  completedFasts: number;
}
