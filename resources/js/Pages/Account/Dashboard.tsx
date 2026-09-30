import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ShoppingBag, Zap, Package, DollarSign, Copy,
    Gift, ChevronRight, Heart, MessageCircle, UserCircle, Award, Bell,
    Clock, ShieldAlert
} from 'lucide-react';
import { usePage } from '@inertiajs/react';

interface BonusCoupon {
    id?: number;
    code: string;
    type?: string;
    discount: number;
    min_order_amount?: number;
    max_discount_amount?: number;
    expires_at?: string;
    valid_till: string;
    remaining_seconds?: number;
}

interface DashboardProps {
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
    stats: {
        total_orders:  number;
        in_progress:   number;
        delivered:     number;
        total_spent:   number;
    };
    recent_orders: {
        id: number;
        order_number: string;
        total: number;
        status: string;
        created_at: string;
        items_count: number;
    }[];
    coupons: BonusCoupon[];
    bonus_coupon_enabled?: boolean;
    bonus_coupon_message?: {
        title?: string;
        description?: string;
        badge?: string;
        icon?: string;
    };
}

function CouponCountdownTimer({ expiresAt }: { expiresAt?: string }) {
    const calculateTimeRemaining = () => {
        if (!expiresAt) return null;
        const target = new Date(expiresAt).getTime();
        const now = Date.now();
        const diff = target - now;

        if (isNaN(target) || diff <= 0) {
            return { isExpired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
        }

        const totalHours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return { isExpired: false, days, hours, minutes, seconds, totalHours };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeRemaining);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeRemaining());
        }, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    if (!timeLeft) return null;

    if (timeLeft.isExpired) {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold">
                <span>⚠️</span> কুপনটির মেয়াদ শেষ হয়ে গেছে
            </div>
        );
    }

    const isUrgent = timeLeft.totalHours < 24;

    return (
        <div className="space-y-1.5 w-full">
            <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-500 animate-pulse' : 'text-indigo-600'}`} />
                    <span>মেয়াদ বাকি আছে:</span>
                </span>
                {isUrgent && (
                    <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                        🔥 দ্রুত শেষ হচ্ছে!
                    </span>
                )}
            </div>

            {/* Countdown Digital Pills */}
            <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                <div className="bg-slate-900 text-white rounded-lg py-1 px-0.5 shadow-xs">
                    <span className="block text-xs sm:text-sm font-black leading-tight">{String(timeLeft.days).padStart(2, '0')}</span>
                    <span className="block text-[8px] sm:text-[9px] text-slate-400 font-sans uppercase">দিন</span>
                </div>
                <div className="bg-slate-900 text-white rounded-lg py-1 px-0.5 shadow-xs">
                    <span className="block text-xs sm:text-sm font-black leading-tight">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="block text-[8px] sm:text-[9px] text-slate-400 font-sans uppercase">ঘণ্টা</span>
                </div>
                <div className="bg-slate-900 text-white rounded-lg py-1 px-0.5 shadow-xs">
                    <span className="block text-xs sm:text-sm font-black leading-tight">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="block text-[8px] sm:text-[9px] text-slate-400 font-sans uppercase">মিনিট</span>
                </div>
                <div className="bg-slate-900 text-amber-400 rounded-lg py-1 px-0.5 shadow-xs">
                    <span className="block text-xs sm:text-sm font-black leading-tight">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="block text-[8px] sm:text-[9px] text-slate-400 font-sans uppercase">সেকেন্ড</span>
                </div>
            </div>
        </div>
    );
}

export default function CustomerDashboard({ user, stats, recent_orders = [], coupons = [], bonus_coupon_message }: DashboardProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).catch(() => {});
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const statusColor: Record<string, string> = {
        pending:    'text-yellow-600',
        processing: 'text-blue-600',
        shipped:    'text-purple-600',
        delivered:  'text-emerald-600',
        cancelled:  'text-red-500',
    };

    const statCards = [
        { label: 'Total Orders', value: stats.total_orders, icon: ShoppingBag, gradient: 'from-blue-500 to-blue-600' },
        { label: 'In Progress',  value: stats.in_progress,  icon: Zap,         gradient: 'from-orange-400 to-orange-500' },
        { label: 'Delivered',    value: stats.delivered,    icon: Package,      gradient: 'from-emerald-400 to-teal-500' },
        { label: 'Total Spent',  value: `৳${Number(stats.total_spent).toLocaleString()}`, icon: DollarSign, gradient: 'from-fuchsia-500 to-pink-500' },
    ];

    const { auth } = usePage<any>().props;
    const authUser = auth?.user;
    const unreadMessagesCount = auth?.unread_messages_count ?? 0;
    const rawUnreadNotifs = auth?.unread_notifications_count ?? (authUser?.unread_notifications_count ?? 0);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(rawUnreadNotifs);

    useEffect(() => {
        setUnreadNotificationsCount(rawUnreadNotifs);
    }, [rawUnreadNotifs]);

    useEffect(() => {
        const handleCleared = () => {
            setUnreadNotificationsCount(0);
        };
        window.addEventListener('customer-notifications-cleared', handleCleared);
        return () => window.removeEventListener('customer-notifications-cleared', handleCleared);
    }, []);

    const quickLinks = [
        { label: 'My Orders', href: '/account/orders',  icon: ShoppingBag,   color: 'text-blue-500', badge: 0 },
        { label: 'Notifications', href: '/account/notifications', icon: Bell, color: 'text-rose-500', badge: unreadNotificationsCount, isRedBadge: true },
        { label: 'Messages',  href: '/account/messages', icon: MessageCircle,  color: 'text-emerald-500', badge: unreadMessagesCount, isRedBadge: false },
        { label: 'Wishlist',  href: '/account/favorites', icon: Heart,         color: 'text-purple-500', badge: 0 },
        { label: 'Profile',   href: '/account/profile',  icon: UserCircle,     color: 'text-sky-500', badge: 0 },
    ];

    const profileValues = [
        authUser?.name,
        authUser?.email,
        authUser?.phone,
        authUser?.address,
        (authUser?.birthday || authUser?.date_of_birth)
    ];
    const completedCount = profileValues.filter(v => v && String(v).trim().length > 0).length;
    const profileCompletion = authUser?.profile_completion_percentage ?? Math.round((completedCount / profileValues.length) * 100);
    
    // VIP Calculation
    const totalOrders = (authUser?.completed_orders_count || 0);
    const vipLevel = authUser?.vip_level || 'Beginner';
    const nextVipLevel = authUser?.next_vip_level || null;
    const toNext = authUser?.orders_to_next_level || 0;

    const tierBadges: Record<string, string> = {
        beginner: '⭐',
        bronze: '🥉',
        silver: '🥈',
        gold: '🥇',
        platinum: '💎',
        diamond: '👑',
    };
    const currentTierBadge = tierBadges[(vipLevel || 'beginner').toLowerCase()] || '⭐';
    const nextTierBadge = nextVipLevel ? (tierBadges[nextVipLevel.toLowerCase()] || '⭐') : '';

    const getVipProgress = (count: number, level: string) => {
        let currentMin = 0;
        let nextMin = 6;
        switch ((level || 'beginner').toLowerCase()) {
            case 'beginner': currentMin = 0; nextMin = 6; break;
            case 'bronze': currentMin = 6; nextMin = 11; break;
            case 'silver': currentMin = 11; nextMin = 21; break;
            case 'gold': currentMin = 21; nextMin = 41; break;
            case 'platinum': currentMin = 41; nextMin = 71; break;
            case 'diamond': return 100;
            default: currentMin = 0; nextMin = 6;
        }
        const range = nextMin - currentMin;
        const current = count - currentMin;
        return Math.min(100, Math.max(5, (current / range) * 100));
    };

    const progressPercent = getVipProgress(totalOrders, vipLevel);

    return (
        <>

            <Head title="My Dashboard — Guruz" />

            <div className="space-y-5 max-w-4xl">

                {/* Page Title */}
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Dashboard</h1>

                {/* ─── VIP LOYALTY CARD ─── */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-700">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
                        <Award className="w-48 h-48 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h2 className="text-xl font-black text-white flex items-center justify-center md:justify-start gap-2">
                                <Award className="w-6 h-6 text-amber-400" />
                                VIP Loyalty Program
                            </h2>
                            <p className="text-slate-300 text-sm font-medium flex items-center justify-center md:justify-start gap-1.5">
                                <span>Current Level:</span>
                                <span className="inline-flex items-center gap-1 font-black text-amber-400 uppercase tracking-widest bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                                    <span>{currentTierBadge}</span>
                                    <span>{vipLevel}</span>
                                </span>
                            </p>
                            {nextVipLevel ? (
                                <p className="text-slate-400 text-xs mt-1">
                                    Complete <strong className="text-white">{toNext}</strong> more orders to reach <strong className="text-white capitalize">{nextTierBadge} {nextVipLevel}</strong>!
                                </p>
                            ) : (
                                <p className="text-emerald-400 text-xs mt-1 font-bold">
                                    🎉 You have unlocked the highest VIP Diamond tier!
                                </p>
                            )}
                        </div>
                        <div className="w-full md:w-1/2">
                            <div className="bg-slate-800 rounded-full h-3 w-full overflow-hidden border border-slate-700 shadow-inner">
                                <div 
                                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full transition-all duration-1000" 
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="capitalize">{currentTierBadge} {vipLevel} Member</span>
                                <span className="capitalize">{nextVipLevel ? `${nextTierBadge} ${nextVipLevel} Member` : '👑 Max Tier'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── PROFILE COMPLETION CARD ─── */}
                <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-slate-50 border-2 border-slate-100 shrink-0">
                            <svg className="w-14 h-14 absolute transform -rotate-90">
                                <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                                <circle 
                                    cx="28" cy="28" r="26" 
                                    stroke="currentColor" 
                                    strokeWidth="4" 
                                    fill="transparent" 
                                    strokeDasharray="163" 
                                    strokeDashoffset={163 - (163 * profileCompletion) / 100} 
                                    className="text-emerald-500 transition-all duration-1000" 
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="text-sm font-black text-slate-700 z-10">{profileCompletion}%</span>
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="font-extrabold text-slate-900 text-sm">Profile Completion ( {profileCompletion} % )</h3>
                            <p className="text-xs text-slate-500 mt-0.5 font-medium leading-snug">
                                {profileCompletion < 100 
                                    ? 'Update your name, email, phone, address, and date of birth to be 100% complete.' 
                                    : 'অভিনন্দন! আপনার প্রোফাইল ১০০% সম্পূর্ণ হয়েছে।'}
                            </p>
                        </div>
                    </div>
                    {profileCompletion < 100 ? (
                        <Link href="/account/profile" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition w-full sm:w-auto text-center shrink-0 shadow-md">
                            Edit now ➔
                        </Link>
                    ) : (
                        <div className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0">
                            <span>🎉</span> 100% Completed
                        </div>
                    )}
                </div>

                {/* ─── RAINBOW COUPON CARD ─── */}
                <div className="relative p-[2px] rounded-2xl shadow-md"
                     style={{ background: 'linear-gradient(90deg, #f472b6, #a855f7, #3b82f6, #10b981, #facc15, #f97316)' }}>
                    <div className="bg-gradient-to-br from-yellow-50 via-white to-pink-50 rounded-2xl p-4 sm:p-5 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Gift className="w-5 h-5 text-fuchsia-500" />
                                <span className="font-black text-base text-slate-800">My Bonus Coupons</span>
                            </div>
                            {coupons.length > 0 && (
                                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200">
                                    {coupons.length}টি কুপন সক্রিয়
                                </span>
                            )}
                        </div>

                        {/* Coupons List */}
                        <div className="space-y-3 max-h-[32rem] overflow-y-auto pr-1">
                            {coupons.length > 0 && (
                                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-2.5">
                                    <span className="text-xl">🎉</span>
                                    <div>
                                        <h5 className="text-xs font-black text-emerald-950">অভিনন্দন! আপনার জন্য বিশেষ উপহার কুপন প্রস্তুত</h5>
                                        <p className="text-[11px] font-semibold text-emerald-700">কুপন কোডটি কপি করে চেকআউটে ব্যবহার করুন এবং আকর্ষণীয় ছাড় উপভোগ করুন।</p>
                                    </div>
                                </div>
                            )}

                            {coupons.length > 0 ? coupons.map((cpn, idx) => (
                                <div key={idx} className="border-2 border-dashed border-indigo-200 rounded-xl p-3.5 sm:p-4 bg-white space-y-3 shadow-xs">
                                    {/* Top Row: Badge & ID */}
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md tracking-wider uppercase">
                                            🎁 Welcome Bonus
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-400">
                                            আইডি: #{cpn.id || idx + 1}
                                        </span>
                                    </div>

                                    {/* Discount amount & label */}
                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                        <span className="text-3xl font-black text-indigo-700 tracking-tight">
                                            {cpn.type === 'fixed' ? `৳${cpn.discount}` : `${cpn.discount}%`}
                                        </span>
                                        <span className="text-xs font-bold text-slate-600">
                                            {cpn.type === 'fixed' ? 'ফ্ল্যাট ছাড় (পরবর্তী অর্ডারে)' : 'ছাড় (পরবর্তী অর্ডারে)'}
                                        </span>
                                    </div>

                                    {/* Limitations & Conditions Pills */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                                            <span>🛒</span>
                                            <span>
                                                {Number(cpn.min_order_amount) > 0
                                                    ? `সর্বনিম্ন অর্ডার: ৳${Number(cpn.min_order_amount).toLocaleString()}`
                                                    : 'যেকোনো মূল্যের অর্ডারে প্রযোজ্য'}
                                            </span>
                                        </div>

                                        {Number(cpn.max_discount_amount) > 0 && (
                                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg">
                                                <span>🛡️</span>
                                                <span>সর্বোচ্চ ছাড় সীমা: ৳{Number(cpn.max_discount_amount).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Code & Copy Button (Mobile optimized) */}
                                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                        <code className="text-xs sm:text-sm font-black text-slate-900 tracking-widest pl-1 select-all font-mono truncate">
                                            {cpn.code}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(cpn.code)}
                                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-lg transition border border-slate-200 shadow-2xs flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
                                            title="Copy Code"
                                        >
                                            {copiedCode === cpn.code ? (
                                                <span className="text-emerald-600 font-black flex items-center gap-1">
                                                    ✓ কপি হয়েছে!
                                                </span>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>কপি কোড</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Live Countdown Timer */}
                                    <div className="pt-2 border-t border-dashed border-slate-100">
                                        <CouponCountdownTimer expiresAt={cpn.expires_at} />
                                    </div>

                                    {/* Expiry Datetime info */}
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-0.5">
                                        <span>📅 শেষ সময়:</span>
                                        <span className="font-semibold text-slate-600">{cpn.valid_till}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-7 px-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/80 border-2 border-dashed border-indigo-200/90 rounded-2xl relative overflow-hidden shadow-2xs">
                                    <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center text-xl shadow-md shadow-orange-500/20 mb-3 animate-bounce">
                                        {bonus_coupon_message?.icon || '🎁'}
                                    </div>
                                    <h4 className="text-sm sm:text-base font-black text-slate-800 mb-1.5 flex items-center justify-center gap-1.5">
                                        <span>{bonus_coupon_message?.title || 'প্রিয় গ্রাহক, আমাদের সাথেই থাকুন!'}</span>
                                    </h4>
                                    <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-md mx-auto leading-relaxed">
                                        {bonus_coupon_message?.description || 'আপনার জন্য আকর্ষণীয় বোনাস কুপন ও স্পেশাল সারপ্রাইজ অফার খুব শীঘ্রই আসছে। নিয়মিত কেনাকাটায় চোখ রাখুন দারুণ সব ছাড়ে!'}
                                    </p>
                                    {(bonus_coupon_message?.badge || bonus_coupon_message?.badge === undefined) && (
                                        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-indigo-100 text-indigo-700 text-[11px] font-bold shadow-2xs">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                                            <span>{bonus_coupon_message?.badge || 'ধামাকা অফার লোড হচ্ছে...'}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Unlock hint */}
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                            <span className="text-base">🎁</span>
                            <p className="text-xs text-amber-700">
                                <span className="font-black">Unlock +2% extra bonus:</span> complete your phone, birthday in profile.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── STAT CARDS ─── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {statCards.map(s => (
                        <div
                            key={s.label}
                            className={`bg-gradient-to-br ${s.gradient} text-white rounded-2xl p-4 md:p-5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default`}
                        >
                            <s.icon className="w-6 h-6 md:w-7 md:h-7 opacity-80 mb-2 md:mb-3" />
                            <p className="text-2xl md:text-3xl font-black leading-none truncate">{s.value}</p>
                            <p className="text-[10px] md:text-xs font-semibold opacity-80 mt-1 truncate">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* ─── QUICK LINKS ─── */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-3 md:gap-4">
                    {quickLinks.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex flex-col items-center gap-1.5 sm:gap-2 bg-white rounded-xl sm:rounded-2xl p-2 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group relative border border-slate-100"
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 group-hover:bg-slate-100 flex items-center justify-center transition relative shrink-0">
                                <link.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${link.color}`} />
                                {link.badge !== undefined && link.badge > 0 && (
                                    <span className={`absolute -top-1 -right-1 min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 flex items-center justify-center px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-black rounded-full shadow-sm animate-pulse ${
                                        link.isRedBadge ? 'bg-red-500 text-white shadow-md shadow-red-500/40' : 'bg-orange-500 text-white'
                                    }`}>
                                        {link.badge > 99 ? '99+' : link.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-700 truncate w-full text-center">{link.label}</span>
                        </Link>
                    ))}
                </div>

                {/* ─── RECENT ORDERS ─── */}
                <div className="bg-white rounded-2xl shadow-xs overflow-hidden">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                        <h2 className="font-black text-base text-slate-900">Recent Orders</h2>
                        <Link href="/account/orders" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
                            View all <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {recent_orders.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {recent_orders.map(order => (
                                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{order.order_number}</p>
                                        <p className="text-xs text-slate-400 font-medium">{new Date(order.created_at).toLocaleDateString('bn-BD')}</p>
                                    </div>
                                    <p className="font-black text-sm text-emerald-600">৳{Number(order.total).toLocaleString()}</p>
                                    <span className={`text-xs font-bold capitalize ${statusColor[order.status] ?? 'text-slate-500'}`}>
                                        {order.status}
                                    </span>
                                    <Link href={`/account/orders/${order.id}`} className="text-xs font-bold text-blue-500 hover:underline">
                                        View
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-14 text-center">
                            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                            <p className="text-sm font-semibold text-slate-400">No orders yet.</p>
                        </div>
                    )}
                </div>

            </div>
        
</>
    );
}
