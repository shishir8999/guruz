import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    ShieldCheck, Key, Globe, 
    Lock, Mail, ShieldAlert, CheckCircle2,
    Eye, EyeOff, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

interface LicenseData {
    domain: string;
    key: string;
    owner_email?: string;
    client_name?: string;
    activated_at?: string;
}

interface Props {
    domain: string;
    license: LicenseData | null;
    isActivated: boolean;
    isLocalhost: boolean;
    defaultOwnerEmail?: string;
}

export default function LicenseManager({ 
    domain, 
    license, 
    isActivated, 
    isLocalhost, 
    defaultOwnerEmail = 'shishirbarai019@gmail.com'
}: Props) {
    const { flash } = usePage<any>().props;
    const [showPin, setShowPin] = useState(false);

    const form = useForm({
        master_pin: '',
        owner_email: defaultOwnerEmail || 'shishirbarai019@gmail.com',
        target_domain: '',
        client_name: '',
    });

    const activateForm = useForm({
        owner_email: defaultOwnerEmail || 'shishirbarai019@gmail.com',
        license_key: '',
        client_name: '',
    });

    const handleActivate = (e: React.FormEvent) => {
        e.preventDefault();
        activateForm.transform((data) => ({
            ...data,
            owner_email: 'shishirbarai019@gmail.com',
        })).post('/activate-license', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: '🎉 লাইসেন্স সক্রিয় হয়েছে!',
                    text: 'অভিনন্দন! আপনার সফটওয়্যার লাইসেন্স সক্রিয় হয়েছে এবং ফ্রন্ট ভিউ সফলভাবে আনলক করা হয়েছে।',
                    confirmButtonColor: '#10B981',
                });
                activateForm.reset('license_key');
            },
            onError: (errors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'ভুল লাইসেন্স কী!',
                    text: errors.license_key || Object.values(errors)[0] || 'লাইসেন্স কী বা জিমেইল সঠিক নয়।',
                    confirmButtonColor: '#EF4444'
                });
            }
        });
    };

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.data.master_pin) {
            Swal.fire('মাস্টার পিন আবশ্যক', 'অনুগ্রহ করে আপনার মাস্টার সিকিউরিটি পিন দিন।', 'warning');
            return;
        }
        if (!form.data.target_domain) {
            Swal.fire('ডোমেইন নাম আবশ্যক', 'অনুগ্রহ করে কাঙ্ক্ষিত ডোমেইন দিন (যেমন: clientwebsite.com)', 'warning');
            return;
        }

        form.transform((data) => ({
            ...data,
            owner_email: 'shishirbarai019@gmail.com',
        })).post('/admin/system/license/generate', {
            preserveScroll: true,
            onSuccess: (page: any) => {
                const flashData = page?.props?.flash;
                const genDomain = flashData?.generated_domain || form.data.target_domain;
                const genEmail = flashData?.generated_email || form.data.owner_email;

                Swal.fire({
                    icon: 'success',
                    title: '✉️ লাইসেন্স কী জিমেইলে পাঠানো হয়েছে!',
                    html: `
                        <div style="text-align: left; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; font-family: ui-sans-serif, system-ui; margin-top: 10px;">
                            <div style="font-size: 13px; color: #1e293b; margin-bottom: 6px;">
                                🌐 <strong>টার্গেট ডোমেইন:</strong> <span style="font-family: monospace; font-weight: bold; color: #4338ca;">${genDomain}</span>
                            </div>
                            <div style="font-size: 13px; color: #1e293b; margin-bottom: 12px;">
                                📧 <strong>প্রাপক জিমেইল:</strong> <span style="font-weight: bold; color: #4338ca;">${genEmail}</span>
                            </div>
                            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px; font-size: 12px; color: #065f46; line-height: 1.6;">
                                ✅ সর্বোচ্চ সুরক্ষার স্বার্থে লাইসেন্স কী-টি সরাসরি আপনার মাস্টার জিমেইলে (<strong>${genEmail}</strong>) পাঠানো হয়েছে। স্ক্রিনে কোনো কোড বা হিস্ট্রি রাখা হয়নি।
                            </div>
                            <div style="margin-top: 12px; font-size: 12px; color: #475569; line-height: 1.5;">
                                👉 অনুগ্রহ করে আপনার জিমেইল ইনবক্স চেক করে সেখান থেকে কোডটি কপি করে ক্লায়েন্টকে প্রদান করুন।
                            </div>
                        </div>
                    `,
                    confirmButtonText: 'ঠিক আছে, জিমেইল চেক করছি',
                    confirmButtonColor: '#4F46E5',
                });

                form.reset('target_domain', 'client_name');
            },
            onError: (errors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'ভুল সিকিউরিটি পিন!',
                    text: errors.master_pin || Object.values(errors)[0] || 'মাস্টার পিন সঠিক নয়। এই পিন ছাড়া লাইসেন্স তৈরি করা যাবে না।',
                    confirmButtonColor: '#EF4444'
                });
            }
        });
    };

    return (
        <>
            <Head title="একক-ডোমেইন সফটওয়্যার লাইসেন্স ম্যানেজার" />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

                {/* Top Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
                    <div className="relative z-10 space-y-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>১০০% একক-ডোমেইন ও জিমেইল ভিত্তিক গোপনীয় নিরাপত্তা লক</span>
                        </div>
                        <h1 className="text-xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                            <Lock className="w-7 h-7 text-indigo-400" />
                            <span>সফটওয়্যার লাইসেন্স ও পাইরেসি প্রতিরোধ হাব</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                            আপনার তৈরি করা সোর্স কোড সম্পূর্ণ একক-ডোমেইনে সীমাবদ্ধ। জেনারেট করা লাইসেন্স কোড কোনো ওয়েবসাইটে বা ব্রাউজারে দৃশ্যমান থাকবে না—এটি সরাসরি আপনার নিজস্ব মাস্টার জিমেইলে যাবে। সেখান থেকে নিয়ে ক্লায়েন্টকে প্রদান করবেন।
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Left: Current Domain Status */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2.5">
                                <Globe className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-base font-black text-slate-800">বর্তমান সাইটের লাইসেন্স স্ট্যাটাস</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-black ${
                                isLocalhost 
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : isActivated 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                                {isLocalhost ? '⚡ লোকাল ডেভেলপার মোড' : isActivated ? '✅ সক্রিয় ও অনুমোদিত' : '❌ লাইসেন্সহীন'}
                            </span>
                        </div>

                        <div className="space-y-4 text-xs sm:text-sm">
                            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                                <div className="text-[11px] font-bold text-slate-500 uppercase">হোস্ট / ডোমেইন</div>
                                <div className="font-mono font-black text-slate-800 text-sm">{domain}</div>
                            </div>

                            {license?.owner_email && (
                                <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                                    <div className="text-[11px] font-bold text-slate-500 uppercase">লাইসেন্স ওনার জিমেইল</div>
                                    <div className="font-bold text-indigo-700">{license.owner_email}</div>
                                </div>
                            )}

                            {license?.activated_at && (
                                <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                                    <div className="text-[11px] font-bold text-slate-500 uppercase">অ্যাক্টিভেশন সময়</div>
                                    <div className="font-semibold text-slate-700">{license.activated_at}</div>
                                </div>
                            )}

                            {/* If Not Activated: Show Activation Input Box */}
                            {!isActivated && !isLocalhost && (
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border-2 border-indigo-200 space-y-3">
                                    <div className="flex items-center gap-2 text-indigo-950 font-black text-xs uppercase tracking-wider">
                                        <Key className="w-4 h-4 text-indigo-600" />
                                        <span>এই সাইটের লাইসেন্স সক্রিয় করুন (Activate)</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 leading-relaxed">
                                        ডেভেলপারের জিমেইল থেকে প্রাপ্ত লাইসেন্স কী ও জিমেইল নিচে দিয়ে ফ্রন্ট ভিউ আনলক করুন:
                                    </p>
                                    <form onSubmit={handleActivate} className="space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                                                    ওনার জিমেইল (Owner Gmail) <span className="text-rose-500">*</span>
                                                </label>
                                                <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    <Lock className="w-2.5 h-2.5 text-slate-400" /> ফিক্সড
                                                </span>
                                            </div>
                                            <input 
                                                type="email"
                                                value="shishirbarai019@gmail.com"
                                                readOnly
                                                tabIndex={-1}
                                                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 cursor-not-allowed select-none focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                                                লাইসেন্স কী (License Key) <span className="text-rose-500">*</span>
                                            </label>
                                            <input 
                                                type="text"
                                                value={activateForm.data.license_key}
                                                onChange={e => activateForm.setData('license_key', e.target.value)}
                                                placeholder="যেমন: GURUZ-XXXX-YYYY-ZZZZ-WWWW"
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-indigo-700 focus:outline-none focus:border-indigo-500 uppercase tracking-wider"
                                                required
                                            />
                                            {activateForm.errors.license_key && (
                                                <p className="text-[11px] text-rose-600 font-bold mt-1">
                                                    {activateForm.errors.license_key}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={activateForm.processing}
                                            className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <ShieldCheck className="w-4 h-4 text-emerald-200" />
                                            <span>{activateForm.processing ? 'যাচাই হচ্ছে...' : 'লাইসেন্স সক্রিয় ও ফ্রন্ট ভিউ চালু করুন'}</span>
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* If Activated: Success Banner with Link to Front View */}
                            {isActivated && (
                                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>ফ্রন্ট ভিউ সম্পূর্ণ সক্রিয় ও আনলক রয়েছে</span>
                                    </div>
                                    <a 
                                        href="/" 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>ফ্রন্ট ভিউ ওপেন করুন (View Front Store)</span>
                                    </a>
                                </div>
                            )}

                            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-2 leading-relaxed">
                                <div className="font-black flex items-center gap-1.5 text-indigo-950">
                                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                                    <span>কীভাবে কাজ করছে এই নিরাপত্তা?</span>
                                </div>
                                <p>
                                    ১. ক্লায়েন্ট এই কোড অন্য কোনো ডোমেইনে আপলোড করলে সাইটের ফ্রন্ট ভিউ সরাসরি লক হয়ে যাবে।<br/>
                                    ২. তৈরি করা লাইসেন্স কোড শুধুমাত্র আপনার জিমেইলে যাবে, ব্রাউজারে কোনো হিস্ট্রি থাকবে না।<br/>
                                    ৩. আপনি জিমেইল থেকে কোড ক্লায়েন্টকে দিলেই শুধুমাত্র সাইট আনলক করতে পারবে।
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Master Generator (Protected by PIN) */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-800">মাস্টার লাইসেন্স জেনারেটর</h3>
                                    <p className="text-[11px] text-slate-500">আপনার জিমেইল ও সিকিউরিটি পিন দিয়ে সরাসরি জিমেইলে কোড পাঠান</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase">
                                ওনার অনলি
                            </span>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-4">
                            
                            {/* Master PIN Input */}
                            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-1">
                                <label className="block text-xs font-black text-amber-950 uppercase tracking-wider">
                                    🔐 মাস্টার সিকিউরিটি পিন (Master Security PIN) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        type={showPin ? "text" : "password"} 
                                        value={form.data.master_pin}
                                        onChange={e => form.setData('master_pin', e.target.value)}
                                        placeholder="আপনার নির্দিষ্ট মাস্টার পিন দিন (ডিফল্ট: 1971)"
                                        className={`w-full bg-white border ${form.errors.master_pin ? 'border-rose-400 focus:border-rose-500' : 'border-amber-200 focus:border-indigo-500'} rounded-lg pl-3 pr-10 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none transition tracking-widest`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPin(!showPin)}
                                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                        title={showPin ? "পিন লুকান" : "পিন দেখুন"}
                                    >
                                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {form.errors.master_pin ? (
                                    <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{form.errors.master_pin}</span>
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-amber-800">
                                        ⚠️ এই নির্দিষ্ট পিন ছাড়া অন্য কেউ কখনোই নতুন লাইসেন্স তৈরি করতে পারবে না।
                                    </p>
                                )}
                            </div>

                            {/* Owner Gmail */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        আপনার মাস্টার জিমেইল (Owner Gmail) <span className="text-rose-500">*</span>
                                    </label>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                        <Lock className="w-3 h-3 text-slate-500" />
                                        <span>অপরিবর্তনযোগ্য (Locked)</span>
                                    </span>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        value="shishirbarai019@gmail.com"
                                        readOnly
                                        tabIndex={-1}
                                        className="w-full bg-slate-100 border border-slate-300 rounded-xl pl-9 pr-24 py-2.5 text-xs sm:text-sm font-bold text-slate-700 cursor-not-allowed select-none focus:outline-none"
                                        required
                                    />
                                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                                    <div className="absolute right-2.5 top-2 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[11px] font-bold">
                                        <Lock className="w-3 h-3" />
                                        <span>ফিক্সড</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1.5 font-semibold flex items-center gap-1">
                                    <Lock className="w-3 h-3 text-indigo-600 shrink-0" />
                                    <span>এই মাস্টার জিমেইলটি স্থায়ীভাবে লক করা রয়েছে। এটি এডিট বা রিমুভ করা সম্ভব নয়—লাইসেন্স কোড সরাসরি এই জিমেইলেই যাবে।</span>
                                </p>
                            </div>

                            {/* Target Domain */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    ক্লায়েন্টের ডোমেইন (Target Domain) <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={form.data.target_domain}
                                    onChange={e => form.setData('target_domain', e.target.value)}
                                    placeholder="যেমন: clientdomain.com বা shopexample.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    লাইসেন্সটি শুধু এই নির্দিষ্ট ডোমেইনেই কাজ করবে।
                                </p>
                            </div>

                            {/* Client Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    ক্লায়েন্ট বা কোম্পানির নাম (ঐচ্ছিক)
                                </label>
                                <input 
                                    type="text" 
                                    value={form.data.client_name}
                                    onChange={e => form.setData('client_name', e.target.value)}
                                    placeholder="যেমন: করিম ব্রাদার্স"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={form.processing}
                                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Mail className="w-4 h-4 text-amber-300" />
                                <span>{form.processing ? 'যাচাই ও জিমেইলে পাঠানো হচ্ছে...' : 'লাইসেন্স তৈরি করে মাস্টার জিমেইলে পাঠান'}</span>
                            </button>
                        </form>

                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-xs text-slate-600 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                                কোড জেনারেট হওয়ার সাথে সাথে সেটি কেবল আপনার জিমেইল ইনবক্সে যাবে। কোনো হিস্ট্রি সাইটে প্রদর্শিত হবে না।
                            </span>
                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}
