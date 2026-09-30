import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Tag, Copy, CheckCircle2, Clock, Percent, ArrowLeft, ShoppingBag } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Offers({ offers = [] }: { offers: any[] }) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyToClipboard = (code: string) => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `প্রমো কোড "${code}" কপি হয়েছে! 📋`,
            showConfirmButton: false,
            timer: 2000,
        });
        setTimeout(() => setCopiedCode(null), 2500);
    };

    return (
        <>
            <Head title="My Offers — আমার স্পেশাল অফারসমূহ" />

            <div className="space-y-6 max-w-5xl">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20">
                            <Tag className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <span>My Offers (আমার অফারসমূহ)</span>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold flex items-center gap-1">
                                    <Tag size={11} /> Exclusive Deals
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                আপনার অ্যাকাউন্টের জন্য সক্রিয় সকল বিশেষ অফার, ডিসকাউন্ট ও ফ্রি কুপন কোড
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

                {/* Offers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offers.length === 0 ? (
                        <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-3 px-4">
                            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <h3 className="text-base font-bold text-slate-700">বর্তমানে কোনো অফার পাওয়া যায়নি</h3>
                            <p className="text-emerald-600 text-sm font-extrabold flex items-center justify-center gap-1.5">
                                <Tag className="w-4 h-4 text-amber-500" />
                                বেশি বেশি অর্ডার করে স্পেশাল কুপন উপভোগ করুন
                            </p>
                            <p className="text-slate-400 text-xs font-medium max-w-md mx-auto">
                                নতুন স্পেশাল অফার এলে তা আপনার নোটিফিকেশন ও My Offer সেকশনে স্বয়ংক্রিয়ভাবে দেখাবে।
                            </p>
                            <div className="pt-2">
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-500/20 transition active:scale-95"
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>এখনই কেনাকাটা শুরু করুন</span>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        offers.map((offer) => (
                            <div 
                                key={offer.id} 
                                className={`relative overflow-hidden rounded-2xl border p-6 transition-all shadow-2xs ${
                                    offer.status === 'active' 
                                        ? 'bg-white border-slate-100 hover:border-emerald-300 hover:shadow-md' 
                                        : 'bg-slate-50 border-slate-200 opacity-75'
                                }`}
                            >
                                {/* Background Glow */}
                                <div className="absolute -right-8 -top-8 w-36 h-36 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                <div className="relative z-10 space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="text-base font-black text-slate-800 leading-snug">
                                            {offer.title}
                                        </h3>
                                        {offer.discount_percentage > 0 && (
                                            <div className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-xs">
                                                <Percent className="w-3.5 h-3.5" />
                                                {offer.discount_percentage}% OFF
                                            </div>
                                        )}
                                    </div>
                                    
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        {offer.description}
                                    </p>

                                    <div className="space-y-3 pt-2">
                                        {offer.promo_code && (
                                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 border-dashed">
                                                <div className="font-mono text-base font-black text-emerald-700 tracking-wider">
                                                    {offer.promo_code}
                                                </div>
                                                <button
                                                    onClick={() => copyToClipboard(offer.promo_code)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    {copiedCode === offer.promo_code ? (
                                                        <>
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                                            <span>কপি হয়েছে!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-4 h-4" />
                                                            <span>কপি করুন</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2">
                                            {offer.valid_until ? (
                                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                                                    <span>মেয়াদ: <strong className="text-slate-700">{offer.valid_until}</strong></span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>আনলিমিটেড মেয়াদ</span>
                                                </div>
                                            )}

                                            <Link
                                                href="/"
                                                className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 hover:underline"
                                            >
                                                <ShoppingBag size={13} />
                                                <span>কেনাকাটা করুন ➔</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}