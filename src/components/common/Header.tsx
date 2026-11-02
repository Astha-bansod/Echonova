import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
  Compass,
  Video,
  Radio,
  Layers,
  LayoutDashboard,
  Server,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../contexts/AuthContext';
import { dataService } from '../../services/dataService';
import { SupabaseStatusModal } from './SupabaseStatusModal';

interface HeaderProps {
  onOpenCreate?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreate }) => {
  const { user, profile, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const isSupabase = dataService.isSupabaseEnabled();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=create');
    } else if (onOpenCreate) {
      onOpenCreate();
    } else {
      navigate('/dashboard?action=create');
    }
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore', path: '/explore' },
    { label: 'Videos', path: '/videos' },
    { label: 'Podcasts', path: '/podcasts' },
    { label: 'Categories', path: '/categories' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#211d36]/80 bg-[#07070d]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0 group">
            <Logo size="md" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-white ${
                    isActive ? 'text-white font-semibold' : 'text-[#a78bfa]/80'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center relative flex-1 max-w-xs"
          >
            <Search className="w-4 h-4 absolute left-3 text-[#a78bfa]/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Search videos, podcasts, creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#120f22] border border-[#26223e] rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-[#a78bfa]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
            />
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Backend status badge */}
            <button
              onClick={() => setStatusModalOpen(true)}
              title="Click to view Database & Storage connection details"
              className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-[#c4b5fd]/80 hover:text-white px-2.5 py-1 rounded-lg bg-[#141126] border border-[#282444] transition-colors"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="hidden xl:inline">
                {isSupabase ? 'Supabase' : 'Offline Engine'}
              </span>
            </button>

            {/* Create Button */}
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] hover:from-[#6d28d9] hover:to-[#f43f5e] text-white text-xs font-semibold shadow-md shadow-[#7c3aed]/20 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create</span>
            </button>

            {/* User Profile or Login */}
            {isAuthenticated && profile ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 border border-transparent hover:border-[#2b2746] transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#ff6b6b] flex items-center justify-center text-xs font-bold text-white shadow-inner">
                    {profile.avatar_path ? (
                      <img
                        src={profile.avatar_path}
                        alt={profile.display_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      profile.display_name?.charAt(0).toUpperCase() || 'C'
                    )}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#0e0c1a] border border-[#2b2746] rounded-xl shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-[#211d36]">
                      <p className="font-semibold text-white truncate">
                        {profile.display_name}
                      </p>
                      <p className="text-[#a78bfa]/70 truncate">
                        @{profile.username}
                      </p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[#c4b5fd] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#a78bfa]" />
                      Creator Dashboard
                    </Link>

                    <Link
                      to={`/creator/${profile.username}`}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-[#c4b5fd] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#a78bfa]" />
                      Public Profile
                    </Link>

                    <div className="border-t border-[#211d36] my-1" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-[#c4b5fd] hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-block px-3 py-1.5 text-xs font-semibold text-white bg-[#1e1935] hover:bg-[#282245] border border-[#3b345d] rounded-xl transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#a78bfa] hover:text-white rounded-lg hover:bg-white/5"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#211d36] bg-[#0a0815] px-4 pt-3 pb-6 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#a78bfa]/60 pointer-events-none" />
              <input
                type="text"
                placeholder="Search podcasts, videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#120f22] border border-[#26223e] rounded-xl pl-9 pr-4 py-2 text-xs text-white"
              />
            </form>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141026] text-white"
              >
                <Sparkles className="w-4 h-4 text-[#a78bfa]" />
                Home
              </Link>
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141026] text-white"
              >
                <Compass className="w-4 h-4 text-[#a78bfa]" />
                Explore
              </Link>
              <Link
                to="/videos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141026] text-white"
              >
                <Video className="w-4 h-4 text-[#ff6b6b]" />
                Videos
              </Link>
              <Link
                to="/podcasts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141026] text-white"
              >
                <Radio className="w-4 h-4 text-[#a78bfa]" />
                Podcasts
              </Link>
              <Link
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141026] text-white"
              >
                <Layers className="w-4 h-4 text-[#c4b5fd]" />
                Categories
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141026] text-white"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#7c3aed]" />
                  Dashboard
                </Link>
              )}
            </div>

            <div className="pt-2 border-t border-[#211d36] flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setStatusModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-[#a78bfa]"
              >
                <Server className="w-3.5 h-3.5" />
                Backend Status
              </button>
              {!isAuthenticated && (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[#c4b5fd] hover:text-white font-medium"
                  >
                    Log In
                  </Link>
                  <span className="text-[#3b345d]">·</span>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <SupabaseStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </>
  );
};
