# Slice 7: Analytics, Gamification & Integrations

## What You're Building

Analytics dashboard (7D/30D/90D/All), XP/levels/ranks (Solo Leveling), notifications, HealthKit sync & insights.

## Tasks

### 1. Analytics Screen - Complexity: 4

- [ ] Tabbed ranges + multiple charts
- [ ] Compare ranges (this week vs last)
- [ ] Export CSV/PDF; AI insight box
- [ ] Evaluate using `react-github-calendar` for streak/heatmap visualization where appropriate
- [ ] Write tests
- [ ] Test passes locally

**If Complexity > 3, break into smaller subtasks:**

- **Subtask 1.1:** chart utils (scales/smoothing) - Complexity: 2
- **Subtask 1.2:** compare aggregation - Complexity: 2

### 2. Gamification - Complexity: 3

- [ ] XP calc (completion → XP), level thresholds, ranks E→S
- [ ] Unlock animations + haptics
- [ ] Avatar pose/mood rules based on summary/completion
- [ ] Write tests
- [ ] Test passes locally

### 3. Notifications & HealthKit - Complexity: 5

- [ ] Local schedulers (photo/journal/timers); streak warnings
- [ ] HealthKit read (steps, HR, HRV, sleep) + correlations
- [ ] Google Fit (Android) adapter (optional)
- [ ] Write tests (adapters mocked)
- [ ] Test passes locally

## Code Example

```javascript
export function xpForDay(pct) {
  return Math.round(pct);
}
export function nextLevelAt(level) {
  return Math.round(100 * level * (level + 1));
}
```

## Ready to Merge Checklist

- [ ] All tests pass (bun test)
- [ ] Linting passes (bun run lint)
- [ ] Build succeeds (bun run build)
- [ ] Code reviewed by senior dev
- [ ] Feature works as expected

## Quick Research (5-10 minutes)

**Official Docs:** Apple HealthKit; Expo Notifications; File export APIs  
**Examples:** Fitness dashboards; badge/achievement systems; [`react-github-calendar` component](https://grubersjoe.github.io/react-github-calendar/)

## Need to Go Deeper?

**Research Prompt:** _"I'm building analytics with export and HealthKit correlations. What data modeling and consent patterns are recommended for privacy-first design?"_

## Complexity Guide

- **1-2:** small UI wiring
- **3:** gamification logic
- **4-5:** analytics + health integrations

## Questions for Senior Dev

- [ ] Rank thresholds & pacing OK?
- [ ] Health permissions flow sufficient?
- [ ] Notification cadence defaults?

## Git Worktree & Conventional Commits

```bash
git worktree add ../hardlevel-analytics -b feat/analytics-gamification
git commit -m "feat(analytics): charts + AI insights; gamification levels; notifications; HealthKit"
```

---

[⬅ Back to index](./README.md) · See also: [Qlty Docs Guide](./qlty-docs-guide.md)
