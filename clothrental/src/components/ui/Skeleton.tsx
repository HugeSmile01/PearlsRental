import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-obsidian-200 dark:bg-obsidian-700 rounded-lg',
        'bg-gradient-to-r from-obsidian-200 via-obsidian-100 to-obsidian-200',
        'dark:from-obsidian-700 dark:via-obsidian-600 dark:to-obsidian-700',
        'bg-[length:200%_100%] animate-shimmer',
        className
      )}
    />
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="aspect-[3/4]" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-24 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
