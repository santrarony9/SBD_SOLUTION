import Image from 'next/image';
import Link from 'next/link';
import { PiHammer, PiDiamond, PiCurrencyInr } from "react-icons/pi";

export default function SparkbluePromise() {
    const cards = [
        {
            title: "FOR YOUR LOVE",
            image: "/placeholder-couple-1.jpg", // Replace with actual image path
            link: "/shop?category=engagement-rings"
        },
        {
            title: "FOR HER",
            image: "/placeholder-couple-2.jpg", // Replace with actual image path
            link: "/shop?category=necklaces"
        },
        {
            title: "FOR MOM",
            image: "/placeholder-family.jpg", // Replace with actual image path
            link: "/shop?category=earrings"
        },
        {
            title: "FOR ME",
            image: "/placeholder-single.jpg", // Replace with actual image path
            link: "/shop?category=bracelets"
        }
    ];

    return (
        <section className="relative w-full bg-[#1a2238]">
            {/* Top half white background */}
            <div className="absolute top-0 w-full h-[65%] bg-white z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Top Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 gap-12 md:gap-0">

                    {/* Left: Brand Promise */}
                    <div className="flex flex-col max-w-lg">
                        <h2 className="text-3xl md:text-4xl font-serif tracking-[0.2em] text-[#d4af37] mb-2 uppercase flex gap-4">
                            <span className="text-[#fbbd61]">S P A R K B L U E</span>
                            <span className="text-[#1a2238]">P R O M I S E</span>
                        </h2>
                        <p className="text-[#1a2238] font-medium tracking-wide">
                            Crafted with precision. Delivered with trust.
                        </p>
                    </div>

                    {/* Right: Icons */}
                    <div className="flex gap-8 md:gap-16">
                        <div className="flex flex-col items-center">
                            {/* Replace with actual SVG later if needed */}
                            <div className="w-12 h-12 mb-3 text-[#fbbd61] flex items-center justify-center">
                                <PiHammer className="w-10 h-10" />
                            </div>
                            <p className="text-[#fbbd61] text-[10px] font-bold tracking-widest uppercase text-center w-20 leading-tight">
                                PRECISION<br />CRAFT
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 mb-3 text-[#fbbd61] flex items-center justify-center">
                                <PiDiamond className="w-10 h-10" />
                            </div>
                            <p className="text-[#fbbd61] text-[10px] font-bold tracking-widest uppercase text-center w-20 leading-tight">
                                ETHICAL<br />DIAMONDS
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 mb-3 text-[#fbbd61] flex items-center justify-center">
                                <PiCurrencyInr className="w-10 h-10" />
                            </div>
                            <p className="text-[#fbbd61] text-[10px] font-bold tracking-widest uppercase text-center w-24 leading-tight">
                                TRANSPARENT<br />VALUE
                            </p>
                        </div>
                    </div>
                </div>

                {/* Middle Header Section */}
                <div className="text-center mb-24">
                    <h3 className="text-3xl md:text-5xl font-serif mb-4 flex justify-center gap-3 uppercase items-baseline">
                        <span className="text-[#1a2238]">FIND YOUR</span>
                        <span className="text-[#fbbd61]">PERFECT SPARK</span>
                    </h3>
                    <p className="text-[#1a2238] uppercase tracking-[0.1em] text-sm md:text-base font-light max-w-2xl mx-auto">
                        BECAUSE EVERY RELATIONSHIP DESERVES A <br className="hidden md:block" /> BRILLIANCE OF ITS OWN.
                    </p>
                </div>

                {/* Bottom Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pt-10">
                    {cards.map((card, idx) => (
                        <Link href={card.link} key={idx} className="group relative flex flex-col items-center">

                            {/* Gold Wavy Background Shape via SVG Block */}
                            <div className="absolute bottom-12 w-[110%] h-[70%] z-0" style={{ pointerEvents: 'none' }}>
                                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                                    <path d="M0,30 Q25,10 50,30 T100,30 L100,100 L0,100 Z" fill="url(#goldGrad)" />
                                    <defs>
                                        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#fcd385" />
                                            <stop offset="100%" stopColor="#fbbd61" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            {/* Image Container */}
                            <div className="relative z-10 w-[85%] aspect-[3/4.5] overflow-visible mb-2 flex justify-center items-end">
                                {/* Fallback shadow block to simulate image presence for dev */}
                                <div className="absolute bottom-4 w-full h-[85%] bg-[#e3e6e8] shadow-lg flex items-center justify-center text-gray-400 text-xs text-center p-4">
                                    [Image bounds: <br /> Person overlapping top wave]
                                </div>
                                {/* Real Image Placeholder - Needs actual transparent PNG images to overlap the wave */}
                                {/* <Image
                  src={card.image}
                  alt={card.title}
                  width={300}
                  height={450}
                  className="object-contain object-bottom transition-transform duration-700 group-hover:scale-105"
                  style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.3))' }}
                /> */}

                            </div>

                            {/* Title Below Image */}
                            <h4 className="text-white text-xl md:text-[22px] font-serif uppercase tracking-[0.15em] z-10 mt-2 font-light">
                                {card.title}
                            </h4>

                        </Link>
                    ))}
                </div>

            </div>
        </section>
    );
}
