# Slice 2: Design System & App Shell

## What You're Building

WHOOP-style dark theme, typography tokens, AppShell, and Real-Time Header (date/time/streak + battery bar).

## Tasks

### 1. Theme & Tokens - Complexity: 2

- [x] Tailwind v4 (or tokens) for colors/typography
- [x] Global layout with SF Pro / SF Mono
- [ ] A11y: contrast checks
- [ ] Write tests (UI snapshot for AppShell)
- [ ] Test passes locally

### 2. Real-Time Header - Complexity: 3

- [ ] Date (“Wednesday, March 27”) + Time (“14:32:15”, SF Mono, orange)
- [ ] Day streak “Day X/75” + battery progress bar
- [ ] 1s update (timer cleanup), SSR-safe
- [ ] Wire to selector: today completion%
- [ ] Write tests (timer mocked)
- [ ] Test passes locally

## Code Example

```javascript
export function Header({ day, total = 75, completionPct }) {
  // mono time + battery bar (see implementation from plan)
  return null;
}
```

## Ready to Merge Checklist

- [ ] All tests pass (bun test)
- [ ] Linting passes (bun run lint)
- [ ] Build succeeds (bun run build)
- [ ] Code reviewed by senior dev
- [ ] Feature works as expected

## Quick Research (5-10 minutes)

**Official Docs:** Tailwind v4; Next.js App Router hydration; React testing timers  
**Examples:** WHOOP/fitness dashboards (dark charts)

## Need to Go Deeper?

**Research Prompt:** _"I'm building a live header with a ticking clock and battery-style bar in React/Next. How to avoid hydration mismatch and test timers reliably?"_

## Complexity Guide

- **1-2:** Tokens/layout
- **3:** Stateful header with SSR considerations

## Questions for Senior Dev

- [ ] Battery % derived correctly from tasks?
- [ ] Header perf on low-end devices?

### Git Worktree & Conventional Commits

```bash
git worktree add ../hardlevel-app-shell -b feat/app-shell
git commit -m "feat(app-shell): dark theme + real-time header"
```

---

[⬅ Back to index](./README.md) · See also: [Qlty Docs Guide](./qlty-docs-guide.md)
