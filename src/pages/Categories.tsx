import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, Video, Radio } from 'lucide-react';
import { CATEGORIES } from '../types';
import { dataService } from '../services/dataService';

export const Categories: React.FC = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCounts() {
      try {
        const episodes = await dataService.getPublishedEpisodes();
        const map: Record<string, number> = {};
        for (const ep of episodes) {
          map[ep.category] = (map[ep.category] || 0) + 1;
        }
        setCounts(map);
      } catch (err) {
        console.error('Failed to load category counts:', err);
      }
    }
    loadCounts();
  }, []);

  const categoryDescriptions: Record<string, string> = {
    'Technology & Coding': 'Software engineering, web development, AI architectures, algorithms, and cloud systems.',
    'Engineering & Robotics': 'Embedded systems, microcontrollers, IoT, mechanical design, and electrical circuits.',
    'Campus Life & JCOET': 'Student experiences, college events, departmental fest stories, and alumni journeys.',
    'Science & Innovation': 'Physics, mathematics, deep tech research, applied materials, and patent ideas.',
    'Arts & Culture': 'Music, spoken word, campus drama, photography, creative writing, and graphic artistry.',
    'Careers & Interviews': 'Placement preparation, internship advice, mock interviews, and tech recruiter chats.',
    'Startups & Ventures': 'Student entrepreneurship, business models, funding pitches, and college incubator news.',
    'Education & Tutorials': 'Step-by-step lecture series, lab walkthroughs, study roadmaps, and viva tips.',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#7c3aed]/15 text-[#c4b5fd]">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Disciplines & Categories
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#a78bfa]/80 mt-1">
          Explore student and faculty contributions segmented by domain at Jagadambha College of Engineering & Technology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => {
          const count = counts[cat] || 0;
          return (
            <Link
              key={cat}
              to={`/explore?category=${encodeURIComponent(cat)}`}
              className="p-6 rounded-3xl bg-[#0e0c1c] hover:bg-[#141128] border border-[#231e3d] hover:border-[#7c3aed] transition-all flex flex-col justify-between group shadow-lg hover:shadow-2xl hover:shadow-[#7c3aed]/10"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold text-[#a78bfa] font-mono">
                    {count} {count === 1 ? 'Episode' : 'Episodes'}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-[#7c3aed] text-white/50 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-white group-hover:text-[#c4b5fd] transition-colors">
                  {cat}
                </h3>

                <p className="text-xs text-[#a78bfa]/75 leading-relaxed mt-2.5">
                  {categoryDescriptions[cat] || 'Explore student creations and discussions in this category.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1c1833] flex items-center gap-4 text-xs font-semibold text-[#c4b5fd] group-hover:text-white">
                <span className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-[#ff6b6b]" />
                  <span>Videos</span>
                </span>
                <span className="text-[#3b3260]">·</span>
                <span className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-[#a78bfa]" />
                  <span>Audio</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
