"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, useTransform, motion } from "framer-motion";

const TOTAL_FRAMES = 240;

export default function RaisEmbroideryExperience() {
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loadedCount, setLoadedCount] = useState(0);

    // Preload images
    useEffect(() => {
        let loaded = 0;
        const loadedImages: HTMLImageElement[] = [];

        // For tracking if component unmounted to prevent memory leaks
        let isActive = true;

        const loadImages = () => {
            for (let i = 0; i < TOTAL_FRAMES; i++) {
                const img = new Image();

                const handleLoad = () => {
                    if (!isActive) return;
                    loaded++;
                    setLoadedCount(loaded);
                };

                // Attach events before setting source
                img.onload = handleLoad;
                img.onerror = handleLoad; // If an image fails, count it as loaded so we don't block the whole experience forever

                img.src = `/sequence/frame_${i}.webp`;
                loadedImages.push(img);
            }
            if (isActive) {
                setImages(loadedImages);
            }
        };

        loadImages();

        return () => {
            isActive = false;
        };
    }, []);

    if (loadedCount < TOTAL_FRAMES) {
        const progress = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-[#D4AF37]">
                <div className="w-12 h-12 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mb-8"></div>
                <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full bg-[#D4AF37] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="font-mono text-xs tracking-widest text-white/50">{progress}% LOADED</p>
            </div>
        );
    }

    return <ExperienceScene images={images} />;
}

function ExperienceScene({ images }: { images: HTMLImageElement[] }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Scroll tracking from 0 to 1 based on the container height (400vh)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Frame scroll progress
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    // High-performance Frame rendering logic (Rewritten to eliminate RAF lag)
    useEffect(() => {
        if (!canvasRef.current || images.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false }); // alpha: false for performance
        if (!ctx) return;

        let lastDrawnIndex = -1;

        const drawFrame = (index: number) => {
            if (index === lastDrawnIndex) return; // Prevent redundant pixel calculation
            const img = images[index];
            if (!img || !img.complete) return;

            lastDrawnIndex = index;

            // Cover math scaling
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;
            let drawWidth, drawHeight, x, y;

            if (canvasRatio > imgRatio) {
                drawWidth = canvas.width;
                drawHeight = img.height * (canvas.width / img.width);
                x = 0;
                y = (canvas.height - drawHeight) / 2;
            } else {
                drawHeight = canvas.height;
                drawWidth = img.width * (canvas.height / img.height);
                x = (canvas.width - drawWidth) / 2;
                y = 0;
            }

            // GPU Accelerated draw
            ctx.fillStyle = "#050505";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
        };

        // Subscribe directly to the physics engine instead of running a permanent 60fps loop
        const unsubscribe = smoothProgress.on("change", (progress) => {
            const animationProgress = Math.min(1, Math.max(0, progress / 0.85));
            const frameIndex = Math.min(
                TOTAL_FRAMES - 1,
                Math.floor(animationProgress * TOTAL_FRAMES)
            );

            // Only fire DOM updates when the physics engine calculates a new frame
            requestAnimationFrame(() => drawFrame(frameIndex));
        });

        // Initialize first frame immediately
        drawFrame(0);

        return () => {
            unsubscribe(); // Clean up memory leaks 
        };
    }, [smoothProgress, images]);

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                // Set canvas internal resolution to window size for crispness
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };

        handleResize(); // Initial measurement
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const useOpAnim = (s: number, e: number) =>
        useTransform(smoothProgress, [s - 0.05, s, e, e + 0.05], [0, 1, 1, 0]);
    const useYAnim = (s: number, e: number) =>
        useTransform(smoothProgress, [s - 0.05, s, e, e + 0.05], [20, 0, 0, -20]);

    // Beat A: 0-20%
    const beatAOp = useOpAnim(0, 0.20);
    const beatAY = useYAnim(0, 0.20);
    const scrollIndicatorOp = useTransform(smoothProgress, [0, 0.10], [1, 0]);

    // Beat D (End Title): 85-100% (Appears after animation finishes)
    const beatDOp = useTransform(smoothProgress, [0.85, 0.95], [0, 1]); // No fade out at the very end
    const beatDY = useTransform(smoothProgress, [0.85, 0.95], [20, 0]);


    return (
        <div ref={containerRef} className="relative w-full h-[400vh] bg-[#050505]">
            {/* Sticky Container */}
            <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
                {/* Canvas Background */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Text Overlays */}

                {/* Beat A: 0-20% (Centered) */}
                <motion.div
                    style={{ opacity: beatAOp, y: beatAY }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10 px-6"
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white/90 mb-4 drop-shadow-2xl">
                        THREAD OF ROYALTY
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 tracking-wider">
                        Crafted in Gold. Worn with Power.
                    </p>

                    <motion.div
                        style={{ opacity: scrollIndicatorOp }}
                        className="absolute bottom-12 flex flex-col items-center gap-2"
                    >
                        <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37]/80">Scroll to Experience</span>
                        <div className="w-[1px] h-12 bg-gradient-to-b from-[#D4AF37]/80 to-transparent"></div>
                    </motion.div>
                </motion.div>



                {/* Beat D: 75-100% (Centered CTA) */}
                <motion.div
                    style={{ opacity: beatDOp, y: beatDY }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20"
                >
                    {/* Faint ambient glow behind text to make it pop over the bright image */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] -z-10" />

                    <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-[#D4AF37]/60 mb-6 px-4 py-2">
                        RAIS EMBROIDERY WORKS
                    </h1>
                    <p className="text-xl md:text-3xl text-[#D4AF37] font-light tracking-widest mb-12">
                        Where Craft Becomes Legacy.
                    </p>

                    <a href="/home.html" className="group relative px-8 py-4 bg-transparent overflow-hidden pointer-events-auto">
                        <div className="absolute inset-0 border border-[#D4AF37]/40 transition-colors group-hover:border-[#D4AF37]"></div>
                        <div className="absolute inset-0 bg-[#D4AF37] translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0"></div>
                        <span className="relative z-10 flex items-center gap-2 text-sm font-semibold tracking-widest text-[#D4AF37] group-hover:text-black transition-colors duration-300 uppercase">
                            Explore Collection
                            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </a>
                </motion.div>

            </div>
        </div>
    );
}
