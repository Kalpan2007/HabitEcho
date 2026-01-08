import { ReactNode } from 'react';
import { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SEO_ROUTES } from '@/lib/seo.config';

// ============================================
// DASHBOARD LAYOUT
// Server Component - handles auth check
// ============================================

// Dashboard metadata - noindex since it's private/authenticated
export const metadata: Metadata = {
  title: SEO_ROUTES.DASHBOARD.title,
  description: SEO_ROUTES.DASHBOARD.description,
  robots: {
    index: false,
    follow: false,
  },
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Require authentication - redirects to login if not authenticated
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar (desktop) */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <Header user={user} />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile navigation */}
      <MobileNav />
    </div>
  );
}
