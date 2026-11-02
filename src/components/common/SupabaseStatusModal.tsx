import React, { useState } from 'react';
import { X, Check, Copy, Database, ShieldCheck, HardDrive, ExternalLink } from 'lucide-react';
import { dataService } from '../../services/dataService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const status = dataService.getBackendStatus();
  const isSupabase = status.mode === 'supabase';

  if (!isOpen) return null;

  const sqlMigrationCode = `-- ECHONOVA Initial Migration for Supabase
-- Tables: profiles, episodes, and media storage
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_path TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT NOT NULL,
  media_path TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video')),
  media_size BIGINT NOT NULL DEFAULT 0,
  cover_path TEXT,
  duration_seconds NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlMigrationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0e0c1a] border border-[#26223e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#26223e] flex items-center justify-between bg-gradient-to-r from-[#17132e] to-[#0e0c1a]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isSupabase ? 'bg-emerald-500/15 text-emerald-400' : 'bg-[#7c3aed]/15 text-[#c4b5fd]'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                {isSupabase ? 'Supabase Cloud Connected' : 'Storage Engine & Supabase Setup'}
              </h2>
              <p className="text-xs text-[#a78bfa]/80 mt-0.5">
                Jagadambha College of Engineering & Technology (JCOET)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#c4b5fd]/90">
          {/* Current Engine Status */}
          <div className="p-4 rounded-xl bg-[#141126] border border-[#26223e] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                Current Backend Mode:
              </span>
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-white">
                {status.mode === 'supabase' ? 'Supabase Live' : 'Offline / Local Engine'}
              </span>
            </div>
            <p className="text-xs text-[#a78bfa]/80 leading-relaxed">
              {status.description}
            </p>
          </div>

          {/* Setup steps for Supabase */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#ff6b6b]" />
              How to Connect Your Free Supabase Project
            </h3>
            <ol className="space-y-2.5 text-xs text-[#a78bfa]/90 list-decimal list-inside leading-relaxed bg-[#141126]/60 p-4 rounded-xl border border-[#26223e]/70">
              <li>
                Create a project at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline hover:text-[#ff6b6b] inline-flex items-center gap-1"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Open the <strong>SQL Editor</strong> in your Supabase dashboard and run the migration script below.
              </li>
              <li>
                Create two Storage Buckets in Supabase: <code className="bg-black/40 px-1 py-0.5 rounded text-white">media</code> and <code className="bg-black/40 px-1 py-0.5 rounded text-white">covers</code> with Public enabled.
              </li>
              <li>
                Add <code className="text-white">VITE_SUPABASE_URL</code> and <code className="text-white">VITE_SUPABASE_ANON_KEY</code> to your environment.
              </li>
            </ol>
          </div>

          {/* SQL snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#a78bfa]" />
                Supabase SQL Migration (<code className="text-xs text-[#c4b5fd]">/supabase/migrations/20261102_init_echonova.sql</code>)
              </span>
              <button
                onClick={copySql}
                className="flex items-center gap-1.5 text-xs text-white bg-[#7c3aed]/30 hover:bg-[#7c3aed]/50 px-2.5 py-1 rounded-md transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied SQL' : 'Copy SQL'}
              </button>
            </div>
            <pre className="p-3 bg-[#080710] border border-[#221e38] rounded-xl text-[11px] font-mono text-[#a78bfa] overflow-x-auto max-h-44 leading-relaxed">
              {sqlMigrationCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#26223e] flex justify-end bg-[#0e0c1a]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-[#7c3aed] hover:bg-[#6d28d9] rounded-xl transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
