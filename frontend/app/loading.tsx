import { ProductSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
    return (
        <div className="bg-brand-cream min-h-screen">
            {/* Hero Skeleton */}
            <div className="w-full h-[60vh] md:h-[80vh] bg-brand-navy/5 animate-pulse-slow"></div>

            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
