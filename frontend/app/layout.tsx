import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { fetchAPI } from "@/lib/api";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

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
        keywords: data.value.keywords || "jewellery, diamond, gold"
      };
    }
  } catch (e) {
    // Graceful fallback if backend is down during build
  }

  return {
    title: "Spark Blue Diamond | Premium Jewellery",
    description: "IGI Certified Diamond & Hallmarked Gold Jewellery",
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
            <ExitIntentPopup />
            <AnnouncementBar />
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
