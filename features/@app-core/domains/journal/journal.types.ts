// Voice journaling domain types

export type JournalEntryStatus =
  | 'draft'
  | 'recording'
  | 'transcribing'
  | 'processing'
  | 'completed'
  | 'failed';

export type VoiceRecordingStatus =
  | 'idle'
  | 'recording'
  | 'paused'
  | 'stopped'
  | 'uploading'
  | 'uploaded'
  | 'failed';

export type AudioFormat = 'mp3' | 'wav' | 'm4a' | 'webm';

export type JournalMood =
  | 'excited'
  | 'happy'
  | 'content'
  | 'neutral'
  | 'anxious'
  | 'sad'
  | 'frustrated'
  | 'angry'
  | 'determined'
  | 'grateful';

export type JournalTheme =
  | 'workout'
  | 'nutrition'
  | 'progress'
  | 'challenges'
  | 'motivation'
  | 'reflection'
  | 'goals'
  | 'personal'
  | 'general';

export interface VoiceRecording {
  id: string;
  journalEntryId: string;
  status: VoiceRecordingStatus;
  audioUrl?: string;
  duration: number; // seconds
  format: AudioFormat;
  size: number; // bytes
  waveformData?: number[]; // amplitude values for waveform visualization
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalTranscript {
  id: string;
  voiceRecordingId: string;
  text: string;
  confidence: number; // 0-1 transcription confidence
  segments?: TranscriptSegment[];
  language: string;
  processingTime: number; // milliseconds
  createdAt: Date;
}

export interface TranscriptSegment {
  text: string;
  startTime: number; // seconds
  endTime: number; // seconds
  confidence: number;
}

export interface JournalSummary {
  id: string;
  journalEntryId: string;
  summary: string;
  keyTopics: string[];
  mood: JournalMood;
  themes: JournalTheme[];
  insights: string[];
  sentimentScore: number; // -1 to 1 (negative to positive)
  processingTime: number; // milliseconds
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  title?: string;
  status: JournalEntryStatus;

  // Voice components
  voiceRecording?: VoiceRecording;
  transcript?: JournalTranscript;

  // Rich text content (Tiptap)
  content: string; // JSON representation of Tiptap document
  plainTextContent: string; // extracted plain text for search

  // AI-generated insights
  summary?: JournalSummary;

  // Metadata
  wordCount: number;
  tags: string[];
  reflectionPrompts?: string[]; // prompts that guided this entry
  linkedPhotoId?: string; // link to daily photo
  linkedWorkoutId?: string; // link to workout entry

  createdAt: Date;
  updatedAt: Date;
}

export interface DailyReflectionPrompt {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  prompts: ReflectionPrompt[];
  theme: JournalTheme;
  createdAt: Date;
}

export interface ReflectionPrompt {
  id: string;
  text: string;
  type: 'voice' | 'text' | 'both';
  category: JournalTheme;
  isRequired: boolean;
}

// Voice recording configuration
export interface VoiceRecordingConfig {
  maxDuration: number; // seconds
  sampleRate: number; // Hz
  bitRate: number; // kbps
  format: AudioFormat;
  enableWaveform: boolean;
  autoStop: boolean;
}

// Transcription service configuration
export interface TranscriptionConfig {
  provider: 'openai' | 'google' | 'aws' | 'azure';
  language: string;
  model?: string; // e.g., 'whisper-1'
  enableTimestamps: boolean;
  enableConfidence: boolean;
  maxRetries: number;
  timeoutMs: number;
}

// AI summary configuration
export interface SummaryConfig {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  maxTokens: number;
  temperature: number;
  enableMoodDetection: boolean;
  enableThemeClassification: boolean;
  enableInsightsGeneration: boolean;
}

// Export functionality
export interface JournalExport {
  id: string;
  userId: string;
  format: 'pdf' | 'markdown' | 'json' | 'csv';
  dateRange: {
    start: string; // ISO date string
    end: string; // ISO date string
  };
  includeAudio: boolean;
  includeTranscripts: boolean;
  includeSummaries: boolean;
  includeImages: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
}

// Analytics and insights
export interface JournalAnalytics {
  userId: string;
  dateRange: {
    start: string;
    end: string;
  };
  stats: {
    totalEntries: number;
    voiceEntries: number;
    textEntries: number;
    averageWordCount: number;
    totalRecordingTime: number; // seconds
    mostCommonMoods: Array<{ mood: JournalMood; count: number }>;
    mostCommonThemes: Array<{ theme: JournalTheme; count: number }>;
    streakDays: number;
    entriesPerWeek: number[];
  };
  trends: {
    moodTrend: Array<{
      date: string;
      mood: JournalMood;
      sentimentScore: number;
    }>;
    themeTrend: Array<{ date: string; themes: JournalTheme[] }>;
    wordCountTrend: Array<{ date: string; wordCount: number }>;
  };
}

// Search functionality
export interface JournalSearchQuery {
  userId: string;
  query?: string; // text search
  dateRange?: {
    start: string;
    end: string;
  };
  moods?: JournalMood[];
  themes?: JournalTheme[];
  tags?: string[];
  hasVoice?: boolean;
  hasTranscript?: boolean;
  hasSummary?: boolean;
  minWordCount?: number;
  maxWordCount?: number;
  sortBy?: 'date' | 'relevance' | 'wordCount' | 'sentiment';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface JournalSearchResult {
  entry: JournalEntry;
  relevanceScore: number;
  matchedContent: string; // snippet of matched text
  highlightedContent: string; // with search terms highlighted
}
