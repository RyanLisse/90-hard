// ============================
// External Service Ports
// ============================

/**
 * Storage service for handling file uploads (photos, audio)
 */
export interface StoragePort {
  /**
   * Upload a file to storage
   */
  upload(
    file: File | Blob,
    path: string,
  ): Promise<{
    url: string;
    size: number;
    contentType: string;
  }>;

  /**
   * Delete a file from storage
   */
  delete(path: string): Promise<void>;

  /**
   * Get a signed URL for temporary access
   */
  getSignedUrl(path: string, expiresIn?: number): Promise<string>;

  /**
   * Check if file exists
   */
  exists(path: string): Promise<boolean>;
}

/**
 * Image processing service
 */
export interface ImageProcessorPort {
  /**
   * Compress an image
   */
  compress(
    image: File | Blob,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    },
  ): Promise<Blob>;

  /**
   * Generate thumbnail
   */
  generateThumbnail(image: File | Blob, size?: number): Promise<Blob>;

  /**
   * Create side-by-side comparison
   */
  createComparison(before: string, after: string): Promise<Blob>;
}

/**
 * AI Image Generation service (for avatars)
 */
export interface ImageGenerationPort {
  /**
   * Generate an image from prompt
   */
  generate(
    prompt: string,
    options?: {
      style?: string;
      seed?: string;
      model?: string;
    },
  ): Promise<{
    url: string;
    seed: string;
  }>;

  /**
   * Check generation status
   */
  checkStatus(jobId: string): Promise<{
    status: "pending" | "processing" | "completed" | "failed";
    url?: string;
    error?: string;
  }>;
}

/**
 * Speech-to-Text service
 */
export interface SpeechToTextPort {
  /**
   * Transcribe audio to text
   */
  transcribe(
    audio: Blob,
    options?: {
      language?: string;
      model?: string;
    },
  ): Promise<{
    text: string;
    confidence: number;
    words?: Array<{
      text: string;
      start: number;
      end: number;
      confidence: number;
    }>;
  }>;

  /**
   * Start real-time transcription
   */
  startRealtime(onTranscript: (text: string) => void): Promise<{
    sessionId: string;
    stop: () => Promise<void>;
  }>;
}

/**
 * Large Language Model service (for summaries, insights)
 */
export interface LLMPort {
  /**
   * Generate completion
   */
  complete(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    },
  ): Promise<{
    text: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
    };
  }>;

  /**
   * Generate structured output
   */
  generateStructured<T>(prompt: string, schema: any): Promise<T>;

  /**
   * Stream completion
   */
  stream(prompt: string, onChunk: (chunk: string) => void): Promise<void>;
}

/**
 * Email service
 */
export interface EmailPort {
  /**
   * Send an email
   */
  send(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
    }>;
  }): Promise<void>;

  /**
   * Send templated email
   */
  sendTemplate(
    template: string,
    data: Record<string, any>,
    to: string,
  ): Promise<void>;
}

/**
 * Push notification service
 */
export interface PushNotificationPort {
  /**
   * Register device for notifications
   */
  register(
    userId: string,
    token: string,
    platform: "ios" | "android" | "web",
  ): Promise<void>;

  /**
   * Send push notification
   */
  send(
    userId: string,
    notification: {
      title: string;
      body: string;
      data?: Record<string, any>;
      badge?: number;
      sound?: string;
    },
  ): Promise<void>;

  /**
   * Send to multiple users
   */
  sendBatch(
    userIds: string[],
    notification: {
      title: string;
      body: string;
      data?: Record<string, any>;
    },
  ): Promise<{
    sent: number;
    failed: string[];
  }>;

  /**
   * Schedule notification
   */
  schedule(
    userId: string,
    notification: {
      title: string;
      body: string;
      scheduledAt: Date;
      repeatInterval?: "daily" | "weekly";
    },
  ): Promise<string>; // Returns scheduleId

  /**
   * Cancel scheduled notification
   */
  cancelScheduled(scheduleId: string): Promise<void>;
}

/**
 * Analytics tracking service
 */
export interface AnalyticsPort {
  /**
   * Track an event
   */
  track(event: string, properties?: Record<string, any>): Promise<void>;

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, any>): Promise<void>;

  /**
   * Track page/screen view
   */
  page(name: string, properties?: Record<string, any>): Promise<void>;

  /**
   * Track timing
   */
  timing(category: string, variable: string, time: number): Promise<void>;
}

/**
 * Health data integration ports
 */
export interface HealthKitPort {
  /**
   * Request permissions
   */
  requestPermissions(types: string[]): Promise<boolean>;

  /**
   * Read health data
   */
  read(
    type: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      value: number;
      date: Date;
      source: string;
    }>
  >;

  /**
   * Write health data
   */
  write(type: string, value: number, date?: Date): Promise<void>;

  /**
   * Subscribe to updates
   */
  subscribe(type: string, callback: (data: any) => void): Promise<() => void>;
}

export interface GoogleFitPort {
  /**
   * Authenticate with Google Fit
   */
  authenticate(): Promise<string>; // Returns access token

  /**
   * Read fitness data
   */
  read(
    dataType: string,
    startTime: number,
    endTime: number,
  ): Promise<
    Array<{
      value: number;
      timestamp: number;
    }>
  >;

  /**
   * Write fitness data
   */
  write(dataType: string, value: number, timestamp?: number): Promise<void>;
}

/**
 * Rate limiting service
 */
export interface RateLimiterPort {
  /**
   * Check if action is allowed
   */
  check(
    key: string,
    limit: number,
    window: number,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
  }>;

  /**
   * Consume rate limit
   */
  consume(key: string): Promise<void>;

  /**
   * Reset rate limit
   */
  reset(key: string): Promise<void>;
}

/**
 * Cache service
 */
export interface CachePort {
  /**
   * Get value from cache
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete from cache
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache
   */
  clear(): Promise<void>;

  /**
   * Get multiple values
   */
  mget<T>(keys: string[]): Promise<(T | null)[]>;

  /**
   * Set multiple values
   */
  mset<T>(
    entries: Array<{ key: string; value: T; ttl?: number }>,
  ): Promise<void>;
}
