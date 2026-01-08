import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import QueryProvider from "@/components/providers/QueryProvider";
import { SEO_CONFIG, generateMetadata } from "@/lib/seo.config";
import { RootSchemas } from "@/components/seo/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Viewport configuration for optimal display and Core Web Vitals
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// Comprehensive SEO metadata optimized for habit tracking keywords
export const metadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.brand.url),
  title: {
    default: SEO_CONFIG.defaultMetadata.title,
    template: "%s | HabitEcho",
  },
  description: SEO_CONFIG.defaultMetadata.description,
  keywords: SEO_CONFIG.defaultMetadata.keywords,
  authors: [{ name: SEO_CONFIG.brand.name, url: SEO_CONFIG.brand.url }],
  creator: SEO_CONFIG.brand.name,
  publisher: SEO_CONFIG.brand.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SEO_CONFIG.brand.url,
    siteName: SEO_CONFIG.brand.name,
    title: SEO_CONFIG.defaultMetadata.title,
    description: SEO_CONFIG.defaultMetadata.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HabitEcho - Precision Habit Intelligence Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SEO_CONFIG.social.twitter,
    creator: SEO_CONFIG.social.twitter,
    title: SEO_CONFIG.defaultMetadata.title,
    description: SEO_CONFIG.defaultMetadata.description,
    images: ["/og-image.png"],
  },
  verification: {
    google: "your-google-verification-code", // Add after Google Search Console setup
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  category: "technology",
  classification: "Productivity Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: Prevents hydration mismatch errors caused by
    // browser extensions that modify the HTML (e.g., adding classes to <html>)
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data for Search Engines */}
        <RootSchemas />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
