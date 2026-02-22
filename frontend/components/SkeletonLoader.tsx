'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
}

export default function SkeletonLoader({ className = '', variant = 'rect' }: SkeletonProps) {
    const baseClass = "bg-gray-200 relative overflow-hidden";

    const variantClasses = {
        text: "h-4 w-full rounded",
        rect: "h-32 w-full rounded-sm",
        circle: "h-12 w-12 rounded-full"
    };

    return (
        <div className={`${baseClass} ${variantClasses[variant]} ${className}`}>
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />
        </div>
    );
}

export function ProductSkeleton() {
    return (
        <div className="space-y-4 p-4 border border-gray-100 bg-white">
            <SkeletonLoader variant="rect" className="aspect-[4/5] h-auto" />
            <div className="space-y-2">
                <SkeletonLoader variant="text" className="w-2/3" />
                <SkeletonLoader variant="text" className="w-1/2 h-3" />
            </div>
            <div className="flex justify-between items-center pt-2">
                <SkeletonLoader variant="text" className="w-1/4 h-5" />
                <SkeletonLoader variant="circle" className="w-8 h-8" />
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
