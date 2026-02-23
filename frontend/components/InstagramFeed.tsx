'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PiInstagramLogo } from "react-icons/pi";
import { fetchAPI } from '@/lib/api';
import SkeletonLoader from './SkeletonLoader';

interface SocialPost {
    id: string;
    imageUrl: string;
    caption?: string;
    link?: string;
    username?: string;
    likes: number;
}

export default function InstagramFeed() {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPosts() {
            try {
                const data = await fetchAPI('/marketing/social-posts');
                setPosts(data.slice(0, 6)); // Limit to 6
            } catch (err) {
                console.error("Failed to load social posts", err);
            } finally {
                setLoading(false);
            }
        }
        loadPosts();
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-white overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonLoader key={i} className="aspect-square w-full" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (posts.length === 0) return null;

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col items-center mb-12 text-center animate-fade-in-up">
                    <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-3">
                        Join the Community
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-brand-navy mb-6">
                        @SparkBlueDiamond
                    </h2>
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-navy hover:text-brand-gold transition-colors relative group btn-gold-glow px-4 py-2"
                    >
                        <PiInstagramLogo className="text-lg" />
                        Follow Us
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                    </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0.5 md:gap-4">
                    {posts.map((post, i) => (
                        <div
                            key={post.id}
                            className="relative aspect-square group overflow-hidden bg-gray-100 cursor-pointer animate-fade-in-up"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <Image
                                src={post.imageUrl}
                                alt={post.caption || 'Instagram Post'}
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <a
                                href={post.link || 'https://instagram.com'}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0 bg-brand-navy/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-4 text-center"
                            >
                                <PiInstagramLogo className="text-3xl mb-2" />
                                <p className="text-[10px] uppercase tracking-widest font-bold line-clamp-2">
                                    {post.caption || '@sparkbluediamond'}
                                </p>
                                <div className="mt-2 text-xs font-serif italic opacity-80">
                                    ❤️ {post.likes}
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
