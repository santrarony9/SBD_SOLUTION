'use client';

interface SmartPlaceholderProps {
    width?: number;
    height?: number;
    label: string;
    className?: string;
    description?: string;
}

export default function SmartPlaceholder({
    width,
    height,
    label,
    className = "",
    description
}: SmartPlaceholderProps) {
    const dims = width && height ? `${width}x${height}` : "Flex Size";

    return (
        <div className={`relative flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden text-center p-4 min-h-[200px] ${className}`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 mb-3 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Needs Content</span>
                <h4 className="text-sm font-serif font-bold text-gray-600 mb-1 uppercase tracking-wider">{label}</h4>
                <div className="px-3 py-1 bg-gray-200 text-[10px] font-mono text-gray-500 rounded-none mb-2">
                    {dims}
                </div>
                {description && (
                    <p className="text-[10px] text-gray-400 max-w-[200px] leading-relaxed italic">
                        {description}
                    </p>
                )}
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-gray-200"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-gray-200"></div>
        </div>
    );
}
