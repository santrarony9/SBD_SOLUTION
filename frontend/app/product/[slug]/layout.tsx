import { Metadata } from 'next';
import { fetchAPI, normalizeImageUrl } from '@/lib/api';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const resolvedParams = await params;
        const product = await fetchAPI(`/products/${resolvedParams.slug}`);
        if (!product || Object.keys(product).length === 0) {
            return { title: 'Product Not Found | Spark Blue Diamond' };
        }

        const title = `${product.name} | Spark Blue Diamond`;
        const description = product.description?.substring(0, 160) || 'Discover premium certified diamonds and BIS hallmarked gold at Spark Blue Diamond.';
        const imageUrl = product.images?.[0] ? normalizeImageUrl(product.images[0]) : '/og-image.jpg';

        return {
            title,
            description,
            alternates: {
                canonical: `/product/${resolvedParams.slug}`,
            },
            openGraph: {
                title,
                description,
                images: [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
            },
        };
    } catch (e) {
        return {
            title: 'Premium Jewellery | Spark Blue Diamond',
        };
    }
}

export default function ProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
