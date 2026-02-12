import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { fetchAPI } from "@/lib/api";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
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
  try {
    const data = await fetchAPI('/store/settings/seo');
    if (data && data.value) {
      return {
        title: data.value.title || "Spark Blue Diamond",
        description: data.value.description || "Premium Jewellery",
        keywords: data.value.keywords || "jewellery, diamond, gold",
        icons: {
          icon: '/favicon.png',
          apple: '/favicon.png',
        }
      };
    }
  } catch (e) {
    // Graceful fallback if backend is down during build
  }

  return {
    title: "Spark Blue Diamond | Premium Jewellery",
    description: "IGI Certified Diamond & Hallmarked Gold Jewellery",
    icons: {
      icon: '/favicon.png',
      apple: '/favicon.png',
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} antialiased bg-white text-gray-900`}
      >
        <AuthProvider>
          <CartProvider>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
