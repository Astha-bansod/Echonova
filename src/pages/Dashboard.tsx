import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  PlusCircle,
  Video,
  Radio,
  Edit2,
  Trash2,
  Eye,
  Clock,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Save,
} from 'lucide-react';
import { Episode, MediaType, EpisodeStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/dataService';
import { formatBytes, formatDuration, formatDate } from '../utils/formatters';
import { CreatePublishModal } from '../components/upload/CreatePublishModal';

export const Dashboard: React.FC = () => {
  const { user, profile, isAuthenticated, isLoading, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'audio' | 'video' | 'drafts' | 'published'>('all');
  const [loading, setLoading] = useState(true);

  // Edit episode modal
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Profile Editor state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Delete modal confirmation
  const [deletingEpisode, setDeletingEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate('/login?redirect=dashboard');
      return;
    }

    if (profile) {
      setDisplayNameInput(profile.display_name);
      setBioInput(profile.bio || '');
      setAvatarInput(profile.avatar_path || '');
      loadCreatorEpisodes(profile.id);
    }
  }, [isAuthenticated, isLoading, profile, navigate]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-[#a78bfa]/70">
        Loading creator workspace...
      </div>
    );
  }

  const loadCreatorEpisodes = async (creatorId: string) => {
    try {
      setLoading(true);
      const data = await dataService.getCreatorEpisodes(creatorId, true);
      setEpisodes(data);
    } catch (err) {
      console.error('Failed to load creator episodes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await updateProfile({
        display_name: displayNameInput.trim(),
        bio: bioInput.trim(),
        avatar_path: avatarInput.trim() || null,
      });
      setProfileSaveSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleDeleteEpisode = async () => {
    if (!deletingEpisode) return;
    try {
      await dataService.deleteEpisode(deletingEpisode.id);
      setEpisodes((prev) => prev.filter((e) => e.id !== deletingEpisode.id));
      setDeletingEpisode(null);
    } catch (err) {
      console.error('Failed to delete episode:', err);
    }
  };

  if (!isAuthenticated || !profile) {
    return null;
  }

  // Calculate genuine statistics
  const totalEpisodes = episodes.length;
  const publishedCount = episodes.filter((e) => e.status === 'published').length;
  const draftCount = episodes.filter((e) => e.status === 'draft').length;
  const audioCount = episodes.filter((e) => e.media_type === 'audio').length;
  const videoCount = episodes.filter((e) => e.media_type === 'video').length;
  const totalStorageBytes = episodes.reduce((acc, curr) => acc + (curr.media_size || 0), 0);

  // Filter episodes
  const filteredEpisodes = episodes.filter((e) => {
    if (activeFilter === 'audio') return e.media_type === 'audio';
    if (activeFilter === 'video') return e.media_type === 'video';
    if (activeFilter === 'drafts') return e.status === 'draft';
    if (activeFilter === 'published') return e.status === 'published';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Creator Identity Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171131] via-[#100c24] to-[#0a0817] border border-[#272149] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#ff6b6b] p-1 shadow-lg shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#0c091a] overflow-hidden flex items-center justify-center">
                {profile.avatar_path ? (
                  <img
                    src={profile.avatar_path}
                    alt={profile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-2xl text-white font-display">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                  {profile.display_name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-[#7c3aed]/20 text-[#c4b5fd] border border-[#7c3aed]/30 font-medium">
                  JCOET Creator
                </span>
              </div>
              <p className="text-xs text-[#a78bfa]">@{profile.username}</p>
              <p className="text-xs text-[#c4b5fd]/80 max-w-xl leading-relaxed pt-1">
                {profile.bio || 'Add a bio to tell students and faculty about your interests, branch, and projects.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#1b1535] hover:bg-[#261f49] border border-[#3b335f] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#a78bfa]" />
              <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={() => {
                setEditingEpisode(null);
                setIsPublishModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] hover:from-[#6d28d9] hover:to-[#f43f5e] text-white text-xs font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload New Content</span>
            </button>
          </div>
        </div>

        {/* Profile Edit Inline Form */}
        {isEditingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-[#251f43] grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-white mb-1">Display Name</label>
              <input
                type="text"
                value={displayNameInput}
                onChange={(e) => setDisplayNameInput(e.target.value)}
                required
                className="w-full bg-[#120f22] border border-[#2b254a] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatarInput}
                onChange={(e) => setAvatarInput(e.target.value)}
                placeholder="https://... or leave empty"
                className="w-full bg-[#120f22] border border-[#2b254a] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-white mb-1">Creator Bio</label>
              <textarea
                rows={2}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder="Share your branch, year, tech stacks, or podcast themes..."
                className="w-full bg-[#120f22] border border-[#2b254a] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#7c3aed] text-white text-xs font-semibold hover:bg-[#6d28d9] flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Save Profile
              </button>
            </div>
          </form>
        )}

        {profileSaveSuccess && (
          <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
          </div>
        )}
      </div>

      {/* Genuine Creator Analytics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#0e0c1c] border border-[#221d3b]">
          <span className="text-[11px] font-semibold text-[#a78bfa]/75 uppercase block mb-1">
            Total Content
          </span>
          <span className="text-xl sm:text-2xl font-bold font-display text-white">
            {totalEpisodes}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0c1c] border border-[#221d3b]">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase block mb-1">
            Published Live
          </span>
          <span className="text-xl sm:text-2xl font-bold font-display text-emerald-400">
            {publishedCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0c1c] border border-[#221d3b]">
          <span className="text-[11px] font-semibold text-amber-400 uppercase block mb-1">
            Drafts (Private)
          </span>
          <span className="text-xl sm:text-2xl font-bold font-display text-amber-400">
            {draftCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0c1c] border border-[#221d3b]">
          <span className="text-[11px] font-semibold text-[#ff6b6b] uppercase block mb-1">
            Videos / Podcasts
          </span>
          <span className="text-lg sm:text-xl font-bold font-display text-white">
            {videoCount} <span className="text-xs text-[#a78bfa]">vid</span> / {audioCount} <span className="text-xs text-[#a78bfa]">aud</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0c1c] border border-[#221d3b] col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-[#c4b5fd] uppercase block mb-1">
            Storage Stored
          </span>
          <span className="text-base sm:text-lg font-bold font-display text-white">
            {formatBytes(totalStorageBytes)}
          </span>
        </div>
      </div>

      {/* Content Management Segmented Filter Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#211d38] pb-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#120f24] rounded-xl border border-[#251f44]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-[#7c3aed] text-white shadow-sm'
                  : 'text-[#a78bfa]/80 hover:text-white'
              }`}
            >
              All Content ({episodes.length})
            </button>
            <button
              onClick={() => setActiveFilter('audio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'audio'
                  ? 'bg-[#7c3aed] text-white shadow-sm'
                  : 'text-[#a78bfa]/80 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> Audio ({audioCount})
            </button>
            <button
              onClick={() => setActiveFilter('video')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'video'
                  ? 'bg-[#ff6b6b] text-white shadow-sm'
                  : 'text-[#a78bfa]/80 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Videos ({videoCount})
            </button>
            <button
              onClick={() => setActiveFilter('drafts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'drafts'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-[#a78bfa]/80 hover:text-white'
              }`}
            >
              Drafts ({draftCount})
            </button>
            <button
              onClick={() => setActiveFilter('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'published'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-[#a78bfa]/80 hover:text-white'
              }`}
            >
              Published ({publishedCount})
            </button>
          </div>
        </div>

        {/* Content Table / List */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#a78bfa]/70">
            Loading your creations...
          </div>
        ) : filteredEpisodes.length > 0 ? (
          <div className="space-y-3">
            {filteredEpisodes.map((ep) => (
              <div
                key={ep.id}
                className="p-4 rounded-2xl bg-[#0d0a1b] border border-[#211c38] hover:border-[#382f5c] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Media Icon & Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      ep.media_type === 'video'
                        ? 'bg-[#ff6b6b]/15 text-[#ff6b6b]'
                        : 'bg-[#7c3aed]/15 text-[#a78bfa]'
                    }`}
                  >
                    {ep.media_type === 'video' ? (
                      <Video className="w-5 h-5" />
                    ) : (
                      <Radio className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-semibold text-sm text-white truncate max-w-sm sm:max-w-md">
                        {ep.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          ep.status === 'published'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {ep.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#a78bfa]/75 mt-0.5">
                      <span>{ep.category}</span>
                      <span>·</span>
                      <span>{formatDuration(ep.duration_seconds)}</span>
                      <span>·</span>
                      <span>{formatBytes(ep.media_size)}</span>
                      <span>·</span>
                      <span>{formatDate(ep.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {ep.status === 'published' && (
                    <button
                      onClick={() => navigate(`/watch/${ep.slug || ep.id}`)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs"
                      title="View Public Episode"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setEditingEpisode(ep);
                      setIsPublishModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-[#7c3aed] text-[#c4b5fd] hover:text-white text-xs transition-colors"
                    title="Edit Episode Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingEpisode(ep)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-xs transition-colors"
                    title="Delete Episode"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center rounded-2xl bg-[#0c0919] border border-[#211c38] space-y-3">
            <p className="text-sm font-semibold text-white">No episodes in this filter.</p>
            <p className="text-xs text-[#a78bfa]/75 max-w-sm mx-auto">
              Ready to publish your next piece of audio or video content to the college?
            </p>
            <button
              onClick={() => {
                setEditingEpisode(null);
                setIsPublishModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-semibold shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              Upload Content
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e0c1a] border border-[#282244] p-6 rounded-2xl max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white font-display">Delete Episode</h3>
            </div>
            <p className="text-xs text-[#c4b5fd]/80 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{deletingEpisode.title}"</strong>? This will remove the episode and its media file from the database. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingEpisode(null)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEpisode}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publishing & Editing Modal */}
      <CreatePublishModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          setIsPublishModalOpen(false);
          setEditingEpisode(null);
        }}
        editEpisode={editingEpisode}
        onEpisodeCreated={() => {
          if (profile) loadCreatorEpisodes(profile.id);
        }}
      />
    </div>
  );
};
