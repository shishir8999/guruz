import { Head, useForm, Link, usePage } from '@inertiajs/react';
import React, { useState, FormEventHandler } from 'react';
import { Mail, Phone, ArrowLeft, Loader2, CheckCircle2, ArrowRight, ShieldCheck, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { props } = usePage<any>();
    const resetUrl = props.flash?.reset_url || null;
    const otpSent = props.flash?.otp_sent || false;
    const demoOtp = props.flash?.demo_otp || null;
    const otpPhone = props.flash?.otp_phone || null;

    const [activeTab, setActiveTab] = useState<'email' | 'mobile'>(otpSent ? 'mobile' : 'email');
    const [showPassword, setShowPassword] = useState(false);

    // Email Form
    const emailForm = useForm({
        email: '',
    });

    // Mobile Phone Request OTP Form
    const phoneForm = useForm({
        phone: '',
    });

    // Mobile Phone Verify OTP Form
    const otpForm = useForm({
        otp: demoOtp || '',
    });

    const submitEmail: FormEventHandler = (e) => {
        e.preventDefault();
        emailForm.post('/forgot-password');
    };

    const submitPhoneOtp: FormEventHandler = (e) => {
        e.preventDefault();
        phoneForm.post('/forgot-password/send-otp');
    };

    const submitVerifyOtp: FormEventHandler = (e) => {
        e.preventDefault();
        otpForm.post('/forgot-password/verify-otp');
    };

    return (
        <>
            <Head title="Forgot Password — Reset Account" />
            <div className="min-h-screen bg-[#060b19] flex items-center justify-center font-sans p-4">
                <div className="w-full max-w-md">
                    <div className="bg-[#0b1329] border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden text-white">
                        
                        {/* Glow Effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/20 rounded-full blur-[70px] -z-10"></div>

                        {/* Title Header */}
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center mx-auto mb-3">
                                {activeTab === 'email' ? <Mail className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
                                <span className="text-orange-500">Forgot</span> Password
                            </h2>
                            <p className="text-slate-400 text-xs">
                                আপনার অ্যাকাউন্টের পাসওয়ার্ড ইমেইল বা মোবাইল নম্বরের মাধ্যমে রিসেট করুন।
                            </p>
                        </div>

                        {/* Method Selector Tabs */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 mb-6">
                            <button
                                type="button"
                                onClick={() => setActiveTab('email')}
                                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                    activeTab === 'email'
                                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Mail className="w-4 h-4" /> Gmail / Email
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('mobile')}
                                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                                    activeTab === 'mobile'
                                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Phone className="w-4 h-4" /> Mobile OTP
                            </button>
                        </div>

                        {/* Status Flash Banner */}
                        {status && (
                            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex flex-col gap-3 animate-in fade-in zoom-in duration-150">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <span>{status}</span>
                                </div>
                                {resetUrl && (
                                    <a 
                                        href={resetUrl}
                                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs transition shadow-md shadow-emerald-600/20"
                                    >
                                        <span>পাসওয়ার্ড রিসেট করুন (Reset Password Now)</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        )}

                        {/* TAB 1: EMAIL RESET */}
                        {activeTab === 'email' && (
                            <form onSubmit={submitEmail} className="space-y-4 animate-in fade-in duration-150">
                                <div>
                                    <label className="block text-slate-300 text-[11px] font-bold uppercase mb-2">Registered Email Address</label>
                                    <input
                                        type="email"
                                        value={emailForm.data.email}
                                        className="w-full bg-slate-900/90 text-white border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition placeholder:text-slate-500 font-medium"
                                        onChange={(e) => emailForm.setData('email', e.target.value)}
                                        placeholder="e.g. admin@guruz.com"
                                        required
                                        autoFocus
                                    />
                                    {emailForm.errors.email && <div className="text-rose-400 text-xs mt-1.5 font-medium">{emailForm.errors.email}</div>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={emailForm.processing}
                                    className="w-full mt-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                                >
                                    {emailForm.processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Sending Reset Link...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Gmail Reset Link</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* TAB 2: MOBILE OTP RESET */}
                        {activeTab === 'mobile' && !otpSent && (
                            <form onSubmit={submitPhoneOtp} className="space-y-4 animate-in fade-in duration-150">
                                <div>
                                    <label className="block text-slate-300 text-[11px] font-bold uppercase mb-2">Mobile Number (মোবাইল নম্বর)</label>
                                    <input
                                        type="text"
                                        value={phoneForm.data.phone}
                                        className="w-full bg-slate-900/90 text-white border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition placeholder:text-slate-500 font-medium"
                                        onChange={(e) => phoneForm.setData('phone', e.target.value)}
                                        placeholder="e.g. 01700000000"
                                        required
                                        autoFocus
                                    />
                                    {phoneForm.errors.phone && <div className="text-rose-400 text-xs mt-1.5 font-medium">{phoneForm.errors.phone}</div>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={phoneForm.processing}
                                    className="w-full mt-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                                >
                                    {phoneForm.processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Sending Mobile OTP...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Send 6-Digit OTP Code</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {/* STEP 2: ENTER OTP CODE ONLY */}
                        {activeTab === 'mobile' && otpSent && (
                            <form onSubmit={submitVerifyOtp} className="space-y-4 animate-in fade-in duration-150">
                                <div>
                                    <label className="block text-slate-300 text-[11px] font-bold uppercase mb-2">6-Digit OTP Code (মোবাইলে প্রাপ্ত ৬-সংখ্যার কোড)</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otpForm.data.otp}
                                        className="w-full bg-slate-900/90 text-center tracking-[10px] text-xl font-mono text-emerald-400 border border-emerald-500/50 rounded-xl px-4 py-3.5 focus:outline-none focus:border-emerald-400 transition placeholder:text-slate-600 placeholder:opacity-60 placeholder:tracking-[6px]"
                                        onChange={(e) => otpForm.setData('otp', e.target.value.replace(/\D/g, ''))}
                                        placeholder="• • •  • • •"
                                        required
                                        autoFocus
                                    />
                                    {otpForm.errors.otp && <div className="text-rose-400 text-xs mt-1.5 font-medium">{otpForm.errors.otp}</div>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={otpForm.processing}
                                    className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                                >
                                    {otpForm.processing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                            <span>Verifying OTP Code...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>Verify OTP Code (ওটিপি ভেরিফাই করুন)</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="mt-8 text-center pt-6 border-t border-slate-800/80">
                            <Link href="/login" className="text-slate-400 text-xs font-bold hover:text-white transition flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
