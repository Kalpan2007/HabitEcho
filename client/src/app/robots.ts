/**
 * Robots.txt for HabitEcho
 * 
 * Controls search engine crawler access and directs to sitemap
 * Optimized for Google Search Console and maximum indexation efficiency
 * 
 * Next.js 15 App Router: Use app/robots.ts for dynamic robots.txt generation
 * Access at: https://habitecho.vercel.app/robots.txt
 * 
 * Configuration:
 * - Allow all public pages for indexing
 * - Disallow private/authenticated areas
 * - Disallow API routes and internal Next.js paths
 * - Include sitemap reference for Google Search Console
 */

import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/lib/seo.config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SEO_CONFIG.brand.url;

  return {
    rules: [
      // Global rules for all crawlers
      {
        userAgent: '*',
        allow: [
          '/',
          '/features/',
          '/use-cases/',
          '/blog/',
        ],
        disallow: [
          '/api/',              // API endpoints - not for indexing
          '/_next/',            // Next.js internal files
          '/dashboard/*',       // Private user dashboard
          '/auth/*',            // Authentication pages
          '/*.json',            // JSON files
          '/_error',            // Error pages
          '/loading',           // Loading states
        ],
      },
      // Specific rules for Googlebot (most important for Search Console)
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/features/*',
          '/use-cases/*',
          '/blog/*',
          '/*.css',
          '/*.js',
        ],
        disallow: [
          '/api/',
          '/_next/static/chunks/*',  // Allow main bundles, block chunks
          '/dashboard/*',
          '/auth/*',
        ],
        crawlDelay: 0,  // No delay for Google - crawl freely
      },
      // Googlebot Image crawler
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/',
          '/public/*',
          '/*.jpg',
          '/*.jpeg',
          '/*.png',
          '/*.gif',
          '/*.webp',
          '/*.svg',
        ],
        disallow: [
          '/api/',
          '/_next/',
        ],
      },
      // Bing crawler rules
      {
        userAgent: 'bingbot',
        allow: [
          '/',
          '/features/*',
          '/use-cases/*',
          '/blog/*',
        ],
        disallow: [
          '/api/',
          '/_next/',
          '/dashboard/*',
          '/auth/*',
        ],
        crawlDelay: 1,  // Slightly slower for Bing
      },
      // Block bad bots and scrapers
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MJ12bot',
        ],
        disallow: ['/'],
      },
    ],
    // Sitemap location - critical for Google Search Console
    sitemap: `${baseUrl}/sitemap.xml`,
    
    // Host declaration (helps with canonical URL)
    host: baseUrl,
  };
}
