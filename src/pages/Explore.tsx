import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Video, Radio, Layers, RotateCcw } from 'lucide-react';
import { Episode, MediaType, CATEGORIES } from '../types';
import { dataService } from '../services/dataService';
import { EpisodeCard } from '../components/content/EpisodeCard';
import { EmptyState } from '../components/content/EmptyState';

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialType = (searchParams.get('type') as MediaType) || undefined;

  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>(initialType || 'all');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL params
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'All';
    const t = searchParams.get('type');
    setSearch(q);
    setSelectedCategory(cat);
    setSelectedType((t as any) || 'all');
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    async function fetchEpisodes() {
      try {
        setLoading(true);
        const results = await dataService.getPublishedEpisodes({
          search: search.trim() || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          media_type: selectedType !== 'all' ? selectedType : undefined,
        });
        if (mounted) {
          setEpisodes(results);
        }
      } catch (err) {
        console.error('Failed to load explore content:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const timer = setTimeout(fetchEpisodes, 150);
    return () => {
      clearTimeout(timer);
      mounted = false;
    };
  }, [search, selectedCategory, selectedType]);

  const updateFilters = (newSearch?: string, newCat?: string, newType?: string) => {
    const params = new URLSearchParams();
    const query = newSearch !== undefined ? newSearch : search;
    const cat = newCat !== undefined ? newCat : selectedCategory;
    const typ = newType !== undefined ? newType : selectedType;

    if (query) params.set('q', query);
    if (cat && cat !== 'All') params.set('category', cat);
    if (typ && typ !== 'all') params.set('type', typ);
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedType('all');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
          Explore Universe
        </h1>
        <p className="text-xs sm:text-sm text-[#a78bfa]/80">
          Discover all published audio podcasts and video creations from JCOET students & faculty.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#0d0a1b] border border-[#231e3d]">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#a78bfa]/60 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, description, or creator username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateFilters(e.target.value, undefined, undefined);
            }}
            className="w-full bg-[#141029] border border-[#292247] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#a78bfa]/50 focus:outline-none focus:border-[#7c3aed]"
          />
          {search && (
            <button
              onClick={() => updateFilters('', undefined, undefined)}
              className="absolute right-3 top-2.5 text-xs text-[#a78bfa] hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Media Type & Category Filter Controls (Clean interactive buttons per design guidelines) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Media Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#141029] rounded-xl border border-[#292247]">
            <button
              onClick={() => {
                setSelectedType('all');
                updateFilters(undefined, undefined, 'all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'all'
                  ? 'bg-[#7c3aed] text-white shadow-sm'
                  : 'text-[#a78bfa]/80 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => {
                setSelectedType('video');
                updateFilters(undefined, undefined, 'video');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'video'
                  ? 'bg-[#ff6b6b] text-white shadow-sm'
                  : 'text-[#a78bfa]/80 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Videos
            </button>
            <button
              onClick={() => {
                setSelectedType('audio');
                updateFilters(undefined, undefined, 'audio');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'audio'
                  ? 'bg-[#7c3aed] text-white shadow-sm'
                  : 'text-[#a78bfa]/80 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Podcasts
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a78bfa]/75 hidden sm:inline">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                updateFilters(undefined, e.target.value, undefined);
              }}
              className="bg-[#141029] border border-[#292247] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {(search || selectedCategory !== 'All' || selectedType !== 'all') && (
              <button
                onClick={handleReset}
                title="Reset all filters"
                className="p-2 rounded-xl bg-[#141029] hover:bg-white/10 text-[#a78bfa] hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#a78bfa]/75">
        <span>
          Showing <strong>{episodes.length}</strong> {episodes.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#a78bfa]/70">
          Loading universe media...
        </div>
      ) : episodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No matching content found"
          description={
            search || selectedCategory !== 'All' || selectedType !== 'all'
              ? 'Try adjusting your search keywords, clearing filters, or exploring other categories.'
              : 'The database currently has no published content. Be the first to publish!'
          }
          actionLabel="Clear Filters"
          onAction={handleReset}
        />
      )}
    </div>
  );
};
