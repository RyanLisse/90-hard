import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Apps
  {
    extends: './vitest.config.ts',
    test: {
      name: 'next',
      root: './apps/next',
      environment: 'happy-dom',
      include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'expo',
      root: './apps/expo',
      environment: 'happy-dom',
      include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
      globals: true,
      // React Native specific setup
      setupFiles: ['./test/setup.native.ts'],
    },
  },
  // Features
  {
    extends: './vitest.config.ts',
    test: {
      name: 'app-core',
      root: './features/@app-core',
      environment: 'happy-dom',
      include: [
        '**/*.{test,spec}.{js,ts,jsx,tsx}',
        '**/__tests__/**/*.{js,ts,jsx,tsx}',
      ],
    },
  },
  // Packages
  {
    extends: './vitest.config.ts',
    test: {
      name: 'packages',
      root: './packages',
      environment: 'happy-dom',
      include: [
        '**/*.{test,spec}.{js,ts,jsx,tsx}',
        '**/__tests__/**/*.{js,ts,jsx,tsx}',
      ],
    },
  },
]);
