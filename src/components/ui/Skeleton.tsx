import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700',
        className
      )}
    />
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-4 bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-2 flex-1">
          <Skeleton className="h-8 w-12 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-8 w-8" />
        <div className="flex flex-col items-center gap-2 flex-1">
          <Skeleton className="h-8 w-12 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  );
}
