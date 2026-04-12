import { PiDiamond } from 'react-icons/pi';

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-brand-navy z-[10000] flex flex-col items-center justify-center overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold/10 blur-[120px] rounded-full" />
            
            <div className="relative flex flex-col items-center">
                {/* Cinematic Diamond Icon */}
                <div className="relative w-24 h-24 mb-8">
                    <PiDiamond className="w-full h-full text-brand-gold animate-pulse-slow" />
                    <div className="absolute inset-0 bg-brand-gold/20 blur-xl rounded-full scale-110 animate-pulse-slow" />
                </div>
                
                {/* Branding Text with Shimmer */}
                <h2 className="text-2xl md:text-3xl font-serif tracking-[0.4em] text-brand-gold-light uppercase relative overflow-hidden">
                    SPARK BLUE
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
                </h2>
                
                <p className="text-brand-gold/60 text-xs tracking-[0.2em] mt-4 uppercase font-sans">
                    Crafting Brilliance...
                </p>
                
                {/* Progress Bar Line */}
                <div className="w-48 h-[1px] bg-white/10 mt-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-gold animate-shimmer" />
                </div>
            </div>
        </div>
    );
}
