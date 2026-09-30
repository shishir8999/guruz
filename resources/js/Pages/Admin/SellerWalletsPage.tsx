import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Wallet, CheckCircle2, Sliders, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface WalletItem {
    id: number;
    seller_name: string;
    shop_name: string;
    balance: number;
}

interface Props {
    initialWallets: WalletItem[];
}

export default function SellerWalletsPage({ initialWallets }: Props) {
    const { flash } = usePage().props as any;
    
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [activeWallet, setActiveWallet] = useState<WalletItem | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        type: 'add',
        amount: '',
    });

    const handleAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeWallet || !data.amount) return;

        post(`/admin/seller-wallets/${activeWallet.id}/adjust`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAdjustModal(false);
                reset('amount');
                Swal.fire({
                    title: 'Saved!',
                    text: 'Wallet balance adjusted successfully.',
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

            <Head title="Seller Wallets — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card matching screenshot #2 */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md">
                    <h1 className="text-2xl font-black tracking-tight">Seller Wallets</h1>
                    <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                        সব সেলারের wallet balance দেখুন এবং প্রয়োজনে manual adjustment করুন।
                    </p>
                </div>

                {/* Alert Notification */}
                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {flash.success}
                    </div>
                )}

                {/* Content Box matching exact screenshot #2 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 shadow-xs text-center">
                    {initialWallets.length === 0 ? (
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 max-w-lg mx-auto text-slate-400 text-xs font-semibold">
                            No wallets yet
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {initialWallets.map(w => (
                                <div key={w.id} className="py-4 flex items-center justify-between gap-4 text-left">
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{w.shop_name}</h4>
                                        <p className="text-xs text-slate-500 font-semibold">{w.seller_name}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-slate-900 dark:text-white font-mono text-sm">
                                            ৳ {Number(w.balance || 0).toFixed(2)}
                                        </span>

                                        <button
                                            onClick={() => { setActiveWallet(w); setShowAdjustModal(true); }}
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                                        >
                                            Adjust Balance
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Balance Adjustment Modal */}
            {showAdjustModal && activeWallet && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-purple-600" /> Manual Wallet Adjustment
                            </h3>
                            <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAdjustment} className="space-y-3">
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                                Shop: <strong className="text-slate-900 dark:text-white">{activeWallet.shop_name}</strong> (Current Balance: ৳{activeWallet.balance})
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Adjustment Type</label>
                                <select
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                >
                                    <option value="add">Add Credit (৳)</option>
                                    <option value="subtract">Deduct Debit (৳)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (৳)</label>
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    placeholder="e.g. 500"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdjustModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs"
                                >
                                    Confirm Adjustment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        
</>
    );
}
