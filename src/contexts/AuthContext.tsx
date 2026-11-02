import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Profile } from '../types';
import { dataService, UserSession } from '../services/dataService';

interface AuthContextType {
  user: UserSession['user'] | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, pass: string, username: string, name: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, 'display_name' | 'bio' | 'avatar_path'>>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession['user'] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await dataService.getSession();
      if (session) {
        setUser(session.user);
        setProfile(session.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Session load error:', err);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const signUp = async (email: string, pass: string, username: string, name: string) => {
    const session = await dataService.signUp(email, pass, username, name);
    setUser(session.user);
    setProfile(session.profile);
  };

  const signIn = async (email: string, pass: string) => {
    const session = await dataService.signIn(email, pass);
    setUser(session.user);
    setProfile(session.profile);
  };

  const signOut = async () => {
    await dataService.signOut();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'bio' | 'avatar_path'>>) => {
    if (!profile) return;
    const updated = await dataService.updateProfile(profile.id, updates);
    setProfile(updated);
  };

  const refreshProfile = async () => {
    if (!profile) return;
    const refreshed = await dataService.getProfile(profile.id);
    if (refreshed) {
      setProfile(refreshed);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user && !!profile,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
