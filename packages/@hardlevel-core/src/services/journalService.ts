import type { JournalAIPort, JournalAIInput, JournalAIResult } from "../ports/journal";

export interface JournalServicePort {
  summarize(input: JournalAIInput): Promise<JournalAIResult>;
}

export class JournalService implements JournalServicePort {
  constructor(private readonly ai: JournalAIPort) {}

  async summarize(input: JournalAIInput): Promise<JournalAIResult> {
    // Could add prompt-building or guardrails here; keep pass-through for domain purity
    const result = await this.ai.summarize(input);
    return result;
  }
}

