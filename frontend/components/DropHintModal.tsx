'use client';

import { useState } from 'react';
import { PiPaperPlaneRight, PiX } from "react-icons/pi";
import { fetchAPI } from '@/lib/api';

interface DropHintModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    productId: string;
}

export default function DropHintModal({ isOpen, onClose, productName, productId }: DropHintModalProps) {
    const [formData, setFormData] = useState({
        senderName: '',
        recipientName: '',
        recipientEmail: '',
        note: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await fetchAPI('/marketing/hint', {
                method: 'POST',
                body: JSON.stringify({ ...formData, productId })
            });
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setFormData({ senderName: '', recipientName: '', recipientEmail: '', note: '' });
            }, 2000);
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative animate-scale-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-brand-navy transition-colors">
                    <PiX size={24} />
                </button>

                <div className="bg-brand-navy p-6 text-center">
                    <h3 className="text-xl font-serif text-white italic">Drop a Hint</h3>
                    <p className="text-brand-gold/80 text-xs uppercase tracking-widest mt-1">Let someone obtain the hint</p>
                </div>

                <div className="p-8">
                    {status === 'success' ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                <PiPaperPlaneRight />
                            </div>
                            <h4 className="text-xl font-serif text-brand-navy mb-2">Hint Sent!</h4>
                            <p className="text-gray-500 text-sm">We've anonymously (or not) slipped this into their inbox.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Your Name</label>
                                <input
                                    required
                                    className="w-full border-b border-gray-300 py-2 focus:border-brand-gold outline-none text-brand-navy placeholder-gray-300"
                                    placeholder="Enter your name"
                                    value={formData.senderName}
                                    onChange={e => setFormData({ ...formData, senderName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Their Name</label>
                                    <input
                                        required
                                        className="w-full border-b border-gray-300 py-2 focus:border-brand-gold outline-none text-brand-navy placeholder-gray-300"
                                        placeholder="Name"
                                        value={formData.recipientName}
                                        onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Their Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full border-b border-gray-300 py-2 focus:border-brand-gold outline-none text-brand-navy placeholder-gray-300"
                                        placeholder="Email"
                                        value={formData.recipientEmail}
                                        onChange={e => setFormData({ ...formData, recipientEmail: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Add a Note (Optional)</label>
                                <textarea
                                    className="w-full border border-gray-200 rounded p-3 focus:border-brand-gold outline-none text-brand-navy text-sm"
                                    rows={3}
                                    placeholder="This would look great on me..."
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full bg-brand-navy text-white py-4 uppercase tracking-widest text-xs font-bold hover:bg-brand-gold transition-colors flex items-center justify-center gap-2 mt-4"
                            >
                                {status === 'sending' ? 'Sending...' : (
                                    <>Send Hint <PiPaperPlaneRight className="text-lg" /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
