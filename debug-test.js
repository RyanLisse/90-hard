// Quick debug script to test CSS variable behavior
const { render, screen } = require('@testing-library/react');
const React = require('react');

// Simple test component that mimics the ProgressChart behavior
function TestComponent({ color = "hsl(var(--chart-1))" }) {
  return React.createElement('div', {
    'data-testid': 'test-element',
    style: { color }
  }, '90%');
}

// Run the test
const { container } = render(React.createElement(TestComponent));
const element = screen.getByTestId('test-element');

console.log('Element outerHTML:', element.outerHTML);
console.log('Element style:', element.style.color);
console.log('Computed style:', window.getComputedStyle(element).color);