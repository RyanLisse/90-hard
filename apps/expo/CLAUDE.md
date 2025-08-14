# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Expo app in this repository.

## Expo App Overview

This is the mobile application for the 90-Hard fitness tracking app, built with Expo SDK 52. It provides native iOS and Android apps from the same codebase, with access to device features like camera, file system, and sensors.

## Key Features

- Native mobile app for iOS and Android
- Universal components from `@app-core`
- React Navigation with Expo Router
- Native device features (camera, image picker, etc.)
- NativeWind for Tailwind-style native styling
- Over-the-air updates with EAS Update

## Development Commands

```bash
# Run Expo development server
pnpm run dev:mobile

# Run on specific platforms
pnpm run ios              # iOS Simulator
pnpm run android          # Android Emulator

# Run Expo in web mode (experimental)
pnpm run expo:web

# Build for production
npx eas build --platform ios
npx eas build --platform android
```

## App Structure

```
/apps/expo/
├── app/                    # Expo Router directory
│   ├── (generated)/       # Auto-generated routes
│   ├── _layout.tsx        # Root layout with navigation
│   └── index.tsx          # Entry point
├── assets/                # Images, fonts, and other assets
├── components/            # Expo-specific components
├── metro.config.js        # Metro bundler configuration
├── app.json              # Expo configuration
└── package.json          # Dependencies and scripts
```

## Platform-Specific Patterns

### Component Resolution
- `.tsx` files: Universal components (work on both web and mobile)
- `.expo.tsx` or `.native.tsx`: Mobile-specific implementations
- Components from `@app-core` are automatically resolved for mobile

### Navigation
- Uses Expo Router (file-based routing)
- Routes defined in `/features/@app-core/routes/`
- Navigation handled by `@green-stack/core/navigation`

### Native Features
```typescript
// Camera access
import * as ImagePicker from 'expo-image-picker';

// File system
import * as FileSystem from 'expo-file-system';

// Permissions
import * as Permissions from 'expo-permissions';
```

## Common Tasks

### Adding a New Screen
1. Create route in `/features/@app-core/routes/`
2. Run `pnpm run link:routes` to sync with Expo
3. Route appears in `/app/(generated)/`

### Working with Images
```typescript
// Image picker implementation
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.8,
  base64: true,
});
```

### Platform-Specific Code
```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS specific code
} else if (Platform.OS === 'android') {
  // Android specific code
}
```

## Environment Variables

Mobile-specific env vars must be prefixed with `EXPO_PUBLIC_` for client access:
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_GRAPHQL_ENDPOINT`
- `EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID`

## Testing Considerations

- Component tests should mock native modules
- Use `@testing-library/react-native` for testing
- Mock Expo modules in `/test/mocks/`
- Device testing via Expo Go or development builds

## Building and Deployment

### Development Builds
```bash
# Create development build
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

### Production Builds
```bash
# Production build for app stores
npx eas build --profile production --platform ios
npx eas build --profile production --platform android
```

### Over-the-Air Updates
```bash
# Deploy update to existing apps
npx eas update --branch production
```

## Common Gotchas

1. **Route Generation**: Changes in `/features` require `pnpm run link:routes`
2. **Native Modules**: Some features require development builds, not Expo Go
3. **Permissions**: Always check and request permissions before using native features
4. **Image Assets**: Use `require()` for local images, URIs for remote
5. **Metro Cache**: Clear with `npx expo start -c` if bundling acts strange
6. **Platform Differences**: Test on both iOS and Android devices/simulators