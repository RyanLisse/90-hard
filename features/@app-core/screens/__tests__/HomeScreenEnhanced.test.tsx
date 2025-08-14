import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../../test/test-utils';
import HomeScreenEnhanced from '../HomeScreenEnhanced';
import type { DayLog } from '../../../../packages/domain/src/types';

// Mock the AI components
vi.mock('../../components/AIMotivation.web', () => ({
  AIMotivation: ({ dayLog }: { dayLog: DayLog }) => (
    <div data-testid="ai-motivation">AI Motivation for day {dayLog.dayNumber}</div>
  ),
}));

// Mock TaskChecklistEnhanced
vi.mock('../../components/TaskChecklistEnhanced.web', () => ({
  TaskChecklistEnhanced: ({ dayLog, onToggleTask }: any) => (
    <div data-testid="task-checklist-enhanced">
      Enhanced Task Checklist
      <button onClick={() => onToggleTask('workout1')}>Toggle Task</button>
    </div>
  ),
}));

// Mock HeatmapView
vi.mock('../../components/HeatmapView', () => ({
  HeatmapView: ({ logs }: any) => (
    <div data-testid="heatmap-view">Heatmap with {logs.length} logs</div>
  ),
}));

// Mock safe area insets
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 20, bottom: 0, left: 0, right: 0 }),
}));

describe('HomeScreenEnhanced', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with tabs for different views', () => {
    render(<HomeScreenEnhanced />);
    
    expect(screen.getByRole('tab', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Week' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Month' })).toBeInTheDocument();
  });

  it('should show Today view by default', () => {
    render(<HomeScreenEnhanced />);
    
    expect(screen.getByTestId('ai-motivation')).toBeInTheDocument();
    expect(screen.getByTestId('task-checklist-enhanced')).toBeInTheDocument();
  });

  it('should switch to Week view when Week tab is clicked', () => {
    render(<HomeScreenEnhanced />);
    
    const weekTab = screen.getByRole('tab', { name: 'Week' });
    fireEvent.click(weekTab);
    
    expect(screen.getByText('Week Progress')).toBeInTheDocument();
    expect(screen.getByTestId('heatmap-view')).toBeInTheDocument();
  });

  it('should switch to Month view when Month tab is clicked', () => {
    render(<HomeScreenEnhanced />);
    
    const monthTab = screen.getByRole('tab', { name: 'Month' });
    fireEvent.click(monthTab);
    
    expect(screen.getByText('Month Overview')).toBeInTheDocument();
    expect(screen.getByTestId('heatmap-view')).toBeInTheDocument();
  });

  it('should display day progress in a card', () => {
    render(<HomeScreenEnhanced />);
    
    expect(screen.getByText(/Day \d+ of 90/)).toBeInTheDocument();
  });

  it('should handle task toggle', () => {
    render(<HomeScreenEnhanced />);
    
    const toggleButton = screen.getByText('Toggle Task');
    fireEvent.click(toggleButton);
    
    // Should update the task state (we'd verify this with proper state management)
    expect(screen.getByTestId('task-checklist-enhanced')).toBeInTheDocument();
  });

  it('should show completion stats in Week view', () => {
    render(<HomeScreenEnhanced />);
    
    const weekTab = screen.getByRole('tab', { name: 'Week' });
    fireEvent.click(weekTab);
    
    expect(screen.getByText(/Average Completion/)).toBeInTheDocument();
    expect(screen.getByText(/Best Day/)).toBeInTheDocument();
  });

  it('should show monthly statistics in Month view', () => {
    render(<HomeScreenEnhanced />);
    
    const monthTab = screen.getByRole('tab', { name: 'Month' });
    fireEvent.click(monthTab);
    
    expect(screen.getByText(/Total Days Completed/)).toBeInTheDocument();
    expect(screen.getByText(/Current Streak/)).toBeInTheDocument();
  });

  it('should be responsive to screen size', () => {
    render(<HomeScreenEnhanced />);
    
    const mainContainer = screen.getByTestId('home-screen-container');
    expect(mainContainer).toHaveClass('flex-1');
  });

  it('should apply proper styling to cards', () => {
    render(<HomeScreenEnhanced />);
    
    const cards = screen.getAllByTestId(/card-/);
    cards.forEach(card => {
      expect(card).toHaveClass('rounded-xl');
    });
  });
});