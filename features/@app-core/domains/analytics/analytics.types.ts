export type TimeRange = "7D" | "30D" | "90D" | "ALL";

export interface DateRange {
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string; // ISO date string YYYY-MM-DD
}

export interface TaskCompletionData {
  date: string;
  workout1: boolean;
  workout2: boolean;
  diet: boolean;
  water: boolean;
  reading: boolean;
  photo: boolean;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
}

export interface PeriodStats {
  totalDays: number;
  activeDays: number;
  averageCompletion: number;
  perfectDays: number;
  currentStreak: number;
  longestStreak: number;
  taskBreakdown: {
    workout1: number;
    workout2: number;
    diet: number;
    water: number;
    reading: number;
    photo: number;
  };
}

export interface ComparisonStats {
  current: PeriodStats;
  previous: PeriodStats;
  improvements: {
    averageCompletion: number;
    perfectDays: number;
    currentStreak: number;
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TrendData {
  points: ChartDataPoint[];
  trend: "up" | "down" | "stable";
  trendPercentage: number;
  movingAverage: number[];
}

export interface AnalyticsInsight {
  id: string;
  type: "achievement" | "warning" | "suggestion" | "milestone";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionable: boolean;
  actionText?: string;
  createdAt: string;
}

export interface UserAnalytics {
  userId: string;
  timeRange: TimeRange;
  dateRange: DateRange;
  periodStats: PeriodStats;
  completionTrend: TrendData;
  taskTrends: Record<string, TrendData>;
  insights: AnalyticsInsight[];
  lastUpdated: string;
}

export interface AnalyticsExportData {
  userId: string;
  exportType: "CSV" | "JSON";
  timeRange: TimeRange;
  data: TaskCompletionData[];
  metadata: {
    exportedAt: string;
    totalRecords: number;
    dateRange: DateRange;
  };
}

export interface CorrelationData {
  metric1: string;
  metric2: string;
  correlation: number;
  strength: "weak" | "moderate" | "strong";
  significance: number;
  dataPoints: Array<{
    date: string;
    value1: number;
    value2: number;
  }>;
}

export interface WeightAnalytics {
  weightTrend: TrendData;
  weightVsCompletion: CorrelationData;
  averageWeightChange: number;
  weightGoalProgress?: number;
}

export interface FastingAnalytics {
  fastingTrend: TrendData;
  fastingVsCompletion: CorrelationData;
  averageFastingHours: number;
  fastingSuccessRate: number;
}

export interface ComprehensiveAnalytics extends UserAnalytics {
  weightAnalytics?: WeightAnalytics;
  fastingAnalytics?: FastingAnalytics;
  healthCorrelations: CorrelationData[];
}
