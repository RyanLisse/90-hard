# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **FullProduct.dev** universal app built with the GREEN Stack (GraphQL, React-Native, Expo, Next.js). It's a monorepo that enables building for web (Next.js) and mobile (iOS/Android via Expo) from a single codebase.

## Architecture

### Monorepo Structure

- **`/apps`**: Application entry points
  - `/apps/next`: Next.js web app with SSR/SEO
  - `/apps/expo`: Expo mobile app for iOS/Android
- **`/features`**: Domain-organized feature workspaces
  - `/@app-core`: Core app functionality, UI components, GraphQL setup
- **`/packages`**: Shared utilities and infrastructure
  - `/@green-stack-core`: Framework utilities, generators, navigation
  - `/@db-driver`: Database abstraction layer
  - `/@registries`: Auto-generated registries for routes, schemas, etc.

### Key Architectural Patterns

1. **Universal Components**: Write once using React Native primitives, styled with NativeWind (Tailwind)
2. **Feature Workspaces**: Self-contained features with UI, API, schemas co-located
3. **Single Source of Truth**: Zod schemas define types, validation, GraphQL, and docs
4. **Auto-generation**: Routes, resolvers, and schemas are collected via Turbo scripts

## Common Development Commands

```bash
# Development
npm run dev              # Run both Next.js and Expo
npm run dev:web          # Run only Next.js
npm run dev:mobile       # Run only Expo
npm run ios              # Run iOS simulator
npm run android          # Run Android emulator

# Building
npm run build            # Build all apps
npm run build:preview    # Build and preview Next.js

# Testing (using Bun)
npm run test             # Run tests from @green-stack/core

# Code Generation
npm run add:schema       # Create new Zod schema with GraphQL types
npm run add:resolver     # Create new GraphQL resolver
npm run add:form         # Generate form from schema
npm run add:route        # Create new universal route
npm run add:workspace    # Add new feature workspace
npm run add:generator    # Create custom generator

# Schema & Route Collection (runs automatically)
npm run build:schema     # Rebuild GraphQL schema
npm run link:routes      # Link routes between apps
npm run collect:resolvers # Collect all resolvers
```

## Development Workflow

### Creating New Features

1. Use generators to scaffold: `npm run add:schema` → `npm run add:resolver` → `npm run add:route`
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

### Important Files

- `/features/@app-core/appConfig.ts`: Central configuration (URLs, feature flags)
- `/features/@app-core/graphql/schema.graphql`: Auto-generated GraphQL schema
- `/packages/@registries/*`: Auto-generated files (don't edit directly)

## Testing Strategy

- Unit tests use Bun test runner
- Components can be tested with React Testing Library
- Run specific test: `bun test <path-to-test>`

## Deployment Notes

- Next.js deploys to Vercel/similar (see `next.config.js`)
- Expo uses EAS Build for app stores
- Environment variables need `NEXT_PUBLIC_` or `EXPO_PUBLIC_` prefix for client access

## Common Gotchas

1. **Route Changes**: After adding routes, run `npm run link:routes`
2. **Schema Updates**: Changes require `npm run build:schema`
3. **Platform Imports**: Use `.tsx` for universal, `.expo.tsx`/`.next.tsx` for platform-specific
4. **Turbo Cache**: Clear with `npx turbo daemon clean` if builds act strangely
5. **Type Errors**: Ensure Zod schemas are properly exported and collected
