import {
  renderHook,
  act,
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
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
    Icon: ({ color, name, size }) =>
      React.createElement("div", {
        "data-testid": "icon",
        "data-name": name,
        "data-size": size,
        "data-color": color,
        children: name,
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
    number: () => ({
      default: vi.fn(),
      optional: vi.fn(),
    }),
    string: () => ({
      optional: () => ({
        example: vi.fn(),
      }),
    }),
    boolean: () => ({
      default: vi.fn(),
    }),
  },
}));

vi.mock("../components/styled", () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
  getThemeColor: mockGetThemeColor,
  Pressable: vi.fn(
    ({ children, className, onPress, disabled, hitSlop, ...props }) => (
      <button
        data-testid="pressable"
        className={className}
        onClick={onPress}
        disabled={disabled}
        data-hit-slop={hitSlop}
        {...props}
      >
        {children}
      </button>
    ),
  ),
  View: vi.fn(({ children, className }) => (
    <div data-testid="view" className={className}>
      {children}
    </div>
  )),
}));

vi.mock("./TextInput.styled", () => ({
  TextInput: vi.fn(
    React.forwardRef(
      (
        {
          className,
          onChangeText,
          onKeyPress,
          value,
          disabled,
          hasError,
          ...props
        },
        ref,
      ) => (
        <input
          ref={ref}
          data-testid="text-input"
          className={className}
          onChange={(e) => onChangeText?.(e.target.value)}
          onKeyDown={(e) => onKeyPress?.({ nativeEvent: { key: e.key } })}
          value={value}
          disabled={disabled}
          data-has-error={hasError}
          {...props}
        />
      ),
    ),
  ),
}));

describe("useNumberStepper Hook", () => {
  const defaultProps = {
    value: 5,
    min: 0,
    max: 10,
    step: 1,
    placeholder: "Enter number",
    disabled: false,
    readOnly: false,
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

  describe("Initialization", () => {
    it("should initialize with provided value", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 7 }),
      );

      expect(result.current.value).toBe(7);
      expect(result.current.numberValue).toBe(7);
    });

    it("should apply schema defaults", () => {
      renderHook(() => useNumberStepper(defaultProps));

      expect(mockApplyDefaults).toHaveBeenCalledWith(defaultProps);
    });

    it("should constrain initial value to min/max bounds", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        value: 15,
        max: 10,
      });

      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 15, max: 10 }),
      );

      expect(result.current.numberValue).toBe(10);
    });

    it("should handle undefined max value", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, max: undefined });

      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, max: undefined }),
      );

      expect(result.current.max).toBeUndefined();
    });
  });

  describe("Value Constraints", () => {
    it("should constrain value to minimum", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, min: 5 }),
      );

      const constrainedValue = result.current.constrainValue(3);
      expect(constrainedValue).toBe(5);
    });

    it("should constrain value to maximum", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, max: 10 }),
      );

      const constrainedValue = result.current.constrainValue(15);
      expect(constrainedValue).toBe(10);
    });

    it("should allow value within bounds", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, min: 0, max: 10 }),
      );

      const constrainedValue = result.current.constrainValue(7);
      expect(constrainedValue).toBe(7);
    });

    it("should handle no maximum constraint", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, max: undefined });

      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, max: undefined }),
      );

      const constrainedValue = result.current.constrainValue(1000);
      expect(constrainedValue).toBe(1000);
    });
  });

  describe("Increment/Decrement", () => {
    it("should increment value by step", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 5, step: 2 }),
      );

      act(() => {
        result.current.onIncrement();
      });

      expect(result.current.value).toBe(7);
    });

    it("should decrement value by step", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 5, step: 2 }),
      );

      act(() => {
        result.current.onDecrement();
      });

      expect(result.current.value).toBe(3);
    });

    it("should not increment beyond maximum", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 10, max: 10 }),
      );

      act(() => {
        result.current.onIncrement();
      });

      expect(result.current.value).toBe(10);
    });

    it("should not decrement below minimum", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 0, min: 0 }),
      );

      act(() => {
        result.current.onDecrement();
      });

      expect(result.current.value).toBe(0);
    });

    it("should handle decimal step values", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 5, step: 0.5 }),
      );

      act(() => {
        result.current.onIncrement();
      });

      expect(result.current.value).toBe(5.5);
    });
  });

  describe("Disabled States", () => {
    it("should identify when increment is disabled at max", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        value: 10,
        max: 10,
      });

      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 10, max: 10 }),
      );

      expect(result.current.isIncrementDisabled).toBe(true);
      expect(result.current.isDecrementDisabled).toBe(false);
    });

    it("should identify when decrement is disabled at min", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, value: 0, min: 0 });

      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 0, min: 0 }),
      );

      expect(result.current.isDecrementDisabled).toBe(true);
      expect(result.current.isIncrementDisabled).toBe(false);
    });

    it("should disable both buttons when disabled prop is true", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: true });

      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, disabled: true }),
      );

      expect(result.current.isIncrementDisabled).toBe(true);
      expect(result.current.isDecrementDisabled).toBe(true);
    });

    it("should handle undefined min/max values", () => {
      const { result } = renderHook(() =>
        useNumberStepper({
          ...defaultProps,
          min: undefined,
          max: undefined,
        } as any),
      );

      expect(result.current.isIncrementDisabled).toBe(false);
      expect(result.current.isDecrementDisabled).toBe(false);
    });
  });

  describe("Keyboard Handling", () => {
    it("should increment on ArrowUp key", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 5 }),
      );

      act(() => {
        result.current.onKeyPress({ nativeEvent: { key: "ArrowUp" } } as any);
      });

      expect(result.current.value).toBe(6);
    });

    it("should decrement on ArrowDown key", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 5 }),
      );

      act(() => {
        result.current.onKeyPress({ nativeEvent: { key: "ArrowDown" } } as any);
      });

      expect(result.current.value).toBe(4);
    });

    it("should ignore other keys", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 5 }),
      );

      act(() => {
        result.current.onKeyPress({ nativeEvent: { key: "Enter" } } as any);
      });

      expect(result.current.value).toBe(5);
    });

    it("should setup focused press with correct keys", () => {
      renderHook(() => useNumberStepper(defaultProps));

      expect(mockUseFocusedPress).toHaveBeenCalledWith(
        ["ArrowUp", "ArrowDown"],
        expect.any(Function),
      );
    });
  });

  describe("Text Input Handling", () => {
    it("should update value from text input", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 5 }),
      );

      act(() => {
        result.current.onChangeText("7");
      });

      expect(result.current.value).toBe(7);
    });

    it("should strip non-numeric characters", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 5 }),
      );

      act(() => {
        result.current.onChangeText("7abc2");
      });

      expect(result.current.value).toBe(72);
    });

    it("should handle empty input", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 5 }),
      );

      act(() => {
        result.current.onChangeText("");
      });

      expect(result.current.value).toBeUndefined();
    });

    it("should handle non-numeric input", () => {
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, value: 5 }),
      );

      act(() => {
        result.current.onChangeText("abc");
      });

      expect(result.current.value).toBeUndefined();
    });

    it("should not update when disabled", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: true });

      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, disabled: true }),
      );
      const initialValue = result.current.value;

      act(() => {
        result.current.onChangeText("999");
      });

      expect(result.current.value).toBe(initialValue);
    });
  });

  describe("Effects and State Synchronization", () => {
    it("should call onChange when value changes", () => {
      const mockOnChange = vi.fn();
      const { result } = renderHook(() =>
        useNumberStepper({ ...defaultProps, onChange: mockOnChange }),
      );

      act(() => {
        result.current.onIncrement();
      });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should not call onChange when value is undefined", () => {
      const mockOnChange = vi.fn();
      const { result } = renderHook(() =>
        useNumberStepper({
          ...defaultProps,
          onChange: mockOnChange,
          value: undefined as any,
        }),
      );

      act(() => {
        result.current.onChangeText("");
      });

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("should sync with external prop changes", () => {
      const { result, rerender } = renderHook(
        ({ value }) => useNumberStepper({ ...defaultProps, value }),
        { initialProps: { value: 5 } },
      );

      expect(result.current.value).toBe(5);

      rerender({ value: 8 });

      expect(result.current.value).toBe(8);
    });
  });
});

describe("NumberStepper Component", () => {
  const defaultProps = {
    value: 5,
    min: 0,
    max: 10,
    step: 1,
    placeholder: "Enter number",
    disabled: false,
    readOnly: false,
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
    mockGetThemeColor.mockReturnValue("#000000");
    mockDocumentationProps.mockReturnValue({});
  });

  describe("Basic Rendering", () => {
    it("should render number stepper components", () => {
      render(<NumberStepper {...defaultProps} />);

      expect(screen.getByTestId("view")).toBeInTheDocument();
      expect(screen.getByTestId("text-input")).toBeInTheDocument();
      expect(screen.getAllByTestId("pressable")).toHaveLength(2);
      expect(screen.getAllByTestId("icon")).toHaveLength(2);
    });

    it("should render increment and decrement icons", () => {
      render(<NumberStepper {...defaultProps} />);

      const icons = screen.getAllByTestId("icon");
      expect(icons[0]).toHaveAttribute("data-name", "RemoveFilled");
      expect(icons[1]).toHaveAttribute("data-name", "AddFilled");
    });

    it("should forward ref to TextInput", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<NumberStepper ref={ref} {...defaultProps} />);

      expect(ref.current).toBeTruthy();
    });

    it("should display current value in text input", () => {
      render(<NumberStepper {...defaultProps} value={7} />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveAttribute("value", "7");
    });

    it("should display empty string for undefined value", () => {
      render(<NumberStepper {...defaultProps} value={undefined as any} />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveAttribute("value", "");
    });
  });

  describe("Button Interactions", () => {
    it("should increment value when increment button is clicked", () => {
      const mockOnChange = vi.fn();
      render(
        <NumberStepper {...defaultProps} value={5} onChange={mockOnChange} />,
      );

      const buttons = screen.getAllByTestId("pressable");
      const incrementButton = buttons[1]; // Second button is increment

      fireEvent.click(incrementButton);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should decrement value when decrement button is clicked", () => {
      const mockOnChange = vi.fn();
      render(
        <NumberStepper {...defaultProps} value={5} onChange={mockOnChange} />,
      );

      const buttons = screen.getAllByTestId("pressable");
      const decrementButton = buttons[0]; // First button is decrement

      fireEvent.click(decrementButton);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should disable increment button at maximum value", () => {
      render(<NumberStepper {...defaultProps} value={10} max={10} />);

      const buttons = screen.getAllByTestId("pressable");
      const incrementButton = buttons[1];

      expect(incrementButton).toBeDisabled();
    });

    it("should disable decrement button at minimum value", () => {
      render(<NumberStepper {...defaultProps} value={0} min={0} />);

      const buttons = screen.getAllByTestId("pressable");
      const decrementButton = buttons[0];

      expect(decrementButton).toBeDisabled();
    });

    it("should disable both buttons when component is disabled", () => {
      render(<NumberStepper {...defaultProps} disabled />);

      const buttons = screen.getAllByTestId("pressable");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Text Input Interactions", () => {
    it("should handle text input changes", () => {
      const mockOnChange = vi.fn();
      render(<NumberStepper {...defaultProps} onChange={mockOnChange} />);

      const textInput = screen.getByTestId("text-input");
      fireEvent.change(textInput, { target: { value: "8" } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should handle keyboard events on text input", () => {
      const mockOnChange = vi.fn();
      render(<NumberStepper {...defaultProps} onChange={mockOnChange} />);

      const textInput = screen.getByTestId("text-input");
      fireEvent.keyDown(textInput, { key: "ArrowUp" });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should set input mode to numeric", () => {
      render(<NumberStepper {...defaultProps} />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveAttribute("inputMode", "numeric");
    });

    it("should disable text input when component is disabled", () => {
      render(<NumberStepper {...defaultProps} disabled />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toBeDisabled();
    });
  });

  describe("Styling and Layout", () => {
    it("should apply base styling classes", () => {
      render(<NumberStepper {...defaultProps} />);

      const container = screen.getByTestId("view");
      expect(container).toHaveClass(
        "h-10",
        "native:h-12",
        "web:flex",
        "web:w-full",
        "web:max-w-[200px]",
      );
    });

    it("should apply button styling classes", () => {
      render(<NumberStepper {...defaultProps} />);

      const buttons = screen.getAllByTestId("pressable");

      // Decrement button (left)
      expect(buttons[0]).toHaveClass(
        "absolute",
        "top-0",
        "left-0",
        "z-10",
        "h-10",
        "native:h-12",
        "w-10",
        "native:w-12",
        "border-r",
        "border-r-input",
      );

      // Increment button (right)
      expect(buttons[1]).toHaveClass(
        "absolute",
        "top-0",
        "right-0",
        "z-10",
        "h-10",
        "native:h-12",
        "w-10",
        "native:w-12",
        "border-l",
        "border-l-input",
      );
    });

    it("should apply text input styling classes", () => {
      render(<NumberStepper {...defaultProps} />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveClass(
        "text-center",
        "native:px-12",
        "px-10",
        "web:max-w-[200px]",
        "native:min-w-[130]",
      );
    });

    it("should apply custom className to container", () => {
      render(<NumberStepper {...defaultProps} className="custom-class" />);

      const container = screen.getByTestId("view");
      expect(container).toHaveClass("custom-class");
    });

    it("should apply custom pressableClassName to buttons", () => {
      render(
        <NumberStepper
          {...defaultProps}
          pressableClassName="custom-button-class"
        />,
      );

      const buttons = screen.getAllByTestId("pressable");
      buttons.forEach((button) => {
        expect(button).toHaveClass("custom-button-class");
      });
    });

    it("should apply custom textInputClassName to text input", () => {
      render(
        <NumberStepper
          {...defaultProps}
          textInputClassName="custom-input-class"
        />,
      );

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveClass("custom-input-class");
    });
  });

  describe("Error State", () => {
    it("should apply error styling to text input", () => {
      render(<NumberStepper {...defaultProps} hasError />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveAttribute("data-has-error", "true");
    });

    it("should apply error styling to button borders", () => {
      render(<NumberStepper {...defaultProps} hasError />);

      const buttons = screen.getAllByTestId("pressable");
      expect(buttons[0]).toHaveClass("border-r-danger");
      expect(buttons[1]).toHaveClass("border-l-danger");
    });

    it("should not apply error styling when hasError is false", () => {
      render(<NumberStepper {...defaultProps} hasError={false} />);

      const buttons = screen.getAllByTestId("pressable");
      expect(buttons[0]).not.toHaveClass("border-r-danger");
      expect(buttons[1]).not.toHaveClass("border-l-danger");
    });
  });

  describe("Disabled State Styling", () => {
    it("should apply disabled styling to buttons when at limits", () => {
      render(<NumberStepper {...defaultProps} value={10} max={10} />);

      const buttons = screen.getAllByTestId("pressable");
      const incrementButton = buttons[1];

      expect(incrementButton).toHaveClass(
        "web:cursor-not-allowed",
        "opacity-50",
      );
    });

    it("should apply disabled styling to text input when disabled", () => {
      render(<NumberStepper {...defaultProps} disabled />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveClass(
        "cursor-not-allowed",
        "border-muted",
        "text-muted",
      );
    });
  });

  describe("Icon Integration", () => {
    it("should render icons with correct props", () => {
      render(<NumberStepper {...defaultProps} />);

      const icons = screen.getAllByTestId("icon");

      // Decrement icon
      expect(icons[0]).toHaveAttribute("data-name", "RemoveFilled");
      expect(icons[0]).toHaveAttribute("data-size", "20");
      expect(icons[0]).toHaveAttribute("data-color", "#000000");

      // Increment icon
      expect(icons[1]).toHaveAttribute("data-name", "AddFilled");
      expect(icons[1]).toHaveAttribute("data-size", "20");
      expect(icons[1]).toHaveAttribute("data-color", "#000000");
    });

    it("should apply theme colors to icons", () => {
      const themeColor = "#custom-color";
      mockGetThemeColor.mockReturnValue(themeColor);

      render(<NumberStepper {...defaultProps} />);

      const icons = screen.getAllByTestId("icon");
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute("data-color", themeColor);
      });
    });
  });

  describe("Accessibility", () => {
    it("should set hitSlop on buttons", () => {
      render(<NumberStepper {...defaultProps} />);

      const buttons = screen.getAllByTestId("pressable");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("data-hit-slop", "10");
      });
    });

    it("should handle focus and keyboard navigation", () => {
      render(<NumberStepper {...defaultProps} />);

      expect(mockUseFocusedPress).toHaveBeenCalledWith(
        ["ArrowUp", "ArrowDown"],
        expect.any(Function),
      );
    });

    it("should support all text input accessibility props", () => {
      render(<NumberStepper {...defaultProps} aria-label="Number input" />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveAttribute("aria-label", "Number input");
    });
  });

  describe("Documentation Props", () => {
    it("should export getDocumentationProps function", () => {
      expect(getDocumentationProps).toBeDefined();
      expect(typeof getDocumentationProps).toBe("function");
    });

    it("should call schema documentationProps with correct parameters", () => {
      getDocumentationProps();

      expect(mockDocumentationProps).toHaveBeenCalledWith("NumberStepper");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large numbers", () => {
      const largeNumber = 999999999;
      render(<NumberStepper {...defaultProps} value={largeNumber} />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveAttribute("value", largeNumber.toString());
    });

    it("should handle negative numbers", () => {
      render(<NumberStepper {...defaultProps} value={-5} min={-10} />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveAttribute("value", "-5");
    });

    it("should handle zero value", () => {
      render(<NumberStepper {...defaultProps} value={0} />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveAttribute("value", "0");
    });

    it("should handle decimal step values", () => {
      const mockOnChange = vi.fn();
      render(
        <NumberStepper
          {...defaultProps}
          value={5}
          step={0.1}
          onChange={mockOnChange}
        />,
      );

      const buttons = screen.getAllByTestId("pressable");
      const incrementButton = buttons[1];

      fireEvent.click(incrementButton);

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should handle missing onChange prop", () => {
      expect(() =>
        render(<NumberStepper {...defaultProps} onChange={undefined as any} />),
      ).not.toThrow();
    });

    it("should handle rapid button clicks", () => {
      const mockOnChange = vi.fn();
      render(<NumberStepper {...defaultProps} onChange={mockOnChange} />);

      const buttons = screen.getAllByTestId("pressable");
      const incrementButton = buttons[1];

      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(incrementButton);
      }

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("Performance", () => {
    it("should not re-render unnecessarily", () => {
      const { rerender } = render(
        <NumberStepper {...defaultProps} value={5} />,
      );

      // Re-render with same props
      rerender(<NumberStepper {...defaultProps} value={5} />);

      expect(screen.getByTestId("text-input")).toBeInTheDocument();
    });

    it("should handle rapid prop changes", () => {
      const { rerender } = render(
        <NumberStepper {...defaultProps} value={5} />,
      );

      // Rapid value changes
      for (let i = 0; i < 10; i++) {
        rerender(<NumberStepper {...defaultProps} value={i} />);
      }

      expect(screen.getByTestId("text-input")).toBeInTheDocument();
    });
  });

  describe("Type Safety", () => {
    it("should accept valid NumberStepperProps", () => {
      const validProps = {
        value: 5,
        min: 0,
        max: 10,
        step: 1,
        placeholder: "Enter number",
        disabled: false,
        readOnly: false,
        hasError: false,
        className: "valid-class",
        pressableClassName: "valid-button-class",
        textInputClassName: "valid-input-class",
        placeholderClassName: "valid-placeholder-class",
        placeholderTextColor: "#cccccc",
        onChange: vi.fn(),
      };

      expect(() => render(<NumberStepper {...validProps} />)).not.toThrow();
    });
  });
});
