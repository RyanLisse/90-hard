import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Import React Native mocks before any components
import "./mocks/react-native";
import "./mocks/expo-constants";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Ensure window is available for DOM environment
if (typeof window !== "undefined") {
  // Mock window.matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Browser echo setup
if (process.env.BROWSER_ECHO === "true") {
  const originalConsole = { ...console };

  global.console = {
    ...console,
    log: (...args) => {
      originalConsole.log("[TEST LOG]", ...args);
    },
    error: (...args) => {
      originalConsole.error("[TEST ERROR]", ...args);
    },
    warn: (...args) => {
      originalConsole.warn("[TEST WARN]", ...args);
    },
    info: (...args) => {
      originalConsole.info("[TEST INFO]", ...args);
    },
    debug: (...args) => {
      originalConsole.debug("[TEST DEBUG]", ...args);
    },
  };
}
