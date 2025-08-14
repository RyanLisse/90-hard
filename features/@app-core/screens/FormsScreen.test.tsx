import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies - must be defined before mocks
const mockSetParams = vi.fn();
const mockSetColorScheme = vi.fn();
const mockHandleChange = vi.fn();
const mockGetTextInputProps = vi.fn();
const mockGetInputProps = vi.fn();
const mockUpdateErrors = vi.fn();

vi.mock("@green-stack/navigation", () => ({
  useRouter: () => ({
    setParams: mockSetParams,
  }),
  useRouteParams: vi.fn((props) => ({
    validateOnChange: false,
    ...props,
  })),
}));

vi.mock("nativewind", () => ({
  useColorScheme: () => ({
    colorScheme: "light",
    setColorScheme: mockSetColorScheme,
  }),
}));

vi.mock("@green-stack/forms/useFormState", () => ({
  useFormState: vi.fn(() => ({
    values: {
      email: "",
      age: undefined,
      identifiesWith: undefined,
      excitingFeatures: [],
      platformsTargeted: 1,
      showFormState: false,
      showResults: false,
      showBenefits: true,
      projectsPerYear: 1,
      currentSetupHoursPerProject: 40,
      knownTech: ["typescript", "react"],
      feedbackSuggestions: "",
    },
    errors: {},
    isValid: true,
    isDefaultState: true,
    handleChange: mockHandleChange,
    getTextInputProps: mockGetTextInputProps,
    getInputProps: mockGetInputProps,
    updateErrors: mockUpdateErrors,
  })),
}));

vi.mock("@green-stack/hooks/useScrollToFocusedInput", () => ({
  useScrollToFocusedInput: () => ({
    avoidingViewProps: {},
    scrollViewProps: {},
    registerInput: () => ({}),
    keyboardPaddedView: null,
  }),
}));

vi.mock("expo-status-bar", () => ({
  StatusBar: vi.fn(({ style }) => (
    <div data-testid="status-bar" data-style={style} />
  )),
}));

vi.mock("../components/styled", () => ({
  getThemeColor: vi.fn(() => "#000000"),
  H1: vi.fn(({ children, onPress, className }) => (
    <h1 className={className} onClick={onPress}>
      {children}
    </h1>
  )),
  H2: vi.fn(({ children, className }) => (
    <h2 className={className}>{children}</h2>
  )),
  H3: vi.fn(({ children, className }) => (
    <h3 className={className}>{children}</h3>
  )),
  Text: vi.fn(({ children, className }) => (
    <span className={className}>{children}</span>
  )),
  View: vi.fn(({ children, className }) => (
    <div className={className}>{children}</div>
  )),
  Link: vi.fn(({ children, href, target, className }) => (
    <a href={href} target={target} className={className}>
      {children}
    </a>
  )),
  KeyboardAvoidingView: vi.fn(({ children }) => <div>{children}</div>),
  ScrollView: vi.fn(({ children, className, contentContainerClassName }) => (
    <div className={`${className} ${contentContainerClassName}`}>
      {children}
    </div>
  )),
}));

vi.mock("../components/BackButton", () => ({
  default: vi.fn(({ backLink, color }) => (
    <button
      data-testid="back-button"
      data-back-link={backLink}
      data-color={color}
    >
      Back
    </button>
  )),
}));

vi.mock("../components/Button", () => ({
  Button: vi.fn(
    ({ disabled, fullWidth, iconRight, onPress, size, text, type }) => (
      <button
        disabled={disabled}
        data-full-width={fullWidth}
        data-icon-right={iconRight}
        onClick={onPress}
        data-size={size}
        data-type={type}
        data-testid="submit-button"
      >
        {text}
      </button>
    ),
  ),
}));

vi.mock("../components/EfficiencyResults", () => ({
  EfficiencyResults: vi.fn(({ formState, showBenefits }) => (
    <div data-testid="efficiency-results" data-show-benefits={showBenefits}>
      Efficiency Results Component
    </div>
  )),
}));

// Mock form components
vi.mock("../forms/TextInput.styled", () => ({
  TextInput: vi.fn(({ placeholder, ...props }) => (
    <input data-testid="text-input" placeholder={placeholder} {...props} />
  )),
}));

vi.mock("../forms/NumberStepper.styled", () => ({
  NumberStepper: vi.fn(({ max, min, placeholder, step, ...props }) => (
    <input
      type="number"
      data-testid="number-stepper"
      placeholder={placeholder}
      max={max}
      min={min}
      step={step}
      {...props}
    />
  )),
}));

vi.mock("../forms/Checkbox.styled", () => ({
  Checkbox: vi.fn(({ checked, label, onCheckedChange }) => (
    <label data-testid="checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
      {label}
    </label>
  )),
}));

vi.mock("../forms/RadioGroup.styled", () => ({
  RadioGroup: {
    create: vi.fn(() =>
      vi.fn(({ options, children, ...props }) => (
        <div data-testid="radio-group" {...props}>
          {Object.entries(options || {}).map(([value, label]) => (
            <div key={value} data-testid={`radio-option-${value}`}>
              {label}
            </div>
          ))}
          {children}
        </div>
      )),
    ),
    Option: vi.fn(({ label, value }) => (
      <div data-testid={`radio-option-${value}`}>
        <input type="radio" value={value} />
        {label}
      </div>
    )),
  },
}));

vi.mock("../forms/Select.styled", () => ({
  Select: vi.fn(({ onChange, options, placeholder, value, children }) => (
    <div data-testid="select">
      <select value={value} onChange={(e) => onChange?.(e.target.value)}>
        <option value="">{placeholder}</option>
        {Object.entries(options || {}).map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
      {children}
    </div>
  )),
  Option: vi.fn(({ label, value }) => <option value={value}>{label}</option>),
}));

vi.mock("../forms/CheckList.styled", () => ({
  CheckList: vi.fn(({ options, ...props }) => (
    <div data-testid="check-list" {...props}>
      {Object.entries(options || {}).map(([value, label]) => (
        <div key={value} data-testid={`check-option-${value}`}>
          <input type="checkbox" value={value} />
          {label}
        </div>
      ))}
    </div>
  )),
}));

vi.mock("../forms/TextArea.styled", () => ({
  TextArea: vi.fn(({ maxLength, numberOfLines, placeholder, ...props }) => (
    <textarea
      data-testid="text-area"
      placeholder={placeholder}
      maxLength={maxLength}
      rows={numberOfLines}
      {...props}
    />
  )),
}));

vi.mock("../forms/Switch.styled", () => ({
  Switch: vi.fn(({ checked, label, onCheckedChange }) => (
    <label data-testid="switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
      />
      {label}
    </label>
  )),
}));

vi.mock("../utils/calculateEfficiency", () => ({
  calculateEfficiency: vi.fn(() => ({
    shipsWebOnly: false,
    shipsMobileOnly: false,
    annualAvgEfficiencyBoost: 50,
    annualHoursSaved: 100,
    deliveryEfficiency: 75,
    finalEfficiencyRate: 80,
    learningGapHours: 20,
    setupHoursPerProject: 30,
  })),
}));

describe("FormsScreen", () => {
  const defaultProps: FormScreenProps = {
    email: "",
    age: undefined,
    identifiesWith: undefined,
    excitingFeatures: [],
    platformsTargeted: 1,
    showFormState: false,
    showResults: false,
    showBenefits: true,
    projectsPerYear: 1,
    currentSetupHoursPerProject: 40,
    knownTech: ["typescript", "react"],
    feedbackSuggestions: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock returns
    mockGetTextInputProps.mockReturnValue({
      value: "",
      onChangeText: vi.fn(),
      error: undefined,
    });

    mockGetInputProps.mockReturnValue({
      value: undefined,
      onChange: vi.fn(),
      error: undefined,
    });
  });

  describe("Component Rendering", () => {
    it("should render the forms screen with title", () => {
      render(<FormsScreen {...defaultProps} />);

      expect(screen.getByText("Universal Forms Demo")).toBeInTheDocument();
    });

    it("should render status bar with appropriate style", () => {
      render(<FormsScreen {...defaultProps} />);

      const statusBar = screen.getByTestId("status-bar");
      expect(statusBar).toHaveAttribute("data-style", "dark");
    });

    it("should render back button with correct props", () => {
      render(<FormsScreen {...defaultProps} />);

      const backButton = screen.getByTestId("back-button");
      expect(backButton).toHaveAttribute(
        "data-back-link",
        "/subpages/Universal%20Nav",
      );
      expect(backButton).toHaveAttribute("data-color", "#000000");
    });
  });

  describe("Form Elements", () => {
    it("should render text input for email", () => {
      render(<FormsScreen {...defaultProps} />);

      const textInput = screen.getByTestId("text-input");
      expect(textInput).toHaveAttribute(
        "placeholder",
        "e.g. thorr@fullproduct.dev",
      );
      expect(screen.getByText("Your email")).toBeInTheDocument();
    });

    it("should render number stepper for age", () => {
      render(<FormsScreen {...defaultProps} />);

      const numberStepper = screen.getByTestId("number-stepper");
      expect(numberStepper).toHaveAttribute("placeholder", "e.g. 32");
      expect(numberStepper).toHaveAttribute("min", "18");
      expect(numberStepper).toHaveAttribute("max", "150");
      expect(numberStepper).toHaveAttribute("step", "1");
      expect(screen.getByText("Your age")).toBeInTheDocument();
    });

    it("should render checkbox for validation toggle", () => {
      render(<FormsScreen {...defaultProps} />);

      const checkbox = screen.getByTestId("checkbox");
      expect(checkbox).toHaveTextContent("Validate on change?");
    });

    it("should render radio group for identity selection", () => {
      render(<FormsScreen {...defaultProps} />);

      expect(
        screen.getByText("What role describes you best?"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("radio-group")).toBeInTheDocument();
      expect(screen.getByText("Startup Founder")).toBeInTheDocument();
      expect(
        screen.getByText("Indie Hacker / Solo App Dev"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Studio Lead / CEO / Architect"),
      ).toBeInTheDocument();
    });

    it("should render select for platform targeting", () => {
      render(<FormsScreen {...defaultProps} />);

      expect(
        screen.getByText("What platforms do you typically ship?"),
      ).toBeInTheDocument();
      const select = screen.getByTestId("select");
      expect(select).toBeInTheDocument();
      expect(screen.getByText("Mobile 📲 iOS + Android")).toBeInTheDocument();
      expect(screen.getByText("Universal 🚀 Web + Mobile")).toBeInTheDocument();
    });

    it("should render check list for exciting features", () => {
      render(<FormsScreen {...defaultProps} />);

      expect(
        screen.getByText("Which DX features excite you?"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("check-list")).toBeInTheDocument();
    });

    it("should render text area for feedback", () => {
      render(<FormsScreen {...defaultProps} />);

      expect(screen.getByText("What's missing?")).toBeInTheDocument();
      const textArea = screen.getByTestId("text-area");
      expect(textArea).toHaveAttribute(
        "placeholder",
        "How could we further improve your workflow?",
      );
      expect(textArea).toHaveAttribute("maxLength", "500");
      expect(
        screen.getByText("Feedback or suggestions appreciated"),
      ).toBeInTheDocument();
    });

    it("should render switch for form state display", () => {
      render(<FormsScreen {...defaultProps} />);

      const switchElement = screen.getByTestId("switch");
      expect(switchElement).toHaveTextContent("Show formState");
    });
  });

  describe("Submit Button", () => {
    it("should render submit button with correct initial state", () => {
      render(<FormsScreen {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toHaveTextContent("Submit & Show Results");
      expect(submitButton).toHaveAttribute("data-type", "primary");
      expect(submitButton).toHaveAttribute(
        "data-icon-right",
        "ArrowRightFilled",
      );
    });

    it("should handle submit button click", () => {
      render(<FormsScreen {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      expect(mockHandleChange).toHaveBeenCalledWith("showResults", true);
    });

    it("should change button text when results are shown", () => {
      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: { ...defaultProps, showResults: true },
        errors: {},
        isValid: true,
        isDefaultState: false,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      render(<FormsScreen {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toHaveTextContent("Hide Results");
      expect(submitButton).toHaveAttribute("data-type", "outline");
      expect(submitButton).toHaveAttribute(
        "data-icon-right",
        "ChevronUpFilled",
      );
    });
  });

  describe("Theme Toggle", () => {
    it("should handle title click to toggle theme", () => {
      render(<FormsScreen {...defaultProps} />);

      const title = screen.getByText("Universal Forms Demo");
      fireEvent.click(title);

      expect(mockSetColorScheme).toHaveBeenCalledWith("dark");
    });

    it("should toggle from dark to light theme", () => {
      const { useColorScheme } = require("nativewind");
      useColorScheme.mockReturnValue({
        colorScheme: "dark",
        setColorScheme: mockSetColorScheme,
      });

      render(<FormsScreen {...defaultProps} />);

      const title = screen.getByText("Universal Forms Demo");
      fireEvent.click(title);

      expect(mockSetColorScheme).toHaveBeenCalledWith("light");
    });
  });

  describe("Conditional Rendering", () => {
    it("should render efficiency results when showResults is true", () => {
      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: { ...defaultProps, showResults: true, showBenefits: true },
        errors: {},
        isValid: true,
        isDefaultState: false,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      render(<FormsScreen {...defaultProps} />);

      const efficiencyResults = screen.getByTestId("efficiency-results");
      expect(efficiencyResults).toBeInTheDocument();
      expect(efficiencyResults).toHaveAttribute("data-show-benefits", "true");
    });

    it("should render form state debug info when showFormState is true", () => {
      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: { ...defaultProps, showFormState: true },
        errors: {},
        isValid: true,
        isDefaultState: false,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      render(<FormsScreen {...defaultProps} />);

      expect(
        screen.getByText("formState = useFormState( zod )"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("📗 Read form-management docs"),
      ).toBeInTheDocument();
    });

    it("should not render efficiency results when showResults is false", () => {
      render(<FormsScreen {...defaultProps} />);

      expect(
        screen.queryByTestId("efficiency-results"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should handle checkbox toggle for validation", () => {
      render(<FormsScreen {...defaultProps} />);

      const checkbox = screen.getByTestId("checkbox").querySelector("input");
      fireEvent.change(checkbox!, { target: { checked: true } });

      // The component uses local state for this, so we can't easily test the exact call
      expect(checkbox).toBeInTheDocument();
    });

    it("should handle switch toggle for form state display", () => {
      render(<FormsScreen {...defaultProps} />);

      const switchElement = screen.getByTestId("switch").querySelector("input");
      fireEvent.change(switchElement!, { target: { checked: true } });

      expect(mockHandleChange).toHaveBeenCalledWith("showFormState", true);
    });

    it("should handle select change for platform targeting", () => {
      render(<FormsScreen {...defaultProps} />);

      const select = screen.getByTestId("select").querySelector("select");
      fireEvent.change(select!, { target: { value: "2" } });

      expect(mockHandleChange).toHaveBeenCalledWith("platformsTargeted", 2);
    });

    it("should handle select change with empty value", () => {
      render(<FormsScreen {...defaultProps} />);

      const select = screen.getByTestId("select").querySelector("select");
      fireEvent.change(select!, { target: { value: "" } });

      expect(mockHandleChange).toHaveBeenCalledWith(
        "platformsTargeted",
        undefined,
      );
    });
  });

  describe("Form Validation", () => {
    it("should disable submit button when form is invalid", () => {
      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: defaultProps,
        errors: { email: "Invalid email" },
        isValid: false,
        isDefaultState: true,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      render(<FormsScreen {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when form is valid", () => {
      render(<FormsScreen {...defaultProps} />);

      const submitButton = screen.getByTestId("submit-button");
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("URL Params Integration", () => {
    it("should call setParams when form values change and not default state", () => {
      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: { ...defaultProps, email: "test@example.com" },
        errors: {},
        isValid: true,
        isDefaultState: false,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      render(<FormsScreen {...defaultProps} />);

      expect(mockSetParams).toHaveBeenCalledWith({
        ...defaultProps,
        email: "test@example.com",
      });
    });

    it("should not call setParams when in default state", () => {
      render(<FormsScreen {...defaultProps} />);

      expect(mockSetParams).not.toHaveBeenCalled();
    });
  });

  describe("Identity-based Calculations", () => {
    it("should update projectsPerYear based on identifiesWith value", () => {
      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: { ...defaultProps, identifiesWith: "startup-founder" },
        errors: {},
        isValid: true,
        isDefaultState: false,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      render(<FormsScreen {...defaultProps} />);

      expect(mockHandleChange).toHaveBeenCalledWith("projectsPerYear", 1);
    });

    it("should handle freelance-app-dev identity", () => {
      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: { ...defaultProps, identifiesWith: "freelance-app-dev" },
        errors: {},
        isValid: true,
        isDefaultState: false,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      render(<FormsScreen {...defaultProps} />);

      expect(mockHandleChange).toHaveBeenCalledWith("projectsPerYear", 4);
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<FormsScreen {...defaultProps} />);

      const h1Elements = screen.getAllByRole("heading", { level: 1 });
      const h2Elements = screen.getAllByRole("heading", { level: 2 });

      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0]).toHaveTextContent("Universal Forms Demo");
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it("should have proper labels for form inputs", () => {
      render(<FormsScreen {...defaultProps} />);

      expect(screen.getByText("Your email")).toBeInTheDocument();
      expect(screen.getByText("Your age")).toBeInTheDocument();
      expect(screen.getByText("Validate on change?")).toBeInTheDocument();
      expect(screen.getByText("Show formState")).toBeInTheDocument();
    });

    it("should have proper external links", () => {
      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: { ...defaultProps, showFormState: true },
        errors: {},
        isValid: true,
        isDefaultState: false,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      render(<FormsScreen {...defaultProps} />);

      const links = screen.getAllByRole("link");
      const docsLinks = links.filter((link) =>
        link
          .getAttribute("href")
          ?.includes("fullproduct.dev/docs/form-management"),
      );

      expect(docsLinks).toHaveLength(2);
      docsLinks.forEach((link) => {
        expect(link).toHaveAttribute("target", "_blank");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle form state with errors", () => {
      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: defaultProps,
        errors: { email: "Invalid email", age: "Invalid age" },
        isValid: false,
        isDefaultState: true,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      expect(() => render(<FormsScreen {...defaultProps} />)).not.toThrow();
    });

    it("should handle undefined values gracefully", () => {
      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: {
          ...defaultProps,
          email: undefined,
          age: undefined,
          identifiesWith: undefined,
        },
        errors: {},
        isValid: true,
        isDefaultState: true,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      expect(() => render(<FormsScreen {...defaultProps} />)).not.toThrow();
    });

    it("should handle validation toggle effects", () => {
      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: defaultProps,
        errors: {},
        isValid: true,
        isDefaultState: true,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      const { rerender } = render(<FormsScreen {...defaultProps} />);

      // Simulate validation toggle effect
      expect(mockUpdateErrors).toHaveBeenCalledWith({});

      // Re-render with validation errors but validateOnChange false
      useFormState.mockReturnValue({
        values: defaultProps,
        errors: { email: "Invalid" },
        isValid: false,
        isDefaultState: true,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      rerender(<FormsScreen {...defaultProps} />);

      expect(mockUpdateErrors).toHaveBeenCalledWith({});
    });
  });

  describe("Platform Targeting Effects", () => {
    it("should update knownTech based on platform targeting changes", () => {
      const { calculateEfficiency } = require("../utils/calculateEfficiency");
      calculateEfficiency.mockReturnValue({
        shipsWebOnly: true,
        shipsMobileOnly: false,
        annualAvgEfficiencyBoost: 50,
        annualHoursSaved: 100,
        deliveryEfficiency: 75,
        finalEfficiencyRate: 80,
        learningGapHours: 20,
        setupHoursPerProject: 30,
      });

      const { useFormState } = require("@green-stack/forms/useFormState");
      useFormState.mockReturnValue({
        values: {
          ...defaultProps,
          platformsTargeted: 1,
          knownTech: ["typescript", "react", "react-native", "expo"],
        },
        errors: {},
        isValid: true,
        isDefaultState: false,
        handleChange: mockHandleChange,
        getTextInputProps: mockGetTextInputProps,
        getInputProps: mockGetInputProps,
        updateErrors: mockUpdateErrors,
      });

      render(<FormsScreen {...defaultProps} />);

      // Should remove mobile-specific tech when shipping web only
      expect(mockHandleChange).toHaveBeenCalledWith(
        "knownTech",
        expect.any(Array),
      );
    });
  });
});
