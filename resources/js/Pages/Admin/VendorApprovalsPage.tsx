import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, CheckCircle2, ShieldCheck, ExternalLink, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

interface VendorApprovalItem {
    id: number;
    shop_name: string;
    shop_slug: string;
    owner_name: string;
    kyc_status: 'None' | 'Pending' | 'Approved';
    status: 'approved' | 'pending' | 'suspended' | 'rejected';
    products_count: number;
    sales: string;
    earned: string;
    commission: string;
}

export default function VendorApprovalsPage({ vendors: initialVendors = [] }: { vendors?: VendorApprovalItem[] }) {
    const vendors: VendorApprovalItem[] = Array.isArray(initialVendors) ? initialVendors : (initialVendors as any)?.data ?? [];

    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'suspended' | 'rejected'>('all');
    const [search, setSearch] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = v.shop_name.toLowerCase().includes(search.toLowerCase()) || v.shop_slug.toLowerCase().includes(search.toLowerCase());
        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && v.status === filterStatus;
    });

    const handleSuspend = (id: number, name: string) => {
        const vendor = vendors.find(v => v.id === id);
        const action = vendor?.status === 'suspended' ? 'approve' : 'suspend';
        router.post(`/admin/shops/${id}/${action}`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Vendor "${name}" status toggled!`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
            },
        });
    };

    const handleEnterPanel = (slug: string) => {
        router.get(`/shops/${slug}`);
    };

    return (
        <>

            <Head title="Vendor Approvals — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card matching screenshot #1 */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md">
                    <h1 className="text-2xl font-black tracking-tight">Vendors</h1>
                    <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                        Approve, suspend, or override commission for each vendor shop.
                    </p>
                </div>

                {/* Filter Pills + Search Bar matching screenshot #1 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {(['all', 'pending', 'approved', 'suspended', 'rejected'] as const).map(st => {
                            const count = vendors.filter(v => st === 'all' ? true : v.status === st).length;
                            const isActive = filterStatus === st;
                            return (
                                <button
                                    key={st}
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                        isActive
                                            ? 'bg-emerald-500 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                                >
                                    {st} ({count})
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search shop, slug, owner..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                </div>

                {/* Alert Notification */}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {successMsg}
                    </div>
                )}

                {/* Vendor Approvals Table Card matching screenshot #1 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">SHOP</th>
                                    <th className="py-3 px-4">OWNER</th>
                                    <th className="py-3 px-4">KYC</th>
                                    <th className="py-3 px-4">STATUS</th>
                                    <th className="py-3 px-4">PRODUCTS</th>
                                    <th className="py-3 px-4">SALES</th>
                                    <th className="py-3 px-4">EARNED</th>
                                    <th className="py-3 px-4">COMMISSION</th>
                                    <th className="py-3 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {filteredVendors.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-900 dark:text-white text-xs">{v.shop_name}</div>
                                            <div className="text-[11px] text-slate-400 font-mono">{v.shop_slug}</div>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-slate-400">{v.owner_name}</td>
                                        <td className="py-3.5 px-4">
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded font-mono">
                                                📜 {v.kyc_status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                                v.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                                v.status === 'suspended' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                                'bg-amber-100 text-amber-800'
                                            }`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{v.products_count}</td>
                                        <td className="py-3.5 px-4 font-mono text-slate-400">{v.sales}</td>
                                        <td className="py-3.5 px-4 font-mono text-slate-400">{v.earned}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="text"
                                                    defaultValue={v.commission}
                                                    className="w-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-center text-xs font-mono"
                                                />
                                                <span className="font-bold text-slate-400">%</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => router.get('/admin/vendor-kyc')}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition"
                                                >
                                                    KYC
                                                </button>
                                                <button
                                                    onClick={() => handleSuspend(v.id, v.shop_name)}
                                                    className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition"
                                                >
                                                    {v.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                                                </button>
                                                <button
                                                    onClick={() => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `${v.shop_name} verified successfully!`, showConfirmButton: false, timer: 3000, timerProgressBar: true })}
                                                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 text-[11px] font-bold px-2 py-1 rounded-lg transition"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    onClick={() => handleEnterPanel(v.shop_slug)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                                                >
                                                    Enter Panel →
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        
</>
    );
}
