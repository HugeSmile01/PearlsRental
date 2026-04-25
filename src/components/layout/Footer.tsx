import Link from 'next/link';
import { ShoppingBag, MapPin, Clock, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-obsidian-900 dark:bg-obsidian-950 text-obsidian-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gold-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-xl font-semibold text-white">
                Pearl&apos;s <span className="text-gold-400">Collection</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-obsidian-400 max-w-xs">
              Premium clothing rental for every occasion. Reserve online, pay cash on pickup. Dress your best for less.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                <span>123 Ayala Avenue, Makati City, Philippines</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Mon–Fri 9AM–8PM · Sat–Sun 10AM–6PM</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Browse</h4>
            <ul className="space-y-2 text-sm">
              {['Gowns', 'Suits', 'Dresses', 'Blazers', 'Traditional'].map((cat) => (
                <li key={cat}>
                  <Link href={`/catalog?category=${cat}`} className="hover:text-gold-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Sign In', href: '/auth/login' },
                { label: 'Register', href: '/auth/register' },
                { label: 'My Rentals', href: '/dashboard' },
                { label: 'Wishlist', href: '/dashboard?tab=favorites' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-gold-400 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-obsidian-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-obsidian-500">
          <p>© {new Date().getFullYear()} Pearl's Clothing Collection. All rights reserved.</p>
          <p>Cash on pickup · No online payment required</p>
        </div>
      </div>
    </footer>
  );
}
