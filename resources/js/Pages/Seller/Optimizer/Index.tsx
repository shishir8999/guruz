import React, { useState } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Zap, Globe, Search, CheckCircle2, AlertTriangle, RefreshCw, 
    ArrowRight, ShieldCheck, Cpu, HardDrive, ExternalLink, Copy, Check
} from 'lucide-react';
import Swal from 'sweetalert2';

interface ProductItem {
    id: number;
    name: string;
    sku: string;
    price: number;
    meta_title?: string;
    meta_description?: string;
    image?: string;
    is_optimized: boolean;
}

interface OptimizerProps {
    shop: any;
    score: number;
    checks: Array<{ key: string; title: string; status: string; desc: string }>;
    totalProducts: number;
    unoptimizedProductsCount: number;
    products: ProductItem[];
}

export default function OptimizerIndex({
    shop,
    score,
    checks,
    totalProducts,
    unoptimizedProductsCount,
    products,
}: OptimizerProps) {
    const [copiedCname, setCopiedCname] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isClearingCache, setIsClearingCache] = useState(false);

    const domainForm = useForm({
        custom_domain: shop?.custom_domain || '',
    });

    const handleSaveDomain = (e: React.FormEvent) => {
        e.preventDefault();
        domainForm.post('/seller/optimizer/domain', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: '🎉 Custom Domain saved and activated!',
                    showConfirmButton: false,
                    timer: 2500,
                });
            },
            onError: (errs) => {
                Swal.fire('Error', errs.custom_domain || 'Failed to save domain', 'error');
            }
        });
    };

    const handleAutoOptimizeProducts = () => {
        setIsOptimizing(true);
        router.post('/seller/optimizer/products', {}, {
            preserveScroll: true,
            onFinish: () => setIsOptimizing(false),
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: '⚡ 1-Click SEO Optimization Complete!',
                    text: 'All product meta titles and descriptions have been generated for search engines.',
                    confirmButtonColor: '#10B981',
                });
            }
        });
    };

    const handleClearCache = () => {
        setIsClearingCache(true);
        router.post('/seller/optimizer/cache', {}, {
            preserveScroll: true,
            onFinish: () => setIsClearingCache(false),
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: '⚡ Store speed & cache optimized!',
                    showConfirmButton: false,
                    timer: 2000,
                });
            }
        });
    };

    const copyCname = () => {
        navigator.clipboard.writeText('cname.guruz.com');
        setCopiedCname(true);
        setTimeout(() => setCopiedCname(false), 2000);
    };

    return (
        <>
            <Head title="Store & SEO Optimizer - Seller Panel" />

            <div className="max-w-7xl mx-auto space-y-8 pb-12">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 shadow-2xl border border-slate-800">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                                <Zap className="w-3.5 h-3.5" />
                                <span>Store & Custom Domain Optimizer</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                দোকান ও প্রোডাক্ট অপ্টিমাইজার (Store Optimizer)
                            </h1>
                            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                                আপনার শপের গুগল সার্চ (SEO) রেংকিং বাড়ান, পেজ স্পিড ফাস্ট করুন এবং আপনার নিজের কাস্টম ডোমেইন (Custom Domain) সেটআপ করুন।
                            </p>
                        </div>

                        {/* Store Health Score Badge */}
                        <div className="flex flex-col items-center bg-white/10 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/15 text-center min-w-[200px]">
                            <div className="relative flex items-center justify-center w-24 h-24 mb-2">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="38" stroke="currentColor" strokeWidth="8" className="text-white/20" fill="transparent" />
                                    <circle 
                                        cx="48" cy="48" r="38" 
                                        stroke="currentColor" 
                                        strokeWidth="8" 
                                        className={score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-rose-400'} 
                                        fill="transparent" 
                                        strokeDasharray={238}
                                        strokeDashoffset={238 - (238 * score) / 100}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <span className="absolute text-2xl font-extrabold">{score}%</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Store Health Score</span>
                        </div>
                    </div>
                </div>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Auto Optimize SEO */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">1-Click Auto SEO Generator</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {unoptimizedProductsCount > 0 ? (
                                    <span className="text-amber-600 dark:text-amber-400 font-semibold">⚠️ {unoptimizedProductsCount} টি প্রোডাক্টের SEO ট্যাগ বাকি আছে।</span>
                                ) : (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✅ সকল প্রোডাক্টের SEO মেটা ট্যাগ অপ্টিমাইজড!</span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={handleAutoOptimizeProducts}
                            disabled={isOptimizing}
                            className="mt-6 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
                        >
                            {isOptimizing ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Zap className="w-4 h-4" />
                            )}
                            <span>⚡ Auto Optimize All Products</span>
                        </button>
                    </div>

                    {/* Speed & Cache Optimizer */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center">
                                <Cpu className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Speed Booster & Cache Cleanup</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                শপের লোডিং স্পিড বাড়াতে ক্যাশ ক্লিয়ার করুন এবং অ্যাসেট অপ্টিমাইজ করুন।
                            </p>
                        </div>
                        <button
                            onClick={handleClearCache}
                            disabled={isClearingCache}
                            className="mt-6 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
                        >
                            {isClearingCache ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <HardDrive className="w-4 h-4" />
                            )}
                            <span>🚀 Speed Up Store & Clear Cache</span>
                        </button>
                    </div>

                    {/* Custom Domain Quick Status */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                        <div className="space-y-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Custom Domain Status</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {shop?.custom_domain ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-4 h-4" /> {shop.custom_domain}
                                    </span>
                                ) : (
                                    <span className="text-slate-500">আপনার নিজস্ব ডোমেইন কানেক্ট করা নেই।</span>
                                )}
                            </p>
                        </div>
                        <a
                            href="#custom-domain-section"
                            className="mt-6 w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm text-center"
                        >
                            <Globe className="w-4 h-4" />
                            <span>🌐 Configure Domain</span>
                        </a>
                    </div>
                </div>

                {/* Custom Domain Management Section */}
                <div id="custom-domain-section" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-purple-600" />
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">কাস্টম ডোমেইন সেটআপ (Custom Domain Integration)</h2>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                আপনি আপনার কেনা ডোমেইনটি (যেমন: <span className="font-semibold text-purple-600">www.yourbrand.com</span>) এখানে যুক্ত করলে গুগলে বা ওয়েবে ওই ডোমেইন দিয়ে সার্চ করলেই সরাসরি আপনার দোকান দেখা যাবে।
                            </p>
                        </div>

                        {shop?.custom_domain && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Status: {shop.custom_domain_status || 'Active & Verified'}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Domain Input Form */}
                        <form onSubmit={handleSaveDomain} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Enter Your Custom Domain (আপনার ডোমেইন লিখুন)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">https://</span>
                                    <input 
                                        type="text" 
                                        placeholder="myshop.com or www.mybrand.com"
                                        value={domainForm.data.custom_domain}
                                        onChange={e => domainForm.setData('custom_domain', e.target.value)}
                                        className="w-full pl-20 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1.5">
                                    উদাহরণ: <span className="font-mono text-slate-600 dark:text-slate-300">myshop.com</span> অথবা <span className="font-mono text-slate-600 dark:text-slate-300">shop.mybrand.com</span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={domainForm.processing}
                                className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                            >
                                <Globe className="w-4 h-4" />
                                <span>Save & Activate Domain</span>
                            </button>
                        </form>

                        {/* DNS Instructions & Demo Records */}
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                                    <span>📋 Demo DNS Records (ডোমেইন প্রোভাইডারে বসানোর DNS তথ্য)</span>
                                </h3>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
                                    Copy & Paste into DNS
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                আপনার ডোমেইন প্রোভাইডারে (Namecheap, GoDaddy, ইত্যাদিতে) লগইন করে নিচের DNS রেকর্ড দুটি কপি করে বসান:
                            </p>

                            <div className="space-y-3 font-mono text-xs">
                                {/* CNAME Record Demo */}
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="font-bold text-purple-600 dark:text-purple-400">1. CNAME Record (Subdomain / www)</span>
                                        <span className="text-slate-400 font-sans">Host: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">www</code></span>
                                    </div>
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700">
                                        <span className="font-bold text-slate-800 dark:text-slate-100 select-all">cname.guruz.com</span>
                                        <button 
                                            type="button"
                                            onClick={copyCname}
                                            className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-[11px] font-sans font-bold transition active:scale-95 shrink-0"
                                            title="Copy CNAME target"
                                        >
                                            {copiedCname ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-300" /> Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" /> Copy CNAME
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* A Record Demo */}
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                                    <div className="flex justify-between items-center text-[11px]">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">2. A Record (Main Domain IP)</span>
                                        <span className="text-slate-400 font-sans">Host: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">@</code></span>
                                    </div>
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700">
                                        <span className="font-bold text-slate-800 dark:text-slate-100 select-all">103.150.186.20</span>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText('103.150.186.20');
                                                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Server IP copied!', showConfirmButton: false, timer: 1500 });
                                            }}
                                            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-sans font-bold transition active:scale-95 shrink-0"
                                            title="Copy Server IP"
                                        >
                                            <Copy className="w-3.5 h-3.5" /> Copy IP
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit & Optimization Details */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">প্রোডাক্ট SEO স্ট্যাটাস (Product SEO Audit)</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">মোট {totalProducts} টি প্রোডাক্টের সার্চ ইঞ্জিন অপ্টিমাইজেশন তালিকা</p>
                        </div>
                        <button
                            onClick={handleAutoOptimizeProducts}
                            disabled={isOptimizing}
                            className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span>Run Auto-Fix</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-y border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="py-3 px-4">Product Name</th>
                                    <th className="py-3 px-4">SKU</th>
                                    <th className="py-3 px-4">Meta Title</th>
                                    <th className="py-3 px-4">Meta Description</th>
                                    <th className="py-3 px-4 text-right">SEO Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-400">
                                            এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।
                                        </td>
                                    </tr>
                                ) : (
                                    products.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                                            <td className="py-3 px-4 text-slate-500 font-mono">{p.sku}</td>
                                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300 truncate max-w-xs">{p.meta_title || '—'}</td>
                                            <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{p.meta_description || '—'}</td>
                                            <td className="py-3 px-4 text-right">
                                                {p.is_optimized ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                                                        <CheckCircle2 className="w-3 h-3" /> Optimized
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                                                        <AlertTriangle className="w-3 h-3" /> Needs Tags
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
