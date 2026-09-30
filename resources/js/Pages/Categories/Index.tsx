import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { TopNoticeBar } from '@/Components/TopNoticeBar';
import { NoticeMarquee } from '@/Components/NoticeMarquee';
import { MobileBottomNav } from '@/Components/MobileBottomNav';
import { Layers, Search, ChevronRight, ArrowRight } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
    image_url?: string | null;
    products_count?: number;
}

interface CategoriesIndexProps {
    categories: Category[];
}

export default function CategoriesIndex({ categories = [] }: CategoriesIndexProps) {
    const [search, setSearch] = useState('');

    const filteredCategories = useMemo(() => {
        if (!search.trim()) return categories;
        const q = search.toLowerCase();
        return categories.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }, [categories, search]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col pb-16 md:pb-0">
            <Head title="সকল ক্যাটাগরি — Guruz Categories" />

            <TopNoticeBar />
            <NoticeMarquee />
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-2.5 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 w-full">
                {/* Breadcrumb & Hero Card */}
                <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-8 shadow-md border border-emerald-700/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold mb-1">
                                <Link href="/" className="hover:text-white transition">হোম</Link>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-white font-bold">ক্যাটাগরি সমূহ</span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-slate-950 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                                <Layers className="w-3.5 h-3.5" /> ALL CATEGORIES
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2 text-white">
                                <span>📦</span> জনপ্রিয় পণ্য ক্যাটাগরি সমূহ
                            </h1>
                            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl font-medium">
                                আপনার প্রয়োজনীয় পণ্য দ্রুত খুঁজে পেতে পছন্দের ক্যাটাগরি নির্বাচন করুন।
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full md:w-80 shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="ক্যাটাগরি দিয়ে খুঁজুন..."
                                    className="w-full pl-4 pr-10 py-2.5 rounded-xl text-slate-900 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-inner"
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Count Badge */}
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                        মোট <span className="text-emerald-600 font-extrabold">{filteredCategories.length}</span> টি ক্যাটাগরি রয়েছে
                    </p>
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="text-xs text-rose-600 font-bold hover:underline"
                        >
                            রিসেট ফিল্টার
                        </button>
                    )}
                </div>

                {/* Categories Grid */}
                {filteredCategories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {filteredCategories.map((c) => (
                            <Link
                                key={c.id}
                                href={`/products?category=${c.slug}`}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col items-center text-center gap-3 group relative cursor-pointer"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-105 transition shadow-2xs overflow-hidden">
                                    {c.image_url ? (
                                        <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                                    ) : (c.icon && /^https?:\/\//i.test(c.icon) ? (
                                        <img src={c.icon} alt="" className="w-8 h-8 object-contain" />
                                    ) : (c.icon || '🛍️'))}
                                </div>

                                <div className="space-y-1 w-full">
                                    <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-600 transition">
                                        {c.name}
                                    </h3>

                                    <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                        <span>{c.products_count ?? 0} পণ্য</span>
                                        <ArrowRight className="w-3 h-3 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
                        <Search className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">কোন ক্যাটাগরি খুঁজে পাওয়া যায়নি</h3>
                        <p className="text-xs text-slate-500">"{search}" এর সাথে মিলে এমন কোনো ক্যাটাগরি পাওয়া যায়নি।</p>
                    </div>
                )}
            </main>

            <Footer />
            <MobileBottomNav />
        </div>
    );
}
