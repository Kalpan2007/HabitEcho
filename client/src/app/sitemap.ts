/**
 * Dynamic Sitemap for HabitEcho
 * 
 * Generates XML sitemap for search engine crawlers
 * Includes all public pages with appropriate priorities and change frequencies
 * 
 * Next.js 15 App Router: Use app/sitemap.ts for dynamic sitemap generation
 */

import { MetadataRoute } from 'next';
import { SEO_CONFIG, SEO_ROUTES } from '@/lib/seo.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SEO_CONFIG.brand.url;
  const currentDate = new Date();

  // Static pages from SEO_ROUTES configuration
  const staticRoutes = Object.values(SEO_ROUTES).map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: currentDate,
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));

  // Dynamic programmatic SEO pages (to be expanded)
  const programmaticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/features/habit-tracking`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/features/analytics`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/features/streak-tracking`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/use-cases/daily-habits`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/use-cases/productivity-habits`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/use-cases/morning-routine`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/use-cases/fitness-habits`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog/how-to-build-habits`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/habit-tracking-best-practices`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [
    ...staticRoutes,
    ...programmaticRoutes,
  ] as MetadataRoute.Sitemap;
}
