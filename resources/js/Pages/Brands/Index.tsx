import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { TopNoticeBar } from '@/Components/TopNoticeBar';
import { NoticeMarquee } from '@/Components/NoticeMarquee';
import { MobileBottomNav } from '@/Components/MobileBottomNav';
import { Award, Search, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo_url?: string | null;
    is_featured?: boolean;
    products_count?: number;
}

interface BrandsIndexProps {
    brands: Brand[];
}

export default function BrandsIndex({ brands = [] }: BrandsIndexProps) {
    const [search, setSearch] = useState('');

    const defaultBrands: Brand[] = [
        { id: 4, name: 'Apple', slug: 'apple', is_featured: true, products_count: 12 },
        { id: 5, name: 'Samsung', slug: 'samsung', is_featured: true, products_count: 15 },
        { id: 6, name: 'Xiaomi', slug: 'xiaomi', is_featured: true, products_count: 18 },
        { id: 7, name: 'Anker', slug: 'anker', is_featured: true, products_count: 24 },
        { id: 8, name: 'Baseus', slug: 'baseus', is_featured: true, products_count: 16 },
        { id: 9, name: 'Logitech', slug: 'logitech', is_featured: true, products_count: 10 },
        { id: 10, name: 'TP-Link', slug: 'tp-link', is_featured: true, products_count: 8 },
        { id: 11, name: 'UGREEN', slug: 'ugreen', is_featured: true, products_count: 14 },
        { id: 12, name: 'Remax', slug: 'remax', is_featured: true, products_count: 9 },
        { id: 13, name: 'Joyroom', slug: 'joyroom', is_featured: true, products_count: 7 },
        { id: 14, name: 'Hoco', slug: 'hoco', is_featured: true, products_count: 11 },
        { id: 15, name: 'Sony', slug: 'sony', is_featured: true, products_count: 6 },
        { id: 16, name: 'A4TECH', slug: 'a4tech', is_featured: true, products_count: 5 },
        { id: 17, name: 'Boya', slug: 'boya', is_featured: true, products_count: 4 },
    ];

    const allBrands = brands && brands.length > 0 ? brands : defaultBrands;

    const filteredBrands = useMemo(() => {
        if (!search.trim()) return allBrands;
        const q = search.toLowerCase();
        return allBrands.filter(b => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q));
    }, [allBrands, search]);

    const colors = [
        'from-slate-700 to-slate-900',
        'from-blue-600 to-blue-800',
        'from-cyan-600 to-teal-800',
        'from-emerald-600 to-teal-800',
        'from-amber-500 to-amber-700',
        'from-rose-500 to-rose-700',
        'from-purple-600 to-indigo-800',
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col pb-16 md:pb-0">
            <Head title="সকল শীর্ষ ও ভেরিফাইড ব্র্যান্ড — Guruz Brands" />

            <TopNoticeBar />
            <NoticeMarquee />
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-2.5 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 w-full">
                {/* Breadcrumb & Hero Card */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-5 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-indigo-200 font-semibold mb-1">
                                <Link href="/" className="hover:text-white transition">হোম</Link>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-white font-bold">ব্র্যান্ডস</span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-slate-950 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                                <Award className="w-3.5 h-3.5" /> 100% VERIFIED BRANDS
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2 text-white">
                                <span>⭐</span> টপ ও অফিশিয়াল ব্র্যান্ড সমূহ
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
                                বিশ্বস্ত আন্তর্জাতিক ও স্থানীয় গ্যাজেট ব্র্যান্ডের জেনুইন প্রডাক্ট খুঁজে পেতে আপনার পছন্দের ব্র্যান্ডটি নির্বাচন করুন।
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full md:w-80 shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="ব্র্যান্ড খুঁজুন (যেমন: Apple, Anker)..."
                                    className="w-full pl-4 pr-10 py-2.5 rounded-xl text-slate-900 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-inner"
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brands Count Badge */}
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                        মোট <span className="text-emerald-600 font-extrabold">{filteredBrands.length}</span> টি ব্র্যান্ড পাওয়া গেছে
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

                {/* Brands Grid */}
                {filteredBrands.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {filteredBrands.map((brand, i) => {
                            const cardColor = colors[i % colors.length];
                            return (
                                <Link
                                    key={brand.id}
                                    href={`/products?brand=${encodeURIComponent(brand.slug || brand.name)}`}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex flex-col items-center text-center gap-3 group relative cursor-pointer"
                                >
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 via-teal-400 to-blue-600 shadow group-hover:scale-110 transition-transform duration-200 shrink-0 overflow-hidden">
                                        {brand.logo_url ? (
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2 overflow-hidden">
                                                <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className={`w-full h-full rounded-full bg-gradient-to-br ${cardColor} flex items-center justify-center p-1 font-black text-white text-xs sm:text-sm tracking-wider uppercase`}>
                                                {brand.name.substring(0, 3)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1 w-full">
                                        <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-emerald-600 transition flex items-center justify-center gap-1">
                                            <span>{brand.name}</span>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        </h3>

                                        <div className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                            <span>{brand.products_count ?? 0} পণ্য</span>
                                            <ArrowRight className="w-3 h-3 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
                        <Search className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">কোন ব্র্যান্ড খুঁজে পাওয়া যায়নি</h3>
                        <p className="text-xs text-slate-500">"{search}" দিয়ে কোনো ব্র্যান্ড খুঁজে পাওয়া যায়নি। অন্য কিছু লিখে খুঁজুন।</p>
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow hover:bg-emerald-700 transition"
                        >
                            সব ব্র্যান্ড দেখুন
                        </button>
                    </div>
                )}
            </main>

            <Footer />
            <MobileBottomNav />
        </div>
    );
}
