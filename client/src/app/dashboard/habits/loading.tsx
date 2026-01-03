import { SkeletonCard } from '@/components/ui';

// ============================================
// HABITS LIST LOADING STATE
// ============================================

export default function HabitsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Habits list skeleton */}
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
