import React, { useEffect, useState } from 'react';
import { Sun } from 'lucide-react';

interface SummerEntranceOverlayProps {
    active: boolean;
}

export default function SummerEntranceOverlay({ active }: SummerEntranceOverlayProps) {
    const [show, setShow] = useState(false);
    const [animatingOut, setAnimatingOut] = useState(false);

    useEffect(() => {
        if (!active) {
            setShow(false);
            return;
        }

        // Check session storage so entrance flare shows once per session
        const hasShown = sessionStorage.getItem('summer_entrance_shown');
        if (!hasShown) {
            setShow(true);
            sessionStorage.setItem('summer_entrance_shown', 'true');

            // Auto dismiss after 2.6 seconds
            const timer = setTimeout(() => {
                setAnimatingOut(true);
                setTimeout(() => setShow(false), 800);
            }, 2600);

            return () => clearTimeout(timer);
        }
    }, [active]);

    if (!show) return null;

    return (
        <div 
            onClick={() => {
                setAnimatingOut(true);
                setTimeout(() => setShow(false), 400);
            }}
            className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center cursor-pointer overflow-hidden backdrop-blur-md transition-all duration-700 ${
                animatingOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
            }`}
            style={{
                background: 'radial-gradient(circle at center, rgba(255,109,0,0.95) 0%, rgba(245,158,11,0.9) 35%, rgba(15,23,42,0.98) 85%)'
            }}
        >
            {/* ☀️ SOLAR FLARE CENTER BURST ANIMATION */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                {/* Outer Rotating Solar Flare Rays */}
                <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-r from-amber-400/40 via-orange-500/50 to-yellow-300/40 blur-3xl animate-spin-slow opacity-80" />
                <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-yellow-300/60 via-amber-500/70 to-orange-600/60 blur-2xl animate-ping opacity-60" style={{ animationDuration: '3s' }} />
                
                {/* Intense Central Solar Ring */}
                <div className="w-80 h-80 rounded-full bg-yellow-300/80 blur-xl animate-pulse shadow-[0_0_120px_rgba(253,224,71,0.9)]" />
            </div>

            {/* ☀️ FLOATING SUNBURST PARTICLES */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute -top-10 left-1/4 text-4xl animate-bounce">☀️</div>
                <div className="absolute top-1/3 right-1/4 text-3xl animate-pulse">🥭</div>
                <div className="absolute bottom-1/4 left-1/3 text-3xl animate-spin-slow">🍉</div>
                <div className="absolute top-1/4 left-10 text-2xl animate-ping">🌟</div>
                <div className="absolute bottom-20 right-12 text-3xl animate-bounce">🍃</div>
            </div>

            {/* ☀️ TEXT CONTENT WITH GOLDEN GLOW LIGHTING */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 animate-in zoom-in-75 duration-500">
                {/* Pulsating Glowing Sun Icon */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-amber-400 blur-2xl animate-pulse" />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 p-1 shadow-[0_0_60px_rgba(251,191,36,0.9)] flex items-center justify-center border-4 border-white/80">
                        <Sun className="w-16 h-16 text-orange-900 animate-spin-slow" />
                    </div>
                </div>

                {/* Season Title */}
                <span className="px-4 py-1 rounded-full bg-amber-950/60 border border-amber-400/60 text-amber-300 text-xs font-black uppercase tracking-widest mb-3 shadow-lg flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-yellow-300" />
                    ☀️ গ্রীষ্মকাল স্পেশাল থিম (Summer Theme)
                </span>

                {/* Main Glowing Golden Text: "গ্রীষ্মের তপ্ত অফার" */}
                <h1 
                    className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100"
                    style={{
                        textShadow: '0 0 30px rgba(253, 224, 71, 0.9), 0 0 60px rgba(245, 158, 11, 0.7)'
                    }}
                >
                    গ্রীষ্মের তপ্ত অফার
                </h1>

                <p className="text-sm sm:text-base font-bold text-amber-100/90 max-w-md drop-shadow-md">
                    উজ্জ্বল রোদ আর আকর্ষণীয় স্পেশাল সামার অফারে আপনার কেনাকাটাকে করুন আনন্দদায়ক! 🌴🥭
                </p>

                {/* Click to skip badge */}
                <span className="mt-8 text-[11px] font-bold text-amber-200/70 bg-black/40 px-4 py-1.5 rounded-full border border-amber-400/30 backdrop-blur-xs animate-pulse">
                    স্কিপ করতে যেকোনো জায়গায় ক্লিক করুন ➔
                </span>
            </div>
        </div>
    );
}
