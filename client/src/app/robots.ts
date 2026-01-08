/**
 * Robots.txt for HabitEcho
 * 
 * Controls search engine crawler access and directs to sitemap
 * Optimized for maximum crawl efficiency and indexation
 * 
 * Next.js 15 App Router: Use app/robots.ts for dynamic robots.txt generation
 */

import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seo.config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SEO_CONFIG.brand.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Disallow API routes
          '/_next/',         // Disallow Next.js internals
          '/dashboard/',     // Private authenticated pages
          '/auth/',          // Don't index auth pages
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/dashboard/',
          '/auth/',
        ],
        crawlDelay: 0,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
        ],
      },
      {
        userAgent: 'bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/dashboard/',
          '/auth/',
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
