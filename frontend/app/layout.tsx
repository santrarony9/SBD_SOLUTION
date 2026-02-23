import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { fetchAPI } from "@/lib/api";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { ComparisonProvider } from '@/context/ComparisonContext';
import ChatWidget from "@/components/ChatWidget";

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const defaultMeta = {
    title: "Spark Blue Diamond | Premium Jewellery & Certified Diamonds",
    description: "Discover timeless elegance with IGI certified diamonds and BIS hallmarked gold. Bespoke craftsmanship and transparent pricing since 1995.",
    keywords: ["luxury jewellery", "diamond rings", "gold necklaces", "certified diamonds", "custom jewellery India"],
    themeColor: "#0F172A", // Brand Navy
  };

  try {
    const data = await fetchAPI('/store/settings/seo');
    if (data && data.value) {
      return {
        title: data.value.title || defaultMeta.title,
        description: data.value.description || defaultMeta.description,
        keywords: data.value.keywords || defaultMeta.keywords,
        themeColor: defaultMeta.themeColor,
        openGraph: {
          title: data.value.title || defaultMeta.title,
          description: data.value.description || defaultMeta.description,
          url: 'https://sparkbluediamond.com',
          siteName: 'Spark Blue Diamond',
          images: [
            {
              url: 'https://res.cloudinary.com/dd2ajeyom/image/upload/v1739982000/sbd-og-image.jpg',
              width: 1200,
              height: 630,
            },
          ],
          locale: 'en_US',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: data.value.title || defaultMeta.title,
          description: data.value.description || defaultMeta.description,
          images: ['https://res.cloudinary.com/dd2ajeyom/image/upload/v1739982000/sbd-og-image.jpg'],
        },
        icons: {
          icon: '/favicon.png',
          apple: '/favicon.png',
        },
        manifest: '/manifest.webmanifest',
        appleWebApp: {
          capable: true,
          statusBarStyle: 'default',
          title: 'Spark Blue Diamond',
        },
      };
    }
  } catch (e) {
    // Fallback to default below
  }

  return {
    ...defaultMeta,
    openGraph: {
      type: 'website',
      siteName: 'Spark Blue Diamond',
    },
    icons: {
      icon: '/favicon.png',
      apple: '/favicon.png',
    },
    manifest: '/manifest.webmanifest',
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-white text-gray-900`}
      >
        <div className="scroll-progress" />
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ComparisonProvider>
                <ClientLayoutWrapper>
                  {children}
                </ClientLayoutWrapper>
              </ComparisonProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
