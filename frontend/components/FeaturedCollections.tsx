import Link from "next/link";

export default function FeaturedCollections() {
    const collections = [
        { name: "Engagement", image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2940&auto=format&fit=crop", link: "/shop?category=engagement" },
        { name: "Bridal Sets", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2940&auto=format&fit=crop", link: "/shop?category=bridal" },
        { name: "Fine Jewellery", image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2938&auto=format&fit=crop", link: "/shop?category=fine" },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-brand-gold text-sm tracking-[0.3em] uppercase">Discover</h2>
                    <h3 className="text-4xl md:text-5xl font-serif text-brand-navy">Our Collections</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((col, idx) => (
                        <Link href={col.link} key={idx} className="group relative block aspect-[3/4] overflow-hidden cursor-pointer">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                                style={{ backgroundImage: `url(${col.image})` }}
                            ></div>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="border border-white/50 p-8 transform transition-all duration-300 hover:border-white">
                                    <span className="text-white font-serif text-2xl tracking-widest uppercase">{col.name}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
