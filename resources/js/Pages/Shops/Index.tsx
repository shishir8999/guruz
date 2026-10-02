import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { TopNoticeBar } from '@/Components/TopNoticeBar';
import { NoticeMarquee } from '@/Components/NoticeMarquee';
import { MobileBottomNav } from '@/Components/MobileBottomNav';
import { Store, Star, Users, CheckCircle2, Search, Award } from 'lucide-react';

interface Shop {
    id: number;
    name: string;
    slug: string;
    logo_url?: string;
    banner_url?: string;
    rating: number;
    products_count: number;
    followers_count?: number;
}

export default function Index({ shops }: { shops: { data: Shop[] } }) {
    const [search, setSearch] = useState('');

    const shopList = shops?.data ?? [
        { id: 1, name: 'Guruz Official Store', slug: 'guruz-official', rating: 5.0, products_count: 45, followers_count: 1250 },
        { id: 2, name: 'Anker Official Bangladesh', slug: 'anker-official', rating: 4.9, products_count: 28, followers_count: 980 },
        { id: 3, name: 'UGREEN Flagship Store', slug: 'ugreen-official', rating: 4.9, products_count: 34, followers_count: 850 },
        { id: 4, name: 'TP-Link Router Hub', slug: 'tp-link-store', rating: 4.8, products_count: 19, followers_count: 640 },
    ];

    const filteredShops = shopList.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pb-16 md:pb-0">
            <Head title="সব ভেরিফাইড মার্চেন্ট শপ — Guruz Shops" />

            <TopNoticeBar />
            <NoticeMarquee />
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-6 w-full">
                
                {/* Header Title & Search Box */}
                <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-purple-950 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                            <Store className="w-3.5 h-3.5" /> VERIFIED VENDORS
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black">জনপ্রিয় মার্চেন্ট শপসমূহ</h1>
                        <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium">
                            বাংলাদেশের বিশ্বস্ত সব ইলেকট্রনিক্স ও গ্যাজেট বিক্রেতাদের সেরা সব পণ্য এক ছাদের নিচে!
                        </p>
                    </div>

                    <div className="w-full md:w-80">
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="মার্চেন্ট শপের নাম দিয়ে খুঁজুন..."
                                className="w-full pl-4 pr-10 py-2.5 rounded-xl text-slate-900 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-inner"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                        </div>
                    </div>
                </div>

                {/* Vendors Grid matching guruzbd.com */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {filteredShops.map(s => (
                        <Link
                            key={s.id}
                            href={`/shops/${s.slug}`}
                            className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md hover:border-emerald-500 transition-all flex flex-col items-center text-center gap-2 group"
                        >
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-emerald-500 via-teal-400 to-blue-600 shadow">
                                <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center font-black text-lg text-slate-800 group-hover:scale-105 transition-transform">
                                    {s.logo_url ? (
                                        <img src={s.logo_url} alt={s.name} className="w-full h-full object-cover" />
                                    ) : (
                                        s.name[0]
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition flex items-center justify-center gap-1">
                                    <span className="truncate">{s.name}</span>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                </h3>

                                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-semibold mt-1">
                                    <span className="flex items-center gap-0.5 text-amber-500 font-black">
                                        ⭐ {s.rating ?? 5.0}
                                    </span>
                                    <span>•</span>
                                    <span>{s.products_count ?? 0} পণ্য</span>
                                    <span>•</span>
                                    <span>{s.followers_count ?? 0} ফলোয়ার</span>
                                </div>
                            </div>

                            <span className="w-full mt-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white py-1 px-2 rounded-lg text-[11px] font-extrabold transition">
                                শপ ভিজিট করুন
                            </span>
                        </Link>
                    ))}
                </div>

            </main>

            <Footer />
            <MobileBottomNav />
        </div>
    );
}
