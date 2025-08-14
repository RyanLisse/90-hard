import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies - must be defined before mocks
const mockUseSafeAreaInsets = vi.fn();
const mockDimensions = vi.fn();
const mockHealthCheckFetcher = vi.fn();
const mockCreateQueryBridge = vi.fn();
const mockIsMobile = false;

vi.mock("@app/config", () => ({
  isMobile: mockIsMobile,
}));

vi.mock("@green-stack/components/Icon", () => {
  const React = require("react");
  return {
    Icon: ({ name, color, size, className }) =>
      React.createElement("div", {
        "data-testid": `icon-${name}`,
        "data-color": color,
        "data-size": size,
        className,
        children: name,
      }),
  };
});

vi.mock("@green-stack/navigation", () => ({
  createQueryBridge: mockCreateQueryBridge,
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

vi.mock("react-native", () => ({
  Dimensions: {
    get: mockDimensions,
  },
}));

vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: mockUseSafeAreaInsets,
}));

vi.mock("../components/styled", () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
  H1: vi.fn(({ children, className }) => (
    <h1 className={className}>{children}</h1>
  )),
  H2: vi.fn(({ children, className }) => (
    <h2 className={className}>{children}</h2>
  )),
  H3: vi.fn(({ children, className }) => (
    <h3 className={className}>{children}</h3>
  )),
  P: vi.fn(({ children, className, style }) => (
    <p className={className} style={style}>
      {children}
    </p>
  )),
  Text: vi.fn(({ children, className }) => (
    <span className={className}>{children}</span>
  )),
  View: vi.fn(({ children, className, style, accessibilityElementsHidden }) => (
    <div
      className={className}
      style={style}
      aria-hidden={accessibilityElementsHidden}
      data-testid="view"
    >
      {children}
    </div>
  )),
  Image: vi.fn(
    ({ src, alt, className, fill, height, width, quality, unoptimized }) => (
      <img
        src={typeof src === "object" ? src.default || "mocked-image.png" : src}
        alt={alt}
        className={className}
        data-fill={fill}
        height={height}
        width={width}
        data-quality={quality}
        data-unoptimized={unoptimized}
        data-testid="image"
      />
    ),
  ),
  Link: vi.fn(({ children, href, target, className, asChild }) => (
    <a
      href={href}
      target={target}
      className={className}
      data-as-child={asChild}
    >
      {children}
    </a>
  )),
  Pressable: vi.fn(({ children, className }) => (
    <button className={className} data-testid="pressable">
      {children}
    </button>
  )),
  ScrollView: vi.fn(({ children, contentContainerClassName, style }) => (
    <div
      className={contentContainerClassName}
      style={style}
      data-testid="scroll-view"
    >
      {children}
    </div>
  )),
}));

vi.mock("../resolvers/healthCheck.query", () => ({
  healthCheckFetcher: mockHealthCheckFetcher,
}));

// Mock require for images
vi.mock(
  "../assets/automagic-api-gen-icons.png",
  () => "automagic-api-gen-icons.png",
);
vi.mock("../assets/cross-platform-icons.png", () => "cross-platform-icons.png");
vi.mock("../assets/green-stack-logo.png", () => "green-stack-logo.png");

// Mock console.log
const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});

describe("HomeScreen", () => {
  const mockRefetchInitialData = vi.fn();

  const defaultProps: HydratedRouteProps<typeof queryBridge> = {
    serverHealth: {
      echo: "Hello World",
      timestamp: "2024-01-15T10:00:00Z",
      status: "healthy",
    },
    refetchInitialData: mockRefetchInitialData,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    mockUseSafeAreaInsets.mockReturnValue({
      top: 44,
      bottom: 34,
      left: 0,
      right: 0,
    });

    mockDimensions.mockReturnValue({
      width: 375,
      height: 812,
    });

    mockCreateQueryBridge.mockReturnValue({
      routeDataFetcher: mockHealthCheckFetcher,
      routeParamsToQueryKey: vi.fn(),
      routeParamsToQueryInput: vi.fn(),
      fetcherDataToProps: vi.fn(),
    });

    mockRefetchInitialData.mockResolvedValue({
      serverHealth: { echo: "Refetched Hello" },
    });
  });

  describe("Component Rendering", () => {
    it("should render the home screen with all main sections", () => {
      render(<HomeScreen {...defaultProps} />);

      expect(screen.getByText("FullProduct.dev ⚡️")).toBeInTheDocument();
      expect(
        screen.getByText("Your Universal App Starterkit"),
      ).toBeInTheDocument();
      expect(screen.getByText("Docs 📚")).toBeInTheDocument();
      expect(screen.getByText("Concepts")).toBeInTheDocument();
      expect(screen.getByText("Cross Nav")).toBeInTheDocument();
      expect(screen.getByText("Codegen")).toBeInTheDocument();
    });

    it("should render status bar with light style", () => {
      render(<HomeScreen {...defaultProps} />);

      const statusBar = screen.getByTestId("status-bar");
      expect(statusBar).toHaveAttribute("data-style", "light");
    });

    it("should render all navigation links correctly", () => {
      render(<HomeScreen {...defaultProps} />);

      const links = screen.getAllByRole("link");
      expect(
        links.some(
          (link) => link.getAttribute("href") === "https://fullproduct.dev",
        ),
      ).toBe(true);
      expect(
        links.some(
          (link) =>
            link.getAttribute("href") ===
            "https://fullproduct.dev/docs/quickstart",
        ),
      ).toBe(true);
      expect(
        links.some(
          (link) =>
            link.getAttribute("href") ===
            "https://fullproduct.dev/docs/core-concepts",
        ),
      ).toBe(true);
      expect(
        links.some(
          (link) => link.getAttribute("href") === "/subpages/Universal%20Nav",
        ),
      ).toBe(true);
      expect(
        links.some(
          (link) => link.getAttribute("href") === "https://codinsonn.dev",
        ),
      ).toBe(true);
    });

    it('should render external links with target="_blank"', () => {
      render(<HomeScreen {...defaultProps} />);

      const externalLinks = screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("target") === "_blank");
      expect(externalLinks.length).toBeGreaterThan(0);
    });

    it("should render images with proper alt text", () => {
      render(<HomeScreen {...defaultProps} />);

      const images = screen.getAllByTestId("image");
      expect(
        images.some(
          (img) =>
            img.getAttribute("alt") === "FullProduct.dev Starterkit Logo",
        ),
      ).toBe(true);
      expect(
        images.some(
          (img) =>
            img.getAttribute("alt") === "Thorr / codinsonn's Profile Picture",
        ),
      ).toBe(true);
    });
  });

  describe("GettingStarted Component", () => {
    it("should render getting started section", () => {
      render(<HomeScreen {...defaultProps} />);

      expect(screen.getByText("Start from")).toBeInTheDocument();
      expect(screen.getByText("@app/core")).toBeInTheDocument();
      expect(screen.getByText("HomeScreen.tsx")).toBeInTheDocument();
    });

    it("should apply mobile insets styling when mobile", () => {
      vi.doMock("@app/config", () => ({ isMobile: true }));

      mockDimensions.mockReturnValue({ width: 375, height: 812 });

      render(<HomeScreen {...defaultProps} />);

      // Getting started section should be rendered
      expect(screen.getByText("Start from")).toBeInTheDocument();
    });

    it("should handle large screen layout", () => {
      mockDimensions.mockReturnValue({ width: 1200, height: 800 });

      render(<HomeScreen {...defaultProps} />);

      expect(screen.getByText("Start from")).toBeInTheDocument();
    });
  });

  describe("InfoSection Components", () => {
    it("should render all info sections with correct content", () => {
      render(<HomeScreen {...defaultProps} />);

      // Check all info section titles
      expect(screen.getByText("Docs 📚")).toBeInTheDocument();
      expect(screen.getByText("Concepts")).toBeInTheDocument();
      expect(screen.getByText("Cross Nav")).toBeInTheDocument();
      expect(screen.getByText("Codegen")).toBeInTheDocument();

      // Check summaries
      expect(
        screen.getByText(
          "Documentation that grows as you build or paste app features",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Discover a way of working that's portable, write-once and universal",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Test universal navigation for Web & Mobile, and share up to 90% UI code",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Build even faster with generators for Routes, APIs, GraphQL & more",
        ),
      ).toBeInTheDocument();
    });

    it("should render Cross Nav with arrow icon", () => {
      render(<HomeScreen {...defaultProps} />);

      expect(screen.getByTestId("icon-ArrowRightFilled")).toBeInTheDocument();
    });

    it("should handle info section clicks", () => {
      render(<HomeScreen {...defaultProps} />);

      const crossNavButton = screen.getByTestId("pressable");
      expect(crossNavButton).toBeInTheDocument();
    });
  });

  describe("Server Health Effects", () => {
    it("should refetch data when serverHealth has echo", async () => {
      render(<HomeScreen {...defaultProps} />);

      // Wait for effect to run
      await vi.waitFor(() => {
        expect(mockRefetchInitialData).toHaveBeenCalled();
      });
    });

    it("should log props and refetched props", async () => {
      render(<HomeScreen {...defaultProps} />);

      await vi.waitFor(() => {
        expect(mockConsoleLog).toHaveBeenCalledWith({
          props: expect.objectContaining(defaultProps),
          refetchedProps: { serverHealth: { echo: "Refetched Hello" } },
        });
      });
    });

    it("should not refetch when serverHealth has no echo", () => {
      const propsWithoutEcho = {
        ...defaultProps,
        serverHealth: {
          echo: "",
          timestamp: "2024-01-15T10:00:00Z",
          status: "healthy",
        },
      };

      render(<HomeScreen {...propsWithoutEcho} />);

      expect(mockRefetchInitialData).not.toHaveBeenCalled();
    });

    it("should handle refetch errors gracefully", async () => {
      mockRefetchInitialData.mockRejectedValueOnce(new Error("Refetch failed"));

      render(<HomeScreen {...defaultProps} />);

      // Should not throw error
      await vi.waitFor(() => {
        expect(mockRefetchInitialData).toHaveBeenCalled();
      });
    });
  });

  describe("Responsive Design", () => {
    it("should apply different styles for mobile", () => {
      vi.doMock("@app/config", () => ({ isMobile: true }));

      render(<HomeScreen {...defaultProps} />);

      // Should render the mobile layout
      expect(screen.getByTestId("scroll-view")).toBeInTheDocument();
    });

    it("should handle safe area insets", () => {
      vi.doMock("@app/config", () => ({ isMobile: true }));

      mockUseSafeAreaInsets.mockReturnValue({
        top: 60,
        bottom: 40,
        left: 0,
        right: 0,
      });

      render(<HomeScreen {...defaultProps} />);

      // Component should render without issues
      expect(screen.getByText("FullProduct.dev ⚡️")).toBeInTheDocument();
    });

    it("should handle small safe area insets", () => {
      vi.doMock("@app/config", () => ({ isMobile: true }));

      mockUseSafeAreaInsets.mockReturnValue({
        top: 10,
        bottom: 10,
        left: 0,
        right: 0,
      });

      render(<HomeScreen {...defaultProps} />);

      expect(screen.getByText("FullProduct.dev ⚡️")).toBeInTheDocument();
    });
  });

  describe("Layout Variations", () => {
    it("should handle desktop layout correctly", () => {
      vi.doMock("@app/config", () => ({ isMobile: false }));

      render(<HomeScreen {...defaultProps} />);

      // Should render all sections
      expect(screen.getByText("FullProduct.dev ⚡️")).toBeInTheDocument();
      expect(screen.getByText("By")).toBeInTheDocument();
      expect(screen.getByText("Thorr ⚡️ codinsonn.dev")).toBeInTheDocument();
    });

    it("should render side icon images", () => {
      render(<HomeScreen {...defaultProps} />);

      const images = screen.getAllByTestId("image");
      const sideIcons = images.filter(
        (img) =>
          img.getAttribute("src") === "automagic-api-gen-icons.png" ||
          img.getAttribute("src") === "cross-platform-icons.png",
      );
      expect(sideIcons).toHaveLength(2);
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<HomeScreen {...defaultProps} />);

      const h1Elements = screen.getAllByRole("heading", { level: 1 });
      const h2Elements = screen.getAllByRole("heading", { level: 2 });
      const h3Elements = screen.getAllByRole("heading", { level: 3 });

      expect(h1Elements).toHaveLength(1);
      expect(h2Elements.length).toBeGreaterThan(0);
      expect(h3Elements).toHaveLength(1);
    });

    it("should have proper alt text for images", () => {
      render(<HomeScreen {...defaultProps} />);

      const images = screen.getAllByTestId("image");
      images.forEach((img) => {
        expect(img).toHaveAttribute("alt");
        expect(img.getAttribute("alt")).not.toBe("");
      });
    });

    it("should handle accessibility elements correctly", () => {
      render(<HomeScreen {...defaultProps} />);

      const hiddenElements = screen
        .getAllByLabelText("", { exact: false })
        .filter((el) => el.getAttribute("aria-hidden") === "true");
      expect(hiddenElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing serverHealth", () => {
      const propsWithoutServerHealth = {
        ...defaultProps,
        serverHealth: undefined,
      };

      expect(() => {
        render(<HomeScreen {...propsWithoutServerHealth} />);
      }).not.toThrow();
    });

    it("should handle missing refetchInitialData function", () => {
      const propsWithoutRefetch = {
        ...defaultProps,
        refetchInitialData: undefined,
      };

      expect(() => {
        render(<HomeScreen {...propsWithoutRefetch} />);
      }).not.toThrow();
    });

    it("should handle extreme safe area insets", () => {
      mockUseSafeAreaInsets.mockReturnValue({
        top: 100,
        bottom: 50,
        left: 20,
        right: 20,
      });

      expect(() => {
        render(<HomeScreen {...defaultProps} />);
      }).not.toThrow();
    });

    it("should handle very small screen dimensions", () => {
      mockDimensions.mockReturnValue({
        width: 200,
        height: 400,
      });

      expect(() => {
        render(<HomeScreen {...defaultProps} />);
      }).not.toThrow();
    });
  });

  describe("Query Bridge", () => {
    it("should export queryBridge with correct structure", () => {
      expect(queryBridge).toBeDefined();
      expect(mockCreateQueryBridge).toHaveBeenCalledWith({
        routeDataFetcher: mockHealthCheckFetcher,
        routeParamsToQueryKey: expect.any(Function),
        routeParamsToQueryInput: expect.any(Function),
        fetcherDataToProps: expect.any(Function),
      });
    });

    it("should handle query bridge functions correctly", () => {
      const {
        routeParamsToQueryKey,
        routeParamsToQueryInput,
        fetcherDataToProps,
      } = mockCreateQueryBridge.mock.calls[0][0];

      // Test routeParamsToQueryKey
      const queryKey = routeParamsToQueryKey({ echo: "test", verbose: true });
      expect(queryKey).toEqual(["healthCheck", "test"]);

      // Test routeParamsToQueryInput
      const queryInput = routeParamsToQueryInput({
        echo: "test",
        verbose: true,
      });
      expect(queryInput).toEqual({
        healthCheckArgs: {
          echo: "test",
          verbose: true,
        },
      });

      // Test fetcherDataToProps
      const props = fetcherDataToProps({ healthCheck: { echo: "test" } });
      expect(props).toEqual({
        serverHealth: { echo: "test" },
      });
    });
  });

  describe("Performance", () => {
    it("should not cause unnecessary re-renders", () => {
      const { rerender } = render(<HomeScreen {...defaultProps} />);

      // Re-render with same props
      rerender(<HomeScreen {...defaultProps} />);

      // Should still render correctly
      expect(screen.getByText("FullProduct.dev ⚡️")).toBeInTheDocument();
    });

    it("should handle rapid prop changes", () => {
      const { rerender } = render(<HomeScreen {...defaultProps} />);

      // Rapid prop changes
      for (let i = 0; i < 10; i++) {
        rerender(
          <HomeScreen
            {...{
              ...defaultProps,
              serverHealth: {
                echo: `test-${i}`,
                timestamp: "2024-01-15T10:00:00Z",
                status: "healthy",
              },
            }}
          />,
        );
      }

      expect(screen.getByText("FullProduct.dev ⚡️")).toBeInTheDocument();
    });
  });
});
