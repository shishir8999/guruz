import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Wallet, Search, CheckCircle2, Save, Sliders, X, PlusCircle, MinusCircle, Gift } from 'lucide-react';
import Swal from 'sweetalert2';

interface CustomerWalletItem {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    customer_code: string;
    balance: number;
    earned: number;
    used: number;
}

interface CustomerWalletProps {
    customers?: CustomerWalletItem[];
    settings?: {
        program_enabled?: boolean;
        per_order_max?: string | number;
        first_order_cashback?: string | number;
        signup_bonus?: string | number;
        min_subtotal?: string | number;
    };
}

export default function CustomerWalletPage({ customers = [], settings = {} }: CustomerWalletProps) {
    const [programEnabled, setProgramEnabled] = useState(settings.program_enabled ?? true);
    const [signupBonus, setSignupBonus] = useState(String(settings.signup_bonus ?? '0'));
    const [firstOrderMax, setFirstOrderMax] = useState(String(settings.per_order_max ?? '10'));
    const [subsequentMax, setSubsequentMax] = useState(String(settings.per_order_max ?? '10'));
    const [firstOrderCashback, setFirstOrderCashback] = useState(String(settings.first_order_cashback ?? '20'));
    const [minSubtotal, setMinSubtotal] = useState(String(settings.min_subtotal ?? '0'));

    const [customerList, setCustomerList] = useState<CustomerWalletItem[]>(customers);

    useEffect(() => {
        setCustomerList(customers);
    }, [customers]);

    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [activeCustomer, setActiveCustomer] = useState<CustomerWalletItem | null>(null);
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
    const [adjustNote, setAdjustNote] = useState('সুপার অ্যাডমিন বোনাস ক্রেডিট');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredCustomers = customerList.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.customer_code.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search)) ||
        (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSaveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/admin/customer-wallet/settings', {
            program_enabled: programEnabled,
            per_order_max: firstOrderMax,
            first_order_cashback: firstOrderCashback,
            signup_bonus: signupBonus,
            min_subtotal: minSubtotal,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Saved!',
                    text: 'কাস্টমার ওয়ালেট প্রোগ্রাম কনফিগারেশন সেভ হয়েছে!',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleAdjustSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCustomer || !adjustAmount) return;

        const val = parseFloat(adjustAmount);
        if (isNaN(val) || val <= 0) return;

        setIsSubmitting(true);
        router.post('/admin/customer-wallet/adjust', {
            user_id: activeCustomer.id,
            amount: val,
            type: adjustType,
            description: adjustNote,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                setAdjustAmount('');
                setIsSubmitting(false);
                Swal.fire({
                    title: 'সফল হয়েছে!',
                    text: `কাস্টমার "${activeCustomer.name}" এর ওয়ালেটে ${adjustType === 'add' ? '৳' + val + ' বোনাস ক্রেডিট' : '৳' + val + ' কর্তন'} করা হয়েছে!`,
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3500,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <>

            <Head title="কাস্টমার ওয়ালেট — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card matching screenshot #4 */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md">
                    <h1 className="text-2xl font-black tracking-tight">কাস্টমার ওয়ালেট</h1>
                    <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                        সাইন-আপ বোনাস, ক্যাশব্যাক ও প্রতি অর্ডারে ব্যবহারের লিমিট কনফিগার করুন। প্রয়োজনে কাস্টমারের ব্যালেন্স ম্যানুয়ালি সমন্বয় করুন।
                    </p>
                </div>



                {/* 2-Column Interface matching exact screenshot #4 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column: প্রোগ্রাম কনফিগ (Program Config Form) */}
                    <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-purple-600" /> প্রোগ্রাম কনফিগ
                        </h3>

                        <form onSubmit={handleSaveConfig} className="space-y-3">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={programEnabled}
                                    onChange={e => setProgramEnabled(e.target.checked)}
                                    className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                                />
                                প্রোগ্রাম চালু
                            </label>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">সাইন-আপ বোনাস (৳)</label>
                                <input
                                    type="text"
                                    value={signupBonus}
                                    onChange={e => setSignupBonus(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">প্রথম অর্ডারে সর্বোচ্চ ব্যবহার (৳)</label>
                                <input
                                    type="text"
                                    value={firstOrderMax}
                                    onChange={e => setFirstOrderMax(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">পরের প্রতি অর্ডারে সর্বোচ্চ (৳)</label>
                                <input
                                    type="text"
                                    value={subsequentMax}
                                    onChange={e => setSubsequentMax(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">প্রথম অর্ডার ডেলিভারিতে ক্যাশব্যাক (৳)</label>
                                <input
                                    type="text"
                                    value={firstOrderCashback}
                                    onChange={e => setFirstOrderCashback(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">মিনিমাম সাবটোটাল (৳, ঐচ্ছিক)</label>
                                <input
                                    type="text"
                                    value={minSubtotal}
                                    onChange={e => setMinSubtotal(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    💾 সেভ
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Customer Wallets Table matching screenshot #4 */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                        
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="নাম / কাস্টমার কোড / user id দিয়ে খুঁজুন..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        {/* Customer Wallets Table matching exact screenshot #4 */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="py-2.5 px-3">কাস্টমার</th>
                                        <th className="py-2.5 px-3 text-right">ব্যালেন্স</th>
                                        <th className="py-2.5 px-3 text-right">আয়</th>
                                        <th className="py-2.5 px-3 text-right">ব্যবহৃত</th>
                                        <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                    {filteredCustomers.map(c => (
                                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-2.5 px-3">
                                                <div className="font-bold text-slate-900 dark:text-white text-xs">{c.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{c.customer_code}</div>
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">৳{c.balance}</td>
                                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">৳{c.earned}</td>
                                            <td className="py-2.5 px-3 text-right font-mono text-slate-400">৳{c.used}</td>
                                            <td className="py-2.5 px-3 text-right">
                                                <button
                                                    onClick={() => { setActiveCustomer(c); setShowModal(true); }}
                                                    className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-lg transition cursor-pointer"
                                                >
                                                    সমন্বয়
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

            </div>

            {/* Manual Adjustment Modal */}
            {showModal && activeCustomer && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-purple-600" /> কাস্টমার ওয়ালেট ব্যালেন্স সমন্বয়
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAdjustSubmit} className="space-y-3">
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                                কাস্টমার: <strong className="text-slate-900 dark:text-white">{activeCustomer.name}</strong> ({activeCustomer.customer_code}) — বর্তমান ব্যালেন্স: ৳{activeCustomer.balance}
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">সমন্বয়ের ধরণ</label>
                                <select
                                    value={adjustType}
                                    onChange={e => setAdjustType(e.target.value as 'add' | 'subtract')}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold"
                                >
                                    <option value="add">যোগ করুন (Credit ৳)</option>
                                    <option value="subtract">বিয়োগ করুন (Debit ৳)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">পরিমাণ (৳)</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="any"
                                    value={adjustAmount}
                                    onChange={e => setAdjustAmount(e.target.value)}
                                    placeholder="e.g. 50"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">বিবরণ / নোট (ঐচ্ছিক)</label>
                                <input
                                    type="text"
                                    value={adjustNote}
                                    onChange={e => setAdjustNote(e.target.value)}
                                    placeholder="e.g. সাইন-আপ বোনাস / রিওয়ার্ড ক্রেডিট"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    {isSubmitting ? 'প্রসেসিং...' : 'সমন্বয় নিশ্চিত করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        
</>
    );
}
