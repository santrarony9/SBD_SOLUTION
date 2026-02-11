'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiGift, PiSparkle, PiUser, PiCalendarHeart, PiCurrencyInr, PiArrowRight, PiCheckCircle, PiArrowCounterClockwise } from "react-icons/pi";
import { fetchAPI } from '@/lib/api';
import ProductCard from './ProductCard';
import Link from 'next/link';

interface QuizState {
    step: number;
    answers: {
        recipient: string;
        occasion: string;
        budget: string;
        style: string;
    };
}

export default function GiftFinder() {
    const router = useRouter();
    const [quiz, setQuiz] = useState<QuizState>({
        step: 0,
        answers: { recipient: '', occasion: '', budget: '', style: '' }
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);

    const questions = [
        {
            key: 'recipient',
            question: "Who are you shopping for?",
            icon: <PiUser className="text-4xl mb-4 text-brand-gold" />,
            options: [
                { label: "Partner / Spouse", value: "partner" },
                { label: "Mother", value: "mother" },
                { label: "Sister / Friend", value: "sister_friend" },
                { label: "Myself", value: "self" },
            ]
        },
        {
            key: 'occasion',
            question: "What's the special occasion?",
            icon: <PiCalendarHeart className="text-4xl mb-4 text-brand-gold" />,
            options: [
                { label: "Birthday", value: "birthday" },
                { label: "Anniversary", value: "anniversary" },
                { label: "Engagement", value: "engagement" },
                { label: "Just Because", value: "love" },
            ]
        },
        {
            key: 'style',
            question: "What's their style preference?",
            icon: <PiSparkle className="text-4xl mb-4 text-brand-gold" />,
            options: [
                { label: "Classic & Timeless", value: "classic" },
                { label: "Modern & Minimalist", value: "modern" },
                { label: "Bold & Statement", value: "statement" },
                { label: "Vintage & Intricate", value: "vintage" },
            ]
        },
        {
            key: 'budget',
            question: "What is your budget range?",
            icon: <PiCurrencyInr className="text-4xl mb-4 text-brand-gold" />,
            options: [
                { label: "Under ₹25,000", value: "0-25000" },
                { label: "₹25,000 - ₹50,000", value: "25000-50000" },
                { label: "₹50,000 - ₹1 Lakh", value: "50000-100000" },
                { label: "Above ₹1 Lakh", value: "100000+" },
            ]
        }
    ];

    const handleOptionSelect = (value: string) => {
        const currentQuestionKey = questions[quiz.step].key;
        const nextStep = quiz.step + 1;

        setQuiz(prev => ({
            ...prev,
            answers: { ...prev.answers, [currentQuestionKey]: value },
            step: nextStep
        }));

        if (nextStep === questions.length) {
            submitQuiz({ ...quiz.answers, [currentQuestionKey]: value });
        }
    };

    const submitQuiz = async (finalAnswers: any) => {
        setIsAnalyzing(true);
        try {
            const data = await fetchAPI('/marketing/gift-recommendations', {
                method: 'POST',
                body: JSON.stringify(finalAnswers)
            });
            setResults(data);
        } catch (error) {
            console.error("Failed to get recommendations", error);
            // Fallback to shop page if error
            const query = new URLSearchParams(finalAnswers).toString();
            router.push(`/shop?gift_finder=true&${query}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetQuiz = () => {
        setQuiz({
            step: 0,
            answers: { recipient: '', occasion: '', budget: '', style: '' }
        });
        setResults(null);
    };

    const currentQuestion = questions[quiz.step];

    if (isAnalyzing) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-brand-cream/30">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-brand-gold/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-brand-gold border-r-brand-gold border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <PiSparkle className="absolute inset-0 m-auto text-4xl text-brand-gold animate-pulse" />
                </div>
                <h2 className="text-2xl font-serif text-brand-navy mb-2">Consulting our AI Stylist...</h2>
                <p className="text-gray-500 max-w-md">Curating the perfect selection based on your preferences for {quiz.answers.recipient}...</p>
            </div>
        );
    }

    if (results) {
        return (
            <div className="animate-fade-in-up">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif text-brand-navy mb-4">Your Curated Collection</h2>
                    <p className="text-gray-500 mb-8">Handpicked for your {quiz.answers.occasion.toLowerCase()} celebration.</p>
                    <button onClick={resetQuiz} className="inline-flex items-center gap-2 text-sm text-brand-gold hover:text-brand-navy transition-colors font-bold uppercase tracking-widest">
                        <PiArrowCounterClockwise /> Start Over
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {results.map((product) => (
                        <div key={product.id} className="group">
                            <ProductCard product={{ ...product, image: product.imageUrl || '/placeholder.jpg' }} />
                            <div className="mt-4 p-4 bg-brand-gold/5 rounded-lg border border-brand-gold/10">
                                <div className="flex items-start gap-2">
                                    <PiSparkle className="text-brand-gold text-xl flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-brand-navy/80 italic">"{product.matchReason}"</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <Link href="/shop" className="bg-brand-navy text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-brand-gold transition-colors">
                        View Full Collection
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-brand-gold/10">
            {/* Progress Bar */}
            <div className="h-2 bg-gray-100">
                <div
                    className="h-full bg-gradient-to-r from-brand-navy to-brand-gold transition-all duration-500 ease-out"
                    style={{ width: `${((quiz.step) / questions.length) * 100}%` }}
                ></div>
            </div>

            <div className="p-8 md:p-16 text-center">
                {currentQuestion && (
                    <div className="animate-fade-in-up">
                        {currentQuestion.icon}
                        <h2 className="text-3xl md:text-4xl font-serif text-brand-navy mb-12">{currentQuestion.question}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            {currentQuestion.options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleOptionSelect(option.value)}
                                    className="group relative p-6 border border-gray-200 rounded-xl hover:border-brand-gold hover:bg-brand-gold/5 transition-all text-left flex items-center justify-between"
                                >
                                    <span className="text-lg font-medium text-gray-700 group-hover:text-brand-navy">{option.label}</span>
                                    <PiArrowRight className="text-gray-300 group-hover:text-brand-gold transform group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
