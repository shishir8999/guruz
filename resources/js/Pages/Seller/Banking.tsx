import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Wallet, 
    Building2, 
    UserCircle, 
    Save, 
    Landmark, 
    Hash, 
    CreditCard, 
    ShieldCheck, 
    CheckCircle2, 
    HelpCircle, 
    Lock, 
    ArrowRight,
    QrCode,
    Check
} from 'lucide-react';
import Swal from 'sweetalert2';

interface BankingProps {
    shop?: any;
    kyc?: any;
}

export default function Banking({ shop, kyc }: BankingProps) {
    const { data, setData, post, processing, errors } = useForm({
        bank_name: kyc?.bank_name || 'City Bank Ltd.',
        account_name: kyc?.account_name || (shop?.name ? shop.name + ' Account' : 'Vendor Account'),
        account_number: kyc?.account_number || '1102 9384 8102 9901',
        branch_name: kyc?.branch_name || 'Gulshan Branch, Dhaka',
        routing_number: kyc?.routing_number || '225271892',
    });

    const popularBankPresets = [
        'City Bank Ltd.',
        'Dutch-Bangla Bank (DBBL)',
        'Eastern Bank Ltd (EBL)',
        'Islami Bank Bangladesh',
        'BRAC Bank PLC',
        'bKash (Merchant/Personal)',
        'Nagad (Mobile Banking)',
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.bank_name.trim() || !data.account_name.trim() || !data.account_number.trim()) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'Please fill in required banking fields.',
                showConfirmButton: false,
                timer: 2500,
            });
            return;
        }

        post('/seller/banking', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Banking information updated & verified!',
                    showConfirmButton: false,
                    timer: 3500,
                    timerProgressBar: true,
                });
            }
        });
    };

    // Helper to format account number into masked format for digital card mockup
    const getMaskedAccount = (acc: string) => {
        if (!acc) return '**** **** **** 0000';
        const clean = acc.replace(/\s+/g, '');
        if (clean.length <= 4) return clean;
        const lastFour = clean.slice(-4);
        return `**** **** **** ${lastFour}`;
    };

    return (
        <>
            <Head title="Banking & Payout Accounts — Seller Portal" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Banner Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                                256-Bit SSL Encrypted Vault
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Banking & Payout Accounts</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                আপনার উপার্জিত ফান্ড পাওয়ার জন্য ব্যাংক বা বিকাশ/নগদ হিসাব যুক্ত করুন। তথ্য সম্পূর্ণ এনক্রিপ্টেড এবং নিরাপদ।
                            </p>
                        </div>

                        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Verified Payout Gateway</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Visual Card Preview & Security Specs (5 Cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Interactive Digital Card Mockup */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                Live Saved Account Preview
                            </label>
                            
                            <div className="bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-indigo-500/30 relative overflow-hidden group hover:scale-[1.01] transition duration-300">
                                {/* Card Glass Accents */}
                                <div className="absolute right-[-40px] bottom-[-40px] w-56 h-56 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="absolute left-[-20px] top-[-20px] w-36 h-36 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-base sm:text-lg tracking-wide text-indigo-200">
                                            {data.bank_name || 'Select Bank Account'}
                                        </span>
                                        <div className="w-10 h-7 bg-amber-400/80 rounded-md border border-amber-300/50 flex items-center justify-center shadow-xs">
                                            <div className="w-6 h-4 border-t border-b border-amber-800/40" />
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block mb-1">Account Number</span>
                                        <span className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-white drop-shadow-sm">
                                            {getMaskedAccount(data.account_number)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                        <div>
                                            <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-wider block">Account Holder</span>
                                            <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-slate-100">
                                                {data.account_name || 'Vendor Name'}
                                            </span>
                                        </div>

                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Bank Presets */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
                            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-indigo-500" /> Quick Select Bank / MFS Provider
                            </h4>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {popularBankPresets.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setData('bank_name', preset)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                                            data.bank_name === preset
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                                : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                                        }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Security Guidelines Card */}
                        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-3xl p-6 shadow-xs space-y-3">
                            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" /> High Security Standards
                            </div>
                            <ul className="text-xs text-emerald-800 dark:text-emerald-300/90 space-y-2 leading-relaxed font-medium">
                                <li className="flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Banking information is encrypted with bank-grade 256-bit SSL.
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Minimum withdrawal limit: ৳1,000 balance.
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Funds are deposited into your account within 24-48 business hours after payout approval.
                                </li>
                            </ul>
                        </div>

                    </div>

                    {/* Right Column: Bank Details Edit Form (7 Cols) */}
                    <div className="lg:col-span-7">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                            
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-indigo-600" /> Account Information Form
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                    আপনার ব্যাংক হিসাব অথবা বিকাশ/নগদ অ্যাকাউন্টের সঠিক তথ্য প্রদান করুন।
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                
                                {/* Bank Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <Landmark className="w-4 h-4 text-indigo-500" /> Bank / MFS Provider Name *
                                    </label>
                                    <input 
                                        type="text" 
                                        value={data.bank_name} 
                                        onChange={e => setData('bank_name', e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        placeholder="e.g. City Bank Ltd. or bKash Personal"
                                        required
                                    />
                                    {errors.bank_name && <p className="text-rose-500 text-xs font-medium">{errors.bank_name}</p>}
                                </div>

                                {/* Account Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <UserCircle className="w-4 h-4 text-indigo-500" /> Account Holder Name *
                                    </label>
                                    <input 
                                        type="text" 
                                        value={data.account_name} 
                                        onChange={e => setData('account_name', e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                        placeholder="Name matching the bank account or NID"
                                        required
                                    />
                                    {errors.account_name && <p className="text-rose-500 text-xs font-medium">{errors.account_name}</p>}
                                </div>

                                {/* Account Number */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-indigo-500" /> Account Number / Wallet Number *
                                    </label>
                                    <input 
                                        type="text" 
                                        value={data.account_number} 
                                        onChange={e => setData('account_number', e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                        placeholder="e.g. 1102 9384 8102 9901 or 01700000000"
                                        required
                                    />
                                    {errors.account_number && <p className="text-rose-500 text-xs font-medium">{errors.account_number}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Branch Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-indigo-500" /> Branch Name (If Bank)
                                        </label>
                                        <input 
                                            type="text" 
                                            value={data.branch_name} 
                                            onChange={e => setData('branch_name', e.target.value)}
                                            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g. Gulshan Branch"
                                        />
                                    </div>

                                    {/* Routing Number */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-indigo-500" /> Routing Number (If Bank)
                                        </label>
                                        <input 
                                            type="text" 
                                            value={data.routing_number} 
                                            onChange={e => setData('routing_number', e.target.value)}
                                            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                            placeholder="9 digit routing number"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button 
                                        type="submit"
                                        disabled={processing}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                                    >
                                        <Save className="w-5 h-5" /> Save Banking & Payout Details
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>

                </div>

            </div>
        </>
    );
}

Banking.layout = (page: any) => <SellerLayout children={page} />;
