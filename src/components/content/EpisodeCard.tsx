import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Pause, Video, Radio, Clock, User } from 'lucide-react';
import { Episode } from '../../types';
import { formatDuration, formatDate } from '../../utils/formatters';
import { usePlayer } from '../../contexts/PlayerContext';
import { dataService } from '../../services/dataService';

interface EpisodeCardProps {
  episode: Episode;
  layout?: 'grid' | 'list';
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({
  episode,
  layout = 'grid',
}) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  const isCurrentAudio = currentTrack?.id === episode.id && episode.media_type === 'audio';
  const isPlayingThis = isCurrentAudio && isPlaying;

  useEffect(() => {
    let active = true;
    if (episode.cover_path) {
      dataService.resolveMediaUrl(episode.cover_path).then((url) => {
        if (active) setCoverUrl(url);
      });
    } else {
      setCoverUrl(null);
    }
    return () => {
      active = false;
    };
  }, [episode.cover_path]);

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (episode.media_type === 'audio') {
      if (isCurrentAudio) {
        togglePlayPause();
      } else {
        await playTrack({
          id: episode.id,
          title: episode.title,
          creatorName: episode.creator?.display_name || 'JCOET Creator',
          creatorUsername: episode.creator?.username || 'creator',
          mediaUrl: episode.media_path,
          coverUrl: coverUrl || undefined,
          mediaType: 'audio',
          durationSeconds: episode.duration_seconds,
        });
      }
    } else {
      navigate(`/watch/${episode.slug || episode.id}`);
    }
  };

  const isVideo = episode.media_type === 'video';

  return (
    <div
      onClick={() => navigate(`/watch/${episode.slug || episode.id}`)}
      className={`group relative bg-[#0d0b1a] hover:bg-[#131024] border border-[#211d38] hover:border-[#383158] rounded-2xl overflow-hidden transition-all duration-300 flex cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-[#7c3aed]/10 ${
        layout === 'list' ? 'flex-col sm:flex-row gap-4 p-3' : 'flex-col'
      }`}
    >
      {/* Media Cover / Visual Hero */}
      <div
        className={`relative shrink-0 overflow-hidden bg-[#16122b] ${
          layout === 'list'
            ? 'w-full sm:w-48 aspect-video sm:aspect-square rounded-xl'
            : 'w-full aspect-video'
        }`}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={episode.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1a1438] via-[#0f0c22] to-[#140b28]">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[#c4b5fd] group-hover:scale-110 transition-transform">
              {isVideo ? (
                <Video className="w-6 h-6 text-[#ff6b6b]" />
              ) : (
                <Radio className="w-6 h-6 text-[#a78bfa]" />
              )}
            </div>
            <span className="text-[11px] font-medium text-[#a78bfa]/60 mt-2 text-center line-clamp-1">
              {episode.category}
            </span>
          </div>
        )}

        {/* Media type icon overlay */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold tracking-wider uppercase text-white flex items-center gap-1.5">
          {isVideo ? (
            <Video className="w-3 h-3 text-[#ff6b6b]" />
          ) : (
            <Radio className="w-3 h-3 text-[#a78bfa]" />
          )}
          <span>{isVideo ? 'Video' : 'Audio'}</span>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-mono text-white/90 flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#c4b5fd]" />
          <span>{formatDuration(episode.duration_seconds)}</span>
        </div>

        {/* Hover / Active Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handleAction}
            aria-label={isVideo ? 'Watch video' : isPlayingThis ? 'Pause podcast' : 'Play podcast'}
            className="w-12 h-12 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white flex items-center justify-center shadow-xl transform active:scale-90 transition-transform"
          >
            {isPlayingThis ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          {/* Metadata line without pill enclosures (Zero-pill discipline) */}
          <div className="flex items-center gap-2 text-[11px] text-[#a78bfa]/75 mb-1.5 font-medium">
            <span>{episode.category}</span>
            <span aria-hidden="true">·</span>
            <span>{episode.language}</span>
            {episode.published_at && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatDate(episode.published_at)}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-sm sm:text-base text-white group-hover:text-[#c4b5fd] transition-colors line-clamp-2 leading-snug">
            {episode.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-[#a78bfa]/70 line-clamp-2 mt-1.5 leading-relaxed">
            {episode.description}
          </p>
        </div>

        {/* Creator Info Footer */}
        <div className="pt-3 mt-3 border-t border-[#1c1833] flex items-center justify-between text-xs">
          <Link
            to={`/creator/${episode.creator?.username || episode.creator_id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 group/creator hover:opacity-85"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#ff6b6b] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {episode.creator?.avatar_path ? (
                <img
                  src={episode.creator.avatar_path}
                  alt={episode.creator.display_name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                episode.creator?.display_name?.charAt(0) || <User className="w-3 h-3" />
              )}
            </div>
            <span className="text-xs font-medium text-slate-300 group-hover/creator:text-white truncate max-w-[130px]">
              {episode.creator?.display_name || 'JCOET Creator'}
            </span>
          </Link>

          {/* Play / Watch link */}
          <button
            onClick={handleAction}
            className="text-[11px] font-semibold text-[#c4b5fd] hover:text-white flex items-center gap-1 transition-colors"
          >
            {isVideo ? 'Watch Video' : isPlayingThis ? 'Pause' : 'Listen'}
          </button>
        </div>
      </div>
    </div>
  );
};
