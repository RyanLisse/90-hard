import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EfficiencyResults, type EfficiencyResultsProps } from './EfficiencyResults';
import type { EfficiencyFormState } from '../screens/FormsScreen.types';

// Mock dependencies
vi.mock('@green-stack/components/Icon', () => ({
  Icon: ({ name, size, color }: any) => (
    <div data-testid={`icon-${name}`} data-size={size} data-color={color}>
      {name}
    </div>
  ),
}));

vi.mock('../components/Button', () => ({
  Button: ({ text, onPress, disabled, className, type }: any) => (
    <button
      onClick={onPress}
      disabled={disabled}
      className={className}
      data-type={type}
    >
      {text}
    </button>
  ),
}));

vi.mock('./styled', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
  getThemeColor: () => '#00ff00',
  H1: ({ children, className }: any) => <h1 className={className}>{children}</h1>,
  H2: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
  H3: ({ children, className }: any) => <h3 className={className}>{children}</h3>,
  P: ({ children, className }: any) => <p className={className}>{children}</p>,
  Text: ({ children, className }: any) => <span className={className}>{children}</span>,
  View: ({ children, className }: any) => <div className={className}>{children}</div>,
  Link: ({ children, href, target }: any) => (
    <a href={href} target={target}>
      {children}
    </a>
  ),
}));

vi.mock('../forms/CheckList.styled', () => ({
  CheckList: ({ options, onChange, value }: any) => (
    <div data-testid="checklist">
      {options.map((option: any) => (
        <label key={option.value}>
          <input
            type="checkbox"
            checked={value?.includes(option.value)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...(value || []), option.value]);
              } else {
                onChange((value || []).filter((v: string) => v !== option.value));
              }
            }}
          />
          {option.label}
        </label>
      ))}
    </div>
  ),
}));

vi.mock('../forms/NumberStepper.styled', () => ({
  NumberStepper: ({ min, placeholder, value, onChange }: any) => (
    <input
      type="number"
      min={min}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      data-testid="number-stepper"
    />
  ),
}));

describe('EfficiencyResults', () => {
  const mockHandleChange = vi.fn();
  const mockGetInputProps = vi.fn((field: string) => ({
    value: field === 'projectsPerYear' ? 5 : ['React Native', 'GraphQL'],
    onChange: (value: any) => mockHandleChange(field, value),
  }));

  const defaultFormState: EfficiencyFormState = {
    values: {
      identifiesWith: 'developer',
      projectsPerYear: 5,
      shipsUniversal: false,
      knownTech: ['React Native', 'GraphQL'],
      showBenefits: false,
    },
    handleChange: mockHandleChange,
    getInputProps: mockGetInputProps,
  };

  const defaultProps: EfficiencyResultsProps = {
    showBenefits: false,
    formState: defaultFormState,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Header Display', () => {
    it('should display efficiency boost percentage when significant', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByText(/Ship/)).toBeInTheDocument();
      expect(screen.getByText(/more efficiently/)).toBeInTheDocument();
    });

    it('should display "slightly" when efficiency boost is minimal', () => {
      const minimalFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          projectsPerYear: 1,
          knownTech: ['React Native', 'GraphQL', 'Tailwind'],
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          formState={minimalFormState}
        />
      );

      expect(screen.getByText('slightly')).toBeInTheDocument();
    });
  });

  describe('Platform Indicators', () => {
    it('should show all platforms when shipping universal', () => {
      const universalFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          shipsUniversal: true,
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          formState={universalFormState}
        />
      );

      expect(screen.getByText('✅ Web')).toBeInTheDocument();
      expect(screen.getByText('✅ iOS')).toBeInTheDocument();
      expect(screen.getByText('✅ Android')).toBeInTheDocument();
    });

    it('should show platform additions when shipping web only', () => {
      const webOnlyFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          identifiesWith: 'web-developer',
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          formState={webOnlyFormState}
        />
      );

      expect(screen.getByText('✅ Web')).toBeInTheDocument();
      expect(screen.getByText('❇️ + iOS')).toBeInTheDocument();
      expect(screen.getByText('❇️ + Android')).toBeInTheDocument();
    });

    it('should show platform additions when shipping mobile only', () => {
      const mobileOnlyFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          identifiesWith: 'mobile-developer',
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          formState={mobileOnlyFormState}
        />
      );

      expect(screen.getByText('❇️ + Web')).toBeInTheDocument();
      expect(screen.getByText('✅ iOS')).toBeInTheDocument();
      expect(screen.getByText('✅ Android')).toBeInTheDocument();
    });
  });

  describe('Value Delivery Display', () => {
    it('should show annual hours saved when significant', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByText(/of extra value delivered yearly/)).toBeInTheDocument();
    });

    it('should format time in appropriate units', () => {
      const highProjectFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          projectsPerYear: 20,
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          formState={highProjectFormState}
        />
      );

      // Should show weeks or months for large values
      expect(screen.getByText(/of extra value delivered yearly/)).toBeInTheDocument();
    });
  });

  describe('Projects Per Year Control', () => {
    it('should display current projects per year', () => {
      render(<EfficiencyResults {...defaultProps} />);

      const stepper = screen.getByTestId('number-stepper');
      expect(stepper).toHaveValue(5);
      expect(screen.getByText('projects per year')).toBeInTheDocument();
    });

    it('should use singular form for 1 project', () => {
      const singleProjectFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          projectsPerYear: 1,
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          formState={singleProjectFormState}
        />
      );

      expect(screen.getByText('project per year')).toBeInTheDocument();
    });

    it('should update projects per year on change', () => {
      render(<EfficiencyResults {...defaultProps} />);

      const stepper = screen.getByTestId('number-stepper');
      fireEvent.change(stepper, { target: { value: '10' } });

      expect(mockHandleChange).toHaveBeenCalledWith('projectsPerYear', 10);
    });
  });

  describe('Learning Time Display', () => {
    it('should show learning gap hours', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByText(/to learn the ropes/)).toBeInTheDocument();
    });

    it('should format learning time appropriately', () => {
      const minimalKnowledgeFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          knownTech: [],
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          formState={minimalKnowledgeFormState}
        />
      );

      expect(screen.getByText(/to learn the ropes/)).toBeInTheDocument();
    });
  });

  describe('Team Knowledge Section', () => {
    it('should display team knowledge checklist', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByText('Team Knowledge?')).toBeInTheDocument();
      expect(screen.getByTestId('checklist')).toBeInTheDocument();
    });

    it('should pass current known tech to checklist', () => {
      render(<EfficiencyResults {...defaultProps} />);

      const checkboxes = screen.getAllByRole('checkbox');
      const checkedBoxes = checkboxes.filter((cb) => (cb as HTMLInputElement).checked);
      expect(checkedBoxes).toHaveLength(2); // React Native and GraphQL
    });
  });

  describe('Benefits Toggle', () => {
    it('should show "Benefits & Breakdown" button when benefits hidden', () => {
      render(<EfficiencyResults {...defaultProps} />);

      const button = screen.getByText('Benefits & Breakdown');
      expect(button).toBeInTheDocument();
      expect(button.closest('button')).toHaveAttribute('data-type', 'success');
    });

    it('should show "Breakdown" button when benefits shown', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits />);

      const button = screen.getByText('Breakdown');
      expect(button).toBeInTheDocument();
      expect(button.closest('button')).toHaveAttribute('data-type', 'secondary');
    });

    it('should disable button when no identity selected', () => {
      const noIdentityFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          identifiesWith: '',
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          formState={noIdentityFormState}
        />
      );

      const button = screen.getByText('Benefits & Breakdown');
      expect(button.closest('button')).toBeDisabled();
    });

    it('should toggle benefits on button click', () => {
      render(<EfficiencyResults {...defaultProps} />);

      const button = screen.getByText('Benefits & Breakdown');
      fireEvent.click(button);

      expect(mockHandleChange).toHaveBeenCalledWith('showBenefits', true);
    });
  });

  describe('Benefits Section', () => {
    it('should not show benefits when showBenefits is false', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.queryByText(/As a/)).not.toBeInTheDocument();
      expect(screen.queryByText(/hours on setup saved per project/)).not.toBeInTheDocument();
    });

    it('should show efficiency benefits when showBenefits is true', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits />);

      expect(screen.getByText(/As a/)).toBeInTheDocument();
      expect(screen.getByText(/hours on setup saved per project/)).toBeInTheDocument();
      expect(screen.getByText('Web + iOS + Android (write-once)')).toBeInTheDocument();
    });

    it('should show positioning benefits for service providers', () => {
      const providerFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          identifiesWith: 'agency',
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          showBenefits
          formState={providerFormState}
        />
      );

      expect(screen.getByText('Reposition as a premium service provider')).toBeInTheDocument();
      expect(screen.getByText('Gain an edge over competition')).toBeInTheDocument();
    });

    it('should show universal app benefits when not shipping universal', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits />);

      expect(screen.getByText(/write-once, universal apps/)).toBeInTheDocument();
      expect(screen.getByText('Be on any device / platform customers prefer')).toBeInTheDocument();
      expect(screen.getByText(/universal deeplinks/)).toBeInTheDocument();
    });

    it('should show developer documentation links', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits />);

      const universalRoutingLink = screen.getByText('Universal Routing');
      expect(universalRoutingLink).toHaveAttribute('href', 'https://fullproduct.dev/docs/universal-routing');
      expect(universalRoutingLink).toHaveAttribute('target', '_blank');

      const dataFetchingLink = screen.getByText('Cross-platform Data-Fetching');
      expect(dataFetchingLink).toHaveAttribute('href', 'https://fullproduct.dev/docs/data-fetching');
    });

    it('should show documentation generation benefits', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits />);

      expect(screen.getByText(/generate docs/)).toBeInTheDocument();
      expect(screen.getByText('Easier onboardings for new devs')).toBeInTheDocument();
      expect(screen.getByText(/Easier handovers/)).toBeInTheDocument();
    });
  });

  describe('Dynamic Content Based on Identity', () => {
    it('should show developer-specific content', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits />);

      expect(screen.getByText(/developer/)).toBeInTheDocument();
    });

    it('should show agency-specific content', () => {
      const agencyFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          identifiesWith: 'agency',
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          showBenefits
          formState={agencyFormState}
        />
      );

      expect(screen.getByText(/agency/)).toBeInTheDocument();
    });

    it('should show correct handover context', () => {
      const freelancerFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          identifiesWith: 'freelancer',
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          showBenefits
          formState={freelancerFormState}
        />
      );

      expect(screen.getByText(/Easier handovers/)).toBeInTheDocument();
    });
  });

  describe('Calculations and Formatting', () => {
    it('should display calculated efficiency percentage', () => {
      render(<EfficiencyResults {...defaultProps} />);

      // Should show some efficiency percentage
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading.textContent).toMatch(/Ship.*more efficiently/);
    });

    it('should display formatted time values', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits />);

      // Should format hours/days/weeks appropriately
      expect(screen.getByText(/hours on setup saved per project/)).toBeInTheDocument();
    });

    it('should calculate correct feature delivery percentage', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits />);

      // Should show extra features delivered percentage
      expect(screen.getByText(/% extra features delivered/)).toBeInTheDocument();
    });
  });

  describe('Visual Separators', () => {
    it('should show visual separators between sections when benefits shown', () => {
      const { container } = render(
        <EfficiencyResults {...defaultProps} showBenefits />
      );

      const separators = container.querySelectorAll('.h-1.w-12.bg-slate-300');
      expect(separators.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero projects per year', () => {
      const zeroProjectsFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          projectsPerYear: 0,
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          formState={zeroProjectsFormState}
        />
      );

      expect(screen.getByTestId('number-stepper')).toHaveValue(0);
    });

    it('should handle empty known tech array', () => {
      const noTechFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          knownTech: [],
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          formState={noTechFormState}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const checkedBoxes = checkboxes.filter((cb) => (cb as HTMLInputElement).checked);
      expect(checkedBoxes).toHaveLength(0);
    });

    it('should handle very high project counts', () => {
      const highProjectFormState = {
        ...defaultFormState,
        values: {
          ...defaultFormState.values,
          projectsPerYear: 100,
        },
      };
      render(
        <EfficiencyResults
          {...defaultProps}
          formState={highProjectFormState}
        />
      );

      expect(screen.getByTestId('number-stepper')).toHaveValue(100);
    });
  });
});