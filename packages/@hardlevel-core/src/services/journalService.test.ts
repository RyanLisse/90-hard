import { describe, expect, it } from "bun:test";
import { JournalService } from "./journalService";
import type { JournalAIPort, JournalAIResult } from "../ports/journal";

class FakeJournalAI implements JournalAIPort {
  async summarize(): Promise<JournalAIResult> {
    return { summary: "You had a productive day.", mood: "positive" };
  }
}

describe("JournalService (London against JournalAIPort)", () => {
  it("delegates to AI port and returns typed result", async () => {
    const svc = new JournalService(new FakeJournalAI());
    const out = await svc.summarize({ text: "Did workout and drank water." });
    expect(out.summary).toContain("productive");
    expect(out.mood).toBe("positive");
  });
});

