import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Shield, ShieldAlert, Smartphone, Lock, QrCode, Copy, Check, KeyRound } from 'lucide-react';
import AccountLayout from '@/Layouts/CustomerLayout';
import Swal from 'sweetalert2';

interface Props {
    two_factor_enabled: boolean;
    secret_key: string;
    user?: {
        name: string;
        email: string;
    };
}

export default function TwoFactor({ two_factor_enabled, secret_key, user }: Props) {
    const [copied, setCopied] = useState(false);

    const handleToggle = () => {
        router.post('/account/2fa/toggle', {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: '2FA Authenticator Status Updated!',
                    showConfirmButton: false,
                    timer: 2500,
                });
            }
        });
    };

    const copySecret = () => {
        navigator.clipboard.writeText(secret_key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AccountLayout activePage="profile">
            <Head title="Two-Factor Authentication (2FA) — Vendor / Account Security" />

            <div className="space-y-6 max-w-4xl">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Google Authenticator (2FA) Security</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">আপনার ভেন্ডর / অ্যাকাউন্ট পোর্টালে ডাবল সিকিউরিটি যুক্ত করুন।</p>
                </div>

                {/* Status Card */}
                <div className={`rounded-2xl border p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition ${two_factor_enabled ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl shrink-0 ${two_factor_enabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                            {two_factor_enabled ? <Shield size={32} /> : <ShieldAlert size={32} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">
                                {two_factor_enabled ? '2FA Protection is Active (সক্রিয়)' : '2FA Protection is Disabled (নিষ্ক্রিয়)'}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-lg">
                                {two_factor_enabled 
                                    ? 'আপনার অ্যাকাউন্টটি এখন Google Authenticator দ্বারা সম্পূর্ণ সুরক্ষিত। লগইন করার সময় ৬-ডিজিটের ভেরিফিকেশন কোড দিতে হবে।'
                                    : 'টু-ফ্যাক্টর অথেন্টিকেশন অন থাকলে লগইন করার সময় গুগল অথেন্টিকেটর অ্যাপের কোড ছাড়া কেউ পোর্টালে ঢুকতে পারবে না।'
                                }
                            </p>
                        </div>
                    </div>
                    
                    <div className="shrink-0 w-full md:w-auto">
                        <button 
                            onClick={handleToggle}
                            className={`w-full md:w-auto px-6 py-3 font-extrabold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                                two_factor_enabled 
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20' 
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            }`}
                        >
                            <Lock size={18} />
                            {two_factor_enabled ? 'Turn OFF 2FA' : 'Turn ON 2FA'}
                        </button>
                    </div>
                </div>

                {/* QR Code Setup Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                            <Smartphone size={20} className="text-purple-600" />
                            Google Authenticator QR Code Setup
                        </h3>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* QR Visual */}
                        <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                            <div className="p-3 bg-white rounded-xl inline-block shadow-sm border">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`otpauth://totp/Guruz:${user?.email || 'Vendor'}?secret=${secret_key}&issuer=Guruz`)}`} 
                                    alt="2FA QR Code" 
                                    className="w-40 h-40 mx-auto rounded-lg"
                                />
                            </div>
                            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-950/40 p-2 rounded-lg border border-purple-200 dark:border-purple-800">
                                <span>Key: {secret_key}</span>
                                <button onClick={copySecret} className="text-purple-600 hover:text-purple-700">
                                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-extrabold shrink-0">1</span>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Download App</h4>
                                    <p className="text-xs text-slate-500">Google Authenticator বা Microsoft Authenticator অ্যাপ মোবাইলে ইনস্টল করুন।</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-extrabold shrink-0">2</span>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Scan QR Code</h4>
                                    <p className="text-xs text-slate-500">অ্যাপ খুলে QR Code স্ক্যান করুন অথবা সিক্রেট Key ম্যানুয়ালি লিখুন।</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-extrabold shrink-0">3</span>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Turn ON 2FA</h4>
                                    <p className="text-xs text-slate-500">উপরের **Turn ON 2FA** বাটনে চাপ দিয়ে ২FA সিকিউরিটি চালু বা বন্ধ নিয়ন্ত্রণ করুন।</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AccountLayout>
    );
}
