import { useState, useEffect } from 'react';
import { PiCopy, PiArrowsClockwise, PiX, PiTerminalWindow } from 'react-icons/pi';
import { fetchAPI } from '@/lib/api';

export default function LogViewer({ onClose }: { onClose: () => void }) {
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copyStatus, setCopyStatus] = useState('Copy Logs');

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAPI('/diagnostics/logs');
            setLogs(data.logs || []);
        } catch (error) {
            console.error("Failed to fetch logs", error);
            setLogs(["Failed to load logs. Backend might be unreachable."]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000); // Auto-refresh
        return () => clearInterval(interval);
    }, []);

    const copyToClipboard = () => {
        const logText = logs.join('\n');
        navigator.clipboard.writeText(logText);
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy Logs'), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-[#1e1e1e] w-full max-w-4xl h-[80vh] rounded-lg shadow-2xl flex flex-col border border-gray-700 font-mono text-sm">

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-[#252526] rounded-t-lg">
                    <div className="flex items-center gap-3 text-gray-200">
                        <PiTerminalWindow className="w-5 h-5 text-brand-gold" />
                        <span className="font-bold tracking-wide">System Diagnostic Logs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchLogs}
                            className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                            title="Refresh"
                        >
                            <PiArrowsClockwise className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-900/50 hover:text-red-400 rounded transition-colors text-gray-400"
                        >
                            <PiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Log Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar bg-[#1e1e1e] text-gray-300">
                    {logs.length === 0 ? (
                        <div className="text-gray-500 italic text-center mt-20">No logs recorded yet...</div>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className="break-all whitespace-pre-wrap hover:bg-gray-800/50 p-0.5 rounded">
                                <span className="text-gray-500 mr-2">{index + 1}</span>
                                <span className={log.includes('Exception') || log.includes('Error') ? 'text-red-400' : 'text-green-400'}>
                                    {log}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-700 bg-[#252526] rounded-b-lg flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                        Logs are buffered in memory (Last 100 entries).
                    </span>
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 bg-brand-gold text-brand-navy px-4 py-2 rounded font-bold hover:bg-yellow-400 transition-colors"
                    >
                        <PiCopy className="w-4 h-4" />
                        {copyStatus}
                    </button>
                </div>
            </div>
        </div>
    );
}
