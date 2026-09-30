import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface NoticeSettings {
    is_active: boolean;
    scroll_duration_seconds: number;
    notices_en: string;
    notices_bn: string;
}

interface WidgetSettings {
    is_active: boolean;
    interval_seconds: number;
    display_duration_seconds: number;
    messages_raw: string;
}

export default function NoticeMarqueePage({
    settings,
    widgetSettings
}: {
    settings: NoticeSettings;
    widgetSettings?: WidgetSettings;
}) {
    const { data, setData, post, processing } = useForm({
        is_active: settings.is_active ?? true,
        scroll_duration_seconds: settings.scroll_duration_seconds ?? 8,
        notices_en: settings.notices_en ?? '',
        notices_bn: settings.notices_bn ?? '',
        widget_is_active: widgetSettings?.is_active ?? true,
        widget_interval_seconds: widgetSettings?.interval_seconds ?? 6,
        widget_display_duration_seconds: widgetSettings?.display_duration_seconds ?? 5,
        widget_messages_raw: widgetSettings?.messages_raw ?? "করিম (ঢাকা) — ১ মিনিট আগে স্পার্ক হাই ভোল্টেজ ক্যাবল অর্ডার করেছেন\nআরিফ (চট্টগ্রাম) — ২ মিনিট আগে গুরুজ প্রিমিয়াম এক্সটেনশন সকেট অর্ডার করেছেন\nশফিক (সিলেট) — ৩ মিনিট আগে সার্ভিস ক্লেইম অর্ডার করেছেন\nতানজিনা (রাজশাহী) — ৫ মিনিট আগে ১.৫ আরএম প্রোডাক্ট অর্ডার করেছেন\nসুমন (খুলনা) — ৭ মিনিট আগে ২.৫ আরএম তার অর্ডার করেছেন\nকামরুল (কুমিল্লা) — ১০ মিনিট আগে ক্যাবল সকেট অর্ডার করেছেন\nআফরোজা (বরিশাল) — ১৫ মিনিট আগে পাওয়ার প্রোডাক্টস অর্ডার করেছেন\nএই মুহূর্তে Guruz e-commerce-এ 41,258 জন মানুষ পণ্য দেখছেন।",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        router.post('/admin/appearance/notice-marquee', data as any, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Saved Successfully',
                    text: 'Notice marquee and live popup settings updated.',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            },
            onError: (err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Update Failed',
                    text: 'Please check the form for errors.',
                    confirmButtonColor: '#10b981'
                });
            }
        });
    };

    const getSpeedLabel = (seconds: number) => {
        if (seconds <= 2) return 'Ultra';
        if (seconds <= 8) return 'Very fast';
        if (seconds <= 15) return 'Fast';
        if (seconds <= 30) return 'Medium';
        if (seconds <= 60) return 'Slow';
        return 'Very slow';
    };

    const presets = [
        { label: '🐢 Very slow', value: 120 },
        { label: '🐌 Slow', value: 60 },
        { label: 'Medium', value: 30 },
        { label: 'Fast', value: 15 },
        { label: '⚡ Very fast', value: 8 },
        { label: '🚀 Ultra', value: 2 },
    ];

    return (
        <div className="max-w-5xl text-gray-800 pb-16">
            <Head title="Notice Marquee & Live Popup Widget" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notice Marquee & Live Popup Controls</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Control top marquee scroll text, speed and lower-left live customer purchase popup rotation timer & names.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Panel 1: Enable Marquee */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Enable top marquee</h2>
                        <p className="text-sm text-gray-500 mt-1">Turn the scrolling notice bar on or off.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {data.is_active && (
                            <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-md">
                                Active
                            </span>
                        )}
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Panel 2: Scroll Speed */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-base font-semibold text-gray-800">Scroll speed</h2>
                        <span className="text-xs text-gray-500">
                            {getSpeedLabel(data.scroll_duration_seconds)} - {data.scroll_duration_seconds}s / loop
                        </span>
                    </div>

                    <div className="mb-6">
                        <input
                            type="range"
                            min="2"
                            max="120"
                            step="1"
                            value={data.scroll_duration_seconds}
                            onChange={(e) => setData('scroll_duration_seconds', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            style={{ direction: 'rtl' }}
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>← Slower</span>
                            <span>Faster →</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-sm text-gray-600">Exact duration (seconds per loop):</span>
                        <input
                            type="number"
                            min="1"
                            max="300"
                            value={data.scroll_duration_seconds}
                            onChange={(e) => setData('scroll_duration_seconds', parseInt(e.target.value) || 8)}
                            className="w-20 rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-center py-1"
                        />
                        <span className="text-xs text-gray-400">(lower = faster)</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-8">
                        <span className="text-sm text-gray-500 mr-2">Quick presets:</span>
                        {presets.map((preset) => (
                            <button
                                key={preset.value}
                                type="button"
                                onClick={() => setData('scroll_duration_seconds', preset.value)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                                    data.scroll_duration_seconds === preset.value
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {preset.label} ({preset.value}s)
                            </button>
                        ))}
                    </div>

                    {/* Preview Banner */}
                    <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg overflow-hidden flex items-center h-10 shadow-inner">
                        <div className="whitespace-nowrap flex text-white font-medium text-sm">
                            <div 
                                className="inline-block animate-marquee"
                                style={{ animationDuration: `${data.scroll_duration_seconds}s` }}
                            >
                                <span className="mx-4 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded">PREVIEW</span>
                                Preview marquee — adjust speed above &bull; 
                                <span className="mx-4 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded">PREVIEW</span>
                                Preview marquee — adjust speed above &bull;
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel 3: Notices Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-800 mb-1">English notices</h2>
                        <p className="text-xs text-gray-500 mb-4">One notice per line.</p>
                        <textarea
                            rows={4}
                            value={data.notices_en}
                            onChange={(e) => setData('notices_en', e.target.value)}
                            className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm sm:text-sm p-4"
                            placeholder="🚚 Welcome to Guruz&#10;🚚 Free Delivery on orders over ৳1000"
                        ></textarea>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-base font-semibold text-gray-800 mb-1">বাংলা নোটিশ</h2>
                        <p className="text-xs text-gray-500 mb-4">প্রতিটি নোটিশ আলাদা লাইনে লিখুন।</p>
                        <textarea
                            rows={4}
                            value={data.notices_bn}
                            onChange={(e) => setData('notices_bn', e.target.value)}
                            className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500 shadow-sm sm:text-sm p-4"
                            placeholder="🚚 গুরুজ-এ স্বাগতম&#10;🚚 ১০০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি"
                        ></textarea>
                    </div>
                </div>

                {/* ─── LIVE POPUP PURCHASES & VISITOR WIDGET CONTROLS ─── */}
                <div className="bg-white rounded-xl shadow-md border border-emerald-100 p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                                Live Customer Purchase & Visitor Toast Popup Widget
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                ওয়েবসাইটের নিচে বাম পাশে পর্যায়ক্রমে বিভিন্ন কাস্টমারের নাম, অর্ডার ও টাইম নোটিফিকেশন এডিট এবং টাইমার কন্ট্রোল করার সেটিং।
                            </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={data.widget_is_active}
                                onChange={(e) => setData('widget_is_active', e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                টাইমার ইন্টারভাল (কত সেকেন্ড পর পর নতুন নাম আসবে):
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="300"
                                    value={data.widget_interval_seconds}
                                    onChange={(e) => setData('widget_interval_seconds', parseInt(e.target.value) || 5)}
                                    className="w-24 rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm font-bold text-center py-2"
                                />
                                <span className="text-xs text-gray-500 font-semibold">সেকেন্ড</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                ডিসপ্লে ডিউরেশন (পপআপ স্ক্রিনে কত সেকেন্ড থাকবে):
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="300"
                                    value={data.widget_display_duration_seconds}
                                    onChange={(e) => setData('widget_display_duration_seconds', parseInt(e.target.value) || 4)}
                                    className="w-24 rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm font-bold text-center py-2"
                                />
                                <span className="text-xs text-gray-500 font-semibold">সেকেন্ড</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                            ঘুরন্ত কাস্টমার নাম ও মেসেজ তালিকা (প্রতিটি মেসেজ নতুন লাইনে লিখুন):
                        </label>
                        <textarea
                            rows={8}
                            value={data.widget_messages_raw}
                            onChange={(e) => setData('widget_messages_raw', e.target.value)}
                            className="w-full rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm text-xs font-medium p-4 leading-relaxed"
                            placeholder="করিম (ঢাকা) — ১ মিনিট আগে স্পার্ক হাই ভোল্টেজ ক্যাবল অর্ডার করেছেন&#10;আরিফ (চট্টগ্রাম) — ২ মিনিট আগে প্রোডাক্ট অর্ডার করেছেন"
                        ></textarea>
                        <p className="text-[11px] text-emerald-600 font-bold mt-1">
                            💡 টিপস: আপনি এখানে ইচ্ছেমতো কাস্টমারের নাম, এলাকা এবং বিভিন্ন টাইম ও অর্ডারের কথা পর পর প্রতি লাইনে লিখে সেভ করতে পারবেন। ওয়েবসাইট নিজে থেকেই এগুলো বারবার ঘুরিয়ে ঘুরিয়ে দেখাবে।
                        </p>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all shadow-md"
                    >
                        {processing ? 'Saving Settings...' : 'Save All Settings'}
                    </button>
                </div>
            </form>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee linear infinite;
                    display: inline-block;
                    white-space: nowrap;
                    will-change: transform;
                }
            `}</style>
        </div>
    );
}
