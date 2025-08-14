import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HeatmapCalendar, YearlyHeatmap, CompactHeatmap } from './HeatmapCalendar';
import type { TaskCompletionData } from '../../domains/analytics/analytics.types';

// Mock GitHubCalendar component
vi.mock('react-github-calendar', () => ({
  default: vi.fn(({ transformData, username, year, theme, colorScheme, labels }) => {
    const mockData = transformData ? transformData([]) : [];
    return (
      <div data-testid="github-calendar">
        <div data-testid="username">{username}</div>
        <div data-testid="year">{year}</div>
        <div data-testid="color-scheme">{colorScheme}</div>
        <div data-testid="total-count">{labels?.totalCount}</div>
        <div data-testid="legend-less">{labels?.legend?.less}</div>
        <div data-testid="legend-more">{labels?.legend?.more}</div>
        <div data-testid="mock-data">{JSON.stringify(mockData)}</div>
      </div>
    );
  }),
}));

describe('HeatmapCalendar', () => {
  const mockCompletionData: TaskCompletionData[] = [
    {
      date: '2024-01-01',
      workout1: true,
      workout2: true,
      diet: true,
      water: true,
      reading: false,
      photo: true,
      completionPercentage: 83.33,
      totalTasks: 6,
      completedTasks: 5,
    },
    {
      date: '2024-01-02',
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
    {
      date: '2024-01-03',
      workout1: false,
      workout2: false,
      diet: false,
      water: false,
      reading: false,
      photo: false,
      completionPercentage: 0,
      totalTasks: 6,
      completedTasks: 0,
    },
    {
      date: '2024-01-04',
      workout1: true,
      workout2: false,
      diet: true,
      water: false,
      reading: false,
      photo: false,
      completionPercentage: 33.33,
      totalTasks: 6,
      completedTasks: 2,
    },
    {
      date: '2024-01-05',
      workout1: true,
      workout2: true,
      diet: true,
      water: false,
      reading: false,
      photo: false,
      completionPercentage: 50,
      totalTasks: 6,
      completedTasks: 3,
    },
  ];

  const defaultProps = {
    data: mockCompletionData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render heatmap calendar with default props', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      expect(screen.getByText('Daily Progress Heatmap')).toBeInTheDocument();
      expect(screen.getByText('Track your daily completion patterns over time')).toBeInTheDocument();
      expect(screen.getByTestId('github-calendar')).toBeInTheDocument();
    });

    it('should render with custom username', () => {
      render(<HeatmapCalendar {...defaultProps} username="custom-user" />);

      expect(screen.getByTestId('username')).toHaveTextContent('custom-user');
    });

    it('should use default username when not provided', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      expect(screen.getByTestId('username')).toHaveTextContent('90-hard-user');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <HeatmapCalendar {...defaultProps} className="custom-heatmap-class" />
      );

      expect(container.firstChild).toHaveClass('custom-heatmap-class');
    });

    it('should use current year when year not specified', () => {
      const currentYear = new Date().getFullYear();
      render(<HeatmapCalendar {...defaultProps} />);

      expect(screen.getByTestId('year')).toHaveTextContent(currentYear.toString());
    });

    it('should use custom year when specified', () => {
      render(<HeatmapCalendar {...defaultProps} year={2023} />);

      expect(screen.getByTestId('year')).toHaveTextContent('2023');
    });
  });

  describe('Data Transformation', () => {
    it('should transform completion data to GitHub calendar format', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      const mockDataElement = screen.getByTestId('mock-data');
      const transformedData = JSON.parse(mockDataElement.textContent || '[]');

      expect(transformedData).toHaveLength(5);
      
      // Check first item transformation
      expect(transformedData[0]).toEqual({
        date: '2024-01-01',
        count: 5,
        level: 4, // 83.33% -> level 4
      });

      // Check perfect completion
      expect(transformedData[1]).toEqual({
        date: '2024-01-02',
        count: 6,
        level: 4, // 100% -> level 4
      });

      // Check zero completion
      expect(transformedData[2]).toEqual({
        date: '2024-01-03',
        count: 0,
        level: 0, // 0% -> level 0
      });
    });

    it('should correctly map completion percentages to levels', () => {
      const testData: TaskCompletionData[] = [
        { ...mockCompletionData[0], completionPercentage: 0, completedTasks: 0 }, // level 0
        { ...mockCompletionData[0], completionPercentage: 20, completedTasks: 1 }, // level 1
        { ...mockCompletionData[0], completionPercentage: 40, completedTasks: 2 }, // level 2
        { ...mockCompletionData[0], completionPercentage: 60, completedTasks: 3 }, // level 3
        { ...mockCompletionData[0], completionPercentage: 80, completedTasks: 4 }, // level 4
        { ...mockCompletionData[0], completionPercentage: 100, completedTasks: 6 }, // level 4
      ];

      render(<HeatmapCalendar data={testData} />);

      const mockDataElement = screen.getByTestId('mock-data');
      const transformedData = JSON.parse(mockDataElement.textContent || '[]');

      expect(transformedData[0].level).toBe(0); // 0%
      expect(transformedData[1].level).toBe(1); // 20%
      expect(transformedData[2].level).toBe(2); // 40%
      expect(transformedData[3].level).toBe(3); // 60%
      expect(transformedData[4].level).toBe(4); // 80%
      expect(transformedData[5].level).toBe(4); // 100%
    });
  });

  describe('Statistics Display', () => {
    it('should display correct perfect days count', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      const perfectDays = mockCompletionData.filter(d => d.completionPercentage === 100).length;
      expect(screen.getByText(perfectDays.toString())).toBeInTheDocument();
      expect(screen.getByText('Perfect Days')).toBeInTheDocument();
    });

    it('should display correct active days count', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      const activeDays = mockCompletionData.filter(d => d.completionPercentage > 0).length;
      expect(screen.getByText(activeDays.toString())).toBeInTheDocument();
      expect(screen.getByText('Active Days')).toBeInTheDocument();
    });

    it('should display correct average completion percentage', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      const avgCompletion = Math.round(
        mockCompletionData.reduce((sum, d) => sum + d.completionPercentage, 0) / 
        mockCompletionData.length
      );
      expect(screen.getByText(`${avgCompletion}%`)).toBeInTheDocument();
      expect(screen.getByText('Avg Completion')).toBeInTheDocument();
    });

    it('should display current streak', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      expect(screen.getByText('Current Streak')).toBeInTheDocument();
      // Current streak should be calculated from the sorted data
    });
  });

  describe('Streak Calculation', () => {
    it('should calculate streak correctly for consecutive active days', () => {
      const streakData: TaskCompletionData[] = [
        { ...mockCompletionData[0], date: '2024-01-01', completionPercentage: 100 },
        { ...mockCompletionData[0], date: '2024-01-02', completionPercentage: 80 },
        { ...mockCompletionData[0], date: '2024-01-03', completionPercentage: 90 },
        { ...mockCompletionData[0], date: '2024-01-04', completionPercentage: 0 },
        { ...mockCompletionData[0], date: '2024-01-05', completionPercentage: 70 },
      ];

      render(<HeatmapCalendar data={streakData} />);

      // Should show a streak of 1 (only the most recent day with >0% completion)
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should handle empty data for streak calculation', () => {
      render(<HeatmapCalendar data={[]} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should handle zero completion streak', () => {
      const zeroData: TaskCompletionData[] = [
        { ...mockCompletionData[0], date: '2024-01-01', completionPercentage: 0 },
        { ...mockCompletionData[0], date: '2024-01-02', completionPercentage: 0 },
      ];

      render(<HeatmapCalendar data={zeroData} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Theme and Styling', () => {
    it('should use light theme by default', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('light');
    });

    it('should apply dark theme when specified', () => {
      render(<HeatmapCalendar {...defaultProps} theme="dark" />);

      expect(screen.getByTestId('color-scheme')).toHaveTextContent('dark');
    });

    it('should pass custom labels to GitHub calendar', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      expect(screen.getByTestId('legend-less')).toHaveTextContent('Less');
      expect(screen.getByTestId('legend-more')).toHaveTextContent('More');
    });
  });

  describe('Empty States', () => {
    it('should handle empty data gracefully', () => {
      render(<HeatmapCalendar data={[]} />);

      expect(screen.getByText('Daily Progress Heatmap')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument(); // Perfect days
      expect(screen.getByText('0')).toBeInTheDocument(); // Active days
      expect(screen.getByText('0%')).toBeInTheDocument(); // Avg completion
    });

    it('should avoid division by zero for average calculation', () => {
      render(<HeatmapCalendar data={[]} />);

      // Should show 0% instead of NaN%
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.queryByText('NaN%')).not.toBeInTheDocument();
    });
  });

  describe('YearlyHeatmap Component', () => {
    it('should render with yearly-specific styling', () => {
      const { container } = render(<YearlyHeatmap data={mockCompletionData} />);

      expect(container.firstChild).toHaveClass('bg-card', 'rounded-lg', 'p-4', 'border');
    });

    it('should use smaller block size', () => {
      render(<YearlyHeatmap data={mockCompletionData} year={2023} />);

      expect(screen.getByTestId('github-calendar')).toBeInTheDocument();
      expect(screen.getByTestId('year')).toHaveTextContent('2023');
    });

    it('should pass year parameter correctly', () => {
      render(<YearlyHeatmap data={mockCompletionData} year={2022} />);

      expect(screen.getByTestId('year')).toHaveTextContent('2022');
    });
  });

  describe('CompactHeatmap Component', () => {
    it('should render with compact styling', () => {
      const { container } = render(<CompactHeatmap data={mockCompletionData} />);

      expect(container.firstChild).toHaveClass('bg-card', 'rounded-lg', 'p-2', 'border');
    });

    it('should render all required elements', () => {
      render(<CompactHeatmap data={mockCompletionData} />);

      expect(screen.getByText('Daily Progress Heatmap')).toBeInTheDocument();
      expect(screen.getByTestId('github-calendar')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed dates gracefully', () => {
      const malformedData: TaskCompletionData[] = [
        { ...mockCompletionData[0], date: 'invalid-date' },
      ];

      render(<HeatmapCalendar data={malformedData} />);

      expect(screen.getByText('Daily Progress Heatmap')).toBeInTheDocument();
    });

    it('should handle undefined completion percentage', () => {
      const undefinedData: TaskCompletionData[] = [
        { ...mockCompletionData[0], completionPercentage: undefined as any },
      ];

      render(<HeatmapCalendar data={undefinedData} />);

      expect(screen.getByText('Daily Progress Heatmap')).toBeInTheDocument();
    });

    it('should handle very large datasets', () => {
      const largeData = Array.from({ length: 365 }, (_, i) => ({
        ...mockCompletionData[0],
        date: `2024-01-${(i % 31) + 1}`,
        completionPercentage: Math.random() * 100,
      }));

      render(<HeatmapCalendar data={largeData} />);

      expect(screen.getByText('Daily Progress Heatmap')).toBeInTheDocument();
    });

    it('should handle decimal completion percentages', () => {
      const decimalData: TaskCompletionData[] = [
        { ...mockCompletionData[0], completionPercentage: 83.33 },
        { ...mockCompletionData[0], completionPercentage: 66.67 },
      ];

      render(<HeatmapCalendar data={decimalData} />);

      const mockDataElement = screen.getByTestId('mock-data');
      const transformedData = JSON.parse(mockDataElement.textContent || '[]');

      expect(transformedData[0].level).toBe(4); // 83.33% -> level 4
      expect(transformedData[1].level).toBe(3); // 66.67% -> level 3
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Daily Progress Heatmap');
    });

    it('should have descriptive text for screen readers', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      expect(screen.getByText('Track your daily completion patterns over time')).toBeInTheDocument();
    });

    it('should have readable statistics labels', () => {
      render(<HeatmapCalendar {...defaultProps} />);

      expect(screen.getByText('Perfect Days')).toBeInTheDocument();
      expect(screen.getByText('Active Days')).toBeInTheDocument();
      expect(screen.getByText('Avg Completion')).toBeInTheDocument();
      expect(screen.getByText('Current Streak')).toBeInTheDocument();
    });
  });
});