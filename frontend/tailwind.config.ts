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
            backgroundImage: {
                'gold-gradient': 'linear-gradient(135deg, #C6A87C 0%, #F0E6D2 50%, #C6A87C 100%)',
                'navy-gradient': 'linear-gradient(to bottom, #0F172A, #0A1128)',
            },
            animation: {
                'fade-in': 'fadeIn 0.8s ease-out forwards',
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'slide-up': 'slideUp 0.8s ease-out forwards',
                'scale-in': 'scaleIn 0.5s ease-out forwards',
                'scale-slow': 'scaleSlow 20s linear infinite alternate',
                'shimmer': 'shimmer 2s infinite linear',
                'marquee': 'marquee 25s linear infinite',
                'bounce-slow': 'bounce 3s infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'confetti': 'confetti 3s ease-in-out infinite',
            },
            transitionTimingFunction: {
                'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                scaleSlow: {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.1)' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                confetti: {
                    '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
                    '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
                }
            }
        },
    },
    plugins: [],
} satisfies Config;
