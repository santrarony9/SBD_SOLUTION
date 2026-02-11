'use client';

import Navbar from '@/components/Navbar';
import GiftFinder from '@/components/GiftFinder';
import { PiSparkle } from "react-icons/pi";

export default function GiftFinderPage() {
    return (
        <div className="bg-brand-cream min-h-screen font-sans text-brand-navy">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mb-6 border border-brand-gold/20">
                        <PiSparkle className="text-lg" />
                        AI-Powered Personal Shopper
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif text-brand-navy mb-6">
                        Find the Perfect Gift
                    </h1>

                    <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
                        Answer a few simple questions, and our AI will curate a bespoke selection of jewelry tailored to their unique style and your special moment.
                    </p>
                </div>

                <GiftFinder />
            </main>
        </div>
    );
}
