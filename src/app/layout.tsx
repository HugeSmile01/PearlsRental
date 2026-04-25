import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: "Pearl's Clothing Collection — Premium Fashion Rental",
    template: "%s | Pearl's Clothing Collection",
  },
  description: 'Rent designer clothing and formal wear for any occasion. Premium fashion rental with cash on pickup.',
  keywords: ['clothing rental', 'fashion rental', 'formal wear', 'gown rental', 'suit rental'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
