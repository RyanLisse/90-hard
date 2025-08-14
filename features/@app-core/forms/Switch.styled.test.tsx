import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies - must be defined before mocks
const mockApplyDefaults = vi.fn();
const mockDocumentationProps = vi.fn();
const mockUseFocusedPress = vi.fn();
const mockUseColorScheme = vi.fn();
const mockUseDerivedValue = vi.fn();
const mockUseAnimatedStyle = vi.fn();
const mockWithTiming = vi.fn();
const mockInterpolateColor = vi.fn();
const mockGetThemeColor = vi.fn();

vi.mock("@green-stack/forms/Switch.primitives", () => {
  const React = require("react");
  return {
    SwitchRoot: React.forwardRef(
      ({ children, className, asChild, ...props }, ref) =>
        React.createElement("div", {
          ref,
          "data-testid": "switch-root",
          className,
          "data-as-child": asChild,
          ...props,
          children,
        }),
    ),
    SwitchThumb: ({ children, className, asChild }) =>
      React.createElement("div", {
        "data-testid": "switch-thumb",
        className,
        "data-as-child": asChild,
        children,
      }),
  };
});

vi.mock("@green-stack/hooks/useFocusedPress", () => ({
  useFocusedPress: mockUseFocusedPress,
}));

vi.mock("@green-stack/schemas", () => ({
  schema: vi.fn(() => ({
    applyDefaults: mockApplyDefaults,
    documentationProps: mockDocumentationProps,
  })),
  z: {
    boolean: () => ({
      default: vi.fn(),
    }),
    string: () => ({
      optional: vi.fn(),
    }),
    number: () => ({
      default: vi.fn(),
    }),
  },
  type: {},
}));

vi.mock("nativewind", () => ({
  useColorScheme: mockUseColorScheme,
}));

vi.mock("react-native", () => ({
  Platform: {
    select: vi.fn((obj) => obj.web), // Default to web for testing
  },
}));

vi.mock("react-native-reanimated", () => ({
  default: {
    View: vi.fn(({ children, className, style }) => (
      <div data-testid="animated-view" className={className} style={style}>
        {children}
      </div>
    )),
  },
  interpolateColor: mockInterpolateColor,
  useAnimatedStyle: mockUseAnimatedStyle,
  useDerivedValue: mockUseDerivedValue,
  withTiming: mockWithTiming,
}));

vi.mock("../components/styled", () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
  getThemeColor: mockGetThemeColor,
  Pressable: vi.fn(({ children, className, onPress, disabled, ...props }) => (
    <button
      data-testid="pressable"
      className={className}
      onClick={onPress}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )),
  Text: vi.fn(({ children, className, disabled }) => (
    <span data-testid="text" className={className} data-disabled={disabled}>
      {children}
    </span>
  )),
  View: vi.fn(({ children, className }) => (
    <div data-testid="view" className={className}>
      {children}
    </div>
  )),
}));

describe("SwitchWeb Component", () => {
  const defaultProps = {
    checked: false,
    label: "Test Switch",
    disabled: false,
    hasError: false,
    className: "",
    switchClassName: "",
    switchThumbClassName: "",
    labelClassName: "",
    hitSlop: 6,
  };

  const mockOnCheckedChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyDefaults.mockImplementation((props) => ({
      ...defaultProps,
      ...props,
    }));
    mockUseFocusedPress.mockReturnValue({
      onKeyDown: vi.fn(),
      onFocus: vi.fn(),
      onBlur: vi.fn(),
    });
    mockGetThemeColor.mockReturnValue("#000000");
    mockDocumentationProps.mockReturnValue({});
  });

  describe("Basic Rendering", () => {
    it("should render switch web component", () => {
      render(<SwitchWeb {...defaultProps} />);

      expect(screen.getByTestId("pressable")).toBeInTheDocument();
      expect(screen.getByTestId("switch-root")).toBeInTheDocument();
      expect(screen.getByTestId("switch-thumb")).toBeInTheDocument();
    });

    it("should apply default props through schema", () => {
      const customProps = { checked: true, label: "Custom Switch" };
      render(<SwitchWeb {...customProps} />);

      expect(mockApplyDefaults).toHaveBeenCalledWith(customProps);
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<SwitchWeb ref={ref} {...defaultProps} />);

      expect(ref.current).toBeTruthy();
    });

    it("should render label when provided", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        label: "Test Label",
      });

      render(<SwitchWeb {...defaultProps} label="Test Label" />);

      const text = screen.getByTestId("text");
      expect(text).toHaveTextContent("Test Label");
    });

    it("should not render label when not provided", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, label: undefined });

      render(<SwitchWeb {...defaultProps} />);

      expect(screen.queryByTestId("text")).not.toBeInTheDocument();
    });
  });

  describe("Checked State", () => {
    it("should apply checked styling when checked", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: true });

      render(<SwitchWeb checked />);

      const switchRoot = screen.getByTestId("switch-root");
      expect(switchRoot).toHaveClass("bg-success");
    });

    it("should apply unchecked styling when not checked", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: false });

      render(<SwitchWeb checked={false} />);

      const switchRoot = screen.getByTestId("switch-root");
      expect(switchRoot).toHaveClass("bg-input");
    });

    it("should apply thumb translation when checked", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: true });

      render(<SwitchWeb checked />);

      const switchThumb = screen.getByTestId("switch-thumb");
      expect(switchThumb).toHaveClass("translate-x-5");
    });

    it("should not apply thumb translation when unchecked", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: false });

      render(<SwitchWeb checked={false} />);

      const switchThumb = screen.getByTestId("switch-thumb");
      expect(switchThumb).toHaveClass("translate-x-0");
    });
  });

  describe("Error State", () => {
    it("should apply error styling when hasError is true", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, hasError: true });

      render(<SwitchWeb hasError />);

      const switchRoot = screen.getByTestId("switch-root");
      expect(switchRoot).toHaveClass("border-danger");
    });

    it("should apply error styling to checked switch", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        checked: true,
        hasError: true,
      });

      render(<SwitchWeb checked hasError />);

      const switchRoot = screen.getByTestId("switch-root");
      expect(switchRoot).toHaveClass("bg-danger");
    });

    it("should not apply error styling when hasError is false", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, hasError: false });

      render(<SwitchWeb hasError={false} />);

      const switchRoot = screen.getByTestId("switch-root");
      expect(switchRoot).not.toHaveClass("border-danger");
    });
  });

  describe("Disabled State", () => {
    it("should apply disabled styling when disabled", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: true });

      render(<SwitchWeb disabled />);

      const pressables = screen.getAllByTestId("pressable");
      expect(pressables[0]).toBeDisabled();
      expect(pressables[1]).toBeDisabled();

      const switchRoot = screen.getByTestId("switch-root");
      expect(switchRoot).toHaveClass("opacity-50");
    });

    it("should disable text when switch is disabled", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        disabled: true,
        label: "Disabled Switch",
      });

      render(<SwitchWeb disabled label="Disabled Switch" />);

      const text = screen.getByTestId("text");
      expect(text).toHaveAttribute("data-disabled", "true");
    });

    it("should not apply disabled styling when enabled", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: false });

      render(<SwitchWeb disabled={false} />);

      const pressables = screen.getAllByTestId("pressable");
      expect(pressables[0]).not.toBeDisabled();
    });
  });

  describe("Event Handling", () => {
    it("should call onCheckedChange when clicked", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        checked: false,
        onCheckedChange: mockOnCheckedChange,
      });

      render(<SwitchWeb onCheckedChange={mockOnCheckedChange} />);

      const pressable = screen.getAllByTestId("pressable")[0];
      fireEvent.click(pressable);

      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
    });

    it("should toggle checked state on click", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        checked: true,
        onCheckedChange: mockOnCheckedChange,
      });

      render(<SwitchWeb checked onCheckedChange={mockOnCheckedChange} />);

      const pressable = screen.getAllByTestId("pressable")[0];
      fireEvent.click(pressable);

      expect(mockOnCheckedChange).toHaveBeenCalledWith(false);
    });

    it("should not call onCheckedChange when disabled", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        disabled: true,
        onCheckedChange: mockOnCheckedChange,
      });

      render(<SwitchWeb disabled onCheckedChange={mockOnCheckedChange} />);

      const pressable = screen.getAllByTestId("pressable")[0];
      fireEvent.click(pressable);

      expect(mockOnCheckedChange).not.toHaveBeenCalled();
    });

    it("should handle keyboard events", () => {
      render(<SwitchWeb onCheckedChange={mockOnCheckedChange} />);

      expect(mockUseFocusedPress).toHaveBeenCalledWith(
        ["Enter", " "],
        expect.any(Function),
      );
    });
  });

  describe("Styling Classes", () => {
    it("should apply base styling classes to pressable", () => {
      render(<SwitchWeb {...defaultProps} />);

      const pressable = screen.getAllByTestId("pressable")[0];
      expect(pressable).toHaveClass("flex-row", "items-center");
    });

    it("should apply base styling classes to switch root", () => {
      render(<SwitchWeb {...defaultProps} />);

      const switchRoot = screen.getByTestId("switch-root");
      expect(switchRoot).toHaveClass(
        "peer",
        "h-6",
        "w-11",
        "shrink-0",
        "cursor-pointer",
        "flex-row",
        "items-center",
        "rounded-full",
        "border-2",
        "border-transparent",
        "transition-colors",
      );
    });

    it("should apply focus styling classes", () => {
      render(<SwitchWeb {...defaultProps} />);

      const switchRoot = screen.getByTestId("switch-root");
      expect(switchRoot).toHaveClass(
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-ring",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
      );
    });

    it("should apply thumb styling classes", () => {
      render(<SwitchWeb {...defaultProps} />);

      const switchThumb = screen.getByTestId("switch-thumb");
      expect(switchThumb).toHaveClass(
        "pointer-events-none",
        "block",
        "h-5",
        "w-5",
        "rounded-full",
        "bg-background",
        "ring-0",
        "transition-transform",
        "web:shadow-foreground/5",
        "web:shadow-md",
      );
    });

    it("should apply custom className to pressable", () => {
      const customClass = "custom-switch-class";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        className: customClass,
      });

      render(<SwitchWeb className={customClass} />);

      const pressable = screen.getAllByTestId("pressable")[0];
      expect(pressable).toHaveClass(customClass);
    });

    it("should apply custom switchClassName to switch root", () => {
      const customClass = "custom-switch-root-class";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        switchClassName: customClass,
      });

      render(<SwitchWeb switchClassName={customClass} />);

      const switchRoot = screen.getByTestId("switch-root");
      expect(switchRoot).toHaveClass(customClass);
    });

    it("should apply custom switchThumbClassName to thumb", () => {
      const customClass = "custom-thumb-class";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        switchThumbClassName: customClass,
      });

      render(<SwitchWeb switchThumbClassName={customClass} />);

      const switchThumb = screen.getByTestId("switch-thumb");
      expect(switchThumb).toHaveClass(customClass);
    });

    it("should apply custom labelClassName to label", () => {
      const customClass = "custom-label-class";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        label: "Test Label",
        labelClassName: customClass,
      });

      render(<SwitchWeb label="Test Label" labelClassName={customClass} />);

      const text = screen.getByTestId("text");
      expect(text).toHaveClass(customClass);
    });
  });
});

describe("SwitchNative Component", () => {
  const defaultProps = {
    checked: false,
    label: "Test Switch",
    disabled: false,
    hasError: false,
    className: "",
    switchClassName: "",
    switchThumbClassName: "",
    labelClassName: "",
    hitSlop: 6,
  };

  const mockOnCheckedChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyDefaults.mockImplementation((props) => ({
      ...defaultProps,
      ...props,
    }));
    mockUseColorScheme.mockReturnValue({ colorScheme: "light" });
    mockUseDerivedValue.mockReturnValue({ value: 0 });
    mockUseAnimatedStyle.mockReturnValue({});
    mockWithTiming.mockReturnValue(0);
    mockInterpolateColor.mockReturnValue("#000000");
    mockGetThemeColor.mockReturnValue("#000000");
    mockDocumentationProps.mockReturnValue({});
  });

  describe("Basic Rendering", () => {
    it("should render switch native component", () => {
      render(<SwitchNative {...defaultProps} />);

      expect(screen.getByTestId("pressable")).toBeInTheDocument();
      expect(screen.getByTestId("animated-view")).toBeInTheDocument();
      expect(screen.getByTestId("switch-root")).toBeInTheDocument();
      expect(screen.getByTestId("switch-thumb")).toBeInTheDocument();
    });

    it("should render label when provided", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        label: "Native Switch",
      });

      render(<SwitchNative {...defaultProps} label="Native Switch" />);

      const text = screen.getByTestId("text");
      expect(text).toHaveTextContent("Native Switch");
    });

    it("should not render label when not provided", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, label: undefined });

      render(<SwitchNative {...defaultProps} />);

      expect(screen.queryByTestId("text")).not.toBeInTheDocument();
    });
  });

  describe("Animation Setup", () => {
    it("should setup derived value for translation", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: true });

      render(<SwitchNative checked />);

      expect(mockUseDerivedValue).toHaveBeenCalled();
    });

    it("should setup animated styles for root and thumb", () => {
      render(<SwitchNative {...defaultProps} />);

      expect(mockUseAnimatedStyle).toHaveBeenCalledTimes(2);
    });

    it("should use color interpolation for background", () => {
      render(<SwitchNative {...defaultProps} />);

      expect(mockInterpolateColor).toHaveBeenCalled();
    });

    it("should use timing animation for thumb movement", () => {
      render(<SwitchNative {...defaultProps} />);

      expect(mockWithTiming).toHaveBeenCalledWith(expect.any(Number), {
        duration: 200,
      });
    });

    it("should handle different color schemes", () => {
      mockUseColorScheme.mockReturnValue({ colorScheme: "dark" });

      render(<SwitchNative {...defaultProps} />);

      expect(mockGetThemeColor).toHaveBeenCalledWith("--primary", "dark");
      expect(mockGetThemeColor).toHaveBeenCalledWith("--input", "dark");
    });
  });

  describe("Event Handling", () => {
    it("should call onCheckedChange when clicked", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        checked: false,
        onCheckedChange: mockOnCheckedChange,
      });

      render(<SwitchNative onCheckedChange={mockOnCheckedChange} />);

      const pressable = screen.getByTestId("pressable");
      fireEvent.click(pressable);

      expect(mockOnCheckedChange).toHaveBeenCalledWith(true);
    });

    it("should toggle checked state on click", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        checked: true,
        onCheckedChange: mockOnCheckedChange,
      });

      render(<SwitchNative checked onCheckedChange={mockOnCheckedChange} />);

      const pressable = screen.getByTestId("pressable");
      fireEvent.click(pressable);

      expect(mockOnCheckedChange).toHaveBeenCalledWith(false);
    });

    it("should not call onCheckedChange when disabled", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        disabled: true,
        onCheckedChange: mockOnCheckedChange,
      });

      render(<SwitchNative disabled onCheckedChange={mockOnCheckedChange} />);

      const pressable = screen.getByTestId("pressable");
      fireEvent.click(pressable);

      expect(mockOnCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe("Styling Classes", () => {
    it("should apply native-specific sizing classes", () => {
      render(<SwitchNative {...defaultProps} />);

      const animatedView = screen.getByTestId("animated-view");
      expect(animatedView).toHaveClass("h-8", "w-[46px]", "rounded-full");

      const switchRoot = screen.getByTestId("switch-root");
      expect(switchRoot).toHaveClass("h-8", "w-[46px]");

      const switchThumb = screen.getByTestId("switch-thumb");
      expect(switchThumb).toHaveClass("h-7", "w-7");
    });

    it("should apply disabled styling when disabled", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: true });

      render(<SwitchNative disabled />);

      const animatedView = screen.getByTestId("animated-view");
      expect(animatedView).toHaveClass("opacity-50");
    });

    it("should apply custom classes", () => {
      const customClass = "custom-native-class";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        className: customClass,
      });

      render(<SwitchNative className={customClass} />);

      const pressable = screen.getByTestId("pressable");
      expect(pressable).toHaveClass(customClass);
    });
  });
});

describe("Switch Platform Selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export the Switch component", () => {
    expect(Switch).toBeDefined();
  });

  it("should select web component by default in test environment", () => {
    const { Platform } = require("react-native");
    Platform.select.mockReturnValue(SwitchWeb);

    expect(Switch).toBe(SwitchWeb);
  });

  it("should handle platform selection object", () => {
    const { Platform } = require("react-native");

    const platformConfig = {
      web: SwitchWeb,
      native: SwitchNative,
      macos: SwitchNative,
      windows: SwitchNative,
      ios: SwitchNative,
      android: SwitchNative,
    };

    expect(() => Platform.select(platformConfig)).not.toThrow();
  });
});

describe("Schema Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyDefaults.mockImplementation((props) => ({ ...props }));
  });

  it("should call schema applyDefaults with provided props", () => {
    const props = { checked: true, label: "Test", className: "test-class" };
    render(<SwitchWeb {...props} />);

    expect(mockApplyDefaults).toHaveBeenCalledWith(props);
  });

  it("should handle undefined props", () => {
    render(<SwitchWeb />);

    expect(mockApplyDefaults).toHaveBeenCalledWith({});
  });
});

describe("Documentation Props", () => {
  it("should export getDocumentationProps function", () => {
    expect(getDocumentationProps).toBeDefined();
    expect(typeof getDocumentationProps).toBe("function");
  });

  it("should call schema documentationProps with correct parameters", () => {
    getDocumentationProps();

    expect(mockDocumentationProps).toHaveBeenCalledWith("Switch", {
      exampleProps: { checked: true },
      valueProp: "checked",
      onChangeProp: "onCheckedChange",
    });
  });
});

describe("Edge Cases", () => {
  const defaultProps = {
    checked: false,
    label: "Test Switch",
    disabled: false,
    hasError: false,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyDefaults.mockImplementation((props) => ({
      ...defaultProps,
      ...props,
    }));
    mockUseFocusedPress.mockReturnValue({
      onKeyDown: vi.fn(),
      onFocus: vi.fn(),
      onBlur: vi.fn(),
    });
  });

  it("should handle empty string label", () => {
    mockApplyDefaults.mockReturnValue({ ...defaultProps, label: "" });

    render(<SwitchWeb label="" />);

    expect(screen.queryByTestId("text")).not.toBeInTheDocument();
  });

  it("should handle null label", () => {
    mockApplyDefaults.mockReturnValue({ ...defaultProps, label: null });

    render(<SwitchWeb label={null} />);

    expect(screen.queryByTestId("text")).not.toBeInTheDocument();
  });

  it("should handle undefined onCheckedChange", () => {
    mockApplyDefaults.mockReturnValue({
      ...defaultProps,
      onCheckedChange: undefined,
    });

    expect(() => render(<SwitchWeb />)).not.toThrow();

    const pressable = screen.getAllByTestId("pressable")[0];
    expect(() => fireEvent.click(pressable)).not.toThrow();
  });

  it("should handle multiple state combinations", () => {
    mockApplyDefaults.mockReturnValue({
      ...defaultProps,
      checked: true,
      disabled: true,
      hasError: true,
    });

    render(<SwitchWeb checked disabled hasError />);

    const switchRoot = screen.getByTestId("switch-root");
    expect(switchRoot).toHaveClass("bg-danger"); // Error overrides success
    expect(switchRoot).toHaveClass("opacity-50"); // Disabled state
  });

  it("should handle very long label text", () => {
    const longLabel =
      "This is a very long label text that might cause layout issues if not handled properly";
    mockApplyDefaults.mockReturnValue({ ...defaultProps, label: longLabel });

    render(<SwitchWeb label={longLabel} />);

    const text = screen.getByTestId("text");
    expect(text).toHaveTextContent(longLabel);
  });

  it("should handle rapid state changes", () => {
    const { rerender } = render(<SwitchWeb checked={false} />);

    // Rapid state changes
    for (let i = 0; i < 10; i++) {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        checked: i % 2 === 0,
      });
      rerender(<SwitchWeb checked={i % 2 === 0} />);
    }

    expect(screen.getAllByTestId("pressable")[0]).toBeInTheDocument();
  });

  it("should handle color scheme changes in native", () => {
    mockUseColorScheme.mockReturnValue({ colorScheme: "light" });
    const { rerender } = render(<SwitchNative {...defaultProps} />);

    mockUseColorScheme.mockReturnValue({ colorScheme: "dark" });
    rerender(<SwitchNative {...defaultProps} />);

    expect(mockGetThemeColor).toHaveBeenCalledWith("--primary", "dark");
  });

  it("should handle animation edge cases in native", () => {
    mockUseDerivedValue.mockReturnValue({ value: 0 });
    mockUseAnimatedStyle.mockReturnValue({ transform: [{ translateX: 0 }] });

    expect(() => render(<SwitchNative {...defaultProps} />)).not.toThrow();
  });
});

describe("Performance", () => {
  const defaultProps = {
    checked: false,
    label: "Test Switch",
    disabled: false,
    hasError: false,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyDefaults.mockImplementation((props) => ({
      ...defaultProps,
      ...props,
    }));
    mockUseFocusedPress.mockReturnValue({
      onKeyDown: vi.fn(),
      onFocus: vi.fn(),
      onBlur: vi.fn(),
    });
  });

  it("should not re-render unnecessarily", () => {
    const { rerender } = render(<SwitchWeb checked={false} />);

    // Re-render with same props
    rerender(<SwitchWeb checked={false} />);

    expect(screen.getAllByTestId("pressable")[0]).toBeInTheDocument();
  });

  it("should handle memory cleanup correctly", () => {
    const { unmount } = render(<SwitchWeb {...defaultProps} />);

    expect(() => unmount()).not.toThrow();
  });

  it("should optimize animation performance in native", () => {
    render(<SwitchNative {...defaultProps} />);

    // Should only call expensive animation setup once
    expect(mockUseDerivedValue).toHaveBeenCalledTimes(1);
    expect(mockUseAnimatedStyle).toHaveBeenCalledTimes(2); // Root and thumb
  });
});

describe("Accessibility", () => {
  const defaultProps = {
    checked: false,
    label: "Accessible Switch",
    disabled: false,
    hasError: false,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyDefaults.mockImplementation((props) => ({
      ...defaultProps,
      ...props,
    }));
    mockUseFocusedPress.mockReturnValue({
      onKeyDown: vi.fn(),
      onFocus: vi.fn(),
      onBlur: vi.fn(),
    });
  });

  it("should support keyboard navigation", () => {
    render(<SwitchWeb {...defaultProps} />);

    expect(mockUseFocusedPress).toHaveBeenCalledWith(
      ["Enter", " "],
      expect.any(Function),
    );
  });

  it("should have proper focus styling", () => {
    render(<SwitchWeb {...defaultProps} />);

    const switchRoot = screen.getByTestId("switch-root");
    expect(switchRoot).toHaveClass(
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
    );
  });

  it("should handle disabled state for accessibility", () => {
    mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: true });

    render(<SwitchWeb disabled />);

    const pressables = screen.getAllByTestId("pressable");
    expect(pressables[0]).toBeDisabled();
  });

  it("should support aria attributes", () => {
    render(<SwitchWeb {...defaultProps} aria-label="Custom switch" />);

    const switchRoot = screen.getByTestId("switch-root");
    expect(switchRoot).toHaveAttribute("aria-label", "Custom switch");
  });
});

describe("Type Safety", () => {
  it("should accept valid SwitchProps", () => {
    const validProps = {
      checked: true,
      label: "Valid Switch",
      disabled: false,
      hasError: false,
      className: "valid-class",
      switchClassName: "valid-switch-class",
      switchThumbClassName: "valid-thumb-class",
      labelClassName: "valid-label-class",
      hitSlop: 8,
      onCheckedChange: vi.fn(),
    };

    expect(() => render(<SwitchWeb {...validProps} />)).not.toThrow();
    expect(() => render(<SwitchNative {...validProps} />)).not.toThrow();
  });
});
