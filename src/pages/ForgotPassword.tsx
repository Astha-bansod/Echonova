import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            Reset Password
          </h2>
          <p className="text-xs text-[#a78bfa]/80">
            Enter your JCOET student or creator email to receive a recovery link.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#0d0a1b] border border-[#231e3d] shadow-2xl space-y-5">
          {sent ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-display">Check your inbox</h3>
              <p className="text-xs text-[#a78bfa]/80 leading-relaxed">
                If an account exists for <strong>{email}</strong>, a recovery link has been dispatched.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#c4b5fd] hover:text-white pt-2 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#a78bfa]" />
                  Registered Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@jcoet.ac.in"
                  className="w-full bg-[#141029] border border-[#292247] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#a78bfa]/50 focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ff6b6b] hover:from-[#6d28d9] hover:to-[#f43f5e] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#7c3aed]/25 transition-all transform active:scale-95"
              >
                Send Password Reset Link
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-[#a78bfa] hover:text-white inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
