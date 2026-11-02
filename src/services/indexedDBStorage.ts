/**
 * IndexedDB Persistent Storage Engine for ECHONOVA
 * Stores user profiles, credentials, episodes, and real media blobs (audio/video).
 */

import { Profile, Episode } from '../types';

const DB_NAME = 'echonova_jcoet_db';
const DB_VERSION = 1;

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  created_at: string;
}

export interface StoredBlob {
  id: string;
  blob: Blob;
  mimeType: string;
  name: string;
  size: number;
  uploadedAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('email', 'email', { unique: true });
      }

      if (!db.objectStoreNames.contains('profiles')) {
        const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
        profileStore.createIndex('username', 'username', { unique: true });
      }

      if (!db.objectStoreNames.contains('episodes')) {
        const episodeStore = db.createObjectStore('episodes', { keyPath: 'id' });
        episodeStore.createIndex('creator_id', 'creator_id', { unique: false });
        episodeStore.createIndex('slug', 'slug', { unique: false });
        episodeStore.createIndex('status', 'status', { unique: false });
        episodeStore.createIndex('media_type', 'media_type', { unique: false });
        episodeStore.createIndex('category', 'category', { unique: false });
      }

      if (!db.objectStoreNames.contains('blobs')) {
        db.createObjectStore('blobs', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// User & Profile helpers
export async function idbSaveUser(user: StoredUser, profile: Profile): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['users', 'profiles'], 'readwrite');
    tx.objectStore('users').put(user);
    tx.objectStore('profiles').put(profile);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbFindUserByEmail(email: string): Promise<StoredUser | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const index = tx.objectStore('users').index('email');
    const request = index.get(email.toLowerCase().trim());
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGetProfile(userId: string): Promise<Profile | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('profiles', 'readonly');
    const request = tx.objectStore('profiles').get(userId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGetProfileByUsername(username: string): Promise<Profile | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('profiles', 'readonly');
    const index = tx.objectStore('profiles').index('username');
    const request = index.get(username.toLowerCase().trim());
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function idbUpdateProfile(profile: Profile): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('profiles', 'readwrite');
    tx.objectStore('profiles').put(profile);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetAllProfiles(): Promise<Profile[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('profiles', 'readonly');
    const request = tx.objectStore('profiles').getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Episode helpers
export async function idbSaveEpisode(episode: Episode): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('episodes', 'readwrite');
    tx.objectStore('episodes').put(episode);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetEpisode(id: string): Promise<Episode | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('episodes', 'readonly');
    const request = tx.objectStore('episodes').get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGetEpisodeBySlug(slug: string): Promise<Episode | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('episodes', 'readonly');
    const index = tx.objectStore('episodes').index('slug');
    const request = index.get(slug);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGetAllEpisodes(): Promise<Episode[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('episodes', 'readonly');
    const request = tx.objectStore('episodes').getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function idbDeleteEpisode(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('episodes', 'readwrite');
    tx.objectStore('episodes').delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Media Blob helpers
export async function idbSaveBlob(item: StoredBlob): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('blobs', 'readwrite');
    tx.objectStore('blobs').put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetBlob(id: string): Promise<StoredBlob | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('blobs', 'readonly');
    const request = tx.objectStore('blobs').get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}
