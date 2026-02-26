/**
 * Centralized configuration for festive themes and welcoming features.
 * This allows for automated scheduling and manual control of the site's "Festive Mode".
 */

export const FESTIVE_CONFIG = {
    // Master switch to enable/disable all festive features
    active: true,

    // Current active festival - determines animations and color palettes
    currentFestival: 'HOLI' as 'HOLI' | 'DIWALI' | 'EID' | 'CHRISTMAS' | 'NONE',

    // Automated Scheduling (Site returns to normal after endDate)
    startDate: '2026-02-20',
    endDate: '2026-03-05',

    // Theme Customization
    theme: {
        primaryColor: '#ff0080', // Vibrant Pink for Holi
        secondaryColor: '#7ed321', // Bright Green
        accentColor: '#f5a623', // Bright Orange
        particleType: 'splash', // 'splash' for Holi, 'star' for Diwali, 'petal' for others
        greeting: 'Happy Holi! Celebrate with Colors & Diamonds.',
        couponCode: 'HOLI2026',
        discountLabel: '₹500 OFF | ₹1000 OFF on ₹10k+',
        tieredDiscount: {
            flat: 500,
            threshold: 10000,
            aboveThreshold: 1000
        }
    },

    // Advanced Features Toggle
    features: {
        welcomeModal: true,
        fallingParticles: true,
        siteReskin: true,
        socialProof: true,
        scratchCard: true
    }
};

/**
 * Utility to check if festive mode should be visible based on date and master toggle
 */
export const isFestiveModeActive = () => {
    if (!FESTIVE_CONFIG.active) return false;
    if (FESTIVE_CONFIG.currentFestival === 'NONE') return false;

    const now = new Date();
    const start = new Date(FESTIVE_CONFIG.startDate);
    const end = new Date(FESTIVE_CONFIG.endDate);

    return now >= start && now <= end;
};
