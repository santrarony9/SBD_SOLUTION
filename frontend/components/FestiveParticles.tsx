'use client';

import React, { useEffect, useRef } from 'react';
import { FESTIVE_CONFIG, isFestiveModeActive } from '@/config/festive-config';

export default function FestiveParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isFestiveModeActive() || !FESTIVE_CONFIG.features.fallingParticles) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        // Configuration for Holi Splashes
        const colors = ['#ff0080', '#fbff00', '#00ff40', '#0099ff', '#ff5a00', '#ae00ff'];
        const particles: Particle[] = [];
        const particleCount = 25;

        class Particle {
            x: number;
            y: number;
            size: number;
            color: string;
            speedX: number;
            speedY: number;
            opacity: number;
            angle: number;
            spin: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.size = Math.random() * 40 + 20;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.speedY = (Math.random() - 0.5) * 1.5;
                this.opacity = Math.random() * 0.4 + 0.1;
                this.angle = Math.random() * 360;
                this.spin = (Math.random() - 0.5) * 0.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.angle += this.spin;

                // Boundary check
                if (this.x < -50) this.x = canvas!.width + 50;
                if (this.x > canvas!.width + 50) this.x = -50;
                if (this.y < -50) this.y = canvas!.height + 50;
                if (this.y > canvas!.height + 50) this.y = -50;
            }

            draw() {
                ctx!.save();
                ctx!.translate(this.x, this.y);
                ctx!.rotate((this.angle * Math.PI) / 180);
                ctx!.globalAlpha = this.opacity;
                ctx!.fillStyle = this.color;

                // Create a "splash" shape (irregular circle)
                ctx!.beginPath();
                for (let i = 0; i < 8; i++) {
                    const radius = (i % 2 === 0 ? this.size : this.size * 0.8) * Math.random() * 0.5 + this.size * 0.5;
                    const angle = (i / 8) * Math.PI * 2;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    if (i === 0) ctx!.moveTo(x, y);
                    else ctx!.lineTo(x, y);
                }
                ctx!.closePath();
                ctx!.fill();

                // Add soft blur look
                ctx!.filter = 'blur(4px)';
                ctx!.restore();
            }
        }

        const init = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (!isFestiveModeActive() || !FESTIVE_CONFIG.features.fallingParticles) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[45] opacity-60"
            style={{ mixBlendMode: 'multiply' }}
        />
    );
}
