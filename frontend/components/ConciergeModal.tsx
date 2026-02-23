'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiX, PiCalendarCheck, PiPhoneCall, PiVideoCamera, PiMapPin, PiArrowRight, PiSealCheck } from 'react-icons/pi';

interface ConciergeModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
}

export default function ConciergeModal({ isOpen, onClose, productName }: ConciergeModalProps) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        mode: 'virtual' as 'virtual' | 'instore',
        date: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            setStep(3);
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-lg rounded-none shadow-2xl relative overflow-hidden flex flex-col"
                    >
                        {/* Header Image/Pattern */}
                        <div className="h-24 bg-brand-navy relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gold-gradient opacity-10"></div>
                            <PiCalendarCheck className="text-brand-gold w-10 h-10 opacity-20 absolute -right-4 -bottom-4 rotate-12" />
                            <h3 className="text-brand-gold font-serif text-xl md:text-2xl relative z-10 tracking-[0.1em]">Privileged Access</h3>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-20"
                        >
                            <PiX className="w-6 h-6" />
                        </button>

                        <div className="p-8 md:p-10">
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <span className="text-brand-gold text-[9px] font-black uppercase tracking-[0.3em] block mb-2">Exclusive Concierge</span>
                                    <h4 className="text-brand-navy text-xl font-serif mb-4">Request a Private Viewing</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                        Experience the brilliance of <span className="font-bold text-brand-navy">{productName}</span> through an exclusive 1-on-1 consultation with our master curators.
                                    </p>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-brand-navy/5 flex items-center justify-center shrink-0">
                                                <PiVideoCamera className="text-brand-gold w-4 h-4" />
                                            </div>
                                            <div>
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-navy">Virtual Boutique</h5>
                                                <p className="text-[10px] text-gray-400 font-medium">High-resolution video presentation from our studio.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-brand-navy/5 flex items-center justify-center shrink-0">
                                                <PiMapPin className="text-brand-gold w-4 h-4" />
                                            </div>
                                            <div>
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-navy">In-Store Preview</h5>
                                                <p className="text-[10px] text-gray-400 font-medium">Bespoke scheduling at our luxury flagship showrooms.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full h-14 bg-brand-navy text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] hover:bg-brand-gold hover:text-brand-navy transition-all duration-500 flex items-center justify-center gap-3 shadow-xl shadow-brand-navy/10"
                                    >
                                        Identify Yourself
                                        <PiArrowRight className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-[9px] uppercase tracking-widest font-black text-brand-navy/40 block mb-2">Full Name</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-gray-50 border-b border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-gold transition-colors font-medium text-brand-navy"
                                                placeholder="Enter your name"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] uppercase tracking-widest font-black text-brand-navy/40 block mb-2">WhatsApp or Email</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-gray-50 border-b border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-gold transition-colors font-medium text-brand-navy"
                                                placeholder="How should we reach you?"
                                                value={formData.contact}
                                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, mode: 'virtual' })}
                                                className={`p-4 border text-[9px] uppercase tracking-widest font-black transition-all ${formData.mode === 'virtual' ? 'border-brand-gold bg-brand-gold/5 text-brand-navy' : 'border-gray-100 text-gray-400 opacity-60'}`}
                                            >
                                                Virtual
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, mode: 'instore' })}
                                                className={`p-4 border text-[9px] uppercase tracking-widest font-black transition-all ${formData.mode === 'instore' ? 'border-brand-gold bg-brand-gold/5 text-brand-navy' : 'border-gray-100 text-gray-400 opacity-60'}`}
                                            >
                                                In-Store
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-6 h-14 bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            disabled={submitting}
                                            className={`flex-grow h-14 bg-brand-navy text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-xl shadow-brand-navy/20 ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                                        >
                                            {submitting ? 'Inscribing...' : 'Request Private Access'}
                                        </button>
                                    </div>
                                </motion.form>
                            )}

                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                                    <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <PiSealCheck className="text-brand-gold w-10 h-10" />
                                    </div>
                                    <h4 className="text-brand-navy text-2xl font-serif mb-4 italic">Request Received</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                        Our Master Curator will contact you shortly via <span className="text-brand-navy font-bold">{formData.contact}</span> to finalize your private session.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="px-10 h-14 border border-brand-navy/10 text-brand-navy text-[10px] font-black uppercase tracking-widest hover:bg-brand-navy hover:text-white transition-all duration-500"
                                    >
                                        Close Portal
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
