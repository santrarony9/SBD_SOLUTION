import { ProductSkeleton } from '@/components/SkeletonLoader';

export default function Loading() {
    return (
        <div className="bg-brand-cream min-h-screen pt-24">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(12)].map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
