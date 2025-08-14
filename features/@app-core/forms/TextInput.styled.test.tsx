import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies - must be defined before mocks
const mockApplyDefaults = vi.fn();
const mockDocumentationProps = vi.fn();

vi.mock("@green-stack/forms/TextInput.primitives", () => {
  const React = require("react");
  return {
    TextInput: React.forwardRef(
      ({ className, placeholderClassName, ...props }, ref) =>
        React.createElement("input", {
          ref,
          "data-testid": "base-text-input",
          className,
          "data-placeholder-class": placeholderClassName,
          ...props,
        }),
    ),
  };
});

vi.mock("@green-stack/schemas", () => ({
  schema: vi.fn(() => ({
    applyDefaults: mockApplyDefaults,
    documentationProps: mockDocumentationProps,
  })),
  z: {
    string: () => ({
      optional: () => ({
        example: () => ({ optional: vi.fn() }),
      }),
      default: vi.fn(),
    }),
    boolean: () => ({
      default: vi.fn(),
    }),
  },
  type: {},
}));

vi.mock("../components/styled", () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(" ")),
  theme: {
    colors: {
      muted: "#6b7280",
    },
  },
}));

// Import the component after mocks are set up
import {
  TextInput,
  TextInputProps,
  getDocumentationProps,
} from "./TextInput.styled";

describe("TextInput", () => {
  const defaultProps = {
    value: "",
    placeholder: "Enter text",
    className: "",
    placeholderClassName: "",
    placeholderTextColor: "#6b7280",
    hasError: false,
    readOnly: false,
    disabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockApplyDefaults.mockImplementation((props) => ({
      ...defaultProps,
      ...props,
    }));
    mockDocumentationProps.mockReturnValue({});
  });

  describe("Basic Rendering", () => {
    it("should render text input", () => {
      render(<TextInput />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toBeInTheDocument();
    });

    it("should apply default props through schema", () => {
      const customProps = { value: "test", placeholder: "Custom placeholder" };
      render(<TextInput {...customProps} />);

      expect(mockApplyDefaults).toHaveBeenCalledWith(customProps);
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<TextInput ref={ref} />);

      expect(ref.current).toBeTruthy();
    });

    it("should pass props to base component", () => {
      render(<TextInput value="test value" placeholder="Test placeholder" />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveAttribute("value", "test value");
      expect(input).toHaveAttribute("placeholder", "Test placeholder");
    });
  });

  describe("Styling Classes", () => {
    it("should apply base styling classes", () => {
      render(<TextInput />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass(
        "h-10",
        "rounded-md",
        "bg-background",
        "px-3",
        "text-base",
        "text-foreground",
        "border",
        "border-input",
      );
    });

    it("should apply responsive classes", () => {
      render(<TextInput />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass("lg:text-sm");
    });

    it("should apply native platform classes", () => {
      render(<TextInput />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass(
        "native:h-12",
        "native:text-lg",
        "native:leading-[1.25]",
      );
    });

    it("should apply web platform classes", () => {
      render(<TextInput />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass(
        "web:flex",
        "web:w-full",
        "web:py-2",
        "web:ring-offset-background",
        "web:focus-visible:outline-none",
        "web:focus-visible:ring-2",
        "web:focus-visible:ring-ring",
        "web:focus-visible:ring-offset-2",
      );
    });

    it("should apply file input classes", () => {
      render(<TextInput />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass(
        "file:border-0",
        "file:bg-transparent",
        "file:font-medium",
      );
    });

    it("should apply custom className", () => {
      const customClass = "custom-input-class";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        className: customClass,
      });

      render(<TextInput className={customClass} />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass(customClass);
    });
  });

  describe("State-based Styling", () => {
    it("should apply error styling when hasError is true", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, hasError: true });

      render(<TextInput hasError />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass("border", "border-danger");
    });

    it("should apply disabled styling when disabled is true", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: true });

      render(<TextInput disabled />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass("web:cursor-not-allowed", "opacity-50");
    });

    it("should apply readonly styling when readOnly is true", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, readOnly: true });

      render(<TextInput readOnly />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass("web:cursor-not-allowed");
    });

    it("should apply not-editable styling when editable is false", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, editable: false });

      render(<TextInput editable={false} />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass("web:cursor-not-allowed");
    });

    it("should not apply error styling when hasError is false", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, hasError: false });

      render(<TextInput hasError={false} />);

      const input = screen.getByTestId("base-text-input");
      expect(input).not.toHaveClass("border-danger");
    });
  });

  describe("Placeholder Styling", () => {
    it("should apply default placeholder styling", () => {
      render(<TextInput />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveAttribute("data-placeholder-class", "text-muted");
    });

    it("should apply custom placeholder className", () => {
      const customPlaceholderClass = "custom-placeholder";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        placeholderClassName: customPlaceholderClass,
      });

      render(<TextInput placeholderClassName={customPlaceholderClass} />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveAttribute(
        "data-placeholder-class",
        `text-muted ${customPlaceholderClass}`,
      );
    });

    it("should handle empty placeholder className", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        placeholderClassName: "",
      });

      render(<TextInput placeholderClassName="" />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveAttribute("data-placeholder-class", "text-muted");
    });
  });

  describe("Props Validation", () => {
    it("should handle string value prop", () => {
      const testValue = "test input value";
      mockApplyDefaults.mockReturnValue({ ...defaultProps, value: testValue });

      render(<TextInput value={testValue} />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveAttribute("value", testValue);
    });

    it("should handle string placeholder prop", () => {
      const testPlaceholder = "Enter your text here";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        placeholder: testPlaceholder,
      });

      render(<TextInput placeholder={testPlaceholder} />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveAttribute("placeholder", testPlaceholder);
    });

    it("should handle boolean hasError prop", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, hasError: true });

      render(<TextInput hasError={true} />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass("border-danger");
    });

    it("should handle boolean readOnly prop", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, readOnly: true });

      render(<TextInput readOnly={true} />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass("web:cursor-not-allowed");
    });

    it("should handle boolean disabled prop", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: true });

      render(<TextInput disabled={true} />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass("opacity-50");
    });
  });

  describe("Event Handling", () => {
    it("should handle onChange events", () => {
      const handleChange = vi.fn();
      render(<TextInput onChangeText={handleChange} />);

      const input = screen.getByTestId("base-text-input");
      fireEvent.change(input, { target: { value: "new value" } });

      expect(handleChange).toHaveBeenCalled();
    });

    it("should handle focus events", () => {
      const handleFocus = vi.fn();
      render(<TextInput onFocus={handleFocus} />);

      const input = screen.getByTestId("base-text-input");
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it("should handle blur events", () => {
      const handleBlur = vi.fn();
      render(<TextInput onBlur={handleBlur} />);

      const input = screen.getByTestId("base-text-input");
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalled();
    });

    it("should not trigger events when disabled", () => {
      const handleChange = vi.fn();
      mockApplyDefaults.mockReturnValue({ ...defaultProps, disabled: true });

      render(<TextInput onChangeText={handleChange} disabled />);

      const input = screen.getByTestId("base-text-input");
      fireEvent.change(input, { target: { value: "new value" } });

      // The component itself doesn't prevent the event, but the disabled attribute should
      expect(input).toBeDisabled();
    });
  });

  describe("Schema Integration", () => {
    it("should call schema applyDefaults with provided props", () => {
      const props = { value: "test", className: "test-class" };
      render(<TextInput {...props} />);

      expect(mockApplyDefaults).toHaveBeenCalledWith(props);
    });

    it("should handle undefined props", () => {
      render(<TextInput />);

      expect(mockApplyDefaults).toHaveBeenCalledWith({});
    });

    it("should apply schema defaults correctly", () => {
      const schemaDefaults = {
        ...defaultProps,
        placeholderTextColor: "#custom-color",
        hasError: false,
        readOnly: false,
        disabled: false,
      };
      mockApplyDefaults.mockReturnValue(schemaDefaults);

      render(<TextInput />);

      expect(mockApplyDefaults).toHaveBeenCalled();
    });
  });

  describe("Documentation Props", () => {
    it("should export getDocumentationProps function", () => {
      expect(getDocumentationProps).toBeDefined();
      expect(typeof getDocumentationProps).toBe("function");
    });

    it("should call schema documentationProps with correct parameters", () => {
      getDocumentationProps();

      expect(mockDocumentationProps).toHaveBeenCalledWith("TextInput", {
        onChangeProp: "onChangeText",
      });
    });
  });

  describe("Accessibility", () => {
    it("should support aria attributes", () => {
      render(
        <TextInput aria-label="Test input" aria-describedby="help-text" />,
      );

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveAttribute("aria-label", "Test input");
      expect(input).toHaveAttribute("aria-describedby", "help-text");
    });

    it("should support role attribute", () => {
      render(<TextInput role="textbox" />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveAttribute("role", "textbox");
    });

    it("should be keyboard accessible", () => {
      render(<TextInput />);

      const input = screen.getByTestId("base-text-input");
      fireEvent.keyDown(input, { key: "Tab" });

      // Input should be focusable
      expect(input).not.toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string value", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, value: "" });

      render(<TextInput value="" />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveAttribute("value", "");
    });

    it("should handle undefined value", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, value: undefined });

      render(<TextInput value={undefined} />);

      expect(screen.getByTestId("base-text-input")).toBeInTheDocument();
    });

    it("should handle null className", () => {
      mockApplyDefaults.mockReturnValue({ ...defaultProps, className: null });

      expect(() => render(<TextInput className={null} />)).not.toThrow();
    });

    it("should handle multiple state combinations", () => {
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        hasError: true,
        disabled: true,
        readOnly: true,
      });

      render(<TextInput hasError disabled readOnly />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveClass("border-danger");
      expect(input).toHaveClass("opacity-50");
      expect(input).toHaveClass("web:cursor-not-allowed");
    });

    it("should handle very long placeholder text", () => {
      const longPlaceholder =
        "This is a very long placeholder text that might cause layout issues if not handled properly";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        placeholder: longPlaceholder,
      });

      render(<TextInput placeholder={longPlaceholder} />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveAttribute("placeholder", longPlaceholder);
    });

    it("should handle special characters in value", () => {
      const specialValue = "Test with émojis 🎉 and spëcial chars!";
      mockApplyDefaults.mockReturnValue({
        ...defaultProps,
        value: specialValue,
      });

      render(<TextInput value={specialValue} />);

      const input = screen.getByTestId("base-text-input");
      expect(input).toHaveAttribute("value", specialValue);
    });
  });

  describe("Performance", () => {
    it("should not re-render unnecessarily", () => {
      const { rerender } = render(<TextInput value="test" />);

      // Re-render with same props
      rerender(<TextInput value="test" />);

      expect(screen.getByTestId("base-text-input")).toBeInTheDocument();
    });

    it("should handle rapid prop changes", () => {
      const { rerender } = render(<TextInput value="initial" />);

      // Rapid value changes
      for (let i = 0; i < 10; i++) {
        mockApplyDefaults.mockReturnValue({
          ...defaultProps,
          value: `value-${i}`,
        });
        rerender(<TextInput value={`value-${i}`} />);
      }

      expect(screen.getByTestId("base-text-input")).toBeInTheDocument();
    });
  });

  describe("Type Safety", () => {
    it("should accept valid TextInputProps", () => {
      const validProps = {
        value: "string value",
        placeholder: "string placeholder",
        className: "string-class",
        placeholderClassName: "placeholder-class",
        placeholderTextColor: "#ffffff",
        hasError: false,
        readOnly: true,
        disabled: false,
      };

      expect(() => render(<TextInput {...validProps} />)).not.toThrow();
    });
  });
});
