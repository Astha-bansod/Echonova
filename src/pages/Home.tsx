import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Video,
  Radio,
  PlusCircle,
  Compass,
  ArrowRight,
  Sparkles,
  Users,
  Flame,
  Layers,
} from 'lucide-react';
import { Episode, Profile, CATEGORIES } from '../types';
import { dataService } from '../services/dataService';
import { EpisodeCard } from '../components/content/EpisodeCard';
import { CreatorCard } from '../components/content/CreatorCard';
import { EmptyState } from '../components/content/EmptyState';
import { useAuth } from '../contexts/AuthContext';

interface HomeProps {
  onOpenCreate: () => void;
}

export const Home: React.FC<HomeProps> = ({ onOpenCreate }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [latestVideos, setLatestVideos] = useState<Episode[]>([]);
  const [latestPodcasts, setLatestPodcasts] = useState<Episode[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<Profile[]>([]);
  const [stats, setStats] = useState({
    totalEpisodes: 0,
    totalAudio: 0,
    totalVideo: 0,
    totalCreators: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [videos, podcasts, creators, platformStats] = await Promise.all([
          dataService.getPublishedEpisodes({ media_type: 'video', limit: 4 }),
          dataService.getPublishedEpisodes({ media_type: 'audio', limit: 4 }),
          dataService.getFeaturedCreators(),
          dataService.getPlatformStats(),
        ]);

        if (mounted) {
          setLatestVideos(videos);
          setLatestPodcasts(podcasts);
          setFeaturedCreators(creators);
          setStats(platformStats);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleStartCreating = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=create');
    } else {
      onOpenCreate();
    }
  };

  const hasAnyContent = latestVideos.length > 0 || latestPodcasts.length > 0;

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#1b1733] bg-gradient-to-b from-[#0e0a22]/70 via-[#07070d] to-[#07070d]">
        {/* Subtle Ambient Cosmic Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#7c3aed]/20 via-[#a78bfa]/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-[#ff6b6b]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Institution Header Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#171233] border border-[#2d2454] text-[#c4b5fd] text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ff6b6b] animate-ping" />
            <span>Jagadambha College of Engineering & Technology</span>
            <span className="text-[#a78bfa]/50">·</span>
            <span className="text-[#a78bfa]/80">ECHONOVA</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Every Voice Has A <span className="bg-gradient-to-r from-[#a78bfa] via-[#c4b5fd] to-[#ff6b6b] bg-clip-text text-transparent">Universe.</span>
          </h1>

          {/* Supporting Text */}
          <p className="mt-5 text-sm sm:text-base text-[#a78bfa]/80 max-w-2xl mx-auto leading-relaxed">
            Discover extraordinary voices, share your stories, and explore a universe of podcasts and videos created by the ECHONOVA community.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={handleStartCreating}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] hover:from-[#6d28d9] hover:to-[#f43f5e] text-white text-xs sm:text-sm font-semibold shadow-xl shadow-[#7c3aed]/30 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start Creating</span>
            </button>

            <Link
              to="/videos"
              className="px-5 py-3 rounded-2xl bg-[#130f28] hover:bg-[#1a1438] border border-[#2b244d] text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Video className="w-4 h-4 text-[#ff6b6b]" />
              <span>Explore Videos</span>
            </Link>

            <Link
              to="/podcasts"
              className="px-5 py-3 rounded-2xl bg-[#130f28] hover:bg-[#1a1438] border border-[#2b244d] text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-[#a78bfa]" />
              <span>Explore Podcasts</span>
            </Link>
          </div>

          {/* Real Platform Statistics (Genuine from Database records) */}
          <div className="mt-14 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-[#0c091a]/80 border border-[#211c3b]">
            <div className="text-center p-2">
              <span className="block text-xl sm:text-2xl font-bold font-display text-white">
                {stats.totalEpisodes}
              </span>
              <span className="text-[11px] text-[#a78bfa]/70 uppercase font-semibold tracking-wider">
                Total Episodes
              </span>
            </div>
            <div className="text-center p-2 border-l border-[#1c1833]">
              <span className="block text-xl sm:text-2xl font-bold font-display text-[#ff6b6b]">
                {stats.totalVideo}
              </span>
              <span className="text-[11px] text-[#a78bfa]/70 uppercase font-semibold tracking-wider">
                Video Podcasts
              </span>
            </div>
            <div className="text-center p-2 border-l border-[#1c1833]">
              <span className="block text-xl sm:text-2xl font-bold font-display text-[#c4b5fd]">
                {stats.totalAudio}
              </span>
              <span className="text-[11px] text-[#a78bfa]/70 uppercase font-semibold tracking-wider">
                Audio Podcasts
              </span>
            </div>
            <div className="text-center p-2 border-l border-[#1c1833]">
              <span className="block text-xl sm:text-2xl font-bold font-display text-white">
                {stats.totalCreators}
              </span>
              <span className="text-[11px] text-[#a78bfa]/70 uppercase font-semibold tracking-wider">
                Registered Creators
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* If completely empty database */}
        {!loading && !hasAnyContent && (
          <EmptyState
            title="The Universe is Waiting for Its First Voice"
            description="No episodes have been published yet in the database. Be the first JCOET creator to record an audio podcast or upload your engineering video project!"
            actionLabel="Publish First Episode"
            onAction={handleStartCreating}
          />
        )}

        {/* LATEST VIDEOS SECTION */}
        {latestVideos.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#ff6b6b]" />
                  Latest Videos
                </h2>
                <p className="text-xs text-[#a78bfa]/75 mt-0.5">
                  Stream technical demos, campus talks, and engineering highlights.
                </p>
              </div>
              <Link
                to="/videos"
                className="text-xs font-semibold text-[#c4b5fd] hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View all videos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestVideos.map((ep) => (
                <EpisodeCard key={ep.id} episode={ep} />
              ))}
            </div>
          </section>
        )}

        {/* LATEST PODCASTS SECTION */}
        {latestPodcasts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#a78bfa]" />
                  Latest Audio Podcasts
                </h2>
                <p className="text-xs text-[#a78bfa]/75 mt-0.5">
                  Engaging discussions, student interviews, and knowledge sessions.
                </p>
              </div>
              <Link
                to="/podcasts"
                className="text-xs font-semibold text-[#c4b5fd] hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View all podcasts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestPodcasts.map((ep) => (
                <EpisodeCard key={ep.id} episode={ep} />
              ))}
            </div>
          </section>
        )}

        {/* BROWSE CATEGORIES */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#c4b5fd]" />
                Browse Categories
              </h2>
              <p className="text-xs text-[#a78bfa]/75 mt-0.5">
                Explore topics across faculties, student clubs, and tech domains.
              </p>
            </div>
            <Link
              to="/categories"
              className="text-xs font-semibold text-[#c4b5fd] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>All categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/explore?category=${encodeURIComponent(cat)}`}
                className="p-4 rounded-2xl bg-[#0f0c20] hover:bg-[#16122d] border border-[#241e3d] hover:border-[#7c3aed]/60 transition-all flex flex-col justify-between group"
              >
                <span className="text-xs font-semibold text-white group-hover:text-[#c4b5fd] transition-colors">
                  {cat}
                </span>
                <span className="text-[10px] text-[#a78bfa]/60 mt-3 group-hover:text-white transition-colors">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* CREATOR SPOTLIGHT */}
        {featuredCreators.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#ff6b6b]" />
                  Creator Spotlight
                </h2>
                <p className="text-xs text-[#a78bfa]/75 mt-0.5">
                  Meet the student and faculty creators broadcasting from JCOET.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
