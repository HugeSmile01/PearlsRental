import { Suspense } from 'react';

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div className="text-obsidian-400">Loading catalog...</div>
      </div>
    }>
      {children}
    </Suspense>
  );
}
