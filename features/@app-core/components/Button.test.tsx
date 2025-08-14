import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Button, type ButtonProps } from './Button';

// Mock dependencies
const mockNavigate = vi.fn();
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockThemeColor = '#3b82f6';

// Mock router
vi.mock('@green-stack/navigation', () => ({
  useRouter: () => ({
    navigate: mockNavigate,
    push: mockPush,
    replace: mockReplace,
  }),
}));

// Mock theme
vi.mock('@green-stack/styles', () => ({
  useThemeColor: () => mockThemeColor,
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Mock Icon component
vi.mock('@green-stack/components/Icon', () => ({
  Icon: ({ name, size, color, className }: any) => (
    <div
      data-testid={`icon-${name}`}
      data-size={size}
      data-color={color}
      className={className}
    >
      {name}
    </div>
  ),
}));

// Mock styled components
vi.mock('./styled', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
  Link: ({ children, href, className, onPress, ...props }: any) => (
    <a href={href} className={className} onClick={onPress} {...props}>
      {children}
    </a>
  ),
  Pressable: ({ children, className, onPress, disabled, ...props }: any) => (
    <button
      className={className}
      onClick={onPress}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  ),
  Text: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
  View: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

// Mock config
vi.mock('@app/config', () => ({
  isWeb: true,
}));

describe('Button', () => {
  const defaultProps: ButtonProps = {
    text: 'Click me',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI Rendering', () => {
    it('should render button with text', () => {
      render(<Button {...defaultProps} />);

      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render button with children instead of text', () => {
      render(<Button>Custom Content</Button>);

      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('should prioritize children over text prop', () => {
      render(<Button text="Text Prop">Children Content</Button>);

      expect(screen.getByText('Children Content')).toBeInTheDocument();
      expect(screen.queryByText('Text Prop')).not.toBeInTheDocument();
    });

    it('should render left icon when provided', () => {
      render(<Button {...defaultProps} iconLeft="CheckFilled" />);

      expect(screen.getByTestId('icon-CheckFilled')).toBeInTheDocument();
    });

    it('should render right icon when provided', () => {
      render(<Button {...defaultProps} iconRight="ArrowRightFilled" />);

      expect(screen.getByTestId('icon-ArrowRightFilled')).toBeInTheDocument();
    });

    it('should render both icons when provided', () => {
      render(
        <Button
          {...defaultProps}
          iconLeft="CheckFilled"
          iconRight="ArrowRightFilled"
        />
      );

      expect(screen.getByTestId('icon-CheckFilled')).toBeInTheDocument();
      expect(screen.getByTestId('icon-ArrowRightFilled')).toBeInTheDocument();
    });
  });

  describe('Button Types', () => {
    const types: ButtonProps['type'][] = [
      'primary',
      'secondary',
      'outline',
      'link',
      'warn',
      'danger',
      'info',
      'success',
    ];

    types.forEach((type) => {
      it(`should apply ${type} type styling`, () => {
        const { container } = render(<Button {...defaultProps} type={type} />);

        const button = container.querySelector('button');
        expect(button).toHaveClass(
          type === 'primary'
            ? 'bg-primary'
            : type === 'secondary'
            ? 'bg-secondary-foreground'
            : type === 'outline'
            ? 'border border-input bg-transparent'
            : type === 'link'
            ? 'border-none bg-transparent'
            : type === 'warn'
            ? 'bg-warn'
            : type === 'danger'
            ? 'bg-danger'
            : type === 'info'
            ? 'bg-info'
            : 'bg-success'
        );
      });
    });
  });

  describe('Button Sizes', () => {
    const sizes: ButtonProps['size'][] = ['sm', 'md', 'lg'];

    sizes.forEach((size) => {
      it(`should apply ${size} size styling`, () => {
        const { container } = render(<Button {...defaultProps} size={size} />);

        const button = container.querySelector('button');
        expect(button).toHaveClass(
          size === 'sm' ? 'p-2' : size === 'md' ? 'p-3' : 'p-4'
        );
      });

      it(`should apply ${size} text size`, () => {
        render(<Button {...defaultProps} size={size} />);

        const text = screen.getByText('Click me');
        expect(text).toHaveClass(
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
        );
      });

      it(`should apply ${size} icon size`, () => {
        render(
          <Button {...defaultProps} size={size} iconLeft="CheckFilled" />
        );

        const icon = screen.getByTestId('icon-CheckFilled');
        expect(icon).toHaveAttribute(
          'data-size',
          size === 'sm' ? '12' : size === 'lg' ? '18' : '16'
        );
      });
    });
  });

  describe('Disabled State', () => {
    it('should disable button when disabled prop is true', () => {
      const { container } = render(<Button {...defaultProps} disabled />);

      const button = container.querySelector('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('cursor-not-allowed opacity-75');
    });

    it('should not trigger onPress when disabled', () => {
      const mockOnPress = vi.fn();
      render(<Button {...defaultProps} disabled onPress={mockOnPress} />);

      const button = screen.getByText('Click me').closest('button');
      fireEvent.click(button!);

      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should not navigate when disabled', () => {
      render(<Button {...defaultProps} disabled href="/test" />);

      const button = screen.getByText('Click me').closest('button');
      fireEvent.click(button!);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should render as link when href is provided', () => {
      const { container } = render(<Button {...defaultProps} href="/test" />);

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should navigate on click when href is provided', () => {
      render(<Button {...defaultProps} href="/test" />);

      const link = screen.getByText('Click me').closest('a');
      fireEvent.click(link!);

      expect(mockNavigate).toHaveBeenCalledWith('/test');
    });

    it('should use push navigation when push prop is true', () => {
      render(<Button {...defaultProps} href="/test" push />);

      const link = screen.getByText('Click me').closest('a');
      fireEvent.click(link!);

      expect(mockPush).toHaveBeenCalledWith('/test');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should use replace navigation when replace prop is true', () => {
      render(<Button {...defaultProps} href="/test" replace />);

      const link = screen.getByText('Click me').closest('a');
      fireEvent.click(link!);

      expect(mockReplace).toHaveBeenCalledWith('/test');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should open in new tab when target="_blank"', () => {
      const mockOpen = vi.fn();
      global.window.open = mockOpen;

      render(<Button {...defaultProps} href="/test" target="_blank" />);

      const link = screen.getByText('Click me').closest('a');
      fireEvent.click(link!);

      expect(mockOpen).toHaveBeenCalledWith('/test', '_blank');
    });
  });

  describe('Event Handlers', () => {
    it('should call onPress when clicked', () => {
      const mockOnPress = vi.fn();
      render(<Button {...defaultProps} onPress={mockOnPress} />);

      const button = screen.getByText('Click me').closest('button');
      fireEvent.click(button!);

      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should call onPressIn when pressed down', () => {
      const mockOnPressIn = vi.fn();
      render(<Button {...defaultProps} onPressIn={mockOnPressIn} />);

      const button = screen.getByText('Click me').closest('button');
      fireEvent.mouseDown(button!);

      expect(mockOnPressIn).toHaveBeenCalledTimes(1);
    });

    it('should call onPressOut when released', () => {
      const mockOnPressOut = vi.fn();
      render(<Button {...defaultProps} onPressOut={mockOnPressOut} />);

      const button = screen.getByText('Click me').closest('button');
      fireEvent.mouseUp(button!);

      expect(mockOnPressOut).toHaveBeenCalledTimes(1);
    });

    it('should call onHoverIn when hovered', () => {
      const mockOnHoverIn = vi.fn();
      render(<Button {...defaultProps} onHoverIn={mockOnHoverIn} />);

      const button = screen.getByText('Click me').closest('button');
      fireEvent.mouseEnter(button!);

      expect(mockOnHoverIn).toHaveBeenCalledTimes(1);
    });

    it('should call onHoverOut when hover ends', () => {
      const mockOnHoverOut = vi.fn();
      render(<Button {...defaultProps} onHoverOut={mockOnHoverOut} />);

      const button = screen.getByText('Click me').closest('button');
      fireEvent.mouseLeave(button!);

      expect(mockOnHoverOut).toHaveBeenCalledTimes(1);
    });

    it('should call onLongPress on long press', () => {
      const mockOnLongPress = vi.fn();
      render(<Button {...defaultProps} onLongPress={mockOnLongPress} />);

      const button = screen.getByText('Click me').closest('button');
      fireEvent.contextMenu(button!);

      expect(mockOnLongPress).toHaveBeenCalledTimes(1);
    });

    it('should call onFocus when focused', () => {
      const mockOnFocus = vi.fn();
      render(<Button {...defaultProps} onFocus={mockOnFocus} />);

      const button = screen.getByText('Click me').closest('button');
      fireEvent.focus(button!);

      expect(mockOnFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur when blurred', () => {
      const mockOnBlur = vi.fn();
      render(<Button {...defaultProps} onBlur={mockOnBlur} />);

      const button = screen.getByText('Click me').closest('button');
      fireEvent.blur(button!);

      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Full Width', () => {
    it('should apply full width styling when fullWidth is true', () => {
      const { container } = render(<Button {...defaultProps} fullWidth />);

      const button = container.querySelector('button');
      expect(button).toHaveClass('w-full');
    });

    it('should apply self-start when fullWidth is false', () => {
      const { container } = render(
        <Button {...defaultProps} fullWidth={false} />
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('self-start');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <Button {...defaultProps} className="custom-class" />
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should apply custom textClassName', () => {
      render(<Button {...defaultProps} textClassName="custom-text-class" />);

      const text = screen.getByText('Click me');
      expect(text).toHaveClass('custom-text-class');
    });

    it('should apply custom style prop', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(
        <Button {...defaultProps} style={customStyle} />
      );

      const button = container.querySelector('button');
      expect(button).toHaveStyle(customStyle);
    });
  });

  describe('Icon Spacing', () => {
    it('should add left padding to text when left icon exists', () => {
      render(<Button {...defaultProps} iconLeft="CheckFilled" />);

      const text = screen.getByText('Click me');
      expect(text).toHaveClass('pl-2');
    });

    it('should add right padding to text when right icon exists', () => {
      render(<Button {...defaultProps} iconRight="ArrowRightFilled" />);

      const text = screen.getByText('Click me');
      expect(text).toHaveClass('pr-2');
    });

    it('should add both paddings when both icons exist', () => {
      render(
        <Button
          {...defaultProps}
          iconLeft="CheckFilled"
          iconRight="ArrowRightFilled"
        />
      );

      const text = screen.getByText('Click me');
      expect(text).toHaveClass('pl-2', 'pr-2');
    });
  });

  describe('Edge Cases', () => {
    it('should render without text or children', () => {
      const { container } = render(<Button />);

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle both onPress and href', () => {
      const mockOnPress = vi.fn();
      render(
        <Button {...defaultProps} href="/test" onPress={mockOnPress} />
      );

      const link = screen.getByText('Click me').closest('a');
      fireEvent.click(link!);

      expect(mockOnPress).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/test');
    });

    it('should handle mounting state correctly', async () => {
      const { container } = render(<Button {...defaultProps} />);

      // Initially renders as button
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();

      // Wait for mount effect
      await waitFor(() => {
        // Should still be a button after mount
        expect(container.querySelector('button')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper hit slop for touch targets', () => {
      const { container } = render(<Button {...defaultProps} />);

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('hitSlop', '10');
    });

    it('should allow custom hit slop', () => {
      const { container } = render(<Button {...defaultProps} hitSlop={20} />);

      const button = container.querySelector('button');
      expect(button).toHaveAttribute('hitSlop', '20');
    });

    it('should be keyboard navigable', () => {
      render(<Button {...defaultProps} />);

      const button = screen.getByText('Click me').closest('button');
      expect(button).toBeInTheDocument();
      // Buttons are inherently keyboard accessible
    });
  });
});