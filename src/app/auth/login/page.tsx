'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseSignIn } from '@/lib/supabase';
import Link from 'next/link';
import { ShoppingBag, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabaseSignIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Invalid email or password');
    } else {
      toast.success('Welcome back!');
      router.push('/dashboard');
    }
  };

  const demoLogin = async (role: 'user' | 'admin') => {
    setLoading(true);
    const creds = role === 'admin'
      ? { email: 'admin@pearlscollection.com', password: 'admin123' }
      : { email: 'demo@pearlscollection.com', password: 'user123' };
    const { error } = await supabaseSignIn(creds.email, creds.password);
    setLoading(false);
    if (!error) {
      toast.success(`Logged in as ${role}`);
      router.push(role === 'admin' ? '/admin' : '/dashboard');
    } else {
      toast.error(error.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gold-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-semibold">Pearl&apos;s <span className="text-gold-600">Collection</span></span>
          </Link>
          <h1 className="font-display text-3xl font-semibold mb-2">Welcome back</h1>
          <p className="text-obsidian-500 text-sm">Sign in to manage your rentals</p>
        </div>

        <div className="card-elevated p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-400 hover:text-obsidian-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              <LogIn className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-obsidian-200 dark:border-obsidian-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-obsidian-900 px-3 text-xs text-obsidian-400">or try a demo account</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => demoLogin('user')} className="btn-secondary text-xs py-2.5">
              Demo User
            </button>
            <button onClick={() => demoLogin('admin')} className="btn-secondary text-xs py-2.5 border-gold-400 text-gold-600">
              Demo Admin
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-obsidian-500">
          No account?{' '}
          <Link href="/auth/register" className="text-gold-600 hover:underline font-medium">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
