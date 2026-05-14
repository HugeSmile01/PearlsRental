'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/layout/AuthProvider';
import { ShoppingBag, Menu, X, Sun, Moon, Heart, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user: session, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  return (
    <nav className={cn(
      'fixed top-0 inset-x-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-white/90 dark:bg-obsidian-950/90 backdrop-blur-md shadow-sm border-b border-obsidian-100 dark:border-obsidian-800'
        : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gold-600 rounded-lg flex items-center justify-center group-hover:bg-gold-700 transition-colors">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-obsidian-900 dark:text-white">
              Pearl&apos;s <span className="text-gold-600">Collection</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/catalog" className="btn-ghost text-sm">Catalog</Link>
            <Link href="/catalog?category=Gowns" className="btn-ghost text-sm">Gowns</Link>
            <Link href="/catalog?category=Suits" className="btn-ghost text-sm">Suits</Link>
            <Link href="/catalog?category=Dresses" className="btn-ghost text-sm">Dresses</Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="btn-ghost p-2">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {session ? (
              <>
                <Link href="/dashboard" className="btn-ghost p-2 hidden md:flex">
                  <Heart className="w-4 h-4" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 btn-ghost px-3 py-2"
                  >
                    <div className="w-7 h-7 bg-gold-100 dark:bg-gold-900/30 rounded-full flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-gold-600" />
                    </div>
                    <span className="text-sm hidden md:block">{session.user?.name?.split(' ')[0]}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 card-elevated py-1 animate-in">
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-obsidian-50 dark:hover:bg-obsidian-800 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <LayoutDashboard className="w-4 h-4 text-gold-600" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-obsidian-50 dark:hover:bg-obsidian-800 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <User className="w-4 h-4" />
                        My Dashboard
                      </Link>
                      <div className="border-t border-obsidian-100 dark:border-obsidian-700 my-1" />
                      <button onClick={() => signOut()} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm hidden md:flex">Sign In</Link>
                <Link href="/auth/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}

            <button className="md:hidden btn-ghost p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-obsidian-950 border-t border-obsidian-100 dark:border-obsidian-800 px-4 py-4 space-y-1 animate-in">
          {['/', '/catalog', '/dashboard'].map((href) => (
            <Link key={href} href={href} className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>
              {href === '/' ? 'Home' : href.slice(1).replace('-', ' ').replace(/^\w/, (c) => c.toUpperCase())}
            </Link>
          ))}
          {!session ? (
            <>
              <Link href="/auth/login" className="block btn-ghost w-full text-left" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link href="/auth/register" className="block btn-primary w-full text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          ) : (
            <button onClick={() => signOut()} className="block btn-ghost w-full text-left text-red-600">Sign Out</button>
          )}
        </div>
      )}
    </nav>
  );
}
