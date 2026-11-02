import React from 'react';
import { Link } from 'react-router-dom';
import { Profile } from '../../types';
import { User, ArrowUpRight } from 'lucide-react';

interface CreatorCardProps {
  creator: Profile;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  return (
    <Link
      to={`/creator/${creator.username}`}
      className="group relative p-5 rounded-2xl bg-[#0e0c1c] hover:bg-[#15122a] border border-[#231e3d] hover:border-[#3d3463] transition-all flex flex-col justify-between shadow-md hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#ff6b6b] p-0.5 shadow-md">
            <div className="w-full h-full rounded-[14px] bg-[#0e0c1c] overflow-hidden flex items-center justify-center">
              {creator.avatar_path ? (
                <img
                  src={creator.avatar_path}
                  alt={creator.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-base text-white">
                  {creator.display_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm text-white group-hover:text-[#c4b5fd] transition-colors leading-snug">
              {creator.display_name}
            </h4>
            <p className="text-xs text-[#a78bfa]/70">@{creator.username}</p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#7c3aed] text-white/50 group-hover:text-white flex items-center justify-center transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      <p className="text-xs text-[#a78bfa]/75 line-clamp-2 leading-relaxed">
        {creator.bio || 'JCOET Student Creator passionate about sharing technical innovations and campus stories.'}
      </p>

      <div className="mt-4 pt-3 border-t border-[#1e1a33] flex items-center justify-between text-[11px] text-[#c4b5fd]/80">
        <span>JCOET Creator</span>
        <span className="font-medium text-white group-hover:underline">View Showcase →</span>
      </div>
    </Link>
  );
};
