import React from 'react';
import { Megaphone } from 'lucide-react';

const DEFAULT_NOTICES = [
    <span>🎉 <span className="notranslate" translate="no">Guruz</span>-এ স্বাগতম — বাংলাদেশের #১ মাল্টি-ভেন্ডর মার্কেটপ্লেস</span>,
    "🚚 স্মার্ট অনলাইন ওয়ারেন্টি ক্লেইম সার্ভিস ও অফিশিয়াল প্রোডাক্ট সাপোর্ট",
    "💰 সারাদেশে ক্যাশ অন ডেলিভারি এবং দ্রুততম হোম ডেলিভারি সুবিধা",
    "🏆 ১০০% আসল ও অরিজিনাল গ্যাজেটের নিশ্চয়তা",
    "📞 সাপোর্ট হটলাইন: 01700000000",
];

export function NoticeMarquee() {
    const loop = [...DEFAULT_NOTICES, ...DEFAULT_NOTICES];

    return (
        <div
            style={{
                background: 'linear-gradient(to right, var(--theme-notice-from, #fbbf24), var(--theme-notice-via, #f97316), var(--theme-notice-to, #f43f5e))',
                color: 'var(--theme-notice-text, #ffffff)',
            }}
            className="relative overflow-hidden shadow-inner"
        >
            <div className="flex items-center gap-3 px-3 py-1.5 sm:py-2">
                <div className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/25 backdrop-blur text-[11px] sm:text-xs font-black uppercase tracking-wider">
                    <Megaphone className="w-3.5 h-3.5 animate-bounce" />
                    নোটিশ
                </div>
                <div className="relative flex-1 overflow-hidden">
                    <div
                        className="flex whitespace-nowrap will-change-transform"
                        style={{ animation: `notice-marquee 35s linear infinite` }}
                    >
                        {loop.map((text, i) => (
                            <span key={i} className="inline-flex items-center gap-2 pr-10 text-xs sm:text-sm font-bold drop-shadow-xs">
                                <span>{text}</span>
                                <span className="opacity-60">•</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <style>{`@keyframes notice-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        </div>
    );
}