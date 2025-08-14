// Photo domain types

export type PhotoStatus =
  | 'pending'
  | 'compressing'
  | 'uploading'
  | 'uploaded'
  | 'processing'
  | 'failed';

export type PhotoOrientation = 'portrait' | 'landscape' | 'square';

export type PhotoVariant = {
  thumbnail?: string;
  gallery?: string;
  avatar?: string;
};

export type PhotoMetadata = {
  width: number;
  height: number;
  size: number;
  mimeType: string;
  orientation: PhotoOrientation;
};

export type Photo = {
  id: string;
  userId: string;
  dayNumber: number;
  capturedAt: Date;
  status: PhotoStatus;
  originalUrl: string;
  variants: PhotoVariant;
  metadata: PhotoMetadata;
  aiAvatarId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Avatar types
export type AvatarStyle = 'solo-leveling' | 'ghibli' | 'realistic' | 'anime';

export type AvatarMood =
  | 'determined'
  | 'confident'
  | 'focused'
  | 'exhausted'
  | 'triumphant'
  | 'neutral';

export type Avatar = {
  id: string;
  photoId: string;
  userId: string;
  style: AvatarStyle;
  mood: AvatarMood;
  prompt: string;
  imageUrl: string;
  seed: number;
  evolution: number;
  createdAt: Date;
};

// Compression types
export type PhotoCompression = {
  quality: number; // 0-1
  maxWidth: number;
  maxHeight: number;
  format: 'jpeg' | 'png' | 'webp';
};

// Storage types
export type StorageProvider = 'cloudflare' | 's3' | 'gcs' | 'local';

// Upload types
export type PhotoUploadRequest = {
  userId: string;
  dayNumber: number;
  imageData: string; // base64
  metadata: PhotoMetadata;
  compression: PhotoCompression;
};

export type PhotoUploadResponse = {
  photoId: string;
  originalUrl: string;
  variants: PhotoVariant;
  uploadedAt: Date;
};

// Gallery types
export type PhotoGalleryFilter = {
  userId?: string;
  dayRange?: {
    start: number;
    end: number;
  };
  status?: PhotoStatus[];
  hasAvatar?: boolean;
};

export type PhotoComparison = {
  beforePhotoId: string;
  afterPhotoId: string;
  type: 'side-by-side' | 'slider' | 'overlay';
  metadata: {
    daysApart: number;
    percentageComplete: number;
  };
};
