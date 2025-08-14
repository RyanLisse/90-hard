import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Import React Native mocks before any components
import "./mocks/react-native";
import "./mocks/expo-constants";
import "./mocks/lucide-react";

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

// Set up CSS custom properties for chart colors in test environment
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    :root {
      --chart-1: oklch(0.646 0.222 41.116);
      --chart-2: oklch(0.6 0.118 184.704);
      --primary: oklch(0.216 0.006 56.043);
      --background: oklch(1 0 0);
      --foreground: oklch(0.147 0.004 49.25);
      --muted: oklch(0.97 0.001 106.424);
      --muted-foreground: oklch(0.553 0.013 58.071);
    }
  `;
  document.head.appendChild(style);
}

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
