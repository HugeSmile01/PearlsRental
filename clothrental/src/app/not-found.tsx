import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-8xl font-semibold text-gold-500 mb-4">404</p>
        <h1 className="font-display text-3xl font-semibold mb-4">Page Not Found</h1>
        <p className="text-obsidian-500 mb-8">The page you're looking for doesn't exist.</p>
        <Link href="/" className="btn-primary">Return Home</Link>
      </div>
    </div>
  );
}
