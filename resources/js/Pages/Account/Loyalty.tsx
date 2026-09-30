import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Crown, Star, Zap, Gift, ShieldCheck, Award, Lock, Unlock, CheckCircle2, ArrowLeft, ChevronRight } from 'lucide-react';

interface TierData {
    name: string;
    min_orders: number;
    max_orders: number;
    badge: string;
    color?: string;
    perk: string;
}

interface LoyaltyProps {
    user?: any;
    tiers?: TierData[];
}

export default function Loyalty({ user, tiers = [] }: LoyaltyProps) {
    const currentVipLevel = user?.vip_level || 'Beginner';
    const completedOrders = user?.completed_orders_count || 0;
    const ordersToNext = user?.orders_to_next_level || 0;
    const nextVipLevel = user?.next_vip_level || null;

    const defaultTiers: TierData[] = [
        { name: 'Beginner', min_orders: 1,  max_orders: 5,   badge: '⭐', color: 'slate',   perk: '১–৫টি অর্ডার: সাধারণ কাস্টমার সুবিধা ও ২% ক্যাশব্যাক কুপন' },
        { name: 'Bronze',   min_orders: 6,  max_orders: 10,  badge: '🥉', color: 'amber',   perk: '৬–১০টি অর্ডার: ৫% অতিরিক্ত ক্যাশব্যাক ও ফ্রি ডেলিভারি ভাউচার' },
        { name: 'Silver',   min_orders: 11, max_orders: 20,  badge: '🥈', color: 'slate',   perk: '১১–২০টি অর্ডার: ৭% ক্যাশব্যাক ও স্পেশাল সাপ্তাহিক ছাড়' },
        { name: 'Gold',     min_orders: 21, max_orders: 40,  badge: '🥇', color: 'yellow',  perk: '২১–৪০টি অর্ডার: ১০% ক্যাশব্যাক ও এক্সক্লুসিভ সিক্রেট ক্যাটালগ' },
        { name: 'Platinum', min_orders: 41, max_orders: 70,  badge: '💎', color: 'indigo',  perk: '৪১–৭০টি অর্ডার: ১২% ক্যাশব্যাক ও ড্যাডিকেটেড কাস্টমার হেল্পলাইন' },
        { name: 'Diamond',  min_orders: 71, max_orders: 100, badge: '👑', color: 'purple',  perk: '৭১–১০০টি অর্ডার: ১৫% ক্যাশব্যাক ও ভিআইপি কনসিয়ার্জ উপহার' },
    ];

    const displayTiers = tiers.length > 0 ? tiers : defaultTiers;

    // Tab state for bKash style navigation bar
    const [selectedTab, setSelectedTab] = useState<string>(currentVipLevel);

    // Calculate progress percentage to next tier
    const currentTierObj = displayTiers.find(t => t.name.toLowerCase() === currentVipLevel.toLowerCase()) || displayTiers[0];
    const nextTierObj = displayTiers.find(t => t.min_orders > currentTierObj.min_orders);

    const calcProgress = () => {
        if (!nextTierObj) return 100;
        const min = currentTierObj.min_orders;
        const max = nextTierObj.min_orders;
        const current = completedOrders;
        if (current <= min) return 15;
        const percent = ((current - min) / (max - min)) * 100;
        return Math.min(100, Math.max(15, percent));
    };

    const isTierUnlocked = (tier: TierData) => {
        return completedOrders >= tier.min_orders;
    };

    const selectedTierObj = displayTiers.find(t => t.name.toLowerCase() === selectedTab.toLowerCase()) || currentTierObj;
    const selectedIsUnlocked = isTierUnlocked(selectedTierObj);

    return (
        <>
            <Head title="VIP Loyalty & Rewards - প্রোগ্রেসিভ আনলকিং রিওয়ার্ডস" />

            <div className="space-y-6 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                            <Crown className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <span>VIP Loyalty Rewards</span>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black flex items-center gap-1">
                                    <Award size={11} className="text-amber-600" />
                                    <span>লেভেল: {currentVipLevel}</span>
                                    <span>{currentTierObj.badge}</span>
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                আপনি যত বেশি কেনাকাটা করবেন, তত উচ্চমানের লেভেল ও অফার আনলক হবে!
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-sm transition active:scale-95 w-full sm:w-auto shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-400" />
                        <span>Back to Website</span>
                    </Link>
                </div>

                {/* ─── 1. BKASH-STYLE TOP TIER NAVIGATION BAR ─── */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {displayTiers.map((tier) => {
                            const isSelected = selectedTab.toLowerCase() === tier.name.toLowerCase();
                            const unlocked = isTierUnlocked(tier);
                            const isCurrent = currentVipLevel.toLowerCase() === tier.name.toLowerCase();

                            return (
                                <button
                                    key={tier.name}
                                    onClick={() => setSelectedTab(tier.name)}
                                    className={`relative py-3 px-2 text-center transition-all cursor-pointer rounded-xl flex flex-col items-center justify-between gap-1.5 border ${
                                        isSelected
                                            ? 'bg-gradient-to-b from-amber-500/10 to-orange-500/10 border-orange-400 text-orange-600 shadow-xs'
                                            : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/80 font-bold'
                                    }`}
                                >
                                    {/* Top Status Pill: Active or Lock/Unlock */}
                                    <div className="w-full flex items-center justify-between gap-1 px-1">
                                        {isCurrent ? (
                                            <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                                                ACTIVE
                                            </span>
                                        ) : (
                                            <span />
                                        )}
                                        {unlocked ? (
                                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                                                <Unlock size={10} /> আনলকড
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                                                <Lock size={10} /> লকড
                                            </span>
                                        )}
                                    </div>

                                    {/* Tier Icon & Name */}
                                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black my-0.5">
                                        <span className="text-base sm:text-lg">{tier.badge}</span>
                                        <span className="capitalize">{tier.name}</span>
                                    </div>

                                    {/* Required Orders */}
                                    <span className="text-[11px] font-extrabold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-100 w-full text-center">
                                        {tier.min_orders}–{tier.max_orders} অর্ডার
                                    </span>

                                    {/* Active Bottom Indicator Line */}
                                    {isSelected && (
                                        <div className="w-10 h-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full mt-0.5" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ─── 2. BKASH-STYLE MAIN REWARDS GOLDEN CARD ─── */}
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-500/20 relative overflow-hidden space-y-6">
                    <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Row: User Name & Order/Points Counter */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-amber-100/90">
                                CUSTOMER REWARDS MEMBER
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                                {user?.name || 'Customer'}
                            </h2>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black border border-white/30 flex items-center gap-1.5 shadow-sm self-start sm:self-auto">
                            <Star className="w-4 h-4 text-amber-200 fill-amber-200" />
                            <span>{completedOrders} Orders Completed</span>
                        </div>
                    </div>

                    {/* Level Name */}
                    <div className="text-center relative z-10 space-y-1">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs sm:text-sm font-black tracking-wider uppercase shadow-xs">
                            <span>{currentTierObj.badge}</span>
                            <span>CURRENT TIER: {currentVipLevel}</span>
                        </div>
                    </div>

                    {/* Progress Bar (bKash Rewards Style) */}
                    <div className="relative z-10 max-w-xl mx-auto space-y-2 text-center">
                        <div className="w-full bg-black/25 rounded-full h-3.5 p-0.5 overflow-hidden border border-white/20">
                            <div
                                className="bg-gradient-to-r from-yellow-200 to-white h-full rounded-full transition-all duration-700 shadow-md"
                                style={{ width: `${calcProgress()}%` }}
                            />
                        </div>

                        {nextTierObj ? (
                            <p className="text-xs sm:text-sm text-amber-100 font-bold">
                                আরও <span className="text-white text-base font-black underline">{Math.max(1, nextTierObj.min_orders - completedOrders)}টি</span> অর্ডার সম্পন্ন করলেই পরবর্তী <span className="text-white uppercase font-black">{nextTierObj.name}</span> লেভেল আনলক হবে! 🚀
                            </p>
                        ) : (
                            <p className="text-xs sm:text-sm text-white font-extrabold">
                                🎉 অভিনন্দিত! আপনি সর্বোচ্চ ভিআইপি ডায়মন্ড লেভেল আনলক করেছেন!
                            </p>
                        )}
                        <p className="text-[11px] text-amber-100/90 font-medium">
                            *অর্ডার সম্পন্ন হওয়ার সাথে সাথে লেভেলের প্রগ্রেস স্বয়ংক্রিয়ভাবে আপডেট হয়।
                        </p>
                    </div>
                </div>

                {/* ─── 3. SELECTED TIER CATALOG & OFFERS ─── */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{selectedTierObj.badge}</span>
                            <div>
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <span>{selectedTierObj.name} Level Offers Catalog</span>
                                    {selectedIsUnlocked ? (
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center gap-1">
                                            <CheckCircle2 size={12} /> UNLOCKED
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold flex items-center gap-1">
                                            <Lock size={12} /> LOCKED
                                        </span>
                                    )}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    প্রয়োজনীয় অর্ডার সংখ্যা: {selectedTierObj.min_orders} থেকে {selectedTierObj.max_orders} টি
                                </p>
                            </div>
                        </div>

                        {!selectedIsUnlocked && (
                            <div className="text-right">
                                <span className="text-xs font-bold text-rose-500 block">
                                    আরও {Math.max(1, selectedTierObj.min_orders - completedOrders)}টি অর্ডার বাকি
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Offer Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-5 rounded-2xl border transition ${
                            selectedIsUnlocked
                                ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                                    <Gift size={20} />
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                                    selectedIsUnlocked ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                                }`}>
                                    {selectedIsUnlocked ? 'ক্লেম করুন (Claimed)' : 'লকড (Locked)'}
                                </span>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-800 mb-1">
                                {selectedTierObj.perk}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                                এই সুবিধাটি {selectedTierObj.name} লেভেলের সকল কাস্টমারদের অর্ডারে স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে যাবে।
                            </p>
                        </div>

                        <div className={`p-5 rounded-2xl border transition ${
                            selectedIsUnlocked
                                ? 'bg-indigo-50/50 border-indigo-200 text-slate-800'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-bold shadow-xs">
                                    <Zap size={20} />
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                                    selectedIsUnlocked ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
                                }`}>
                                    {selectedIsUnlocked ? 'একটিভ (Active)' : 'লকড (Locked)'}
                                </span>
                            </div>
                            <h4 className="font-extrabold text-sm text-slate-800 mb-1">
                                এক্সক্লুসিভ ক্যাশব্যাক ও প্রায়োরিটি সাপোর্ট
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                                প্রোডাক্ট ক্যাটালগে বিশেষ ছাড় এবং ডেলিভারি চার্জে স্পেশাল রিফান্ড সুবিধা।
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── 4. FULL PROGRESSIVE UNLOCKING ROADMAP TABLE ─── */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-2xs space-y-4">
                    <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>VIP Loyalty Tier Rules & Roadmap (ভিআইপি আনলকিং চার্ট)</span>
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-extrabold uppercase">
                                    <th className="p-3">লেভেল (Level)</th>
                                    <th className="p-3">অর্ডার সংখ্যা (Orders Required)</th>
                                    <th className="p-3">আনলক সুবিধা (Perks & Cashback)</th>
                                    <th className="p-3 text-right">অবস্থা (Status)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayTiers.map((t) => {
                                    const unlocked = isTierUnlocked(t);
                                    const isCurrent = currentVipLevel.toLowerCase() === t.name.toLowerCase();

                                    return (
                                        <tr key={t.name} className={`hover:bg-slate-50/80 transition ${isCurrent ? 'bg-amber-50/50 font-bold' : ''}`}>
                                            <td className="p-3 flex items-center gap-2 font-bold text-slate-800">
                                                <span>{t.badge}</span>
                                                <span className="capitalize">{t.name}</span>
                                            </td>
                                            <td className="p-3 font-extrabold text-slate-700">
                                                {t.min_orders}–{t.max_orders} টি অর্ডার
                                            </td>
                                            <td className="p-3 text-slate-600 font-medium">
                                                {t.perk}
                                            </td>
                                            <td className="p-3 text-right">
                                                {unlocked ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                                                        <CheckCircle2 size={12} /> UNLOCKED
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-500">
                                                        <Lock size={12} /> LOCKED
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
}
