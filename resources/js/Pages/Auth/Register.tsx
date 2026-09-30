import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Phone, Mail, User, Lock, ArrowRight } from 'lucide-react';

export default function Register() {
    const { props } = usePage<any>();
    const siteLogo = props.siteSettings?.site_logo || null;
    const siteTitle = props.siteSettings?.site_title || 'Guruz';

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Client-side touched states for instant feedback
    const [phoneTouched, setPhoneTouched] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    // Validations
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/;
    const isEmailValid = data.email.trim().length > 0 && emailRegex.test(data.email.trim());
    
    const phoneRegex = /^01[3-9]\d{8}$/;
    const isPhoneValid = phoneRegex.test(data.phone);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Strip non-digits completely (prevents dots, commas, symbols, text)
        let cleaned = e.target.value.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('8801') && cleaned.length > 11) {
            cleaned = cleaned.substring(2);
        }
        cleaned = cleaned.slice(0, 11);
        
        setData('phone', cleaned);
        if (errors.phone) clearErrors('phone');
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('email', e.target.value.trim());
        if (errors.email) clearErrors('email');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setPhoneTouched(true);
        setEmailTouched(true);

        // Strict Client-side check before submission
        if (!isPhoneValid) {
            setError('phone', 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)');
            return;
        }

        if (!isEmailValid) {
            setError('email', 'অনুগ্রহ করে একটি সঠিক ও বৈধ ইমেইল অ্যাড্রেস লিখুন (যেমন: name@gmail.com)');
            return;
        }

        if (data.password.length < 8) {
            setError('password', 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
            return;
        }

        if (data.password !== data.password_confirmation) {
            setError('password_confirmation', 'কনফার্ম পাসওয়ার্ড মিলছে না।');
            return;
        }

        post('/register');
    };

    return (
        <>
            <Head title="রেজিস্ট্রেশন করুন — Guruz" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-10 px-4">
                <div className="w-full max-w-md px-6 sm:px-8 py-8 sm:py-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
                    
                    <div className="text-center mb-6">
                        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-3 notranslate" translate="no">
                            {siteLogo ? (
                                <img 
                                    src={siteLogo} 
                                    alt={siteTitle} 
                                    className="h-12 sm:h-14 w-auto max-w-[220px] object-contain drop-shadow-md notranslate"
                                    translate="no"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        if (e.currentTarget.nextElementSibling) {
                                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'inline-flex';
                                        }
                                    }}
                                />
                            ) : null}
                            <div className={`items-center gap-2 ${siteLogo ? 'hidden' : 'inline-flex'} notranslate`} translate="no">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-black text-xl border border-white/20 shadow-lg">
                                    g
                                </div>
                                <span className="text-2xl font-black text-white tracking-tight notranslate" translate="no">guruz</span>
                            </div>
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight notranslate" translate="no">Create Account</h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 notranslate" translate="no">Join Guruz marketplace today</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        
                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-purple-400" />
                                Full Name (আপনার পুরো নাম) *
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => {
                                    setData('name', e.target.value);
                                    if (errors.name) clearErrors('name');
                                }}
                                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition text-sm font-medium"
                                placeholder="e.g. Shishir Barai"
                                required
                            />
                            {errors.name && (
                                <p className="text-rose-400 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                                    Email Address (ইমেইল) *
                                </label>
                                {emailTouched && data.email.length > 0 && (
                                    <span className={`text-[10px] font-bold flex items-center gap-1 ${isEmailValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {isEmailValid ? <><CheckCircle2 className="w-3 h-3" /> সঠিক ইমেইল</> : 'ভুল ইমেইল ফরম্যাট'}
                                    </span>
                                )}
                            </div>
                            <input
                                type="email"
                                value={data.email}
                                onChange={handleEmailChange}
                                onBlur={() => setEmailTouched(true)}
                                className={`w-full px-4 py-3 rounded-2xl bg-white/10 border text-white placeholder-slate-500 focus:outline-none transition text-sm font-medium ${
                                    emailTouched && data.email.length > 0
                                        ? (isEmailValid ? 'border-emerald-500/60 focus:border-emerald-400' : 'border-rose-500/80 focus:border-rose-400')
                                        : 'border-white/15 focus:border-purple-400'
                                }`}
                                placeholder="name@gmail.com"
                                required
                            />
                            {emailTouched && data.email.length > 0 && !isEmailValid && !errors.email && (
                                <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    সঠিক ইমেইল অ্যাড্রেস লিখুন (যেমন: name@gmail.com)
                                </p>
                            )}
                            {errors.email && (
                                <p className="text-rose-400 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                                    Mobile Number (মোবাইল নম্বর) *
                                </label>
                                <span className="text-[10px] text-slate-400 font-mono">
                                    {data.phone.length}/11 ডিজিট
                                </span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-purple-300 bg-white/10 px-2 py-0.5 rounded-lg">
                                    +88
                                </span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    value={data.phone}
                                    onChange={handlePhoneChange}
                                    onBlur={() => setPhoneTouched(true)}
                                    maxLength={11}
                                    className={`w-full pl-16 pr-4 py-3 rounded-2xl bg-white/10 border text-white placeholder-slate-500 focus:outline-none transition text-sm font-bold tracking-wider ${
                                        phoneTouched && data.phone.length > 0
                                            ? (isPhoneValid ? 'border-emerald-500/60 focus:border-emerald-400' : 'border-rose-500/80 focus:border-rose-400')
                                            : 'border-white/15 focus:border-purple-400'
                                    }`}
                                    placeholder="01712345678"
                                    required
                                />
                            </div>
                            {phoneTouched && data.phone.length > 0 && !isPhoneValid && !errors.phone && (
                                <p className="text-rose-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (013-019 দিয়ে শুরু)।
                                </p>
                            )}
                            {errors.phone && (
                                <p className="text-rose-400 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-purple-400" />
                                Password (পাসওয়ার্ড) *
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={e => {
                                        setData('password', e.target.value);
                                        if (errors.password) clearErrors('password');
                                    }}
                                    className="w-full px-4 py-3 pr-11 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition text-sm font-medium"
                                    placeholder="কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition focus:outline-none cursor-pointer"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-rose-400 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-purple-400" />
                                Confirm Password (পাসওয়ার্ড নিশ্চিত করুন) *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={data.password_confirmation}
                                    onChange={e => {
                                        setData('password_confirmation', e.target.value);
                                        if (errors.password_confirmation) clearErrors('password_confirmation');
                                    }}
                                    className="w-full px-4 py-3 pr-11 rounded-2xl bg-white/10 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition text-sm font-medium"
                                    placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition focus:outline-none cursor-pointer"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {data.password_confirmation.length > 0 && data.password !== data.password_confirmation && (
                                <p className="text-rose-400 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    পাসওয়ার্ড মিলছে না
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black rounded-2xl transition-all duration-200 shadow-lg shadow-purple-600/30 disabled:opacity-50 mt-4 flex items-center justify-center gap-2 cursor-pointer text-sm"
                        >
                            {processing ? (
                                'অ্যাকাউন্ট তৈরি হচ্ছে...'
                            ) : (
                                <>
                                    <span>Create Account (অ্যাকাউন্ট খুলুন)</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <div className="relative flex items-center my-6">
                            <div className="flex-grow border-t border-slate-800"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase font-bold tracking-wider">অথবা</span>
                            <div className="flex-grow border-t border-slate-800"></div>
                        </div>

                        <a
                            href="/auth/google"
                            className="w-full py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 text-xs"
                        >
                            <FcGoogle className="w-5 h-5" />
                            Google দিয়ে সাইন আপ করুন
                        </a>
                    </form>

                    <p className="text-center text-slate-400 text-xs mt-6 font-medium">
                        ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-bold transition">
                            লগইন করুন
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
