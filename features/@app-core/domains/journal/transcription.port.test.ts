import { beforeEach, describe, expect, it } from "vitest";
import type { JournalTranscript, VoiceRecording } from "./journal.types";
import {
  MockTranscriptionPort,
  type TranscriptionConfig,
  TranscriptionError,
  type TranscriptionPort,
  validateTranscriptionConfig,
} from "./transcription.port";

describe("TranscriptionPort", () => {
  let mockPort: MockTranscriptionPort;
  let sampleRecording: VoiceRecording;
  let sampleConfig: TranscriptionConfig;

  beforeEach(() => {
    mockPort = new MockTranscriptionPort();

    sampleRecording = {
      id: "rec-1",
      journalEntryId: "journal-1",
      status: "uploaded",
      audioUrl: "https://storage.example.com/audio/rec-1.mp3",
      duration: 120,
      format: "mp3",
      size: 1_024_000,
      createdAt: new Date("2025-08-13T10:00:00Z"),
      updatedAt: new Date("2025-08-13T10:01:00Z"),
    };

    sampleConfig = {
      provider: "openai",
      language: "en-US",
      model: "whisper-1",
      enableTimestamps: true,
      enableConfidence: true,
      maxRetries: 3,
      timeoutMs: 30_000,
    };
  });

  describe("MockTranscriptionPort", () => {
    it("should implement TranscriptionPort interface", () => {
      expect(mockPort).toHaveProperty("transcribe");
      expect(mockPort).toHaveProperty("isHealthy");
      expect(mockPort).toHaveProperty("getSupportedFormats");
      expect(mockPort).toHaveProperty("getMaxFileSize");
      expect(mockPort).toHaveProperty("getMaxDuration");
      expect(mockPort).toHaveProperty("cancelTranscription");
    });

    it("should return default mock response when no custom response set", async () => {
      const result = await mockPort.transcribe(sampleRecording, sampleConfig);

      expect(result.id).toBe("transcript-rec-1");
      expect(result.voiceRecordingId).toBe("rec-1");
      expect(result.text).toBe("Mock transcription text");
      expect(result.confidence).toBe(0.95);
      expect(result.language).toBe("en-US");
      expect(result.processingTime).toBe(1000);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should return custom mock response when set", async () => {
      const customTranscript: JournalTranscript = {
        id: "custom-transcript",
        voiceRecordingId: "rec-1",
        text: "Custom transcription with confidence",
        confidence: 0.87,
        language: "en-US",
        processingTime: 2500,
        segments: [
          {
            text: "Custom transcription",
            startTime: 0.0,
            endTime: 1.5,
            confidence: 0.9,
          },
          {
            text: "with confidence",
            startTime: 1.5,
            endTime: 3.0,
            confidence: 0.84,
          },
        ],
        createdAt: new Date("2025-08-13T10:02:00Z"),
      };

      mockPort.setMockResponse(
        sampleRecording.audioUrl || "",
        customTranscript,
      );
      const result = await mockPort.transcribe(sampleRecording, sampleConfig);

      expect(result).toEqual(customTranscript);
    });

    it("should throw error when service is unhealthy", async () => {
      mockPort.setHealthy(false);

      await expect(
        mockPort.transcribe(sampleRecording, sampleConfig),
      ).rejects.toThrow(TranscriptionError);

      try {
        await mockPort.transcribe(sampleRecording, sampleConfig);
      } catch (error) {
        expect(error).toBeInstanceOf(TranscriptionError);
        const transcriptionError = error as TranscriptionError;
        expect(transcriptionError.code).toBe("API_ERROR");
        expect(transcriptionError.retryable).toBe(true);
        expect(transcriptionError.message).toBe("Service unavailable");
      }
    });

    it("should report health status correctly", async () => {
      expect(await mockPort.isHealthy()).toBe(true);

      mockPort.setHealthy(false);
      expect(await mockPort.isHealthy()).toBe(false);

      mockPort.setHealthy(true);
      expect(await mockPort.isHealthy()).toBe(true);
    });

    it("should return supported audio formats", () => {
      const formats = mockPort.getSupportedFormats();

      expect(formats).toEqual(["mp3", "wav", "m4a", "webm"]);
      expect(formats).toContain("mp3");
      expect(formats).toContain("wav");
    });

    it("should return max file size constraint", () => {
      const maxSize = mockPort.getMaxFileSize();

      expect(maxSize).toBe(25 * 1024 * 1024); // 25MB
      expect(maxSize).toBeGreaterThan(0);
    });

    it("should return max duration constraint", () => {
      const maxDuration = mockPort.getMaxDuration();

      expect(maxDuration).toBe(3600); // 1 hour
      expect(maxDuration).toBeGreaterThan(0);
    });

    it("should handle transcription cancellation", async () => {
      const transcriptionId = "trans-123";

      expect(mockPort.wasCancelled(transcriptionId)).toBe(false);

      const result = await mockPort.cancelTranscription(transcriptionId);

      expect(result).toBe(true);
      expect(mockPort.wasCancelled(transcriptionId)).toBe(true);
    });
  });

  describe("TranscriptionError", () => {
    it("should create error with code and retryable flag", () => {
      const error = new TranscriptionError(
        "File too large",
        "FILE_TOO_LARGE",
        false,
      );

      expect(error.message).toBe("File too large");
      expect(error.code).toBe("FILE_TOO_LARGE");
      expect(error.retryable).toBe(false);
      expect(error.name).toBe("TranscriptionError");
      expect(error).toBeInstanceOf(Error);
    });

    it("should default retryable to false when not specified", () => {
      const error = new TranscriptionError("API Error", "API_ERROR");

      expect(error.retryable).toBe(false);
    });

    it("should support all error codes", () => {
      const errorCodes = [
        "INVALID_AUDIO_FORMAT",
        "FILE_TOO_LARGE",
        "DURATION_TOO_LONG",
        "NETWORK_ERROR",
        "API_ERROR",
        "TIMEOUT",
        "QUOTA_EXCEEDED",
        "UNSUPPORTED_LANGUAGE",
        "PROCESSING_FAILED",
        "AUTHENTICATION_FAILED",
      ] as const;

      errorCodes.forEach((code) => {
        const error = new TranscriptionError(`Test ${code}`, code, true);
        expect(error.code).toBe(code);
        expect(error.retryable).toBe(true);
      });
    });
  });

  describe("validateTranscriptionConfig", () => {
    it("should validate correct configuration", () => {
      const result = validateTranscriptionConfig(sampleConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should reject invalid provider", () => {
      const invalidConfig = {
        ...sampleConfig,
        provider: "invalid-provider" as any,
      };

      const result = validateTranscriptionConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid provider: invalid-provider");
    });

    it("should reject invalid language code", () => {
      const invalidConfig = {
        ...sampleConfig,
        language: "x",
      };

      const result = validateTranscriptionConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Language code is required and must be at least 2 characters",
      );
    });

    it("should reject invalid timeout", () => {
      const invalidConfig = {
        ...sampleConfig,
        timeoutMs: 0,
      };

      const result = validateTranscriptionConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Timeout must be greater than 0");
    });

    it("should warn about high timeout", () => {
      const warnConfig = {
        ...sampleConfig,
        timeoutMs: 400_000, // > 5 minutes
      };

      const result = validateTranscriptionConfig(warnConfig);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(
        "Timeout exceeds 5 minutes, may cause issues",
      );
    });

    it("should reject negative retry count", () => {
      const invalidConfig = {
        ...sampleConfig,
        maxRetries: -1,
      };

      const result = validateTranscriptionConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Max retries cannot be negative");
    });

    it("should warn about high retry count", () => {
      const warnConfig = {
        ...sampleConfig,
        maxRetries: 10,
      };

      const result = validateTranscriptionConfig(warnConfig);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain("High retry count may cause delays");
    });

    it("should handle multiple validation issues", () => {
      const invalidConfig = {
        ...sampleConfig,
        provider: "invalid" as any,
        language: "",
        timeoutMs: -1,
        maxRetries: -5,
      };

      const result = validateTranscriptionConfig(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain("Invalid provider: invalid");
      expect(result.errors).toContain(
        "Language code is required and must be at least 2 characters",
      );
      expect(result.errors).toContain("Timeout must be greater than 0");
      expect(result.errors).toContain("Max retries cannot be negative");
    });
  });

  describe("Contract verification", () => {
    it("should satisfy port interface contract", () => {
      // Verify that MockTranscriptionPort implements all required methods
      const port: TranscriptionPort = mockPort;

      expect(typeof port.transcribe).toBe("function");
      expect(typeof port.isHealthy).toBe("function");
      expect(typeof port.getSupportedFormats).toBe("function");
      expect(typeof port.getMaxFileSize).toBe("function");
      expect(typeof port.getMaxDuration).toBe("function");
      expect(typeof port.cancelTranscription).toBe("function");
    });

    it("should maintain type safety for transcribe method", async () => {
      const result = await mockPort.transcribe(sampleRecording, sampleConfig);

      // Verify return type structure
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("voiceRecordingId");
      expect(result).toHaveProperty("text");
      expect(result).toHaveProperty("confidence");
      expect(result).toHaveProperty("language");
      expect(result).toHaveProperty("processingTime");
      expect(result).toHaveProperty("createdAt");

      // Verify types
      expect(typeof result.id).toBe("string");
      expect(typeof result.voiceRecordingId).toBe("string");
      expect(typeof result.text).toBe("string");
      expect(typeof result.confidence).toBe("number");
      expect(typeof result.language).toBe("string");
      expect(typeof result.processingTime).toBe("number");
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });
});
