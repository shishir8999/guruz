import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Search, MessageCircle, LogIn, Trash2, X, Store } from 'lucide-react';
import Swal from 'sweetalert2';

interface ShopListItem {
    id: number;
    name: string;
    sub_name?: string;
    slug?: string;
    avatar?: string;
    logo?: string;
    products_count?: number;
    whatsapp?: string;
    status: 'Approved' | 'Pending' | 'Suspended' | 'approved' | 'pending' | 'suspended';
    verified?: boolean;
    is_verified?: boolean;
}

export default function ShopsPage({ shops: initialShops = [] }: { shops?: ShopListItem[] }) {
    const shops: ShopListItem[] = Array.isArray(initialShops) ? initialShops : (initialShops as any)?.data ?? [];

    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newShopName, setNewShopName] = useState('');

    const filteredShops = shops.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.slug || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateShop = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newShopName) return;
        Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Shop creation requires seller registration.', showConfirmButton: false, timer: 3000 });
        setShowAddModal(false);
        setNewShopName('');
    };

    const handleStatusChange = (id: number, newStatus: string) => {
        router.post(`/admin/shops/${id}/update-status`, {
            status: newStatus.toLowerCase()
        }, {
            preserveScroll: true,
            onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Shop status updated to ${newStatus}`, showConfirmButton: false, timer: 3000, timerProgressBar: true }),
        });
    };

    const handleDelete = (id: number, name: string) => {
        Swal.fire({
            title: 'Delete Shop?',
            text: `Are you sure you want to delete shop "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'No, Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                router.delete(`/admin/shops/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Shop "${name}" deleted.`, showConfirmButton: false, timer: 3000, timerProgressBar: true }),
                });
            }
        });
    };

    const handleVendorLogin = (slug: string) => {
        router.get(`/shops/${slug}`);
    };

    return (
        <>

            <Head title="Shops / Vendors — Admin Panel" />

            <div className="space-y-6">

                {/* Header Title + Search Bar + Green + New Shop Button matching screenshot #3 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Shops / Vendors</h1>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search shops..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" /> New Shop
                        </button>
                    </div>
                </div>

                {/* Shops Table Card matching exact screenshot #3 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">SHOP</th>
                                    <th className="py-3 px-4">SLUG</th>
                                    <th className="py-3 px-4">PRODUCTS</th>
                                    <th className="py-3 px-4">WHATSAPP</th>
                                    <th className="py-3 px-4">STATUS</th>
                                    <th className="py-3 px-4">VERIFIED</th>
                                    <th className="py-3 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {filteredShops.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        
                                        {/* SHOP avatar + name + sub_name */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-xs">{s.name}</div>
                                                    <div className="text-[11px] text-slate-400 font-medium">{s.sub_name}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* SLUG */}
                                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">{s.slug}</td>

                                        {/* PRODUCTS */}
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{s.products_count}</td>

                                        {/* WHATSAPP */}
                                        <td className="py-3.5 px-4">
                                            <button className="border border-slate-200 dark:border-slate-700 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 hover:bg-slate-50">
                                                💬 Add
                                            </button>
                                        </td>

                                        {/* STATUS dropdown */}
                                        <td className="py-3.5 px-4">
                                            <select
                                                value={s.status}
                                                onChange={e => handleStatusChange(s.id, e.target.value as ShopListItem['status'])}
                                                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="Approved">Approved</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Suspended">Suspended</option>
                                            </select>
                                        </td>

                                        {/* VERIFIED x icon */}
                                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                                            {s.verified ? '✓' : '✕'}
                                        </td>

                                        {/* ACTIONS -> Login green button + red trash icon */}
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleVendorLogin(s.slug)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                                                >
                                                    → Login
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s.id, s.name)}
                                                    className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
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

            {/* New Shop Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Store className="w-5 h-5 text-emerald-600" /> Create Vendor Shop
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateShop} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Shop Name *</label>
                                <input
                                    type="text"
                                    value={newShopName}
                                    onChange={e => setNewShopName(e.target.value)}
                                    placeholder="e.g. Apex Official Store"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs"
                                >
                                    Create Shop
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        
</>
    );
}
