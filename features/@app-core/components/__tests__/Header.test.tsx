import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '../Header';

// Mock the timer
vi.useFakeTimers();

describe('Header', () => {
  const mockDate = new Date('2024-03-27T14:32:15Z');

  beforeEach(() => {
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should render current date in the correct format', () => {
    render(<Header completionPct={0} day={1} total={75} />);

    expect(screen.getByText('Wednesday, March 27')).toBeTruthy();
  });

  it('should render current time in SF Mono font', () => {
    render(<Header completionPct={0} day={1} total={75} />);

    const timeElement = screen.getByText('14:32:15');
    expect(timeElement.props.style).toMatchObject({
      fontFamily: expect.stringContaining('mono'),
      color: expect.stringContaining('orange'),
    });
  });

  it('should render day streak', () => {
    render(<Header completionPct={40} day={15} total={75} />);

    expect(screen.getByText('Day 15/75')).toBeTruthy();
  });

  it('should render battery progress bar', () => {
    render(<Header completionPct={60} day={10} total={75} />);

    const progressBar = screen.getByTestId('battery-progress');
    expect(progressBar.props.style.width).toBe('60%');
  });

  it('should update time every second', () => {
    render(<Header completionPct={0} day={1} total={75} />);

    // Initial time
    expect(screen.getByText('14:32:15')).toBeTruthy();

    // Advance by 1 second
    vi.advanceTimersByTime(1000);
    vi.setSystemTime(new Date('2024-03-27T14:32:16Z'));

    expect(screen.getByText('14:32:16')).toBeTruthy();
  });

  it('should handle battery color based on completion percentage', () => {
    const { rerender } = render(
      <Header completionPct={20} day={1} total={75} />
    );

    let progressBar = screen.getByTestId('battery-progress');
    expect(progressBar.props.style.backgroundColor).toContain('red'); // Low battery

    rerender(<Header completionPct={50} day={1} total={75} />);
    progressBar = screen.getByTestId('battery-progress');
    expect(progressBar.props.style.backgroundColor).toContain('yellow'); // Medium battery

    rerender(<Header completionPct={80} day={1} total={75} />);
    progressBar = screen.getByTestId('battery-progress');
    expect(progressBar.props.style.backgroundColor).toContain('green'); // High battery
  });

  it('should clean up timer on unmount', () => {
    const { unmount } = render(<Header completionPct={0} day={1} total={75} />);

    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
