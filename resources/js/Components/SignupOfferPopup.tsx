import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Gift, X, Copy, Check } from 'lucide-react';

const STORAGE_KEY = 'signup_offer_seen_v2';

export function SignupOfferPopup() {
    const { props } = usePage<any>();
    const user = props.auth?.user;
    const flash = props.flash || {};
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        // Do not show if user is already logged in or if registered popup is showing
        if (user || flash.registered) return;

        try {
            if (window.localStorage.getItem(STORAGE_KEY)) return;
        } catch {}

        // Show after 3.5 seconds of browsing
        const timer = setTimeout(() => {
            setOpen(true);
        }, 3500);

        return () => clearTimeout(timer);
    }, [user, flash.registered]);

    // Auto close after 5 seconds once opened
    useEffect(() => {
        if (!open) return;

        const autoClose = setTimeout(() => {
            dismiss();
        }, 5000);

        return () => clearTimeout(autoClose);
    }, [open]);

    const dismiss = () => {
        setOpen(false);
        try {
            window.localStorage.setItem(STORAGE_KEY, '1');
        } catch {}
    };

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText('WELCOME5');
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    if (!open) return null;

    return (
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-300"
            onClick={dismiss}
        >
            <div
                className="relative z-20 w-full max-w-sm rounded-3xl bg-white p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 text-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={dismiss}
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
                    <Link
                        href="/login"
                        onClick={dismiss}
                        className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer"
                    >
                        অ্যাকাউন্ট তৈরি করুন
                    </Link>
                    
                    <button
                        type="button"
                        onClick={dismiss}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                        পরে দেখব
                    </button>
                </div>

                {/* 5-second countdown progress bar */}
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
                    animation: countdown 5s linear forwards;
                }
            `}</style>
        </div>
    );
}

export default SignupOfferPopup;