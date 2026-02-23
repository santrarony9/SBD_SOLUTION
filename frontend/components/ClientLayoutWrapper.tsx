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
            <AnnouncementBar />
            <Navbar />
            <AnimatePresence mode="wait">
                <motion.main
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="min-h-screen"
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
