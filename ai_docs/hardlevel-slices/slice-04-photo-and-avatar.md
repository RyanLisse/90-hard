# Slice 4: Photo & AI Avatar

## What You're Building

Daily progress photo capture/upload with compression, gallery, and AI avatar generation (Solo Leveling/Ghibli).

## Tasks

### 1. Storage & Privacy - Complexity: 3

- [ ] Client compression (canvas/Expo ImageManipulator)
- [ ] Upload to Cloudflare Images (variants) or R2 (originals) + store URL/key in InstantDB
- [ ] Direct upload tokens (Images) or presigned PUT (R2); signed URLs for private access
- [ ] Define variants (thumb, avatar, gallery) and CDN caching policy
- [ ] Retry/offline queue; secure access rules
- [ ] Write tests (adapters mocked)
- [ ] Test passes locally

### 2. Camera/Upload UI - Complexity: 2

- [ ] Large orange camera button; day tag; progress ring
- [ ] Import from gallery; error states; toasts
- [ ] Write tests (component)
- [ ] Test passes locally

### 3. AI Avatar Generator - Complexity: 4

- [ ] Style presets (solo-leveling, ghibli); seed/evolution
- [ ] OpenAI Images (gpt-image-1) adapter (rate limit safe)
- [ ] Daily mood/expression variants
- [ ] Write tests (port contracts)
- [ ] Test passes locally

**If Complexity > 3, break into smaller subtasks:**

- **Subtask 3.1:** prompt builder - Complexity: 1
- **Subtask 3.2:** backoff/queue wrapper - Complexity: 2

## Code Example

```javascript
// ai/AvatarPort.ts
export async function generateAvatar({ style, mood }) {
  // call image generation API with prompt composed from style+mood
  return { url: "https://..." };
}
```

---

[⬅ Back to index](./README.md) · See also: [Qlty Docs Guide](./qlty-docs-guide.md)

## Ready to Merge Checklist

- [ ] All tests pass (bun test)
- [ ] Linting passes (bun run lint)
- [ ] Build succeeds (bun run build)
- [ ] Code reviewed by senior dev
- [ ] Feature works as expected

## Quick Research (5-10 minutes)

**Official Docs:** Cloudflare Images (storage, direct upload, variants, signed URLs); Cloudflare R2 (S3-compatible presigned URLs); OpenAI Image generation; Expo ImageManipulator  
**Examples:** Before/after slider components; gallery grids

**Internal Guide:** [Cloudflare Images + R2 Guide](../cloudflare-images-r2.md)

## Need to Go Deeper?

**Research Prompt:** _"I'm building an avatar generator with daily mood-based variants. How do I design prompts, handle seeds for consistency, and cache images cost-effectively?"_

## Complexity Guide

- **1-2:** UI wiring
- **3:** storage/privacy
- **4-5:** avatar evolution pipeline

## Questions for Senior Dev

- [ ] Storage ACLs correct?
- [ ] Avatar cache/regen policy?

## Git Worktree & Conventional Commits

```bash
git worktree add ../hardlevel-photo-avatar -b feat/photo-avatar
git commit -m "feat(avatar): generate solo-leveling/ghibli avatars; daily photo workflow"
```

---

[⬅ Back to index](./README.md) · See also: [Qlty Docs Guide](./qlty-docs-guide.md)

---

[⬅ Back to index](./README.md) · See also: [Qlty Docs Guide](./qlty-docs-guide.md)
