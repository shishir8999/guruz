import React, { useEffect, useState } from 'react';
import { Gift, X, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationSuccessPopupProps {
    duration?: number;
}

export default function RegistrationSuccessPopup({ duration = 5000 }: RegistrationSuccessPopupProps) {
    const [visible, setVisible] = useState(true);
    const [copied, setCopied] = useState(false);

    // Play a pleasant, joyful celebration chime sound using Web Audio API
    const playCelebrationSound = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();

            // Notes for celebratory arpeggio: C5, E5, G5, C6
            const notes = [
                { freq: 523.25, time: 0.00, duration: 0.25 },
                { freq: 659.25, time: 0.10, duration: 0.25 },
                { freq: 783.99, time: 0.20, duration: 0.30 },
                { freq: 1046.50, time: 0.30, duration: 0.60 },
            ];

            notes.forEach(({ freq, time, duration: noteDuration }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

                gain.gain.setValueAtTime(0, ctx.currentTime + time);
                gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + time + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + noteDuration);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + time);
                osc.stop(ctx.currentTime + time + noteDuration);
            });
        } catch (err) {
            // Silently ignore browser audio policies
        }
    };

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText('WELCOME5');
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    useEffect(() => {
        // Trigger celebration sound
        playCelebrationSound();

        // Immediate celebration confetti burst
        confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.55 },
            zIndex: 999999,
            colors: ['#10b981', '#059669', '#34d399', '#f59e0b', '#fbbf24', '#ffffff'],
        });

        // Auto close after exactly 5 seconds
        const closeTimer = setTimeout(() => {
            setVisible(false);
        }, duration);

        return () => {
            clearTimeout(closeTimer);
        };
    }, [duration]);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
                onClick={() => setVisible(false)}
            />

            {/* Main Modal Card */}
            <div 
                className="relative z-20 w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => setVisible(false)}
                    aria-label="Close"
                    className="absolute right-3.5 top-3.5 rounded-full p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Top Green Gift Icon */}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100/70">
                    <Gift className="h-7 w-7 stroke-[2]" />
                </div>

                {/* Heading & Subtitle */}
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1.5">
                    অ্যাকাউন্ট খুলুন, ৫% ছাড় পান!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                    নতুন অ্যাকাউন্ট তৈরি করে আপনার প্রথম অর্ডারে ৫% ছাড় উপভোগ করুন।
                </p>

                {/* Dashed Coupon Box */}
                <div 
                    onClick={handleCopy}
                    className="mt-4 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/60 p-3.5 text-center cursor-pointer hover:bg-emerald-100/70 transition group relative"
                >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        কুপন কোড
                    </div>
                    <div className="mt-1 text-2xl font-mono font-black tracking-widest text-emerald-600 flex items-center justify-center gap-2">
                        <span>WELCOME5</span>
                        {copied ? (
                            <Check className="w-5 h-5 text-emerald-600" />
                        ) : (
                            <Copy className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform opacity-75 group-hover:opacity-100" />
                        )}
                    </div>
                    <p className="text-[10px] text-emerald-700/90 font-bold mt-1">
                        {copied ? '✅ কোডটি কপি করা হয়েছে!' : '📋 ক্লিক করে কোডটি কপি করুন'}
                    </p>
                </div>

                {/* Action Button & Dismiss Link */}
                <div className="mt-5 flex flex-col gap-2.5">
                    <button
                        type="button"
                        onClick={() => {
                            handleCopy();
                            setTimeout(() => setVisible(false), 400);
                        }}
                        className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                        {copied ? 'কপি হয়েছে! কেনাকাটা করুন' : 'কুপনটি কপি করুন'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => setVisible(false)}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                        পরে দেখব
                    </button>
                </div>

                {/* 5-second animated countdown progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 animate-countdown" />
                </div>
            </div>

            <style>{`
                @keyframes countdown {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-countdown {
                    animation: countdown ${duration / 1000}s linear forwards;
                }
            `}</style>
        </div>
    );
}
