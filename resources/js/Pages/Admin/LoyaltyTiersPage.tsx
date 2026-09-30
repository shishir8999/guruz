import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Crown, CheckCircle2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface Category {
    id: number;
    name: string;
    bn_name: string | null;
    min_tier: string;
}

interface Props {
    settings: {
        loyalty_enabled: boolean;
        beginner_orders: number;
        bronze_orders: number;
        silver_orders: number;
        gold_orders: number;
        platinum_orders: number;
        diamond_orders: number;
        silver_threshold: number;
        gold_threshold: number;
        default_free_shipping: number;
        silver_free_shipping: number;
        gold_free_shipping: number;
    };
    categories: Category[];
}

export default function LoyaltyTiersPage({ settings, categories }: Props) {
    const { flash } = usePage().props as any;

    const { data, setData, post, processing } = useForm({
        loyalty_enabled: settings.loyalty_enabled,
        beginner_orders: settings.beginner_orders ?? 0,
        bronze_orders: settings.bronze_orders ?? 6,
        silver_orders: settings.silver_orders ?? 11,
        gold_orders: settings.gold_orders ?? 21,
        platinum_orders: settings.platinum_orders ?? 41,
        diamond_orders: settings.diamond_orders ?? 71,

        silver_threshold: settings.silver_threshold ?? 1000,
        gold_threshold: settings.gold_threshold ?? 5000,
        default_free_shipping: settings.default_free_shipping ?? 500,
        silver_free_shipping: settings.silver_free_shipping ?? 300,
        gold_free_shipping: settings.gold_free_shipping ?? 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/customers/loyalty', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: '100% Dynamic VIP Tiers Saved!',
                    text: 'Loyalty Tiers and Completed Order thresholds updated successfully.',
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

    return (
        <>

            <Head title="VIP Loyalty Tiers" />

            <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="flex items-center gap-3 mb-6">
                    <Crown className="w-8 h-8 text-amber-500" />
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Loyalty & VIP Tiers</h1>
                        <p className="text-xs text-slate-500">কাস্টমার প্যানেলের ভিআইপি লয়েলটি ও মিনিমাম অর্ডারের থ্রেশহোল্ড পরিবর্তন করুন।</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        {flash.success}
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Program Settings & Order Thresholds</h2>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.loyalty_enabled}
                                onChange={e => setData('loyalty_enabled', e.target.checked)}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                            />
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Enabled</span>
                        </label>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* VIP Order Threshold Rules */}
                            <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-amber-600">
                                    👑 VIP Loyalty Tier Order Thresholds (কমপ্লিট অর্ডারের থ্রেশহোল্ড)
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            ⭐ Beginner Min Orders (কমপ্লিট অর্ডার)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.beginner_orders}
                                            onChange={e => setData('beginner_orders', Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                                        />
                                        <span className="text-[10px] text-slate-400">০ থেকে {data.bronze_orders - 1} অর্ডারে Beginner লেভেল থাকবে</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            🥉 Member / Bronze Min Orders (কমপ্লিট অর্ডার)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.bronze_orders}
                                            onChange={e => setData('bronze_orders', Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                                        />
                                        <span className="text-[10px] text-slate-400">{data.bronze_orders} বা তার বেশি অর্ডারে Member টায়ার অর্জিত হবে</span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            🥈 Silver Min Orders (কমপ্লিট অর্ডার)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.silver_orders}
                                            onChange={e => setData('silver_orders', Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            🥇 Gold Min Orders (কমপ্লিট অর্ডার)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.gold_orders}
                                            onChange={e => setData('gold_orders', Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            💎 Platinum Min Orders (কমপ্লিট অর্ডার)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.platinum_orders}
                                            onChange={e => setData('platinum_orders', Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            👑 Diamond Min Orders (কমপ্লিট অর্ডার)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.diamond_orders}
                                            onChange={e => setData('diamond_orders', Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Free Shipping & Spending Amounts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Default free-shipping min (৳)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.default_free_shipping}
                                        onChange={e => setData('default_free_shipping', Number(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Silver free-shipping min (৳)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.silver_free_shipping}
                                        onChange={e => setData('silver_free_shipping', Number(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Gold free-shipping min (৳)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.gold_free_shipping}
                                        onChange={e => setData('gold_free_shipping', Number(e.target.value))}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-md disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Category Access</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Gold-only categories act as the "secret" VIP catalog - hidden from all non-gold shoppers.
                        </p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4 w-64">Min Tier</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{cat.name}</div>
                                            {cat.bn_name && <div className="text-xs text-slate-500">{cat.bn_name}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select 
                                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                                                defaultValue={cat.min_tier || 'public'}
                                            >
                                                <option value="public">Public (Bronze+)</option>
                                                <option value="silver">Silver+</option>
                                                <option value="gold">Gold Only</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={2} className="px-6 py-8 text-center text-slate-500 font-semibold">
                                            No categories found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        
</>
    );
}
