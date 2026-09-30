import React, { useState, useEffect } from 'react';
import { Zap, Clock, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

const STORAGE_KEY = 'top_notice_dismissed_until';
const DISMISS_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function TopNoticeBar() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        try {
            const dismissedUntil = localStorage.getItem(STORAGE_KEY);
            if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
                setVisible(false);
            }
        } catch (e) {
            // Fallback if localStorage fails
        }
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        try {
            localStorage.setItem(STORAGE_KEY, String(Date.now() + DISMISS_DURATION_MS));
        } catch (e) {
            // Fallback if localStorage fails
        }
    };

    if (!visible) return null;

    return (
        <div 
            style={{
                background: 'var(--theme-announcement-bg, linear-gradient(to right, var(--theme-notice-from, #6b21a8), var(--theme-notice-via, #c026d3), var(--theme-notice-to, #db2777)))',
                color: 'var(--theme-announcement-text, var(--theme-notice-text, #ffffff))',
            }}
            className="relative w-full max-w-full overflow-hidden text-[11px] sm:text-xs font-semibold py-1 sm:py-1.5 px-2.5 sm:px-4 shadow-xs flex items-center justify-between z-50 min-h-[32px] sm:min-h-[36px] leading-normal box-border"
        >
            {/* Left Badge & Text */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 py-0.5">
                <span className="bg-white/20 backdrop-blur border border-white/30 text-white px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black flex items-center gap-1 shrink-0">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-300" />
                    <span className="hidden sm:inline">লাইভ ডিল</span>
                    <span className="sm:hidden">ডিল</span>
                </span>
                <div className="flex items-center gap-1 font-bold text-white text-[10px] sm:text-xs truncate min-w-0">
                    <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300 shrink-0" />
                    <span className="truncate leading-relaxed">ফ্ল্যাশ সেল শীঘ্রই। প্রথম অর্ডারে অতিরিক্ত ২% ডিসকাউন্ট!</span>
                </div>
            </div>

            {/* Right Action Button & Close */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1.5">
                <Link
                    href="/products"
                    className="bg-white text-purple-950 hover:bg-slate-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-black flex items-center gap-1 shadow-xs transition active:scale-95 leading-none shrink-0"
                >
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-800" />
                    <span>অর্ডার</span>
                </Link>

                <button
                    onClick={handleDismiss}
                    aria-label="Close Announcement"
                    className="text-white/80 hover:text-white p-0.5 sm:p-1 rounded-full hover:bg-white/10 transition cursor-pointer shrink-0"
                    title="১৫ মিনিটের জন্য হাইড করুন"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
