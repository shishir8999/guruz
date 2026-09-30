import { Head, useForm, router, usePage } from '@inertiajs/react';
import React, { FormEventHandler, useState, useEffect } from 'react';
import { ShieldCheck, KeyRound, Loader2, ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TwoFactorChallenge({ email }: { email: string }) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (flash?.success) {
            setMessage(flash.success);
        }
    }, [flash?.success]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login/2fa');
    };

    const handleSendSecret = () => {
        if (cooldown > 0 || isSendingEmail) return;

        setIsSendingEmail(true);
        router.post('/login/2fa/send-secret', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSendingEmail(false);
                setCooldown(60);
            },
            onError: () => {
                setIsSendingEmail(false);
            }
        });
    };

    return (
        <>
            <Head title="Two-Factor Authentication (2FA) Verification" />
            <div className="min-h-screen bg-[#060b19] flex items-center justify-center font-sans p-4">
                <div className="w-full max-w-md">
                    <div className="bg-[#0b1329] border border-purple-500/30 rounded-3xl shadow-2xl p-8 relative overflow-hidden text-white">
                        
                        {/* Glow Effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-[70px] -z-10"></div>

                        {/* Title Header */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/10">
                                <ShieldCheck className="w-9 h-9 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight mb-1">
                                <span className="text-purple-400">Two-Factor</span> Security
                            </h2>
                            <p className="text-slate-400 text-xs">
                                <strong className="text-purple-300">{email}</strong> অ্যাকাউন্টে ২FA সিকিউরিটি চালু আছে। আপনার Authenticator অ্যাপ অথবা জিমেইলের ৬-ডিজিটের কোড দিন।
                            </p>
                        </div>

                        {/* Success Notification Banner */}
                        {message && (
                            <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs flex items-start gap-2.5 shadow-lg shadow-emerald-950/40 animate-in fade-in zoom-in-95">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div className="flex-1 font-medium leading-relaxed">
                                    {message}
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="block text-slate-300 text-[11px] font-bold uppercase mb-2 text-center">
                                    6-Digit Authenticator / Email OTP Code
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={data.code}
                                    className="w-full bg-slate-900/90 text-center tracking-[12px] text-2xl font-mono text-purple-400 border border-purple-500/50 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition shadow-inner placeholder:text-slate-600 placeholder:opacity-60 placeholder:tracking-[8px]"
                                    onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                                    placeholder="• • •  • • •"
                                    required
                                    autoFocus
                                />
                                {errors.code && (
                                    <div className="text-rose-400 text-xs mt-2 font-medium text-center flex items-center justify-center gap-1.5">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        <span>{errors.code}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-2xl shadow-xl shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        <span>Verifying Code...</span>
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="w-4 h-4" />
                                        <span>Verify & Log In</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Forgot 2FA / Send Secret Key to Gmail */}
                        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
                            <p className="text-slate-400 text-xs mb-3">
                                Authenticator অ্যাপ হারিয়ে গেছে বা কোড পাচ্ছেন না?
                            </p>
                            <button
                                type="button"
                                onClick={handleSendSecret}
                                disabled={isSendingEmail || cooldown > 0}
                                className="w-full py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-800/60 hover:border-purple-600/80 text-purple-300 hover:text-white transition text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSendingEmail ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                        <span>জিমেইলে পাঠানো হচ্ছে...</span>
                                    </>
                                ) : cooldown > 0 ? (
                                    <>
                                        <Mail className="w-4 h-4 text-purple-400" />
                                        <span>পুনরায় পাঠাতে অপেক্ষা করুন ({cooldown}s)</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 text-purple-400" />
                                        <span>ফরগেট কোড? জিমেইলে সিক্রেট কী পাঠান</span>
                                    </>
                                )}
                            </button>
                            <span className="block text-[11px] text-slate-500 mt-2">
                                আপনার ইমেইলে সিক্রেট কী এবং তাৎক্ষণিক লগইন কোড চলে যাবে।
                            </span>
                        </div>

                        <div className="mt-6 text-center pt-4 border-t border-slate-800/60">
                            <a href="/login" className="text-slate-400 text-xs font-bold hover:text-white transition flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Cancel & Back to Login
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
