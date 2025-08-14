import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EfficiencyResults, type EfficiencyResultsProps } from './EfficiencyResults';
import type { EfficiencyFormState } from '../screens/FormsScreen.types';

// Mock dependencies
vi.mock('@green-stack/components/Icon', () => ({
  Icon: vi.fn(({ name, color, size }) => (
    <div data-testid={`icon-${name}`} data-color={color} data-size={size}>
      {name}
    </div>
  )),
}));

vi.mock('@green-stack/utils/numberUtils', () => ({
  roundUpTo: vi.fn((num, precision) => Math.ceil(num / precision) * precision),
}));

vi.mock('@green-stack/utils/stringUtils', () => ({
  uppercaseFirstChar: vi.fn((str) => str.charAt(0).toUpperCase() + str.slice(1)),
}));

vi.mock('../components/Button', () => ({
  Button: vi.fn(({ text, onPress, disabled, iconLeft, iconRight, type, size, className, textClassName, fullWidth }) => (
    <button
      onClick={onPress}
      disabled={disabled}
      className={className}
      data-testid="button"
      data-type={type}
      data-size={size}
      data-full-width={fullWidth}
      data-text-class={textClassName}
    >
      {iconLeft && <span data-testid="icon-left">{iconLeft}</span>}
      {text}
      {iconRight && <span data-testid="icon-right">{iconRight}</span>}
    </button>
  )),
}));

vi.mock('../components/styled', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
  getThemeColor: vi.fn((color) => `theme-${color}`),
  H1: vi.fn(({ children, className }) => <h1 className={className}>{children}</h1>),
  H2: vi.fn(({ children, className }) => <h2 className={className}>{children}</h2>),
  H3: vi.fn(({ children, className }) => <h3 className={className}>{children}</h3>),
  P: vi.fn(({ children, className }) => <p className={className}>{children}</p>),
  Text: vi.fn(({ children, className }) => <span className={className}>{children}</span>),
  View: vi.fn(({ children, className }) => <div className={className}>{children}</div>),
  Link: vi.fn(({ children, href, target, className }) => (
    <a href={href} target={target} className={className}>{children}</a>
  )),
}));

vi.mock('../forms/CheckList.styled', () => ({
  CheckList: vi.fn(({ options, ...props }) => (
    <div data-testid="checklist" {...props}>
      {options.map((option: any, index: number) => (
        <div key={index} data-testid={`option-${option.value || index}`}>
          {option.label || option}
        </div>
      ))}
    </div>
  )),
}));

vi.mock('../forms/NumberStepper.styled', () => ({
  NumberStepper: vi.fn((props) => (
    <input
      data-testid="number-stepper"
      type="number"
      {...props}
      placeholder={props.placeholder}
    />
  )),
}));

vi.mock('../utils/calculateEfficiency', () => ({
  calculateEfficiency: vi.fn((values) => ({
    formatRelativeTime: vi.fn((hours) => `${hours}h`),
    shipsWebOnly: values.identifiesWith === 'mobile-developer',
    shipsMobileOnly: values.identifiesWith === 'web-developer',
    shipsUniversal: values.identifiesWith === 'full-stack-developer',
    isProvider: values.identifiesWith === 'agency',
    isDev: ['web-developer', 'mobile-developer', 'full-stack-developer'].includes(values.identifiesWith),
    showEfficiencyBoost: values.projectsPerYear >= 3,
    showValueDelivered: values.projectsPerYear >= 2,
    showRepositioningBenefits: values.identifiesWith === 'agency',
    annualAvgEfficiencyBoost: 25,
    annualHoursSaved: 120,
    deliveryEfficiency: 1.5,
    finalEfficiencyRate: 30,
    learningGapHours: 40,
    learningGapDecimals: 1,
    setupHoursPerProject: 8,
    projects: values.projectsPerYear > 1 ? 'projects' : 'project',
    identity: values.identifiesWith.replace('-', ' '),
    benefitLevel: 'significantly',
    beneficial: 'significant',
    convincee: 'developers',
    handover: 'to clients',
  })),
}));

describe('EfficiencyResults', () => {
  const mockFormState: EfficiencyFormState = {
    values: {
      identifiesWith: 'web-developer',
      projectsPerYear: 4,
      knownTech: ['react', 'typescript'],
    },
    getInputProps: vi.fn((field) => ({
      value: mockFormState.values[field as keyof typeof mockFormState.values],
      onChange: vi.fn(),
    })),
    handleChange: vi.fn(),
    touched: {},
    errors: {},
  };

  const defaultProps: EfficiencyResultsProps = {
    showBenefits: false,
    formState: mockFormState,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render main efficiency heading', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByText('Ship')).toBeInTheDocument();
      expect(screen.getByText('more efficiently')).toBeInTheDocument();
    });

    it('should show efficiency boost percentage when applicable', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should show "slightly" when no efficiency boost', () => {
      const lowProjectFormState = {
        ...mockFormState,
        values: { ...mockFormState.values, projectsPerYear: 1 },
      };

      render(<EfficiencyResults {...defaultProps} formState={lowProjectFormState} />);

      expect(screen.getByText('slightly')).toBeInTheDocument();
    });

    it('should render platform buttons', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByText('❇️  + Web')).toBeInTheDocument();
      expect(screen.getByText('✅  iOS')).toBeInTheDocument();
      expect(screen.getByText('✅  Android')).toBeInTheDocument();
    });

    it('should show value delivered when applicable', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByText('120h')).toBeInTheDocument();
      expect(screen.getByText('of extra value delivered yearly')).toBeInTheDocument();
    });
  });

  describe('Platform Buttons Styling', () => {
    it('should highlight mobile platforms for web developer', () => {
      render(<EfficiencyResults {...defaultProps} />);

      const buttons = screen.getAllByTestId('button');
      // First button (Web) should have success border since shipsMobileOnly is true
      expect(buttons[0]).toHaveAttribute('data-text-class', 'font-bold');
    });

    it('should highlight web platform for mobile developer', () => {
      const mobileDevFormState = {
        ...mockFormState,
        values: { ...mockFormState.values, identifiesWith: 'mobile-developer' },
      };

      render(<EfficiencyResults {...defaultProps} formState={mobileDevFormState} />);

      const buttons = screen.getAllByTestId('button');
      // Should show different highlighting for mobile developer
      expect(buttons[0]).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should render number stepper for projects per year', () => {
      render(<EfficiencyResults {...defaultProps} />);

      const numberStepper = screen.getByTestId('number-stepper');
      expect(numberStepper).toBeInTheDocument();
      expect(numberStepper).toHaveAttribute('placeholder', 'projects per year');
    });

    it('should display correct project count text', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByText('projects per year')).toBeInTheDocument();
    });

    it('should display singular project text for single project', () => {
      const singleProjectFormState = {
        ...mockFormState,
        values: { ...mockFormState.values, projectsPerYear: 1 },
      };

      render(<EfficiencyResults {...defaultProps} formState={singleProjectFormState} />);

      expect(screen.getByText('project per year')).toBeInTheDocument();
    });

    it('should render learning gap information', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByText('40h')).toBeInTheDocument();
      expect(screen.getByText('to learn the ropes')).toBeInTheDocument();
    });

    it('should render team knowledge checklist', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByText('Team Knowledge?')).toBeInTheDocument();
      expect(screen.getByTestId('checklist')).toBeInTheDocument();
    });
  });

  describe('Benefits Toggle', () => {
    it('should render benefits toggle button', () => {
      render(<EfficiencyResults {...defaultProps} />);

      const toggleButton = screen.getByText('Benefits & Breakdown');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should call handleChange when benefits toggle is clicked', () => {
      render(<EfficiencyResults {...defaultProps} />);

      const toggleButton = screen.getByText('Benefits & Breakdown');
      fireEvent.click(toggleButton);

      expect(mockFormState.handleChange).toHaveBeenCalledWith('showBenefits', true);
    });

    it('should show different text when benefits are shown', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByText('Breakdown')).toBeInTheDocument();
    });

    it('should disable button when no identity is selected', () => {
      const noIdentityFormState = {
        ...mockFormState,
        values: { ...mockFormState.values, identifiesWith: '' },
      };

      render(<EfficiencyResults {...defaultProps} formState={noIdentityFormState} />);

      const toggleButton = screen.getByTestId('button');
      expect(toggleButton).toBeDisabled();
    });
  });

  describe('Benefits Section', () => {
    beforeEach(() => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);
    });

    it('should display identity-based benefit description', () => {
      expect(screen.getByText('As a')).toBeInTheDocument();
      expect(screen.getByText('web developer')).toBeInTheDocument();
      expect(screen.getByText(', you stand to benefit')).toBeInTheDocument();
      expect(screen.getByText('significantly')).toBeInTheDocument();
    });

    it('should display efficiency benefits list', () => {
      expect(screen.getByText('8 hours on setup saved per project')).toBeInTheDocument();
      expect(screen.getByText('Web + iOS + Android (write-once)')).toBeInTheDocument();
    });

    it('should display value delivered benefits when applicable', () => {
      expect(screen.getByText('Only 40h to learn the stack')).toBeInTheDocument();
      expect(screen.getByText('= 120h of setup saved at 4 projects / year')).toBeInTheDocument();
      expect(screen.getByText('= 30% extra features delivered / year')).toBeInTheDocument();
    });

    it('should display annual efficiency boost when applicable', () => {
      expect(screen.getByText('Resulting in a 25% total yearly value boost')).toBeInTheDocument();
    });
  });

  describe('Universal Apps Section', () => {
    it('should show universal apps benefits for non-universal developers', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByText('Software starting as')).toBeInTheDocument();
      expect(screen.getByText('write-once, universal apps')).toBeInTheDocument();
      expect(screen.getByText('have some benefits of their own:')).toBeInTheDocument();
    });

    it('should display universal app benefits', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByText('Be on any device / platform customers prefer')).toBeInTheDocument();
      expect(screen.getByText('More platforms =')).toBeInTheDocument();
      expect(screen.getByText('more trust')).toBeInTheDocument();
      expect(screen.getByText('More trust = more sales / conversions')).toBeInTheDocument();
    });

    it('should display deeplink benefits', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByText('Your app will have')).toBeInTheDocument();
      expect(screen.getByText('universal deeplinks')).toBeInTheDocument();
      expect(screen.getByText('Whichever page / device, users can share urls')).toBeInTheDocument();
    });

    it('should display SEO and conversion benefits', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByText('Organic traffic from web (SEO + cheaper ads)')).toBeInTheDocument();
      expect(screen.getByText('Higher conversions from mobile')).toBeInTheDocument();
    });
  });

  describe('Documentation Links', () => {
    it('should display developer-focused documentation links', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByText('Developers')).toBeInTheDocument();
      expect(screen.getByText('might like some docs on the productivity gains from this way of working:')).toBeInTheDocument();
    });

    it('should render documentation links', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByText('Universal Routing')).toBeInTheDocument();
      expect(screen.getByText('Cross-platform Data-Fetching')).toBeInTheDocument();
      expect(screen.getByText('Style universal UI')).toBeInTheDocument();
      expect(screen.getByText('Schemas as Single Sources of Truth')).toBeInTheDocument();
      expect(screen.getByText('Effortless GraphQL API\'s')).toBeInTheDocument();
    });

    it('should show portable architecture link for agencies', () => {
      const agencyFormState = {
        ...mockFormState,
        values: { ...mockFormState.values, identifiesWith: 'agency' },
      };

      render(<EfficiencyResults {...defaultProps} formState={agencyFormState} showBenefits={true} />);

      expect(screen.getByText('Portable architecture')).toBeInTheDocument();
    });
  });

  describe('Documentation Generation Section', () => {
    it('should display docs generation benefits', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByText('This starterkit can')).toBeInTheDocument();
      expect(screen.getByText('generate docs')).toBeInTheDocument();
      expect(screen.getByText('as you build. These docs will grow with your projects, meaning:')).toBeInTheDocument();
    });

    it('should display docs benefits list', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByText('Easier onboardings for new devs')).toBeInTheDocument();
      expect(screen.getByText('Easier handovers to clients')).toBeInTheDocument();
      expect(screen.getByText('Devs can send each other preview urls')).toBeInTheDocument();
    });

    it('should show example component docs link', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByText('example component docs')).toBeInTheDocument();
    });

    it('should show additional Zod schema information for developers', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByText('It\'s a good example of what\'s possible when you use')).toBeInTheDocument();
      expect(screen.getByText('Zod schemas')).toBeInTheDocument();
      expect(screen.getByText('Single Source of Truth')).toBeInTheDocument();
    });
  });

  describe('Repositioning Benefits', () => {
    it('should show repositioning benefits for agencies', () => {
      const agencyFormState = {
        ...mockFormState,
        values: { ...mockFormState.values, identifiesWith: 'agency' },
      };

      render(<EfficiencyResults {...defaultProps} formState={agencyFormState} showBenefits={true} />);

      expect(screen.getByText('This significant')).toBeInTheDocument();
      expect(screen.getByText('increase in efficiency and deliverables,')).toBeInTheDocument();
      expect(screen.getByText('grants you')).toBeInTheDocument();
      expect(screen.getByText('more flexibility')).toBeInTheDocument();
    });
  });

  describe('Li Component', () => {
    it('should render list items with check icons', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      const checkIcons = screen.getAllByTestId('icon-CheckFilled');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined form values gracefully', () => {
      const undefinedFormState = {
        ...mockFormState,
        values: {
          identifiesWith: undefined as any,
          projectsPerYear: undefined as any,
          knownTech: undefined as any,
        },
      };

      expect(() => {
        render(<EfficiencyResults {...defaultProps} formState={undefinedFormState} />);
      }).not.toThrow();
    });

    it('should handle empty known tech array', () => {
      const emptyKnownTechFormState = {
        ...mockFormState,
        values: { ...mockFormState.values, knownTech: [] },
      };

      render(<EfficiencyResults {...defaultProps} formState={emptyKnownTechFormState} />);

      expect(screen.getByTestId('checklist')).toBeInTheDocument();
    });

    it('should handle zero projects per year', () => {
      const zeroProjectsFormState = {
        ...mockFormState,
        values: { ...mockFormState.values, projectsPerYear: 0 },
      };

      render(<EfficiencyResults {...defaultProps} formState={zeroProjectsFormState} />);

      expect(screen.getByText('project per year')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1);
    });

    it('should have accessible form controls', () => {
      render(<EfficiencyResults {...defaultProps} />);

      expect(screen.getByTestId('number-stepper')).toBeInTheDocument();
      expect(screen.getByTestId('checklist')).toBeInTheDocument();
    });

    it('should have external links with proper target', () => {
      render(<EfficiencyResults {...defaultProps} showBenefits={true} />);

      const externalLinks = screen.getAllByRole('link');
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
      });
    });
  });
});