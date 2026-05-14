'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type SessionUser = { id: string; email?: string; name?: string; role?: string };
type Session = { user: SessionUser };

const AuthContext = createContext<{ user: Session | null; loading: boolean; signOut: () => Promise<void> }>({ user: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/auth/session').then((r) => r.json()).then((data) => setUser(data.user ? { user: data.user } : null)).finally(() => setLoading(false)); }, []);
  const signOut = async () => { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
