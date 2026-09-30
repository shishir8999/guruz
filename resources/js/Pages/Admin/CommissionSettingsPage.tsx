import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, Truck, TrendingDown, Users } from 'lucide-react';
import Swal from 'sweetalert2';

interface Stats {
    active_vendors: number;
    pending_vendors: number;
    total_commission: number;
    total_courier: number;
    total_vendor_payout: number;
    settled_orders: number;
}

interface Props {
    initialRate: string;
    initialAutoApprove: boolean;
    stats?: Stats;
}

export default function CommissionSettingsPage({ initialRate, initialAutoApprove, stats }: Props) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        rate: initialRate,
        auto_approve: initialAutoApprove,
    });

    const fmt = (n: number) => '৳' + Number(n).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/commission-settings', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Saved!',
                    text: 'Commission settings updated successfully.',
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

            <Head title="Commission Settings" />

            <div className="space-y-6">

                {/* Banner Header Card */}
                <div className="bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-white rounded-2xl p-5 shadow-sm">
                    <h1 className="text-2xl font-bold mb-1 tracking-tight">Commission Settings</h1>
                    <p className="text-[13px] font-medium text-white/90">
                        Global default commission rate that platform takes from each vendor order.
                    </p>
                </div>

                {/* 4 Real Stat Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[11px] font-bold text-slate-400 block">Active Vendors</span>
                            <Users className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="text-xl font-bold text-slate-900 font-sans">{stats?.active_vendors ?? 0}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{stats?.pending_vendors ?? 0} pending approval</div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[11px] font-bold text-slate-400 block">Platform Commission Earned</span>
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="text-xl font-bold text-red-600 font-sans">{fmt(stats?.total_commission ?? 0)}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{stats?.settled_orders ?? 0} settled orders</div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[11px] font-bold text-slate-400 block">Total Courier Charges</span>
                            <Truck className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-xl font-bold text-amber-600 font-sans">{fmt(stats?.total_courier ?? 0)}</div>
                        <div className="text-[11px] text-slate-400 mt-1">ডেলিভারি পিকআপ / শিপিং</div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[11px] font-bold text-slate-400 block">Total Vendor Net Payouts</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-xl font-bold text-emerald-600 font-sans">{fmt(stats?.total_vendor_payout ?? 0)}</div>
                        <div className="text-[11px] text-slate-400 mt-1">ভেন্ডরদের নেট আর্নিং</div>
                    </div>
                </div>

                {/* Alert Notification */}
                {recentlySuccessful && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Commission settings updated successfully!
                    </div>
                )}

                {/* Main Form Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                                DEFAULT COMMISSION RATE (%)
                            </label>
                            <input
                                type="text"
                                value={data.rate}
                                onChange={e => setData('rate', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                            />
                            <span className="text-[11px] text-slate-500 font-medium block mt-1.5">
                                Applied to every order item unless a shop has its own override.
                            </span>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.auto_approve}
                                    onChange={e => setData('auto_approve', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                                />
                                Auto-approve new vendor shops
                            </label>
                        </div>

                        <div className="pt-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white font-semibold text-[13px] px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-start gap-2">
                    <span className="text-[13px] font-semibold text-slate-600">
                        Per-vendor commission overrides are managed on the Vendors page.
                    </span>

                    <button
                        onClick={() => router.get('/admin/shops')}
                        className="text-[#10b981] font-semibold text-[13px] hover:underline cursor-pointer"
                    >
                        Go to Vendors →
                    </button>
                </div>

            </div>
        
</>
    );
}
