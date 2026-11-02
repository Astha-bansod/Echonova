import React from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No content published yet',
  description = 'Be the pioneer voice of Jagadambha College of Engineering & Technology. Record your podcast or upload your video project today.',
  actionLabel = 'Publish First Episode',
  onAction,
  icon,
}) => {
  return (
    <div className="w-full py-16 px-6 text-center rounded-3xl bg-gradient-to-b from-[#110e24]/70 to-[#0a0817]/80 border border-[#231f3d] flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7c3aed]/20 to-[#ff6b6b]/20 border border-[#7c3aed]/30 flex items-center justify-center text-[#c4b5fd] mb-5 shadow-inner">
        {icon || <Sparkles className="w-8 h-8 text-[#a78bfa]" />}
      </div>
      <h3 className="text-lg md:text-xl font-bold font-display text-white mb-2 max-w-md">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-[#a78bfa]/75 max-w-lg mb-6 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] hover:from-[#6d28d9] hover:to-[#f43f5e] text-white text-xs font-semibold shadow-lg shadow-[#7c3aed]/25 transition-all transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
