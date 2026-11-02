/**
 * Validation rules for ECHONOVA
 */

export const MAX_AUDIO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.aac', '.ogg'];
export const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.m4v'];
export const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }
  const clean = username.trim();
  if (clean.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }
  if (clean.length > 24) {
    return { valid: false, error: 'Username cannot exceed 24 characters' };
  }
  const regex = /^[a-zA-Z0-9_]+$/;
  if (!regex.test(clean)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
}

export function validateMediaFile(
  file: { name: string; size: number; type: string },
  expectedType: 'audio' | 'video'
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const fileName = file.name.toLowerCase();
  const fileExt = fileName.substring(fileName.lastIndexOf('.'));

  if (expectedType === 'audio') {
    const isExtValid = SUPPORTED_AUDIO_EXTENSIONS.includes(fileExt);
    const isMimeValid = file.type.startsWith('audio/') || fileExt === '.m4a' || fileExt === '.mp3';
    
    if (!isExtValid && !isMimeValid) {
      return { 
        valid: false, 
        error: `Unsupported audio format. Supported: ${SUPPORTED_AUDIO_EXTENSIONS.join(', ')}` 
      };
    }
    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      return { 
        valid: false, 
        error: `Audio file is too large. Maximum size is 100 MB` 
      };
    }
  } else {
    const isExtValid = SUPPORTED_VIDEO_EXTENSIONS.includes(fileExt);
    const isMimeValid = file.type.startsWith('video/') || fileExt === '.mp4';

    if (!isExtValid && !isMimeValid) {
      return { 
        valid: false, 
        error: `Unsupported video format. Supported: ${SUPPORTED_VIDEO_EXTENSIONS.join(', ')}` 
      };
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return { 
        valid: false, 
        error: `Video file is too large. Maximum size is 500 MB` 
      };
    }
  }

  return { valid: true };
}

export function validateImageFile(file: { name: string; size: number; type: string }): { valid: boolean; error?: string } {
  if (!file) return { valid: true }; // optional
  const fileName = file.name.toLowerCase();
  const fileExt = fileName.substring(fileName.lastIndexOf('.'));
  const isExtValid = SUPPORTED_IMAGE_EXTENSIONS.includes(fileExt);
  const isMimeValid = file.type.startsWith('image/');

  if (!isExtValid && !isMimeValid) {
    return { valid: false, error: `Image must be JPEG, PNG, or WebP format` };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `Image size must be under 10 MB` };
  }
  return { valid: true };
}

export function validateEpisodeMetadata(data: {
  title: string;
  description: string;
  category: string;
  language: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (data.title.trim().length > 120) {
    errors.title = 'Title cannot exceed 120 characters';
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.category = 'Please select a category';
  }

  if (!data.language || data.language.trim().length === 0) {
    errors.language = 'Please select a language';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
