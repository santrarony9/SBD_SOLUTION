import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                brand: {
                    navy: 'var(--brand-navy)',
                    gold: 'var(--brand-gold)',
                    goldLight: 'var(--brand-gold-light)',
                    charcoal: 'var(--brand-charcoal)',
                    cream: 'var(--brand-cream)',
                }
            },
            fontFamily: {
                serif: ['var(--font-playfair-display)', 'serif'],
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.8s ease-out',
                'slide-up': 'slideUp 1s ease-out',
                'scale-in': 'scaleIn 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(30px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
} satisfies Config;
