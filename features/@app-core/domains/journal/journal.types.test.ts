import { describe, expect, it } from 'vitest';
import type {
  JournalEntry,
  JournalEntryStatus,
  JournalMood,
  JournalSearchQuery,
  JournalSummary,
  JournalTheme,
  JournalTranscript,
  TranscriptSegment,
  VoiceRecording,
  VoiceRecordingStatus,
} from './journal.types';

describe('Journal Domain Types', () => {
  describe('JournalEntry', () => {
    it('should have all required fields', () => {
      const entry: JournalEntry = {
        id: 'journal-1',
        userId: 'user-1',
        date: '2025-08-13',
        status: 'completed',
        content: '{"type":"doc","content":[]}',
        plainTextContent: 'This is my journal entry',
        wordCount: 5,
        tags: ['fitness', 'motivation'],
        createdAt: new Date('2025-08-13T10:00:00Z'),
        updatedAt: new Date('2025-08-13T10:30:00Z'),
      };

      expect(entry.id).toBe('journal-1');
      expect(entry.userId).toBe('user-1');
      expect(entry.date).toBe('2025-08-13');
      expect(entry.status).toBe('completed');
      expect(entry.wordCount).toBe(5);
      expect(entry.tags).toEqual(['fitness', 'motivation']);
    });

    it('should support optional fields', () => {
      const entry: JournalEntry = {
        id: 'journal-1',
        userId: 'user-1',
        date: '2025-08-13',
        status: 'completed',
        content: '{}',
        plainTextContent: 'Test',
        wordCount: 1,
        tags: [],
        title: 'My Great Day',
        linkedPhotoId: 'photo-1',
        linkedWorkoutId: 'workout-1',
        reflectionPrompts: ['How did you feel today?'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(entry.title).toBe('My Great Day');
      expect(entry.linkedPhotoId).toBe('photo-1');
      expect(entry.linkedWorkoutId).toBe('workout-1');
      expect(entry.reflectionPrompts).toEqual(['How did you feel today?']);
    });
  });

  describe('VoiceRecording', () => {
    it('should track recording status correctly', () => {
      const statuses: VoiceRecordingStatus[] = [
        'idle',
        'recording',
        'paused',
        'stopped',
        'uploading',
        'uploaded',
        'failed',
      ];

      statuses.forEach((status) => {
        const recording: VoiceRecording = {
          id: 'rec-1',
          journalEntryId: 'journal-1',
          status,
          duration: 120,
          format: 'mp3',
          size: 1_024_000,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(recording.status).toBe(status);
      });
    });

    it('should include waveform data when available', () => {
      const recording: VoiceRecording = {
        id: 'rec-1',
        journalEntryId: 'journal-1',
        status: 'uploaded',
        duration: 60,
        format: 'wav',
        size: 2_048_000,
        waveformData: [0.1, 0.3, 0.7, 0.4, 0.2],
        audioUrl: 'https://storage.example.com/recordings/rec-1.wav',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(recording.waveformData).toEqual([0.1, 0.3, 0.7, 0.4, 0.2]);
      expect(recording.audioUrl).toBe(
        'https://storage.example.com/recordings/rec-1.wav'
      );
    });
  });

  describe('JournalTranscript', () => {
    it('should store transcription with confidence', () => {
      const transcript: JournalTranscript = {
        id: 'transcript-1',
        voiceRecordingId: 'rec-1',
        text: 'Today was an amazing workout day!',
        confidence: 0.95,
        language: 'en-US',
        processingTime: 2500,
        createdAt: new Date(),
      };

      expect(transcript.text).toBe('Today was an amazing workout day!');
      expect(transcript.confidence).toBe(0.95);
      expect(transcript.language).toBe('en-US');
      expect(transcript.processingTime).toBe(2500);
    });

    it('should support segmented transcription', () => {
      const segments: TranscriptSegment[] = [
        {
          text: 'Today was an amazing',
          startTime: 0.0,
          endTime: 2.1,
          confidence: 0.98,
        },
        {
          text: 'workout day!',
          startTime: 2.1,
          endTime: 3.5,
          confidence: 0.92,
        },
      ];

      const transcript: JournalTranscript = {
        id: 'transcript-1',
        voiceRecordingId: 'rec-1',
        text: 'Today was an amazing workout day!',
        confidence: 0.95,
        segments,
        language: 'en-US',
        processingTime: 2500,
        createdAt: new Date(),
      };

      expect(transcript.segments).toHaveLength(2);
      expect(transcript.segments?.[0]?.text).toBe('Today was an amazing');
      expect(transcript.segments?.[1]?.startTime).toBe(2.1);
    });
  });

  describe('JournalSummary', () => {
    it('should provide AI-generated insights', () => {
      const summary: JournalSummary = {
        id: 'summary-1',
        journalEntryId: 'journal-1',
        summary:
          'User had a successful workout and feels motivated to continue.',
        keyTopics: ['workout', 'motivation', 'progress'],
        mood: 'excited',
        themes: ['workout', 'motivation'],
        insights: [
          'Strong commitment to fitness goals',
          'Positive attitude towards challenges',
        ],
        sentimentScore: 0.8,
        processingTime: 1200,
        createdAt: new Date(),
      };

      expect(summary.summary).toContain('successful workout');
      expect(summary.keyTopics).toContain('workout');
      expect(summary.mood).toBe('excited');
      expect(summary.themes).toEqual(['workout', 'motivation']);
      expect(summary.sentimentScore).toBe(0.8);
      expect(summary.insights).toHaveLength(2);
    });

    it('should handle negative sentiments', () => {
      const summary: JournalSummary = {
        id: 'summary-2',
        journalEntryId: 'journal-2',
        summary: 'User struggled with workout today and feels discouraged.',
        keyTopics: ['struggle', 'discouragement'],
        mood: 'frustrated',
        themes: ['challenges'],
        insights: ['Need for motivational support'],
        sentimentScore: -0.4,
        processingTime: 1100,
        createdAt: new Date(),
      };

      expect(summary.mood).toBe('frustrated');
      expect(summary.sentimentScore).toBe(-0.4);
      expect(summary.themes).toEqual(['challenges']);
    });
  });

  describe('JournalMood enumeration', () => {
    it('should include all expected mood values', () => {
      const validMoods: JournalMood[] = [
        'excited',
        'happy',
        'content',
        'neutral',
        'anxious',
        'sad',
        'frustrated',
        'angry',
        'determined',
        'grateful',
      ];

      validMoods.forEach((mood) => {
        expect(typeof mood).toBe('string');
        expect(mood.length).toBeGreaterThan(0);
      });
    });
  });

  describe('JournalTheme enumeration', () => {
    it('should include all expected theme values', () => {
      const validThemes: JournalTheme[] = [
        'workout',
        'nutrition',
        'progress',
        'challenges',
        'motivation',
        'reflection',
        'goals',
        'personal',
        'general',
      ];

      validThemes.forEach((theme) => {
        expect(typeof theme).toBe('string');
        expect(theme.length).toBeGreaterThan(0);
      });
    });
  });

  describe('JournalSearchQuery', () => {
    it('should support comprehensive search criteria', () => {
      const searchQuery: JournalSearchQuery = {
        userId: 'user-1',
        query: 'workout motivation',
        dateRange: {
          start: '2025-08-01',
          end: '2025-08-13',
        },
        moods: ['excited', 'happy'],
        themes: ['workout', 'motivation'],
        tags: ['fitness'],
        hasVoice: true,
        hasTranscript: true,
        hasSummary: true,
        minWordCount: 50,
        maxWordCount: 500,
        sortBy: 'relevance',
        sortOrder: 'desc',
        limit: 20,
        offset: 0,
      };

      expect(searchQuery.userId).toBe('user-1');
      expect(searchQuery.query).toBe('workout motivation');
      expect(searchQuery.moods).toEqual(['excited', 'happy']);
      expect(searchQuery.themes).toEqual(['workout', 'motivation']);
      expect(searchQuery.hasVoice).toBe(true);
      expect(searchQuery.sortBy).toBe('relevance');
    });

    it('should work with minimal search criteria', () => {
      const searchQuery: JournalSearchQuery = {
        userId: 'user-1',
      };

      expect(searchQuery.userId).toBe('user-1');
      expect(searchQuery.query).toBeUndefined();
      expect(searchQuery.dateRange).toBeUndefined();
    });
  });

  describe('Entry status transitions', () => {
    it('should support all valid status values', () => {
      const statuses: JournalEntryStatus[] = [
        'draft',
        'recording',
        'transcribing',
        'processing',
        'completed',
        'failed',
      ];

      statuses.forEach((status) => {
        const entry: Partial<JournalEntry> = { status };
        expect(entry.status).toBe(status);
      });
    });
  });
});
