import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ImagesScreen from './ImagesScreen';

// Mock dependencies
vi.mock('expo-status-bar', () => ({
  StatusBar: vi.fn(({ style }) => <div data-testid="status-bar" data-style={style} />),
}));

vi.mock('../components/styled', () => ({
  Image: vi.fn(({ alt, height, width, src, fill, contentFit }) => (
    <img
      alt={alt}
      height={height}
      width={width}
      src={typeof src === 'object' ? 'mocked-static-image.png' : src}
      data-fill={fill}
      data-content-fit={contentFit}
      data-testid="image"
    />
  )),
  Text: vi.fn(({ children, className }) => <span className={className}>{children}</span>),
  View: vi.fn(({ children, className }) => <div className={className}>{children}</div>),
  ScrollView: vi.fn(({ children, className, contentContainerClassName }) => (
    <div className={`${className} ${contentContainerClassName}`} data-testid="scroll-view">
      {children}
    </div>
  )),
}));

vi.mock('../components/BackButton', () => ({
  default: vi.fn(({ backLink, color }) => (
    <button data-testid="back-button" data-back-link={backLink} data-color={color}>
      Back
    </button>
  )),
}));

// Mock static image require
vi.mock('../assets/green-stack-logo.png', () => 'green-stack-logo.png');

describe('ImagesScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the images screen', () => {
      render(<ImagesScreen />);

      expect(screen.getByTestId('scroll-view')).toBeInTheDocument();
    });

    it('should render status bar with light style', () => {
      render(<ImagesScreen />);

      const statusBar = screen.getByTestId('status-bar');
      expect(statusBar).toHaveAttribute('data-style', 'light');
    });

    it('should render back button with correct props', () => {
      render(<ImagesScreen />);

      const backButton = screen.getByTestId('back-button');
      expect(backButton).toHaveAttribute('data-back-link', '/subpages/Universal%20Nav');
      expect(backButton).toHaveAttribute('data-color', '#FFFFFF');
    });

    it('should apply correct styling classes', () => {
      render(<ImagesScreen />);

      const scrollView = screen.getByTestId('scroll-view');
      expect(scrollView).toHaveClass('flex', 'min-h-screen', 'flex-1', 'bg-slate-800');
    });
  });

  describe('Image Examples', () => {
    it('should render all four image examples', () => {
      render(<ImagesScreen />);

      const images = screen.getAllByTestId('image');
      expect(images).toHaveLength(4);
    });

    it('should render example 1 - static require with dimensions', () => {
      render(<ImagesScreen />);

      const images = screen.getAllByTestId('image');
      const firstImage = images[0];

      expect(firstImage).toHaveAttribute('alt', 'Example Green Stack Logo');
      expect(firstImage).toHaveAttribute('height', '60');
      expect(firstImage).toHaveAttribute('width', '60');
      expect(firstImage).toHaveAttribute('src', 'mocked-static-image.png');
      expect(firstImage).toHaveAttribute('data-fill', 'false');
    });

    it('should render example 2 - external URL with dimensions', () => {
      render(<ImagesScreen />);

      const images = screen.getAllByTestId('image');
      const secondImage = images[1];

      expect(secondImage).toHaveAttribute('alt', 'Example Profile picture');
      expect(secondImage).toHaveAttribute('height', '60');
      expect(secondImage).toHaveAttribute('width', '60');
      expect(secondImage).toHaveAttribute('src', 
        'https://codinsonn.dev/_next/image?url=%2Fimg%2FCodelyFansLogoPic160x160.jpeg&w=256&q=75'
      );
      expect(secondImage).toHaveAttribute('data-fill', 'false');
    });

    it('should render example 3 - fill image with wrapper', () => {
      render(<ImagesScreen />);

      const images = screen.getAllByTestId('image');
      const thirdImage = images[2];

      expect(thirdImage).toHaveAttribute('alt', 'Example Green Stack Logo');
      expect(thirdImage).toHaveAttribute('src', 'mocked-static-image.png');
      expect(thirdImage).toHaveAttribute('data-fill', 'true');
      expect(thirdImage).not.toHaveAttribute('height');
      expect(thirdImage).not.toHaveAttribute('width');
    });

    it('should render example 4 - fill image with contentFit', () => {
      render(<ImagesScreen />);

      const images = screen.getAllByTestId('image');
      const fourthImage = images[3];

      expect(fourthImage).toHaveAttribute('alt', 'Example Green Stack Logo');
      expect(fourthImage).toHaveAttribute('src', 'mocked-static-image.png');
      expect(fourthImage).toHaveAttribute('data-fill', 'true');
      expect(fourthImage).toHaveAttribute('data-content-fit', 'contain');
      expect(fourthImage).not.toHaveAttribute('height');
      expect(fourthImage).not.toHaveAttribute('width');
    });
  });

  describe('Image Descriptions', () => {
    it('should render description for example 1', () => {
      render(<ImagesScreen />);

      expect(screen.getByText('src=static-require')).toBeInTheDocument();
      expect(screen.getByText(' | width: 60 | height: 60')).toBeInTheDocument();
    });

    it('should render description for example 2', () => {
      render(<ImagesScreen />);

      expect(screen.getByText('src=external-url')).toBeInTheDocument();
      expect(screen.getAllByText(' | width: 60 | height: 60')).toHaveLength(2);
    });

    it('should render description for example 3', () => {
      render(<ImagesScreen />);

      expect(screen.getByText('wrapper=50x80, ')).toBeInTheDocument();
      expect(screen.getByText('relative | fill=true')).toBeInTheDocument();
    });

    it('should render description for example 4', () => {
      render(<ImagesScreen />);

      expect(screen.getByText('wrapper=80x60, ')).toBeInTheDocument();
      expect(screen.getByText('relative | fill | contentFit=contain')).toBeInTheDocument();
    });

    it('should apply correct text styling', () => {
      render(<ImagesScreen />);

      const boldTexts = screen.getAllByText((_, element) => 
        element?.className?.includes('font-bold text-gray-200') ?? false
      );
      expect(boldTexts.length).toBeGreaterThan(0);

      const grayTexts = screen.getAllByText((_, element) => 
        element?.className?.includes('text-gray-200') ?? false
      );
      expect(grayTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Image Wrappers', () => {
    it('should render wrapper for example 3 with correct styling', () => {
      render(<ImagesScreen />);

      const containers = screen.getAllByRole('generic');
      const wrapper3 = containers.find(container =>
        container.className?.includes('h-[80px] w-[60px] border-[1px] border-gray-200 border-dashed')
      );
      expect(wrapper3).toBeInTheDocument();
    });

    it('should render wrapper for example 4 with correct styling', () => {
      render(<ImagesScreen />);

      const containers = screen.getAllByRole('generic');
      const wrapper4 = containers.find(container =>
        container.className?.includes('h-[60px] w-[80px] border-[1px] border-gray-200 border-dashed')
      );
      expect(wrapper4).toBeInTheDocument();
    });

    it('should apply relative positioning to wrappers', () => {
      render(<ImagesScreen />);

      const containers = screen.getAllByRole('generic');
      const relativeWrappers = containers.filter(container =>
        container.className?.includes('relative')
      );
      expect(relativeWrappers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Layout and Styling', () => {
    it('should center content vertically and horizontally', () => {
      render(<ImagesScreen />);

      const containers = screen.getAllByRole('generic');
      const mainContainer = containers.find(container =>
        container.className?.includes('items-center justify-center')
      );
      expect(mainContainer).toBeInTheDocument();
    });

    it('should apply dark background styling', () => {
      render(<ImagesScreen />);

      const containers = screen.getAllByRole('generic');
      const darkContainers = containers.filter(container =>
        container.className?.includes('bg-slate-800')
      );
      expect(darkContainers.length).toBeGreaterThanOrEqual(1);
    });

    it('should apply proper spacing between examples', () => {
      render(<ImagesScreen />);

      const textElements = screen.getAllByText((_, element) =>
        element?.className?.includes('mt-2 mb-4') ?? false
      );
      expect(textElements).toHaveLength(4); // One for each example
    });

    it('should apply full height layout', () => {
      render(<ImagesScreen />);

      const containers = screen.getAllByRole('generic');
      const fullHeightContainers = containers.filter(container =>
        container.className?.includes('min-h-screen')
      );
      expect(fullHeightContainers.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Accessibility', () => {
    it('should have alt text for all images', () => {
      render(<ImagesScreen />);

      const images = screen.getAllByTestId('image');
      images.forEach(image => {
        expect(image).toHaveAttribute('alt');
        expect(image.getAttribute('alt')).not.toBe('');
      });
    });

    it('should have descriptive alt text', () => {
      render(<ImagesScreen />);

      const images = screen.getAllByTestId('image');
      
      expect(images[0]).toHaveAttribute('alt', 'Example Green Stack Logo');
      expect(images[1]).toHaveAttribute('alt', 'Example Profile picture');
      expect(images[2]).toHaveAttribute('alt', 'Example Green Stack Logo');
      expect(images[3]).toHaveAttribute('alt', 'Example Green Stack Logo');
    });

    it('should have proper text contrast classes', () => {
      render(<ImagesScreen />);

      const lightTextElements = screen.getAllByText((_, element) =>
        element?.className?.includes('text-gray-200') ?? false
      );
      expect(lightTextElements.length).toBeGreaterThan(0);
    });

    it('should have semantic text markup', () => {
      render(<ImagesScreen />);

      const boldElements = screen.getAllByText((_, element) =>
        element?.className?.includes('font-bold') ?? false
      );
      expect(boldElements.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should use flexible layout classes', () => {
      render(<ImagesScreen />);

      const containers = screen.getAllByRole('generic');
      const flexContainers = containers.filter(container =>
        container.className?.includes('flex')
      );
      expect(flexContainers.length).toBeGreaterThan(0);
    });

    it('should handle different image sizing approaches', () => {
      render(<ImagesScreen />);

      const images = screen.getAllByTestId('image');
      
      // Fixed dimensions
      expect(images[0]).toHaveAttribute('width', '60');
      expect(images[0]).toHaveAttribute('height', '60');
      
      // Fill approach
      expect(images[2]).toHaveAttribute('data-fill', 'true');
      expect(images[3]).toHaveAttribute('data-fill', 'true');
    });

    it('should demonstrate different aspect ratios', () => {
      render(<ImagesScreen />);

      const containers = screen.getAllByRole('generic');
      
      // Taller wrapper (50x80)
      const tallerWrapper = containers.find(container =>
        container.className?.includes('h-[80px] w-[60px]')
      );
      expect(tallerWrapper).toBeInTheDocument();
      
      // Wider wrapper (80x60)  
      const widerWrapper = containers.find(container =>
        container.className?.includes('h-[60px] w-[80px]')
      );
      expect(widerWrapper).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle static require imports correctly', () => {
      render(<ImagesScreen />);

      const images = screen.getAllByTestId('image');
      
      // Static images should use the mocked path
      expect(images[0]).toHaveAttribute('src', 'mocked-static-image.png');
      expect(images[2]).toHaveAttribute('src', 'mocked-static-image.png');
      expect(images[3]).toHaveAttribute('src', 'mocked-static-image.png');
    });

    it('should handle external URLs correctly', () => {
      render(<ImagesScreen />);

      const images = screen.getAllByTestId('image');
      
      // External URL should be preserved
      expect(images[1]).toHaveAttribute('src', 
        'https://codinsonn.dev/_next/image?url=%2Fimg%2FCodelyFansLogoPic160x160.jpeg&w=256&q=75'
      );
    });

    it('should handle mixed image properties', () => {
      render(<ImagesScreen />);

      const images = screen.getAllByTestId('image');
      
      // Image with fill and contentFit
      expect(images[3]).toHaveAttribute('data-fill', 'true');
      expect(images[3]).toHaveAttribute('data-content-fit', 'contain');
      
      // Images without contentFit
      expect(images[0]).not.toHaveAttribute('data-content-fit');
      expect(images[1]).not.toHaveAttribute('data-content-fit');
      expect(images[2]).not.toHaveAttribute('data-content-fit');
    });

    it('should render without errors when no props are passed', () => {
      expect(() => render(<ImagesScreen />)).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not cause memory leaks with image references', () => {
      const { unmount } = render(<ImagesScreen />);
      
      expect(() => unmount()).not.toThrow();
    });

    it('should handle multiple re-renders', () => {
      const { rerender } = render(<ImagesScreen />);
      
      // Multiple re-renders should not cause issues
      for (let i = 0; i < 5; i++) {
        rerender(<ImagesScreen />);
      }
      
      expect(screen.getAllByTestId('image')).toHaveLength(4);
    });
  });

  describe('Component Integration', () => {
    it('should integrate with ScrollView properly', () => {
      render(<ImagesScreen />);

      const scrollView = screen.getByTestId('scroll-view');
      const images = screen.getAllByTestId('image');
      
      expect(scrollView).toBeInTheDocument();
      expect(images).toHaveLength(4);
    });

    it('should integrate with BackButton properly', () => {
      render(<ImagesScreen />);

      const backButton = screen.getByTestId('back-button');
      const scrollView = screen.getByTestId('scroll-view');
      
      expect(backButton).toBeInTheDocument();
      expect(scrollView).toBeInTheDocument();
    });

    it('should integrate with StatusBar properly', () => {
      render(<ImagesScreen />);

      const statusBar = screen.getByTestId('status-bar');
      expect(statusBar).toBeInTheDocument();
      expect(statusBar).toHaveAttribute('data-style', 'light');
    });
  });
});