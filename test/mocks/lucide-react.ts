// Mock lucide-react icons for testing
import React from "react";
import { vi } from "vitest";

// Create a generic mock icon component
const createMockIcon = (name: string) => {
  return React.forwardRef((props: any, ref: any) => {
    const { testID, className, size = 24, ...rest } = props;
    return React.createElement("svg", {
      "data-testid": testID || `icon-${name}`,
      "data-icon": name,
      className,
      width: size,
      height: size,
      ref,
      ...rest,
    });
  });
};

// Mock lucide-react module
vi.mock("lucide-react", () => ({
  Upload: createMockIcon("Upload"),
  X: createMockIcon("X"),
  AlertCircle: createMockIcon("AlertCircle"),
  Loader2: createMockIcon("Loader2"),
  TrendingUp: createMockIcon("TrendingUp"),
  TrendingDown: createMockIcon("TrendingDown"),
  // Add more icons as needed
}));

// Mock lucide-react-native module
vi.mock("lucide-react-native", () => ({
  TrendingUp: createMockIcon("TrendingUp"),
  TrendingDown: createMockIcon("TrendingDown"),
  // Add more icons as needed
}));

export {};
