/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        name: 'next',
        root: './apps/next',
        environment: 'happy-dom',
        include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
      },
      {
        name: 'expo',
        root: './apps/expo',
        environment: 'happy-dom',
        include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
        setupFiles: ['../test/setup.native.ts'],
      },
      {
        name: 'app-core',
        root: './features/@app-core',
        environment: 'happy-dom',
        include: ['**/*.{test,spec}.{js,ts,jsx,tsx}', '**/__tests__/**/*.{js,ts,jsx,tsx}'],
        setupFiles: ['../../test/setup.ts'],
      },
      {
        name: 'packages',
        root: './packages',
        environment: 'happy-dom',
        include: ['**/*.{test,spec}.{js,ts,jsx,tsx}', '**/__tests__/**/*.{js,ts,jsx,tsx}'],
      },
    ],
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    alias: [],
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/playwright/**',
      '**/.next/**',
      '**/build/**',
      '**/out/**',
      // Exclude Bun-specific tests to avoid bun:test import errors
      '**/*.bun.test.*',
      '**/__bun__/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '**/__tests__/**',
        '**/index.ts', // Barrel exports
        '**/*.generated.ts',
        '**/generated/**',
        '**/.next/**',
        '**/build/**',
        '**/dist/**',
        '**/out/**',
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      all: true,
      clean: true,
      skipFull: true,
    },
    reporters: ['default', 'html'],
    // Browser echo configuration
    onConsoleLog(log, type) {
      if (process.env.BROWSER_ECHO === 'true') {
        console.log(`[TEST ${type.toUpperCase()}]`, ...log);
      }
    },
    // TDD London style - fail fast on first failure
    bail: process.env.CI ? 1 : 0,
    // Performance optimizations
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    // Test isolation for TDD London approach
    isolate: true,
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@app/core': resolve(__dirname, './features/@app-core'),
      '@app/expo': resolve(__dirname, './apps/expo'),
      '@app/next': resolve(__dirname, './apps/next'),
      'react-native': 'react-native-web',
      'expo-image-picker': resolve(__dirname, './test/mocks/expo-image-picker.ts'),
    },
  },
});
