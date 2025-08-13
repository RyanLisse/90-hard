# Slice 6: Journaling (Voice + Tiptap + Summaries)

## What You're Building

Voice-first journaling (record → transcribe), rich text with Tiptap, AI summaries & sentiment, link to avatar mood.

## Tasks

### 1. Tiptap Editor - Complexity: 2

- [ ] Basic editor (bold, bullets, headings, tags)
- [ ] Store journal per day in InstantDB
- [ ] Write tests (render/save)
- [ ] Test passes locally

### 2. Voice Recording & STT - Complexity: 4

- [ ] Mic UI (record/pause/stop) + waveform
- [ ] Adapter for transcription (Realtime/Whisper)
- [ ] Merge transcript into editor, allow edits
- [ ] Write tests (ports mocked)
- [ ] Test passes locally

**If Complexity > 3, break into smaller subtasks:**

- **Subtask 2.1:** audio recorder hook - Complexity: 2
- **Subtask 2.2:** STT adapter with retries/backoff - Complexity: 2

### 3. AI Summary & Sentiment - Complexity: 3

- [ ] LLM call (gpt-5 mini/nano) via agents SDK
- [ ] Save `{summary, mood}`; surface in UI
- [ ] Write tests (prompt builder + adapter)
- [ ] Test passes locally

## Code Example

```javascript
export interface JournalAI {
  summarize(input){ /* returns { summary, mood } */ }
}
```

## Ready to Merge Checklist

- [ ] All tests pass (bun test)
- [ ] Linting passes (bun run lint)
- [ ] Build succeeds (bun run build)
- [ ] Code reviewed by senior dev
- [ ] Feature works as expected

## Quick Research (5-10 minutes)

**Official Docs:** Tiptap; OpenAI Realtime/Whisper; Web Audio/Expo Audio  
**Examples:** Voice-to-notes apps; journaling UIs

## Need to Go Deeper?

**Research Prompt:** _"I'm building voice journaling with on-device/offline resiliency. How do I handle long recordings, chunked uploads, and partial transcripts?"_

## Complexity Guide

- **1-2:** editor basics
- **3:** LLM summary
- **4-5:** robust audio/STT pipeline

## Questions for Senior Dev

- [ ] Max recording length and storage limits?
- [ ] Privacy defaults for journals?

**Git Worktree & Conventional Commits**

```bash
git worktree add ../hardlevel-journaling -b feat/journaling
git commit -m "feat(journal): voice → transcript → tiptap; AI summaries + sentiment"
```
