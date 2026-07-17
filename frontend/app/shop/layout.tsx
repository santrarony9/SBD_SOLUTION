import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shop Premium Collections | Spark Blue Diamond',
    description: 'Explore our curated collections of premium IGI certified diamond and BIS hallmarked gold jewellery.',
    alternates: {
        canonical: '/shop',
    }
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
