import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import * as Icons from 'lucide-react';

interface FeatureBadge {
    id: string;
    label_en: string;
    label_bn: string;
    icon: string;
    gradient_from: string;
    gradient_to: string;
    is_active: boolean;
}

interface ProfileCardSettings {
    is_active: boolean;
    text_bn: string;
    discount_percentage: string;
    link_url: string;
}

const colorOptions = [
    { value: 'slate-500', label: 'Slate' },
    { value: 'gray-500', label: 'Gray' },
    { value: 'red-500', label: 'Red' },
    { value: 'orange-500', label: 'Orange' },
    { value: 'amber-500', label: 'Amber' },
    { value: 'yellow-500', label: 'Yellow' },
    { value: 'green-500', label: 'Green' },
    { value: 'emerald-500', label: 'Emerald' },
    { value: 'teal-500', label: 'Teal' },
    { value: 'cyan-500', label: 'Cyan' },
    { value: 'sky-500', label: 'Sky' },
    { value: 'blue-500', label: 'Blue' },
    { value: 'indigo-500', label: 'Indigo' },
    { value: 'purple-500', label: 'Purple' },
    { value: 'fuchsia-500', label: 'Fuchsia' },
    { value: 'pink-500', label: 'Pink' },
    { value: 'rose-500', label: 'Rose' },
];

const iconOptions = [
    'ShieldCheck', 'Truck', 'RefreshCw', 'Headset', 'Award', 'Zap',
    'BadgeCheck', 'RotateCcw', 'Tag', 'Star', 'Heart', 'Gift', 'Clock'
];

export default function FeatureBadgesPage({ badges, defaultBadges, profileCard }: { 
    badges: FeatureBadge[], 
    defaultBadges: FeatureBadge[],
    profileCard?: ProfileCardSettings 
}) {
    const { data, setData, processing } = useForm({
        badges: badges || [],
        profileCard: profileCard || {
            is_active: true,
            text_bn: 'আপনার প্রোফাইল সম্পূর্ণ করুন এবং পান অতিরিক্ত ২% ডিসকাউন্ট!',
            discount_percentage: '২%',
            link_url: '/account'
        }
    });

    const handleBadgeChange = (index: number, field: keyof FeatureBadge, value: any) => {
        const newBadges = [...data.badges];
        newBadges[index] = { ...newBadges[index], [field]: value };
        setData('badges', newBadges);
    };

    const handleAddBadge = () => {
        const newBadge: FeatureBadge = {
            id: 'badge_' + Date.now(),
            label_en: 'New Feature',
            label_bn: 'নতুন সুবিধা',
            icon: 'Zap',
            gradient_from: 'from-blue-500',
            gradient_to: 'to-cyan-500',
            is_active: true,
        };
        setData('badges', [...data.badges, newBadge]);
    };

    const handleDeleteBadge = (index: number) => {
        const newBadges = data.badges.filter((_, i) => i !== index);
        setData('badges', newBadges);
    };

    const handleResetDefaults = () => {
        Swal.fire({
            title: 'ডিফল্ট সেটিংসে ফিরিয়ে আনবেন?',
            text: 'আপনি কি সকল ব্যাজ এবং প্রোফাইল ডিসকাউন্ট ব্যানার ডিফল্ট অবস্থায় নিয়ে যেতে চান?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#d33',
            confirmButtonText: 'হ্যাঁ, রিসেট করুন'
        }).then((result) => {
            if (result.isConfirmed) {
                setData('badges', defaultBadges);
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        router.post('/admin/appearance/feature-badges', data as any, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'সফলভাবে সংরক্ষিত হয়েছে!',
                    text: 'প্রোফাইল ডিসকাউন্ট কার্ড এবং ফিচার ব্যাজ আপডেট হয়েছে।',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'সংরক্ষণ ব্যর্থ হয়েছে',
                    text: 'অনুগ্রহ করে ইনপুটগুলো সঠিক রয়েছে কিনা চেক করুন।',
                    confirmButtonColor: '#10b981'
                });
            }
        });
    };

    const renderIcon = (iconName: string) => {
        const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle;
        return <IconComponent className="w-4 h-4 mr-2" />;
    };

    return (
        <div className="max-w-5xl text-gray-800 pb-12">
            <Head title="Feature Badges & Profile Discount" />

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile Discount & Feature Badges Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        হোমপেজের হিরো স্লাইডারের ঠিক নিচে থাকা প্রোফাইল ডিসকাউন্ট কার্ড এবং কালারফুল ফিচার ব্যাজ স্লাইডার ম্যানেজ করুন।
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm cursor-pointer"
                    >
                        <span>Reset Defaults</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="px-5 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                        <span>{processing ? 'সেভ হচ্ছে...' : 'Save Changes'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 mb-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold">
                            <span>👤</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900"><span>১. প্রোফাইল কমপ্লিশন ডিসকাউন্ট ব্যানার</span></h2>
                            <p className="text-xs text-gray-500"><span>হোমপেজে প্রোফাইল সম্পূর্ণ করার অতিরিক্ত ডিসকাউন্ট কার্ড মেসেজটি নিয়ন্ত্রণ করুন</span></p>
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.profileCard.is_active}
                            onChange={(e) => setData('profileCard', { ...data.profileCard, is_active: e.target.checked })}
                            className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-bold text-gray-700">ব্যানার চালু রাখুন</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">ব্যানার টেক্সট (বাংলা)</label>
                        <input
                            type="text"
                            value={data.profileCard.text_bn}
                            onChange={(e) => setData('profileCard', { ...data.profileCard, text_bn: e.target.value })}
                            placeholder="আপনার প্রোফাইল সম্পূর্ণ করুন এবং পান অতিরিক্ত ২% ডিসকাউন্ট!"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-semibold"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">ডিসকাউন্ট পারসেন্টেজ টেক্সট</label>
                        <input
                            type="text"
                            value={data.profileCard.discount_percentage}
                            onChange={(e) => setData('profileCard', { ...data.profileCard, discount_percentage: e.target.value })}
                            placeholder="২%"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">লিঙ্ক ইউআরএল (Link URL)</label>
                        <input
                            type="text"
                            value={data.profileCard.link_url}
                            onChange={(e) => setData('profileCard', { ...data.profileCard, link_url: e.target.value })}
                            placeholder="/account"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900"><span>২. ফিচার ব্যাজ স্লাইডার (Feature Badges)</span></h2>
                <button
                    type="button"
                    onClick={handleAddBadge}
                    className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-xs transition cursor-pointer"
                >
                    <span>+ নতুন ব্যাজ যোগ করুন</span>
                </button>
            </div>

            <div className="space-y-4">
                {data.badges.map((badge, index) => (
                    <div key={badge.id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-3.5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
                            {/* Live Badge Previews (Both Bengali & English) */}
                            <div className="flex flex-wrap items-center gap-2 notranslate" translate="no">
                                <div className={`px-3.5 py-1.5 rounded-xl text-white font-bold text-xs flex items-center bg-gradient-to-r ${badge.gradient_from} ${badge.gradient_to} shadow-xs notranslate`} translate="no" title="বাংলা প্রিভিউ">
                                    {renderIcon(badge.icon)}
                                    <span className="notranslate" translate="no">{badge.label_bn || 'বাংলা'}</span>
                                </div>
                                <div className={`px-3.5 py-1.5 rounded-xl text-white font-bold text-xs flex items-center bg-gradient-to-r ${badge.gradient_from} ${badge.gradient_to} shadow-xs opacity-95 notranslate`} translate="no" title="English Preview">
                                    {renderIcon(badge.icon)}
                                    <span className="notranslate" translate="no">{badge.label_en || 'English'}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 ml-auto">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={badge.is_active}
                                        onChange={(e) => handleBadgeChange(index, 'is_active', e.target.checked)}
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                    />
                                    <span className="text-xs font-bold text-gray-700">Active</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteBadge(index)}
                                    className="text-red-500 hover:text-red-700 text-xs font-bold p-1 cursor-pointer"
                                    title="Delete Badge"
                                >
                                    <span>✕ ডিলিট</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">ব্যাজ নাম (বাংলা)</label>
                                <input
                                    type="text"
                                    value={badge.label_bn}
                                    onChange={(e) => handleBadgeChange(index, 'label_bn', e.target.value)}
                                    placeholder="নিরাপদ পেমেন্ট"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 font-bold mb-1">Label (English)</label>
                                <input
                                    type="text"
                                    value={badge.label_en}
                                    onChange={(e) => handleBadgeChange(index, 'label_en', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                />
                            </div>

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">আইকন Select</label>
                                    <select
                                        value={badge.icon}
                                        onChange={(e) => handleBadgeChange(index, 'icon', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-medium"
                                    >
                                        {iconOptions.map(icon => (
                                            <option key={icon} value={icon}>{icon}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">গ্র্যাডিয়েন্ট শুরুর কালার</label>
                                    <select
                                        value={badge.gradient_from.replace('from-', '')}
                                        onChange={(e) => handleBadgeChange(index, 'gradient_from', `from-${e.target.value}`)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                    >
                                        {colorOptions.map(color => (
                                            <option key={color.value} value={color.value}>{color.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 font-bold mb-1">গ্র্যাডিয়েন্ট শেষ কালার</label>
                                    <select
                                        value={badge.gradient_to.replace('to-', '')}
                                        onChange={(e) => handleBadgeChange(index, 'gradient_to', `to-${e.target.value}`)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                                    >
                                        {colorOptions.map(color => (
                                            <option key={color.value} value={color.value}>{color.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 flex justify-end">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={processing}
                    className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-bold shadow-sm disabled:opacity-50 cursor-pointer"
                >
                    <span>{processing ? 'সেভ হচ্ছে...' : 'Save All Changes'}</span>
                </button>
            </div>
        </div>
    );
}
