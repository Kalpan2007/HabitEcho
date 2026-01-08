/**
 * SEO Configuration for HabitEcho
 * Centralized SEO constants, metadata templates, and schema definitions
 * 
 * Purpose: Ensure consistent brand messaging, keyword targeting, and 
 * structured data across all pages for maximum search visibility
 */

export const SEO_CONFIG = {
  // Brand & Identity
  brand: {
    name: "HabitEcho",
    tagline: "Precision Habit Intelligence",
    description: "Enterprise-grade habit tracking platform with predictive analytics, streak monitoring, and behavioral insights for building consistent daily routines.",
    url: "https://habitecho.com", // Update with production URL
    email: "hello@habitecho.com",
    founded: "2026",
  },

  // Primary Keywords (prioritize these in content)
  keywords: {
    primary: [
      "HabitEcho",
      "habit tracker",
      "habit tracking",
      "habit tracking app",
      "daily habits",
      "habit building",
    ],
    secondary: [
      "behavioral habits",
      "habit analytics",
      "productivity habits",
      "streak tracker",
      "routine tracker",
      "habit formation",
      "behavioral analytics",
      "personal habits",
      "goal tracking",
      "productivity tracking",
    ],
    longtail: [
      "best habit tracker app",
      "how to build daily habits",
      "habit tracking software",
      "digital habit journal",
      "smart habit tracker",
      "habit tracking with analytics",
      "professional habit tracker",
      "enterprise habit tracking",
      "data-driven habit building",
      "predictive habit analytics",
    ],
  },

  // Social & Brand Presence
  social: {
    twitter: "@HabitEcho",
    github: "https://github.com/habitecho",
    linkedin: "https://linkedin.com/company/habitecho",
  },

  // Organization Schema Data
  organization: {
    "@type": "Organization",
    name: "HabitEcho",
    url: "https://habitecho.com",
    logo: "https://habitecho.com/logo.png",
    description: "Enterprise-grade habit tracking and behavioral analytics platform",
    foundingDate: "2026",
    sameAs: [
      "https://github.com/habitecho",
      "https://linkedin.com/company/habitecho",
      "https://twitter.com/HabitEcho",
    ],
  },

  // Default Metadata Templates
  defaultMetadata: {
    title: "HabitEcho — Precision Habit Intelligence & Daily Routine Tracker",
    description: "Build lasting habits with HabitEcho's enterprise-grade tracking platform. Get predictive analytics, streak monitoring, heatmaps, and behavioral insights to optimize your daily routines.",
    keywords: "habit tracker, habit tracking app, daily habits, habit building, streak tracker, productivity habits, behavioral analytics, routine tracking",
  },

  // Open Graph Defaults
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "HabitEcho",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HabitEcho - Precision Habit Intelligence",
      },
    ],
  },

  // Twitter Card Defaults
  twitter: {
    card: "summary_large_image",
    site: "@HabitEcho",
    creator: "@HabitEcho",
  },
} as const;

/**
 * Generate page-specific metadata with SEO best practices
 */
export function generateMetadata({
  title,
  description,
  path = "",
  keywords = [],
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
}) {
  const url = `${SEO_CONFIG.brand.url}${path}`;
  const fullTitle = title.includes("HabitEcho") 
    ? title 
    : `${title} | HabitEcho`;

  const allKeywords = [
    ...SEO_CONFIG.keywords.primary,
    ...keywords,
  ].join(", ");

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: [{ name: SEO_CONFIG.brand.name }],
    creator: SEO_CONFIG.brand.name,
    publisher: SEO_CONFIG.brand.name,
    robots: noIndex 
      ? "noindex, nofollow" 
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SEO_CONFIG.openGraph.siteName,
      locale: SEO_CONFIG.openGraph.locale,
      type: SEO_CONFIG.openGraph.type,
      images: image 
        ? [{ url: image, width: 1200, height: 630, alt: title }]
        : SEO_CONFIG.openGraph.images,
    },
    twitter: {
      card: SEO_CONFIG.twitter.card,
      site: SEO_CONFIG.twitter.site,
      creator: SEO_CONFIG.twitter.creator,
      title: fullTitle,
      description,
      images: image ? [image] : SEO_CONFIG.openGraph.images.map(img => img.url),
    },
  };
}

/**
 * SEO-optimized route structure
 */
export const SEO_ROUTES = {
  HOME: {
    path: "/",
    title: "HabitEcho — Precision Habit Intelligence & Daily Routine Tracker",
    description: "Build lasting habits with HabitEcho's enterprise-grade tracking platform. Get predictive analytics, streak monitoring, heatmaps, and behavioral insights to optimize your daily routines.",
    priority: 1.0,
    changefreq: "daily" as const,
  },
  DASHBOARD: {
    path: "/dashboard",
    title: "Dashboard — Track Your Daily Habits | HabitEcho",
    description: "Monitor your habit streaks, view analytics, and track your daily routine progress with HabitEcho's intelligent dashboard.",
    priority: 0.9,
    changefreq: "hourly" as const,
  },
  HABITS: {
    path: "/dashboard/habits",
    title: "My Habits — Habit Management & Tracking | HabitEcho",
    description: "Create, edit, and manage your daily habits. Set custom schedules and track your habit-building journey.",
    priority: 0.9,
    changefreq: "hourly" as const,
  },
  PERFORMANCE: {
    path: "/dashboard/performance",
    title: "Performance Analytics — Habit Insights & Trends | HabitEcho",
    description: "Analyze your habit performance with predictive analytics, momentum scoring, and behavioral insights.",
    priority: 0.8,
    changefreq: "daily" as const,
  },
  PROFILE: {
    path: "/dashboard/profile",
    title: "Profile Settings — Manage Your Habit Tracking | HabitEcho",
    description: "Customize your HabitEcho profile, notification preferences, and account settings.",
    priority: 0.7,
    changefreq: "weekly" as const,
  },
  LOGIN: {
    path: "/auth/login",
    title: "Login — Access Your Habit Tracker | HabitEcho",
    description: "Sign in to HabitEcho to continue tracking your habits and building better routines.",
    priority: 0.6,
    changefreq: "monthly" as const,
  },
  SIGNUP: {
    path: "/auth/signup",
    title: "Sign Up — Start Building Better Habits Today | HabitEcho",
    description: "Create your free HabitEcho account and begin your journey to consistent habit formation and personal growth.",
    priority: 0.8,
    changefreq: "monthly" as const,
  },
  // Programmatic SEO pages (to be created)
  FEATURES_HABIT_TRACKING: {
    path: "/features/habit-tracking",
    title: "Habit Tracking Features — Daily Habit Monitoring | HabitEcho",
    description: "Discover HabitEcho's powerful habit tracking features: streak monitoring, custom schedules, reminders, and real-time analytics.",
    priority: 0.7,
    changefreq: "weekly" as const,
  },
  FEATURES_ANALYTICS: {
    path: "/features/analytics",
    title: "Habit Analytics — Behavioral Insights & Performance Tracking | HabitEcho",
    description: "Leverage predictive analytics, momentum scoring, and data-driven insights to optimize your habit formation.",
    priority: 0.7,
    changefreq: "weekly" as const,
  },
  USE_CASES_DAILY_HABITS: {
    path: "/use-cases/daily-habits",
    title: "Daily Habit Tracking — Build Consistent Morning & Evening Routines",
    description: "Learn how HabitEcho helps you build and maintain daily habits like morning routines, exercise, meditation, and more.",
    priority: 0.6,
    changefreq: "weekly" as const,
  },
  USE_CASES_PRODUCTIVITY: {
    path: "/use-cases/productivity-habits",
    title: "Productivity Habits — Track Work & Focus Routines | HabitEcho",
    description: "Boost productivity with habit tracking for deep work, time blocking, and professional development routines.",
    priority: 0.6,
    changefreq: "weekly" as const,
  },
} as const;
