import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  type RenderOptions,
  type RenderResult,
  render,
} from '@testing-library/react';
import type React from 'react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';

// Create a custom render function that includes providers
interface AllTheProvidersProps {
  children: React.ReactNode;
}

// TDD London style test utilities
export const createMockFn = vi.fn;

export const createSpy = (implementation?: (...args: any[]) => any) => {
  return vi.fn(implementation);
};

// Test doubles for TDD London approach
export const createStub = <T extends object>(methods: Partial<T>): T => {
  return methods as T;
};

export const createTestDouble = <T extends object>(
  overrides: Partial<T> = {}
): T => {
  const handler = {
    get: (target: any, prop: string) => {
      if (prop in overrides) {
        return overrides[prop as keyof T];
      }
      return vi.fn();
    },
  };
  return new Proxy({}, handler) as T;
};

// Query client for tests
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Provider wrapper
export const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
}) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Custom render with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render with custom render
export { customRender as render };

// Test data builders (TDD London style)
export const aUser = (overrides: Partial<any> = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

export const aTask = (overrides: Partial<any> = {}) => ({
  id: 'test-task-id',
  title: 'Test Task',
  completed: false,
  dayNumber: 1,
  ...overrides,
});

export const aDayLog = (overrides: Partial<any> = {}) => ({
  id: 'test-daylog-id',
  dayNumber: 1,
  date: new Date().toISOString(),
  tasks: [],
  photos: [],
  weight: null,
  journalEntry: null,
  ...overrides,
});

// Async test helpers
export const waitForAsync = async (callback: () => void | Promise<void>) => {
  await callback();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

// Mock timers helper
export const withFakeTimers = async (callback: () => void | Promise<void>) => {
  vi.useFakeTimers();
  try {
    await callback();
  } finally {
    vi.useRealTimers();
  }
};

// Test boundary helpers for TDD London
export const atBoundary = {
  http: {
    get: createSpy(() => Promise.resolve({ data: {} })),
    post: createSpy(() => Promise.resolve({ data: {} })),
    put: createSpy(() => Promise.resolve({ data: {} })),
    delete: createSpy(() => Promise.resolve({ data: {} })),
  },
  storage: {
    get: createSpy(() => Promise.resolve(null)),
    set: createSpy(() => Promise.resolve()),
    remove: createSpy(() => Promise.resolve()),
  },
  instantDB: {
    query: createSpy(() => Promise.resolve([])),
    transact: createSpy(() => Promise.resolve()),
    subscribe: createSpy(() => ({ unsubscribe: vi.fn() })),
  },
};
