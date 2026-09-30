import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Award, Plus, Trash2, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

interface VipTier {
    name: string;
    min_orders: number;
    max_orders?: number;
    badge?: string;
    perk?: string;
}

export default function VipLoyaltyPage({ tiers = [] }: { tiers: VipTier[] }) {
    const [tierList, setTierList] = useState<VipTier[]>(
        tiers.length > 0 ? tiers : [
            { name: 'Beginner', min_orders: 0, badge: '⭐', perk: 'Standard Customer Perks' },
            { name: 'Member', min_orders: 6, badge: '🥉', perk: '5% Extra Cashback & Priority Shipping' },
            { name: 'Silver', min_orders: 11, badge: '🥈', perk: '7% Extra Cashback & Free Vouchers' },
            { name: 'Gold', min_orders: 21, badge: '🥇', perk: '10% Cashback & Exclusive Offers' },
            { name: 'Platinum', min_orders: 41, badge: '💎', perk: '12% Cashback & Dedicated Support' },
            { name: 'Diamond', min_orders: 71, badge: '👑', perk: '15% Cashback & VIP Priority Hotline' },
        ]
    );

    const { post, processing } = useForm();

    const handleTierChange = (index: number, field: keyof VipTier, value: any) => {
        const updated = [...tierList];
        updated[index] = { ...updated[index], [field]: value };
        setTierList(updated);
    };

    const handleAddTier = () => {
        const lastMin = tierList.length > 0 ? Number(tierList[tierList.length - 1].min_orders) + 10 : 0;
        setTierList([
            ...tierList,
            { name: 'New Tier', min_orders: lastMin, badge: '🎁', perk: 'Custom Perks' }
        ]);
    };

    const handleRemoveTier = (index: number) => {
        if (tierList.length <= 1) {
            Swal.fire('Error', 'At least 1 VIP Tier is required!', 'error');
            return;
        }
        setTierList(tierList.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/customers/loyalty', {
            data: { tiers: tierList },
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'VIP Tiers Saved!',
                    text: 'VIP Loyalty thresholds and rules updated successfully.',
                    icon: 'success',
                    confirmButtonColor: '#10b981',
                });
            }
        });
    };

    return (
        <>
            <Head title="VIP Loyalty Tier Management — Super Admin" />

            <div className="space-y-8 max-w-6xl mx-auto pb-12">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-md mb-3">
                                <Award className="w-4 h-4 text-amber-400" />
                                100% Dynamic VIP Loyalty Rules Engine
                            </div>
                            <h1 className="text-3xl font-black tracking-tight">VIP Loyalty Tier Management</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                কাস্টমারদের জন্য ম্যানুয়ালি অর্ডার লিমিট ও টায়ার নেম কনফিগার করুন (যেমন: 0-5 অর্ডারে Beginner, 6+ অর্ডারে Member ইত্যাদি)।
                            </p>
                        </div>

                        <button
                            onClick={handleAddTier}
                            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl shadow-lg transition flex items-center gap-2 text-xs shrink-0"
                        >
                            <Plus className="w-4 h-4" /> Add New Tier
                        </button>
                    </div>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" /> Configure Tier Rules & Order Thresholds
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                সর্বনিম্ন কমপ্লিট অর্ডারের সংখ্যা অনুসারে সিস্টেম অটোমেটিক ইউজারকে ওই টায়ারে প্রোমোট করবে।
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {tierList.map((tier, idx) => (
                            <div 
                                key={idx} 
                                className="p-4 md:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                            >
                                <div className="md:col-span-1 flex items-center justify-center">
                                    <input 
                                        type="text" 
                                        value={tier.badge || '⭐'} 
                                        onChange={e => handleTierChange(idx, 'badge', e.target.value)}
                                        className="w-12 h-12 text-center text-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                                        title="Badge Emoji"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Tier Name
                                    </label>
                                    <input 
                                        type="text" 
                                        value={tier.name} 
                                        onChange={e => handleTierChange(idx, 'name', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Required Min Orders (কমপ্লিট অর্ডার)
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            min="0"
                                            value={tier.min_orders} 
                                            onChange={e => handleTierChange(idx, 'min_orders', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-4">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Perk / Description
                                    </label>
                                    <input 
                                        type="text" 
                                        value={tier.perk || ''} 
                                        onChange={e => handleTierChange(idx, 'perk', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amber-500"
                                        placeholder="e.g. Free shipping or 5% extra cashback"
                                    />
                                </div>

                                <div className="md:col-span-1 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTier(idx)}
                                        className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition"
                                        title="Remove Tier"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save VIP Loyalty Rules</span>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
