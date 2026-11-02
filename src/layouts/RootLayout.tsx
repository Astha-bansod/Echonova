import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { GlobalAudioPlayer } from '../components/player/GlobalAudioPlayer';
import { CreatePublishModal } from '../components/upload/CreatePublishModal';
import { useAuth } from '../contexts/AuthContext';

export const RootLayout: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=create');
    } else {
      setIsCreateModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#07070d] text-[#e2e2ec] relative cosmic-grid selection:bg-[#7c3aed]/30 selection:text-white">
      {/* Sticky Navigation Header */}
      <Header onOpenCreate={handleOpenCreate} />

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        <Outlet context={{ onOpenCreate: handleOpenCreate }} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Persistent Bottom Audio Player Bar */}
      <GlobalAudioPlayer />

      {/* Global Content Creator Publishing Modal */}
      <CreatePublishModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onEpisodeCreated={(ep) => {
          setIsCreateModalOpen(false);
          navigate(`/watch/${ep.slug || ep.id}`);
        }}
      />
    </div>
  );
};
