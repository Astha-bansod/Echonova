import React, { useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Radio,
  RotateCcw,
  RotateCw,
  Gauge,
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { formatDuration } from '../../utils/formatters';

export const GlobalAudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    isLoadingMedia,
    togglePlayPause,
    seekTo,
    setVolume,
    setPlaybackRate,
    closePlayer,
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);

  if (!currentTrack || currentTrack.mediaType !== 'audio') {
    return null;
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(0.85);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const jumpSeconds = (delta: number) => {
    const target = Math.max(0, Math.min(duration || 0, currentTime + delta));
    seekTo(target);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-[#0a0817]/95 border-t border-[#262145] backdrop-blur-xl shadow-2xl transition-transform animate-slide-up">
      {/* Top progress scrubber */}
      <div className="relative w-full h-1 bg-white/10 group cursor-pointer">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          aria-label="Seek audio timeline"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="h-full bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] transition-all"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Track Metadata */}
        <div className="flex items-center gap-3 min-w-0 max-w-xs sm:max-w-sm">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-[#1b1535] to-[#251e4d] border border-[#3b3260] overflow-hidden shrink-0 flex items-center justify-center shadow">
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Radio className="w-5 h-5 text-[#a78bfa]" />
            )}

            {/* Subtle waveform pulse overlay when playing */}
            {isPlaying && (
              <div className="absolute inset-x-1 bottom-1 flex items-end justify-center gap-0.5 h-3">
                <span className="w-1 bg-[#ff6b6b] rounded-full animate-wave-1 h-full" />
                <span className="w-1 bg-[#c4b5fd] rounded-full animate-wave-2 h-full" />
                <span className="w-1 bg-[#a78bfa] rounded-full animate-wave-3 h-full" />
                <span className="w-1 bg-[#ffffff] rounded-full animate-wave-4 h-full" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-white truncate font-display">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] text-[#a78bfa]/75 truncate">
              {currentTrack.creatorName} <span className="text-[#3b335c]">·</span> @{currentTrack.creatorUsername}
            </p>
          </div>
        </div>

        {/* Center Controls & Waveform */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-md">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => jumpSeconds(-15)}
              aria-label="Rewind 15 seconds"
              className="text-[#a78bfa]/70 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlayPause}
              disabled={isLoadingMedia}
              aria-label={isPlaying ? 'Pause podcast' : 'Play podcast'}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] hover:from-[#6d28d9] hover:to-[#f43f5e] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => jumpSeconds(15)}
              aria-label="Fast forward 15 seconds"
              className="text-[#a78bfa]/70 hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Time indicator and waveform bars */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#c4b5fd]/80">
            <span>{formatDuration(currentTime)}</span>
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-black/30">
              {[6, 12, 18, 10, 16, 22, 14, 8, 20, 15, 9, 13, 24, 11, 7].map((h, i) => (
                <span
                  key={i}
                  className={`w-0.5 rounded-full transition-all ${
                    (currentTime / (duration || 1)) * 15 >= i
                      ? 'bg-[#a78bfa]'
                      : 'bg-[#2f2750]'
                  }`}
                  style={{ height: `${h * 0.6}px` }}
                />
              ))}
            </div>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right Volume, Speed & Close */}
        <div className="flex items-center gap-3">
          {/* Speed Selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setSpeedOpen(!speedOpen)}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#a78bfa] hover:text-white p-1 rounded hover:bg-white/5"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{playbackRate}x</span>
            </button>
            {speedOpen && (
              <div className="absolute right-0 bottom-full mb-2 bg-[#0e0c1a] border border-[#2b2746] rounded-xl py-1 shadow-2xl z-50 text-[11px]">
                {[0.8, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      setSpeedOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-1 hover:bg-white/10 ${
                      playbackRate === rate ? 'text-[#ff6b6b] font-bold' : 'text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume control */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
              className="p-1 text-[#a78bfa] hover:text-white"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              aria-label="Audio volume"
              className="w-16 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-[#ff6b6b]"
            />
          </div>

          {/* Close Player */}
          <button
            onClick={closePlayer}
            aria-label="Close audio player"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
