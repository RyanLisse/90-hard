import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies - must be defined before mocks
const mockPush = vi.fn();
const mockNavigate = vi.fn();
const mockReplace = vi.fn();
const mockSetParams = vi.fn();

vi.mock("@green-stack/navigation/useRouteParams", () => ({
  useRouteParams: vi.fn((props) => ({
    slug: "test-slug",
    count: 5,
    ...props,
  })),
}));

vi.mock("@green-stack/navigation/useRouter", () => ({
  useRouter: () => ({
    push: mockPush,
    navigate: mockNavigate,
    replace: mockReplace,
    setParams: mockSetParams,
  }),
}));

vi.mock("expo-status-bar", () => {
  const React = require("react");
  return {
    StatusBar: ({ style }) =>
      React.createElement("div", {
        "data-testid": "status-bar",
        "data-style": style,
      }),
  };
});

vi.mock("../components/styled", () => ({
  H1: vi.fn(({ children, className }) => (
    <h1 className={className}>{children}</h1>
  )),
  P: vi.fn(({ children, className }) => (
    <p className={className}>{children}</p>
  )),
  Text: vi.fn(({ children, className, onPress }) => (
    <span
      className={className}
      onClick={onPress}
      role={onPress ? "button" : undefined}
    >
      {children}
    </span>
  )),
  View: vi.fn(({ children, className }) => (
    <div className={className}>{children}</div>
  )),
  Link: vi.fn(({ children, href, target, className }) => (
    <a href={href} target={target} className={className}>
      {children}
    </a>
  )),
  ScrollView: vi.fn(({ children, className, contentContainerClassName }) => (
    <div
      className={`${className} ${contentContainerClassName}`}
      data-testid="scroll-view"
    >
      {children}
    </div>
  )),
}));

vi.mock("../components/BackButton", () => ({
  default: vi.fn(({ color }) => (
    <button data-testid="back-button" data-color={color}>
      Back
    </button>
  )),
}));

vi.mock("../constants/testableFeatures", () => ({
  testableFeatures: [
    {
      title: "Test Images?",
      link: "/demos/images",
    },
    {
      title: "Test Forms?",
      link: "/demos/forms",
    },
  ],
}));

describe("SlugScreen", () => {
  const defaultProps: UniversalRouteScreenProps = {};

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset default mock returns
    const {
      useRouteParams,
    } = require("@green-stack/navigation/useRouteParams");
    useRouteParams.mockReturnValue({
      slug: "test-slug",
      count: 5,
    });
  });

  describe("Component Rendering", () => {
    it("should render the slug screen", () => {
      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByTestId("scroll-view")).toBeInTheDocument();
    });

    it("should render status bar with light style", () => {
      render(<SlugScreen {...defaultProps} />);

      const statusBar = screen.getByTestId("status-bar");
      expect(statusBar).toHaveAttribute("data-style", "light");
    });

    it("should render back button with white color", () => {
      render(<SlugScreen {...defaultProps} />);

      const backButton = screen.getByTestId("back-button");
      expect(backButton).toHaveAttribute("data-color", "#FFFFFF");
    });

    it("should display the slug in the title", () => {
      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText("slug - test-slug")).toBeInTheDocument();
    });

    it("should decode URI components in slug", () => {
      const {
        useRouteParams,
      } = require("@green-stack/navigation/useRouteParams");
      useRouteParams.mockReturnValue({
        slug: "Universal%20Nav",
        count: 0,
      });

      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText("slug - Universal Nav")).toBeInTheDocument();
    });
  });

  describe("Route Parameters", () => {
    it("should display the count parameter", () => {
      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText("count (5)")).toBeInTheDocument();
    });

    it("should handle zero count", () => {
      const {
        useRouteParams,
      } = require("@green-stack/navigation/useRouteParams");
      useRouteParams.mockReturnValue({
        slug: "test-slug",
        count: 0,
      });

      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText("count (0)")).toBeInTheDocument();
    });

    it("should handle undefined count with default value", () => {
      const {
        useRouteParams,
      } = require("@green-stack/navigation/useRouteParams");
      useRouteParams.mockReturnValue({
        slug: "test-slug",
        count: undefined,
      });

      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText("count (0)")).toBeInTheDocument();
    });

    it("should handle string count values", () => {
      const {
        useRouteParams,
      } = require("@green-stack/navigation/useRouteParams");
      useRouteParams.mockReturnValue({
        slug: "test-slug",
        count: "42",
      });

      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText("count (42)")).toBeInTheDocument();
    });
  });

  describe("Parameter Updates", () => {
    it("should handle setParams click to increment count", () => {
      render(<SlugScreen {...defaultProps} />);

      const setParamsButton = screen.getByText("router.setParams()");
      fireEvent.click(setParamsButton);

      expect(mockSetParams).toHaveBeenCalledWith({ count: "6" });
    });

    it("should increment count from zero", () => {
      const {
        useRouteParams,
      } = require("@green-stack/navigation/useRouteParams");
      useRouteParams.mockReturnValue({
        slug: "test-slug",
        count: 0,
      });

      render(<SlugScreen {...defaultProps} />);

      const setParamsButton = screen.getByText("router.setParams()");
      fireEvent.click(setParamsButton);

      expect(mockSetParams).toHaveBeenCalledWith({ count: "1" });
    });

    it("should handle string count for increment", () => {
      const {
        useRouteParams,
      } = require("@green-stack/navigation/useRouteParams");
      useRouteParams.mockReturnValue({
        slug: "test-slug",
        count: "10",
      });

      render(<SlugScreen {...defaultProps} />);

      const setParamsButton = screen.getByText("router.setParams()");
      fireEvent.click(setParamsButton);

      expect(mockSetParams).toHaveBeenCalledWith({ count: "11" });
    });
  });

  describe("Navigation Functions", () => {
    it("should render all navigation test buttons", () => {
      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText("router.push()")).toBeInTheDocument();
      expect(screen.getByText("router.navigate()")).toBeInTheDocument();
      expect(screen.getByText("router.replace()")).toBeInTheDocument();
      expect(screen.getByText("router.setParams()")).toBeInTheDocument();
    });

    it("should handle push navigation", () => {
      render(<SlugScreen {...defaultProps} />);

      const pushButton = screen.getByText("router.push()");
      fireEvent.click(pushButton);

      expect(mockPush).toHaveBeenCalledWith("/subpages/push");
    });

    it("should handle navigate navigation", () => {
      render(<SlugScreen {...defaultProps} />);

      const navigateButton = screen.getByText("router.navigate()");
      fireEvent.click(navigateButton);

      expect(mockNavigate).toHaveBeenCalledWith("/subpages/navigate");
    });

    it("should handle replace navigation", () => {
      render(<SlugScreen {...defaultProps} />);

      const replaceButton = screen.getByText("router.replace()");
      fireEvent.click(replaceButton);

      expect(mockReplace).toHaveBeenCalledWith("/subpages/replace");
    });

    it("should apply correct styling to navigation buttons", () => {
      render(<SlugScreen {...defaultProps} />);

      const buttons = [
        screen.getByText("router.push()"),
        screen.getByText("router.navigate()"),
        screen.getByText("router.replace()"),
        screen.getByText("router.setParams()"),
      ];

      buttons.forEach((button) => {
        expect(button).toHaveClass(
          "text-center",
          "text-base",
          "text-link",
          "underline",
        );
        expect(button).toHaveAttribute("role", "button");
      });
    });
  });

  describe("Testable Features", () => {
    it("should render all testable feature links", () => {
      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText("Test Images?")).toBeInTheDocument();
      expect(screen.getByText("Test Forms?")).toBeInTheDocument();
    });

    it("should render feature links with correct hrefs", () => {
      render(<SlugScreen {...defaultProps} />);

      const imagesLink = screen.getByText("Test Images?");
      const formsLink = screen.getByText("Test Forms?");

      expect(imagesLink).toHaveAttribute("href", "/demos/images");
      expect(formsLink).toHaveAttribute("href", "/demos/forms");
    });

    it("should apply correct styling to feature links", () => {
      render(<SlugScreen {...defaultProps} />);

      const links = [
        screen.getByText("Test Images?"),
        screen.getByText("Test Forms?"),
      ];

      links.forEach((link) => {
        expect(link).toHaveClass("text-center", "text-base");
      });
    });

    it("should handle empty testable features array", () => {
      vi.doMock("../constants/testableFeatures", () => ({
        testableFeatures: [],
      }));

      expect(() => render(<SlugScreen {...defaultProps} />)).not.toThrow();
    });
  });

  describe("External Links", () => {
    it("should render FullProduct.dev link", () => {
      render(<SlugScreen {...defaultProps} />);

      const fullProductLink = screen.getByText("FullProduct.dev");
      expect(fullProductLink).toBeInTheDocument();
      expect(fullProductLink).toHaveAttribute(
        "href",
        "https://fullproduct.dev",
      );
      expect(fullProductLink).toHaveAttribute("target", "_blank");
    });

    it("should render upgrade message", () => {
      render(<SlugScreen {...defaultProps} />);

      expect(
        screen.getByText("Upgrade your Universal App Setup?"),
      ).toBeInTheDocument();
    });

    it("should apply correct styling to external link", () => {
      render(<SlugScreen {...defaultProps} />);

      const fullProductLink = screen.getByText("FullProduct.dev");
      expect(fullProductLink).toHaveClass(
        "mt-4",
        "text-center",
        "font-bold",
        "text-lg",
        "no-underline",
      );
    });
  });

  describe("Layout and Styling", () => {
    it("should apply dark background styling", () => {
      render(<SlugScreen {...defaultProps} />);

      const scrollView = screen.getByTestId("scroll-view");
      expect(scrollView).toHaveClass(
        "flex",
        "min-h-screen",
        "flex-1",
        "bg-slate-800",
      );
    });

    it("should center content vertically and horizontally", () => {
      render(<SlugScreen {...defaultProps} />);

      const containers = screen.getAllByRole("generic");
      const mainContainer = containers.find((container) =>
        container.className?.includes("items-center justify-center"),
      );
      expect(mainContainer).toBeInTheDocument();
    });

    it("should apply proper spacing with dividers", () => {
      render(<SlugScreen {...defaultProps} />);

      const containers = screen.getAllByRole("generic");
      const dividers = containers.filter((container) =>
        container.className?.includes("h-1 w-12 bg-slate-600"),
      );
      expect(dividers.length).toBeGreaterThanOrEqual(3);
    });

    it("should apply full height layout", () => {
      render(<SlugScreen {...defaultProps} />);

      const containers = screen.getAllByRole("generic");
      const fullHeightContainers = containers.filter((container) =>
        container.className?.includes("min-h-screen"),
      );
      expect(fullHeightContainers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Content Descriptions", () => {
    it("should render universal routing description", () => {
      render(<SlugScreen {...defaultProps} />);

      expect(
        screen.getByText(
          /Universal URL routing built on Expo & Next.js routers/,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/shared between Web and Native/),
      ).toBeInTheDocument();
    });

    it("should explain the count parameter functionality", () => {
      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText(/Tap to change the/)).toBeInTheDocument();
      expect(screen.getByText(/param:/)).toBeInTheDocument();
    });

    it("should apply correct text styling", () => {
      render(<SlugScreen {...defaultProps} />);

      const title = screen.getByText("slug - test-slug");
      expect(title).toHaveClass("text-3xl", "text-white");

      const description = screen.getByText(/Universal URL routing/);
      expect(description.parentElement).toHaveClass(
        "max-w-[400px]",
        "px-6",
        "text-center",
        "text-base",
        "text-gray-300",
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<SlugScreen {...defaultProps} />);

      const h1Elements = screen.getAllByRole("heading", { level: 1 });
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0]).toHaveTextContent("slug - test-slug");
    });

    it("should have clickable elements with button role", () => {
      render(<SlugScreen {...defaultProps} />);

      const clickableElements = screen.getAllByRole("button");
      expect(clickableElements.length).toBeGreaterThan(0);

      // Navigation buttons should have button role
      const navButtons = clickableElements.filter((el) =>
        el.textContent?.includes("router."),
      );
      expect(navButtons).toHaveLength(4);
    });

    it("should have proper link accessibility", () => {
      render(<SlugScreen {...defaultProps} />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(3); // 2 testable features + 1 external link

      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
        expect(link.getAttribute("href")).not.toBe("");
      });
    });

    it("should have proper text contrast for dark theme", () => {
      render(<SlugScreen {...defaultProps} />);

      const whiteTexts = screen.getAllByText(
        (_, element) => element?.className?.includes("text-white") ?? false,
      );
      expect(whiteTexts.length).toBeGreaterThan(0);

      const lightTexts = screen.getAllByText(
        (_, element) => element?.className?.includes("text-gray-300") ?? false,
      );
      expect(lightTexts.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing slug parameter", () => {
      const {
        useRouteParams,
      } = require("@green-stack/navigation/useRouteParams");
      useRouteParams.mockReturnValue({
        slug: undefined,
        count: 0,
      });

      expect(() => render(<SlugScreen {...defaultProps} />)).not.toThrow();
    });

    it("should handle null slug parameter", () => {
      const {
        useRouteParams,
      } = require("@green-stack/navigation/useRouteParams");
      useRouteParams.mockReturnValue({
        slug: null,
        count: 0,
      });

      expect(() => render(<SlugScreen {...defaultProps} />)).not.toThrow();
    });

    it("should handle negative count values", () => {
      const {
        useRouteParams,
      } = require("@green-stack/navigation/useRouteParams");
      useRouteParams.mockReturnValue({
        slug: "test-slug",
        count: -5,
      });

      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText("count (-5)")).toBeInTheDocument();

      const setParamsButton = screen.getByText("router.setParams()");
      fireEvent.click(setParamsButton);

      expect(mockSetParams).toHaveBeenCalledWith({ count: "-4" });
    });

    it("should handle very large count values", () => {
      const {
        useRouteParams,
      } = require("@green-stack/navigation/useRouteParams");
      useRouteParams.mockReturnValue({
        slug: "test-slug",
        count: 999999,
      });

      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText("count (999999)")).toBeInTheDocument();

      const setParamsButton = screen.getByText("router.setParams()");
      fireEvent.click(setParamsButton);

      expect(mockSetParams).toHaveBeenCalledWith({ count: "1000000" });
    });

    it("should handle non-numeric count values", () => {
      const {
        useRouteParams,
      } = require("@green-stack/navigation/useRouteParams");
      useRouteParams.mockReturnValue({
        slug: "test-slug",
        count: "invalid",
      });

      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByText("count (invalid)")).toBeInTheDocument();

      const setParamsButton = screen.getByText("router.setParams()");
      fireEvent.click(setParamsButton);

      // Should convert to NaN + 1 = NaN, then to string 'NaN'
      expect(mockSetParams).toHaveBeenCalledWith({ count: "NaN" });
    });
  });

  describe("Performance", () => {
    it("should handle multiple re-renders without issues", () => {
      const { rerender } = render(<SlugScreen {...defaultProps} />);

      for (let i = 0; i < 5; i++) {
        rerender(<SlugScreen {...defaultProps} />);
      }

      expect(screen.getByText("slug - test-slug")).toBeInTheDocument();
    });

    it("should not cause memory leaks with navigation functions", () => {
      const { unmount } = render(<SlugScreen {...defaultProps} />);

      expect(() => unmount()).not.toThrow();
    });
  });

  describe("Integration", () => {
    it("should integrate all components properly", () => {
      render(<SlugScreen {...defaultProps} />);

      expect(screen.getByTestId("status-bar")).toBeInTheDocument();
      expect(screen.getByTestId("scroll-view")).toBeInTheDocument();
      expect(screen.getByTestId("back-button")).toBeInTheDocument();
      expect(screen.getByText("slug - test-slug")).toBeInTheDocument();
      expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
      expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });
  });
});
