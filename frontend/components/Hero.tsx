import Link from 'next/link';

export default function Hero() {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-brand-navy">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] hover:scale-105"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1573408301185-a1d31e857545?q=80&w=2670&auto=format&fit=crop")',
                }}
            >
                {/* Dark Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-brand-navy/90"></div>
            </div>

            {/* Content Container */}
            <div className="relative h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto space-y-8 pt-20">

                {/* Small Tagline */}
                <div className="animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
                    <span className="text-brand-gold-light tracking-[0.4em] uppercase text-xs md:text-sm font-light border-b border-brand-gold pb-2">
                        Est. 2024
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="animate-slide-up opacity-0 font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-tight" style={{ animationDelay: '0.4s' }}>
                    Timeless <span className="italic text-transparent bg-clip-text bg-gold-gradient">Elegance</span>
                </h1>

                {/* Subheading */}
                <p className="animate-slide-up opacity-0 font-light text-gray-200 text-lg md:text-xl max-w-2xl leading-relaxed" style={{ animationDelay: '0.6s' }}>
                    Discover our exclusive collection of IGI Certified diamonds and hallmarked gold, designed to celebrate your most precious moments.
                </p>

                {/* CTA Buttons */}
                <div className="animate-fade-in opacity-0 flex flex-col md:flex-row gap-6 mt-8" style={{ animationDelay: '0.8s' }}>
                    <Link
                        href="/shop"
                        className="group relative px-8 py-4 bg-gold-gradient text-brand-navy font-bold tracking-widest uppercase text-xs hover:shadow-[0_0_20px_rgba(198,168,124,0.4)] transition-all duration-300"
                    >
                        <span className="relative z-10">Shop Collection</span>
                    </Link>

                    <Link
                        href="/about"
                        className="group px-8 py-4 border border-brand-gold text-brand-gold font-bold tracking-widest uppercase text-xs hover:bg-brand-gold/10 transition-all duration-300"
                    >
                        Our Story
                    </Link>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg className="w-6 h-6 text-brand-gold/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </div>
    );
}
