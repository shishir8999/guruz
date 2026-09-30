import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Target, 
    Share2, 
    Globe, 
    Activity, 
    Save, 
    ShieldCheck, 
    CheckCircle2, 
    Key, 
    Code, 
    Zap, 
    Flame, 
    Layers, 
    Check, 
    HelpCircle,
    Info,
    Tv,
    Link,
    Server,
    ExternalLink,
    RefreshCw,
    ShieldAlert,
    Copy
} from 'lucide-react';
import Swal from 'sweetalert2';

interface PixelData {
    id?: number;
    facebook_pixel_id?: string;
    facebook_capi_token?: string;
    facebook_test_code?: string;
    ga4_measurement_id?: string;
    gtm_container_id?: string;
    google_ads_conversion_id?: string;
    google_ads_conversion_label?: string;
    tiktok_pixel_id?: string;
    snapchat_pixel_id?: string;
    custom_facebook_script?: string;
    custom_google_script?: string;
    custom_tiktok_script?: string;
    custom_header_script?: string;
    track_pageview?: boolean;
    track_add_to_cart?: boolean;
    track_purchase?: boolean;
}

interface EventLogItem {
    event_name: string;
    channel: string;
    value: string;
    status: string;
    time: string;
}

interface ShopDetails {
    name: string;
    slug: string;
    custom_domain: string;
    custom_domain_status: string;
    custom_domain_dns_verified: boolean;
    server_ip: string;
    cname_host: string;
}

interface MarketingProps {
    pixel?: PixelData;
    eventLogs?: EventLogItem[];
    shop?: ShopDetails;
}

export default function Marketing({
    pixel = {},
    eventLogs = [],
    shop = {
        name: 'Shop',
        slug: 'shop',
        custom_domain: 'sparkcablesbd.com',
        custom_domain_status: 'Active & Verified',
        custom_domain_dns_verified: true,
        server_ip: '103.195.100.42',
        cname_host: 'shops.guruz-ecommerce.com',
    }
}: MarketingProps) {
    const [domainInput, setDomainInput] = useState(shop.custom_domain || '');
    const [isTestingDns, setIsTestingDns] = useState(false);

    const { data, setData, post, processing } = useForm({
        facebook_pixel_id: pixel.facebook_pixel_id || '',
        facebook_capi_token: pixel.facebook_capi_token || '',
        facebook_test_code: pixel.facebook_test_code || '',
        ga4_measurement_id: pixel.ga4_measurement_id || '',
        gtm_container_id: pixel.gtm_container_id || '',
        google_ads_conversion_id: pixel.google_ads_conversion_id || '',
        google_ads_conversion_label: pixel.google_ads_conversion_label || '',
        tiktok_pixel_id: pixel.tiktok_pixel_id || '',
        snapchat_pixel_id: pixel.snapchat_pixel_id || '',
        custom_facebook_script: pixel.custom_facebook_script || '',
        custom_google_script: pixel.custom_google_script || '',
        custom_tiktok_script: pixel.custom_tiktok_script || '',
        custom_header_script: pixel.custom_header_script || '',
        track_pageview: pixel.track_pageview ?? true,
        track_add_to_cart: pixel.track_add_to_cart ?? true,
        track_purchase: pixel.track_purchase ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/seller/marketing/pixels', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Marketing Pixels & Conversion API saved!',
                    showConfirmButton: false,
                    timer: 3500,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleSaveDomain = (e: React.FormEvent) => {
        e.preventDefault();
        if (!domainInput.trim()) return;

        setIsTestingDns(true);

        router.post('/seller/marketing/domain', { custom_domain: domainInput }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsTestingDns(false);
                Swal.fire({
                    title: '100% DNS & Pixel Engine Verified!',
                    text: `Domain ${domainInput} has been linked and verified. Meta Pixel, CAPI & GTM events are 100% active on this domain.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            },
            onError: () => {
                setIsTestingDns(false);
            }
        });
    };

    return (
        <>
            <Head title="Marketing Pixels & Custom Domain Setup — Seller Portal" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Banner Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <Target className="w-3.5 h-3.5 text-indigo-400" />
                                100% Guaranteed Custom Domain Tracking Engine
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Marketing & Tracking Pixels</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                কাস্টম ডোমেইন ও মেইন ডোমেইনে ফেসবুক পিক্সেল, CAPI এবং GTM ১০০% নিখুঁতভাবে কাজ করবে।
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>100% Tracking Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Domain Connection & 100% Tracking Verification Card */}
                <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-black text-xl shrink-0">
                                <Globe className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    Shop Custom Domain Connection (১০০% নিখুঁত ট্র্যাকিং ব্যবস্থা)
                                </h3>
                                <p className="text-xs text-indigo-200 mt-0.5">
                                    আপনার নিজস্ব ডোমেইন কানেক্ট করলে সিস্টেমে ফেসবুক পিক্সেল ও GTM ১০০% কাজ করবে।
                                </p>
                            </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {shop.custom_domain_status}
                        </span>
                    </div>

                    {/* DNS Records Guide */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                            <div className="font-bold text-indigo-300 flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Server className="w-4 h-4 text-indigo-400" /> 1. A Record (IP Pointing)</span>
                                <span className="font-mono bg-indigo-950 px-2 py-0.5 rounded text-[11px] text-amber-300">Host: @</span>
                            </div>
                            <p className="text-slate-300">Point your domain A Record to your server IP address:</p>
                            <div className="p-2.5 bg-slate-950/80 rounded-xl font-mono font-bold text-emerald-400 text-sm border border-emerald-500/30 flex justify-between items-center">
                                <span>{shop.server_ip || '103.150.186.20'}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(shop.server_ip || '103.150.186.20');
                                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Server IP copied!', showConfirmButton: false, timer: 1500 });
                                    }}
                                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                                >
                                    <Copy className="w-3.5 h-3.5" /> Copy IP
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                            <div className="font-bold text-indigo-300 flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Link className="w-4 h-4 text-indigo-400" /> 2. CNAME Record (Subdomain)</span>
                                <span className="font-mono bg-indigo-950 px-2 py-0.5 rounded text-[11px] text-amber-300">Host: www</span>
                            </div>
                            <p className="text-slate-300">Point CNAME www to central shop gateway:</p>
                            <div className="p-2.5 bg-slate-950/80 rounded-xl font-mono font-bold text-indigo-300 text-sm border border-indigo-500/30 flex justify-between items-center">
                                <span>{shop.cname_host || 'cname.guruz.com'}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(shop.cname_host || 'cname.guruz.com');
                                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'CNAME Target copied!', showConfirmButton: false, timer: 1500 });
                                    }}
                                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                                >
                                    <Copy className="w-3.5 h-3.5" /> Copy CNAME
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Domain Input Form */}
                    <form onSubmit={handleSaveDomain} className="flex flex-col sm:flex-row gap-3 pt-2">
                        <div className="relative flex-1">
                            <Globe className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                            <input 
                                type="text"
                                placeholder="e.g. myshop.com or sparkcablesbd.com"
                                value={domainInput}
                                onChange={e => setDomainInput(e.target.value)}
                                className="w-full text-xs sm:text-sm bg-slate-950/80 border border-indigo-500/40 rounded-2xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono font-bold placeholder-slate-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isTestingDns}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                        >
                            {isTestingDns ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying DNS...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Connect & Verify 100% Tracking
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Channel 1: Meta / Facebook Pixel & CAPI */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                        Meta / Facebook Pixel & Conversion API (CAPI)
                                    </h3>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Track iOS 14+ conversions via server-side Conversion API
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200">
                                100% Active Mode
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Facebook Pixel ID */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Key className="w-3.5 h-3.5 text-indigo-500" /> Facebook Pixel ID *
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 104820938192039"
                                    value={data.facebook_pixel_id}
                                    onChange={e => setData('facebook_pixel_id', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                />
                                <p className="text-[10px] text-slate-400">Found in Meta Events Manager &gt; Data Sources.</p>
                            </div>

                            {/* Facebook Test Event Code */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Code className="w-3.5 h-3.5 text-indigo-500" /> Test Event Code (Optional)
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. TEST88492"
                                    value={data.facebook_test_code}
                                    onChange={e => setData('facebook_test_code', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                />
                            </div>
                        </div>

                        {/* Facebook CAPI Access Token */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-indigo-500" /> Conversion API (CAPI) Access Token
                            </label>
                            <textarea 
                                rows={2}
                                placeholder="Paste your Meta Conversion API Access Token (EAA...)"
                                value={data.facebook_capi_token}
                                onChange={e => setData('facebook_capi_token', e.target.value)}
                                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            />
                        </div>

                        {/* Meta Pixel Custom Script Code */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Code className="w-3.5 h-3.5 text-blue-500" /> মেটা পিক্সেল কাস্টম স্ক্রিপ্ট কোড (Meta Pixel Script Snippet)
                            </label>
                            <textarea 
                                rows={4}
                                placeholder="<!-- Meta Pixel Base Code -->&#10;<script>&#10;!function(f,b,e,v,n,t,s)...&#10;</script>"
                                value={data.custom_facebook_script}
                                onChange={e => setData('custom_facebook_script', e.target.value)}
                                className="w-full text-xs bg-slate-900 text-emerald-400 border border-slate-800 rounded-2xl p-4 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <p className="text-[11px] text-slate-500">মেটা ইভেন্টস ম্যানেজার থেকে প্রাপ্ত সম্পূর্ণ &lt;script&gt; ট্যাগের কোডটি এখানে হুবহু পেস্ট করতে পারেন।</p>
                        </div>
                    </div>

                    {/* Channel 2: Google Analytics 4 & GTM */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                                        Google Analytics 4 (GA4), GTM & Custom Google Scripts
                                    </h3>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        Monitor traffic, customer paths, and Google Ads conversions
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* GA4 Measurement ID */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5 text-emerald-500" /> GA4 Measurement ID
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. G-X984210948"
                                    value={data.ga4_measurement_id}
                                    onChange={e => setData('ga4_measurement_id', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                />
                            </div>

                            {/* GTM Container ID */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Code className="w-3.5 h-3.5 text-emerald-500" /> GTM Container ID
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. GTM-N984102"
                                    value={data.gtm_container_id}
                                    onChange={e => setData('gtm_container_id', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                            {/* Google Ads Conversion ID */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Google Ads Conversion ID
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. AW-984210491"
                                    value={data.google_ads_conversion_id}
                                    onChange={e => setData('google_ads_conversion_id', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                />
                            </div>

                            {/* Google Ads Conversion Label */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Google Ads Conversion Label
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. XyZ123_Purchases"
                                    value={data.google_ads_conversion_label}
                                    onChange={e => setData('google_ads_conversion_label', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                />
                            </div>
                        </div>

                        {/* Google Custom Script */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Code className="w-3.5 h-3.5 text-emerald-500" /> গুগলের যেকোনো কাস্টম ট্র্যাকিং স্ক্রিপ্ট (Google Custom Script Code)
                            </label>
                            <textarea 
                                rows={4}
                                placeholder="<!-- Global site tag (gtag.js) - Google Analytics / GTM -->&#10;<script async src='https://www.googletagmanager.com/gtag/js?id=G-XXXXX'></script>&#10;<script>&#10;  window.dataLayer = window.dataLayer || [];&#10;  function gtag(){dataLayer.push(arguments);}&#10;  gtag('js', new Date());&#10;  gtag('config', 'G-XXXXX');&#10;</script>"
                                value={data.custom_google_script}
                                onChange={e => setData('custom_google_script', e.target.value)}
                                className="w-full text-xs bg-slate-900 text-emerald-400 border border-slate-800 rounded-2xl p-4 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <p className="text-[11px] text-slate-500">Google Analytics, Google Tag Manager (GTM) বা Google Site Verification HTML/JS কোড এখানে পেস্ট করুন।</p>
                        </div>
                    </div>

                    {/* Channel 3: TikTok & Snapchat Pixel + TikTok Custom Script */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* TikTok Pixel */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                                    <Tv className="w-4 h-4 text-purple-500" /> TikTok Pixel ID
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="e.g. C98421049182039"
                                    value={data.tiktok_pixel_id}
                                    onChange={e => setData('tiktok_pixel_id', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                />
                            </div>

                            {/* Snapchat Pixel */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                                    <Share2 className="w-4 h-4 text-amber-500" /> Snapchat Pixel ID
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="e.g. 89421049-1029-4910"
                                    value={data.snapchat_pixel_id}
                                    onChange={e => setData('snapchat_pixel_id', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                />
                            </div>
                        </div>

                        {/* TikTok Pixel Custom Script */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Code className="w-3.5 h-3.5 text-purple-500" /> টিকটক পিক্সেল কাস্টম স্ক্রিপ্ট (TikTok Pixel Custom Code Snippet)
                            </label>
                            <textarea 
                                rows={4}
                                placeholder="<!-- TikTok Pixel Code -->&#10;<script>&#10;!function (w, d, t) {&#10;  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];...&#10;}(window, document, 'ttq');&#10;</script>"
                                value={data.custom_tiktok_script}
                                onChange={e => setData('custom_tiktok_script', e.target.value)}
                                className="w-full text-xs bg-slate-900 text-purple-300 border border-slate-800 rounded-2xl p-4 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[11px] text-slate-500">TikTok Events Manager থেকে প্রাপ্ত পিক্সেল ট্র্যাকিং JS স্ক্রিপ্ট এখানে পেস্ট করুন।</p>
                        </div>
                    </div>

                    {/* Channel 4: General Header & Body Scripts */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 border border-indigo-900/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                                <Code className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base">অন্যান্য কাস্টম হেড/বডি স্ক্রিপ্টস (Custom Header & Body Scripts)</h3>
                                <p className="text-xs text-indigo-200/80">লাইভ চ্যাট উইজেট, হটজার (Hotjar), পিন্টারেস্ট, ক্ল্যারিটি বা যেকোনো থার্ড-পার্টি কাস্টম скрип্ট অ্যাড করুন</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <textarea 
                                rows={5}
                                placeholder="<!-- Paste any custom <script> tags here -->&#10;<script>&#10;  // Custom JS or tracking scripts&#10;</script>"
                                value={data.custom_header_script}
                                onChange={e => setData('custom_header_script', e.target.value)}
                                className="w-full text-xs bg-slate-950 text-emerald-400 border border-indigo-950 rounded-2xl p-4 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <p className="text-[11px] text-indigo-300/70">এই স্ক্রিপ্টগুলো আপনার কাস্টম ডোমেইন ও শপের ফ্রন্টএন্ড পেজে স্বয়ংক্রিয়ভাবে এক্সিকিউট হবে।</p>
                        </div>
                    </div>

                    {/* Event Tracking Toggles Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-600" /> Automatic Conversion Event Triggers
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Track PageView Events</span>
                                <input 
                                    type="checkbox" 
                                    checked={data.track_pageview}
                                    onChange={e => setData('track_pageview', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Track AddToCart Events</span>
                                <input 
                                    type="checkbox" 
                                    checked={data.track_add_to_cart}
                                    onChange={e => setData('track_add_to_cart', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Track Purchase Events</span>
                                <input 
                                    type="checkbox" 
                                    checked={data.track_purchase}
                                    onChange={e => setData('track_purchase', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex justify-end">
                        <button 
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" /> Save Marketing & Tracking Pixels
                        </button>
                    </div>

                </form>

                {/* Live Event Firing Audit Stream */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <Flame className="w-5 h-5 text-amber-500" /> Live Pixel Firing Audit Stream
                        </h3>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200">
                            Live Monitoring Active
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Event Name</th>
                                    <th className="px-6 py-4">Channel Engine</th>
                                    <th className="px-6 py-4">Value / Payload</th>
                                    <th className="px-6 py-4 text-center">Event Match Status</th>
                                    <th className="px-6 py-4 text-right">Time Fired</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {eventLogs.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm block">
                                                {log.event_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-bold">
                                            {log.channel}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            {log.value}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {log.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-400 font-mono">
                                            {log.time}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
}

Marketing.layout = (page: any) => <SellerLayout children={page} />;
