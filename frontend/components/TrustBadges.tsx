import { PiShieldCheck, PiCertificate, PiTruck, PiArrowCounterClockwise } from "react-icons/pi";

export default function TrustBadges() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-t border-b border-gray-100 my-8">
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                <PiCertificate className="text-3xl text-brand-gold mb-2" />
                <span className="text-xs font-bold uppercase text-brand-navy tracking-wider">BIS Hallmarked</span>
                <span className="text-[10px] text-gray-500 mt-1">100% Certified Gold</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                <PiShieldCheck className="text-3xl text-brand-gold mb-2" />
                <span className="text-xs font-bold uppercase text-brand-navy tracking-wider">IGI Certified</span>
                <span className="text-[10px] text-gray-500 mt-1">Natural Diamonds</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                <PiTruck className="text-3xl text-brand-gold mb-2" />
                <span className="text-xs font-bold uppercase text-brand-navy tracking-wider">Insured Shipping</span>
                <span className="text-[10px] text-gray-500 mt-1">Safe & Secure</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                <PiArrowCounterClockwise className="text-3xl text-brand-gold mb-2" />
                <span className="text-xs font-bold uppercase text-brand-navy tracking-wider">Lifetime Exchange</span>
                <span className="text-[10px] text-gray-500 mt-1">Best Value</span>
            </div>
        </div>
    );
}
