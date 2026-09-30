import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { RefreshCw, Search, Mail, Eye, Filter, Trash2, ShoppingCart } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AbandonedCheckouts({ initialCheckouts }: { initialCheckouts?: any[] }) {
    const [search, setSearch] = useState('');

    const [checkouts, setCheckouts] = useState(initialCheckouts && initialCheckouts.length > 0 ? initialCheckouts : [
        { id: '#AC-001', customer: 'John Doe', email: 'john@example.com', items: 3, total: '৳4,500', date: '10 mins ago', status: 'Pending' },
        { id: '#AC-002', customer: 'Sarah Smith', email: 'sarah.s@example.com', items: 1, total: '৳1,200', date: '1 hour ago', status: 'Recovered' },
        { id: '#AC-003', customer: 'Guest User', email: 'unknown@guest.com', items: 5, total: '৳12,000', date: '3 hours ago', status: 'Pending' },
        { id: '#AC-004', customer: 'Mike Johnson', email: 'mike.j@example.com', items: 2, total: '৳3,400', date: 'Yesterday', status: 'Lost' },
    ]);

    return (
        <>

            <Head title="Abandoned Checkouts — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">
                                Forms & Leads
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Abandoned Checkouts</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage and recover carts that were abandoned before payment.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                Swal.fire({
                                    title: 'Refreshed!',
                                    text: 'Data refreshed successfully.',
                                    icon: 'success',
                                    toast: true,
                                    position: 'top-end',
                                    timer: 3000,
                                    showConfirmButton: false,
                                    timerProgressBar: true,
                                });
                            }}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                    </div>
                </div>

                {/* Main Feature Content Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
                    
                    {/* Filter and Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search checkouts..."
                                className="w-full pl-9 pr-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-950 transition"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <button className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5">
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Checkout ID</th>
                                    <th className="py-3 px-4">Customer</th>
                                    <th className="py-3 px-4">Items</th>
                                    <th className="py-3 px-4">Total</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {checkouts.filter(c => c.customer.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())).map((checkout, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                                        <td className="py-3 px-4 font-mono text-orange-600 dark:text-orange-400 font-bold">{checkout.id}</td>
                                        <td className="py-3 px-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{checkout.customer}</div>
                                            <div className="text-[10px] text-slate-400">{checkout.email}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1.5">
                                                <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{checkout.items} items</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">{checkout.total}</td>
                                        <td className="py-3 px-4 text-slate-500">{checkout.date}</td>
                                        <td className="py-3 px-4">
                                            {checkout.status === 'Pending' && <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Pending</span>}
                                            {checkout.status === 'Recovered' && <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Recovered</span>}
                                            {checkout.status === 'Lost' && <span className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Lost</span>}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => Swal.fire({ title: 'Viewing', text: 'Viewing checkout details...', icon: 'info', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false })} 
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition" title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Edit Status',
                                                            input: 'select',
                                                            inputOptions: {
                                                                'Pending': 'Pending',
                                                                'Recovered': 'Recovered',
                                                                'Lost': 'Lost',
                                                            },
                                                            inputValue: checkout.status,
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Save',
                                                        }).then((result) => {
                                                            if (result.isConfirmed && result.value) {
                                                                const newCheckouts = [...checkouts];
                                                                newCheckouts[idx].status = result.value;
                                                                setCheckouts(newCheckouts);
                                                                Swal.fire('Saved!', '', 'success');
                                                            }
                                                        });
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition" title="Edit Status"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Are you sure?',
                                                            text: "You won't be able to revert this!",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#d33',
                                                            cancelButtonColor: '#3085d6',
                                                            confirmButtonText: 'Yes, delete it!'
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                setCheckouts(checkouts.filter((_, i) => i !== idx));
                                                                Swal.fire('Deleted!', 'The checkout record has been deleted.', 'success');
                                                            }
                                                        });
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition" title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
