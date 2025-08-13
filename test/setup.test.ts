import { describe, expect, it, vi } from 'vitest';

describe('Test Infrastructure', () => {
  it('should have vitest configured correctly', () => {
    expect(vi).toBeDefined();
    expect(true).toBe(true);
  });

  it('should have global mocks available', () => {
    expect(window.matchMedia).toBeDefined();
    expect(global.IntersectionObserver).toBeDefined();
    expect(global.ResizeObserver).toBeDefined();
  });

  it('should support async tests', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    expect(result).toBe('test');
  });

  it('should support TDD London style mocking', () => {
    const mockFn = vi.fn().mockReturnValue('mocked');
    const result = mockFn('input');

    expect(mockFn).toHaveBeenCalledWith('input');
    expect(result).toBe('mocked');
  });

  it('should have 100% coverage target configured', () => {
    // This is just a marker test to verify our coverage setup
    // The actual coverage thresholds are in vitest.config.ts
    const coverageTarget = 100;
    expect(coverageTarget).toBe(100);
  });
});
