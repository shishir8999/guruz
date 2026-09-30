import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Wallet as WalletIcon, Gift, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
    ShoppingCart, Trophy, Flame, Zap, CheckCircle2, ChevronRight
} from 'lucide-react';

interface Transaction {
    id: number;
    type: 'credit' | 'debit';
    amount: number | string;
    description: string;
    created_at: string;
}

interface WalletProps {
    wallet?: {
        balance: number;
        total_earned: number;
        total_spent: number;
    };
    transactions?: Transaction[];
}

export default function Wallet({ wallet, transactions = [] }: WalletProps) {
    const balance = wallet?.balance ?? 100;
    const totalEarned = wallet?.total_earned ?? 100;
    const totalSpent = wallet?.total_spent ?? 0;

    // Helper to format numbers in Bengali digits
    const toBengaliNumber = (num: number | string) => {
        const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(num).replace(/\d/g, (digit) => bengaliDigits[parseInt(digit)]);
    };

    return (
        <>
            <Head title="My Wallet - আমার ওয়ালেট — Guruz" />

            <div className="space-y-6 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                            <WalletIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Guruz Wallet
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                                আপনার রিওয়ার্ড ব্যালেন্স ও ক্যাশব্যাক ওয়ালেট
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── 1. GREEN GRADIENT BALANCE CARD ─── */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-600/20 space-y-6 relative overflow-hidden">
                    {/* Glowing decorative circles */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute top-0 right-1/4 w-32 h-32 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-200 bg-emerald-800/40 px-3 py-1 rounded-full inline-block">
                                বর্তমান ওয়ালেট ব্যালেন্স
                            </span>
                            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-xs flex items-baseline gap-1 pt-1">
                                <span>৳{toBengaliNumber(balance)}</span>
                                <span className="text-sm sm:text-base font-bold text-emerald-200">টাকা</span>
                            </div>
                        </div>

                        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 sm:max-w-xs space-y-1">
                            <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
                                <Zap size={14} className="text-amber-300" />
                                <span>অর্ডার ডিসকাউন্ট লিমিট</span>
                            </p>
                            <p className="text-sm font-black text-white">
                                প্রতি অর্ডারে সর্বোচ্চ ৳১০ ব্যবহারযোগ্য
                            </p>
                        </div>
                    </div>

                    {/* Stats sub-boxes */}
                    <div className="grid grid-cols-2 gap-4 relative z-10 pt-2 border-t border-white/15">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 transition hover:bg-white/15">
                            <p className="text-xs text-emerald-100 font-semibold">সর্বমোট অর্জিত বোনাস</p>
                            <p className="text-xl sm:text-2xl font-black text-white mt-1">
                                ৳{toBengaliNumber(totalEarned)}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 transition hover:bg-white/15">
                            <p className="text-xs text-emerald-100 font-semibold">মোট ব্যবহৃত ডিসকাউন্ট</p>
                            <p className="text-xl sm:text-2xl font-black text-white mt-1">
                                ৳{toBengaliNumber(totalSpent)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── 2. INSPIRING MOTIVATIONAL OFFER CARD ─── */}
                <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-rose-50/70 rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 shadow-sm space-y-6 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-40 h-40 bg-amber-300/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -translate-x-8 translate-y-8 w-40 h-40 bg-orange-300/20 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                        {/* Inspiring Headline */}
                        <div className="flex items-start gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/25 shrink-0">
                                <Gift size={24} />
                            </div>
                            <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-200/60 text-amber-900 uppercase tracking-wider">
                                    <Trophy size={13} className="text-amber-700" />
                                    <span>Special Offer & Rewards</span>
                                </span>
                                <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                                    বেশি বেশি অর্ডার করে জিতে নিন সব আকর্ষণীয় পুরস্কার ও ক্যাশব্যাক!
                                </h2>
                            </div>
                        </div>

                        {/* Highlighting Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {/* Feature 1: 100 Tk Offer */}
                            <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-amber-200/70 shadow-2xs space-y-1.5 flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                                    <Gift size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                                        ৳১০০ স্পেশাল ওয়ালেট অফার
                                    </h3>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Guruz-এ যোগ দিয়েই আপনি পেয়েছেন ৳১০০ ওয়েলকাম অফার ব্যালেন্স।
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2: 10 Tk per order */}
                            <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-amber-200/70 shadow-2xs space-y-1.5 flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                                        প্রতি অর্ডারে ৳১০ ক্যাশ ছাড়
                                    </h3>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        প্রতিটি অর্ডারে কোনো জটিল শর্ত ছাড়াই সর্বোচ্চ ১০ টাকা সরাসরি ছাড় হিসেবে ব্যবহার করুন।
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-amber-200/60">
                            <p className="text-xs font-bold text-slate-700 text-center sm:text-left">
                                🛒 এখনই আপনার পছন্দের পণ্য কার্টে যোগ করে ওয়ালেট ছাড় উপভোগ করুন!
                            </p>
                            <Link
                                href="/products"
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition active:scale-95 shrink-0"
                            >
                                <span>পণ্য ব্রাউজ করুন</span>
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ─── 3. RECENT TRANSACTIONS CARD ─── */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-base sm:text-lg font-black text-slate-900">
                            সাম্প্রতিক ওয়ালেট লেনদেন
                        </h2>
                        <span className="text-xs font-bold text-slate-400">
                            মোট {transactions.length} টি রেকর্ড
                        </span>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                                <Gift size={24} />
                            </div>
                            <p className="text-sm font-bold text-slate-700">এখনও কোনো লেনদেন হয়নি</p>
                            <p className="text-xs text-slate-400">অর্ডার করার সাথে সাথে আপনার ব্যবহারের ইতিহাস এখানে দেখা যাবে।</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => {
                                const isCredit = tx.type === 'credit';
                                const formattedDate = new Date(tx.created_at).toLocaleString('bn-BD', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                });

                                return (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between p-4 bg-slate-50/70 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all duration-200 gap-3"
                                    >
                                        {/* Left Side */}
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black ${
                                                isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                            }`}>
                                                {isCredit ? <Gift size={20} /> : <ArrowDownLeft size={20} />}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                                    {tx.description || (isCredit ? 'ওয়েলকাম অফার বোনাস' : 'অর্ডারে ওয়ালেট ডিসকাউন্ট ব্যবহার')}
                                                </h3>
                                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                                    {formattedDate}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Right Side: Amount */}
                                        <div className="text-right shrink-0">
                                            <span className={`text-sm sm:text-base font-black ${
                                                isCredit ? 'text-emerald-600' : 'text-rose-600'
                                            }`}>
                                                {isCredit ? '+' : '-'}৳{toBengaliNumber(tx.amount)}
                                            </span>
                                            <span className={`block text-[10px] font-bold uppercase tracking-wider ${
                                                isCredit ? 'text-emerald-600' : 'text-slate-400'
                                            }`}>
                                                {isCredit ? 'অর্জিত' : 'ব্যবহৃত'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
