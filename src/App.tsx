/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, useOutletContext, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { RootLayout } from './layouts/RootLayout';

import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Videos } from './pages/Videos';
import { Podcasts } from './pages/Podcasts';
import { Categories } from './pages/Categories';
import { EpisodeDetail } from './pages/EpisodeDetail';
import { CreatorProfile } from './pages/CreatorProfile';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';

// Helper component to connect Home with RootLayout's onOpenCreate
function HomeWithContext() {
  const context = useOutletContext<{ onOpenCreate: () => void }>();
  return <Home onOpenCreate={context?.onOpenCreate || (() => {})} />;
}

function VideosWithContext() {
  const context = useOutletContext<{ onOpenCreate: () => void }>();
  return <Videos onOpenCreate={context?.onOpenCreate || (() => {})} />;
}

function PodcastsWithContext() {
  const context = useOutletContext<{ onOpenCreate: () => void }>();
  return <Podcasts onOpenCreate={context?.onOpenCreate || (() => {})} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomeWithContext />} />
              <Route path="explore" element={<Explore />} />
              <Route path="videos" element={<VideosWithContext />} />
              <Route path="podcasts" element={<PodcastsWithContext />} />
              <Route path="categories" element={<Categories />} />
              <Route path="watch/:idOrSlug" element={<EpisodeDetail />} />
              <Route path="creator/:username" element={<CreatorProfile />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
