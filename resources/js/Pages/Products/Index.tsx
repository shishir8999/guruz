import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { ProductCard } from '@/Components/ProductCard';
import { Filter, ChevronRight, X, SlidersHorizontal, Check } from 'lucide-react';

interface ProductsIndexProps {
    products: {
        data: any[];
        links: any[];
        total?: number;
    };
    categories: any[];
    filters: {
        section?: string;
        category?: string;
        brand?: string;
        search?: string;
        min_price?: string | number;
        max_price?: string | number;
        sort?: string;
    };
    sectionTitle?: string;
    sectionSubtitle?: string;
}

export default function ProductsIndex({ 
    products, 
    categories = [], 
    filters = {}, 
    sectionTitle = 'সব পণ্য (All Products)', 
    sectionSubtitle = 'Browse verified products across Bangladesh' 
}: ProductsIndexProps) {
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    const handleCategoryFilter = (slug?: string) => {
        setMobileFilterOpen(false);
        router.get('/products', { 
            ...filters, 
            category: slug === filters.category ? undefined : slug 
        }, { preserveState: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-16 md:pb-0">
            <Head title={`${sectionTitle} — Guruz`} />
            <Header />

            <main className="flex-1 max-w-7xl mx-auto px-2.5 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6 w-full">
                {/* Breadcrumb & Section Heading Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 sm:space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            <Link href="/" className="hover:text-emerald-600 transition">হোম</Link>
                            <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[200px] sm:max-w-none">{sectionTitle}</span>
                        </div>
                        <h1 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            {sectionTitle}
                        </h1>
                        <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {sectionSubtitle} • <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{products.data.length} টি পণ্য</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Mobile Filter Button */}
                        <button
                            type="button"
                            onClick={() => setMobileFilterOpen(true)}
                            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 active:scale-95 transition shadow-2xs"
                        >
                            <Filter className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ক্যাটাগরি ফিল্টার</span>
                        </button>

                        {(filters.section || filters.brand || filters.category || filters.search) && (
                            <Link 
                                href="/products" 
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800 transition"
                            >
                                <span>সব পণ্য দেখুন</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* 📱 Mobile Horizontal Scrollable Category Bar (Clean & Thumb-Friendly) 📱 */}
                <div className="lg:hidden overflow-x-auto no-scrollbar py-1">
                    <div className="flex items-center gap-1.5 shrink-0 px-0.5">
                        <button
                            type="button"
                            onClick={() => handleCategoryFilter(undefined)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition shadow-2xs ${
                                !filters.category
                                    ? 'bg-emerald-600 text-white font-black'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                            }`}
                        >
                            সব ক্যাটাগরি
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategoryFilter(cat.slug)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition shadow-2xs ${
                                    filters.category === cat.slug
                                        ? 'bg-emerald-600 text-white font-black'
                                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* 🖥️ Desktop Sidebar Filter (Hidden on Mobile) */}
                    <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 h-fit shadow-xs sticky top-20">
                        <h3 className="font-black text-sm sm:text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5 text-slate-900 dark:text-white">
                            <Filter className="w-4 h-4 text-emerald-600" /> ক্যাটাগরি ফিল্টার
                        </h3>
                        <div className="space-y-1 max-h-[450px] overflow-y-auto pr-1">
                            <button
                                onClick={() => handleCategoryFilter(undefined)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-between cursor-pointer ${
                                    !filters.category ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span>সকল ক্যাটাগরি</span>
                                {!filters.category && <Check className="w-3.5 h-3.5" />}
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryFilter(cat.slug)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-between cursor-pointer ${
                                        filters.category === cat.slug ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span>{cat.name}</span>
                                    {filters.category === cat.slug && <Check className="w-3.5 h-3.5" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                            {products.data.length > 0 ? (
                                products.data.map((p: any) => (
                                    <ProductCard
                                        key={p.id}
                                        product={p}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                    <div className="text-4xl mb-2">🔍</div>
                                    <p className="font-bold text-sm">এই সেকশনে কোনো পণ্য পাওয়া যায়নি।</p>
                                    <Link href="/products" className="text-xs text-emerald-600 font-extrabold hover:underline mt-2 inline-block">
                                        সব পণ্য দেখুন
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Pagination Links */}
                        {products.links && products.links.length > 3 && (
                            <div className="flex items-center justify-center gap-1.5 pt-4">
                                {products.links.map((link: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                            link.active
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : link.url
                                                ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                                                : 'text-slate-400 opacity-50 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* 📱 Mobile Bottom-Sheet Filter Modal */}
            {mobileFilterOpen && (
                <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-slate-950/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200">
                    <div 
                        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-4 max-h-[80vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <Filter className="w-4 h-4 text-emerald-600" /> ক্যাটাগরি ফিল্টার
                            </h3>
                            <button
                                type="button"
                                onClick={() => setMobileFilterOpen(false)}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
                            <button
                                onClick={() => handleCategoryFilter(undefined)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                                    !filters.category ? 'bg-emerald-600 text-white font-black shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span>সকল ক্যাটাগরি</span>
                                {!filters.category && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryFilter(cat.slug)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                                        filters.category === cat.slug ? 'bg-emerald-600 text-white font-black shadow-xs' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <span>{cat.name}</span>
                                    {filters.category === cat.slug && <Check className="w-4 h-4 stroke-[3]" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
