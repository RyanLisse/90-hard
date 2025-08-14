import { describe, expect, it } from 'vitest';
import type {
  Avatar,
  AvatarMood,
  AvatarStyle,
  Photo,
  PhotoComparison,
  PhotoCompression,
  PhotoGalleryFilter,
  PhotoMetadata,
  PhotoStatus,
  PhotoUploadRequest,
  PhotoUploadResponse,
  PhotoVariant,
  StorageProvider,
} from './photo.types';

describe('Photo Types', () => {
  describe('Photo', () => {
    it('should represent a progress photo with all required fields', () => {
      const photo: Photo = {
        id: 'photo-123',
        userId: 'user-456',
        dayNumber: 1,
        capturedAt: new Date('2025-01-01T10:00:00Z'),
        status: 'uploaded',
        originalUrl: 'https://storage.example.com/original/photo-123.jpg',
        variants: {
          thumbnail: 'https://storage.example.com/thumb/photo-123.jpg',
          gallery: 'https://storage.example.com/gallery/photo-123.jpg',
          avatar: 'https://storage.example.com/avatar/photo-123.jpg',
        },
        metadata: {
          width: 1920,
          height: 1080,
          size: 2_048_000,
          mimeType: 'image/jpeg',
          orientation: 'portrait',
        },
        aiAvatarId: 'avatar-789',
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-01T10:00:00Z'),
      };

      expect(photo.id).toBe('photo-123');
      expect(photo.dayNumber).toBe(1);
      expect(photo.status).toBe('uploaded');
      expect(photo.variants.thumbnail).toBeDefined();
    });

    it('should support different photo statuses', () => {
      const statuses: PhotoStatus[] = [
        'pending',
        'compressing',
        'uploading',
        'uploaded',
        'processing',
        'failed',
      ];

      statuses.forEach((status) => {
        const photo: Photo = {
          id: 'test',
          userId: 'test',
          dayNumber: 1,
          capturedAt: new Date(),
          status,
          originalUrl: '',
          variants: {},
          metadata: {
            width: 0,
            height: 0,
            size: 0,
            mimeType: 'image/jpeg',
            orientation: 'portrait',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        expect(photo.status).toBe(status);
      });
    });
  });

  describe('Avatar', () => {
    it('should represent an AI-generated avatar', () => {
      const avatar: Avatar = {
        id: 'avatar-123',
        photoId: 'photo-456',
        userId: 'user-789',
        style: 'solo-leveling',
        mood: 'determined',
        prompt: 'A determined warrior in Solo Leveling style',
        imageUrl: 'https://ai.example.com/avatar-123.png',
        seed: 12_345,
        evolution: 1,
        createdAt: new Date('2025-01-01T10:00:00Z'),
      };

      expect(avatar.style).toBe('solo-leveling');
      expect(avatar.mood).toBe('determined');
      expect(avatar.seed).toBe(12_345);
    });

    it('should support different avatar styles', () => {
      const styles: AvatarStyle[] = [
        'solo-leveling',
        'ghibli',
        'realistic',
        'anime',
      ];
      styles.forEach((style) => {
        const avatar: Avatar = {
          id: 'test',
          photoId: 'test',
          userId: 'test',
          style,
          mood: 'neutral',
          prompt: '',
          imageUrl: '',
          seed: 0,
          evolution: 1,
          createdAt: new Date(),
        };
        expect(avatar.style).toBe(style);
      });
    });

    it('should support different avatar moods', () => {
      const moods: AvatarMood[] = [
        'determined',
        'confident',
        'focused',
        'exhausted',
        'triumphant',
        'neutral',
      ];
      moods.forEach((mood) => {
        const avatar: Avatar = {
          id: 'test',
          photoId: 'test',
          userId: 'test',
          style: 'solo-leveling',
          mood,
          prompt: '',
          imageUrl: '',
          seed: 0,
          evolution: 1,
          createdAt: new Date(),
        };
        expect(avatar.mood).toBe(mood);
      });
    });
  });

  describe('PhotoCompression', () => {
    it('should define compression settings', () => {
      const compression: PhotoCompression = {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        format: 'jpeg',
      };

      expect(compression.quality).toBe(0.8);
      expect(compression.maxWidth).toBe(1920);
      expect(compression.format).toBe('jpeg');
    });
  });

  describe('PhotoUploadRequest', () => {
    it('should define upload request structure', () => {
      const request: PhotoUploadRequest = {
        userId: 'user-123',
        dayNumber: 15,
        imageData: 'base64-encoded-data',
        metadata: {
          width: 1920,
          height: 1080,
          size: 2_048_000,
          mimeType: 'image/jpeg',
          orientation: 'portrait',
        },
        compression: {
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1080,
          format: 'jpeg',
        },
      };

      expect(request.userId).toBe('user-123');
      expect(request.dayNumber).toBe(15);
      expect(request.compression.quality).toBe(0.8);
    });
  });

  describe('PhotoComparison', () => {
    it('should define photo comparison structure', () => {
      const comparison: PhotoComparison = {
        beforePhotoId: 'photo-day-1',
        afterPhotoId: 'photo-day-30',
        type: 'side-by-side',
        metadata: {
          daysApart: 29,
          percentageComplete: 33.33,
        },
      };

      expect(comparison.type).toBe('side-by-side');
      expect(comparison.metadata.daysApart).toBe(29);
    });
  });

  describe('StorageProvider', () => {
    it('should support different storage providers', () => {
      const providers: StorageProvider[] = ['cloudflare', 's3', 'gcs', 'local'];
      providers.forEach((provider) => {
        expect(provider).toMatch(/^(cloudflare|s3|gcs|local)$/);
      });
    });
  });
});
