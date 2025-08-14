// Mock React Native modules for testing
import React from 'react';
import { vi } from 'vitest';

// Mock Platform
export const Platform = {
  OS: 'web',
  select: vi.fn((obj) => obj.web || obj.default),
  Version: undefined,
  isTV: false,
  isTesting: true,
};

// Mock Dimensions
export const Dimensions = {
  get: vi.fn(() => ({
    width: 375,
    height: 812,
    scale: 1,
    fontScale: 1,
  })),
  set: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

// Create mock components that properly render in the DOM for testing
const createMockComponent = (name: string) => {
  return React.forwardRef((props: any, ref: any) => {
    const { children, testID, ...rest } = props;
    return React.createElement(
      'div',
      {
        'data-testid': testID,
        'data-component': name,
        ref,
        ...rest,
      },
      children
    );
  });
};

// Create text component that renders as span for proper text content testing
const MockText = React.forwardRef((props: any, ref: any) => {
  const { children, testID, ...rest } = props;
  return React.createElement(
    'span',
    {
      'data-testid': testID,
      'data-component': 'Text',
      ref,
      ...rest,
    },
    children
  );
});

// Create button component that renders as button for proper interaction testing
const createMockButton = (name: string) => {
  return React.forwardRef((props: any, ref: any) => {
    const { children, testID, onPress, disabled, ...rest } = props;
    return React.createElement(
      'button',
      {
        'data-testid': testID,
        'data-component': name,
        onClick: onPress,
        disabled,
        ref,
        ...rest,
      },
      children
    );
  });
};

// Mock ActivityIndicator component
const MockActivityIndicator = React.forwardRef((props: any, ref: any) => {
  return React.createElement('div', {
    'data-component': 'ActivityIndicator',
    'data-size': props.size,
    'data-color': props.color,
    ref,
    ...props,
  });
});

// Mock react-native module
vi.mock('react-native', () => ({
  Platform,
  Dimensions,
  View: createMockComponent('View'),
  Text: MockText,
  Image: createMockComponent('Image'),
  ScrollView: createMockComponent('ScrollView'),
  TouchableOpacity: createMockButton('TouchableOpacity'),
  TouchableHighlight: createMockButton('TouchableHighlight'),
  TouchableWithoutFeedback: createMockButton('TouchableWithoutFeedback'),
  SafeAreaView: createMockComponent('SafeAreaView'),
  ActivityIndicator: MockActivityIndicator,
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
    compose: (style1: any, style2: any) => [style1, style2],
    hairlineWidth: 1,
    absoluteFill: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
  },
  Animated: {
    View: createMockComponent('Animated.View'),
    Text: MockText,
    Image: createMockComponent('Animated.Image'),
    ScrollView: createMockComponent('Animated.ScrollView'),
    Value: vi.fn(() => ({ setValue: vi.fn() })),
    timing: vi.fn(() => ({ start: vi.fn() })),
    spring: vi.fn(() => ({ start: vi.fn() })),
    decay: vi.fn(() => ({ start: vi.fn() })),
    parallel: vi.fn(() => ({ start: vi.fn() })),
    sequence: vi.fn(() => ({ start: vi.fn() })),
  },
}));