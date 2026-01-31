"use client";

import Link from "next/link";
import Image from "next/image";

interface ProductProps {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    category?: string;
}

export default function ProductCard({ product }: { product: ProductProps }) {
    return (
        <div className="group relative">
            <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100">
                {/* Image Placeholder or Actual Image */}
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-700 ease-in-out">
                    {product.image ? (
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                    ) : (
                        <span className="font-serif text-sm tracking-widest uppercase">No Image</span>
                    )}
                </div>

                {/* Badge (Optional) */}
                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 text-[10px] font-bold tracking-widest uppercase px-3 py-1">New</span>
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/50 to-transparent">
                    <button className="w-full bg-white text-brand-navy font-bold text-xs uppercase tracking-widest py-3 hover:bg-brand-gold transition-colors">
                        Quick View
                    </button>
                </div>
            </div>

            <div className="mt-4 text-center space-y-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{product.category || 'Jewellery'}</p>
                <h3 className="text-brand-navy font-serif text-lg group-hover:text-brand-gold transition-colors duration-300">
                    <Link href={`/product/${product.slug}`}>
                        {product.name}
                    </Link>
                </h3>
                <p className="text-brand-charcoal font-medium">
                    ${product.price.toLocaleString()}
                </p>
            </div>
        </div>
    );
}
