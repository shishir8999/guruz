import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Tags, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    ShieldCheck, 
    User, 
    Check, 
    X,
    Filter
} from 'lucide-react';
import Swal from 'sweetalert2';

interface CategoryRequestItem {
    id: number;
    formatted_id: string;
    vendor_name: string;
    requested_category: string;
    description: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    admin_notes?: string | null;
    date: string;
}

interface CategoryRequestsPageProps {
    categoryRequests?: CategoryRequestItem[];
    totalRequests?: number;
    pendingCount?: number;
    approvedCount?: number;
    rejectedCount?: number;
}

export default function CategoryRequestsPage({
    categoryRequests = [],
    totalRequests = 0,
    pendingCount = 0,
    approvedCount = 0,
    rejectedCount = 0
}: CategoryRequestsPageProps) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredRequests = categoryRequests.filter(req => {
        const matchesFilter = filterStatus === 'all'
            ? true
            : req.status.toLowerCase() === filterStatus.toLowerCase();

        const matchesSearch = req.requested_category.toLowerCase().includes(search.toLowerCase()) ||
                              req.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
                              req.description.toLowerCase().includes(search.toLowerCase()) ||
                              req.formatted_id.toLowerCase().includes(search.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const handleApprove = (id: number, categoryName: string, vendorName: string) => {
        Swal.fire({
            title: 'Approve Category Request?',
            text: `Approving will automatically create the new category "${categoryName}" in the live system for ${vendorName}.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Approve & Create Category'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/admin/category-requests/${id}/approve`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: `Category "${categoryName}" approved & created!`,
                            showConfirmButton: false,
                            timer: 3500,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const handleReject = (id: number, categoryName: string) => {
        Swal.fire({
            title: 'Reject Request?',
            text: `Reason for rejecting request "${categoryName}":`,
            input: 'textarea',
            inputPlaceholder: 'Enter rejection reason...',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Reject Request',
            inputValidator: (value) => {
                if (!value) {
                    return 'Please enter a rejection reason!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/admin/category-requests/${id}/reject`, {
                    notes: result.value
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'info',
                            title: 'Category request rejected.',
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
                        <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} /> Pending Review
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Vendor Category Requests — Super Admin Panel" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Banner Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                                Super Admin Control Center
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Vendor Category Requests</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                ভেন্ডরদের পাঠানো নতুন ক্যাটাগরি রিকোয়েস্ট পর্যালোচনা করুন। অ্যাপ্রুভ করলে সাথে সাথে সিস্টেমে নিউ ক্যাটাগরি তৈরি হয়ে যাবে।
                            </p>
                        </div>
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
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Action</p>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</h3>
                            <p className="text-[11px] text-amber-600/90 font-bold mt-0.5">Awaiting super admin review</p>
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
                            <p className="text-[11px] text-emerald-600/90 font-bold mt-0.5">Created & Live in system</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                        {[
                            { id: 'all', label: 'All Requests', count: categoryRequests.length },
                            { id: 'pending', label: 'Pending Action', count: pendingCount },
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
                            placeholder="Search category, vendor..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Requests Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Request ID & Date</th>
                                    <th className="px-6 py-4">Vendor Shop</th>
                                    <th className="px-6 py-4">Requested Category</th>
                                    <th className="px-6 py-4">Reason / Description</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Super Admin Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No vendor category requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{req.formatted_id}</div>
                                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{req.date}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-indigo-500" />
                                                    {req.vendor_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                                                {req.requested_category}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed font-medium">
                                                {req.description}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(req.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {req.status === 'Pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApprove(req.id, req.requested_category, req.vendor_name)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Check className="w-3.5 h-3.5" /> Approve & Create
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req.id, req.requested_category)}
                                                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs px-3 py-1.5 rounded-xl transition border border-rose-200 dark:border-rose-800 flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <X className="w-3.5 h-3.5" /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-mono">Action Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
}

CategoryRequestsPage.layout = (page: any) => <AdminLayout children={page} />;
