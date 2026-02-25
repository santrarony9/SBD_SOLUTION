import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { fetchAPI } from "@/lib/api";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { ComparisonProvider } from '@/context/ComparisonContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import ChatWidget from "@/components/ChatWidget";

import JsonLd from "@/components/JsonLd";

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Added common weights
});

export async function generateMetadata(): Promise<Metadata> {
  const defaultMeta = {
    title: "Spark Blue Diamond | Premium Jewellery & Certified Diamonds",
    description: "Discover timeless elegance with IGI certified diamonds and BIS hallmarked gold. Bespoke craftsmanship and transparent pricing since 2020.",
    keywords: ["luxury jewellery", "diamond rings", "gold necklaces", "certified diamonds", "custom jewellery India"],
    manifest: '/manifest.webmanifest',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sparkbluediamond.com'),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'Spark Blue Diamond',
      description: 'Premium Certified Diamonds & Gold Jewellery',
      url: '/',
      siteName: 'Spark Blue Diamond',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent' as const,
      title: 'Spark Blue Diamond',
    },
    icons: {
      apple: '/favicon.png',
    },
  };

  try {
    const data = await fetchAPI('/store/settings/seo');
    if (data && data.value) {
      return {
        ...defaultMeta,
        title: data.value.title || defaultMeta.title,
        description: data.value.description || defaultMeta.description,
        keywords: data.value.keywords || defaultMeta.keywords,
      };
    }
  } catch (e) {
    // Fallback
  }

  return defaultMeta;
}

export const viewport = {
  themeColor: "#0F172A",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Global Organization & Website Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "name": "Spark Blue Diamond",
    "alternateName": "SBD",
    "url": "https://sparkbluediamond.com",
    "logo": "https://sparkbluediamond.com/logo.png",
    "sameAs": [
      "https://www.instagram.com/sparkbluediamond",
      "https://www.facebook.com/sparkbluediamond"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mumbai",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-XXXXXXXXXX",
      "contactType": "customer service"
    },
    "priceRange": "$$$"
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Spark Blue Diamond",
    "url": "https://sparkbluediamond.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://sparkbluediamond.com/shop?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // Fetch Footer Config
  let footerConfig = {
    description: "Crafting timeless elegance since 2020. IGI certified excellence in every piece.",
    social: { instagram: "#", facebook: "#", youtube: "#", pinterest: "#" }
  };
  try {
    const res = await fetchAPI('/store/settings/footer_config');
    if (res?.value) {
      footerConfig = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
    }
  } catch (e) {
    // defaults
  }

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
      </head>
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-white text-gray-900`}
      >
        <div className="scroll-progress" />
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ComparisonProvider>
                <CurrencyProvider>
                  <ClientLayoutWrapper footerConfig={footerConfig}>
                    {children}
                  </ClientLayoutWrapper>
                </CurrencyProvider>
              </ComparisonProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
