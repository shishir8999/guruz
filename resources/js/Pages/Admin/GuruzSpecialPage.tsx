import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, ArrowUp, ArrowDown, X, Search, Sparkles, Plus, Eye, Save, Layers } from 'lucide-react';
import Swal from 'sweetalert2';

interface ProductItem {
    id: number;
    name: string;
    image: string;
    price?: number | string;
    sale_price?: number | string;
}

interface GuruzSpecialProps {
    initialEnabled?: boolean;
    initialTitleEn?: string;
    initialTitleBn?: string;
    initialSubEn?: string;
    initialSubBn?: string;
    initialEmoji?: string;
    initialGradFrom?: string;
    initialGradTo?: string;
    initialSelectedProducts?: ProductItem[];
    initialAvailableProducts?: ProductItem[];
}

export default function GuruzSpecialPage({
    initialEnabled = true,
    initialTitleEn = 'Guruz Special',
    initialTitleBn = 'GURUZ স্পেশাল',
    initialSubEn = 'Hand-picked deals for the season',
    initialSubBn = 'সেরা অফার ও বিশেষ আকর্ষণ সমাহার!',
    initialEmoji = '✨',
    initialGradFrom = '#7c3aed',
    initialGradTo = '#db2777',
    initialSelectedProducts = [],
    initialAvailableProducts = [],
}: GuruzSpecialProps) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [titleEn, setTitleEn] = useState(initialTitleEn);
    const [titleBn, setTitleBn] = useState(initialTitleBn);
    const [subEn, setSubEn] = useState(initialSubEn);
    const [subBn, setSubBn] = useState(initialSubBn);
    const [emoji, setEmoji] = useState(initialEmoji);
    const [gradFrom, setGradFrom] = useState(initialGradFrom);
    const [gradTo, setGradTo] = useState(initialGradTo);

    const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>(initialSelectedProducts);
    const [availableProducts, setAvailableProducts] = useState<ProductItem[]>(initialAvailableProducts);

    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);

    const filteredAvailable = availableProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const moveUp = (index: number) => {
        if (index === 0) return;
        const updated = [...selectedProducts];
        const temp = updated[index - 1];
        updated[index - 1] = updated[index];
        updated[index] = temp;
        setSelectedProducts(updated);
    };

    const moveDown = (index: number) => {
        if (index === selectedProducts.length - 1) return;
        const updated = [...selectedProducts];
        const temp = updated[index + 1];
        updated[index + 1] = updated[index];
        updated[index] = temp;
        setSelectedProducts(updated);
    };

    const removeSelected = (prod: ProductItem) => {
        setSelectedProducts(prev => prev.filter(p => p.id !== prod.id));
        setAvailableProducts(prev => [prod, ...prev]);
    };

    const addProduct = (prod: ProductItem) => {
        setAvailableProducts(prev => prev.filter(p => p.id !== prod.id));
        setSelectedProducts(prev => [...prev, prod]);
    };

    const handleSaveChanges = () => {
        setSaving(true);
        router.post('/admin/guruz-special', {
            enabled,
            titleEn,
            titleBn,
            subEn,
            subBn,
            emoji,
            gradFrom,
            gradTo,
            selectedProducts: selectedProducts.map(p => p.id),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Guruz স্পেশাল সেকশন সফলভাবে সংরক্ষণ করা হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            },
            onError: () => {
                setSaving(false);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'সংরক্ষণ ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        });
    };

    return (
        <>
            <Head title="Guruz স্পেশাল অফার ম্যানেজমেন্ট — অ্যাডমিন প্যানেল" />

            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* Header Title + Enabled Checkbox + Save Changes Button */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                হোমপেজ অফার সেকশন
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">বিশেষ অফার ও আকর্ষণ</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            🌟 Guruz স্পেশাল অফার ম্যানেজমেন্ট
                        </h1>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                            হোমপেজের এই সেকশনের নাম (যেমন: GURUZ স্পেশাল, ঈদ অফার, মেগা সেল), সাব-টাইটেল ও অফারের পণ্যসমূহ এখান থেকে পরিবর্তন করুন।
                        </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                            <input
                                type="checkbox"
                                checked={enabled}
                                onChange={e => setEnabled(e.target.checked)}
                                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                            />
                            <span>সেকশন সক্রিয় (Active)</span>
                        </label>

                        <button
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-purple-600/20 transition flex items-center gap-2 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}</span>
                        </button>
                    </div>
                </div>

                {/* Seasonal Banner Customizer Form Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Layers className="w-4 h-4 text-purple-600" />
                        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                            সেকশন শিরোনাম ও ডিজাইন কাস্টমাইজেশন
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                সেকশন শিরোনাম (বাংলা) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={titleBn}
                                onChange={e => setTitleBn(e.target.value)}
                                placeholder="যেমন: GURUZ স্পেশাল অথবা ঈদ স্পেশাল"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">হোমপেজে বড় করে এই লেখাটি দেখাবে (যেমন: GURUZ স্পেশাল)।</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Title (English) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={titleEn}
                                onChange={e => setTitleEn(e.target.value)}
                                placeholder="e.g. Guruz Special"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">English storefront title.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                সাব-টাইটেল (বাংলা)
                            </label>
                            <input
                                type="text"
                                value={subBn}
                                onChange={e => setSubBn(e.target.value)}
                                placeholder="যেমন: সেরা অফার ও বিশেষ আকর্ষণ সমাহার!"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">শিরোনামের নিচে ছোট করে এই ট্যাগলাইন দেখাবে।</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Subtitle (English)
                            </label>
                            <input
                                type="text"
                                value={subEn}
                                onChange={e => setSubEn(e.target.value)}
                                placeholder="e.g. Hand-picked deals for the season"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">English storefront subtitle tag.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                আইকন / ইমোজি (Emoji or Icon)
                            </label>
                            <input
                                type="text"
                                value={emoji}
                                onChange={e => setEmoji(e.target.value)}
                                placeholder="যেমন: ✨ অথবা 🎁 বা 🌙"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    কালার গ্রেডিয়েন্ট শুরু (From)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={gradFrom}
                                        onChange={e => setGradFrom(e.target.value)}
                                        className="w-10 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 shrink-0"
                                    />
                                    <input 
                                        type="text" 
                                        value={gradFrom} 
                                        onChange={e => setGradFrom(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    কালার গ্রেডিয়েন্ট শেষ (To)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={gradTo}
                                        onChange={e => setGradTo(e.target.value)}
                                        className="w-10 h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-0.5 shrink-0"
                                    />
                                    <input 
                                        type="text" 
                                        value={gradTo} 
                                        onChange={e => setGradTo(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="pt-2">
                        <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mb-2">
                            <Eye className="w-3.5 h-3.5 text-purple-600" />
                            লাইভ প্রিভিউ (হোমপেজে যেমন দেখাবে):
                        </div>
                        <div
                            style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
                            className="rounded-2xl p-4 text-white shadow-lg transition-all duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-purple-950 font-black shadow-sm text-base shrink-0">
                                        {emoji || '✨'}
                                    </div>
                                    <div>
                                        <h3 className="text-base sm:text-lg font-black tracking-wide">
                                            {titleBn || titleEn || 'GURUZ স্পেশাল'}
                                        </h3>
                                        <p className="text-xs text-purple-100 font-medium">
                                            {subBn || subEn || 'সেরা অফার ও বিশেষ আকর্ষণ সমাহার!'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-[11px] bg-white/20 px-3 py-1 rounded-full font-black text-white border border-white/30 shrink-0">
                                    সব দেখুন →
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2-Column Product Selection Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Selected Products Box */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>অফার হিসেবে নির্বাচিত পণ্যসমূহ</span>
                                    <span className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-xs px-2 py-0.5 rounded-full font-black">
                                        {selectedProducts.length}
                                    </span>
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                    হোমপেজের স্লাইডারে ক্রমানুসারে এই পণ্যগুলো দেখাবে।
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                            {selectedProducts.length === 0 ? (
                                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                    <p className="text-xs text-slate-500 font-bold">এখনও কোনো পণ্য সিলেক্ট করা হয়নি!</p>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        ডানপাশের "উপলব্ধ পণ্যসমূহ" তালিকা থেকে যেকোনো পণ্যকে অফার হিসেবে চালাতে + যুক্ত করুন বাটনে ক্লিক করুন।
                                    </p>
                                </div>
                            ) : (
                                selectedProducts.map((prod, idx) => (
                                    <div
                                        key={prod.id}
                                        className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-purple-300 transition"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <img
                                                src={prod.image || '/placeholder-product.png'}
                                                alt={prod.name}
                                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                                            />
                                            <div className="min-w-0">
                                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                                                    {prod.name}
                                                </span>
                                                {(prod.sale_price || prod.price) && (
                                                    <span className="text-[11px] font-black text-purple-600 dark:text-purple-400">
                                                        ৳{prod.sale_price || prod.price}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                                            <button
                                                title="উপরে নিন"
                                                onClick={() => moveUp(idx)}
                                                disabled={idx === 0}
                                                className="hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 p-1.5 rounded-lg disabled:opacity-30 cursor-pointer transition"
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                title="নিচে নামান"
                                                onClick={() => moveDown(idx)}
                                                disabled={idx === selectedProducts.length - 1}
                                                className="hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 p-1.5 rounded-lg disabled:opacity-30 cursor-pointer transition"
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                title="অফার তালিকা থেকে বাদ দিন"
                                                onClick={() => removeSelected(prod)}
                                                className="hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5 rounded-lg text-rose-500 cursor-pointer transition"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Available Products Box with Search Bar */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                    উপলব্ধ পণ্যসমূহ (Available Products)
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                    যেকোনো সক্রিয় পণ্য সার্চ করে অফার সেকশনে যুক্ত করতে পারেন।
                                </p>
                            </div>
                            <span className="text-xs font-bold text-slate-400">
                                মোট: {filteredAvailable.length}
                            </span>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="পণ্যের নাম দিয়ে সার্চ করুন..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                            {filteredAvailable.length === 0 ? (
                                <p className="text-xs text-slate-400 font-medium py-8 text-center">
                                    কোনো পণ্য পাওয়া যায়নি।
                                </p>
                            ) : (
                                filteredAvailable.map(prod => (
                                    <div
                                        key={prod.id}
                                        className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={prod.image || '/placeholder-product.png'}
                                                alt={prod.name}
                                                className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                                            />
                                            <div className="min-w-0">
                                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                                                    {prod.name}
                                                </span>
                                                {(prod.sale_price || prod.price) && (
                                                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">
                                                        ৳{prod.sale_price || prod.price}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => addProduct(prod)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-1.5 rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer shadow-xs"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>যুক্ত করুন</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </>
    );
}
