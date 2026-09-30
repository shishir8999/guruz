import React, { useEffect, useState } from 'react';


interface DeepavaliEntranceOverlayProps {
    active: boolean;
}

export default function DeepavaliEntranceOverlay({ active }: DeepavaliEntranceOverlayProps) {
    const [show, setShow] = useState(false);
    const [animatingOut, setAnimatingOut] = useState(false);

    useEffect(() => {
        if (!active) {
            setShow(false);
            return;
        }

        const hasShown = sessionStorage.getItem('deepavali_entrance_shown');
        if (!hasShown) {
            setShow(true);
            sessionStorage.setItem('deepavali_entrance_shown', 'true');

            const timer = setTimeout(() => {
                setAnimatingOut(true);
                setTimeout(() => setShow(false), 800);
            }, 3000);

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
                background: 'radial-gradient(circle at center, rgba(245,158,11,0.95) 0%, rgba(217,119,6,0.9) 45%, rgba(15,23,42,0.98) 85%)'
            }}
        >
            {/* RISING FIREWORKS & DIYAS FROM BOTTOM */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute bottom-10 left-1/4 text-4xl animate-bounce">🪔</div>
                <div className="absolute bottom-16 right-1/4 text-4xl animate-pulse">🎆</div>
                <div className="absolute bottom-20 left-1/5 text-4xl animate-spin-slow">🌟</div>
                <div className="absolute bottom-12 right-1/5 text-3xl animate-ping">🕯️</div>
                <div className="absolute bottom-24 left-1/3 text-4xl animate-bounce">🎇</div>
            </div>

            {/* MAIN CONTENT */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 animate-in zoom-in-90 duration-700">
                {/* Glowing Pradip Icon */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-yellow-300 blur-3xl animate-pulse" />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-1 shadow-[0_0_60px_rgba(251,191,36,0.9)] flex items-center justify-center border-4 border-yellow-100">
                        <span className="text-5xl drop-shadow-md">🪔</span>
                    </div>
                </div>

                <span className="px-4 py-1 rounded-full bg-amber-950/80 border border-yellow-300/60 text-yellow-300 text-xs font-black uppercase tracking-widest mb-3 shadow-lg flex items-center gap-2">
                    🪔 শুভ দীপাবলি স্পেশাল (Diwali Special)
                </span>

                {/* Glowing Golden Text */}
                <h1 
                    className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4 drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-300"
                    style={{
                        textShadow: '0 0 25px rgba(251, 191, 36, 0.95), 0 0 50px rgba(217, 119, 6, 0.8), 0 0 80px rgba(254, 240, 138, 0.6)'
                    }}
                >
                    শুভ দীপাবলি 🪔🎆
                </h1>

                <p className="text-sm sm:text-base font-bold text-amber-100/90 max-w-md drop-shadow-md">
                    আলোর উৎসব ও অনাবিল আনন্দের শুভ দীপাবলি ও কালীপূজার প্রীতি ও শুভেচ্ছা! 🪔
                </p>

                <span className="mt-8 text-[11px] font-bold text-yellow-200/80 bg-black/40 px-4 py-1.5 rounded-full border border-yellow-400/30 backdrop-blur-xs animate-pulse">
                    স্কিপ করতে যেকোনো জায়গায় ক্লিক করুন ➔
                </span>
            </div>
        </div>
    );
}
