import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies - must be defined before mocks
const mockOnTimeRangeChange = vi.fn();
const mockOnExportData = vi.fn();

// Mock chart components
vi.mock('../charts/ProgressChart', () => {
  const React = require('react');
  return {
    ProgressChart: () => React.createElement('div', { 'data-testid': 'progress-chart' }, 'ProgressChart'),
    CompletionTrendChart: () => React.createElement('div', { 'data-testid': 'completion-trend-chart' }, 'CompletionTrendChart'),
    TaskSpecificChart: ({ taskName }) => React.createElement('div', { 'data-testid': `task-chart-${taskName.toLowerCase()}` }, `TaskSpecificChart: ${taskName}`),
  };
});

vi.mock('../charts/HeatmapCalendar', () => {
  const React = require('react');
  return {
    HeatmapCalendar: () => React.createElement('div', { 'data-testid': 'heatmap-calendar' }, 'HeatmapCalendar'),
    YearlyHeatmap: () => React.createElement('div', { 'data-testid': 'yearly-heatmap' }, 'YearlyHeatmap'),
  };
});

// Import component and types after mocks
import { AnalyticsDashboard } from './AnalyticsDashboard';
import type { 
  UserAnalytics, 
  TimeRange, 
  AnalyticsInsight,
  ComparisonStats 
} from '../../domains/analytics/analytics.types';
import type { GamificationStats } from '../../domains/gamification/gamification.types';

describe('AnalyticsDashboard', () => {
  const mockAnalytics: UserAnalytics = {
    userId: 'user-123',
    timeRange: '30D' as TimeRange,
    dateRange: {
      startDate: '2024-01-01',
      endDate: '2024-01-30',
    },
    periodStats: {
      totalDays: 30,
      activeDays: 25,
      currentStreak: 15,
      longestStreak: 20,
      averageCompletion: 85.5,
      perfectDays: 12,
      taskBreakdown: {
        workout1: 28,
        workout2: 26,
        diet: 30,
        water: 29,
        reading: 24,
        photo: 23,
      },
    },
    completionTrend: {
      points: [
        { date: '2024-01-01', value: 80 },
        { date: '2024-01-02', value: 90 },
        { date: '2024-01-03', value: 100 },
      ],
      trend: 'up',
      trendPercentage: 15.5,
      movingAverage: [80, 85, 90],
    },
    taskTrends: {
      workout1: { points: [], trend: 'up', trendPercentage: 12.5, movingAverage: [80, 85] },
      workout2: { points: [], trend: 'stable', trendPercentage: 0, movingAverage: [80, 80] },
      diet: { points: [], trend: 'up', trendPercentage: 15.0, movingAverage: [90, 95] },
      water: { points: [], trend: 'down', trendPercentage: -5.5, movingAverage: [90, 85] },
      reading: { points: [], trend: 'stable', trendPercentage: 0, movingAverage: [75, 75] },
      photo: { points: [], trend: 'up', trendPercentage: 8.5, movingAverage: [65, 70] },
    },
    insights: [
      {
        id: 'insight-1',
        type: 'achievement',
        priority: 'high',
        title: 'Great Progress!',
        description: 'You completed 25 out of 30 days this month.',
        actionable: true,
        actionText: 'View Details',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'insight-2',
        type: 'suggestion',
        priority: 'medium',
        title: 'Focus on Reading',
        description: 'Your reading completion rate could be improved.',
        actionable: false,
        createdAt: '2024-01-02T00:00:00.000Z',
      },
    ],
    lastUpdated: '2024-01-30T12:00:00.000Z',
  };

  const mockGamificationStats: GamificationStats = {
    userId: 'user-123',
    currentLevel: 15,
    totalXP: 2450,
    rank: 'A',
    achievementsUnlocked: 12,
    totalAchievements: 20,
    badgesEarned: 8,
    currentStreak: 15,
    longestStreak: 20,
    perfectDays: 12,
    weeklyXP: 350,
    monthlyXP: 1200,
    leaderboardPosition: 5,
    lastActivityDate: '2024-01-30T12:00:00.000Z',
  };

  const mockComparison: ComparisonStats = {
    current: {
      totalDays: 30,
      activeDays: 25,
      averageCompletion: 85.5,
      perfectDays: 12,
      currentStreak: 15,
      longestStreak: 20,
      taskBreakdown: {
        workout1: 28,
        workout2: 26,
        diet: 30,
        water: 29,
        reading: 24,
        photo: 23,
      },
    },
    previous: {
      totalDays: 30,
      activeDays: 20,
      averageCompletion: 73.0,
      perfectDays: 9,
      currentStreak: 10,
      longestStreak: 15,
      taskBreakdown: {
        workout1: 25,
        workout2: 22,
        diet: 28,
        water: 26,
        reading: 20,
        photo: 18,
      },
    },
    improvements: {
      currentStreak: 5,
      averageCompletion: 12.5,
      perfectDays: 3,
    },
  };

  const defaultProps = {
    userId: 'user-123',
    analytics: mockAnalytics,
    gamificationStats: mockGamificationStats,
    onTimeRangeChange: mockOnTimeRangeChange,
    onExportData: mockOnExportData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the dashboard header', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Track your progress and insights for the 90-hard challenge')).toBeInTheDocument();
    });

    it('should render all tab navigation buttons', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Task Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Gamification')).toBeInTheDocument();
      expect(screen.getByText('Insights')).toBeInTheDocument();
    });

    it('should render time range selector', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('7 Days')).toBeInTheDocument();
      expect(screen.getByText('30 Days')).toBeInTheDocument();
      expect(screen.getByText('90 Days')).toBeInTheDocument();
      expect(screen.getByText('All Time')).toBeInTheDocument();
    });

    it('should render export dropdown', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <AnalyticsDashboard {...defaultProps} className="custom-class" />
      );

      const dashboard = container.firstChild as HTMLElement;
      expect(dashboard).toHaveClass('w-full', 'space-y-6', 'custom-class');
    });
  });

  describe('Tab Navigation', () => {
    it('should start with overview tab active', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const overviewTab = screen.getByText('Overview');
      expect(overviewTab).toHaveClass('border-primary', 'text-primary');
    });

    it('should switch to tasks tab when clicked', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const tasksTab = screen.getByText('Task Breakdown');
      fireEvent.click(tasksTab);

      expect(tasksTab).toHaveClass('border-primary', 'text-primary');
      expect(screen.getByText('Task Completion Breakdown')).toBeInTheDocument();
    });

    it('should switch to gamification tab when clicked', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const gamificationTab = screen.getByText('Gamification');
      fireEvent.click(gamificationTab);

      expect(gamificationTab).toHaveClass('border-primary', 'text-primary');
      expect(screen.getByText('Level Progress')).toBeInTheDocument();
    });

    it('should switch to insights tab when clicked', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const insightsTab = screen.getByText('Insights');
      fireEvent.click(insightsTab);

      expect(insightsTab).toHaveClass('border-primary', 'text-primary');
      expect(screen.getByText('Great Progress!')).toBeInTheDocument();
    });
  });

  describe('Time Range Selector', () => {
    it('should highlight selected time range', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const thirtyDaysButton = screen.getByText('30 Days');
      expect(thirtyDaysButton).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('should call onTimeRangeChange when time range is selected', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const sevenDaysButton = screen.getByText('7 Days');
      fireEvent.click(sevenDaysButton);

      expect(mockOnTimeRangeChange).toHaveBeenCalledWith('7D');
    });

    it('should update internal state when time range changes', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const allTimeButton = screen.getByText('All Time');
      fireEvent.click(allTimeButton);

      expect(allTimeButton).toHaveClass('bg-primary', 'text-primary-foreground');
    });
  });

  describe('Export Functionality', () => {
    it('should call onExportData when CSV is selected', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const exportSelect = screen.getByDisplayValue('Export');
      fireEvent.change(exportSelect, { target: { value: 'CSV' } });

      expect(mockOnExportData).toHaveBeenCalledWith('CSV');
    });

    it('should call onExportData when JSON is selected', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const exportSelect = screen.getByDisplayValue('Export');
      fireEvent.change(exportSelect, { target: { value: 'JSON' } });

      expect(mockOnExportData).toHaveBeenCalledWith('JSON');
    });

    it('should reset select value after export', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const exportSelect = screen.getByDisplayValue('Export') as HTMLSelectElement;
      fireEvent.change(exportSelect, { target: { value: 'CSV' } });

      expect(exportSelect.value).toBe('');
    });
  });

  describe('Overview Tab Content', () => {
    it('should display key metrics cards', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      expect(screen.getByText('Current Streak')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('Average Completion')).toBeInTheDocument();
      expect(screen.getByText('85.5')).toBeInTheDocument();
      expect(screen.getByText('Perfect Days')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Current Level')).toBeInTheDocument();
      expect(screen.getByText('(A Rank)')).toBeInTheDocument();
    });

    it('should display comparison trends when provided', () => {
      render(<AnalyticsDashboard {...defaultProps} comparison={mockComparison} />);

      expect(screen.getByText('+5 vs previous period')).toBeInTheDocument();
      expect(screen.getByText('+12.5 vs previous period')).toBeInTheDocument();
      expect(screen.getByText('+3 vs previous period')).toBeInTheDocument();
    });

    it('should render charts', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      expect(screen.getByTestId('completion-trend-chart')).toBeInTheDocument();
      expect(screen.getByTestId('yearly-heatmap')).toBeInTheDocument();
    });
  });

  describe('Tasks Tab Content', () => {
    beforeEach(() => {
      render(<AnalyticsDashboard {...defaultProps} />);
      fireEvent.click(screen.getByText('Task Breakdown'));
    });

    it('should display task-specific charts', () => {
      expect(screen.getByTestId('task-chart-workout1')).toBeInTheDocument();
      expect(screen.getByTestId('task-chart-workout2')).toBeInTheDocument();
      expect(screen.getByTestId('task-chart-diet')).toBeInTheDocument();
      expect(screen.getByTestId('task-chart-water')).toBeInTheDocument();
      expect(screen.getByTestId('task-chart-reading')).toBeInTheDocument();
      expect(screen.getByTestId('task-chart-photo')).toBeInTheDocument();
    });

    it('should display task breakdown table', () => {
      expect(screen.getByText('Task Completion Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Workout1')).toBeInTheDocument();
      expect(screen.getByText('28')).toBeInTheDocument();
      expect(screen.getByText('93%')).toBeInTheDocument();
    });

    it('should show trend indicators', () => {
      expect(screen.getByText('up')).toBeInTheDocument();
      expect(screen.getByText('stable')).toBeInTheDocument();
      expect(screen.getByText('down')).toBeInTheDocument();
    });
  });

  describe('Gamification Tab Content', () => {
    beforeEach(() => {
      render(<AnalyticsDashboard {...defaultProps} />);
      fireEvent.click(screen.getByText('Gamification'));
    });

    it('should display gamification stats', () => {
      expect(screen.getByText('Total XP')).toBeInTheDocument();
      expect(screen.getByText('2450')).toBeInTheDocument();
      expect(screen.getByText('Achievements')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Badges Earned')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('should display level progress', () => {
      expect(screen.getByText('Level 15')).toBeInTheDocument();
      expect(screen.getByText('Rank A')).toBeInTheDocument();
      expect(screen.getByText('Current XP: 2450')).toBeInTheDocument();
    });
  });

  describe('Insights Tab Content', () => {
    beforeEach(() => {
      render(<AnalyticsDashboard {...defaultProps} />);
      fireEvent.click(screen.getByText('Insights'));
    });

    it('should display insights when available', () => {
      expect(screen.getByText('Great Progress!')).toBeInTheDocument();
      expect(screen.getByText('You completed 25 out of 30 days this month.')).toBeInTheDocument();
      expect(screen.getByText('Focus on Reading')).toBeInTheDocument();
      expect(screen.getByText('Your reading completion rate could be improved.')).toBeInTheDocument();
    });

    it('should display insight priorities', () => {
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('should show actionable insights with buttons', () => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    it('should display appropriate icons for insight types', () => {
      expect(screen.getByText('🏆')).toBeInTheDocument(); // achievement
      expect(screen.getByText('💡')).toBeInTheDocument(); // suggestion
    });
  });

  describe('Empty States', () => {
    it('should show empty insights message when no insights available', () => {
      const analyticsWithoutInsights = {
        ...mockAnalytics,
        insights: [],
      };

      render(
        <AnalyticsDashboard 
          {...defaultProps} 
          analytics={analyticsWithoutInsights} 
        />
      );

      fireEvent.click(screen.getByText('Insights'));

      expect(screen.getByText('No insights available yet.')).toBeInTheDocument();
      expect(screen.getByText('Keep tracking your progress to get personalized insights!')).toBeInTheDocument();
    });
  });

  describe('MetricCard Component', () => {
    it('should display metric with unit', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const streakValue = screen.getByText('15');
      const daysUnit = screen.getByText('days');
      
      expect(streakValue).toBeInTheDocument();
      expect(daysUnit).toBeInTheDocument();
    });

    it('should apply color classes', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const streakValue = screen.getByText('15');
      expect(streakValue.parentElement).toHaveClass('text-green-600');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing comparison data', () => {
      render(<AnalyticsDashboard {...defaultProps} comparison={undefined} />);

      // Should not show trend information
      expect(screen.queryByText('vs previous period')).not.toBeInTheDocument();
    });

    it('should handle zero values in metrics', () => {
      const analyticsWithZeros = {
        ...mockAnalytics,
        periodStats: {
          ...mockAnalytics.periodStats,
          currentStreak: 0,
          perfectDays: 0,
        },
      };

      render(
        <AnalyticsDashboard 
          {...defaultProps} 
          analytics={analyticsWithZeros} 
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle missing task trends', () => {
      const analyticsWithMissingTrends = {
        ...mockAnalytics,
        taskTrends: {
          ...mockAnalytics.taskTrends,
          workout1: undefined as any,
        },
      };

      render(
        <AnalyticsDashboard 
          {...defaultProps} 
          analytics={analyticsWithMissingTrends} 
        />
      );

      fireEvent.click(screen.getByText('Task Breakdown'));

      // Should still render the task row with fallback values
      expect(screen.getByText('Workout1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for tabs', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const overviewTab = screen.getByText('Overview');
      expect(overviewTab.tagName).toBe('BUTTON');
    });

    it('should support keyboard navigation on tabs', () => {
      render(<AnalyticsDashboard {...defaultProps} />);

      const tasksTab = screen.getByText('Task Breakdown');
      tasksTab.focus();
      fireEvent.keyDown(tasksTab, { key: 'Enter' });

      expect(tasksTab).toHaveClass('border-primary', 'text-primary');
    });
  });
});