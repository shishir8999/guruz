import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Truck, Save, CheckCircle2, MapPin, Clock, ShieldCheck, Gift } from 'lucide-react';
import Swal from 'sweetalert2';

interface DeliveryChargeItem {
    id: number;
    code: string;
    title: string;
    title_en?: string;
    charge: number;
    estimated_days?: string;
    is_default: boolean;
    is_active: boolean;
}

interface Props {
    settings: {
        shipping_inside_dhaka?: string;
        shipping_outside_dhaka?: string;
        estimated_days_inside?: string;
        estimated_days_outside?: string;
        default_zone?: string;
        free_delivery_above?: string;
    };
    deliveryCharges?: DeliveryChargeItem[];
}

export default function ShippingRates({ settings, deliveryCharges }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        shipping_inside_dhaka: settings?.shipping_inside_dhaka || '80',
        shipping_outside_dhaka: settings?.shipping_outside_dhaka || '120',
        estimated_days_inside: settings?.estimated_days_inside || '২-৩ দিন',
        estimated_days_outside: settings?.estimated_days_outside || '৩-৫ দিন',
        default_zone: settings?.default_zone || 'inside_dhaka',
        free_delivery_above: settings?.free_delivery_above || '0',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/delivery-charges', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'সফল হয়েছে!',
                    text: 'ডেলিভারি চার্জের হার এবং সেটিংস সফলভাবে আপডেট হয়েছে।',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        });
    };

    return (
        <>
            <Head title="ডেলিভারি চার্জ কনফিগারেশন" />

            <div className="max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">ডেলিভারি চার্জ কনফিগারেশন</h2>
                            <p className="text-xs text-slate-500 font-medium">ঢাকার ভিতরে এবং ঢাকার বাইরে ডেলিভারি ফি ও সময়সীমা নির্ধারণ করুন</p>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>সুপার অ্যাডমিন কন্ট্রোল</span>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs p-6 md:p-8 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* 2 Zones Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Inside Dhaka Card */}
                            <div className={`p-5 rounded-2xl border-2 transition-all space-y-4 ${
                                data.default_zone === 'inside_dhaka'
                                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-emerald-600" />
                                        <div>
                                            <h3 className="font-black text-sm text-slate-900 dark:text-white">ঢাকার ভিতরে (Inside Dhaka)</h3>
                                            <p className="text-[11px] text-slate-400 font-medium">মেট্রোপলিটন ও নিকটবর্তী এরিয়া</p>
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="default_zone"
                                            value="inside_dhaka"
                                            checked={data.default_zone === 'inside_dhaka'}
                                            onChange={() => setData('default_zone', 'inside_dhaka')}
                                            className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        />
                                        <span>ডিফল্ট সিলেক্টেড</span>
                                    </label>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        ডেলিভারি চার্জ (টাকা ৳)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">৳</span>
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={data.shipping_inside_dhaka}
                                            onChange={e => setData('shipping_inside_dhaka', e.target.value)}
                                            className={`w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 border ${errors.shipping_inside_dhaka ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                                            placeholder="80"
                                        />
                                    </div>
                                    {errors.shipping_inside_dhaka && <p className="text-xs text-red-500">{errors.shipping_inside_dhaka}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" /> সম্ভাব্য সময়সীমা
                                    </label>
                                    <input
                                        type="text"
                                        value={data.estimated_days_inside}
                                        onChange={e => setData('estimated_days_inside', e.target.value)}
                                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="২-৩ দিন"
                                    />
                                </div>
                            </div>

                            {/* Outside Dhaka Card */}
                            <div className={`p-5 rounded-2xl border-2 transition-all space-y-4 ${
                                data.default_zone === 'outside_dhaka'
                                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-indigo-600" />
                                        <div>
                                            <h3 className="font-black text-sm text-slate-900 dark:text-white">ঢাকার বাইরে (Outside Dhaka)</h3>
                                            <p className="text-[11px] text-slate-400 font-medium">সমগ্র বাংলাদেশ জেলা/উপজেলা</p>
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="default_zone"
                                            value="outside_dhaka"
                                            checked={data.default_zone === 'outside_dhaka'}
                                            onChange={() => setData('default_zone', 'outside_dhaka')}
                                            className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        />
                                        <span>ডিফল্ট সিলেক্টেড</span>
                                    </label>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        ডেলিভারি চার্জ (টাকা ৳)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">৳</span>
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={data.shipping_outside_dhaka}
                                            onChange={e => setData('shipping_outside_dhaka', e.target.value)}
                                            className={`w-full pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 border ${errors.shipping_outside_dhaka ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                                            placeholder="120"
                                        />
                                    </div>
                                    {errors.shipping_outside_dhaka && <p className="text-xs text-red-500">{errors.shipping_outside_dhaka}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" /> সম্ভাব্য সময়সীমা
                                    </label>
                                    <input
                                        type="text"
                                        value={data.estimated_days_outside}
                                        onChange={e => setData('estimated_days_outside', e.target.value)}
                                        className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="৩-৫ দিন"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Free Delivery Threshold */}
                        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-2">
                            <div className="flex items-center gap-2">
                                <Gift className="w-4 h-4 text-amber-500" />
                                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    নির্দিষ্ট টাকার বেশি অর্ডারে ফ্রি ডেলিভারি (ঐচ্ছিক)
                                </label>
                            </div>
                            <div className="relative max-w-xs">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">৳</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.free_delivery_above}
                                    onChange={e => setData('free_delivery_above', e.target.value)}
                                    className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="0"
                                />
                            </div>
                            <p className="text-[11px] text-slate-500">০ (শূন্য) রাখলে ফ্রি ডেলিভারি অফার নিষ্ক্রিয় থাকবে।</p>
                        </div>

                        {/* Live Customer Preview */}
                        <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-purple-950/20 space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                                <span>📱 চেকআউট পেজে কাস্টমার যেভাবে অপশনটি দেখতে পাবেন (Live Preview)</span>
                            </h4>

                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-2">
                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                                    <Truck className="w-4 h-4 text-slate-500" /> ডেলিভারি এরিয়া সিলেক্ট করুন:
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition ${
                                        data.default_zone === 'inside_dhaka'
                                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                                data.default_zone === 'inside_dhaka' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'
                                            }`}>
                                                {data.default_zone === 'inside_dhaka' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">ঢাকার ভিতরে</p>
                                                <p className="text-[10px] text-slate-500">{data.estimated_days_inside || '২-৩ দিন'}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-emerald-600">৳{data.shipping_inside_dhaka}</span>
                                    </div>

                                    <div className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition ${
                                        data.default_zone === 'outside_dhaka'
                                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                                            : 'border-slate-200 dark:border-slate-700'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                                                data.default_zone === 'outside_dhaka' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'
                                            }`}>
                                                {data.default_zone === 'outside_dhaka' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">ঢাকার বাইরে</p>
                                                <p className="text-[10px] text-slate-500">{data.estimated_days_outside || '৩-৫ দিন'}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-emerald-600">৳{data.shipping_outside_dhaka}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>{processing ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন (Save Changes)'}</span>
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}
