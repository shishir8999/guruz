import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { RefreshCw, Search, Package, CornerUpLeft, Truck, CheckCircle2 } from 'lucide-react';

export default function Returns({ returns = [] }: { returns?: any[] }) {
    const [search, setSearch] = useState('');

    return (
        <>

            <Head title="Returns & Exchanges" />

            <div className="space-y-6">
                
                {/* Purple Gradient Header */}
                <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                    <div className="relative z-10">
                        <h1 className="text-2xl font-black tracking-tight">Returns & Exchanges</h1>
                        <p className="text-purple-100 mt-1 text-sm">
                            Manage customer return & exchange requests and track return shipments back to sellers.
                        </p>
                    </div>
                    <div className="relative z-10">
                        <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-xl font-bold text-sm backdrop-blur-sm transition">
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <Package className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Total Requests</h3>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">0</div>
                    </div>

                    {/* Pending */}
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-500">
                            <CornerUpLeft className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Pending</h3>
                        </div>
                        <div className="text-2xl font-black text-amber-700 dark:text-amber-400">0</div>
                    </div>

                    {/* In Transit */}
                    <div className="bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-500">
                            <Truck className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">In Transit</h3>
                        </div>
                        <div className="text-2xl font-black text-purple-700 dark:text-purple-400">0</div>
                    </div>

                    {/* Completed */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-500">
                            <CheckCircle2 className="w-4 h-4" />
                            <h3 className="text-xs font-bold uppercase tracking-wider">Completed</h3>
                        </div>
                        <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">0</div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    {/* Filters */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by order#, customer, phone, shop, tracking..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto shrink-0">
                            <select className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto">
                                <option value="">All statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in_transit">In Transit</option>
                                <option value="completed">Completed</option>
                            </select>
                            <select className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto">
                                <option value="">All types</option>
                                <option value="return">Return</option>
                                <option value="exchange">Exchange</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto min-h-[300px] flex flex-col">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold text-xs border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Order</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Shop</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Return Tracking</th>
                                    <th className="px-6 py-4">Requested</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returns.length > 0 ? returns.map((item: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                                        <td className="px-6 py-4 font-bold">{item.order_number}</td>
                                        <td className="px-6 py-4">{item.customer}</td>
                                        <td className="px-6 py-4">{item.shop}</td>
                                        <td className="px-6 py-4">{item.type}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold">{item.status}</span>
                                        </td>
                                        <td className="px-6 py-4">{item.return_tracking}</td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">{item.requested_at}</td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={`/admin/orders`} className="text-indigo-600 hover:underline font-semibold text-sm">View</a>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="text-center py-24 text-slate-500 dark:text-slate-400">
                                            No return requests found.
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
