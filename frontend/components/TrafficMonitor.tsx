'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface TrafficMetrics {
    currentRpm: number;
    avgRpm: number;
    threshold: number;
    status: 'Healthy' | 'Warning' | 'Critical';
    isUpgradeRecommended: boolean;
    advice: string;
}

export default function TrafficMonitor() {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState<TrafficMetrics | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Only render if user email is admin@sparkblue.com
    if (user?.email !== 'admin@sparkblue.com') {
        return null;
    }

    useEffect(() => {
        // Only fetch if it's the specific admin
        if (user?.email !== 'admin@sparkblue.com') return;
        const fetchMetrics = async () => {
            try {
                const data = await fetchAPI('/diagnostics/traffic');
                setMetrics(data);
                setLastUpdated(new Date());
            } catch (err) {
                console.error('Failed to fetch traffic metrics', err);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds for "real-time" feel
        return () => clearInterval(interval);
    }, []);

    if (!metrics) return null;

    // Calculate percentage for the gauge
    // Based on 500 RPM capacity
    const percentage = Math.min(Math.round((metrics.currentRpm / metrics.threshold) * 80), 100);

    const statusColors = {
        Healthy: { text: 'text-green-600', bg: 'bg-green-500', lightBg: 'bg-green-50', border: 'border-green-100' },
        Warning: { text: 'text-yellow-600', bg: 'bg-yellow-500', lightBg: 'bg-yellow-50', border: 'border-yellow-100' },
        Critical: { text: 'text-red-600', bg: 'bg-red-500', lightBg: 'bg-red-50', border: 'border-red-100' }
    };

    const colors = statusColors[metrics.status] || statusColors.Healthy;

    return (
        <div className="bg-white rounded-none border border-gray-100 shadow-sm p-6 overflow-hidden relative">
            {/* Background Decorative Element */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${colors.lightBg} rounded-full blur-3xl opacity-50 -mr-16 -mt-16`}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Live Infrastructure Health</h3>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${metrics.status === 'Healthy' ? 'bg-green-500 animate-pulse' : colors.bg}`}></div>
                            <span className={`text-xs font-bold uppercase tracking-widest ${colors.text}`}>{metrics.status}</span>
                        </div>
                    </div>
                    <span className="text-[9px] font-mono text-gray-400">Updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50/50 border border-gray-50">
                        <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Current Load</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-serif text-brand-navy">{metrics.currentRpm}</span>
                            <span className="text-[10px] text-gray-400">RPM</span>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50/50 border border-gray-50">
                        <span className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">Estimated Limit</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-serif text-brand-navy">{metrics.threshold}</span>
                            <span className="text-[10px] text-gray-400">RPM</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
                        <span className="text-gray-400">Traffic Intensity</span>
                        <span className={colors.text}>{percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${colors.bg}`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>

                {metrics.isUpgradeRecommended ? (
                    <div className={`p-4 ${colors.lightBg} border ${colors.border} animate-in fade-in slide-in-from-top-2 duration-500`}>
                        <div className="flex items-start gap-3">
                            <div className={`p-1 ${colors.bg} rounded-full mt-0.5`}>
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <h4 className={`text-[10px] font-bold uppercase tracking-wider ${colors.text} mb-1`}>Migration Advisory</h4>
                                <p className="text-[11px] text-gray-600 leading-relaxed font-light">{metrics.advice}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-[10px] text-gray-400 font-light italic text-center">
                        Monitoring sustained load for migration triggers...
                    </p>
                )}
            </div>
        </div>
    );
}
