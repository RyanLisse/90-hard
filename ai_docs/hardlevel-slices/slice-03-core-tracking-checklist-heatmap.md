# Slice 3: Core Tracking (Checklist + Heatmap)

## What You're Building

Daily 75-Hard task checklist with InstantDB sync and an 11-week GitHub-style heatmap.

## Tasks

### 1. Domain & Services - Complexity: 3

- [ ] `computeDayCompletion(log)` pure function
- [ ] `toggleTask(date, taskId)` port (DB mocked)
- [x] Write unit tests (London: mock DB port)
- [ ] Test passes locally

### 2. Checklist UI - Complexity: 2

- [ ] `<TaskChecklist>` bound to today's log
- [ ] Immediate UI feedback + header battery update
- [ ] Write tests (RTL interactions)
- [ ] Test passes locally

### 3. Heatmap - Complexity: 4

- [ ] 7×11 grid, color by completion bands (0, 1–40, 41–80, 81–99, 100)
- [ ] Hover/tap details; week labels; month markers; legend
- [ ] Keyboard/FV for a11y (focus tooltips)
- [ ] Write tests
- [ ] Test passes locally

**If Complexity > 3, break into smaller subtasks:**

- **Subtask 3.1:** color-scale util - Complexity: 1
- **Subtask 3.2:** calendar mapping util - Complexity: 2

## Code Example

```javascript
// domain
export function computeDayCompletion(log) {
  const total = 6;
  const done = Object.values(log.tasks).filter(Boolean).length;
  return Math.round((done / total) * 100);
}
```

## Ready to Merge Checklist

- [ ] All tests pass (bun test)
- [ ] Linting passes (bun run lint)
- [ ] Build succeeds (bun run build)
- [ ] Code reviewed by senior dev
- [ ] Feature works as expected

## Quick Research (5-10 minutes)

**Official Docs:** InstantDB selectors/subscriptions; React Testing Library  
**Examples:** GitHub heatmap patterns; calendar grid a11y

## Need to Go Deeper?

**Research Prompt:** _"I'm building a GitHub-style heatmap with keyboard navigation and tooltips. How to map dates reliably and keep rendering fast?"_

## Complexity Guide

- **1-2:** utils
- **3:** domain/service
- **4-5:** full heatmap + a11y

## Questions for Senior Dev

- [ ] Are completion bands visually distinct?
- [ ] Heatmap perf with 77 days?

**Git Worktree & Conventional Commits**

```bash
git worktree add ../hardlevel-core-tracking -b feat/core-tracking
git commit -m "feat(core-tracking): checklist + 11-week heatmap with realtime sync"
```
