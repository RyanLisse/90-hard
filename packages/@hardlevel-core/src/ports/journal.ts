export interface JournalAIInput {
  text: string;
}

export interface JournalAIResult {
  summary: string;
  mood: string; // e.g., "positive|neutral|negative" or more granular
}

export interface JournalAIPort {
  summarize(input: JournalAIInput): Promise<JournalAIResult>;
}

