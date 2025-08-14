import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../../../test/test-utils';
import { AIMotivation } from '../AIMotivation.web';
import type { DayLog } from '../../../../packages/domain/src/types';

// Mock the AI SDK
vi.mock('ai/react', () => ({
  useCompletion: vi.fn(() => ({
    completion: '',
    isLoading: false,
    complete: vi.fn(),
  })),
}));

describe('AIMotivation', () => {
  const mockDayLog: DayLog = {
    id: 'test-log',
    userId: 'user-123',
    date: '2025-01-13',
    dayNumber: 15,
    tasks: {
      workout1: true,
      workout2: true,
      diet: true,
      water: false,
      reading: false,
      photo: false,
    },
    photos: [],
    journalEntries: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render motivation card', () => {
    render(<AIMotivation dayLog={mockDayLog} />);
    
    expect(screen.getByText('Daily Motivation')).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    const { useCompletion } = vi.mocked(await import('ai/react'));
    useCompletion.mockReturnValue({
      completion: '',
      isLoading: true,
      complete: vi.fn(),
      error: undefined,
      stop: vi.fn(),
      setCompletion: vi.fn(),
    });

    render(<AIMotivation dayLog={mockDayLog} />);
    
    expect(screen.getByText('Generating motivation...')).toBeInTheDocument();
  });

  it('should display AI-generated motivation message', async () => {
    const motivationMessage = "Great job on completing 50% of your tasks! Keep pushing forward!";
    const { useCompletion } = vi.mocked(await import('ai/react'));
    useCompletion.mockReturnValue({
      completion: motivationMessage,
      isLoading: false,
      complete: vi.fn(),
      error: undefined,
      stop: vi.fn(),
      setCompletion: vi.fn(),
    });

    render(<AIMotivation dayLog={mockDayLog} />);
    
    await waitFor(() => {
      expect(screen.getByText(motivationMessage)).toBeInTheDocument();
    });
  });

  it('should request motivation based on day progress', () => {
    const mockComplete = vi.fn();
    const { useCompletion } = vi.mocked(await import('ai/react'));
    useCompletion.mockReturnValue({
      completion: '',
      isLoading: false,
      complete: mockComplete,
      error: undefined,
      stop: vi.fn(),
      setCompletion: vi.fn(),
    });

    render(<AIMotivation dayLog={mockDayLog} />);
    
    expect(mockComplete).toHaveBeenCalledWith(
      expect.stringContaining('Day 15 of 90')
    );
    expect(mockComplete).toHaveBeenCalledWith(
      expect.stringContaining('50% complete')
    );
  });

  it('should handle different completion percentages', () => {
    const mockComplete = vi.fn();
    const { useCompletion } = vi.mocked(await import('ai/react'));
    useCompletion.mockReturnValue({
      completion: '',
      isLoading: false,
      complete: mockComplete,
      error: undefined,
      stop: vi.fn(),
      setCompletion: vi.fn(),
    });

    const fullyCompletedLog: DayLog = {
      ...mockDayLog,
      tasks: {
        workout1: true,
        workout2: true,
        diet: true,
        water: true,
        reading: true,
        photo: true,
      },
    };

    render(<AIMotivation dayLog={fullyCompletedLog} />);
    
    expect(mockComplete).toHaveBeenCalledWith(
      expect.stringContaining('100% complete')
    );
  });

  it('should show celebration icon for high completion', async () => {
    const { useCompletion } = vi.mocked(await import('ai/react'));
    useCompletion.mockReturnValue({
      completion: 'Amazing work!',
      isLoading: false,
      complete: vi.fn(),
      error: undefined,
      stop: vi.fn(),
      setCompletion: vi.fn(),
    });

    const highCompletionLog: DayLog = {
      ...mockDayLog,
      tasks: {
        workout1: true,
        workout2: true,
        diet: true,
        water: true,
        reading: true,
        photo: false,
      },
    };

    render(<AIMotivation dayLog={highCompletionLog} />);
    
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('should show encouragement icon for low completion', async () => {
    const { useCompletion } = vi.mocked(await import('ai/react'));
    useCompletion.mockReturnValue({
      completion: 'Keep going!',
      isLoading: false,
      complete: vi.fn(),
      error: undefined,
      stop: vi.fn(),
      setCompletion: vi.fn(),
    });

    const lowCompletionLog: DayLog = {
      ...mockDayLog,
      tasks: {
        workout1: true,
        workout2: false,
        diet: false,
        water: false,
        reading: false,
        photo: false,
      },
    };

    render(<AIMotivation dayLog={lowCompletionLog} />);
    
    expect(screen.getByText('💪')).toBeInTheDocument();
  });

  it('should handle error state gracefully', () => {
    const { useCompletion } = vi.mocked(await import('ai/react'));
    useCompletion.mockReturnValue({
      completion: '',
      isLoading: false,
      complete: vi.fn(),
      error: new Error('API error'),
      stop: vi.fn(),
      setCompletion: vi.fn(),
    });

    render(<AIMotivation dayLog={mockDayLog} />);
    
    expect(screen.getByText(/Stay focused and keep pushing forward!/)).toBeInTheDocument();
  });
});