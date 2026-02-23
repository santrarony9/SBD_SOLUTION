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
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent' as const,
      title: 'Spark Blue Diamond',
    },
    icons: {
      apple: '/favicon.png', // Fallback to favicon for apple touch icon
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
                <CurrencyProvider>
                  <ClientLayoutWrapper>
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
