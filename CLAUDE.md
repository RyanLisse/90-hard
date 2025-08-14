# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **90-Hard** universal app built with the GREEN Stack (GraphQL, React-Native, Expo, Next.js). It's a monorepo that enables building for web (Next.js) and mobile (iOS/Android via Expo) from a single codebase. The app tracks 90-day fitness challenges with features for photo capture, voice journaling, weight/fasting tracking, and analytics.

## Architecture

### Monorepo Structure

- **`/apps`**: Application entry points
  - `/apps/next`: Next.js web app (v15.4.6) with SSR/SEO
  - `/apps/expo`: Expo mobile app (v52.0.11) for iOS/Android
- **`/features`**: Domain-organized feature workspaces
  - `/@app-core`: Core app functionality, UI components, GraphQL setup
    - `/components`: Shared UI components (photo, charts, analytics)
    - `/domains`: Business logic (tracking, analytics, health, gamification)
    - `/services`: Service layer (photo compression, etc.)
    - `/graphql`: GraphQL schema and configuration
- **`/packages`**: Shared utilities and infrastructure
  - `/@green-stack-core`: Framework utilities, generators, navigation
  - `/@db-driver`: Database abstraction layer
  - `/@registries`: Auto-generated registries for routes, schemas, etc.
  - `/domain`: Domain types and repository/service contracts
  - `/infrastructure`: External services integration (InstantDB)

### Key Architectural Patterns

1. **Universal Components**: Write once using React Native primitives, styled with NativeWind (Tailwind)
2. **Feature Workspaces**: Self-contained features with UI, API, schemas co-located
3. **Single Source of Truth**: Zod schemas define types, validation, GraphQL, and docs
4. **Auto-generation**: Routes, resolvers, and schemas are collected via Turbo scripts
5. **TDD London Style**: 100% test coverage with strict test isolation

## Common Development Commands

```bash
# Development
pnpm run dev              # Run both Next.js and Expo
pnpm run dev:web          # Run only Next.js
pnpm run dev:mobile       # Run only Expo
pnpm run ios              # Run iOS simulator
pnpm run android          # Run Android emulator

# Building
pnpm run build            # Build all apps
pnpm run build:preview    # Build and preview Next.js

# Testing - Using Vitest (NOT Bun test runner)
pnpm run test             # Run all tests once
pnpm run test:watch       # Run tests in watch mode
pnpm run test:ui          # Open Vitest UI
pnpm run test:coverage    # Run with coverage report
pnpm run test:echo        # Run with browser console logging
pnpm test -- path/to/file.test.ts  # Run specific test file

# E2E Testing - Using Playwright
pnpm run test:e2e         # Run all E2E tests
pnpm run test:e2e:ui      # Open Playwright UI
pnpm run test:e2e:debug   # Debug mode
pnpm run test:e2e:headed  # Run in headed browser
pnpm run test:e2e:report  # Show test report

# Code Generation
pnpm run add:schema       # Create new Zod schema with GraphQL types
pnpm run add:resolver     # Create new GraphQL resolver
pnpm run add:form         # Generate form from schema
pnpm run add:route        # Create new universal route
pnpm run add:workspace    # Add new feature workspace
pnpm run add:generator    # Create custom generator

# Schema & Route Collection (runs automatically)
pnpm run build:schema     # Rebuild GraphQL schema
pnpm run link:routes      # Link routes between apps
pnpm run collect:resolvers # Collect all resolvers
```

## Development Workflow

### Creating New Features

1. Use generators to scaffold: `pnpm run add:schema` → `pnpm run add:resolver` → `pnpm run add:route`
2. Features go in `/features/<feature-name>/` with standard structure:
   - `/schemas`: Zod schemas (single source of truth)
   - `/resolvers`: GraphQL resolvers and API handlers
   - `/routes`: Universal route components
   - `/screens`: Screen components used by routes
   - `/components`: Reusable UI components

### Universal UI Development

- Use React Native primitives: `View`, `Text`, `Image` (auto-resolved per platform)
- Style with NativeWind classes: `className="flex-1 bg-white p-4"`
- Platform-specific code: `Component.expo.tsx` / `Component.next.tsx`
- Universal navigation via `@green-stack/core/navigation`

### API Development

- GraphQL endpoint: `/api/graphql` (auto-generated from Zod schemas)
- REST endpoints: Create in `/routes/api/*/route.ts`
- Universal data fetching: Use React Query with generated hooks
- Type safety: All types derived from Zod schemas

### Testing Guidelines

**Unit Testing (Vitest)**:
- Framework: Vitest with React Testing Library
- Coverage requirement: 100% (lines, functions, branches, statements)
- Style: TDD London approach with full test isolation
- Config: `/vitest.config.ts`
- Mocks: Place in `/test/mocks/` directory
- Running: Tests run in parallel using thread pool

**E2E Testing (Playwright)**:
- Config: `/playwright.config.ts`
- Test directory: `/e2e/`
- Browsers: Chrome, Firefox, Safari, and mobile viewports
- Base URL: `http://localhost:3000` (configurable via PLAYWRIGHT_BASE_URL)
- Features: Screenshots/videos on failure, trace on retry

**Pre-commit Hooks**:
- Husky runs lint-staged before commits
- Automatic formatting with Biome
- Tests must pass before commit

### Important Files

- `/features/@app-core/appConfig.ts`: Central configuration (URLs, feature flags)
- `/features/@app-core/graphql/schema.graphql`: Auto-generated GraphQL schema
- `/packages/@registries/*`: Auto-generated files (don't edit directly)
- `/vitest.config.ts`: Test runner configuration
- `/playwright.config.ts`: E2E test configuration
- `/biome.jsonc`: Linting and formatting rules

## Deployment Notes

- Next.js deploys to Vercel/similar (see `next.config.js`)
- Expo uses EAS Build for app stores
- Environment variables need `NEXT_PUBLIC_` or `EXPO_PUBLIC_` prefix for client access
- Cloudflare Images/R2 integration for photo storage

## Common Gotchas

1. **Route Changes**: After adding routes, run `npm run link:routes`
2. **Schema Updates**: Changes require `npm run build:schema`
3. **Platform Imports**: Use `.tsx` for universal, `.expo.tsx`/`.next.tsx` for platform-specific
4. **Turbo Cache**: Clear with `npx turbo daemon clean` if builds act strangely
5. **Type Errors**: Ensure Zod schemas are properly exported and collected
6. **Test Isolation**: Each test runs in isolation; mocks are automatically reset
7. **Coverage**: New code must maintain 100% test coverage or tests will fail
