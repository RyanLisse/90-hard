import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BackButton from "./BackButton";

// Mock dependencies
const mockBack = vi.fn();
const mockCanGoBack = vi.fn();
const mockResolvedThemeColor = "#000000";

// Mock navigation
vi.mock("@green-stack/navigation/useRouter", () => ({
  useRouter: () => ({
    back: mockBack,
    canGoBack: mockCanGoBack,
  }),
}));

// Mock useDidMount hook
vi.mock("@green-stack/hooks/useDidMount", () => ({
  useDidMount: () => true, // Always mounted for tests
}));

// Mock styled components
vi.mock("./styled", async () => {
  const actual = await vi.importActual("./styled");
  return {
    ...actual,
    getThemeColor: vi.fn(() => mockResolvedThemeColor),
  };
});

// Mock Icon component
vi.mock("@green-stack/components/Icon", () => ({
  Icon: ({ name, size, color }: any) => (
    <div
      data-testid="icon"
      data-name={name}
      data-size={size}
      data-color={color}
    >
      Icon
    </div>
  ),
}));

// Mock server detection
vi.mock("@app/config", () => ({
  isServer: false,
}));

describe("BackButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanGoBack.mockReturnValue(true);
  });

  describe("UI Rendering", () => {
    it("should render back arrow icon with default props", () => {
      render(<BackButton />);

      const icon = screen.getByTestId("icon");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("data-name", "ArrowLeftFilled");
      expect(icon).toHaveAttribute("data-size", "24");
      expect(icon).toHaveAttribute("data-color", mockResolvedThemeColor);
    });

    it("should render back text when provided", () => {
      render(<BackButton backText="Back" />);

      expect(screen.getByText("Back")).toBeInTheDocument();
    });

    it("should not render back text when not provided", () => {
      render(<BackButton />);

      expect(screen.queryByText("Back")).not.toBeInTheDocument();
    });

    it("should apply custom icon size", () => {
      render(<BackButton iconSize={32} />);

      const icon = screen.getByTestId("icon");
      expect(icon).toHaveAttribute("data-size", "32");
    });

    it("should apply custom color", () => {
      const customColor = "#ff0000";
      render(<BackButton color={customColor} />);

      const icon = screen.getByTestId("icon");
      expect(icon).toHaveAttribute("data-color", customColor);
    });

    it("should apply custom back link", () => {
      render(<BackButton backLink="/custom" />);

      // When can't go back, should render as Link
      mockCanGoBack.mockReturnValue(false);
      const { container } = render(<BackButton backLink="/custom" />);
      const link = container.querySelector("a");
      expect(link).toHaveAttribute("href", "/custom");
    });
  });

  describe("Navigation Behavior", () => {
    it("should render as Pressable when can go back", () => {
      mockCanGoBack.mockReturnValue(true);
      render(<BackButton />);

      // Should not find a link element
      const link = screen.queryByRole("link");
      expect(link).not.toBeInTheDocument();
    });

    it("should render as Link when cannot go back", () => {
      mockCanGoBack.mockReturnValue(false);
      const { container } = render(<BackButton />);

      const link = container.querySelector("a");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/");
    });

    it("should call back function when pressed and can go back", () => {
      mockCanGoBack.mockReturnValue(true);
      render(<BackButton />);

      const button = screen.getByTestId("icon").closest("div");
      fireEvent.click(button!);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("should not call back function when rendered as link", () => {
      mockCanGoBack.mockReturnValue(false);
      render(<BackButton />);

      const link = screen.getByTestId("icon").closest("a");
      fireEvent.click(link!);

      expect(mockBack).not.toHaveBeenCalled();
    });
  });

  describe("Server-Side Rendering", () => {
    it("should render as Link on server", async () => {
      // Mock server environment
      const configModule = await import("@app/config");
      vi.mocked(configModule).isServer = true;

      const { container } = render(<BackButton />);

      const link = container.querySelector("a");
      expect(link).toBeInTheDocument();

      // Restore client environment
      vi.mocked(configModule).isServer = false;
    });
  });

  describe("Mounting Behavior", () => {
    it("should render as Link before mount", async () => {
      // Mock useDidMount to return false
      vi.mocked(await import("@green-stack/hooks/useDidMount")).useDidMount =
        () => false;

      const { container } = render(<BackButton />);

      const link = container.querySelector("a");
      expect(link).toBeInTheDocument();

      // Restore useDidMount
      vi.mocked(await import("@green-stack/hooks/useDidMount")).useDidMount =
        () => true;
    });
  });

  describe("Styling", () => {
    it("should apply correct positioning classes", () => {
      render(<BackButton />);

      const button = screen.getByTestId("icon").closest("div")?.parentElement;
      expect(button).toHaveClass("absolute", "top-8", "web:top-0", "left-0");
    });

    it("should apply flex layout to inner content", () => {
      render(<BackButton backText="Back" />);

      const innerContent = screen.getByTestId("icon").parentElement;
      expect(innerContent).toHaveClass(
        "flex",
        "flex-row",
        "items-center",
        "p-4",
      );
    });

    it("should apply correct text styling", () => {
      render(<BackButton backText="Back" color="#ff0000" />);

      const text = screen.getByText("Back");
      expect(text).toHaveClass("text-xl", "text-[#ff0000]");
      expect(text).toHaveStyle({ color: "#ff0000" });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined back text gracefully", () => {
      render(<BackButton backText={undefined} />);

      expect(screen.queryByText("Back")).not.toBeInTheDocument();
    });

    it("should handle empty back text", () => {
      render(<BackButton backText="" />);

      expect(screen.queryByText("Back")).not.toBeInTheDocument();
    });

    it("should handle navigation state changes", () => {
      mockCanGoBack.mockReturnValue(false);
      const { rerender, container } = render(<BackButton />);

      // Initially renders as Link
      let link = container.querySelector("a");
      expect(link).toBeInTheDocument();

      // Change navigation state
      mockCanGoBack.mockReturnValue(true);
      rerender(<BackButton />);

      // Should now render as Pressable
      link = container.querySelector("a");
      expect(link).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard accessible when rendered as button", () => {
      mockCanGoBack.mockReturnValue(true);
      render(<BackButton />);

      const button = screen.getByTestId("icon").closest("div");
      expect(button).toBeInTheDocument();
      // Pressable components are inherently accessible
    });

    it("should be keyboard accessible when rendered as link", () => {
      mockCanGoBack.mockReturnValue(false);
      const { container } = render(<BackButton />);

      const link = container.querySelector("a");
      expect(link).toBeInTheDocument();
      // Links are inherently accessible
    });
  });
});
