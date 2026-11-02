import React, { useState, useEffect } from 'react';
import { Video, PlusCircle } from 'lucide-react';
import { Episode, CATEGORIES } from '../types';
import { dataService } from '../services/dataService';
import { EpisodeCard } from '../components/content/EpisodeCard';
import { EmptyState } from '../components/content/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface VideosProps {
  onOpenCreate: () => void;
}

export const Videos: React.FC<VideosProps> = ({ onOpenCreate }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [videos, setVideos] = useState<Episode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await dataService.getPublishedEpisodes({
          media_type: 'video',
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
        });
        if (mounted) setVideos(data);
      } catch (err) {
        console.error('Error fetching videos:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  const handleCreate = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=create');
    } else {
      onOpenCreate();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#ff6b6b]/15 text-[#ff6b6b]">
              <Video className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Video Podcasts
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#a78bfa]/80 mt-1">
            Visual stories, coding walkthroughs, robotics showcases, and college events from JCOET.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] text-white text-xs font-semibold shadow-md hover:opacity-90 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Category Filter Pills / Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
            selectedCategory === 'All'
              ? 'bg-white text-[#07070d]'
              : 'bg-[#131026] text-[#a78bfa] hover:text-white border border-[#241e3d]'
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === cat
                ? 'bg-white text-[#07070d]'
                : 'bg-[#131026] text-[#a78bfa] hover:text-white border border-[#241e3d]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#a78bfa]/70">
          Loading video publications...
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map((vid) => (
            <EpisodeCard key={vid.id} episode={vid} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No video podcasts published yet"
          description={
            selectedCategory === 'All'
              ? 'Be the first creator to upload a video podcast on ECHONOVA!'
              : `No videos found in "${selectedCategory}". Publish one now!`
          }
          actionLabel="Publish Video"
          onAction={handleCreate}
        />
      )}
    </div>
  );
};
