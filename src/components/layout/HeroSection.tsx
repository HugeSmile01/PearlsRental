import Link from 'next/link';
import { ArrowRight, Star, Shield, Clock } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian-900 via-obsidian-800 to-obsidian-900" />
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23c99520' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")` }}
      />

      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 pt-40">
        <div className="max-w-3xl">
 
          <h1 className="text-h1 text-white mb-6">
            Dress for the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-500">
              moment,
            </span>
            <br />not forever.
          </h1>

          <p className="text-body text-obsidian-300 mb-10 max-w-xl">
            Reserve designer gowns, suits, and formal wear online. Pick up at our Makati store and pay in cash. No subscriptions. No surprises.
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            <Link href="/catalog" className="btn-primary btn-lg">
              Browse Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/register" className="btn-secondary btn-lg border-white/20 text-white hover:border-gold-500">
              Create Account
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap gap-6">
            {[
              { icon: Shield, label: 'Cash on Pickup', sub: 'No online payment' },
              { icon: Clock, label: 'Fast Reservation', sub: 'Book in minutes' },
              { icon: Star, label: 'Premium Pieces', sub: 'Curated collection' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gold-600/10 border border-gold-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-obsidian-500 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative image strip */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian-900 via-obsidian-900/60 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=900&fit=crop"
          alt="Fashion"
          className="w-full h-full object-cover opacity-40"
        />
      </div>
    </section>
  );
}
