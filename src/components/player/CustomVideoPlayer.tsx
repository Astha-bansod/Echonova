import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Loader2,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { usePlayer } from '../../contexts/PlayerContext';

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  className?: string;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  src,
  poster,
  title,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Global audio player hook so playing video will pause background audio
  const { pauseTrack: pauseGlobalAudio } = usePlayer();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const controlsTimeoutRef = useRef<number | null>(null);

  // Stop background audio if video plays
  const handlePlay = useCallback(() => {
    pauseGlobalAudio();
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Video play interrupted:', err);
          setIsPlaying(false);
        });
    }
  }, [pauseGlobalAudio]);

  const handlePause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isPlaying, handlePause, handlePlay]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setSpeedMenuOpen(false);
  };

  // Activity timer for fading controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setSpeedMenuOpen(false);
      }
    }, 2800);
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative group bg-black rounded-2xl overflow-hidden aspect-video select-none border border-[#211d38] shadow-2xl ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        onClick={togglePlay}
        onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration || 0);
            setIsLoading(false);
            setErrorMessage(null);
          }
        }}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setIsPlaying(false);
          setErrorMessage('Unable to load video format or media stream.');
        }}
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Loading Overlay */}
      {isLoading && !errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <Loader2 className="w-10 h-10 text-[#a78bfa] animate-spin" />
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0a1a]/95 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Playback Error</p>
          <p className="text-xs text-[#a78bfa]/80 mb-4 max-w-sm">{errorMessage}</p>
          <button
            onClick={() => {
              if (videoRef.current) {
                setIsLoading(true);
                setErrorMessage(null);
                videoRef.current.load();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7c3aed] text-white text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry Playback
          </button>
        </div>
      )}

      {/* Big Center Play Button when paused */}
      {!isPlaying && !isLoading && !errorMessage && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
        >
          <button
            aria-label="Play video"
            className="w-16 h-16 rounded-full bg-[#7c3aed]/90 hover:bg-[#7c3aed] text-white flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        </div>
      )}

      {/* Controls Bar Overlay */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 transition-opacity duration-300 flex flex-col gap-2 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber / Seek Bar */}
        <div className="relative flex items-center group/scrubber cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Seek video position"
            className="w-full h-1.5 hover:h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#ff6b6b] transition-all"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="p-1 hover:text-[#c4b5fd] transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Volume control */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="p-1 hover:text-[#c4b5fd] transition-colors"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume slider"
                className="w-14 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-[#a78bfa]"
              />
            </div>

            {/* Time Display */}
            <div className="font-mono text-[11px] text-[#c4b5fd]/90 pl-1">
              <span>{formatDuration(currentTime)}</span>
              <span className="text-white/40 mx-1">/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 text-[11px] font-semibold text-[#c4b5fd]"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{playbackRate}x</span>
              </button>
              {speedMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 bg-[#0e0c1a] border border-[#2b2746] rounded-xl py-1 shadow-2xl z-50 text-[11px]">
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={`block w-full text-left px-3.5 py-1.5 hover:bg-white/10 ${
                        playbackRate === rate ? 'text-[#ff6b6b] font-bold' : 'text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="p-1 hover:text-[#c4b5fd] transition-colors"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
