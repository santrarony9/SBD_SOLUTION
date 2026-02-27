'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api';

export interface FestiveConfig {
    active: boolean;
    currentFestival: 'HOLI' | 'DIWALI' | 'EID' | 'CHRISTMAS' | 'RATH_YATRA' | 'INDEPENDENCE_DAY' | 'DURGA_PUJA' | 'NEW_YEAR' | 'VALENTINES' | 'NONE';
    startDate: string;
    endDate: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        particleType: 'splash' | 'star' | 'petal' | 'none';
        greeting: string;
        couponCode: string;
        discountLabel: string;
        tieredDiscount: {
            flat: number;
            threshold: number;
            aboveThreshold: number;
        };
    };
    features: {
        welcomeModal: boolean;
        fallingParticles: boolean;
        siteReskin: boolean;
        socialProof: boolean;
        scratchCard: boolean;
        startupAnimation: boolean;
        animationUrl?: string; // e.g. a Lottie JSON URL or Video URL
    };
}

interface FestiveContextType {
    config: FestiveConfig | null;
    isFestiveActive: boolean;
    showAnimation: boolean;
    dismissAnimation: () => void;
    isLoading: boolean;
    refreshConfig: () => Promise<void>;
}

const FestiveContext = createContext<FestiveContextType | undefined>(undefined);

export function FestiveProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<FestiveConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAnimation, setShowAnimation] = useState(false);

    const loadConfig = async () => {
        try {
            const data = await fetchAPI('/store/settings/festive_config');
            if (data?.value) {
                // Backend store generic settings as JSON values
                const cfg = data.value as FestiveConfig;
                setConfig(cfg);

                const now = new Date();
                const start = new Date(cfg.startDate);
                const end = new Date(cfg.endDate);
                const isActive = cfg.active && cfg.currentFestival !== 'NONE' && now >= start && now <= end;

                const hasShown = sessionStorage.getItem('festive_animation_shown');
                if (isActive && cfg.features?.startupAnimation && !hasShown) {
                    setShowAnimation(true);
                }
            }
        } catch (error) {
            console.error("Failed to load festive config", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const checkIsActive = (cfg: FestiveConfig) => {
        if (!cfg.active || cfg.currentFestival === 'NONE') return false;
        const now = new Date();
        const start = new Date(cfg.startDate);
        const end = new Date(cfg.endDate);
        return now >= start && now <= end;
    };

    const isFestiveActive = config ? checkIsActive(config) : false;

    const dismissAnimation = () => {
        setShowAnimation(false);
        sessionStorage.setItem('festive_animation_shown', 'true');
    };

    return (
        <FestiveContext.Provider value={{
            config,
            isFestiveActive,
            showAnimation,
            dismissAnimation,
            isLoading,
            refreshConfig: loadConfig
        }}>
            {children}
        </FestiveContext.Provider>
    );
}

export function useFestive() {
    const context = useContext(FestiveContext);
    if (context === undefined) {
        throw new Error('useFestive must be used within a FestiveProvider');
    }
    return context;
}
