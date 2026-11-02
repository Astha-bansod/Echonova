import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Video,
  Radio,
  Clock,
  Globe,
  Layers,
  ArrowLeft,
  Share2,
  Check,
  User,
  Calendar,
} from 'lucide-react';
import { Episode } from '../types';
import { dataService } from '../services/dataService';
import { formatDuration, formatDate, formatBytes } from '../utils/formatters';
import { CustomVideoPlayer } from '../components/player/CustomVideoPlayer';
import { EpisodeCard } from '../components/content/EpisodeCard';
import { usePlayer } from '../contexts/PlayerContext';

export const EpisodeDetail: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [relatedEpisodes, setRelatedEpisodes] = useState<Episode[]>([]);
  const [resolvedMediaUrl, setResolvedMediaUrl] = useState<string>('');
  const [resolvedCoverUrl, setResolvedCoverUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();

  useEffect(() => {
    let mounted = true;

    async function loadEpisode() {
      if (!idOrSlug) return;
      try {
        setLoading(true);
        // Try slug first then ID
        let ep = await dataService.getEpisodeBySlug(idOrSlug);
        if (!ep) {
          ep = await dataService.getEpisodeById(idOrSlug);
        }

        if (mounted && ep) {
          setEpisode(ep);

          const [mediaUrl, coverUrl, related] = await Promise.all([
            dataService.resolveMediaUrl(ep.media_path),
            ep.cover_path ? dataService.resolveMediaUrl(ep.cover_path) : Promise.resolve(''),
            dataService.getPublishedEpisodes({ category: ep.category, limit: 4 }),
          ]);

          if (mounted) {
            setResolvedMediaUrl(mediaUrl);
            setResolvedCoverUrl(coverUrl);
            setRelatedEpisodes(related.filter((r) => r.id !== ep.id));
          }
        }
      } catch (err) {
        console.error('Failed to load episode details:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadEpisode();
    return () => {
      mounted = false;
    };
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-xs text-[#a78bfa]/70">
        Loading universe episode...
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-white">Episode Not Found</h2>
        <p className="text-xs text-[#a78bfa]/80">
          The requested episode may be private, in draft state, or removed.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Explore
        </Link>
      </div>
    );
  }

  const isCurrentAudio = currentTrack?.id === episode.id && episode.media_type === 'audio';
  const isPlayingThis = isCurrentAudio && isPlaying;

  const handleAudioPlayToggle = async () => {
    if (isCurrentAudio) {
      togglePlayPause();
    } else {
      await playTrack({
        id: episode.id,
        title: episode.title,
        creatorName: episode.creator?.display_name || 'JCOET Creator',
        creatorUsername: episode.creator?.username || 'creator',
        mediaUrl: episode.media_path,
        coverUrl: resolvedCoverUrl || undefined,
        mediaType: 'audio',
        durationSeconds: episode.duration_seconds,
      });
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back link */}
      <div>
        <Link
          to={episode.media_type === 'video' ? '/videos' : '/podcasts'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#a78bfa] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {episode.media_type === 'video' ? 'Videos' : 'Podcasts'}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Media & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Player Area */}
          {episode.media_type === 'video' ? (
            <CustomVideoPlayer
              src={resolvedMediaUrl}
              poster={resolvedCoverUrl}
              title={episode.title}
            />
          ) : (
            /* Audio Podcast Hero Player */
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#191338] via-[#100d24] to-[#0c0919] border border-[#2d2554] shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-[#1c1538] border border-[#3b3260] overflow-hidden shrink-0 shadow-xl flex items-center justify-center">
                  {resolvedCoverUrl ? (
                    <img
                      src={resolvedCoverUrl}
                      alt={episode.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Radio className="w-16 h-16 text-[#a78bfa]" />
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-3">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-medium text-[#c4b5fd]/80">
                    <Radio className="w-3.5 h-3.5 text-[#a78bfa]" />
                    <span>Audio Podcast</span>
                    <span>·</span>
                    <span>{episode.category}</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold font-display text-white leading-tight">
                    {episode.title}
                  </h1>

                  <p className="text-xs text-[#a78bfa]/75">
                    Broadcasting in {episode.language} · {formatDuration(episode.duration_seconds)}
                  </p>

                  <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                    <button
                      onClick={handleAudioPlayToggle}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] hover:from-[#6d28d9] hover:to-[#f43f5e] text-white text-xs font-semibold shadow-lg shadow-[#7c3aed]/25 flex items-center gap-2 transition-all transform active:scale-95"
                    >
                      {isPlayingThis ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Pause Podcast</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                          <span>Listen Podcast</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={copyShareLink}
                      className="p-2.5 rounded-xl bg-[#1d1738] hover:bg-[#28214d] border border-[#382f5c] text-white text-xs font-medium transition-colors"
                      title="Share episode"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Soundwave Animation Graphic */}
              <div className="pt-4 border-t border-[#231b40] flex items-center justify-between text-xs text-[#a78bfa]/80">
                <div className="flex items-center gap-1.5 h-6">
                  {[8, 16, 24, 12, 28, 14, 20, 10, 26, 18, 22, 12, 30, 15, 9, 20, 14].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full ${isPlayingThis ? 'bg-gradient-to-t from-[#7c3aed] to-[#ff6b6b] animate-wave-' + ((i % 5) + 1) : 'bg-[#292247]'}`}
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[11px]">
                  Format: {episode.media_path.split('.').pop()?.toUpperCase() || 'AUDIO'}
                </span>
              </div>
            </div>
          )}

          {/* Title & Metadata Strip (Zero-pill discipline) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                {episode.title}
              </h1>

              <button
                onClick={copyShareLink}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141028] border border-[#282147] hover:border-[#7c3aed] text-xs font-medium text-[#c4b5fd] hover:text-white transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#a78bfa]/80 font-medium">
              <span>{episode.category}</span>
              <span aria-hidden="true">·</span>
              <span>{episode.language}</span>
              <span aria-hidden="true">·</span>
              <span>{formatDuration(episode.duration_seconds)}</span>
              {episode.published_at && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Published {formatDate(episode.published_at)}</span>
                </>
              )}
              {episode.media_size > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{formatBytes(episode.media_size)}</span>
                </>
              )}
            </div>
          </div>

          {/* Description & Show Notes */}
          <div className="p-6 rounded-2xl bg-[#0e0c1c] border border-[#231e3d] space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
              About this Episode & Show Notes
            </h3>
            <p className="text-xs sm:text-sm text-[#c4b5fd]/90 leading-relaxed whitespace-pre-wrap">
              {episode.description}
            </p>
          </div>
        </div>

        {/* Sidebar: Creator info and Related episodes */}
        <div className="space-y-8">
          {/* Creator Profile Card */}
          <div className="p-6 rounded-2xl bg-[#0e0c1c] border border-[#231e3d] space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a78bfa]">
              Creator
            </span>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#ff6b6b] p-0.5">
                <div className="w-full h-full rounded-[14px] bg-[#0e0c1c] overflow-hidden flex items-center justify-center">
                  {episode.creator?.avatar_path ? (
                    <img
                      src={episode.creator.avatar_path}
                      alt={episode.creator.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-base text-white">
                      {episode.creator?.display_name?.charAt(0) || <User className="w-5 h-5" />}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-display font-semibold text-sm text-white">
                  {episode.creator?.display_name || 'JCOET Creator'}
                </h4>
                <p className="text-xs text-[#a78bfa]/75">
                  @{episode.creator?.username || 'creator'}
                </p>
              </div>
            </div>

            {episode.creator?.bio && (
              <p className="text-xs text-[#a78bfa]/75 leading-relaxed">
                {episode.creator.bio}
              </p>
            )}

            <Link
              to={`/creator/${episode.creator?.username || episode.creator_id}`}
              className="block w-full py-2 text-center rounded-xl bg-[#16122d] hover:bg-[#201a3e] border border-[#2d2550] text-xs font-semibold text-white transition-colors"
            >
              View Creator Showcase
            </Link>
          </div>

          {/* Related Episodes */}
          {relatedEpisodes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                Related in {episode.category}
              </h3>
              <div className="space-y-3">
                {relatedEpisodes.map((rel) => (
                  <EpisodeCard key={rel.id} episode={rel} layout="list" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
