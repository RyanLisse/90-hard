import { vi } from 'vitest';

export const requestCameraPermissionsAsync = vi.fn(async () => ({
  status: 'granted',
}));
export const requestMediaLibraryPermissionsAsync = vi.fn(async () => ({
  status: 'granted',
}));
export const launchCameraAsync = vi.fn(async () => ({ canceled: true }));
export const launchImageLibraryAsync = vi.fn(async () => ({ canceled: true }));
export const MediaTypeOptions = { Images: 'Images' };
