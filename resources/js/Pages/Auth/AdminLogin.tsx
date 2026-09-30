import React, { FormEventHandler, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, LogIn, Lock, Mail, ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
    const { props } = usePage<any>();
    // Fetch global site_logo if we pass it, otherwise fallback to text logo
    const siteLogo = props.siteSettings?.site_logo || null;

    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: 'shishirbarai01982708789@gmail.com',
        password: '',
        remember: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/auth');
    };

    return (
        <div className="min-h-screen bg-[#060b19] flex items-center justify-center font-sans px-4 py-8 notranslate" translate="no">
            <Head title="অ্যাডমিন পোর্টাল - লগইন" />

            <div className="w-full max-w-sm">
                <div className="bg-[#111828] border border-slate-800 rounded-2xl p-7 sm:p-8 shadow-2xl flex flex-col items-center">
                    
                    {/* Logo Section */}
                    <div className="mb-5 text-center notranslate" translate="no">
                        {siteLogo ? (
                            <img src={siteLogo} alt="Guruz" className="h-14 sm:h-16 mx-auto mb-2 object-contain" />
                        ) : (
                            <div className="flex items-center justify-center gap-1.5 mb-2">
                                <div className="relative">
                                    {/* The arc effect */}
                                    <div className="absolute -left-2 -top-2 w-8 h-8 border-t-2 border-l-2 border-orange-500 rounded-tl-full rounded-bl-full rotate-12"></div>
                                    <div className="text-white text-5xl font-black tracking-tighter relative z-10">
                                        guruz
                                    </div>
                                </div>
                            </div>
                        )}
                        <h2 className="text-white text-xl font-bold mt-2 notranslate" translate="no">Admin Portal</h2>
                        <p className="text-slate-400 text-xs mt-1 notranslate" translate="no">Restricted — authorized personnel only</p>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={submit} className="w-full space-y-4 notranslate" translate="no">
                        <div>
                            <label 
                                htmlFor="email" 
                                className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5 notranslate" 
                                translate="no"
                            >
                                ইমেইল / Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="username"
                                    value={data.email}
                                    style={{ colorScheme: 'dark', backgroundColor: '#0f172a', color: '#ffffff' }}
                                    className="w-full bg-[#0f172a] text-white placeholder-slate-500 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all notranslate dark-autofill"
                                    translate="no"
                                    placeholder="admin@guruz.com"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.email && (
                                <div className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5 notranslate" translate="no">
                                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>{errors.email}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label 
                                    htmlFor="password" 
                                    className="block text-slate-300 text-xs font-semibold uppercase tracking-wider notranslate" 
                                    translate="no"
                                >
                                    পাসওয়ার্ড / Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs text-orange-400 hover:text-orange-300 transition flex items-center gap-1 notranslate cursor-pointer"
                                    translate="no"
                                >
                                    {showPassword ? (
                                        <>
                                            <EyeOff className="w-3.5 h-3.5" />
                                            <span>লুকান</span>
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>দেখান</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    autoComplete="current-password"
                                    value={data.password}
                                    style={{ colorScheme: 'dark', backgroundColor: '#0f172a', color: '#ffffff' }}
                                    className="w-full bg-[#0f172a] text-white placeholder-slate-500 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono tracking-wider notranslate dark-autofill"
                                    translate="no"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••••••"
                                    required
                                />
                                <button 
                                    type="button"
                                    aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                                    className="absolute right-3 inset-y-0 flex items-center cursor-pointer text-slate-400 hover:text-white transition focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <div className="text-red-400 text-xs mt-1.5 flex items-center gap-1.5 notranslate" translate="no">
                                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>{errors.password}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-3 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all text-base flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99] notranslate"
                            translate="no"
                        >
                            {processing ? (
                                <span className="flex items-center gap-2 notranslate" translate="no">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-white font-bold text-base">লগইন হচ্ছে...</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 notranslate" translate="no">
                                    <LogIn className="w-5 h-5 text-white" />
                                    <span className="text-white font-bold text-base">লগইন</span>
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-5 text-center space-y-3 notranslate" translate="no">
                        <Link href="/forgot-password" className="text-slate-400 text-xs hover:text-white transition inline-block">
                            Forgot password?
                        </Link>
                        <p className="text-slate-500 text-[10px]">
                            Session auto-locks after 2h idle - 8h max.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
