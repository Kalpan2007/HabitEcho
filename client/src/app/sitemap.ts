/**
 * Dynamic Sitemap for HabitEcho
 * 
 * Generates XML sitemap for search engine crawlers with optimal configuration
 * Includes all public pages with appropriate priorities and change frequencies
 * Optimized for Google Search Console indexing
 * 
 * Next.js 15 App Router: Use app/sitemap.ts for dynamic sitemap generation
 * Access at: https://habitecho.vercel.app/sitemap.xml
 */

import { MetadataRoute } from 'next';
import { SEO_CONFIG, SEO_ROUTES } from '@/lib/seo.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SEO_CONFIG.brand.url;
  const currentDate = new Date();

  // Private paths to exclude from sitemap (not for search engines)
  const excludePaths = ['/dashboard', '/auth', '/api'];

  // Static pages from SEO_ROUTES configuration (only public pages)
  const staticRoutes = Object.values(SEO_ROUTES)
    .filter((route) => !excludePaths.some((exclude) => route.path.startsWith(exclude)))
    .map((route) => ({
      url: `${baseUrl}${route.path}`,
      lastModified: currentDate,
      changeFrequency: route.changefreq as 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
      priority: route.priority,
    }));

  // Feature pages - High priority for SEO
  const featureRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/features/habit-tracking`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/analytics`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/streak-tracking`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/features/smart-insights`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/features/goal-setting`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  // Use case pages - Important for long-tail SEO
  const useCaseRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/use-cases/daily-habits`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/use-cases/productivity-habits`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/use-cases/morning-routine`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/use-cases/fitness-habits`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/use-cases/wellness-tracking`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/use-cases/work-habits`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];

  // Blog/Content pages - For content marketing SEO
  const contentRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog/how-to-build-habits`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/habit-tracking-best-practices`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/science-of-habit-formation`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  // Combine all routes with proper typing
  return [
    ...staticRoutes,
    ...featureRoutes,
    ...useCaseRoutes,
    ...contentRoutes,
  ];
}
