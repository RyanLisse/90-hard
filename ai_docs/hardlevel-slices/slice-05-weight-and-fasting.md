# Slice 5: Weight & Fasting

## What You're Building

Fast weight entry (kg/lbs), history with deltas & mini-chart, optional fasting bars and weekly averages.

## Tasks

### 1. Weight Entry - Complexity: 2

- [ ] 48pt numeric input + unit toggle (kg/lbs)
- [ ] Save entry for selected date in InstantDB
- [ ] Show last entry reference (+/− delta)
- [ ] Write tests
- [ ] Test passes locally

### 2. History & Mini-Chart - Complexity: 3

- [ ] List entries (reverse chrono) with trend arrows
- [ ] Goal line & moving average
- [ ] Write tests
- [ ] Test passes locally

### 3. Fasting Analytics - Complexity: 3

- [ ] Daily fasting hours bars + target indicator
- [ ] Weekly average; success rate
- [ ] Write tests
- [ ] Test passes locally

## Code Example

```javascript
export const kgToLbs = (kg) => +(kg * 2.2046226218).toFixed(1);
export const lbsToKg = (lbs) => +(lbs / 2.2046226218).toFixed(1);
```

## Ready to Merge Checklist

- [ ] All tests pass (bun test)
- [ ] Linting passes (bun run lint)
- [ ] Build succeeds (bun run build)
- [ ] Code reviewed by senior dev
- [ ] Feature works as expected

## Quick Research (5-10 minutes)

**Official Docs:** InstantDB; chart primitives; a11y number inputs  
**Examples:** Weight log UIs; mini sparkline charts

**Internal Guide:** [Cloudflare Images + R2 Guide](../cloudflare-images-r2.md)

## Need to Go Deeper?

**Research Prompt:** _"I'm building weight/fasting trackers with goal and moving average. What sampling/aggregation pitfalls should I avoid?"_

## Complexity Guide

- **1-2:** unit conversions/UI
- **3:** charts & averages

## Questions for Senior Dev

- [ ] Goal/target UX expectations?
- [ ] Data retention/export format?

## Git Worktree & Conventional Commits

```bash
git worktree add ../hardlevel-weight-fasting -b feat/weight-fasting
git commit -m "feat(weight): quick entry + history; fasting bars and weekly averages"
```

---

[⬅ Back to index](./README.md) · See also: [Qlty Docs Guide](./qlty-docs-guide.md)
