/**
 * JSON-LD Structured Data Components for HabitEcho
 * 
 * Implements Schema.org structured data to help search engines understand:
 * - What HabitEcho is (WebApplication, SoftwareApplication)
 * - Who runs it (Organization)
 * - Site structure (WebSite with SearchAction)
 * - Page hierarchy (BreadcrumbList)
 * 
 * All schemas are server-rendered for immediate crawler visibility
 */

import { SEO_CONFIG } from '@/lib/seo.config';
import Script from 'next/script';

interface SchemaProps {
  children?: React.ReactNode;
}

/**
 * Organization Schema
 * Establishes HabitEcho as a recognized entity with brand identity
 */
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SEO_CONFIG.brand.url}#organization`,
    name: SEO_CONFIG.brand.name,
    url: SEO_CONFIG.brand.url,
    logo: {
      "@type": "ImageObject",
      url: `${SEO_CONFIG.brand.url}/mental-health.png`,
      width: "512",
      height: "512",
    },
    description: SEO_CONFIG.brand.description,
    foundingDate: SEO_CONFIG.brand.founded,
    email: SEO_CONFIG.brand.email,
    sameAs: SEO_CONFIG.organization.sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      email: SEO_CONFIG.brand.email,
      contactType: "Customer Support",
      availableLanguage: ["en"],
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  );
}

/**
 * WebSite Schema with SearchAction
 * Enables Google's sitelinks searchbox for brand searches
 */
export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SEO_CONFIG.brand.url}#website`,
    url: SEO_CONFIG.brand.url,
    name: SEO_CONFIG.brand.name,
    description: SEO_CONFIG.brand.description,
    publisher: {
      "@id": `${SEO_CONFIG.brand.url}#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SEO_CONFIG.brand.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-US",
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  );
}

/**
 * SoftwareApplication Schema
 * Defines HabitEcho as a web application with specific features
 * Critical for ranking in app/software searches
 */
export function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SEO_CONFIG.brand.url}#software`,
    name: SEO_CONFIG.brand.name,
    url: SEO_CONFIG.brand.url,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web Browser, All",
    description: SEO_CONFIG.brand.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Daily habit tracking",
      "Streak monitoring",
      "Predictive analytics",
      "Momentum scoring",
      "Behavioral insights",
      "Custom schedules",
      "Performance heatmaps",
      "Goal tracking",
      "Routine management",
    ],
    screenshot: `${SEO_CONFIG.brand.url}/screenshot.png`,
    softwareVersion: "1.0.0",
    author: {
      "@id": `${SEO_CONFIG.brand.url}#organization`,
    },
    provider: {
      "@id": `${SEO_CONFIG.brand.url}#organization`,
    },
  };

  return (
    <Script
      id="software-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  );
}

/**
 * WebApplication Schema (alternative to SoftwareApplication)
 * More specific for web-based tools
 */
export function WebApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SEO_CONFIG.brand.url}#webapp`,
    name: SEO_CONFIG.brand.name,
    url: SEO_CONFIG.brand.url,
    description: SEO_CONFIG.brand.description,
    applicationCategory: "HealthApplication",
    applicationSubCategory: "Productivity & Self-Improvement",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@id": `${SEO_CONFIG.brand.url}#organization`,
    },
  };

  return (
    <Script
      id="webapp-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  );
}

/**
 * BreadcrumbList Schema
 * Shows page hierarchy in search results
 */
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SEO_CONFIG.brand.url}${item.url}`,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  );
}

/**
 * FAQPage Schema
 * Enables rich results for FAQ sections
 */
export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  );
}

/**
 * Article Schema
 * For blog posts or content pages
 */
export function ArticleSchema({
  title,
  description,
  datePublished,
  dateModified,
  authorName = SEO_CONFIG.brand.name,
  image,
}: {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  image?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image || `${SEO_CONFIG.brand.url}/og-image.png`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
      url: SEO_CONFIG.brand.url,
    },
    publisher: {
      "@id": `${SEO_CONFIG.brand.url}#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": SEO_CONFIG.brand.url,
    },
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="beforeInteractive"
    />
  );
}

/**
 * Combined Root Schema for Homepage
 * Includes all critical schemas for brand establishment
 */
export function RootSchemas() {
  return (
    <>
      <OrganizationSchema />
      <WebSiteSchema />
      <SoftwareApplicationSchema />
      <WebApplicationSchema />
    </>
  );
}
