// Vitest global setup for web/RN hybrid repo

// IntersectionObserver mock
class MockIntersectionObserver {
  constructor(public callback: IntersectionObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}
// ResizeObserver mock
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Assign globals if not present
if (!(globalThis as any).IntersectionObserver) {
  (globalThis as any).IntersectionObserver = MockIntersectionObserver as any;
}
if (!(globalThis as any).ResizeObserver) {
  (globalThis as any).ResizeObserver = MockResizeObserver as any;
}

// matchMedia mock
if (!(globalThis as any).matchMedia) {
  (globalThis as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Stub next/image warnings in tests
process.env.__NEXT_IMAGE_OPTS = 'true';

// Mock @instantdb/react init to return a minimal client if present
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const vi = require('vitest').vi as typeof import('vitest').vi;
  vi.mock('@instantdb/react', () => {
    return {
      init: () => ({
        transact: async () => {},
        subscribe: () => ({ unsubscribe: () => {} }),
        query: () => ({ where: () => ({ first: async () => null }) }),
        auth: { getUser: () => null },
        db: {},
      }),
    };
  });
} catch {}
