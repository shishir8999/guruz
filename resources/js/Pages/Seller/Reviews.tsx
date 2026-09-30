import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { 
    Search, Star, CheckCircle2, XCircle, 
    AlertCircle, User, Mail, ExternalLink 
} from 'lucide-react';

interface ReviewItem {
    id: number;
    type: string;
    rating: number;
    date: string;
    product_name: string;
    product_slug: string;
    product_image?: string | null;
    comment: string;
    user_name: string;
    user_email: string;
    is_guest: boolean;
    status: 'Pending' | 'Approved' | 'Rejected';
    seller_reply?: string | null;
}

export default function Reviews({ initialReviews = [] }: { initialReviews: ReviewItem[] }) {
    const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews || []);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

    React.useEffect(() => {
        setReviews(initialReviews || []);
    }, [initialReviews]);

    const totalReviews = reviews.length;
    const pendingCount = reviews.filter(r => r.status === 'Pending').length;
    const approvedCount = reviews.filter(r => r.status === 'Approved').length;
    const avgRating = totalReviews > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
        : '5.0';

    const filteredReviews = reviews.filter(r => {
        const matchesSearch = 
            r.product_name.toLowerCase().includes(search.toLowerCase()) || 
            r.comment.toLowerCase().includes(search.toLowerCase()) ||
            r.user_name.toLowerCase().includes(search.toLowerCase()) ||
            r.user_email.toLowerCase().includes(search.toLowerCase());

        if (activeTab === 'Pending') return matchesSearch && r.status === 'Pending';
        if (activeTab === 'Approved') return matchesSearch && r.status === 'Approved';
        if (activeTab === 'Rejected') return matchesSearch && r.status === 'Rejected';
        return matchesSearch;
    });

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                        key={s} 
                        className={`w-4 h-4 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} 
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <Head title="Customer Reviews" />

            <div className="max-w-7xl mx-auto space-y-6 pb-16">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                <Star className="w-5 h-5 fill-amber-500" />
                            </div>
                            কাস্টমার রিভিউ (Customer Reviews)
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            আপনার প্রোডাক্টের পাবলিক রিভিউ ও রেটিং দেখুন। (রিভিউ অনুমোদন বা রিজেক্টের সিদ্ধান্ত সুপার এডমিন কর্তৃক পরিচালিত হয়)
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs">
                                ★
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-900 dark:text-white">{avgRating} / 5.0</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Rating</div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-xs">
                                {pendingCount}
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-900 dark:text-white">{pendingCount} টি অপেক্ষমাণ</div>
                                <div className="text-[10px] font-bold text-orange-500 uppercase">Pending Approval</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
                        {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                    activeTab === tab 
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' 
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                {tab === 'All' && `সকল (${totalReviews})`}
                                {tab === 'Pending' && `অপেক্ষমাণ (${pendingCount})`}
                                {tab === 'Approved' && `অনুমোদিত (${approvedCount})`}
                                {tab === 'Rejected' && `বাতিল`}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="প্রোডাক্ট, নাম অথবা ইমেইল..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {/* Reviews List */}
                {filteredReviews.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center text-2xl">
                            💬
                        </div>
                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">কোনো রিভিউ পাওয়া যায়নি</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            কাস্টমাররা আপনার প্রোডাক্টে রিভিউ দিলে এখানে শো করবে এবং সুপার এডমিনের অনুমোদনের পর তা ওয়েবসাইটে লাইভ হবে।
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredReviews.map((r) => (
                            <div 
                                key={r.id}
                                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all shadow-xs ${
                                    r.status === 'Pending' 
                                        ? 'border-orange-300 dark:border-orange-500/40 ring-1 ring-orange-500/20' 
                                        : r.status === 'Approved'
                                        ? 'border-emerald-200 dark:border-emerald-800/40'
                                        : 'border-slate-200 dark:border-slate-800 opacity-75'
                                }`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Left: Product & Reviewer Info */}
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3">
                                            {r.product_image && (
                                                <img 
                                                    src={r.product_image} 
                                                    alt="" 
                                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-50"
                                                />
                                            )}
                                            <div>
                                                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <span>{r.product_name}</span>
                                                    {r.product_slug && (
                                                        <a 
                                                            href={`/products/${r.product_slug}`} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="text-slate-400 hover:text-emerald-500"
                                                            title="প্রোডাক্ট পেজ দেখুন"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {renderStars(r.rating)}
                                                    <span className="text-[11px] font-black text-amber-500">{r.rating}.0 Star</span>
                                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                                    <span className="text-[11px] text-slate-400 font-medium">{r.date}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Comment Body */}
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                            "{r.comment}"
                                        </div>

                                        {/* Reviewer Details */}
                                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3.5 h-3.5 text-slate-400" />
                                                <strong>{r.user_name}</strong>
                                                {r.is_guest ? (
                                                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md">পাবলিক ভিজিটর</span>
                                                ) : (
                                                    <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md">রেজিস্টার্ড কাস্টমার</span>
                                                )}
                                            </span>
                                            {r.user_email && r.user_email !== 'N/A' && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                    {r.user_email}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Status Badge (Read Only) */}
                                    <div className="flex flex-col md:items-end justify-center gap-3 shrink-0">
                                        <div>
                                            {r.status === 'Pending' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300">
                                                    <AlertCircle className="w-3.5 h-3.5" /> অপেক্ষমাণ (Pending Admin Approval)
                                                </span>
                                            )}
                                            {r.status === 'Approved' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> অনুমোদিত (Live On Site)
                                                </span>
                                            )}
                                            {r.status === 'Rejected' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300">
                                                    <XCircle className="w-3.5 h-3.5" /> বাতিল (Rejected)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
