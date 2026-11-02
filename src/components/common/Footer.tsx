import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Radio, Video, Layers, Compass, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#1e1b33] bg-[#05050a] text-[#a78bfa]/80 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <Logo size="md" showTagline />
            <p className="text-xs text-[#a78bfa]/70 leading-relaxed pt-2">
              The premier podcast and video publishing studio designed for the vibrant student creator community at Jagadambha College of Engineering & Technology.
            </p>
            <p className="text-[11px] text-[#c4b5fd]/60">
              Department of Computer Engineering & IT Initiatives
            </p>
          </div>

          {/* Platform Exploration */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">
              Explore Content
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/videos" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#ff6b6b]" />
                  Video Podcasts
                </Link>
              </li>
              <li>
                <Link to="/podcasts" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#a78bfa]" />
                  Audio Podcasts
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#c4b5fd]" />
                  Categories & Disciplines
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#7c3aed]" />
                  Creator Discovery
                </Link>
              </li>
            </ul>
          </div>

          {/* JCOET Campus & Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">
              JCOET Campus
            </h4>
            <ul className="space-y-2 text-[#a78bfa]/75">
              <li>Jagadambha College of Engineering & Technology</li>
              <li>Yavatmal, Maharashtra, India</li>
              <li>Affiliated to DBATU Lonere & SGBAU Amravati</li>
              <li>Approved by AICTE New Delhi</li>
              <li>Student Innovation & Media Cell</li>
            </ul>
          </div>

          {/* Technology & Privacy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">
              Architecture & Security
            </h4>
            <p className="text-[11px] text-[#a78bfa]/70 leading-relaxed">
              Engineered with React 19, TypeScript, Tailwind CSS, Supabase PostgreSQL, and Row Level Security policies.
            </p>
            <div className="flex items-center gap-2 pt-2 text-[#c4b5fd]">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-medium">Row Level Security Enforced</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#18152b] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#a78bfa]/60">
          <p>© {new Date().getFullYear()} ECHONOVA — Jagadambha College of Engineering & Technology (JCOET). All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-[#ff6b6b] fill-current" />
            <span>for collegiate student innovators</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
