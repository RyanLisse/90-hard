import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgressChart, CompletionTrendChart, TaskSpecificChart } from './ProgressChart';
import type { TrendData } from '../../domains/analytics/analytics.types';

describe('ProgressChart', () => {
  const mockTrendData: TrendData = {
    points: [
      { date: '2024-01-01', value: 70 },
      { date: '2024-01-02', value: 85 },
      { date: '2024-01-03', value: 90 },
    ],
    trend: 'up',
    average: 81.67,
    trendPercentage: 15.5,
  };

  const defaultProps = {
    data: mockTrendData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render progress chart with default props', () => {
      render(<ProgressChart {...defaultProps} />);

      expect(screen.getByText('90%')).toBeInTheDocument();
      expect(screen.getByText('Current completion rate')).toBeInTheDocument();
      expect(screen.getByText('3 data points')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<ProgressChart {...defaultProps} title="Custom Chart Title" />);

      expect(screen.getByText('Custom Chart Title')).toBeInTheDocument();
    });

    it('should render without title when not provided', () => {
      render(<ProgressChart {...defaultProps} />);

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ProgressChart {...defaultProps} className="custom-chart-class" />
      );

      expect(container.firstChild).toHaveClass('custom-chart-class');
    });

    it('should apply custom height style', () => {
      const { container } = render(
        <ProgressChart {...defaultProps} height={400} />
      );

      const chartContainer = container.firstChild as HTMLElement;
      expect(chartContainer).toHaveStyle('height: 400px');
    });

    it('should use default height when not specified', () => {
      const { container } = render(<ProgressChart {...defaultProps} />);

      const chartContainer = container.firstChild as HTMLElement;
      expect(chartContainer).toHaveStyle('height: 300px');
    });
  });

  describe('Data Display', () => {
    it('should display the latest value from data points', () => {
      render(<ProgressChart {...defaultProps} />);

      expect(screen.getByText('90%')).toBeInTheDocument();
    });

    it('should display correct data points count', () => {
      render(<ProgressChart {...defaultProps} />);

      expect(screen.getByText('3 data points')).toBeInTheDocument();
    });

    it('should handle single data point', () => {
      const singlePointData = {
        ...mockTrendData,
        points: [{ date: '2024-01-01', value: 50 }],
      };

      render(<ProgressChart data={singlePointData} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('1 data points')).toBeInTheDocument();
    });

    it('should handle empty data points', () => {
      const emptyData = {
        ...mockTrendData,
        points: [],
      };

      render(<ProgressChart data={emptyData} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('0 data points')).toBeInTheDocument();
    });
  });

  describe('Trend Display', () => {
    it('should show trend when showTrend is true', () => {
      render(<ProgressChart {...defaultProps} title="Test Chart" showTrend={true} />);

      expect(screen.getByText('↗')).toBeInTheDocument();
      expect(screen.getByText('up 15.5%')).toBeInTheDocument();
    });

    it('should hide trend when showTrend is false', () => {
      render(<ProgressChart {...defaultProps} title="Test Chart" showTrend={false} />);

      expect(screen.queryByText('↗')).not.toBeInTheDocument();
      expect(screen.queryByText('up 15.5%')).not.toBeInTheDocument();
    });

    it('should show up trend indicator', () => {
      const upTrendData = {
        ...mockTrendData,
        trend: 'up' as const,
        trendPercentage: 25.0,
      };

      render(<ProgressChart data={upTrendData} title="Test Chart" />);

      expect(screen.getByText('↗')).toBeInTheDocument();
      expect(screen.getByText('up 25.0%')).toBeInTheDocument();
    });

    it('should show down trend indicator', () => {
      const downTrendData = {
        ...mockTrendData,
        trend: 'down' as const,
        trendPercentage: -10.5,
      };

      render(<ProgressChart data={downTrendData} title="Test Chart" />);

      expect(screen.getByText('↘')).toBeInTheDocument();
      expect(screen.getByText('down 10.5%')).toBeInTheDocument();
    });

    it('should show stable trend indicator', () => {
      const stableTrendData = {
        ...mockTrendData,
        trend: 'stable' as const,
        trendPercentage: 0,
      };

      render(<ProgressChart data={stableTrendData} title="Test Chart" />);

      expect(screen.getByText('→')).toBeInTheDocument();
      expect(screen.getByText('stable 0.0%')).toBeInTheDocument();
    });

    it('should handle negative percentage correctly', () => {
      const negativeTrendData = {
        ...mockTrendData,
        trend: 'down' as const,
        trendPercentage: -15.5,
      };

      render(<ProgressChart data={negativeTrendData} title="Test Chart" />);

      expect(screen.getByText('down 15.5%')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom color', () => {
      render(<ProgressChart {...defaultProps} color="rgb(255, 0, 0)" />);

      const valueElement = screen.getByText('90%');
      expect(valueElement).toHaveStyle('color: rgb(255, 0, 0)');
    });

    it('should use default color when not specified', () => {
      render(<ProgressChart {...defaultProps} />);

      const valueElement = screen.getByText('90%');
      expect(valueElement).toHaveStyle('color: hsl(var(--primary))');
    });
  });

  describe('Placeholder Content', () => {
    it('should display placeholder note about recharts', () => {
      render(<ProgressChart {...defaultProps} />);

      expect(screen.getByText('Note: Install recharts and implement with shadcn/ui Chart component')).toBeInTheDocument();
    });

    it('should display placeholder container styling', () => {
      render(<ProgressChart {...defaultProps} />);

      const placeholderContainer = screen.getByText('Current completion rate').closest('.bg-muted\\/20');
      expect(placeholderContainer).toBeInTheDocument();
    });
  });

  describe('CompletionTrendChart', () => {
    it('should render with specific title', () => {
      render(<CompletionTrendChart data={mockTrendData} />);

      expect(screen.getByText('Completion Trend')).toBeInTheDocument();
    });

    it('should render with trend enabled', () => {
      render(<CompletionTrendChart data={mockTrendData} />);

      expect(screen.getByText('↗')).toBeInTheDocument();
      expect(screen.getByText('up 15.5%')).toBeInTheDocument();
    });

    it('should use chart-1 color variable', () => {
      render(<CompletionTrendChart data={mockTrendData} />);

      const valueElement = screen.getByText('90%');
      expect(valueElement).toHaveStyle('color: var(--chart-1)');
    });
  });

  describe('TaskSpecificChart', () => {
    it('should render with task-specific title', () => {
      render(<TaskSpecificChart data={mockTrendData} taskName="Workout" />);

      expect(screen.getByText('Workout Progress')).toBeInTheDocument();
    });

    it('should use smaller height', () => {
      const { container } = render(
        <TaskSpecificChart data={mockTrendData} taskName="Diet" />
      );

      const chartContainer = container.firstChild as HTMLElement;
      expect(chartContainer).toHaveStyle('height: 200px');
    });

    it('should render with trend enabled', () => {
      render(<TaskSpecificChart data={mockTrendData} taskName="Reading" />);

      expect(screen.getByText('↗')).toBeInTheDocument();
      expect(screen.getByText('up 15.5%')).toBeInTheDocument();
    });

    it('should use chart-2 color variable', () => {
      render(<TaskSpecificChart data={mockTrendData} taskName="Photo" />);

      const valueElement = screen.getByText('90%');
      expect(valueElement).toHaveStyle('color: var(--chart-2)');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined trendPercentage', () => {
      const dataWithoutTrendPercentage = {
        ...mockTrendData,
        trendPercentage: undefined as any,
      };

      render(<ProgressChart data={dataWithoutTrendPercentage} title="Test Chart" />);

      expect(screen.getByText('up NaN%')).toBeInTheDocument();
    });

    it('should handle very large values', () => {
      const largeValueData = {
        ...mockTrendData,
        points: [{ date: '2024-01-01', value: 999.9 }],
      };

      render(<ProgressChart data={largeValueData} />);

      expect(screen.getByText('999.9%')).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      const decimalValueData = {
        ...mockTrendData,
        points: [{ date: '2024-01-01', value: 85.75 }],
      };

      render(<ProgressChart data={decimalValueData} />);

      expect(screen.getByText('85.75%')).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      const zeroValueData = {
        ...mockTrendData,
        points: [{ date: '2024-01-01', value: 0 }],
      };

      render(<ProgressChart data={zeroValueData} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<ProgressChart {...defaultProps} title="Accessibility Test" />);

      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent('Accessibility Test');
    });

    it('should have readable text content', () => {
      render(<ProgressChart {...defaultProps} />);

      expect(screen.getByText('Current completion rate')).toBeInTheDocument();
      expect(screen.getByText('3 data points')).toBeInTheDocument();
    });
  });
});