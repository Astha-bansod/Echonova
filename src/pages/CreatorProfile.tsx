import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Video, Radio, Sparkles, LayoutDashboard } from 'lucide-react';
import { Profile, Episode } from '../types';
import { dataService } from '../services/dataService';
import { EpisodeCard } from '../components/content/EpisodeCard';
import { EmptyState } from '../components/content/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export const CreatorProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { profile: currentLoggedInProfile } = useAuth();

  const [creator, setCreator] = useState<Profile | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio'>('all');
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentLoggedInProfile?.username === username;

  useEffect(() => {
    let mounted = true;

    async function loadCreatorData() {
      if (!username) return;
      try {
        setLoading(true);
        const prof = await dataService.getProfile(username);
        if (mounted && prof) {
          setCreator(prof);
          const userEpisodes = await dataService.getCreatorEpisodes(prof.id, false);
          if (mounted) {
            setEpisodes(userEpisodes);
          }
        }
      } catch (err) {
        console.error('Failed to load creator profile:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCreatorData();
    return () => {
      mounted = false;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#a78bfa]/70">
        Loading creator profile...
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold font-display text-white">Creator Not Found</h2>
        <p className="text-xs text-[#a78bfa]/80">
          No profile was found matching username @{username}.
        </p>
        <Link
          to="/"
          className="inline-flex px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-semibold"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const filteredEpisodes = episodes.filter((ep) => {
    if (activeTab === 'video') return ep.media_type === 'video';
    if (activeTab === 'audio') return ep.media_type === 'audio';
    return true;
  });

  const videoCount = episodes.filter((e) => e.media_type === 'video').length;
  const audioCount = episodes.filter((e) => e.media_type === 'audio').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Creator Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171131] via-[#100c24] to-[#0a0817] border border-[#262047] shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#7c3aed] to-[#ff6b6b] p-1 shadow-2xl shrink-0">
            <div className="w-full h-full rounded-[22px] bg-[#0c091a] overflow-hidden flex items-center justify-center">
              {creator.avatar_path ? (
                <img
                  src={creator.avatar_path}
                  alt={creator.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-3xl text-white font-display">
                  {creator.display_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
                  {creator.display_name}
                </h1>
                <p className="text-xs sm:text-sm text-[#a78bfa]">@{creator.username}</p>
              </div>

              {isOwnProfile && (
                <Link
                  to="/dashboard"
                  className="self-center sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#20183e] hover:bg-[#2b2152] border border-[#3c306a] text-white text-xs font-semibold transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#a78bfa]" />
                  <span>Go to Creator Dashboard</span>
                </Link>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#c4b5fd]/90 max-w-2xl leading-relaxed pt-1">
              {creator.bio ||
                'Creator broadcasting technical discussions, labs, and student experiences at Jagadambha College of Engineering & Technology.'}
            </p>

            {/* Creator Metrics Strip */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-[#a78bfa]/80">
              <span className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-[#ff6b6b]" />
                <strong className="text-white">{videoCount}</strong> Videos
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#a78bfa]" />
                <strong className="text-white">{audioCount}</strong> Podcasts
              </span>
              <span>·</span>
              <span className="text-[#c4b5fd]/80">JCOET Creator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center justify-between border-b border-[#211d38] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-[#7c3aed] text-white shadow-sm'
                : 'text-[#a78bfa]/80 hover:text-white bg-[#131024]'
            }`}
          >
            All Publications ({episodes.length})
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'video'
                ? 'bg-[#ff6b6b] text-white shadow-sm'
                : 'text-[#a78bfa]/80 hover:text-white bg-[#131024]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Videos ({videoCount})
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'audio'
                ? 'bg-[#7c3aed] text-white shadow-sm'
                : 'text-[#a78bfa]/80 hover:text-white bg-[#131024]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Podcasts ({audioCount})
          </button>
        </div>
      </div>

      {/* Episodes Grid */}
      {filteredEpisodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredEpisodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No ${activeTab === 'all' ? 'content' : activeTab} published yet`}
          description={`@${creator.username} hasn't published any ${activeTab} episodes yet.`}
        />
      )}
    </div>
  );
};
