export type HealthDataType =
  | "steps"
  | "heartRate"
  | "heartRateVariability"
  | "sleepAnalysis"
  | "activeEnergyBurned"
  | "restingHeartRate"
  | "bodyWeight"
  | "bodyFatPercentage"
  | "workouts";

export type HealthPlatform = "apple" | "google" | "fitbit" | "garmin";

export interface HealthPermission {
  type: HealthDataType;
  read: boolean;
  write: boolean;
  granted: boolean;
  requestedAt: string;
  grantedAt?: string;
}

export interface HealthDataPoint {
  id: string;
  userId: string;
  type: HealthDataType;
  value: number;
  unit: string;
  startDate: string; // ISO datetime
  endDate: string; // ISO datetime
  source: string; // App or device that recorded the data
  platform: HealthPlatform;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface StepsData extends Omit<HealthDataPoint, "type"> {
  type: "steps";
  value: number; // Number of steps
  unit: "count";
}

export interface HeartRateData extends Omit<HealthDataPoint, "type"> {
  type: "heartRate";
  value: number; // BPM
  unit: "bpm";
  context?: "resting" | "active" | "recovery" | "workout";
}

export interface HRVData extends Omit<HealthDataPoint, "type"> {
  type: "heartRateVariability";
  value: number; // RMSSD in milliseconds
  unit: "ms";
}

export interface SleepData extends Omit<HealthDataPoint, "type"> {
  type: "sleepAnalysis";
  value: number; // Duration in minutes
  unit: "minutes";
  sleepStage?: "awake" | "light" | "deep" | "rem";
}

export interface WorkoutData extends Omit<HealthDataPoint, "type"> {
  type: "workouts";
  value: number; // Duration in minutes
  unit: "minutes";
  workoutType: string;
  caloriesBurned?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
}

export interface HealthSyncStatus {
  userId: string;
  platform: HealthPlatform;
  lastSyncAt: string;
  nextSyncAt: string;
  isEnabled: boolean;
  syncInterval: "realtime" | "hourly" | "daily";
  dataTypes: HealthDataType[];
  errors: HealthSyncError[];
  totalRecordsSynced: number;
  lastSuccessfulSync: string;
}

export interface HealthSyncError {
  id: string;
  type: "permission" | "network" | "quota" | "format" | "unknown";
  message: string;
  dataType?: HealthDataType;
  occurredAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface HealthCorrelation {
  id: string;
  userId: string;
  metric1Type: HealthDataType | "completion_rate" | "weight" | "fasting_hours";
  metric2Type: HealthDataType | "completion_rate" | "weight" | "fasting_hours";
  correlationCoefficient: number; // -1 to 1
  significance: number; // p-value
  strength: "very_weak" | "weak" | "moderate" | "strong" | "very_strong";
  direction: "positive" | "negative" | "none";
  sampleSize: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  calculatedAt: string;
  insights?: string[];
}

export interface HealthInsight {
  id: string;
  userId: string;
  type: "correlation" | "trend" | "anomaly" | "recommendation";
  priority: "low" | "medium" | "high";
  title: string;
  description: string;
  dataTypes: HealthDataType[];
  actionable: boolean;
  actionText?: string;
  confidence: number; // 0-1
  validUntil?: string;
  createdAt: string;
  viewedAt?: string;
  dismissedAt?: string;
}

export interface HealthTrend {
  dataType: HealthDataType;
  timeRange: "7D" | "30D" | "90D";
  direction: "increasing" | "decreasing" | "stable";
  changePercentage: number;
  averageValue: number;
  minValue: number;
  maxValue: number;
  dataPoints: Array<{
    date: string;
    value: number;
  }>;
  significance: number;
}

export interface HealthGoal {
  id: string;
  userId: string;
  dataType: HealthDataType;
  targetValue: number;
  unit: string;
  timeFrame: "daily" | "weekly" | "monthly";
  startDate: string;
  endDate?: string;
  isActive: boolean;
  progress: number; // 0-1
  achievedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthIntegrationConfig {
  platform: HealthPlatform;
  apiKey?: string;
  clientId?: string;
  redirectUri?: string;
  scopes: string[];
  permissions: HealthPermission[];
  syncSettings: {
    enabled: boolean;
    interval: "realtime" | "hourly" | "daily";
    dataTypes: HealthDataType[];
    retentionDays: number;
  };
  privacySettings: {
    anonymizeData: boolean;
    shareWithPartners: boolean;
    dataProcessingConsent: boolean;
    consentDate: string;
  };
}

export interface AppleHealthKitData {
  identifier: string;
  quantity?: {
    doubleValue: number;
    unit: string;
  };
  startDate: string;
  endDate: string;
  source: {
    name: string;
    bundleIdentifier: string;
  };
  metadata?: Record<string, any>;
}

export interface GoogleFitData {
  dataTypeName: string;
  startTimeNanos: string;
  endTimeNanos: string;
  value: Array<{
    intVal?: number;
    fpVal?: number;
    stringVal?: string;
    mapVal?: Array<{
      key: string;
      value: any;
    }>;
  }>;
  dataSourceId: string;
  originDataSourceId: string;
}

export interface HealthDataTransform {
  fromPlatform: HealthPlatform;
  toPlatform: HealthPlatform;
  dataType: HealthDataType;
  transformFn: (data: any) => HealthDataPoint;
  validateFn: (data: any) => boolean;
}

export interface HealthAnalytics {
  userId: string;
  timeRange: "7D" | "30D" | "90D" | "ALL";
  summary: {
    totalDataPoints: number;
    dataTypesCovered: HealthDataType[];
    syncStatus: Record<HealthPlatform, boolean>;
    lastUpdateAt: string;
  };
  correlations: HealthCorrelation[];
  trends: HealthTrend[];
  insights: HealthInsight[];
  goals: HealthGoal[];
  averageValues: Record<HealthDataType, number>;
  complianceScore: number; // How well user is meeting health goals
}
