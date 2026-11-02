import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { PlayerTrack } from '../types';
import { dataService } from '../services/dataService';

interface PlayerContextType {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isLoadingMedia: boolean;
  playTrack: (track: PlayerTrack) => Promise<void>;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setVolume: (val: number) => void;
  setPlaybackRate: (val: number) => void;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoadingMedia(false);
    };
    const onEnded = () => setIsPlaying(false);
    const onWaiting = () => setIsLoadingMedia(true);
    const onCanPlay = () => setIsLoadingMedia(false);
    const onError = (e: Event) => {
      console.warn('Audio playback error', e);
      setIsLoadingMedia(false);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const playTrack = useCallback(async (track: PlayerTrack) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    try {
      setIsLoadingMedia(true);
      setCurrentTrack(track);

      const resolvedUrl = await dataService.resolveMediaUrl(track.mediaUrl);
      if (!resolvedUrl) {
        throw new Error('Media resource not found');
      }

      audio.src = resolvedUrl;
      audio.volume = volume;
      audio.playbackRate = playbackRate;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Error starting audio playback:', err);
      setIsPlaying(false);
    } finally {
      setIsLoadingMedia(false);
    }
  }, [volume, playbackRate]);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeTrack = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [currentTrack]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const setPlaybackRate = useCallback((val: number) => {
    setPlaybackRateState(val);
    if (audioRef.current) {
      audioRef.current.playbackRate = val;
    }
  }, []);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        playbackRate,
        isLoadingMedia,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlayPause,
        seekTo,
        setVolume,
        setPlaybackRate,
        closePlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
}
