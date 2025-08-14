import { describe, it, expect } from "vitest";
import type {
  HealthDataType,
  HealthPlatform,
  HealthPermission,
  HealthDataPoint,
  StepsData,
  HeartRateData,
  HRVData,
  SleepData,
  WorkoutData,
  HealthSyncStatus,
  HealthSyncError,
  HealthCorrelation,
  HealthInsight,
  HealthTrend,
  HealthGoal,
  HealthIntegrationConfig,
  AppleHealthKitData,
  GoogleFitData,
  HealthDataTransform,
  HealthAnalytics,
} from "./health.types";

describe("Health Types", () => {
  describe("HealthDataType", () => {
    it("should accept all valid health data types", () => {
      const validTypes: HealthDataType[] = [
        "steps",
        "heartRate",
        "heartRateVariability",
        "sleepAnalysis",
        "activeEnergyBurned",
        "restingHeartRate",
        "bodyWeight",
        "bodyFatPercentage",
        "workouts",
      ];

      validTypes.forEach((type) => {
        const dataType: HealthDataType = type;
        expect(dataType).toBe(type);
      });
    });

    it("should validate health data type", () => {
      const isValidHealthDataType = (value: string): value is HealthDataType => {
        return [
          "steps",
          "heartRate",
          "heartRateVariability",
          "sleepAnalysis",
          "activeEnergyBurned",
          "restingHeartRate",
          "bodyWeight",
          "bodyFatPercentage",
          "workouts",
        ].includes(value);
      };

      expect(isValidHealthDataType("steps")).toBe(true);
      expect(isValidHealthDataType("heartRate")).toBe(true);
      expect(isValidHealthDataType("invalidType")).toBe(false);
      expect(isValidHealthDataType("")).toBe(false);
    });
  });

  describe("HealthPlatform", () => {
    it("should accept all valid platforms", () => {
      const validPlatforms: HealthPlatform[] = [
        "apple",
        "google",
        "fitbit",
        "garmin",
      ];

      validPlatforms.forEach((platform) => {
        const healthPlatform: HealthPlatform = platform;
        expect(healthPlatform).toBe(platform);
      });
    });

    it("should validate platform types", () => {
      const isValidPlatform = (value: string): value is HealthPlatform => {
        return ["apple", "google", "fitbit", "garmin"].includes(value);
      };

      expect(isValidPlatform("apple")).toBe(true);
      expect(isValidPlatform("samsung")).toBe(false);
      expect(isValidPlatform("")).toBe(false);
    });
  });

  describe("HealthPermission", () => {
    it("should create valid health permission", () => {
      const permission: HealthPermission = {
        type: "steps",
        read: true,
        write: false,
        granted: true,
        requestedAt: "2024-01-15T10:00:00Z",
        grantedAt: "2024-01-15T10:05:00Z",
      };

      expect(permission.type).toBe("steps");
      expect(permission.granted).toBe(true);
      expect(permission.grantedAt).toBeDefined();
    });

    it("should handle denied permissions", () => {
      const deniedPermission: HealthPermission = {
        type: "heartRate",
        read: true,
        write: false,
        granted: false,
        requestedAt: "2024-01-15T10:00:00Z",
      };

      expect(deniedPermission.granted).toBe(false);
      expect(deniedPermission.grantedAt).toBeUndefined();
    });

    it("should handle read/write permissions", () => {
      const readWritePermission: HealthPermission = {
        type: "bodyWeight",
        read: true,
        write: true,
        granted: true,
        requestedAt: "2024-01-15T10:00:00Z",
        grantedAt: "2024-01-15T10:05:00Z",
      };

      expect(readWritePermission.read).toBe(true);
      expect(readWritePermission.write).toBe(true);
    });
  });

  describe("HealthDataPoint", () => {
    it("should create valid health data point", () => {
      const dataPoint: HealthDataPoint = {
        id: "health-001",
        userId: "user123",
        type: "steps",
        value: 10000,
        unit: "count",
        startDate: "2024-01-15T00:00:00Z",
        endDate: "2024-01-15T23:59:59Z",
        source: "iPhone Health",
        platform: "apple",
        metadata: {
          device: "iPhone 15 Pro",
          version: "17.2",
        },
        createdAt: "2024-01-15T23:59:59Z",
      };

      expect(dataPoint.type).toBe("steps");
      expect(dataPoint.value).toBe(10000);
      expect(dataPoint.platform).toBe("apple");
      expect(dataPoint.metadata?.device).toBe("iPhone 15 Pro");
    });

    it("should handle minimal data point", () => {
      const minimal: HealthDataPoint = {
        id: "health-002",
        userId: "user123",
        type: "heartRate",
        value: 72,
        unit: "bpm",
        startDate: "2024-01-15T10:00:00Z",
        endDate: "2024-01-15T10:00:00Z",
        source: "Apple Watch",
        platform: "apple",
        createdAt: "2024-01-15T10:00:00Z",
      };

      expect(minimal.metadata).toBeUndefined();
      expect(minimal.type).toBe("heartRate");
    });
  });

  describe("StepsData", () => {
    it("should create valid steps data", () => {
      const stepsData: StepsData = {
        id: "steps-001",
        userId: "user123",
        type: "steps",
        value: 12500,
        unit: "count",
        startDate: "2024-01-15T00:00:00Z",
        endDate: "2024-01-15T23:59:59Z",
        source: "iPhone Health",
        platform: "apple",
        createdAt: "2024-01-15T23:59:59Z",
      };

      expect(stepsData.type).toBe("steps");
      expect(stepsData.unit).toBe("count");
      expect(stepsData.value).toBeGreaterThan(0);
    });

    it("should handle zero steps", () => {
      const zeroSteps: StepsData = {
        id: "steps-002",
        userId: "user123",
        type: "steps",
        value: 0,
        unit: "count",
        startDate: "2024-01-15T00:00:00Z",
        endDate: "2024-01-15T23:59:59Z",
        source: "Fitbit",
        platform: "fitbit",
        createdAt: "2024-01-15T23:59:59Z",
      };

      expect(zeroSteps.value).toBe(0);
    });
  });

  describe("HeartRateData", () => {
    it("should create valid heart rate data", () => {
      const heartRate: HeartRateData = {
        id: "hr-001",
        userId: "user123",
        type: "heartRate",
        value: 68,
        unit: "bpm",
        context: "resting",
        startDate: "2024-01-15T08:00:00Z",
        endDate: "2024-01-15T08:00:00Z",
        source: "Apple Watch Series 9",
        platform: "apple",
        createdAt: "2024-01-15T08:00:00Z",
      };

      expect(heartRate.type).toBe("heartRate");
      expect(heartRate.unit).toBe("bpm");
      expect(heartRate.context).toBe("resting");
      expect(heartRate.value).toBeGreaterThan(0);
    });

    it("should handle different heart rate contexts", () => {
      const contexts: HeartRateData["context"][] = [
        "resting",
        "active",
        "recovery",
        "workout",
      ];

      contexts.forEach((context) => {
        const hr: HeartRateData = {
          id: `hr-${context}`,
          userId: "user123",
          type: "heartRate",
          value: 75,
          unit: "bpm",
          context,
          startDate: "2024-01-15T08:00:00Z",
          endDate: "2024-01-15T08:00:00Z",
          source: "Apple Watch",
          platform: "apple",
          createdAt: "2024-01-15T08:00:00Z",
        };

        expect(hr.context).toBe(context);
      });
    });
  });

  describe("HRVData", () => {
    it("should create valid HRV data", () => {
      const hrvData: HRVData = {
        id: "hrv-001",
        userId: "user123",
        type: "heartRateVariability",
        value: 45.5,
        unit: "ms",
        startDate: "2024-01-15T08:00:00Z",
        endDate: "2024-01-15T08:00:00Z",
        source: "Apple Watch",
        platform: "apple",
        createdAt: "2024-01-15T08:00:00Z",
      };

      expect(hrvData.type).toBe("heartRateVariability");
      expect(hrvData.unit).toBe("ms");
      expect(hrvData.value).toBeGreaterThan(0);
    });
  });

  describe("SleepData", () => {
    it("should create valid sleep data", () => {
      const sleepData: SleepData = {
        id: "sleep-001",
        userId: "user123",
        type: "sleepAnalysis",
        value: 420,
        unit: "minutes",
        sleepStage: "deep",
        startDate: "2024-01-15T00:00:00Z",
        endDate: "2024-01-15T07:00:00Z",
        source: "Apple Watch",
        platform: "apple",
        createdAt: "2024-01-15T07:00:00Z",
      };

      expect(sleepData.type).toBe("sleepAnalysis");
      expect(sleepData.unit).toBe("minutes");
      expect(sleepData.sleepStage).toBe("deep");
      expect(sleepData.value).toBe(420);
    });

    it("should handle different sleep stages", () => {
      const stages: SleepData["sleepStage"][] = [
        "awake",
        "light",
        "deep",
        "rem",
      ];

      stages.forEach((stage) => {
        const sleep: SleepData = {
          id: `sleep-${stage}`,
          userId: "user123",
          type: "sleepAnalysis",
          value: 90,
          unit: "minutes",
          sleepStage: stage,
          startDate: "2024-01-15T00:00:00Z",
          endDate: "2024-01-15T01:30:00Z",
          source: "Sleep Tracker",
          platform: "fitbit",
          createdAt: "2024-01-15T01:30:00Z",
        };

        expect(sleep.sleepStage).toBe(stage);
      });
    });
  });

  describe("WorkoutData", () => {
    it("should create comprehensive workout data", () => {
      const workoutData: WorkoutData = {
        id: "workout-001",
        userId: "user123",
        type: "workouts",
        value: 45,
        unit: "minutes",
        workoutType: "Running",
        caloriesBurned: 350,
        averageHeartRate: 145,
        maxHeartRate: 165,
        startDate: "2024-01-15T06:00:00Z",
        endDate: "2024-01-15T06:45:00Z",
        source: "Apple Fitness",
        platform: "apple",
        createdAt: "2024-01-15T06:45:00Z",
      };

      expect(workoutData.type).toBe("workouts");
      expect(workoutData.unit).toBe("minutes");
      expect(workoutData.workoutType).toBe("Running");
      expect(workoutData.caloriesBurned).toBe(350);
      expect(workoutData.maxHeartRate).toBeGreaterThan(workoutData.averageHeartRate!);
    });

    it("should handle minimal workout data", () => {
      const minimal: WorkoutData = {
        id: "workout-002",
        userId: "user123",
        type: "workouts",
        value: 30,
        unit: "minutes",
        workoutType: "Yoga",
        startDate: "2024-01-15T07:00:00Z",
        endDate: "2024-01-15T07:30:00Z",
        source: "Manual Entry",
        platform: "apple",
        createdAt: "2024-01-15T07:30:00Z",
      };

      expect(minimal.caloriesBurned).toBeUndefined();
      expect(minimal.averageHeartRate).toBeUndefined();
      expect(minimal.maxHeartRate).toBeUndefined();
    });
  });

  describe("HealthSyncStatus", () => {
    it("should create valid sync status", () => {
      const syncStatus: HealthSyncStatus = {
        userId: "user123",
        platform: "apple",
        lastSyncAt: "2024-01-15T10:00:00Z",
        nextSyncAt: "2024-01-15T11:00:00Z",
        isEnabled: true,
        syncInterval: "hourly",
        dataTypes: ["steps", "heartRate", "sleepAnalysis"],
        errors: [],
        totalRecordsSynced: 1250,
        lastSuccessfulSync: "2024-01-15T10:00:00Z",
      };

      expect(syncStatus.isEnabled).toBe(true);
      expect(syncStatus.syncInterval).toBe("hourly");
      expect(syncStatus.dataTypes).toHaveLength(3);
      expect(syncStatus.errors).toHaveLength(0);
    });

    it("should handle sync errors", () => {
      const syncError: HealthSyncError = {
        id: "error-001",
        type: "permission",
        message: "Heart rate permission denied",
        dataType: "heartRate",
        occurredAt: "2024-01-15T09:00:00Z",
        resolved: false,
      };

      const syncWithErrors: HealthSyncStatus = {
        userId: "user123",
        platform: "google",
        lastSyncAt: "2024-01-15T09:00:00Z",
        nextSyncAt: "2024-01-15T10:00:00Z",
        isEnabled: false,
        syncInterval: "daily",
        dataTypes: ["steps"],
        errors: [syncError],
        totalRecordsSynced: 0,
        lastSuccessfulSync: "2024-01-14T09:00:00Z",
      };

      expect(syncWithErrors.isEnabled).toBe(false);
      expect(syncWithErrors.errors).toHaveLength(1);
      expect(syncWithErrors.errors[0].resolved).toBe(false);
    });

    it("should validate sync intervals", () => {
      const intervals: HealthSyncStatus["syncInterval"][] = [
        "realtime",
        "hourly",
        "daily",
      ];

      intervals.forEach((interval) => {
        const sync: Partial<HealthSyncStatus> = {
          syncInterval: interval,
        };

        expect(sync.syncInterval).toBe(interval);
      });
    });
  });

  describe("HealthSyncError", () => {
    it("should create different error types", () => {
      const errorTypes: HealthSyncError["type"][] = [
        "permission",
        "network",
        "quota",
        "format",
        "unknown",
      ];

      errorTypes.forEach((type) => {
        const error: HealthSyncError = {
          id: `error-${type}`,
          type,
          message: `Test ${type} error`,
          occurredAt: "2024-01-15T09:00:00Z",
          resolved: false,
        };

        expect(error.type).toBe(type);
        expect(error.resolved).toBe(false);
      });
    });

    it("should handle resolved errors", () => {
      const resolvedError: HealthSyncError = {
        id: "error-resolved",
        type: "network",
        message: "Connection timeout",
        occurredAt: "2024-01-15T09:00:00Z",
        resolved: true,
        resolvedAt: "2024-01-15T09:15:00Z",
      };

      expect(resolvedError.resolved).toBe(true);
      expect(resolvedError.resolvedAt).toBeDefined();
    });
  });

  describe("HealthCorrelation", () => {
    it("should create valid correlation", () => {
      const correlation: HealthCorrelation = {
        id: "corr-001",
        userId: "user123",
        metric1Type: "steps",
        metric2Type: "completion_rate",
        correlationCoefficient: 0.75,
        significance: 0.01,
        strength: "strong",
        direction: "positive",
        sampleSize: 90,
        dateRange: {
          startDate: "2024-01-01",
          endDate: "2024-03-31",
        },
        calculatedAt: "2024-04-01T00:00:00Z",
        insights: [
          "Higher step counts correlate with better task completion",
          "Users who walk more tend to be more consistent",
        ],
      };

      expect(correlation.strength).toBe("strong");
      expect(correlation.direction).toBe("positive");
      expect(correlation.correlationCoefficient).toBeGreaterThan(0.7);
      expect(correlation.insights).toHaveLength(2);
    });

    it("should validate correlation strengths", () => {
      const strengths: HealthCorrelation["strength"][] = [
        "very_weak",
        "weak",
        "moderate",
        "strong",
        "very_strong",
      ];

      strengths.forEach((strength) => {
        const corr: Partial<HealthCorrelation> = {
          strength,
        };

        expect(corr.strength).toBe(strength);
      });
    });

    it("should handle negative correlations", () => {
      const negativeCorr: HealthCorrelation = {
        id: "corr-002",
        userId: "user123",
        metric1Type: "bodyWeight",
        metric2Type: "steps",
        correlationCoefficient: -0.65,
        significance: 0.05,
        strength: "moderate",
        direction: "negative",
        sampleSize: 60,
        dateRange: {
          startDate: "2024-01-01",
          endDate: "2024-02-29",
        },
        calculatedAt: "2024-03-01T00:00:00Z",
      };

      expect(negativeCorr.direction).toBe("negative");
      expect(negativeCorr.correlationCoefficient).toBeLessThan(0);
    });
  });

  describe("HealthInsight", () => {
    it("should create different insight types", () => {
      const insightTypes: HealthInsight["type"][] = [
        "correlation",
        "trend",
        "anomaly",
        "recommendation",
      ];

      insightTypes.forEach((type) => {
        const insight: HealthInsight = {
          id: `insight-${type}`,
          userId: "user123",
          type,
          priority: "medium",
          title: `${type} insight`,
          description: `This is a ${type} insight`,
          dataTypes: ["steps"],
          actionable: type === "recommendation",
          confidence: 0.8,
          createdAt: "2024-01-15T10:00:00Z",
        };

        expect(insight.type).toBe(type);
        if (type === "recommendation") {
          expect(insight.actionable).toBe(true);
        }
      });
    });

    it("should handle actionable insights", () => {
      const actionableInsight: HealthInsight = {
        id: "insight-actionable",
        userId: "user123",
        type: "recommendation",
        priority: "high",
        title: "Increase Daily Steps",
        description: "Your step count has been below average this week",
        dataTypes: ["steps"],
        actionable: true,
        actionText: "Set a daily step goal of 10,000",
        confidence: 0.9,
        validUntil: "2024-01-22T10:00:00Z",
        createdAt: "2024-01-15T10:00:00Z",
      };

      expect(actionableInsight.actionable).toBe(true);
      expect(actionableInsight.actionText).toBeDefined();
      expect(actionableInsight.validUntil).toBeDefined();
    });

    it("should track insight interactions", () => {
      const viewedInsight: HealthInsight = {
        id: "insight-viewed",
        userId: "user123",
        type: "trend",
        priority: "low",
        title: "Heart Rate Improving",
        description: "Your resting heart rate has decreased over time",
        dataTypes: ["restingHeartRate"],
        actionable: false,
        confidence: 0.95,
        createdAt: "2024-01-15T10:00:00Z",
        viewedAt: "2024-01-15T14:30:00Z",
        dismissedAt: "2024-01-15T14:31:00Z",
      };

      expect(viewedInsight.viewedAt).toBeDefined();
      expect(viewedInsight.dismissedAt).toBeDefined();
    });
  });

  describe("HealthTrend", () => {
    it("should create valid trend data", () => {
      const trend: HealthTrend = {
        dataType: "steps",
        timeRange: "30D",
        direction: "increasing",
        changePercentage: 15.5,
        averageValue: 9250,
        minValue: 5000,
        maxValue: 15000,
        dataPoints: [
          { date: "2024-01-01", value: 8000 },
          { date: "2024-01-15", value: 9500 },
          { date: "2024-01-30", value: 10500 },
        ],
        significance: 0.02,
      };

      expect(trend.direction).toBe("increasing");
      expect(trend.changePercentage).toBeGreaterThan(0);
      expect(trend.maxValue).toBeGreaterThan(trend.minValue);
      expect(trend.dataPoints).toHaveLength(3);
    });

    it("should handle different trend directions", () => {
      const directions: HealthTrend["direction"][] = [
        "increasing",
        "decreasing",
        "stable",
      ];

      directions.forEach((direction) => {
        const trend: Partial<HealthTrend> = {
          direction,
          changePercentage: direction === "stable" ? 0 : 10,
        };

        expect(trend.direction).toBe(direction);
      });
    });
  });

  describe("HealthGoal", () => {
    it("should create active health goal", () => {
      const goal: HealthGoal = {
        id: "goal-001",
        userId: "user123",
        dataType: "steps",
        targetValue: 10000,
        unit: "count",
        timeFrame: "daily",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        isActive: true,
        progress: 0.75,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      };

      expect(goal.isActive).toBe(true);
      expect(goal.progress).toBe(0.75);
      expect(goal.targetValue).toBe(10000);
      expect(goal.achievedAt).toBeUndefined();
    });

    it("should handle achieved goals", () => {
      const achievedGoal: HealthGoal = {
        id: "goal-002",
        userId: "user123",
        dataType: "bodyWeight",
        targetValue: 75,
        unit: "kg",
        timeFrame: "monthly",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        isActive: false,
        progress: 1.0,
        achievedAt: "2024-01-25T10:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-25T10:00:00Z",
      };

      expect(achievedGoal.progress).toBe(1.0);
      expect(achievedGoal.achievedAt).toBeDefined();
      expect(achievedGoal.isActive).toBe(false);
    });

    it("should validate time frames", () => {
      const timeFrames: HealthGoal["timeFrame"][] = [
        "daily",
        "weekly",
        "monthly",
      ];

      timeFrames.forEach((timeFrame) => {
        const goal: Partial<HealthGoal> = {
          timeFrame,
        };

        expect(goal.timeFrame).toBe(timeFrame);
      });
    });
  });

  describe("HealthIntegrationConfig", () => {
    it("should create comprehensive integration config", () => {
      const config: HealthIntegrationConfig = {
        platform: "apple",
        clientId: "com.app.healthkit",
        scopes: ["health.read", "health.write"],
        permissions: [
          {
            type: "steps",
            read: true,
            write: false,
            granted: true,
            requestedAt: "2024-01-15T10:00:00Z",
          },
        ],
        syncSettings: {
          enabled: true,
          interval: "hourly",
          dataTypes: ["steps", "heartRate"],
          retentionDays: 90,
        },
        privacySettings: {
          anonymizeData: true,
          shareWithPartners: false,
          dataProcessingConsent: true,
          consentDate: "2024-01-15T10:00:00Z",
        },
      };

      expect(config.platform).toBe("apple");
      expect(config.syncSettings.enabled).toBe(true);
      expect(config.privacySettings.anonymizeData).toBe(true);
      expect(config.permissions).toHaveLength(1);
    });

    it("should handle different platforms", () => {
      const platforms: HealthPlatform[] = ["apple", "google", "fitbit", "garmin"];

      platforms.forEach((platform) => {
        const config: Partial<HealthIntegrationConfig> = {
          platform,
        };

        expect(config.platform).toBe(platform);
      });
    });
  });

  describe("Platform-Specific Data", () => {
    it("should create Apple HealthKit data", () => {
      const appleData: AppleHealthKitData = {
        identifier: "HKQuantityTypeIdentifierStepCount",
        quantity: {
          doubleValue: 12500,
          unit: "count",
        },
        startDate: "2024-01-15T00:00:00Z",
        endDate: "2024-01-15T23:59:59Z",
        source: {
          name: "iPhone",
          bundleIdentifier: "com.apple.Health",
        },
        metadata: {
          HKWasUserEntered: false,
          HKDeviceName: "iPhone 15 Pro",
        },
      };

      expect(appleData.identifier).toBe("HKQuantityTypeIdentifierStepCount");
      expect(appleData.quantity?.doubleValue).toBe(12500);
      expect(appleData.source.name).toBe("iPhone");
    });

    it("should create Google Fit data", () => {
      const googleData: GoogleFitData = {
        dataTypeName: "com.google.step_count.delta",
        startTimeNanos: "1642204800000000000",
        endTimeNanos: "1642291199000000000",
        value: [
          {
            intVal: 12500,
          },
        ],
        dataSourceId: "raw:com.google.step_count.delta:com.google.android.gms:estimated_steps",
        originDataSourceId: "raw:com.google.step_count.delta:com.google.android.gms:estimated_steps",
      };

      expect(googleData.dataTypeName).toBe("com.google.step_count.delta");
      expect(googleData.value[0].intVal).toBe(12500);
    });
  });

  describe("HealthDataTransform", () => {
    it("should create data transformation", () => {
      const transform: HealthDataTransform = {
        fromPlatform: "apple",
        toPlatform: "google",
        dataType: "steps",
        transformFn: (data: AppleHealthKitData): HealthDataPoint => ({
          id: `transformed-${Date.now()}`,
          userId: "user123",
          type: "steps",
          value: data.quantity?.doubleValue || 0,
          unit: data.quantity?.unit || "count",
          startDate: data.startDate,
          endDate: data.endDate,
          source: data.source.name,
          platform: "google",
          createdAt: new Date().toISOString(),
        }),
        validateFn: (data: any): boolean => {
          return data && typeof data.quantity?.doubleValue === "number";
        },
      };

      expect(transform.fromPlatform).toBe("apple");
      expect(transform.toPlatform).toBe("google");
      expect(transform.dataType).toBe("steps");
      expect(typeof transform.transformFn).toBe("function");
      expect(typeof transform.validateFn).toBe("function");
    });
  });

  describe("HealthAnalytics", () => {
    it("should create comprehensive health analytics", () => {
      const analytics: HealthAnalytics = {
        userId: "user123",
        timeRange: "90D",
        summary: {
          totalDataPoints: 2500,
          dataTypesCovered: ["steps", "heartRate", "sleepAnalysis"],
          syncStatus: {
            apple: true,
            google: false,
            fitbit: false,
            garmin: false,
          },
          lastUpdateAt: "2024-01-15T10:00:00Z",
        },
        correlations: [],
        trends: [],
        insights: [],
        goals: [],
        averageValues: {
          steps: 9250,
          heartRate: 72,
          sleepAnalysis: 450,
          bodyWeight: 75,
          heartRateVariability: 45,
          restingHeartRate: 65,
          activeEnergyBurned: 650,
          bodyFatPercentage: 18,
          workouts: 45,
        },
        complianceScore: 0.85,
      };

      expect(analytics.timeRange).toBe("90D");
      expect(analytics.summary.dataTypesCovered).toHaveLength(3);
      expect(analytics.summary.syncStatus.apple).toBe(true);
      expect(analytics.complianceScore).toBeGreaterThan(0.8);
      expect(analytics.averageValues.steps).toBe(9250);
    });

    it("should handle partial health analytics", () => {
      const partial: HealthAnalytics = {
        userId: "user456",
        timeRange: "7D",
        summary: {
          totalDataPoints: 50,
          dataTypesCovered: ["steps"],
          syncStatus: {
            apple: false,
            google: true,
            fitbit: false,
            garmin: false,
          },
          lastUpdateAt: "2024-01-15T10:00:00Z",
        },
        correlations: [],
        trends: [],
        insights: [],
        goals: [],
        averageValues: {
          steps: 8500,
        } as Record<HealthDataType, number>,
        complianceScore: 0.65,
      };

      expect(partial.summary.dataTypesCovered).toHaveLength(1);
      expect(partial.complianceScore).toBeLessThan(0.7);
    });
  });

  describe("Type Guards and Utilities", () => {
    it("should validate health analytics structure", () => {
      const isValidHealthAnalytics = (data: any): data is HealthAnalytics => {
        if (!data || typeof data !== "object") return false;

        const requiredFields = [
          "userId",
          "timeRange",
          "summary",
          "correlations",
          "trends",
          "insights",
          "goals",
          "averageValues",
          "complianceScore",
        ];

        return requiredFields.every((field) => field in data);
      };

      const validAnalytics: HealthAnalytics = {
        userId: "user123",
        timeRange: "30D",
        summary: {
          totalDataPoints: 100,
          dataTypesCovered: ["steps"],
          syncStatus: { apple: true, google: false, fitbit: false, garmin: false },
          lastUpdateAt: "2024-01-15T10:00:00Z",
        },
        correlations: [],
        trends: [],
        insights: [],
        goals: [],
        averageValues: { steps: 8000 } as Record<HealthDataType, number>,
        complianceScore: 0.8,
      };

      expect(isValidHealthAnalytics(validAnalytics)).toBe(true);
      expect(isValidHealthAnalytics({ userId: "test" })).toBe(false);
      expect(isValidHealthAnalytics(null)).toBe(false);
    });

    it("should calculate compliance score", () => {
      const calculateCompliance = (
        goals: HealthGoal[],
        achievements: number,
      ): number => {
        if (goals.length === 0) return 0;

        const activeGoals = goals.filter((g) => g.isActive);
        if (activeGoals.length === 0) return 1;

        const avgProgress = activeGoals.reduce(
          (sum, goal) => sum + goal.progress,
          0,
        ) / activeGoals.length;

        return Math.min(avgProgress + achievements * 0.1, 1);
      };

      const goals: HealthGoal[] = [
        {
          id: "goal-1",
          userId: "user123",
          dataType: "steps",
          targetValue: 10000,
          unit: "count",
          timeFrame: "daily",
          startDate: "2024-01-01",
          isActive: true,
          progress: 0.8,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "goal-2",
          userId: "user123",
          dataType: "sleepAnalysis",
          targetValue: 480,
          unit: "minutes",
          timeFrame: "daily",
          startDate: "2024-01-01",
          isActive: true,
          progress: 0.9,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z",
        },
      ];

      expect(calculateCompliance(goals, 2)).toBe(1); // Capped at 1
      expect(calculateCompliance(goals, 0)).toBeCloseTo(0.85);
      expect(calculateCompliance([], 5)).toBe(0);
    });
  });
});