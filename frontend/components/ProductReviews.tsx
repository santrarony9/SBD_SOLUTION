'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface Review {
    id: string;
    rating: number;
    comment: string;
    user: {
        name: string;
    };
    createdAt: string;
}

export default function ProductReviews({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const { showToast } = useToast();
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadReviews = async () => {
        try {
            const data = await fetchAPI(`/reviews/product/${productId}`);
            if (Array.isArray(data)) setReviews(data);
        } catch (error) {
            console.error('Failed to load reviews');
        }
    };

    useEffect(() => {
        loadReviews();
    }, [productId]);

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await fetchAPI('/reviews', {
                method: 'POST',
                body: JSON.stringify({ productId, rating: newRating, comment: newComment }),
            });
            setNewComment('');
            loadReviews();
            showToast('Review submitted successfully', 'success');
        } catch (error) {
            showToast('Failed to submit review. Please login first.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-16 border-t border-gray-100 pt-12">
            <h2 className="text-2xl font-serif text-brand-navy mb-8 text-center">Customer Reviews</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Review List */}
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <p className="text-gray-500 italic">No reviews yet. Be the first to review this piece!</p>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-gray-50 p-6 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-brand-navy">{review.user.name}</span>
                                    <div className="text-brand-gold">
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Write Review Form */}
                <div className="bg-white p-8 border border-gray-100 shadow-sm rounded-lg">
                    <h3 className="font-serif text-lg text-brand-navy mb-4">Write a Review</h3>
                    <form onSubmit={submitReview} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Rating</label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewRating(star)}
                                        className={`text-2xl transition-colors ${star <= newRating ? 'text-brand-gold' : 'text-gray-300'}`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Your Review</label>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full border border-gray-300 rounded p-3 text-sm focus:border-brand-gold outline-none"
                                rows={4}
                                placeholder="Share your thoughts on this piece..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-brand-navy text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-gold-gradient hover:text-brand-navy transition-all duration-300 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
