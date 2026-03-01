'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { motion, AnimatePresence } from 'framer-motion';

import MobileBottomNav from "@/components/MobileBottomNav";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/context/CartContext";
import FestiveParticles from './FestiveParticles';
import FestiveWelcome from './FestiveWelcome';
import FestiveSocialProof from './FestiveSocialProof';
import FestiveGlobalDecor from './FestiveGlobalDecor';
import FestiveSplashTransition from './FestiveSplashTransition';
import FestiveStartupAnimation from './FestiveStartupAnimation';
import { useFestive } from '@/context/FestiveContext';
import { useEffect } from 'react';

export default function ClientLayoutWrapper({
    children,
    footerConfig
}: {
    children: React.ReactNode;
    footerConfig?: any;
}) {
    const pathname = usePathname();
    const { isCartOpen, closeCart } = useCart();
    const { config, isFestiveActive } = useFestive();
    const isAdminPath = pathname?.startsWith('/admin');

    // Site-wide Festive Re-skinning
    useEffect(() => {
        if (isFestiveActive && config?.features.siteReskin) {
            document.documentElement.setAttribute('data-theme', config.currentFestival.toLowerCase());
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [isFestiveActive, config]);

    if (isAdminPath) {
        return <main className="min-h-screen">{children}</main>;
    }

    return (
        <>
            <ExitIntentPopup />
            <FestiveStartupAnimation />
            <FestiveWelcome />
            <FestiveParticles />
            <FestiveSocialProof />
            <FestiveGlobalDecor />
            <FestiveSplashTransition />
            <div className="fixed top-0 left-0 w-full z-[1000] flex flex-col">
                <AnnouncementBar />
                <Navbar />
            </div>
            <div className="flex-grow">
                <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
                    <motion.main
                        key={pathname}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`min-h-screen ${pathname === '/' ? 'pt-0' : 'pt-[100px] md:pt-[140px]'}`}
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>
            </div>

            <MobileBottomNav />
            <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
            <Footer config={footerConfig} />
        </>
    );
}
