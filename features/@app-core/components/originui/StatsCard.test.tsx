import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsCard } from './StatsCard';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Daily Tasks',
    value: '5/6',
    subtitle: 'Completed today',
  };

  it('should render with required props', () => {
    render(<StatsCard {...defaultProps} />);
    
    expect(screen.getByText('Daily Tasks')).toBeTruthy();
    expect(screen.getByText('5/6')).toBeTruthy();
    expect(screen.getByText('Completed today')).toBeTruthy();
  });

  it('should render with trend indicator when provided', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend="up"
        trendValue="+12%"
      />
    );
    
    expect(screen.getByText('+12%')).toBeTruthy();
    expect(screen.getByTestId('trend-icon-up')).toBeTruthy();
  });

  it('should render down trend with correct styling', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend="down"
        trendValue="-5%"
      />
    );
    
    expect(screen.getByText('-5%')).toBeTruthy();
    expect(screen.getByTestId('trend-icon-down')).toBeTruthy();
  });

  it('should render with custom icon', () => {
    const CustomIcon = () => <TrendingUp testID="custom-icon" />;
    
    render(
      <StatsCard
        {...defaultProps}
        icon={<CustomIcon />}
      />
    );
    
    expect(screen.getByTestId('custom-icon')).toBeTruthy();
  });

  it('should apply custom className', () => {
    render(
      <StatsCard
        {...defaultProps}
        className="custom-class"
      />
    );
    
    const card = screen.getByTestId('stats-card');
    expect(card.props.className).toContain('custom-class');
  });

  it('should render with accent color', () => {
    render(
      <StatsCard
        {...defaultProps}
        accentColor="blue"
      />
    );
    
    const accentBar = screen.getByTestId('accent-bar');
    expect(accentBar.props.className).toContain('bg-blue-500');
  });

  it('should handle loading state', () => {
    render(
      <StatsCard
        {...defaultProps}
        loading={true}
      />
    );
    
    expect(screen.getByTestId('stats-card-skeleton')).toBeTruthy();
    expect(screen.queryByText('Daily Tasks')).toBeFalsy();
  });

  it('should render with percentage value', () => {
    render(
      <StatsCard
        title="Completion Rate"
        value={83}
        subtitle="This week"
        isPercentage={true}
      />
    );
    
    expect(screen.getByText('83%')).toBeTruthy();
  });

  it('should render with custom value formatter', () => {
    const formatter = (value: number | string) => `$${value}`;
    
    render(
      <StatsCard
        {...defaultProps}
        value={1234}
        valueFormatter={formatter}
      />
    );
    
    expect(screen.getByText('$1234')).toBeTruthy();
  });
});