'use client';

import React from 'react';
import { isFestiveModeActive } from '@/config/festive-config';

const SplashSplat = ({ color, className }: { color: string; className: string }) => (
    <svg
        viewBox="0 0 200 200"
        className={`absolute pointer-events-none select-none ${className}`}
        style={{ filter: 'blur(8px)', opacity: 0.15 }}
    >
        <path
            fill={color}
            d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.7,-31.3,87.1,-15.7,85.1,-0.6C83.1,14.5,75.7,29,66.4,41.4C57.1,53.8,45.9,64.1,32.7,71.1C19.5,78.1,4.3,81.8,-11,79.8C-26.3,77.8,-41.7,70.1,-54.1,59.3C-66.5,48.5,-75.9,34.6,-80.1,19.8C-84.3,5.1,-83.4,-10.5,-77.8,-24.5C-72.2,-38.5,-61.9,-50.9,-49.5,-58.6C-37.1,-66.3,-22.6,-69.3,-8.2,-74.6C6.2,-79.9,20.6,-87.5,44.7,-76.4Z"
            transform="translate(100 100)"
        />
    </svg>
);

export default function FestiveGlobalDecor() {
    if (!isFestiveModeActive()) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
            {/* Top Left */}
            <SplashSplat color="#ff0080" className="-top-20 -left-20 w-64 h-64 md:w-96 md:h-96" />

            {/* Bottom Right */}
            <SplashSplat color="#7ed321" className="-bottom-20 -right-20 w-64 h-64 md:w-96 md:h-96 rotate-180" />

            {/* Left Middle */}
            <SplashSplat color="#0099ff" className="top-1/3 -left-32 w-48 h-48 md:w-64 md:h-64 opacity-10" />

            {/* Right Middle */}
            <SplashSplat color="#ae00ff" className="top-2/3 -right-32 w-48 h-48 md:w-64 md:h-64 opacity-10" />
        </div>
    );
}
