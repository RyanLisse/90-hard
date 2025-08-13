// AI summary service port - TDD London approach
import type {
  JournalEntry,
  JournalSummary,
  JournalMood,
  JournalTheme,
  SummaryConfig,
} from "./journal.types";

// Port interface - defines the contract for AI summary services
export interface AISummaryPort {
  /**
   * Generate AI-powered summary and insights for journal entry
   * @param entry - Journal entry to analyze
   * @param config - AI service configuration
   * @returns Promise<JournalSummary> - Generated summary with mood, themes, and insights
   */
  generateSummary(
    entry: JournalEntry,
    config: SummaryConfig,
  ): Promise<JournalSummary>;

  /**
   * Extract mood from text content
   * @param text - Text to analyze for mood
   * @param config - AI service configuration
   * @returns Promise<MoodAnalysis> - Detected mood with confidence
   */
  extractMood(text: string, config: SummaryConfig): Promise<MoodAnalysis>;

  /**
   * Classify themes in journal content
   * @param text - Text to analyze for themes
   * @param config - AI service configuration
   * @returns Promise<ThemeAnalysis> - Detected themes with confidence
   */
  classifyThemes(text: string, config: SummaryConfig): Promise<ThemeAnalysis>;

  /**
   * Generate insights from journal content
   * @param text - Text to analyze
   * @param config - AI service configuration
   * @returns Promise<string[]> - Generated insights
   */
  generateInsights(text: string, config: SummaryConfig): Promise<string[]>;

  /**
   * Calculate sentiment score
   * @param text - Text to analyze
   * @param config - AI service configuration
   * @returns Promise<number> - Sentiment score from -1 to 1
   */
  calculateSentiment(text: string, config: SummaryConfig): Promise<number>;

  /**
   * Check if the AI service is available and healthy
   * @returns Promise<boolean> - Service health status
   */
  isHealthy(): Promise<boolean>;

  /**
   * Get supported languages for analysis
   * @returns Array of supported language codes
   */
  getSupportedLanguages(): string[];

  /**
   * Get maximum text length supported
   * @returns Maximum text length in characters
   */
  getMaxTextLength(): number;
}

// Analysis result types
export interface MoodAnalysis {
  mood: JournalMood;
  confidence: number; // 0-1
  alternatives: Array<{
    mood: JournalMood;
    confidence: number;
  }>;
}

export interface ThemeAnalysis {
  themes: JournalTheme[];
  confidence: number; // 0-1
  themeScores: Array<{
    theme: JournalTheme;
    score: number; // 0-1
  }>;
}

// Error types for AI summary service
export class AISummaryError extends Error {
  constructor(
    message: string,
    public readonly code: AISummaryErrorCode,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = "AISummaryError";
  }
}

export type AISummaryErrorCode =
  | "TEXT_TOO_LONG"
  | "UNSUPPORTED_LANGUAGE"
  | "API_ERROR"
  | "TIMEOUT"
  | "QUOTA_EXCEEDED"
  | "CONTENT_FILTERED"
  | "INVALID_REQUEST"
  | "AUTHENTICATION_FAILED"
  | "RATE_LIMITED"
  | "MODEL_UNAVAILABLE";

// Request types for AI operations
export interface SummaryRequest {
  text: string;
  language: string;
  maxLength?: number; // Maximum summary length in words
  includeKeyTopics: boolean;
  includeMoodAnalysis: boolean;
  includeThemeClassification: boolean;
  includeInsights: boolean;
  includeSentiment: boolean;
}

export interface SummaryResponse {
  summary: string;
  keyTopics: string[];
  mood?: JournalMood;
  themes?: JournalTheme[];
  insights?: string[];
  sentimentScore?: number;
  processingTime: number;
  confidence: number;
}

// Configuration validation
export interface SummaryConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSummaryConfig(
  config: SummaryConfig,
): SummaryConfigValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate provider
  const validProviders = ["openai", "anthropic", "local"];
  if (!validProviders.includes(config.provider)) {
    errors.push(`Invalid provider: ${config.provider}`);
  }

  // Validate model
  if (!config.model || config.model.trim().length === 0) {
    errors.push("Model is required");
  }

  // Validate max tokens
  if (config.maxTokens <= 0) {
    errors.push("Max tokens must be greater than 0");
  }
  if (config.maxTokens > 4096) {
    warnings.push("High token count may increase costs");
  }

  // Validate temperature
  if (config.temperature < 0 || config.temperature > 2) {
    errors.push("Temperature must be between 0 and 2");
  }
  if (config.temperature > 1) {
    warnings.push("High temperature may produce less consistent results");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Prompt templates for AI analysis
export class SummaryPromptBuilder {
  static buildSummaryPrompt(
    text: string,
    options: {
      includeKeyTopics: boolean;
      includeMood: boolean;
      includeThemes: boolean;
      includeInsights: boolean;
    },
  ): string {
    let prompt = `Please analyze the following journal entry and provide a concise summary:\n\n"${text}"\n\n`;

    prompt += "Provide the following analysis:\n";
    prompt += "1. A brief summary (2-3 sentences)\n";

    if (options.includeKeyTopics) {
      prompt += "2. Key topics (3-5 main topics mentioned)\n";
    }

    if (options.includeMood) {
      prompt +=
        "3. Emotional mood (excited, happy, content, neutral, anxious, sad, frustrated, angry, determined, grateful)\n";
    }

    if (options.includeThemes) {
      prompt +=
        "4. Main themes (workout, nutrition, progress, challenges, motivation, reflection, goals, personal, general)\n";
    }

    if (options.includeInsights) {
      prompt += "5. Key insights or patterns observed\n";
    }

    prompt +=
      '\nFormat the response as JSON with the structure: { "summary": string, "keyTopics": string[], "mood": string, "themes": string[], "insights": string[] }';

    return prompt;
  }

  static buildMoodPrompt(text: string): string {
    return `Analyze the emotional tone of this journal entry and identify the primary mood:

"${text}"

Choose the most appropriate mood from: excited, happy, content, neutral, anxious, sad, frustrated, angry, determined, grateful

Respond with JSON: { "mood": string, "confidence": number }`;
  }

  static buildThemePrompt(text: string): string {
    return `Classify the main themes in this journal entry:

"${text}"

Select relevant themes from: workout, nutrition, progress, challenges, motivation, reflection, goals, personal, general

Respond with JSON: { "themes": string[], "scores": { [theme]: number } }`;
  }

  static buildSentimentPrompt(text: string): string {
    return `Analyze the sentiment of this journal entry on a scale from -1 (very negative) to +1 (very positive):

"${text}"

Respond with JSON: { "sentiment": number, "reasoning": string }`;
  }
}

// Mock implementation for testing
export class MockAISummaryPort implements AISummaryPort {
  private healthy = true;
  private readonly responses = new Map<string, JournalSummary>();
  private readonly moodResponses = new Map<string, MoodAnalysis>();
  private readonly themeResponses = new Map<string, ThemeAnalysis>();
  private readonly insightResponses = new Map<string, string[]>();
  private readonly sentimentResponses = new Map<string, number>();

  // Test helpers
  setHealthy(healthy: boolean): void {
    this.healthy = healthy;
  }

  setMockSummary(text: string, summary: JournalSummary): void {
    this.responses.set(text, summary);
  }

  setMockMood(text: string, mood: MoodAnalysis): void {
    this.moodResponses.set(text, mood);
  }

  setMockThemes(text: string, themes: ThemeAnalysis): void {
    this.themeResponses.set(text, themes);
  }

  setMockInsights(text: string, insights: string[]): void {
    this.insightResponses.set(text, insights);
  }

  setMockSentiment(text: string, sentiment: number): void {
    this.sentimentResponses.set(text, sentiment);
  }

  async generateSummary(
    entry: JournalEntry,
    config: SummaryConfig,
  ): Promise<JournalSummary> {
    if (!this.healthy) {
      throw new AISummaryError("Service unavailable", "API_ERROR", true);
    }

    const mockResponse = this.responses.get(entry.plainTextContent);
    if (mockResponse) {
      return mockResponse;
    }

    // Default mock response
    return {
      id: `summary-${entry.id}`,
      journalEntryId: entry.id,
      summary: "Mock AI-generated summary of the journal entry.",
      keyTopics: ["mock", "topic"],
      mood: "neutral",
      themes: ["general"],
      insights: ["Mock insight generated by AI"],
      sentimentScore: 0.0,
      processingTime: 500,
      createdAt: new Date(),
    };
  }

  async extractMood(
    text: string,
    config: SummaryConfig,
  ): Promise<MoodAnalysis> {
    if (!this.healthy) {
      throw new AISummaryError("Service unavailable", "API_ERROR", true);
    }

    const mockResponse = this.moodResponses.get(text);
    if (mockResponse) {
      return mockResponse;
    }

    return {
      mood: "neutral",
      confidence: 0.85,
      alternatives: [{ mood: "content", confidence: 0.15 }],
    };
  }

  async classifyThemes(
    text: string,
    config: SummaryConfig,
  ): Promise<ThemeAnalysis> {
    if (!this.healthy) {
      throw new AISummaryError("Service unavailable", "API_ERROR", true);
    }

    const mockResponse = this.themeResponses.get(text);
    if (mockResponse) {
      return mockResponse;
    }

    return {
      themes: ["general"],
      confidence: 0.8,
      themeScores: [
        { theme: "general", score: 0.8 },
        { theme: "reflection", score: 0.2 },
      ],
    };
  }

  async generateInsights(
    text: string,
    config: SummaryConfig,
  ): Promise<string[]> {
    if (!this.healthy) {
      throw new AISummaryError("Service unavailable", "API_ERROR", true);
    }

    const mockResponse = this.insightResponses.get(text);
    if (mockResponse) {
      return mockResponse;
    }

    return ["Mock insight about the journal content"];
  }

  async calculateSentiment(
    text: string,
    config: SummaryConfig,
  ): Promise<number> {
    if (!this.healthy) {
      throw new AISummaryError("Service unavailable", "API_ERROR", true);
    }

    const mockResponse = this.sentimentResponses.get(text);
    if (mockResponse !== undefined) {
      return mockResponse;
    }

    return 0.0; // Neutral sentiment
  }

  async isHealthy(): Promise<boolean> {
    return this.healthy;
  }

  getSupportedLanguages(): string[] {
    return ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"];
  }

  getMaxTextLength(): number {
    return 10000; // 10k characters
  }
}
