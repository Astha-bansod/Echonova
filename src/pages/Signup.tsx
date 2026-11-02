import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, User, AtSign, AlertCircle, ArrowRight } from 'lucide-react';
import { validateUsername } from '../utils/validation';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate username
    const usernameVal = validateUsername(username);
    if (!usernameVal.valid) {
      setError(usernameVal.error || 'Invalid username');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, username, displayName);
      navigate('/dashboard?action=welcome');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Join the Creator Universe
          </h2>
          <p className="text-xs text-[#a78bfa]/80">
            Sign up to broadcast your audio podcasts and engineering video projects at JCOET.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0a1b] border border-[#231e3d] shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#a78bfa]" />
                Display Name (Your Full Name) *
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Astha Bansod"
                className="w-full bg-[#141029] border border-[#292247] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#a78bfa]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-[#a78bfa]" />
                Unique Username *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="asthabansod"
                className="w-full bg-[#141029] border border-[#292247] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#a78bfa]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
              />
              <p className="text-[11px] text-[#a78bfa]/60 mt-1">
                Letters, numbers, and underscores only (3-24 characters)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#a78bfa]" />
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@jcoet.ac.in"
                className="w-full bg-[#141029] border border-[#292247] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#a78bfa]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#a78bfa]" />
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[#141029] border border-[#292247] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#a78bfa]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] hover:from-[#6d28d9] hover:to-[#f43f5e] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#7c3aed]/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Registering Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#1e1935] text-center text-xs text-[#a78bfa]/80">
            <span>Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold text-white hover:text-[#c4b5fd] underline ml-1"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
