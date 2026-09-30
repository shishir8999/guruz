import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Tags, 
    Plus, 
    Search, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Send, 
    Trash2, 
    MessageSquare,
    CheckCircle,
    X
} from 'lucide-react';
import Swal from 'sweetalert2';

interface CategoryRequestItem {
    id: string;
    db_id: number;
    requested_category: string;
    description: string;
    vendor_name: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    admin_notes?: string | null;
    date: string;
}

interface CategoryRequestProps {
    categoryRequests?: CategoryRequestItem[];
    totalRequests?: number;
    pendingCount?: number;
    approvedCount?: number;
    rejectedCount?: number;
}

export default function CategoryRequest({
    categoryRequests = [],
    totalRequests = 0,
    pendingCount = 0,
    approvedCount = 0,
    rejectedCount = 0
}: CategoryRequestProps) {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const { data, setData, post, processing, reset, errors } = useForm({
        requested_category: '',
        description: '',
    });

    const filteredRequests = categoryRequests.filter(req => {
        const matchesFilter = filterStatus === 'all' 
            ? true 
            : req.status.toLowerCase() === filterStatus.toLowerCase();

        const matchesSearch = req.requested_category.toLowerCase().includes(search.toLowerCase()) ||
                              req.description.toLowerCase().includes(search.toLowerCase()) ||
                              req.id.toLowerCase().includes(search.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.requested_category.trim()) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'Please enter a category name.',
                showConfirmButton: false,
                timer: 2500,
            });
            return;
        }

        post('/seller/category-request', {
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                reset();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Category request submitted to Super Admin!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleDeleteRequest = (dbId: number, categoryName: string) => {
        Swal.fire({
            title: 'Delete Request?',
            text: `Are you sure you want to cancel the request for "${categoryName}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/category-request/${dbId}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'info',
                            title: 'Request deleted.',
                            showConfirmButton: false,
                            timer: 2500,
                        });
                    }
                });
            }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Approved
                    </span>
                );
            case 'Rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} /> Pending Approval
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Request New Product Category — Seller Portal" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Banner Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <Tags className="w-3.5 h-3.5 text-indigo-400" />
                                Product Category Management
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Category Requests</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                সুপার অ্যাডমিনের কাছে নতুন ক্যাটাগরি যুক্ত করার আবেদন পাঠান। অনুমোদিত হলে সাথে সাথে শপে যুক্ত হবে।
                            </p>
                        </div>

                        <button 
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 shrink-0 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> New Category Request
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div 
                        onClick={() => setFilterStatus('all')}
                        className={`border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition duration-200 ${
                            filterStatus === 'all'
                                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                        }`}
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalRequests || categoryRequests.length}</h3>
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Click to view all</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <Tags className="w-6 h-6" />
                        </div>
                    </div>

                    <div 
                        onClick={() => setFilterStatus('pending')}
                        className={`border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition duration-200 ${
                            filterStatus === 'pending'
                                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                        }`}
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approval</p>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</h3>
                            <p className="text-[11px] text-amber-600/90 font-bold mt-0.5">Under super admin review</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>

                    <div 
                        onClick={() => setFilterStatus('approved')}
                        className={`border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition duration-200 ${
                            filterStatus === 'approved'
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                        }`}
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Categories</p>
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{approvedCount}</h3>
                            <p className="text-[11px] text-emerald-600/90 font-bold mt-0.5">Added to live system</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                        {[
                            { id: 'all', label: 'All Requests', count: categoryRequests.length },
                            { id: 'pending', label: 'Pending', count: pendingCount },
                            { id: 'approved', label: 'Approved', count: approvedCount },
                            { id: 'rejected', label: 'Rejected', count: rejectedCount },
                        ].map(tab => {
                            const isActive = filterStatus === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterStatus(tab.id)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer flex items-center gap-1.5 ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search category, description..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Request ID</th>
                                    <th className="px-6 py-4">Requested Category</th>
                                    <th className="px-6 py-4">Description / Reason</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No category requests found matching your filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{req.id}</div>
                                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{req.date}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                                                {req.requested_category}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-sm leading-relaxed font-medium">
                                                {req.description}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(req.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteRequest(req.db_id, req.requested_category)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                                    title="Cancel/Delete Request"
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

            {/* Modal for New Category Request */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Send className="w-5 h-5 text-indigo-600" /> Submit Category Request
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Requested Category Name *
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Smart Home Devices & IoT" 
                                    value={data.requested_category}
                                    onChange={e => setData('requested_category', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Reason / Description *
                                </label>
                                <textarea 
                                    rows={4} 
                                    placeholder="Explain why this category is needed for your products..." 
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs rounded-xl border border-indigo-200/60 dark:border-indigo-800 flex items-start gap-2">
                                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-indigo-500" />
                                <span>সুপার অ্যাডমিন রিকোয়েস্ট পর্যালোচনা করে অ্যাপ্রুভ করলে এটি স্বয়ংক্রিয়ভাবে গ্লোবাল সিস্টেমে যুক্ত হয়ে যাবে।</span>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)} 
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" /> Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

CategoryRequest.layout = (page: any) => <SellerLayout children={page} />;
