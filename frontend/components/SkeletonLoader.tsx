'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

export default function SkeletonLoader({ className = '', variant = 'rect' }: SkeletonProps) {
    const baseClass = "bg-brand-navy/5 relative overflow-hidden backdrop-blur-sm";

    const variantClasses = {
        text: "h-4 w-full rounded-full",
        rect: "h-32 w-full rounded-2xl",
        circle: "h-12 w-12 rounded-full"
    };

    return (
        <div className={`${baseClass} ${variantClasses[variant]} ${className}`}>
            <motion.div
                initial={{ x: '-100%', skewX: -20 }}
                animate={{ x: '150%', skewX: -20 }}
                transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/10 to-transparent"
            />
        </div>
    );
}

export function ProductSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white border border-brand-navy/5 rounded-none p-4 space-y-6">
            <SkeletonLoader variant="rect" className="aspect-square w-full rounded-none" />
            <div className="flex flex-col items-center space-y-3">
                <SkeletonLoader variant="text" className="w-1/3 h-2" />
                <SkeletonLoader variant="text" className="w-full h-4" />
                <SkeletonLoader variant="text" className="w-1/2 h-2" />
                <SkeletonLoader variant="text" className="w-1/4 h-5 mt-2" />
            </div>
        </div>
    );
}

export function BannerSkeleton() {
    return (
        <div className="w-full h-[60vh] md:h-[80vh] bg-gray-100 overflow-hidden">
            <SkeletonLoader variant="rect" className="w-full h-full" />
        </div>
    );
}
