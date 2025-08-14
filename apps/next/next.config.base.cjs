'use strict';
/** @type {import('next').NextConfig} */
const mainNextConfig = {
  reactStrictMode: true,
  logging: false, // -i- https://nextjs.org/docs/app/api-reference/config/next-config-js/logging
  transpilePackages: [
    'react-native',
    'react-native-web',
    'react-native-svg',
    'expo',
    'expo-constants',
    'expo-modules-core',
    '@rn-primitives/hooks',
    '@rn-primitives/slot',
    '@rn-primitives/portal',
    '@rn-primitives/switch',
    '@rn-primitives/radio-group',
    '@rn-primitives/checkbox',
    '@rn-primitives/select',
    'nativewind',
    'react-native-css-interop',
    'react-native-reanimated',
    'react-native-safe-area-context',
    // Add more React Native / Expo packages here...
  ],
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'codinsonn.dev',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Some dependencies (or transitive deps) may import Node builtins with the `node:` scheme.
    // Webpack may choke on these in certain setups. Alias them to their plain equivalents.
    config.resolve = config.resolve || {};
    const path = require('node:path');
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'node:os': 'os',
      'node:path': 'path',
      'node:fs': 'fs',
      'node:url': 'url',
      'node:process': 'process',
      'node:perf_hooks': false,
      perf_hooks: false,
      'node:v8': false,
      v8: false,
      // TS path aliases, mirrored for Webpack so runtime can resolve
      '@app': path.resolve(__dirname, '../../features/@app-core'),
      '@app/registries': path.resolve(__dirname, '../../packages/@registries'),
      '@green-stack': path.resolve(
        __dirname,
        '../../packages/@green-stack-core'
      ),
      '@green-stack/core': path.resolve(
        __dirname,
        '../../packages/@green-stack-core'
      ),
    };
    // Prevent client bundles from attempting to polyfill Node core deps or OTel/gcp-metadata
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        os: false,
        path: false,
        url: false,
        assert: false,
        perf_hooks: false,
        v8: false,
        process: false,
      };
      // Alias heavy server-only libs to false on client
      Object.assign(config.resolve.alias, {
        '@opentelemetry/api': false,
        '@opentelemetry/core': false,
        '@opentelemetry/sdk-node': false,
        '@opentelemetry/auto-instrumentations-node': false,
        '@opentelemetry/resources': false,
        '@opentelemetry/semantic-conventions': false,
        '@opentelemetry/exporter-trace-otlp-http': false,
        'gcp-metadata': false,
        'https-proxy-agent': false,
        gaxios: false,
      });
    }
    return config;
  },
};

// Re-exported separately so it can be reused
// in other configs like in `with/automatic-docs`
module.exports = mainNextConfig;
