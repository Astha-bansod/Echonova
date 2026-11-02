import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || 'dashboard';

  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      if (redirect === 'create') {
        navigate('/dashboard?action=create');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Welcome to ECHONOVA
          </h2>
          <p className="text-xs text-[#a78bfa]/80">
            Log in to your creator account to publish and manage your podcasts & videos.
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
                <Mail className="w-3.5 h-3.5 text-[#a78bfa]" />
                Email Address
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#a78bfa]" />
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-[#c4b5fd] hover:text-white"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#141029] border border-[#292247] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#a78bfa]/50 focus:outline-none focus:border-[#7c3aed] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] hover:from-[#6d28d9] hover:to-[#f43f5e] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#7c3aed]/25 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#1e1935] text-center text-xs text-[#a78bfa]/80">
            <span>Don't have an account yet? </span>
            <Link
              to="/signup"
              className="font-semibold text-white hover:text-[#c4b5fd] underline ml-1"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
