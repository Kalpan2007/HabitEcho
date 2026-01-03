import { SkeletonStatCard, SkeletonCard } from '@/components/ui';

// ============================================
// DASHBOARD LOADING STATE
// ============================================

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Today's habits skeleton */}
      <SkeletonCard />

      {/* Rolling averages skeleton */}
      <SkeletonCard />
    </div>
  );
}
