# Repository Guidelines

This monorepo provides a universal app starter using the GREEN stack (GraphQL, React Native, Expo, Next.js) and Turborepo workspaces. Code quality and a11y are enforced via Ultracite (Biome).

## Project Structure & Module Organization

- `apps/next`: Next.js web app (SSR).
- `apps/expo`: Expo app for iOS/Android/Web.
- `features/@app-core`: Feature workspace(s) with UI, APIs, schemas.
- `packages/@green-stack-core`: Shared core, generators, schemas, scripts.
- `packages/@db-driver`: Database driver layer and models.
- `packages/@registries`: Registries and linking helpers.
- Config: `biome.jsonc`, `turbo.json`, `tsconfig.json`, `lefthook.yml`.

## Build, Test, and Development Commands

- `npm run dev`: Start all apps in dev via Turborepo.
- `npm run dev:web` / `npm run dev:mobile`: Run a single target.
- `npm run build`: Build all workspaces; `npm run build:preview` builds and starts Next.js.
- `npm run android` / `npm run ios` / `npm run expo:web`: Expo targets.
- `npm run env:local`: Seed `.env.local` from `.env.example` (per app).
- Lint/format: `npx ultracite lint` and `npx ultracite format`.

## Coding Style & Naming Conventions

- TypeScript-first; Node `>=18.19.1`.
- Biome via Ultracite; pre-commit runs `ultracite` through `lint-staged`.
- Components: PascalCase for React components; follow existing file/route patterns per workspace.
- Prefer functional components, `const`, explicit exports; avoid unused code and `console`.

## Testing Guidelines

- No test framework is bundled by default. Add Jest/Vitest per workspace as needed.
- Place tests alongside sources using `*.test.ts(x)` or in `__tests__/`.
- Ensure builds pass and run `npx ultracite lint` before opening a PR.

## Commit & Pull Request Guidelines

- Commits: Clear, imperative subject; scope by workspace when useful (e.g., `apps/next: fix routing bug`).
- PRs: Include description, linked issues, and screenshots for UI changes; call out schema/generator updates.
- Checks: PRs should build successfully and pass lint/format.

## Security & Configuration Tips

- Never commit secrets. Use per-app `.env.local` (`npm run env:local`).
- Keep `patches/` under version control; document changes to patches in PRs.
- Add new functionality as feature workspaces or within `features/` to keep portability.

