import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies - must be defined before mocks
const mockApplyDefaults = vi.fn();
const mockDocumentationProps = vi.fn();
const mockUseFocusedPress = vi.fn();
const mockGetThemeColor = vi.fn();

vi.mock("@green-stack/components/Icon", () => {
  const React = require("react");
  return {
    Icon: ({ className, color, name, size }) =>
      React.createElement("div", {
        "data-testid": "icon",
        "data-name": name,
        "data-size": size,
        "data-color": color,
        className,
        children: name,
      }),
  };
});

vi.mock("@green-stack/forms/Checkbox.primitives", () => {
  const React = require("react");
  return {
    CheckboxRoot: React.forwardRef(
      ({ children, className, asChild, ...props }, ref) =>
        React.createElement("div", {
          ref,
          "data-testid": "checkbox-root",
          className,
          "data-as-child": asChild,
          ...props,
          children,
        }),
    ),
    CheckboxIndicator: ({ children, className, asChild }) =>
      React.createElement("div", {
        "data-testid": "checkbox-indicator",
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
      optional: () => ({
        eg: vi.fn(),
      }),
    }),
    number: () => ({
      default: vi.fn(),
    }),
  },
  type: {},
}));

vi.mock("../components/styled", () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
  getThemeColor: mockGetThemeColor,
  Pressable: vi.fn(
    ({ children, className, onPress, disabled, role, ...props }) => (
      <button
        data-testid="pressable"
        className={className}
        onClick={onPress}
        disabled={disabled}
        role={role}
        {...props}
      >
        {children}
      </button>
    ),
  ),
  Text: vi.fn(({ children, className, disabled, id }) => (
    <span
      data-testid="text"
      className={className}
      data-disabled={disabled}
      id={id}
    >
      {children}
    </span>
  )),
  View: vi.fn(({ children, className }) => (
    <div data-testid="view" className={className}>
      {children}
    </div>
  )),
}));

describe("Checkbox", () => {
  const defaultProps = {
    checked: false,
    label: "Test Label",
    disabled: false,
    hasError: false,
    className: "",
    checkboxClassName: "",
    indicatorClassName: "",
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
    mockGetThemeColor.mockReturnValue("#ffffff");
    mockDocumentationProps.mockReturnValue({});
  });

  describe("Basic Rendering", () => {
    it("should render checkbox component", () => {
      render(<Checkbox />);

      expect(screen.getByTestId("pressable")).toBeInTheDocument();
      expect(screen.getByTestId("checkbox-root")).toBeInTheDocument();
      expect(screen.getByTestId("checkbox-indicator")).toBeInTheDocument();
    });

    it("should apply default props through schema", () => {
      const customProps = { checked: true, label: "Custom Label" };
      render(<Checkbox {...customProps} />);

      expect(mockApplyDefaults).toHaveBeenCalledWith(customProps);
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Checkbox ref={ref} />);

      expect(ref.current).toBeTruthy();
    });

    it("should render label when provided", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        label: "Test Label",
      });

      render(<Checkbox label="Test Label" />);

      const text = screen.getByTestId("text");
      expect(text).toHaveTextContent("Test Label");
    });

    it("should not render label when not provided", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, label: undefined });

      render(<Checkbox />);

      expect(screen.queryByTestId("text")).not.toBeInTheDocument();
    });
  });

  describe("Checked State", () => {
    it("should render check icon when checked", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: true });

      render(<Checkbox checked />);

      const icon = screen.getByTestId("icon");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("data-name", "CheckFilled");
      expect(icon).toHaveAttribute("data-size", "12");
    });

    it("should not render check icon when unchecked", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: false });

      render(<Checkbox checked={false} />);

      expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
    });

    it("should apply checked styling to checkbox root", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: true });

      render(<Checkbox checked />);

      const checkboxRoot = screen.getByTestId("checkbox-root");
      expect(checkboxRoot).toHaveClass("bg-primary");
    });

    it("should not apply checked styling when unchecked", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: false });

      render(<Checkbox checked={false} />);

      const checkboxRoot = screen.getByTestId("checkbox-root");
      expect(checkboxRoot).not.toHaveClass("bg-primary");
    });
  });

  describe("Error State", () => {
    it("should apply error styling when hasError is true", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, hasError: true });

      render(<Checkbox hasError />);

      const checkboxRoot = screen.getByTestId("checkbox-root");
      expect(checkboxRoot).toHaveClass("border", "border-danger");
    });

    it("should apply error styling to checked checkbox", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        checked: true,
        hasError: true,
      });

      render(<Checkbox checked hasError />);

      const checkboxRoot = screen.getByTestId("checkbox-root");
      expect(checkboxRoot).toHaveClass("bg-danger");
    });

    it("should apply error styling to check icon", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        checked: true,
        hasError: true,
      });

      render(<Checkbox checked hasError />);

      const icon = screen.getByTestId("icon");
      expect(icon).toHaveClass("text-red-500");
    });

    it("should not apply error styling when hasError is false", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, hasError: false });

      render(<Checkbox hasError={false} />);

      const checkboxRoot = screen.getByTestId("checkbox-root");
      expect(checkboxRoot).not.toHaveClass("border-danger");
    });
  });

  describe("Disabled State", () => {
    it("should apply disabled styling when disabled", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: true });

      render(<Checkbox disabled />);

      const pressable = screen.getByTestId("pressable");
      expect(pressable).toHaveClass("cursor-not-allowed", "opacity-50");
      expect(pressable).toBeDisabled();
    });

    it("should apply disabled styling to checkbox root", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: true });

      render(<Checkbox disabled />);

      const checkboxRoot = screen.getByTestId("checkbox-root");
      expect(checkboxRoot).toHaveClass(
        "cursor-not-allowed",
        "border",
        "border-muted",
        "opacity-50",
      );
    });

    it("should disable text when checkbox is disabled", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        disabled: true,
        label: "Disabled Label",
      });

      render(<Checkbox disabled label="Disabled Label" />);

      const text = screen.getByTestId("text");
      expect(text).toHaveAttribute("data-disabled", "true");
    });

    it("should not apply disabled styling when enabled", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: false });

      render(<Checkbox disabled={false} />);

      const pressable = screen.getByTestId("pressable");
      expect(pressable).not.toHaveClass("cursor-not-allowed");
      expect(pressable).not.toBeDisabled();
    });
  });

  describe("Event Handling", () => {
    it("should call onCheckedChange when clicked", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        checked: false,
        onCheckedChange: mockOnCheckedChange,
      });

      render(<Checkbox onCheckedChange={mockOnCheckedChange} />);

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

      render(<Checkbox checked onCheckedChange={mockOnCheckedChange} />);

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

      render(<Checkbox disabled onCheckedChange={mockOnCheckedChange} />);

      const pressable = screen.getByTestId("pressable");
      fireEvent.click(pressable);

      expect(mockOnCheckedChange).not.toHaveBeenCalled();
    });

    it("should handle keyboard events", () => {
      const mockKeyHandler = vi.fn();
      mockUseFocusedPress.mockReturnValue({
        onKeyDown: mockKeyHandler,
        onFocus: vi.fn(),
        onBlur: vi.fn(),
      });

      render(<Checkbox onCheckedChange={mockOnCheckedChange} />);

      expect(mockUseFocusedPress).toHaveBeenCalledWith(
        ["Enter", " "],
        expect.any(Function),
      );
    });
  });

  describe("Styling Classes", () => {
    it("should apply base styling classes to pressable", () => {
      render(<Checkbox />);

      const pressable = screen.getByTestId("pressable");
      expect(pressable).toHaveClass("flex", "flex-row", "items-center");
    });

    it("should apply base styling classes to checkbox root", () => {
      render(<Checkbox />);

      const checkboxRoot = screen.getByTestId("checkbox-root");
      expect(checkboxRoot).toHaveClass(
        "h-4",
        "w-4",
        "shrink-0",
        "rounded-sm",
        "border",
        "border-primary",
      );
    });

    it("should apply native platform classes", () => {
      render(<Checkbox />);

      const checkboxRoot = screen.getByTestId("checkbox-root");
      expect(checkboxRoot).toHaveClass(
        "native:h-[20]",
        "native:w-[20]",
        "native:rounded",
      );
    });

    it("should apply web platform classes", () => {
      render(<Checkbox />);

      const checkboxRoot = screen.getByTestId("checkbox-root");
      expect(checkboxRoot).toHaveClass(
        "web:peer",
        "web:ring-offset-background",
        "web:focus-visible:outline-none",
        "web:focus-visible:ring-2",
        "web:focus-visible:ring-ring",
        "web:focus-visible:ring-offset-2",
      );
    });

    it("should apply custom className to pressable", () => {
      const customClass = "custom-checkbox-class";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        className: customClass,
      });

      render(<Checkbox className={customClass} />);

      const pressable = screen.getByTestId("pressable");
      expect(pressable).toHaveClass(customClass);
    });

    it("should apply custom checkboxClassName to checkbox root", () => {
      const customClass = "custom-checkbox-root-class";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        checkboxClassName: customClass,
      });

      render(<Checkbox checkboxClassName={customClass} />);

      const checkboxRoot = screen.getByTestId("checkbox-root");
      expect(checkboxRoot).toHaveClass(customClass);
    });

    it("should apply custom labelClassName to label", () => {
      const customClass = "custom-label-class";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        label: "Test Label",
        labelClassName: customClass,
      });

      render(<Checkbox label="Test Label" labelClassName={customClass} />);

      const text = screen.getByTestId("text");
      expect(text).toHaveClass(customClass);
    });

    it("should apply custom indicatorClassName to indicator", () => {
      const customClass = "custom-indicator-class";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        indicatorClassName: customClass,
      });

      render(<Checkbox indicatorClassName={customClass} />);

      const indicator = screen.getByTestId("checkbox-indicator");
      expect(indicator).toHaveClass(customClass);
    });
  });

  describe("Accessibility", () => {
    it("should have proper role attribute", () => {
      render(<Checkbox />);

      const pressable = screen.getByTestId("pressable");
      expect(pressable).toHaveAttribute("role", "checkbox");
    });

    it("should generate labelledby ID from nativeID", () => {
      const nativeID = "test-checkbox";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        id: nativeID,
        label: "Test Label",
      });

      render(<Checkbox id={nativeID} label="Test Label" />);

      const pressable = screen.getByTestId("pressable");
      const text = screen.getByTestId("text");

      expect(pressable).toHaveAttribute("aria-labelledby", `${nativeID}-label`);
      expect(text).toHaveAttribute("id", `${nativeID}-label`);
    });

    it("should use provided aria-labelledby", () => {
      const customLabelledBy = "custom-label-id";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        "aria-labelledby": customLabelledBy,
        label: "Test Label",
      });

      render(
        <Checkbox aria-labelledby={customLabelledBy} label="Test Label" />,
      );

      const pressable = screen.getByTestId("pressable");
      const text = screen.getByTestId("text");

      expect(pressable).toHaveAttribute("aria-labelledby", customLabelledBy);
      expect(text).toHaveAttribute("id", customLabelledBy);
    });

    it("should set focusable to false on pressable", () => {
      render(<Checkbox />);

      const pressable = screen.getByTestId("pressable");
      expect(pressable).toHaveAttribute("focusable", "false");
    });

    it("should handle hitSlop prop", () => {
      const hitSlop = 12;
      mockApplyDefaults.mockReturnValue({ ...defaultProps, hitSlop });

      render(<Checkbox hitSlop={hitSlop} />);

      const pressable = screen.getByTestId("pressable");
      const checkboxRoot = screen.getByTestId("checkbox-root");

      expect(pressable).toHaveAttribute("hitSlop", hitSlop.toString());
      expect(checkboxRoot).toHaveAttribute("hitSlop", hitSlop.toString());
    });
  });

  describe("Icon Integration", () => {
    it("should pass correct props to Icon component", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: true });

      render(<Checkbox checked />);

      const icon = screen.getByTestId("icon");
      expect(icon).toHaveAttribute("data-name", "CheckFilled");
      expect(icon).toHaveAttribute("data-size", "12");
      expect(icon).toHaveAttribute("data-color", "#ffffff");
    });

    it("should apply theme color to icon", () => {
      const themeColor = "#custom-color";
      mockGetThemeColor.mockReturnValue(themeColor);
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: true });

      render(<Checkbox checked />);

      expect(mockGetThemeColor).toHaveBeenCalledWith("--primary-foreground");
      const icon = screen.getByTestId("icon");
      expect(icon).toHaveAttribute("data-color", themeColor);
    });

    it("should apply correct icon styling classes", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, checked: true });

      render(<Checkbox checked />);

      const icon = screen.getByTestId("icon");
      expect(icon).toHaveClass("text-primary-foreground");
    });
  });

  describe("Schema Integration", () => {
    it("should call schema applyDefaults with provided props", () => {
      const props = { checked: true, label: "Test", className: "test-class" };
      render(<Checkbox {...props} />);

      expect(mockApplyDefaults).toHaveBeenCalledWith(props);
    });

    it("should handle undefined props", () => {
      render(<Checkbox />);

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

      expect(mockDocumentationProps).toHaveBeenCalledWith("Checkbox", {
        valueProp: "checked",
        onChangeProp: "onCheckedChange",
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string label", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, label: "" });

      render(<Checkbox label="" />);

      expect(screen.queryByTestId("text")).not.toBeInTheDocument();
    });

    it("should handle null label", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, label: null });

      render(<Checkbox label={null} />);

      expect(screen.queryByTestId("text")).not.toBeInTheDocument();
    });

    it("should handle undefined onCheckedChange", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        onCheckedChange: undefined,
      });

      expect(() => render(<Checkbox />)).not.toThrow();

      const pressable = screen.getByTestId("pressable");
      expect(() => fireEvent.click(pressable)).not.toThrow();
    });

    it("should handle multiple state combinations", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        checked: true,
        disabled: true,
        hasError: true,
      });

      render(<Checkbox checked disabled hasError />);

      const checkboxRoot = screen.getByTestId("checkbox-root");
      expect(checkboxRoot).toHaveClass("bg-danger"); // Error overrides primary
      expect(checkboxRoot).toHaveClass("cursor-not-allowed");
      expect(checkboxRoot).toHaveClass("opacity-50");
    });

    it("should handle very long label text", () => {
      const longLabel =
        "This is a very long label text that might cause layout issues if not handled properly";
      mockApplyDefaults.mockReturnValue({ ...defaultProps, label: longLabel });

      render(<Checkbox label={longLabel} />);

      const text = screen.getByTestId("text");
      expect(text).toHaveTextContent(longLabel);
    });
  });

  describe("Performance", () => {
    it("should not re-render unnecessarily", () => {
      const { rerender } = render(<Checkbox checked={false} />);

      // Re-render with same props
      rerender(<Checkbox checked={false} />);

      expect(screen.getByTestId("pressable")).toBeInTheDocument();
    });

    it("should handle rapid state changes", () => {
      const { rerender } = render(<Checkbox checked={false} />);

      // Rapid state changes
      for (let i = 0; i < 10; i++) {
        mockApplyDefaults.mockReturnValue({
          ...defaultProps,
          checked: i % 2 === 0,
        });
        rerender(<Checkbox checked={i % 2 === 0} />);
      }

      expect(screen.getByTestId("pressable")).toBeInTheDocument();
    });
  });

  describe("Type Safety", () => {
    it("should accept valid CheckboxProps", () => {
      const validProps = {
        checked: true,
        label: "Valid Label",
        disabled: false,
        hasError: false,
        className: "valid-class",
        checkboxClassName: "valid-checkbox-class",
        indicatorClassName: "valid-indicator-class",
        labelClassName: "valid-label-class",
        hitSlop: 8,
      };

      expect(() => render(<Checkbox {...validProps} />)).not.toThrow();
    });
  });
});
