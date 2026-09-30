import React, { useEffect, useState } from 'react';
import { Cloud } from 'lucide-react';

interface AutumnEntranceOverlayProps {
    active: boolean;
}

export default function AutumnEntranceOverlay({ active }: AutumnEntranceOverlayProps) {
    const [show, setShow] = useState(false);
    const [animatingOut, setAnimatingOut] = useState(false);

    useEffect(() => {
        if (!active) {
            setShow(false);
            return;
        }

        // Check session storage so entrance overlay shows once per session
        const hasShown = sessionStorage.getItem('autumn_entrance_shown');
        if (!hasShown) {
            setShow(true);
            sessionStorage.setItem('autumn_entrance_shown', 'true');

            // Auto dismiss after 2.8 seconds
            const timer = setTimeout(() => {
                setAnimatingOut(true);
                setTimeout(() => setShow(false), 800);
            }, 2800);

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
                animatingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
            }`}
            style={{
                background: 'radial-gradient(circle at center, rgba(14,165,233,0.95) 0%, rgba(56,189,248,0.9) 40%, rgba(15,23,42,0.98) 85%)'
            }}
        >
            {/* 🌾 FLUFFY WHITE CLOUDS FLOATING UPWARDS FROM BOTTOM */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-end justify-between px-4 opacity-75">
                <div className="w-96 h-48 bg-white/40 rounded-full blur-3xl animate-bounce duration-[4000ms] -mb-10 -ml-16" />
                <div className="w-[500px] h-64 bg-sky-100/50 rounded-full blur-3xl animate-pulse duration-[3000ms] -mb-20" />
                <div className="w-80 h-44 bg-white/40 rounded-full blur-3xl animate-bounce duration-[5000ms] -mb-10 -mr-16" />
            </div>

            {/* 🌾 FLOATING SHIULI FLOWERS & KASHFUL MOTIFS */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute top-12 left-1/4 text-4xl animate-bounce">🌾</div>
                <div className="absolute top-1/3 right-1/4 text-3xl animate-pulse">🌸</div>
                <div className="absolute bottom-1/3 left-1/5 text-4xl animate-spin-slow">🏵️</div>
                <div className="absolute top-1/4 left-12 text-3xl animate-ping">☁️</div>
                <div className="absolute bottom-24 right-1/4 text-4xl animate-bounce">🌾</div>
            </div>

            {/* 🌾 TEXT CONTENT WITH SKY-BLUE NEON GLOW */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 animate-in zoom-in-90 duration-700">
                {/* Cloud & Shiuli Badge */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-sky-300 blur-2xl animate-pulse" />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-sky-400 via-sky-200 to-white p-1 shadow-[0_0_50px_rgba(56,189,248,0.9)] flex items-center justify-center border-4 border-white">
                        <Cloud className="w-14 h-14 text-sky-800 animate-pulse" />
                    </div>
                </div>

                {/* Season Title */}
                <span className="px-4 py-1 rounded-full bg-sky-950/70 border border-sky-300/60 text-sky-200 text-xs font-black uppercase tracking-widest mb-3 shadow-lg flex items-center gap-2">
                    <Cloud className="w-3.5 h-3.5 text-sky-300" />
                    🌾 শরৎকাল স্পেশাল থিম (Autumn Season)
                </span>

                {/* Main Glowing Sky-Blue Neon Text: "শরতের স্নিগ্ধ সম্ভার" */}
                <h1 
                    className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] text-transparent bg-clip-text bg-gradient-to-r from-sky-100 via-white to-sky-200"
                    style={{
                        textShadow: '0 0 25px rgba(56, 189, 248, 0.95), 0 0 50px rgba(14, 165, 233, 0.8), 0 0 80px rgba(224, 242, 254, 0.6)'
                    }}
                >
                    শরতের স্নিগ্ধ সম্ভার
                </h1>

                <p className="text-sm sm:text-base font-bold text-sky-100/90 max-w-md drop-shadow-md">
                    শুভ্র মেঘের ভেলা আর শিউলির সুবাসে শরতের স্নিগ্ধ ছোঁয়ায় কেনাকাটা করুন! 🌾🌸
                </p>

                {/* Click to skip badge */}
                <span className="mt-8 text-[11px] font-bold text-sky-200/80 bg-black/40 px-4 py-1.5 rounded-full border border-sky-400/30 backdrop-blur-xs animate-pulse">
                    স্কিপ করতে যেকোনো জায়গায় ক্লিক করুন ➔
                </span>
            </div>
        </div>
    );
}
