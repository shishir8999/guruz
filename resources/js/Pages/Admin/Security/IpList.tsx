import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { ShieldAlert, Plus, Trash2, X, Search, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

interface IpRuleItem {
    id: number;
    ip_address: string;
    type: 'Whitelist' | 'Blacklist';
    reason?: string;
    added_at?: string;
}

export default function IpList({ ips = [] }: { ips: IpRuleItem[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const { data, setData, post, processing, reset } = useForm({
        ip_address: '',
        type: 'Whitelist' as 'Whitelist' | 'Blacklist',
        reason: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/security/ip-list', {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'নতুন আইপি রুল যুক্ত হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleDelete = (ipRule: IpRuleItem) => {
        Swal.fire({
            title: 'IP Rule মুছে ফেলতে চান?',
            text: `Are you sure you want to delete IP rule for "${ipRule.ip_address}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/security/ip-list/${ipRule.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'আইপি রুল ডিলিট করা হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const filteredIps = ips.filter(ip => {
        const matchesSearch = ip.ip_address.toLowerCase().includes(search.toLowerCase()) ||
                              (ip.reason || '').toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || ip.type === typeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <>
            <Head title="IP Whitelist / Blacklist — Admin" />
            
            <div className="space-y-6 max-w-full">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                                Security
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">IP Control Center</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">IP Whitelist / Blacklist</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage trusted IP whitelists and blocked spam blacklist IP addresses.
                        </p>
                    </div>

                    <button 
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-xs cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add IP Rule
                    </button>
                </div>

                {/* Toolbar Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search IP or reason..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl pl-9 pr-4 py-2 w-full focus:ring-2 focus:ring-purple-500 dark:text-white transition"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                            <option value="all">All Rule Types</option>
                            <option value="Whitelist">Whitelist</option>
                            <option value="Blacklist">Blacklist</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-4">IP Address</th>
                                    <th className="py-3.5 px-4">Rule Type</th>
                                    <th className="py-3.5 px-4">Reason / Label</th>
                                    <th className="py-3.5 px-4">Added Date</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                                {filteredIps.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-slate-400">
                                            কোনো আইপি রুল পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                ) : (
                                    filteredIps.map(ip => (
                                        <tr key={ip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 font-mono flex items-center gap-2">
                                                {ip.type === 'Whitelist' ? (
                                                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                                ) : (
                                                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                                                )}
                                                {ip.ip_address}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ip.type === 'Whitelist' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'}`}>
                                                    {ip.type}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">{ip.reason || 'No label specified'}</td>
                                            <td className="py-3.5 px-4 text-slate-500">{ip.added_at || 'Recently'}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDelete(ip)}
                                                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 rounded-lg transition cursor-pointer"
                                                    title="Delete IP Rule"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create IP Rule Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-purple-600" /> Add IP Security Rule
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    IP Address <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.ip_address}
                                    onChange={e => setData('ip_address', e.target.value)}
                                    placeholder="e.g. 192.168.1.100 or 10.0.0.1"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold font-mono focus:ring-2 focus:ring-purple-500 dark:text-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Rule Type
                                </label>
                                <select
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value as any)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500 dark:text-white transition cursor-pointer"
                                >
                                    <option value="Whitelist">Whitelist (Allowed Access)</option>
                                    <option value="Blacklist">Blacklist (Blocked Access)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Reason / Notes
                                </label>
                                <input
                                    type="text"
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    placeholder="e.g. Head Office IP or Suspected Spam Bot"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500 dark:text-white transition"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Saving...' : 'Add IP Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
