import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Radio,
  Video,
  Upload,
  FileAudio,
  FileVideo,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Clock,
  Layers,
  Globe,
} from 'lucide-react';
import { MediaType, EpisodeStatus, CATEGORIES, LANGUAGES, Episode } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { formatBytes, formatDuration, slugify } from '../../utils/formatters';
import {
  validateMediaFile,
  validateImageFile,
  validateEpisodeMetadata,
  MAX_AUDIO_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from '../../utils/validation';

interface CreatePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEpisodeCreated?: (episode: Episode) => void;
  initialMode?: 'select' | 'audio' | 'video';
  editEpisode?: Episode | null;
}

export const CreatePublishModal: React.FC<CreatePublishModalProps> = ({
  isOpen,
  onClose,
  onEpisodeCreated,
  initialMode = 'select',
  editEpisode = null,
}) => {
  const { user, profile } = useAuth();

  const [step, setStep] = useState<'select' | 'form' | 'uploading' | 'success'>('select');
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>('video');

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);

  // Media files & previews
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  // Upload Progress & Abort
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Errors & Validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Created Episode state
  const [createdEpisode, setCreatedEpisode] = useState<Episode | null>(null);

  // File Inputs
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  // Populate if editing
  useEffect(() => {
    if (editEpisode) {
      setSelectedMediaType(editEpisode.media_type);
      setTitle(editEpisode.title);
      setDescription(editEpisode.description);
      setCategory(editEpisode.category as any);
      setLanguage(editEpisode.language);
      setStep('form');
    } else {
      if (initialMode === 'audio' || initialMode === 'video') {
        setSelectedMediaType(initialMode);
        setStep('form');
      } else {
        setStep('select');
      }
      resetForm();
    }
  }, [editEpisode, initialMode, isOpen]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (mediaPreviewUrl && mediaPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
      if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreviewUrl);
      }
    };
  }, [mediaPreviewUrl, coverPreviewUrl]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(CATEGORIES[0]);
    setLanguage(LANGUAGES[0]);
    setMediaFile(null);
    setMediaPreviewUrl(null);
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setUploadPercentage(0);
    setUploadError(null);
    setValidationErrors({});
    setCreatedEpisode(null);
  };

  if (!isOpen) return null;

  const handleSelectOption = (type: MediaType) => {
    setSelectedMediaType(type);
    setStep('form');
  };

  const handleMediaFileChange = (file: File) => {
    const val = validateMediaFile(file, selectedMediaType);
    if (!val.valid) {
      setValidationErrors((prev) => ({ ...prev, media: val.error || 'Invalid file format' }));
      return;
    }

    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy.media;
      return copy;
    });

    setMediaFile(file);
    if (mediaPreviewUrl && mediaPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }
    const preview = URL.createObjectURL(file);
    setMediaPreviewUrl(preview);

    // Auto-fill title if empty from filename
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleCoverFileChange = (file: File) => {
    const val = validateImageFile(file);
    if (!val.valid) {
      setValidationErrors((prev) => ({ ...prev, cover: val.error || 'Invalid image' }));
      return;
    }

    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy.cover;
      return copy;
    });

    setCoverFile(file);
    if (coverPreviewUrl && coverPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    const preview = URL.createObjectURL(file);
    setCoverPreviewUrl(preview);
  };

  // Drag and Drop handlers
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => {
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMediaFileChange(e.dataTransfer.files[0]);
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStep('form');
    setUploadPercentage(0);
    setUploadStatusText('Upload cancelled.');
  };

  const handleSubmit = async (targetStatus: EpisodeStatus) => {
    if (!profile) return;

    // Validate metadata
    const metaVal = validateEpisodeMetadata({
      title,
      description,
      category,
      language,
    });

    const currentErrors = { ...metaVal.errors };
    if (!editEpisode && !mediaFile) {
      currentErrors.media = `Please select an ${selectedMediaType} file to upload.`;
    }

    if (Object.keys(currentErrors).length > 0) {
      setValidationErrors(currentErrors);
      return;
    }

    setValidationErrors({});
    setUploadError(null);
    setStep('uploading');
    setUploadPercentage(5);
    setUploadStatusText('Preparing media upload...');

    abortControllerRef.current = new AbortController();

    try {
      let mediaPath = editEpisode?.media_path || '';
      let mediaDuration = editEpisode?.duration_seconds || 0;
      let mediaSize = editEpisode?.media_size || 0;
      let coverPath = editEpisode?.cover_path || null;

      // Upload cover artwork if selected
      if (coverFile) {
        setUploadStatusText('Uploading artwork thumbnail...');
        const coverRes = await dataService.uploadCover(coverFile);
        coverPath = coverRes.path;
      }

      // Upload media file if new
      if (mediaFile) {
        setUploadStatusText(`Uploading ${selectedMediaType} to secure storage...`);
        const mediaRes = await dataService.uploadMedia(
          mediaFile,
          selectedMediaType,
          (pct) => setUploadPercentage(Math.max(10, pct)),
          abortControllerRef.current.signal
        );
        mediaPath = mediaRes.path;
        mediaDuration = mediaRes.duration;
        mediaSize = mediaRes.size;
      }

      setUploadPercentage(95);
      setUploadStatusText('Finalizing episode metadata & database records...');

      const slug = slugify(title) + '-' + Math.random().toString(36).substring(2, 6);

      let savedEpisode: Episode;

      if (editEpisode) {
        savedEpisode = await dataService.updateEpisode(editEpisode.id, {
          title: title.trim(),
          description: description.trim(),
          category,
          language,
          cover_path: coverPath,
          status: targetStatus,
          media_path: mediaPath,
          duration_seconds: mediaDuration,
          media_size: mediaSize,
        });
      } else {
        savedEpisode = await dataService.createEpisode({
          creator_id: profile.id,
          title: title.trim(),
          slug,
          description: description.trim(),
          category,
          language,
          media_path: mediaPath,
          media_type: selectedMediaType,
          media_size: mediaSize,
          cover_path: coverPath,
          duration_seconds: mediaDuration,
          status: targetStatus,
        });
      }

      setUploadPercentage(100);
      setCreatedEpisode(savedEpisode);
      setStep('success');
      onEpisodeCreated?.(savedEpisode);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Upload aborted');
      } else {
        console.error('Publishing failed:', err);
        setUploadError(err.message || 'An error occurred during upload or saving to database.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0c0a18] border border-[#262143] rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-[#211c3b] flex items-center justify-between bg-gradient-to-r from-[#15102d] to-[#0c0a18]">
          <div className="flex items-center gap-3">
            {step === 'form' && !editEpisode && (
              <button
                onClick={() => setStep('select')}
                className="p-1.5 rounded-lg hover:bg-white/5 text-[#a78bfa] hover:text-white transition-colors"
                title="Back to options"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                {step === 'select'
                  ? 'Create & Publish Content'
                  : editEpisode
                  ? `Edit ${editEpisode.media_type === 'video' ? 'Video' : 'Podcast'}`
                  : selectedMediaType === 'video'
                  ? 'Publish Video Podcast'
                  : 'Publish Audio Podcast'}
              </h2>
              <p className="text-xs text-[#a78bfa]/80 mt-0.5">
                Jagadambha College of Engineering & Technology · ECHONOVA Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* STEP 1: SELECT OPTION A vs OPTION B */}
          {step === 'select' && (
            <div className="space-y-6 py-4">
              <div className="text-center max-w-md mx-auto mb-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#a78bfa] block mb-1">
                  Choose Format
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                  What would you like to create?
                </h3>
                <p className="text-xs text-[#a78bfa]/80 mt-1.5">
                  Publish your ideas, research, technical talks, or campus stories to the JCOET network.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* OPTION A: Audio Podcast */}
                <div
                  onClick={() => handleSelectOption('audio')}
                  className="group relative p-6 rounded-2xl bg-gradient-to-b from-[#141029] to-[#0e0b1d] border border-[#2a244b] hover:border-[#7c3aed] cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#7c3aed]/20 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7c3aed]/20 to-[#a78bfa]/20 border border-[#7c3aed]/40 flex items-center justify-center text-[#c4b5fd] group-hover:scale-110 transition-transform">
                      <Radio className="w-7 h-7 text-[#a78bfa]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#a78bfa]">
                        Option A
                      </span>
                      <h4 className="text-lg font-bold font-display text-white group-hover:text-[#c4b5fd] transition-colors mt-0.5">
                        Audio Podcast
                      </h4>
                      <p className="text-xs text-[#a78bfa]/75 leading-relaxed mt-2">
                        Upload MP3, M4A, or WAV recordings. Perfect for technical interviews, student discussions, lectures, and storytelling.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#221c3d] flex items-center justify-between text-xs font-semibold text-[#c4b5fd] group-hover:text-white">
                    <span>Select Audio</span>
                    <span>→</span>
                  </div>
                </div>

                {/* OPTION B: Video Podcast */}
                <div
                  onClick={() => handleSelectOption('video')}
                  className="group relative p-6 rounded-2xl bg-gradient-to-b from-[#170e28] to-[#100a1d] border border-[#351e3a] hover:border-[#ff6b6b] cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#ff6b6b]/20 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff6b6b]/20 to-[#fb7185]/20 border border-[#ff6b6b]/40 flex items-center justify-center text-[#ff6b6b] group-hover:scale-110 transition-transform">
                      <Video className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff6b6b]">
                        Option B
                      </span>
                      <h4 className="text-lg font-bold font-display text-white group-hover:text-[#fda4af] transition-colors mt-0.5">
                        Video Podcast
                      </h4>
                      <p className="text-xs text-[#a78bfa]/75 leading-relaxed mt-2">
                        Upload MP4 or WebM videos from phone gallery or laptop. Include custom thumbnails, code showcases, and project demos.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#28172c] flex items-center justify-between text-xs font-semibold text-[#ff6b6b] group-hover:text-white">
                    <span>Select Video</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FORM (AUDIO OR VIDEO) */}
          {step === 'form' && (
            <div className="space-y-6">
              {/* Media File Picker Area */}
              <div>
                <label className="block text-xs font-semibold text-white mb-2">
                  {selectedMediaType === 'video' ? 'Select Video File' : 'Select Audio File'} *
                </label>

                {/* Device Picker Zone */}
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => mediaInputRef.current?.click()}
                  className={`relative p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                    isDragging
                      ? 'border-[#ff6b6b] bg-[#ff6b6b]/10'
                      : mediaFile
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-[#2f2852] hover:border-[#7c3aed] bg-[#120f24]'
                  }`}
                >
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept={
                      selectedMediaType === 'video'
                        ? 'video/mp4,video/webm,video/quicktime,video/*,.mp4,.webm,.mov'
                        : 'audio/mpeg,audio/mp4,audio/wav,audio/*,.mp3,.m4a,.wav'
                    }
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleMediaFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {mediaFile ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                        {selectedMediaType === 'video' ? (
                          <FileVideo className="w-6 h-6" />
                        ) : (
                          <FileAudio className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white truncate max-w-md">
                        {mediaFile.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[#a78bfa] mt-1">
                        <span>{formatBytes(mediaFile.size)}</span>
                        <span>·</span>
                        <span className="uppercase">{mediaFile.name.split('.').pop()}</span>
                      </div>
                      <p className="text-[11px] text-[#c4b5fd] mt-2 underline">
                        Click or drag to replace file
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-white/5 text-[#a78bfa] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">
                        {selectedMediaType === 'video'
                          ? 'Browse Device or Drag & Drop Video'
                          : 'Browse Device or Drag & Drop Audio'}
                      </p>
                      <p className="text-xs text-[#a78bfa]/70 max-w-xs">
                        {selectedMediaType === 'video'
                          ? 'Select MP4, WebM or MOV from gallery or computer (Max 500 MB)'
                          : 'Select MP3, M4A or WAV recording (Max 100 MB)'}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          mediaInputRef.current?.click();
                        }}
                        className="mt-3 px-4 py-1.5 rounded-xl bg-[#201a3b] hover:bg-[#2e2654] text-white text-xs font-medium border border-[#3b3263] transition-colors"
                      >
                        Browse Device
                      </button>
                    </div>
                  )}
                </div>

                {validationErrors.media && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {validationErrors.media}
                  </p>
                )}
              </div>

              {/* In-Modal Media Preview (Actual Preview of Uploaded Media!) */}
              {mediaPreviewUrl && (
                <div className="p-4 rounded-2xl bg-[#141029] border border-[#2b244d] space-y-2">
                  <span className="text-xs font-semibold text-[#c4b5fd] block">
                    Media Playback Preview
                  </span>
                  {selectedMediaType === 'video' ? (
                    <video
                      src={mediaPreviewUrl}
                      controls
                      className="w-full rounded-xl aspect-video bg-black max-h-56 object-contain"
                    />
                  ) : (
                    <audio
                      src={mediaPreviewUrl}
                      controls
                      className="w-full mt-1 accent-[#7c3aed]"
                    />
                  )}
                </div>
              )}

              {/* Title & Description */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Episode Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Building an Autonomous Drone: Insights from JCOET Lab"
                    className="w-full bg-[#120f22] border border-[#2b244d] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#a78bfa]/50 focus:outline-none focus:border-[#7c3aed]"
                  />
                  {validationErrors.title && (
                    <p className="text-xs text-rose-400 mt-1">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1">
                    Description & Show Notes *
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the topic, takeaways, participants, and links to code repositories or research..."
                    className="w-full bg-[#120f22] border border-[#2b244d] rounded-xl p-3 text-xs text-white placeholder-[#a78bfa]/50 focus:outline-none focus:border-[#7c3aed]"
                  />
                  {validationErrors.description && (
                    <p className="text-xs text-rose-400 mt-1">{validationErrors.description}</p>
                  )}
                </div>
              </div>

              {/* Category & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#a78bfa]" />
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#120f22] border border-[#2b244d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#ff6b6b]" />
                    Language *
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[#120f22] border border-[#2b244d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7c3aed]"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Cover Artwork / Thumbnail */}
              <div>
                <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#a78bfa]" />
                  {selectedMediaType === 'video' ? 'Custom Thumbnail (Optional)' : 'Cover Artwork (Optional)'}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-[#1a1435] hover:bg-[#251e4a] border border-[#3b3260] text-xs font-medium text-white transition-colors"
                  >
                    Browse Artwork
                  </button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCoverFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  {coverPreviewUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={coverPreviewUrl}
                        alt="Cover Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-[#3b3260]"
                      />
                      <span className="text-xs text-[#a78bfa]">
                        {coverFile?.name || 'Selected'}
                      </span>
                    </div>
                  )}
                </div>
                {validationErrors.cover && (
                  <p className="text-xs text-rose-400 mt-1">{validationErrors.cover}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: UPLOADING PROGRESS */}
          {step === 'uploading' && (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#211d38"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#7c3aed"
                    strokeWidth="6"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * uploadPercentage) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-300"
                  />
                </svg>
                <span className="absolute font-display font-bold text-lg text-white">
                  {uploadPercentage}%
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-display">
                  {uploadStatusText}
                </h3>
                <p className="text-xs text-[#a78bfa]/80 mt-1 max-w-sm">
                  {mediaFile?.name} ({mediaFile ? formatBytes(mediaFile.size) : ''})
                </p>
              </div>

              {uploadError ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs max-w-md">
                  <p className="font-semibold mb-1">Upload Error</p>
                  <p>{uploadError}</p>
                  <button
                    onClick={() => handleSubmit('published')}
                    className="mt-3 px-3 py-1 bg-rose-500 text-white rounded-lg font-medium flex items-center gap-1 mx-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                  </button>
                </div>
              ) : (
                <button
                  onClick={cancelUpload}
                  className="px-4 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
                >
                  Cancel Upload
                </button>
              )}
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 'success' && createdEpisode && (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display text-white">
                {createdEpisode.status === 'published'
                  ? 'Successfully Published!'
                  : 'Saved as Draft!'}
              </h3>
              <p className="text-xs text-[#a78bfa]/80 max-w-md leading-relaxed">
                "{createdEpisode.title}" has been saved in the database.
                {createdEpisode.status === 'published'
                  ? ' It is now live for all students and visitors to discover.'
                  : ' You can review or publish it anytime from your Creator Dashboard.'}
              </p>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] text-white text-xs font-semibold shadow-lg hover:opacity-90"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (during Form step) */}
        {step === 'form' && (
          <div className="p-4 sm:p-5 border-t border-[#211c3b] flex flex-col-reverse sm:flex-row items-center justify-between gap-3 bg-[#0c0a18]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <div className="w-full sm:w-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-[#3b3460] bg-[#16122c] hover:bg-[#201a3e] text-xs font-medium text-white transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('published')}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] hover:from-[#6d28d9] hover:to-[#f43f5e] text-xs font-semibold text-white shadow-lg shadow-[#7c3aed]/25 transition-all transform active:scale-95"
              >
                Publish Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
