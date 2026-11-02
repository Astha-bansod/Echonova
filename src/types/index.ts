export type MediaType = 'audio' | 'video';
export type EpisodeStatus = 'draft' | 'published';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_path?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Episode {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  language: string;
  media_path: string;
  media_type: MediaType;
  media_size: number;
  cover_path?: string | null;
  duration_seconds: number;
  status: EpisodeStatus;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined or resolved fields
  creator?: Profile;
}

export type Category = 
  | 'Technology & Coding'
  | 'Engineering & Robotics'
  | 'Campus Life & JCOET'
  | 'Science & Innovation'
  | 'Arts & Culture'
  | 'Careers & Interviews'
  | 'Startups & Ventures'
  | 'Education & Tutorials';

export const CATEGORIES: Category[] = [
  'Technology & Coding',
  'Engineering & Robotics',
  'Campus Life & JCOET',
  'Science & Innovation',
  'Arts & Culture',
  'Careers & Interviews',
  'Startups & Ventures',
  'Education & Tutorials'
];

export const LANGUAGES = [
  'English',
  'Marathi',
  'Hindi',
  'Bilingual (English + Marathi)',
  'Bilingual (English + Hindi)'
];

export interface UploadProgress {
  percentage: number;
  loadedBytes: number;
  totalBytes: number;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error' | 'cancelled';
  errorMessage?: string;
}

export interface PlayerTrack {
  id: string;
  title: string;
  creatorName: string;
  creatorUsername: string;
  mediaUrl: string;
  coverUrl?: string | null;
  mediaType: MediaType;
  durationSeconds: number;
}
