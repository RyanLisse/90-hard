import { describe, it, expect } from 'vitest';
import type {
  TimeRange,
  DateRange,
  TaskCompletionData,
  PeriodStats,
  ComparisonStats,
  ChartDataPoint,
  TrendData,
  AnalyticsInsight,
  UserAnalytics,
  AnalyticsExportData,
  CorrelationData,
  WeightAnalytics,
  FastingAnalytics,
  ComprehensiveAnalytics,
} from './analytics.types';

describe('Analytics Types', () => {
  describe('TimeRange', () => {
    it('should accept valid time ranges', () => {
      const validRanges: TimeRange[] = ['7D', '30D', '90D', 'ALL'];
      
      validRanges.forEach(range => {
        const timeRange: TimeRange = range;
        expect(timeRange).toBe(range);
      });
    });

    it('should be used in type guards', () => {
      const isValidTimeRange = (value: string): value is TimeRange => {
        return ['7D', '30D', '90D', 'ALL'].includes(value);
      };

      expect(isValidTimeRange('7D')).toBe(true);
      expect(isValidTimeRange('30D')).toBe(true);
      expect(isValidTimeRange('90D')).toBe(true);
      expect(isValidTimeRange('ALL')).toBe(true);
      expect(isValidTimeRange('60D')).toBe(false);
      expect(isValidTimeRange('')).toBe(false);
    });
  });

  describe('DateRange', () => {
    it('should create valid date range', () => {
      const dateRange: DateRange = {
        startDate: '2024-01-01',
        endDate: '2024-03-31',
      };

      expect(dateRange.startDate).toBe('2024-01-01');
      expect(dateRange.endDate).toBe('2024-03-31');
    });

    it('should validate date range format', () => {
      const isValidDateRange = (range: any): range is DateRange => {
        if (!range || typeof range !== 'object') return false;
        
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        return (
          typeof range.startDate === 'string' &&
          typeof range.endDate === 'string' &&
          dateRegex.test(range.startDate) &&
          dateRegex.test(range.endDate)
        );
      };

      expect(isValidDateRange({ startDate: '2024-01-01', endDate: '2024-12-31' })).toBe(true);
      expect(isValidDateRange({ startDate: '01/01/2024', endDate: '12/31/2024' })).toBe(false);
      expect(isValidDateRange({ startDate: '2024-01-01' })).toBe(false);
      expect(isValidDateRange(null)).toBe(false);
    });
  });

  describe('TaskCompletionData', () => {
    it('should create valid task completion data', () => {
      const taskData: TaskCompletionData = {
        date: '2024-01-15',
        workout1: true,
        workout2: true,
        diet: true,
        water: true,
        reading: false,
        photo: true,
        completionPercentage: 83.33,
        totalTasks: 6,
        completedTasks: 5,
      };

      expect(taskData.completedTasks).toBe(5);
      expect(taskData.completionPercentage).toBeCloseTo(83.33);
    });

    it('should calculate completion percentage correctly', () => {
      const calculateCompletionPercentage = (data: Omit<TaskCompletionData, 'completionPercentage' | 'totalTasks' | 'completedTasks'>): number => {
        const tasks = [data.workout1, data.workout2, data.diet, data.water, data.reading, data.photo];
        const completed = tasks.filter(Boolean).length;
        return (completed / tasks.length) * 100;
      };

      const data = {
        date: '2024-01-15',
        workout1: true,
        workout2: true,
        diet: false,
        water: true,
        reading: false,
        photo: false,
      };

      expect(calculateCompletionPercentage(data)).toBeCloseTo(50);
    });

    it('should create default task completion data', () => {
      const createDefaultTaskCompletion = (date: string): TaskCompletionData => ({
        date,
        workout1: false,
        workout2: false,
        diet: false,
        water: false,
        reading: false,
        photo: false,
        completionPercentage: 0,
        totalTasks: 6,
        completedTasks: 0,
      });

      const defaultData = createDefaultTaskCompletion('2024-01-01');
      expect(defaultData.completedTasks).toBe(0);
      expect(defaultData.totalTasks).toBe(6);
      expect(defaultData.completionPercentage).toBe(0);
    });
  });

  describe('PeriodStats', () => {
    it('should create valid period stats', () => {
      const stats: PeriodStats = {
        totalDays: 30,
        activeDays: 25,
        averageCompletion: 85.5,
        perfectDays: 10,
        currentStreak: 5,
        longestStreak: 12,
        taskBreakdown: {
          workout1: 28,
          workout2: 25,
          diet: 30,
          water: 29,
          reading: 20,
          photo: 22,
        },
      };

      expect(stats.activeDays).toBeLessThanOrEqual(stats.totalDays);
      expect(stats.currentStreak).toBeLessThanOrEqual(stats.longestStreak);
      expect(stats.perfectDays).toBeLessThanOrEqual(stats.activeDays);
    });

    it('should calculate task completion rates', () => {
      const calculateTaskRate = (completed: number, total: number): number => {
        return total > 0 ? (completed / total) * 100 : 0;
      };

      const stats: PeriodStats = {
        totalDays: 30,
        activeDays: 30,
        averageCompletion: 0,
        perfectDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        taskBreakdown: {
          workout1: 25,
          workout2: 20,
          diet: 30,
          water: 28,
          reading: 15,
          photo: 18,
        },
      };

      expect(calculateTaskRate(stats.taskBreakdown.workout1, stats.totalDays)).toBeCloseTo(83.33);
      expect(calculateTaskRate(stats.taskBreakdown.diet, stats.totalDays)).toBe(100);
      expect(calculateTaskRate(stats.taskBreakdown.reading, stats.totalDays)).toBe(50);
    });
  });

  describe('ComparisonStats', () => {
    it('should calculate improvements correctly', () => {
      const comparison: ComparisonStats = {
        current: {
          totalDays: 30,
          activeDays: 28,
          averageCompletion: 90,
          perfectDays: 15,
          currentStreak: 10,
          longestStreak: 10,
          taskBreakdown: {
            workout1: 28,
            workout2: 27,
            diet: 30,
            water: 30,
            reading: 25,
            photo: 26,
          },
        },
        previous: {
          totalDays: 30,
          activeDays: 25,
          averageCompletion: 80,
          perfectDays: 10,
          currentStreak: 5,
          longestStreak: 8,
          taskBreakdown: {
            workout1: 25,
            workout2: 20,
            diet: 28,
            water: 27,
            reading: 20,
            photo: 22,
          },
        },
        improvements: {
          averageCompletion: 10,
          perfectDays: 5,
          currentStreak: 5,
        },
      };

      expect(comparison.improvements.averageCompletion).toBe(
        comparison.current.averageCompletion - comparison.previous.averageCompletion
      );
      expect(comparison.improvements.perfectDays).toBe(
        comparison.current.perfectDays - comparison.previous.perfectDays
      );
    });

    it('should handle negative improvements', () => {
      const calculateImprovement = (current: number, previous: number): number => {
        return current - previous;
      };

      expect(calculateImprovement(70, 80)).toBe(-10);
      expect(calculateImprovement(100, 100)).toBe(0);
      expect(calculateImprovement(90, 75)).toBe(15);
    });
  });

  describe('ChartDataPoint', () => {
    it('should create valid chart data points', () => {
      const point: ChartDataPoint = {
        date: '2024-01-15',
        value: 85.5,
        label: 'Day 15',
        metadata: {
          tasks: 5,
          notes: 'Good progress',
        },
      };

      expect(point.value).toBe(85.5);
      expect(point.metadata?.tasks).toBe(5);
    });

    it('should handle optional fields', () => {
      const minimalPoint: ChartDataPoint = {
        date: '2024-01-01',
        value: 0,
      };

      expect(minimalPoint.label).toBeUndefined();
      expect(minimalPoint.metadata).toBeUndefined();
    });
  });

  describe('TrendData', () => {
    it('should identify trend direction', () => {
      const upTrend: TrendData = {
        points: [
          { date: '2024-01-01', value: 60 },
          { date: '2024-01-02', value: 70 },
          { date: '2024-01-03', value: 80 },
        ],
        trend: 'up',
        trendPercentage: 33.33,
        movingAverage: [60, 65, 70],
      };

      expect(upTrend.trend).toBe('up');
      expect(upTrend.trendPercentage).toBeGreaterThan(0);
    });

    it('should calculate moving average', () => {
      const calculateMovingAverage = (values: number[], windowSize: number): number[] => {
        const result: number[] = [];
        for (let i = 0; i < values.length; i++) {
          const start = Math.max(0, i - windowSize + 1);
          const window = values.slice(start, i + 1);
          const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
          result.push(avg);
        }
        return result;
      };

      const values = [10, 20, 30, 40, 50];
      const movingAvg = calculateMovingAverage(values, 3);
      
      expect(movingAvg[0]).toBe(10); // Only one value
      expect(movingAvg[1]).toBe(15); // (10 + 20) / 2
      expect(movingAvg[2]).toBe(20); // (10 + 20 + 30) / 3
      expect(movingAvg[3]).toBe(30); // (20 + 30 + 40) / 3
      expect(movingAvg[4]).toBe(40); // (30 + 40 + 50) / 3
    });
  });

  describe('AnalyticsInsight', () => {
    it('should create different types of insights', () => {
      const insights: AnalyticsInsight[] = [
        {
          id: '1',
          type: 'achievement',
          priority: 'high',
          title: '10 Day Streak!',
          description: 'You have completed all tasks for 10 days in a row',
          actionable: false,
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          type: 'warning',
          priority: 'medium',
          title: 'Reading Task Declining',
          description: 'Your reading completion has dropped by 30% this week',
          actionable: true,
          actionText: 'Set a reading reminder',
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '3',
          type: 'suggestion',
          priority: 'low',
          title: 'Try Morning Workouts',
          description: 'Users who workout in the morning have 20% higher completion rates',
          actionable: true,
          actionText: 'Update workout schedule',
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '4',
          type: 'milestone',
          priority: 'high',
          title: 'Halfway There!',
          description: 'You have completed 45 days of the 90-day challenge',
          actionable: false,
          createdAt: '2024-01-15T10:00:00Z',
        },
      ];

      const achievementInsights = insights.filter(i => i.type === 'achievement');
      const actionableInsights = insights.filter(i => i.actionable);
      const highPriorityInsights = insights.filter(i => i.priority === 'high');

      expect(achievementInsights).toHaveLength(1);
      expect(actionableInsights).toHaveLength(2);
      expect(highPriorityInsights).toHaveLength(2);
    });

    it('should validate insight properties', () => {
      const isValidInsight = (insight: any): insight is AnalyticsInsight => {
        const validTypes = ['achievement', 'warning', 'suggestion', 'milestone'];
        const validPriorities = ['high', 'medium', 'low'];
        
        return (
          typeof insight.id === 'string' &&
          validTypes.includes(insight.type) &&
          validPriorities.includes(insight.priority) &&
          typeof insight.title === 'string' &&
          typeof insight.description === 'string' &&
          typeof insight.actionable === 'boolean' &&
          (!insight.actionable || typeof insight.actionText === 'string') &&
          typeof insight.createdAt === 'string'
        );
      };

      const validInsight: AnalyticsInsight = {
        id: '1',
        type: 'achievement',
        priority: 'high',
        title: 'Test',
        description: 'Test description',
        actionable: false,
        createdAt: '2024-01-15T10:00:00Z',
      };

      expect(isValidInsight(validInsight)).toBe(true);
      expect(isValidInsight({ ...validInsight, type: 'invalid' })).toBe(false);
      expect(isValidInsight({ ...validInsight, priority: 'urgent' })).toBe(false);
    });
  });

  describe('UserAnalytics', () => {
    it('should create comprehensive user analytics', () => {
      const analytics: UserAnalytics = {
        userId: 'user123',
        timeRange: '30D',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-01-30',
        },
        periodStats: {
          totalDays: 30,
          activeDays: 28,
          averageCompletion: 85,
          perfectDays: 12,
          currentStreak: 7,
          longestStreak: 15,
          taskBreakdown: {
            workout1: 27,
            workout2: 25,
            diet: 28,
            water: 30,
            reading: 22,
            photo: 24,
          },
        },
        completionTrend: {
          points: [],
          trend: 'up',
          trendPercentage: 15,
          movingAverage: [],
        },
        taskTrends: {
          workout1: { points: [], trend: 'stable', trendPercentage: 0, movingAverage: [] },
          workout2: { points: [], trend: 'up', trendPercentage: 10, movingAverage: [] },
        },
        insights: [],
        lastUpdated: '2024-01-30T23:59:59Z',
      };

      expect(analytics.userId).toBe('user123');
      expect(analytics.timeRange).toBe('30D');
      expect(analytics.periodStats.activeDays).toBeLessThanOrEqual(analytics.periodStats.totalDays);
    });
  });

  describe('AnalyticsExportData', () => {
    it('should create export data with metadata', () => {
      const exportData: AnalyticsExportData = {
        userId: 'user123',
        exportType: 'CSV',
        timeRange: '90D',
        data: [
          {
            date: '2024-01-01',
            workout1: true,
            workout2: true,
            diet: true,
            water: true,
            reading: true,
            photo: true,
            completionPercentage: 100,
            totalTasks: 6,
            completedTasks: 6,
          },
        ],
        metadata: {
          exportedAt: '2024-01-30T15:30:00Z',
          totalRecords: 1,
          dateRange: {
            startDate: '2024-01-01',
            endDate: '2024-03-31',
          },
        },
      };

      expect(exportData.exportType).toBe('CSV');
      expect(exportData.metadata.totalRecords).toBe(exportData.data.length);
    });

    it('should validate export types', () => {
      const isValidExportType = (type: string): type is 'CSV' | 'JSON' => {
        return type === 'CSV' || type === 'JSON';
      };

      expect(isValidExportType('CSV')).toBe(true);
      expect(isValidExportType('JSON')).toBe(true);
      expect(isValidExportType('XML')).toBe(false);
      expect(isValidExportType('PDF')).toBe(false);
    });
  });

  describe('CorrelationData', () => {
    it('should calculate correlation strength', () => {
      const correlation: CorrelationData = {
        metric1: 'weight',
        metric2: 'completion',
        correlation: 0.85,
        strength: 'strong',
        significance: 0.001,
        dataPoints: [
          { date: '2024-01-01', value1: 180, value2: 85 },
          { date: '2024-01-02', value1: 179.5, value2: 90 },
          { date: '2024-01-03', value1: 179, value2: 95 },
        ],
      };

      expect(correlation.strength).toBe('strong');
      expect(correlation.correlation).toBeGreaterThan(0.8);
    });

    it('should categorize correlation strength', () => {
      const getCorrelationStrength = (value: number): 'weak' | 'moderate' | 'strong' => {
        const absValue = Math.abs(value);
        if (absValue < 0.3) return 'weak';
        if (absValue < 0.7) return 'moderate';
        return 'strong';
      };

      expect(getCorrelationStrength(0.1)).toBe('weak');
      expect(getCorrelationStrength(0.5)).toBe('moderate');
      expect(getCorrelationStrength(0.9)).toBe('strong');
      expect(getCorrelationStrength(-0.8)).toBe('strong');
    });
  });

  describe('WeightAnalytics', () => {
    it('should track weight progress', () => {
      const weightAnalytics: WeightAnalytics = {
        weightTrend: {
          points: [
            { date: '2024-01-01', value: 180 },
            { date: '2024-01-15', value: 178 },
            { date: '2024-01-30', value: 175 },
          ],
          trend: 'down',
          trendPercentage: -2.78,
          movingAverage: [180, 179, 177.67],
        },
        weightVsCompletion: {
          metric1: 'weight',
          metric2: 'completion',
          correlation: -0.75,
          strength: 'strong',
          significance: 0.01,
          dataPoints: [],
        },
        averageWeightChange: -5,
        weightGoalProgress: 50,
      };

      expect(weightAnalytics.weightTrend.trend).toBe('down');
      expect(weightAnalytics.averageWeightChange).toBeLessThan(0);
      expect(weightAnalytics.weightVsCompletion.correlation).toBeLessThan(0);
    });

    it('should handle missing weight goal', () => {
      const analytics: WeightAnalytics = {
        weightTrend: {
          points: [],
          trend: 'stable',
          trendPercentage: 0,
          movingAverage: [],
        },
        weightVsCompletion: {
          metric1: 'weight',
          metric2: 'completion',
          correlation: 0,
          strength: 'weak',
          significance: 0.5,
          dataPoints: [],
        },
        averageWeightChange: 0,
      };

      expect(analytics.weightGoalProgress).toBeUndefined();
    });
  });

  describe('FastingAnalytics', () => {
    it('should track fasting metrics', () => {
      const fastingAnalytics: FastingAnalytics = {
        fastingTrend: {
          points: [
            { date: '2024-01-01', value: 16 },
            { date: '2024-01-02', value: 18 },
            { date: '2024-01-03', value: 20 },
          ],
          trend: 'up',
          trendPercentage: 25,
          movingAverage: [16, 17, 18],
        },
        fastingVsCompletion: {
          metric1: 'fasting',
          metric2: 'completion',
          correlation: 0.65,
          strength: 'moderate',
          significance: 0.05,
          dataPoints: [],
        },
        averageFastingHours: 18,
        fastingSuccessRate: 90,
      };

      expect(fastingAnalytics.fastingTrend.trend).toBe('up');
      expect(fastingAnalytics.averageFastingHours).toBe(18);
      expect(fastingAnalytics.fastingSuccessRate).toBeGreaterThan(80);
    });
  });

  describe('ComprehensiveAnalytics', () => {
    it('should combine all analytics types', () => {
      const comprehensive: ComprehensiveAnalytics = {
        userId: 'user123',
        timeRange: 'ALL',
        dateRange: {
          startDate: '2024-01-01',
          endDate: '2024-03-31',
        },
        periodStats: {
          totalDays: 90,
          activeDays: 85,
          averageCompletion: 88,
          perfectDays: 45,
          currentStreak: 30,
          longestStreak: 30,
          taskBreakdown: {
            workout1: 85,
            workout2: 80,
            diet: 88,
            water: 90,
            reading: 75,
            photo: 82,
          },
        },
        completionTrend: {
          points: [],
          trend: 'up',
          trendPercentage: 20,
          movingAverage: [],
        },
        taskTrends: {},
        insights: [],
        lastUpdated: '2024-03-31T23:59:59Z',
        weightAnalytics: {
          weightTrend: {
            points: [],
            trend: 'down',
            trendPercentage: -5,
            movingAverage: [],
          },
          weightVsCompletion: {
            metric1: 'weight',
            metric2: 'completion',
            correlation: -0.7,
            strength: 'strong',
            significance: 0.01,
            dataPoints: [],
          },
          averageWeightChange: -10,
          weightGoalProgress: 80,
        },
        fastingAnalytics: {
          fastingTrend: {
            points: [],
            trend: 'stable',
            trendPercentage: 0,
            movingAverage: [],
          },
          fastingVsCompletion: {
            metric1: 'fasting',
            metric2: 'completion',
            correlation: 0.5,
            strength: 'moderate',
            significance: 0.05,
            dataPoints: [],
          },
          averageFastingHours: 16,
          fastingSuccessRate: 85,
        },
        healthCorrelations: [
          {
            metric1: 'sleep',
            metric2: 'completion',
            correlation: 0.8,
            strength: 'strong',
            significance: 0.001,
            dataPoints: [],
          },
        ],
      };

      expect(comprehensive.weightAnalytics).toBeDefined();
      expect(comprehensive.fastingAnalytics).toBeDefined();
      expect(comprehensive.healthCorrelations).toHaveLength(1);
      expect(comprehensive.periodStats.totalDays).toBe(90);
    });

    it('should handle optional analytics fields', () => {
      const minimal: ComprehensiveAnalytics = {
        userId: 'user123',
        timeRange: '7D',
        dateRange: {
          startDate: '2024-01-24',
          endDate: '2024-01-30',
        },
        periodStats: {
          totalDays: 7,
          activeDays: 5,
          averageCompletion: 70,
          perfectDays: 2,
          currentStreak: 3,
          longestStreak: 3,
          taskBreakdown: {
            workout1: 5,
            workout2: 4,
            diet: 5,
            water: 6,
            reading: 3,
            photo: 4,
          },
        },
        completionTrend: {
          points: [],
          trend: 'stable',
          trendPercentage: 0,
          movingAverage: [],
        },
        taskTrends: {},
        insights: [],
        lastUpdated: '2024-01-30T23:59:59Z',
        healthCorrelations: [],
      };

      expect(minimal.weightAnalytics).toBeUndefined();
      expect(minimal.fastingAnalytics).toBeUndefined();
      expect(minimal.healthCorrelations).toHaveLength(0);
    });
  });

  describe('Type Guards and Validators', () => {
    it('should create comprehensive type validator', () => {
      const isValidUserAnalytics = (data: any): data is UserAnalytics => {
        if (!data || typeof data !== 'object') return false;
        
        const validTimeRanges = ['7D', '30D', '90D', 'ALL'];
        const hasRequiredFields = 
          typeof data.userId === 'string' &&
          validTimeRanges.includes(data.timeRange) &&
          data.dateRange &&
          typeof data.dateRange.startDate === 'string' &&
          typeof data.dateRange.endDate === 'string' &&
          data.periodStats &&
          typeof data.periodStats.totalDays === 'number' &&
          typeof data.lastUpdated === 'string';
          
        return hasRequiredFields;
      };

      const validAnalytics: UserAnalytics = {
        userId: 'test',
        timeRange: '30D',
        dateRange: { startDate: '2024-01-01', endDate: '2024-01-30' },
        periodStats: {
          totalDays: 30,
          activeDays: 25,
          averageCompletion: 80,
          perfectDays: 10,
          currentStreak: 5,
          longestStreak: 10,
          taskBreakdown: {
            workout1: 25,
            workout2: 23,
            diet: 27,
            water: 29,
            reading: 20,
            photo: 22,
          },
        },
        completionTrend: {
          points: [],
          trend: 'up',
          trendPercentage: 10,
          movingAverage: [],
        },
        taskTrends: {},
        insights: [],
        lastUpdated: '2024-01-30T23:59:59Z',
      };

      expect(isValidUserAnalytics(validAnalytics)).toBe(true);
      expect(isValidUserAnalytics({ ...validAnalytics, userId: undefined })).toBe(false);
      expect(isValidUserAnalytics({ ...validAnalytics, timeRange: '60D' })).toBe(false);
      expect(isValidUserAnalytics(null)).toBe(false);
    });
  });
});