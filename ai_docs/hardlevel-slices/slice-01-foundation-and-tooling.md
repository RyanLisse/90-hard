# Slice 1: Foundation & Tooling

## What You're Building

Monorepo foundation (Web+Mobile), Bun/biome/commitlint/Husky, test infra, and InstantDB bootstrap.

## Tasks

### 1. Monorepo & Stacks - Complexity: 3

- [x] Init monorepo (Next.js 15 for web, Expo for mobile) or clone Green Stack starter
- [x] Add Bun as test runner & scripts
- [ ] Wire InstantDB client + env (`VITE_INSTANTDB_APP_ID`)
- [x] Write tests (domain contracts compile & run)
- [ ] Test passes locally

**If Complexity > 3, break into smaller subtasks:**

- **Subtask 1.1:** Ensure strict TS config (noImplicitAny, exactOptionalPropertyTypes) - Complexity: 2
- **Subtask 1.2:** Create `.env.example` and safe config loader - Complexity: 1 ✅

### 2. Quality & Hooks - Complexity: 2

- [x] Configure Biome (or ESLint+Prettier) and lint-staged
- [ ] Setup commitlint + Husky (`commit-msg`, `pre-commit`)
- [ ] Add CI workflow (bun test/lint/build)
- [ ] Write tests (lint script smoke)
- [ ] Test passes locally

## Code Example

```javascript
// packages/domain/src/types.ts
import { z } from "zod";

export const TaskId = z.enum(["workout1","workout2","diet","water","reading","photo"]);
export type TaskId = z.infer<typeof TaskId>;

export const DayLog = z.object({
  date: z.string(), // ISO
  tasks: z.record(TaskId, z.boolean()).default({
    workout1:false, workout2:false, diet:false, water:false, reading:false, photo:false
  }),
  weightKg: z.number().optional(),
  fastingH: z.number().optional(),
});
export type DayLog = z.infer<typeof DayLog>;
```

## Ready to Merge Checklist

- [ ] All tests pass (bun test)
- [ ] Linting passes (bun run lint)
- [ ] Build succeeds (bun run build)
- [ ] Code reviewed by senior dev
- [ ] Feature works as expected

## Quick Research (5-10 minutes)

**Official Docs:** Next.js 15, Expo, Bun, Biome, Husky, commitlint, InstantDB  
**Examples:** Monorepo with Next+Expo; InstantDB starter apps

## Need to Go Deeper?

**Research Prompt:** _"I'm building a TS monorepo with Next.js (web) and Expo (mobile) using Bun tests and InstantDB. What are best practices for env handling, strict TS, and CI caching?"_

## Complexity Guide

- **1-2:** Config tweaks
- **3:** New baseline requiring careful setup
- **4-5:** n/a

## Questions for Senior Dev

- [ ] Repo layout ok for shared packages?
- [ ] Any constraints for SSR + InstantDB provider?
- [ ] CI matrix recommendations?

**Git Worktree & Conventional Commits**

```bash
git worktree add ../hardlevel-foundation -b chore/foundation
# ... implement & test ...
git commit -m "chore(repo): initialize monorepo, bun, biome, commit hooks"
git push -u origin chore/foundation
```

---

[⬅ Back to index](./README.md) · See also: [Qlty Docs Guide](./qlty-docs-guide.md)
