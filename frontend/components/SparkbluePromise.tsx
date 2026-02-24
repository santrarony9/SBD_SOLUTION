'use client';
import Image from 'next/image';
import Link from 'next/link';
import { PiHammer, PiDiamond, PiCurrencyInr } from "react-icons/pi";
import { motion, Variants } from 'framer-motion';

export interface PromiseCard {
    title: string;
    image: string;
    link: string;
}

interface SparkbluePromiseProps {
    cards?: PromiseCard[];
}

export default function SparkbluePromise({ cards }: SparkbluePromiseProps) {
    const defaultCards = [
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

    const displayCards = cards && cards.length > 0 ? cards : defaultCards;

    const fadeInUp: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    return (
        <section className="relative w-full bg-[#1a2238] overflow-hidden">
            {/* Top half white background */}
            <div className="absolute top-0 w-full h-[65%] bg-white z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                {/* Top Header Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 gap-12 md:gap-0"
                >

                    {/* Left: Brand Promise */}
                    <motion.div variants={fadeInUp} className="flex flex-col max-w-lg">
                        <h2 className="text-3xl md:text-4xl font-serif tracking-[0.2em] text-[#d4af37] mb-2 uppercase flex gap-4">
                            <span className="text-[#fbbd61]">S P A R K B L U E</span>
                            <span className="text-[#1a2238]">P R O M I S E</span>
                        </h2>
                        <p className="text-[#1a2238] font-medium tracking-wide">
                            Crafted with precision. Delivered with trust.
                        </p>
                    </motion.div>

                    {/* Right: Icons */}
                    <motion.div variants={fadeInUp} className="flex gap-8 md:gap-16">
                        <div className="flex flex-col items-center">
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
                    </motion.div>
                </motion.div>

                {/* Middle Header Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="text-center mb-24"
                >
                    <h3 className="text-3xl md:text-5xl font-serif mb-4 flex justify-center gap-3 uppercase items-baseline flex-wrap">
                        <span className="text-[#1a2238]">FIND YOUR</span>
                        <span className="text-[#fbbd61]">PERFECT SPARK</span>
                    </h3>
                    <p className="text-[#1a2238] uppercase tracking-[0.1em] text-sm md:text-base font-light max-w-2xl mx-auto">
                        BECAUSE EVERY RELATIONSHIP DESERVES A <br className="hidden md:block" /> BRILLIANCE OF ITS OWN.
                    </p>
                </motion.div>

                {/* Bottom Grid Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pt-10"
                >
                    {displayCards.map((card, idx) => (
                        <Link href={card.link} key={idx} className="group relative flex flex-col items-center w-full">
                            <motion.div variants={fadeInUp} className="w-full flex flex-col items-center">

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
                                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-full h-full relative">
                                        <Image
                                            src={card.image}
                                            alt={card.title}
                                            fill
                                            className="object-contain object-bottom"
                                            style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.3))' }}
                                        />
                                    </motion.div>
                                </div>

                                {/* Title Below Image */}
                                <h4 className="text-white text-xl md:text-[22px] font-serif uppercase tracking-[0.15em] z-10 mt-2 font-light">
                                    {card.title}
                                </h4>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}
