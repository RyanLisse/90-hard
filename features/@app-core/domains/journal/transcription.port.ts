// Transcription service port - TDD London approach
import type {
  AudioFormat,
  JournalTranscript,
  TranscriptionConfig,
  VoiceRecording,
} from './journal.types';

// Port interface - defines the contract for transcription services
export interface TranscriptionPort {
  /**
   * Transcribe audio recording to text
   * @param recording - Voice recording to transcribe
   * @param config - Transcription configuration
   * @returns Promise<JournalTranscript> - Transcribed text with metadata
   */
  transcribe(
    recording: VoiceRecording,
    config: TranscriptionConfig
  ): Promise<JournalTranscript>;

  /**
   * Check if the service is available and healthy
   * @returns Promise<boolean> - Service health status
   */
  isHealthy(): Promise<boolean>;

  /**
   * Get supported audio formats
   * @returns Array of supported audio formats
   */
  getSupportedFormats(): AudioFormat[];

  /**
   * Get maximum file size supported (in bytes)
   * @returns Maximum file size in bytes
   */
  getMaxFileSize(): number;

  /**
   * Get maximum duration supported (in seconds)
   * @returns Maximum duration in seconds
   */
  getMaxDuration(): number;

  /**
   * Cancel an ongoing transcription
   * @param transcriptionId - ID of the transcription to cancel
   * @returns Promise<boolean> - Success status
   */
  cancelTranscription(transcriptionId: string): Promise<boolean>;
}

// Error types for transcription
export class TranscriptionError extends Error {
  constructor(
    message: string,
    public readonly code: TranscriptionErrorCode,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'TranscriptionError';
  }
}

export type TranscriptionErrorCode =
  | 'INVALID_AUDIO_FORMAT'
  | 'FILE_TOO_LARGE'
  | 'DURATION_TOO_LONG'
  | 'NETWORK_ERROR'
  | 'API_ERROR'
  | 'TIMEOUT'
  | 'QUOTA_EXCEEDED'
  | 'UNSUPPORTED_LANGUAGE'
  | 'PROCESSING_FAILED'
  | 'AUTHENTICATION_FAILED';

// Request/Response types for transcription operations
export interface TranscriptionRequest {
  audioUrl: string;
  format: AudioFormat;
  language: string;
  enableTimestamps: boolean;
  enableConfidence: boolean;
}

export interface TranscriptionResponse {
  transcriptId: string;
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
  segments?: Array<{
    text: string;
    startTime: number;
    endTime: number;
    confidence: number;
  }>;
}

// Service status for health checks
export interface TranscriptionServiceStatus {
  isHealthy: boolean;
  latency: number; // milliseconds
  errorRate: number; // percentage
  quotaRemaining?: number;
  lastChecked: Date;
}

// Configuration validation
export interface TranscriptionConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTranscriptionConfig(
  config: TranscriptionConfig
): TranscriptionConfigValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate provider
  const validProviders = ['openai', 'google', 'aws', 'azure'];
  if (!validProviders.includes(config.provider)) {
    errors.push(`Invalid provider: ${config.provider}`);
  }

  // Validate language code
  if (!config.language || config.language.length < 2) {
    errors.push('Language code is required and must be at least 2 characters');
  }

  // Validate timeouts
  if (config.timeoutMs <= 0) {
    errors.push('Timeout must be greater than 0');
  }
  if (config.timeoutMs > 300_000) {
    warnings.push('Timeout exceeds 5 minutes, may cause issues');
  }

  // Validate retries
  if (config.maxRetries < 0) {
    errors.push('Max retries cannot be negative');
  }
  if (config.maxRetries > 5) {
    warnings.push('High retry count may cause delays');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Mock implementation for testing
export class MockTranscriptionPort implements TranscriptionPort {
  private healthy = true;
  private readonly responses = new Map<string, JournalTranscript>();
  private readonly cancelledTranscriptions = new Set<string>();

  // Test helpers
  setHealthy(healthy: boolean): void {
    this.healthy = healthy;
  }

  setMockResponse(audioUrl: string, transcript: JournalTranscript): void {
    this.responses.set(audioUrl, transcript);
  }

  async transcribe(
    recording: VoiceRecording,
    config: TranscriptionConfig
  ): Promise<JournalTranscript> {
    if (!this.healthy) {
      throw new TranscriptionError('Service unavailable', 'API_ERROR', true);
    }

    const audioUrl = recording.audioUrl || '';
    const mockResponse = this.responses.get(audioUrl);

    if (mockResponse) {
      return mockResponse;
    }

    // Default mock response
    return {
      id: `transcript-${recording.id}`,
      voiceRecordingId: recording.id,
      text: 'Mock transcription text',
      confidence: 0.95,
      language: config.language,
      processingTime: 1000,
      createdAt: new Date(),
    };
  }

  async isHealthy(): Promise<boolean> {
    return this.healthy;
  }

  getSupportedFormats(): AudioFormat[] {
    return ['mp3', 'wav', 'm4a', 'webm'];
  }

  getMaxFileSize(): number {
    return 25 * 1024 * 1024; // 25MB
  }

  getMaxDuration(): number {
    return 3600; // 1 hour
  }

  async cancelTranscription(transcriptionId: string): Promise<boolean> {
    this.cancelledTranscriptions.add(transcriptionId);
    return true;
  }

  // Test helper
  wasCancelled(transcriptionId: string): boolean {
    return this.cancelledTranscriptions.has(transcriptionId);
  }
}
