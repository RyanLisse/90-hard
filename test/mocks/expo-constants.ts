// Mock expo-constants for testing
import { vi } from 'vitest';

const Constants = {
  appOwnership: null,
  debugMode: false,
  deviceName: 'Test Device',
  deviceYearClass: null,
  expoConfig: {
    name: '90-hard',
    slug: '90-hard',
    version: '1.0.0',
    platforms: ['ios', 'android', 'web'],
  },
  expoGoConfig: null,
  expoVersion: null,
  experienceUrl: null,
  getWebViewUserAgentAsync: vi.fn().mockResolvedValue('Test User Agent'),
  installationId: 'test-installation-id',
  isDetached: false,
  isDevice: false,
  isHeadless: false,
  linkingUri: null,
  manifest: null,
  manifest2: null,
  nativeAppVersion: null,
  nativeBuildVersion: null,
  platform: {
    ios: null,
    android: null,
    web: {},
  },
  sessionId: 'test-session-id',
  statusBarHeight: 20,
  systemFonts: ['System'],
  getWebViewUserAgent: () => 'Test User Agent',
};

vi.mock('expo-constants', () => ({
  default: Constants,
  ...Constants,
}));

export default Constants;