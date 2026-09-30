import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Image, Save, CheckCircle, ShieldCheck, Globe, Phone, Mail, Upload, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface SettingsProps {
    settings: {
        site_logo: string;
        site_favicon?: string;
        site_title: string;
        support_phone: string;
        support_email: string;
        coupon_system_enabled?: boolean;
        marquee_speed?: string;
        marquee_speed_shops?: string;
        marquee_speed_categories?: string;
        marquee_speed_brands?: string;
    };
}

export default function Settings({ settings }: SettingsProps) {
    const { flash } = usePage<any>().props;
    const { data, setData, post, processing, errors } = useForm({
        site_logo: settings.site_logo || '',
        site_favicon: settings.site_favicon || '',
        site_title: settings.site_title || 'Guruz BD',
        support_phone: settings.support_phone || '01700000000',
        support_email: settings.support_email || 'support@guruzbd.com',
        coupon_system_enabled: settings.coupon_system_enabled !== false,
        marquee_speed: settings.marquee_speed || '20',
        marquee_speed_shops: settings.marquee_speed_shops || settings.marquee_speed || '20',
        marquee_speed_categories: settings.marquee_speed_categories || settings.marquee_speed || '20',
        marquee_speed_brands: settings.marquee_speed_brands || settings.marquee_speed || '20',
    });
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const faviconInputRef = React.useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = React.useState<string | null>(null);
    const [previewError, setPreviewError] = React.useState(false);

    React.useEffect(() => {
        setData(d => ({
            ...d,
            site_logo: settings.site_logo || '',
            site_favicon: settings.site_favicon || '',
            site_title: settings.site_title || 'Guruz BD',
            support_phone: settings.support_phone || '01700000000',
            support_email: settings.support_email || 'support@guruzbd.com',
        }));
        setLogoPreview(null);
        setFaviconPreview(null);
        setPreviewError(false);
    }, [settings.site_logo, settings.site_favicon, settings.site_title, settings.support_phone, settings.support_email]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('site_logo', file as any);
            setLogoPreview(URL.createObjectURL(file));
            setPreviewError(false);
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('site_favicon', file as any);
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/settings', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'সেভ হয়েছে!',
                    text: 'সেটিংস সফলভাবে আপডেট হয়েছে।',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
            <Head title="Website Settings & Logo Management — Admin" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-purple-600" />
                            ওয়েবসাইট লোগো ও জেনারেল সেটিংস
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            এখানে ওয়েবসাইটের লোগো ইউআরএল, টাইটেল, সাপোর্ট ফোন নম্বর ও ইমেইল পরিবর্তন করতে পারবেন।
                        </p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl font-bold text-sm flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        {flash.success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    {/* Site Logo Section */}
                    <div className="space-y-3 pb-6 border-b border-slate-200">
                        <label className="block text-sm font-extrabold text-slate-800 flex items-center gap-2">
                            <Image className="w-4 h-4 text-purple-600" />
                            ওয়েবসাইট লোগো (Site Logo)
                        </label>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <div className="sm:col-span-2">
                                <div className="flex flex-col gap-2">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition flex items-center justify-center flex-col gap-2"
                                    >
                                        <Upload className="w-8 h-8 text-slate-400" />
                                        <div className="text-sm font-medium text-slate-600">ক্লিক করে নতুন লোগো আপলোড করুন</div>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleLogoChange}
                                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                        className="hidden" 
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    লোগোর ইমেজ ফাইল আপলোড করুন (PNG, SVG বা WEBP)। ফাঁকা রাখলে ডিফল্ট টেক্সট লোগো দেখাবে।
                                </p>
                            </div>

                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[120px]">
                                <span className="text-[10px] text-slate-400 font-bold mb-2">লোগো প্রাকদর্শন:</span>
                                {(!previewError && (logoPreview || (typeof data.site_logo === 'string' && data.site_logo))) ? (
                                    <img 
                                        src={logoPreview || (typeof data.site_logo === 'string' ? data.site_logo : '')} 
                                        alt="Preview" 
                                        className="max-h-12 object-contain" 
                                        onError={() => setPreviewError(true)}
                                    />
                                ) : (
                                    <span className="text-white font-black text-xl tracking-tight">
                                        guruz<span className="text-emerald-400">bd</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Browser Tab Favicon Section */}
                    <div className="space-y-3 pb-6 border-b border-slate-200">
                        <label className="block text-sm font-extrabold text-slate-800 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-emerald-600" />
                            ব্রাউজার ট্যাব আইকন (Browser Tab Favicon)
                        </label>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                            <div className="sm:col-span-2">
                                <div className="flex flex-col gap-2">
                                    <div 
                                        onClick={() => faviconInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-300 rounded-xl p-5 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition flex items-center justify-center flex-col gap-2"
                                    >
                                        <Upload className="w-6 h-6 text-slate-400" />
                                        <div className="text-sm font-medium text-slate-600">ক্লিক করে ব্রাউজার ট্যাব আইকন (Favicon) আপলোড করুন</div>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={faviconInputRef} 
                                        onChange={handleFaviconChange}
                                        accept="image/png, image/x-icon, image/vnd.microsoft.icon, image/jpeg, image/svg+xml, image/webp"
                                        className="hidden" 
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    ব্রাউজার ট্যাবে দেখানোর জন্য ছোট সাইজের (৩২x৩২ বা ৬৪x৬৪ পিক্সেল) PNG, ICO বা SVG ফেভআইকন আপলোড করুন।
                                </p>
                            </div>

                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[100px]">
                                <span className="text-[10px] text-slate-400 font-bold mb-2">ট্যাব আইকন প্রাকদর্শন:</span>
                                {faviconPreview || (typeof data.site_favicon === 'string' && data.site_favicon) ? (
                                    <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                                        <img src={faviconPreview || (typeof data.site_favicon === 'string' ? data.site_favicon : '')} alt="Favicon Preview" className="w-5 h-5 object-contain" />
                                        <span className="text-slate-300 text-xs font-bold truncate max-w-[120px]">Guruz BD</span>
                                    </div>
                                ) : (
                                    <span className="text-slate-400 text-xs font-semibold">কোনো ফেভআইকন আপলোড করা হয়নি</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Site Title & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-blue-600" /> ওয়েবসাইট টাইটেল (Site Title)
                            </label>
                            <input
                                type="text"
                                value={data.site_title}
                                onChange={e => setData('site_title', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-emerald-600" /> সাপোর্ট হেল্পলাইন ফোন (Support Phone)
                            </label>
                            <input
                                type="text"
                                value={data.support_phone}
                                onChange={e => setData('support_phone', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-indigo-600" /> সাপোর্ট ইমেইল (Support Email)
                            </label>
                            <input
                                type="email"
                                value={data.support_email}
                                onChange={e => setData('support_email', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none"
                            />
                        </div>

                        {/* Homepage Moving Slider Speed Control for Shops, Categories, Brands */}
                        <div className="sm:col-span-2 pt-6 border-t border-slate-200 space-y-4">
                            <div>
                                <label className="block text-sm font-extrabold text-slate-800 flex items-center gap-2">
                                    <span>⚡</span> অটো স্লাইডার গতি নিয়ন্ত্রণ (Auto Scroll Speed Settings)
                                </label>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    প্রতিটি সেকশনের (শপ, ক্যাটাগরি, ব্র্যান্ড) অ্যানিমেশন চলাচলের গতি আপনার পছন্দমতো আলাদাভাবে সেটিং করতে পারেন।
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                {/* Shops Marquee Speed */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                        🏪 জনপ্রিয় শপ স্লাইডার গতি
                                    </label>
                                    <select
                                        value={data.marquee_speed_shops}
                                        onChange={e => setData('marquee_speed_shops', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                                    >
                                        <option value="10">⚡ অত্যন্ত দ্রুত (১০ সেকেন্ড)</option>
                                        <option value="15">🚀 দ্রুতগতি (১৫ সেকেন্ড)</option>
                                        <option value="20">🎯 স্বাভাবিক (২০ সেকেন্ড - Standard)</option>
                                        <option value="30">🐢 ধীরগতি (৩০ সেকেন্ড)</option>
                                        <option value="45">🐌 খুব ধীর (৪৫ সেকেন্ড)</option>
                                        <option value="0">⏸️ থমকে থাকা / বন্ধ (Static)</option>
                                    </select>
                                </div>

                                {/* Categories Marquee Speed */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                        📂 জনপ্রিয় ক্যাটাগরি গতি
                                    </label>
                                    <select
                                        value={data.marquee_speed_categories}
                                        onChange={e => setData('marquee_speed_categories', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                                    >
                                        <option value="10">⚡ অত্যন্ত দ্রুত (১০ সেকেন্ড)</option>
                                        <option value="15">🚀 দ্রুতগতি (১৫ সেকেন্ড)</option>
                                        <option value="20">🎯 স্বাভাবিক (২০ সেকেন্ড - Standard)</option>
                                        <option value="30">🐢 ধীরগতি (৩০ সেকেন্ড)</option>
                                        <option value="45">🐌 খুব ধীর (৪৫ সেকেন্ড)</option>
                                        <option value="0">⏸️ থমকে থাকা / বন্ধ (Static)</option>
                                    </select>
                                </div>

                                {/* Brands Marquee Speed */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                        🏷️ টপ ব্র্যান্ডস গতি
                                    </label>
                                    <select
                                        value={data.marquee_speed_brands}
                                        onChange={e => setData('marquee_speed_brands', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none bg-white"
                                    >
                                        <option value="10">⚡ অত্যন্ত দ্রুত (১০ সেকেন্ড)</option>
                                        <option value="15">🚀 দ্রুতগতি (১৫ সেকেন্ড)</option>
                                        <option value="20">🎯 স্বাভাবিক (২০ সেকেন্ড - Standard)</option>
                                        <option value="30">🐢 ধীরগতি (৩০ সেকেন্ড)</option>
                                        <option value="45">🐌 খুব ধীর (৪৫ সেকেন্ড)</option>
                                        <option value="0">⏸️ থমকে থাকা / বন্ধ (Static)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Master Coupon System ON / OFF Switch */}
                        <div className="sm:col-span-2 pt-6 border-t border-slate-200">
                            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-2 border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🎟️</span>
                                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                                            কুপন ও ডিসকাউন্ট অফার সিস্টেম (Coupon & Offers)
                                        </h4>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                            data.coupon_system_enabled 
                                                ? 'bg-emerald-600 text-white' 
                                                : 'bg-slate-300 text-slate-700'
                                        }`}>
                                            {data.coupon_system_enabled ? 'সক্রিয় (ON)' : 'বন্ধ (OFF)'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        এই অপশনটি চালু থাকলে গ্রাহকরা চেকআউট পেজে কুপন কোড ও প্রমোশনাল ডিসকাউন্ট অফার দেখতে ও ব্যবহার করতে পারবেন। বন্ধ রাখলে চেকআউট থেকে কুপন সেকশন সম্পূর্ণ অদৃশ্য থাকবে।
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                                    <span className="text-xs font-bold text-slate-700">
                                        {data.coupon_system_enabled ? 'চালু আছে' : 'বন্ধ আছে'}
                                    </span>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={data.coupon_system_enabled}
                                        onClick={() => setData('coupon_system_enabled', !data.coupon_system_enabled)}
                                        className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            data.coupon_system_enabled ? 'bg-emerald-600 shadow-md shadow-emerald-600/30' : 'bg-slate-300'
                                        }`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out flex items-center justify-center font-bold text-xs ${
                                                data.coupon_system_enabled ? 'translate-x-6 text-emerald-600' : 'translate-x-0 text-slate-300'
                                            }`}
                                        >
                                            {data.coupon_system_enabled ? '✓' : ''}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
