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
            image: "/promise_for_love_1771930776132.png", // Newly generated image
            link: "/shop?category=engagement-rings"
        },
        {
            title: "FOR HER",
            image: "/promise_for_her_1771930935081.png", // Newly generated image
            link: "/shop?category=necklaces"
        },
        {
            title: "FOR MOM",
            image: "/promise_for_mom_1771930572121.png", // Newly generated image
            link: "/shop?category=earrings"
        },
        {
            title: "FOR ME",
            image: "/promise_for_me_1771931102018.png", // Newly generated image
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
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 md:mb-16 gap-8 md:gap-0"
                >

                    {/* Left: Brand Promise */}
                    <motion.div variants={fadeInUp} className="flex flex-col max-w-lg">
                        <h2 className="text-3xl md:text-4xl font-serif tracking-[0.2em] text-[#d4af37] mb-2 uppercase flex flex-wrap gap-2 md:gap-4">
                            <span className="text-[#fbbd61] whitespace-nowrap">S P A R K B L U E</span>
                            <span className="text-[#1a2238] whitespace-nowrap">P R O M I S E</span>
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
                    className="text-center mb-12 md:mb-16"
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
                    className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-8 pt-6 md:pt-14"
                >
                    {displayCards.map((card, idx) => (
                        <Link href={card.link} key={idx} className="group relative w-full aspect-[3/4.5] flex flex-col items-center mt-8 md:mt-0">
                            <motion.div variants={fadeInUp} className="w-full h-full relative flex justify-center">

                                {/* Golden Wavy Background Block */}
                                <div className="absolute bottom-0 w-full h-[55%] z-0" style={{ pointerEvents: 'none' }}>
                                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full drop-shadow-xl">
                                        <path d="M0,25 Q25,5 50,25 T100,25 L100,100 L0,100 Z" fill="url(#goldGrad)" />
                                        <defs>
                                            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#fde09e" />
                                                <stop offset="30%" stopColor="#fbbd61" />
                                                <stop offset="100%" stopColor="#d4af37" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>

                                {/* Navy Blue Text Box */}
                                <div className="absolute bottom-2 left-2 right-2 h-10 sm:h-12 bg-[#1a2238] z-20 flex items-center justify-center">
                                    <h4 className="text-white text-[9px] sm:text-[11px] md:text-[13px] lg:text-sm font-serif uppercase tracking-[0.1em] font-bold text-center px-1 leading-tight">
                                        {card.title}
                                    </h4>
                                </div>

                                {/* Image Container (Sits on top of Navy Box, pops out of the card) */}
                                <div className="absolute top-[-15%] w-[95%] left-[2.5%] bottom-[calc(0.5rem_+_40px)] sm:bottom-[calc(0.5rem_+_48px)] z-10 flex justify-center items-end pointer-events-none group-hover:pointer-events-auto">
                                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.6, ease: "easeOut" }} className="w-full h-full relative origin-bottom">
                                        <Image
                                            src={card.image}
                                            alt={card.title}
                                            fill
                                            className="object-contain object-bottom"
                                            style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.3))' }}
                                        />
                                    </motion.div>
                                </div>

                            </motion.div>
                        </Link>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}
