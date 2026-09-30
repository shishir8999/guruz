import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    RefreshCw, Plus, Search, Edit, Trash2, Tag, Calendar, 
    Percent, Power, CheckCircle2, AlertTriangle, X, 
    Layers, Copy, Check, Clock, Gift, ShieldAlert, Zap, Info, Edit3
} from 'lucide-react';
import Swal from 'sweetalert2';
import BonusCouponMessageModal, { BonusCouponMessageData } from '@/Components/BonusCouponMessageModal';

interface CouponItem {
    id: number;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order_amount?: number;
    max_discount_amount?: number;
    usage_limit?: number;
    used_count?: number;
    starts_at?: string;
    expires_at?: string;
    is_active: boolean;
}

interface WelcomeSettings {
    enabled: boolean;
    discount: number;
    type: 'percentage' | 'fixed';
    valid_hours: number;
    min_order_amount: number;
    max_discount_amount: number;
    prefix: string;
}

interface Props {
    coupons: CouponItem[];
    couponSystemEnabled?: boolean;
    welcomeSettings?: WelcomeSettings;
    bonus_coupon_message?: BonusCouponMessageData;
}

export default function Coupons({ coupons = [], couponSystemEnabled = true, welcomeSettings, bonus_coupon_message }: Props) {
    const [search, setSearch] = useState('');
    const [isSystemActive, setIsSystemActive] = useState(couponSystemEnabled);
    const [isToggling, setIsToggling] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [currentCouponMessage, setCurrentCouponMessage] = useState<BonusCouponMessageData | undefined>(bonus_coupon_message);

    // Welcome Bonus Settings Form
    const welcomeForm = useForm({
        enabled: welcomeSettings?.enabled ?? true,
        discount: welcomeSettings?.discount ?? 10,
        type: welcomeSettings?.type ?? 'percentage',
        valid_hours: welcomeSettings?.valid_hours ?? 72,
        min_order_amount: welcomeSettings?.min_order_amount ? String(welcomeSettings.min_order_amount) : '',
        max_discount_amount: welcomeSettings?.max_discount_amount ? String(welcomeSettings.max_discount_amount) : '',
        prefix: welcomeSettings?.prefix ?? 'WELCOME10',
    });

    const handleSaveWelcomeSettings = (e: React.FormEvent) => {
        e.preventDefault();
        welcomeForm.post('/admin/marketing/coupons/welcome-settings', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'ওয়েলকাম বোনাস সেটিংস সংরক্ষিত হয়েছে!',
                    text: 'নতুন গ্রাহকরা এখন এই নিয়ম অনুযায়ী কুপন পাবেন।',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false,
                });
            }
        });
    };

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        code: '',
        type: 'percentage',
        value: '',
        min_order_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        expires_at: '',
        is_active: true,
    });

    const addHoursToExpiry = (hours: number) => {
        const target = new Date(Date.now() + hours * 60 * 60 * 1000);
        const year = target.getFullYear();
        const month = String(target.getMonth() + 1).padStart(2, '0');
        const day = String(target.getDate()).padStart(2, '0');
        const hour = String(target.getHours()).padStart(2, '0');
        const min = String(target.getMinutes()).padStart(2, '0');
        setData('expires_at', `${year}-${month}-${day}T${hour}:${min}`);
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleSystemToggle = () => {
        const nextState = !isSystemActive;
        setIsToggling(true);

        router.post('/admin/marketing/coupons/toggle-system', { enabled: nextState }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSystemActive(nextState);
                setIsToggling(false);
                Swal.fire({
                    title: nextState ? 'কুপন সিস্টেম সক্রিয় করা হয়েছে!' : 'কুপন সিস্টেম বন্ধ করা হয়েছে!',
                    text: nextState 
                        ? 'গ্রাহকরা এখন চেকআউট ও কার্টে কুপন ব্যবহার করে ডিসকাউন্ট উপভোগ করতে পারবেন।' 
                        : 'চেকআউট পেজে কুপন সেকশন বন্ধ রাখা হয়েছে।',
                    icon: nextState ? 'success' : 'warning',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
            },
            onError: () => {
                setIsToggling(false);
            }
        });
    };

    const openAddModal = () => {
        setEditingCoupon(null);
        clearErrors();
        reset();
        setData({
            code: '',
            type: 'percentage',
            value: '',
            min_order_amount: '',
            max_discount_amount: '',
            usage_limit: '',
            expires_at: '',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (coupon: CouponItem) => {
        setEditingCoupon(coupon);
        clearErrors();
        setData({
            code: coupon.code,
            type: coupon.type,
            value: String(coupon.value),
            min_order_amount: coupon.min_order_amount ? String(coupon.min_order_amount) : '',
            max_discount_amount: coupon.max_discount_amount ? String(coupon.max_discount_amount) : '',
            usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
            expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 16) : '',
            is_active: Boolean(coupon.is_active),
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCoupon) {
            put(`/admin/marketing/coupons/${editingCoupon.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        icon: 'success',
                        title: 'কুপন আপডেট হয়েছে!',
                        text: 'কুপনটির তথ্য সফলভাবে হালনাগাদ করা হয়েছে।',
                        toast: true,
                        position: 'top-end',
                        timer: 2500,
                        showConfirmButton: false,
                    });
                }
            });
        } else {
            post('/admin/marketing/coupons', {
                preserveScroll: true,
                onSuccess: () => {
                    closeModal();
                    Swal.fire({
                        icon: 'success',
                        title: 'নতুন কুপন তৈরি হয়েছে!',
                        text: 'কুপনটি সফলভাবে সংরক্ষণ করা হয়েছে।',
                        toast: true,
                        position: 'top-end',
                        timer: 2500,
                        showConfirmButton: false,
                    });
                }
            });
        }
    };

    const handleDelete = (coupon: CouponItem) => {
        Swal.fire({
            title: 'কুপনটি মুছে ফেলতে চান?',
            text: `আপনি কি নিশ্চিত যে কুপন কোড "${coupon.code}" মুছে ফেলতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'বাতিল',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/marketing/coupons/${coupon.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'মুছে ফেলা হয়েছে!',
                            text: 'কুপনটি সফলভাবে মুছে ফেলা হয়েছে।',
                            toast: true,
                            position: 'top-end',
                            timer: 2500,
                            showConfirmButton: false,
                        });
                    }
                });
            }
        });
    };

    const handleToggleStatus = (id: number) => {
        router.post(`/admin/marketing/coupons/${id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'স্ট্যাটাস পরিবর্তিত হয়েছে!',
                    toast: true,
                    position: 'top-end',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        });
    };

    // Filter coupons by search
    const filteredCoupons = coupons.filter(coupon => 
        coupon.code.toLowerCase().includes(search.toLowerCase())
    );

    const totalActive = coupons.filter(c => c.is_active).length;
    const totalUsed = coupons.reduce((acc, c) => acc + (c.used_count || 0), 0);

    return (
        <>
            <Head title="Coupons & Discounts — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* ─── MASTER COUPON SYSTEM TOGGLE BANNER ─── */}
                <div className={`p-6 rounded-3xl border-2 transition-all shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${
                    isSystemActive 
                        ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-500/30' 
                        : 'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white border-slate-700'
                }`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-inner ${
                            isSystemActive ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                            <Tag size={28} />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                                    Master Coupon Discount System
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
                                    isSystemActive 
                                        ? 'bg-white text-emerald-800' 
                                        : 'bg-rose-500 text-white'
                                }`}>
                                    <Power size={12} strokeWidth={3} />
                                    <span>{isSystemActive ? 'ACTIVE (চালু)' : 'DISABLED (বন্ধ)'}</span>
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-100 font-medium opacity-90">
                                {isSystemActive 
                                    ? 'কুপন সিস্টেম বর্তমানে সক্রিয় রয়েছে। গ্রাহকরা চেকআউটে অফার ও কুপন কোড ব্যবহার করতে পারবেন।' 
                                    : 'কুপন সিস্টেম সাময়িকভাবে বন্ধ রাখা হয়েছে। চেকআউটে কোনো কুপন অপশন প্রদর্শিত হবে না।'}
                            </p>
                        </div>
                    </div>

                    {/* Master Switch Button */}
                    <div className="shrink-0 flex items-center gap-3 bg-black/20 p-2 rounded-2xl border border-white/10">
                        <span className="text-xs font-bold pl-2 hidden sm:inline">
                            {isSystemActive ? 'সিস্টেম চালু' : 'সিস্টেম বন্ধ'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isSystemActive}
                                disabled={isToggling}
                                onChange={handleSystemToggle}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-400"></div>
                        </label>
                    </div>
                </div>

                {/* ─── WELCOME BONUS COUPON SETTINGS PANEL ─── */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
                                <Gift className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                                        ওয়েলকাম বোনাস কুপন কনফিগারেশন (Welcome Bonus Coupon Settings)
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-700 dark:text-fuchsia-300">
                                        স্বয়ংক্রিয় উপহার
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                    নতুন কাস্টমার রেজিস্ট্রেশন করার পর তার একাউন্টে যে বোনাস কুপনটি পাবে, তার সময়সীমা (ঘণ্টা/দিন) ও লিমিটেশন এখান থেকে সম্পূর্ণ নিয়ন্ত্রণ করুন।
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setIsMessageModalOpen(true)}
                                className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                title="কাস্টমার ড্যাশবোর্ডে যখন কুপন থাকবে না তখন যে বার্তাটি দেখাবে তা এডিট করুন"
                            >
                                <Edit3 className="w-4 h-4 text-indigo-600" />
                                <span>কাস্টমার ড্যাশবোর্ড বার্তা এডিট</span>
                            </button>

                            {/* Enable / Disable toggle */}
                            <label className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {welcomeForm.data.enabled ? 'ওয়েলকাম কুপন সক্রিয়' : 'ওয়েলকাম কুপন বন্ধ'}
                                </span>
                                <input 
                                    type="checkbox"
                                    checked={welcomeForm.data.enabled}
                                    onChange={e => welcomeForm.setData('enabled', e.target.checked)}
                                    className="w-4 h-4 text-fuchsia-600 rounded focus:ring-fuchsia-500 border-slate-300"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSaveWelcomeSettings} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                            {/* Coupon Prefix */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    কুপন কোড প্রিফিক্স (Code Prefix) <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={welcomeForm.data.prefix}
                                    onChange={e => welcomeForm.setData('prefix', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                                    placeholder="যেমন: WELCOME10"
                                    className="w-full uppercase font-mono font-bold px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-fuchsia-500"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block font-mono">জেনারেট হবে: {welcomeForm.data.prefix || 'WELCOME10'}-XXXX</span>
                            </div>

                            {/* Discount Type & Value */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    ছাড়ের পরিমাণ ({welcomeForm.data.type === 'percentage' ? '%' : '৳'}) <span className="text-rose-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={welcomeForm.data.type}
                                        onChange={e => welcomeForm.setData('type', e.target.value as 'percentage' | 'fixed')}
                                        className="w-24 shrink-0 px-2.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-fuchsia-500"
                                    >
                                        <option value="percentage">% শতকরা</option>
                                        <option value="fixed">৳ নির্দিষ্ট</option>
                                    </select>
                                    <input 
                                        type="number"
                                        min="0.01"
                                        step="any"
                                        required
                                        value={welcomeForm.data.discount}
                                        onChange={e => welcomeForm.setData('discount', Number(e.target.value))}
                                        className="w-full font-bold px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-fuchsia-500"
                                    />
                                </div>
                            </div>

                            {/* Minimum Order Amount */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    সর্বনিম্ন অর্ডার সীমা (Min Order ৳)
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    value={welcomeForm.data.min_order_amount}
                                    onChange={e => welcomeForm.setData('min_order_amount', e.target.value)}
                                    placeholder="যেমন: 500 (০ দিলে সব অর্ডার)"
                                    className="w-full font-semibold px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-fuchsia-500"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">ফাঁকা বা ০ রাখলে যেকোনো মূল্যে প্রযোজ্য</span>
                            </div>

                            {/* Maximum Discount Amount */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    সর্বোচ্চ ছাড় সীমা (Max Discount ৳)
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    value={welcomeForm.data.max_discount_amount}
                                    onChange={e => welcomeForm.setData('max_discount_amount', e.target.value)}
                                    placeholder="যেমন: 200 (ঐচ্ছিক)"
                                    className="w-full font-semibold px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-fuchsia-500"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">ফাঁকা বা ০ রাখলে কোনো ক্যাপ নেই</span>
                            </div>
                        </div>

                        {/* Validity Duration Section */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <div>
                                    <label className="block text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-fuchsia-600" />
                                        ব্যবহারের মেয়াদ ও টাইম ঘণ্টা (Validity Duration in Hours) <span className="text-rose-500">*</span>
                                    </label>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        কাস্টমার একাউন্ট খোলার পর কত ঘণ্টার মধ্যে এই কুপন কোডটি ব্যবহার করতে হবে তা নির্দিষ্ট করে দিন।
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">বর্তমান মেয়াদ:</span>
                                    <span className="px-3 py-1 bg-fuchsia-100 dark:bg-fuchsia-900/60 text-fuchsia-800 dark:text-fuchsia-200 font-mono font-black text-sm rounded-xl">
                                        {welcomeForm.data.valid_hours} ঘণ্টা ({Math.round((welcomeForm.data.valid_hours / 24) * 10) / 10} দিন)
                                    </span>
                                </div>
                            </div>

                            {/* Hours Input & Preset Quick Buttons */}
                            <div className="space-y-2.5">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <div className="relative flex-1 max-w-xs">
                                        <input 
                                            type="number"
                                            min="1"
                                            max="87600"
                                            required
                                            value={welcomeForm.data.valid_hours}
                                            onChange={e => welcomeForm.setData('valid_hours', Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-full font-mono font-black text-base px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-fuchsia-500"
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                                            ঘণ্টা (Hours)
                                        </span>
                                    </div>

                                    {/* Quick Preset Chips */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {[
                                            { hours: 12, label: '১২ ঘণ্টা' },
                                            { hours: 24, label: '২৪ ঘণ্টা (১ দিন)' },
                                            { hours: 48, label: '৪৮ ঘণ্টা (২ দিন)' },
                                            { hours: 72, label: '৭২ ঘণ্টা (৩ দিন)' },
                                            { hours: 168, label: '৭ দিন (১৬৮ ঘণ্টা)' },
                                            { hours: 360, label: '১৫ দিন' },
                                            { hours: 720, label: '৩০ দিন' },
                                        ].map(preset => (
                                            <button
                                                key={preset.hours}
                                                type="button"
                                                onClick={() => welcomeForm.setData('valid_hours', preset.hours)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                                                    welcomeForm.data.valid_hours === preset.hours
                                                        ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-xs'
                                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Preview & Save Button */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/60 via-purple-50/60 to-indigo-50/60 dark:from-slate-800/60 dark:to-slate-800/30 border border-purple-100 dark:border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                                    <Gift className="w-3.5 h-3.5 text-purple-600" />
                                    কাস্টমার ড্যাশবোর্ড ও মোবাইল ভিউ প্রিভিউ:
                                </span>
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs">
                                        🏷️ {welcomeForm.data.prefix || 'WELCOME10'}-XXXX
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold">
                                        🎁 {welcomeForm.data.discount}{welcomeForm.data.type === 'percentage' ? '%' : '৳'} ছাড়
                                    </span>
                                    {Number(welcomeForm.data.min_order_amount) > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-lg text-xs font-bold">
                                            🛒 সর্বনিম্ন অর্ডার: ৳{welcomeForm.data.min_order_amount}
                                        </span>
                                    )}
                                    {Number(welcomeForm.data.max_discount_amount) > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-bold">
                                            🛡️ সর্বোচ্চ ছাড়: ৳{welcomeForm.data.max_discount_amount}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 rounded-lg text-xs font-bold">
                                        ⏱️ লাইভ টাইমার: {welcomeForm.data.valid_hours} ঘণ্টা
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={welcomeForm.processing}
                                className="shrink-0 w-full md:w-auto bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {welcomeForm.processing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>সংরক্ষণ হচ্ছে...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>ওয়েলকাম কুপন সেটিংস সংরক্ষণ করুন</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Header Title Section & Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded">
                                Marketing
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Promotional Vouchers</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Coupons List (কুপন তালিকা)</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            সহজেই নতুন ডিসকাউন্ট কুপন তৈরি ও নিয়ন্ত্রণ করুন।
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> রিফ্রেশ
                        </button>
                        <button 
                            onClick={openAddModal}
                            className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> নতুন কুপন যোগ করুন (Add Coupon)
                        </button>
                    </div>
                </div>

                {/* Toolbar & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="কুপন কোড দিয়ে খুঁজুন..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl pl-9 pr-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:text-white transition"
                        />
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <span>মোট: <strong className="text-slate-900 dark:text-white">{coupons.length}</strong></span>
                        <span>•</span>
                        <span>সক্রিয়: <strong className="text-emerald-600">{totalActive}</strong></span>
                        <span>•</span>
                        <span>মোট ব্যবহার: <strong className="text-indigo-600">{totalUsed} বার</strong></span>
                    </div>
                </div>

                {/* Coupons Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Coupon Code</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Discount</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Min Order</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Max Limit</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usage</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expires At</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredCoupons.length > 0 ? filteredCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    {coupon.code}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(coupon.code)}
                                                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
                                                    title="Copy Code"
                                                >
                                                    {copiedCode === coupon.code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                                {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `৳${Number(coupon.value).toLocaleString()} Flat`}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {coupon.min_order_amount ? `৳${Number(coupon.min_order_amount).toLocaleString()}` : 'যেকোনো'}
                                        </td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                                            {coupon.max_discount_amount ? `৳${Number(coupon.max_discount_amount).toLocaleString()}` : 'সীমাহীন'}
                                        </td>
                                        <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                                            {coupon.used_count || 0} / {coupon.usage_limit || '∞'}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500 font-medium">
                                            {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' }) : 'আজীবন'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(coupon.id)}
                                                className={`px-3 py-1 rounded-full text-[11px] font-black uppercase transition cursor-pointer ${
                                                    coupon.is_active 
                                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400' 
                                                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-400'
                                                }`}
                                            >
                                                {coupon.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(coupon)}
                                                    className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                                    title="Edit Coupon"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon)}
                                                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                                    title="Delete Coupon"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-12 text-slate-400 text-xs font-medium">
                                            কোনো কুপন পাওয়া যায়নি। "Add New Coupon" বাটনে ক্লিক করে নতুন কুপন তৈরি করুন।
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ─── ADD / EDIT COUPON MODAL ─── */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                        <div 
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center font-bold">
                                        <Tag size={18} />
                                    </div>
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white">
                                        {editingCoupon ? 'কুপন এডিট করুন (Edit Coupon)' : 'নতুন কুপন যোগ করুন (Add New Coupon)'}
                                    </h3>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={closeModal} 
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                {/* Coupon Code */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Coupon Code (কুপন কোড) <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value.toUpperCase().replace(/\s+/g, ''))}
                                        placeholder="যেমন: EID2026, WELCOME10, GURUZ50"
                                        className="w-full uppercase font-mono font-bold px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                    />
                                    {errors.code && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.code}</p>}
                                </div>

                                {/* Discount Type & Value */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Discount Type (ধরন) <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={e => setData('type', e.target.value as 'percentage' | 'fixed')}
                                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                        >
                                            <option value="percentage">শতাংশ (%) ছাড়</option>
                                            <option value="fixed">নির্দিষ্ট টাকা (Flat ৳) ছাড়</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            {data.type === 'percentage' ? 'ছাড়ের হার (%)' : 'ছাড়ের পরিমাণ (৳)'} <span className="text-rose-500">*</span>
                                        </label>
                                        <input 
                                            type="number"
                                            required
                                            min="0.01"
                                            step="any"
                                            value={data.value}
                                            onChange={e => setData('value', e.target.value)}
                                            placeholder={data.type === 'percentage' ? 'যেমন: 10 (10%)' : 'যেমন: 50 (৳50)'}
                                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                        />
                                        {errors.value && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.value}</p>}
                                    </div>
                                </div>

                                {/* Minimum Order Amount & Max Discount */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            সর্বনিম্ন অর্ডার মূল্য (৳)
                                        </label>
                                        <input 
                                            type="number"
                                            min="0"
                                            value={data.min_order_amount}
                                            onChange={e => setData('min_order_amount', e.target.value)}
                                            placeholder="যেমন: 500 (ফাঁকা রাখলে যেকোনো মূল্য)"
                                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            সর্বোচ্চ ছাড় সীমা (Max Discount ৳)
                                        </label>
                                        <input 
                                            type="number"
                                            min="0"
                                            value={data.max_discount_amount}
                                            onChange={e => setData('max_discount_amount', e.target.value)}
                                            placeholder="যেমন: 200 (ঐচ্ছিক)"
                                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                        />
                                    </div>
                                </div>

                                {/* Usage Limit & Expiry Date */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            ব্যবহারের মোট সীমা (Usage Limit)
                                        </label>
                                        <input 
                                            type="number"
                                            min="1"
                                            value={data.usage_limit}
                                            onChange={e => setData('usage_limit', e.target.value)}
                                            placeholder="যেমন: 100 (ফাঁকা রাখলে আনলিমিটেড)"
                                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                                মেয়াদ শেষ হওয়ার তারিখ ও সময় (Expiry Date & Time)
                                            </label>
                                        </div>
                                        <input 
                                            type="datetime-local"
                                            value={data.expires_at}
                                            onChange={e => setData('expires_at', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                                        />
                                        {/* Quick hours buttons */}
                                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                            <span className="text-[10px] font-bold text-slate-400">দ্রুত মেয়াদ যোগ:</span>
                                            {[
                                                { label: '+১২ ঘণ্টা', hours: 12 },
                                                { label: '+২৪ ঘণ্টা', hours: 24 },
                                                { label: '+৪৮ ঘণ্টা', hours: 48 },
                                                { label: '+৭ দিন', hours: 168 },
                                                { label: '+৩০ দিন', hours: 720 },
                                            ].map(btn => (
                                                <button
                                                    key={btn.hours}
                                                    type="button"
                                                    onClick={() => addHoursToExpiry(btn.hours)}
                                                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-orange-100 hover:text-orange-700 dark:hover:bg-orange-950/60 dark:hover:text-orange-300 transition"
                                                >
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Active Toggle */}
                                <div className="pt-2">
                                    <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={e => setData('is_active', e.target.checked)}
                                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 border-slate-300"
                                        />
                                        <div>
                                            <span className="text-xs font-black text-slate-800 dark:text-white block">কুপনটি সক্রিয় রাখুন (Active)</span>
                                            <span className="text-[11px] text-slate-500 block">আনচেক করলে গ্রাহকরা এই কুপন কোড ব্যবহার করতে পারবেন না।</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Modal Actions */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={closeModal} 
                                        className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                    >
                                        বাতিল (Cancel)
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="px-6 py-2.5 text-xs font-black text-white bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-md shadow-orange-600/20 transition cursor-pointer flex items-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                <span>সংরক্ষণ হচ্ছে...</span>
                                            </>
                                        ) : (
                                            <span>{editingCoupon ? 'কুপন আপডেট করুন' : 'কুপন সেভ করুন'}</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* Bonus Coupon Empty Message Customizer Modal */}
            <BonusCouponMessageModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                initialData={currentCouponMessage}
                onSuccess={(updated) => setCurrentCouponMessage(updated)}
            />
        </>
    );
}