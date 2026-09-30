import React, { useState, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { User, Lock, Copy, Check, Eye, EyeOff, Calendar, Phone, Mail, Award, ArrowLeft, Store, Camera, Upload, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface UserData {
    id?: number;
    customer_id?: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string | null;
    address?: string;
    birthday?: string;
}

export default function Profile({ user }: { user: UserData }) {
    const { auth } = usePage<any>().props;
    const profileCompletion = auth?.user?.profile_completion_percentage ?? 0;
    const [copied, setCopied] = useState(false);

    // Avatar preview state
    const currentAvatar = user?.avatar || auth?.user?.avatar_url || null;
    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatar);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Password visibility toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile Form
    const profileForm = useForm<{
        name: string;
        email: string;
        phone: string;
        city: string;
        address: string;
        birthday: string;
        avatar: File | null;
    }>({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        city: (user as any)?.city || '',
        address: user?.address || '',
        birthday: user?.birthday || '',
        avatar: null,
    });

    // Password Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: 'ফাইল সাইজ খুব বড়!',
                text: 'অনুগ্রহ করে ৩ মেগাবাইটের কম সাইজের ছবি সিলেক্ট করুন।',
            });
            return;
        }

        profileForm.setData('avatar', file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleCopyId = () => {
        const idText = user?.customer_id || '1000063';
        navigator.clipboard.writeText(idText);
        setCopied(true);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Customer ID Copied!',
            showConfirmButton: false,
            timer: 2000
        });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.post('/account/profile', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'প্রোফাইল ও ছবি সফলভাবে সেভ হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000
                });
            },
            onError: (errors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'ত্রুটি!',
                    text: Object.values(errors).join(', ') || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।',
                });
            }
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.post('/account/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Password updated successfully! 🔒',
                    showConfirmButton: false,
                    timer: 3000
                });
            },
        });
    };

    const customerIdDisplay = user?.customer_id || '1000063';
    const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <>
            <Head title="Profile & Password" />

            <div className="space-y-6 max-w-5xl">
                {/* Page Heading & Back to Website Navigation Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                            Profile & Password
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            ব্যক্তিগত তথ্য, ছবি ও সিকিউরিটি পাসওয়ার্ড ম্যানেজ করুন
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition active:scale-95 w-full sm:w-auto shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Website (মূল ওয়েবসাইট)</span>
                    </Link>
                </div>

                {/* 0. PROFILE COMPLETION STATUS CARD */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-amber-400 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                            {profileCompletion}%
                        </div>
                        <div className="space-y-1 min-w-0">
                            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                                <span>প্রোফাইল কমপ্লিশন স্ট্যাটাস:</span>
                                <span className="text-orange-600 font-black">{profileCompletion}% সম্পূর্ণ</span>
                            </h3>
                            <p className="text-xs text-slate-600 font-medium">
                                {profileCompletion < 100 
                                    ? 'আপনার প্রোফাইল ১০০% সম্পূর্ণ করুন এবং অতিরিক্ত ২% ডিসকাউন্ট উপভোগ করুন!'
                                    : '🎉 অভিনন্দন! আপনার প্রোফাইল ১০০% সম্পূর্ণ হয়েছে।'}
                            </p>
                            {/* Animated Progress Bar */}
                            <div className="w-full sm:w-64 bg-amber-100/80 rounded-full h-2 overflow-hidden border border-amber-200">
                                <div 
                                    className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-700 shadow-xs" 
                                    style={{ width: `${profileCompletion}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    {profileCompletion >= 100 && (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-300 shrink-0">
                            ✓ 100% Complete
                        </span>
                    )}
                </div>

                {/* 1. CUSTOMER ID BANNER */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 rounded-2xl p-6 sm:p-7 text-white shadow-xl shadow-indigo-500/20 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/80">
                            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">💳</span>
                            CUSTOMER ID
                        </div>
                        <div className="text-2xl sm:text-3xl font-black tracking-wider text-white drop-shadow-xs">
                            ID: {customerIdDisplay}
                        </div>
                    </div>

                    <button
                        onClick={handleCopyId}
                        className="relative z-10 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-xs"
                    >
                        {copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                </div>

                {/* 2. MY INFO & AVATAR UPLOAD CARD */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
                            <User className="w-5 h-5 text-slate-700" />
                            <span>Personal Information (ব্যক্তিগত তথ্য ও ছবি)</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            আপনার প্রোফাইল ছবি এবং ঠিকানা আপডেট করুন
                        </p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        
                        {/* 📸 AVATAR / PROFILE PHOTO UPLOADER */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-gradient-to-r from-slate-50 to-emerald-50/40 rounded-2xl border border-slate-200/80">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="ছবি পরিবর্তন করতে ক্লিক করুন">
                                {/* Gradient Border Ring */}
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/35 transition-all duration-300">
                                    <div className="w-full h-full rounded-full bg-white p-[2px]">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-3xl relative">
                                            {avatarPreview ? (
                                                <img 
                                                    src={avatarPreview} 
                                                    alt="" 
                                                    className="w-full h-full object-cover rounded-full absolute inset-0 z-10 group-hover:scale-105 transition-transform duration-300" 
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : null}
                                            <span className="select-none font-black">{userInitial}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 rounded-full bg-slate-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <Camera className="w-6 h-6 mb-1 text-white animate-bounce" />
                                    <span className="text-[10px] font-black">ছবি পরিবর্তন</span>
                                </div>
                                <div 
                                    className="absolute -bottom-0.5 -right-0.5 w-8 h-8 rounded-full bg-white text-emerald-600 shadow-md border-2 border-white flex items-center justify-center z-30 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 group-hover:scale-110"
                                    title="ছবি নির্বাচন করুন"
                                >
                                    <Camera className="w-4 h-4 stroke-[2.3] transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2 text-center sm:text-left flex-1">
                                <h4 className="text-sm font-black text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
                                    <span>প্রোফাইল ছবি (Profile Photo)</span>
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                                    আপনার পরিষ্কার একটি ছবি যুক্ত করুন। সর্বোচ্চ সাইজ: 3MB (JPG, PNG, WEBP)।
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>ছবি আপলোড করুন</span>
                                    </button>
                                    {avatarPreview && avatarPreview !== currentAvatar && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAvatarPreview(currentAvatar);
                                                profileForm.setData('avatar', null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="inline-flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                            <span>রিসেট</span>
                                        </button>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                                {profileForm.errors.avatar && (
                                    <p className="text-xs text-rose-500 font-bold mt-1">{profileForm.errors.avatar}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                    Full Name (পূর্ণ নাম)
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.name}
                                    onChange={e => profileForm.setData('name', e.target.value)}
                                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none transition shadow-2xs"
                                    placeholder="Enter your full name"
                                    required
                                />
                                {profileForm.errors.name && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{profileForm.errors.name}</p>
                                )}
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                    Email Address (ইমেইল এড্রেস)
                                </label>
                                <input
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={e => profileForm.setData('email', e.target.value)}
                                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none transition shadow-2xs"
                                    placeholder="Enter your email address"
                                    required
                                />
                                {profileForm.errors.email && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{profileForm.errors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                    Phone (মোবাইল নম্বর)
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.phone}
                                    onChange={e => profileForm.setData('phone', e.target.value)}
                                    className="w-full bg-white border border-slate-200 text-slate-800 font-medium rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs"
                                    placeholder="017XXXXXXXX"
                                />
                                {profileForm.errors.phone && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{profileForm.errors.phone}</p>
                                )}
                            </div>

                            {/* Birthday */}
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                    Birthday (জন্মদিন)
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={profileForm.data.birthday}
                                        onChange={e => profileForm.setData('birthday', e.target.value)}
                                        className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none transition shadow-2xs"
                                    />
                                </div>
                                {profileForm.errors.birthday && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{profileForm.errors.birthday}</p>
                                )}
                            </div>

                            {/* City / District */}
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                    City / District (শহর / জেলা)
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.city}
                                    onChange={e => profileForm.setData('city', e.target.value)}
                                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none transition shadow-2xs"
                                    placeholder="যেমন: রংপুর, ঢাকা, চট্টগ্রাম"
                                />
                                {profileForm.errors.city && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{profileForm.errors.city}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                    Full Delivery Address (সম্পূর্ণ ডেলিভারি ঠিকানা)
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.data.address}
                                    onChange={e => profileForm.setData('address', e.target.value)}
                                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium focus:outline-none transition shadow-2xs"
                                    placeholder="যেমন: ১৫৬/৫৯ হরিণ বাড়ি, করিম নগর"
                                />
                                {profileForm.errors.address && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{profileForm.errors.address}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={profileForm.processing}
                                className="bg-[#16a34a] hover:bg-[#15803d] text-white px-8 py-3.5 rounded-xl font-black text-sm shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                            >
                                <span>{profileForm.processing ? 'সংরক্ষণ হচ্ছে...' : 'Save Profile (প্রোফাইল ও ছবি সংরক্ষণ করুন)'}</span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* 3. CHANGE PASSWORD CARD */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
                    <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
                        <Lock className="w-5 h-5 text-slate-700" />
                        <span>Change Password (পাসওয়ার্ড পরিবর্তন)</span>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Current Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={passwordForm.data.current_password}
                                        onChange={e => passwordForm.setData('current_password', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-800 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs"
                                        placeholder="••••••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordForm.errors.current_password && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{passwordForm.errors.current_password}</p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordForm.data.password}
                                        onChange={e => passwordForm.setData('password', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-800 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs"
                                        placeholder="Enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordForm.errors.password && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{passwordForm.errors.password}</p>
                                )}
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordForm.data.password_confirmation}
                                        onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-800 font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs"
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordForm.errors.password_confirmation && (
                                    <p className="text-xs text-rose-500 mt-1 font-medium">{passwordForm.errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="bg-[#16a34a] hover:bg-[#15803d] text-white px-7 py-3 rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                {passwordForm.processing ? 'Updating...' : 'Update Password'}
                            </button>
                            <p className="text-xs text-slate-400 font-medium mt-3">
                                আপনার সুরক্ষার জন্য, পাসওয়ার্ড পরিবর্তনের পূর্বে বর্তমান পাসওয়ার্ড যাচাই করা হয়।
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
