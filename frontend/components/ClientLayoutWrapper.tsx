'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { motion, AnimatePresence } from 'framer-motion';
import ChatWidget from "@/components/ChatWidget";
import MobileBottomNav from "@/components/MobileBottomNav";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/context/CartContext";

export default function ClientLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { isCartOpen, closeCart } = useCart();
    const isAdminPath = pathname?.startsWith('/admin');

    if (isAdminPath) {
        return <main className="min-h-screen">{children}</main>;
    }

    return (
        <>
            <ExitIntentPopup />
            <div className="fixed top-0 left-0 w-full z-[1000] flex flex-col">
                <AnnouncementBar />
                <Navbar />
            </div>
            <AnimatePresence mode="wait">
                <motion.main
                    key={pathname}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-screen pt-[100px] md:pt-[140px]" // Optimized padding for new header height
                >
                    {children}
                </motion.main>
            </AnimatePresence>
            <ChatWidget />
            <MobileBottomNav />
            <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
            <Footer />
        </>
    );
}
