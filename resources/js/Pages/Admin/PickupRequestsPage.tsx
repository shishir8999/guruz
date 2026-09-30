import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Truck, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Search, 
    User, 
    Check, 
    X,
    MapPin,
    Phone,
    Package,
    ShieldCheck,
    Banknote,
    Vault
} from 'lucide-react';
import Swal from 'sweetalert2';

interface PickupRequestItem {
    id: number;
    request_number: string;
    vendor_name: string;
    phone: string;
    courier_name: string;
    pickup_address: string;
    parcel_count: number;
    estimated_weight: string;
    cod_amount: number;
    is_cod_collected?: boolean;
    notes?: string;
    status: string;
    courier_consignment_id?: string | null;
    admin_notes?: string | null;
    date: string;
}

interface PickupRequestsPageProps {
    pickupRequests?: PickupRequestItem[];
    totalRequests?: number;
    pendingCount?: number;
    acceptedCount?: number;
    rejectedCount?: number;
    totalAdminVaultFunds?: number;
}

export default function PickupRequestsPage({
    pickupRequests = [],
    totalRequests = 0,
    pendingCount = 0,
    acceptedCount = 0,
    rejectedCount = 0,
    totalAdminVaultFunds = 0
}: PickupRequestsPageProps) {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredRequests = pickupRequests.filter(req => {
        const matchesFilter = filterStatus === 'all'
            ? true
            : filterStatus === 'pending'
                ? req.status.toLowerCase().includes('pending')
                : filterStatus === 'accepted'
                    ? req.status.toLowerCase().includes('accepted')
                    : req.status.toLowerCase().includes('reject');

        const matchesSearch = req.request_number.toLowerCase().includes(search.toLowerCase()) ||
                              req.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
                              req.courier_name.toLowerCase().includes(search.toLowerCase()) ||
                              req.pickup_address.toLowerCase().includes(search.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const handleAccept = (id: number, reqNumber: string, vendorName: string, courierName: string, codAmount: number) => {
        Swal.fire({
            title: 'Accept & Dispatch to Courier?',
            html: `A tracking ID will be generated and sent to <b>${courierName}</b> rider.<br/><br/>Expected COD Collection: <b className="text-emerald-600">৳${codAmount.toLocaleString()}</b> will be held in Super Admin Vault until vendor payout approval.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Accept & Send to Courier'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/admin/pickup-requests/${id}/accept`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: `Pickup request ${reqNumber} accepted & sent to ${courierName}!`,
                            showConfirmButton: false,
                            timer: 3500,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const handleReject = (id: number, reqNumber: string) => {
        Swal.fire({
            title: 'Reject Pickup Request?',
            text: `Enter reason for rejecting pickup request ${reqNumber}:`,
            input: 'textarea',
            inputPlaceholder: 'Enter rejection reason (e.g. Out of coverage area today)...',
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
                router.post(`/admin/pickup-requests/${id}/reject`, {
                    notes: result.value
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'info',
                            title: 'Pickup request rejected.',
                            showConfirmButton: false,
                            timer: 2500,
                        });
                    }
                });
            }
        });
    };

    const getStatusBadge = (status: string) => {
        const lower = status.toLowerCase();
        if (lower.includes('accepted')) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Dispatched to Courier Rider
                </span>
            );
        } else if (lower.includes('reject')) {
            return (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" /> Rejected by Admin
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} /> Pending Admin Approval
            </span>
        );
    };

    return (
        <>
            <Head title="Vendor Pickup Requests & Courier Funds — Super Admin Panel" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Banner Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                                Super Admin Courier & Funds Dispatch Center
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Vendor Pickup & Courier Funds</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                ভেন্ডরদের পিকআপ রিকোয়েস্ট এক্সেপ্ট করলে সরাসরি কুরিয়ারে যাবে। কুরিয়ার মারফত আসা সমস্ত COD ফান্ড সুপার অ্যাডমিন ভল্টে থাকবে এবং ভেন্ডর পে-আউট রিকোয়েস্ট পাঠালে অনুমোদন সাপেক্ষে ব্যাংক অ্যাকাউন্টে জমা হবে।
                            </p>
                        </div>
                    </div>
                </div>

                {/* Super Admin Vault Summary Card */}
                <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 text-white border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-bold shrink-0">
                            <ShieldCheck className="w-7 h-7 text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-white">Super Admin Holding Vault</h3>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                    Courier COD Fund Vault
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium mt-1">
                                কুরিয়ার সংস্থার কাছ থেকে গৃহীত টাকা ভেন্ডরকে পেমেন্ট রিকোয়েস্ট অনুমোদন করার পূর্ব পর্যন্ত নিরাপদে সুপার অ্যাডমিন ভল্টে সংরক্ষিত থাকবে।
                            </p>
                            <div className="mt-3">
                                <span className="text-[11px] text-slate-400 font-bold uppercase block">Total Dispatched Courier COD Funds</span>
                                <span className="text-xl sm:text-3xl font-black text-emerald-400">৳{(totalAdminVaultFunds || 0).toLocaleString()}</span>
                            </div>
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
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pickup Requests</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalRequests || pickupRequests.length}</h3>
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Click to view all</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <Truck className="w-6 h-6" />
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
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Courier Action</p>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</h3>
                            <p className="text-[11px] text-amber-600/90 font-bold mt-0.5">Awaiting super admin review</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>

                    <div 
                        onClick={() => setFilterStatus('accepted')}
                        className={`border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition duration-200 ${
                            filterStatus === 'accepted'
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                        }`}
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sent to Courier Riders</p>
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{acceptedCount}</h3>
                            <p className="text-[11px] text-emerald-600/90 font-bold mt-0.5">Consignment tracking active</p>
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
                            { id: 'all', label: 'All Requests', count: pickupRequests.length },
                            { id: 'pending', label: 'Pending Action', count: pendingCount },
                            { id: 'accepted', label: 'Sent to Courier', count: acceptedCount },
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
                            placeholder="Search ID, vendor, courier..."
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
                                    <th className="px-6 py-4">Request ID & Date</th>
                                    <th className="px-6 py-4">Vendor Shop</th>
                                    <th className="px-6 py-4">Courier Partner</th>
                                    <th className="px-6 py-4">Parcels & Address</th>
                                    <th className="px-6 py-4">Collectable COD (৳)</th>
                                    <th className="px-6 py-4">Status & Tracking</th>
                                    <th className="px-6 py-4 text-right">Super Admin Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No vendor pickup requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{req.request_number}</div>
                                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{req.date}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-indigo-500" />
                                                    {req.vendor_name}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                                    <Phone className="w-3 h-3" /> {req.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg">
                                                    {req.courier_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed font-medium">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mb-0.5">
                                                    <Package className="w-3.5 h-3.5 text-indigo-500" />
                                                    {req.parcel_count} Parcels ({req.estimated_weight})
                                                </div>
                                                <div className="flex items-start gap-1 text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                    <span>{req.pickup_address}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                                    ৳{(req.cod_amount || 0).toLocaleString()}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">
                                                    Admin Vault Cash
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 space-y-1">
                                                <div>{getStatusBadge(req.status)}</div>
                                                {req.courier_consignment_id && (
                                                    <div className="text-[11px] text-emerald-600 font-mono font-bold">
                                                        Consignment ID: {req.courier_consignment_id}
                                                    </div>
                                                )}
                                                {req.admin_notes && (
                                                    <div className="text-[11px] text-rose-500 font-medium">
                                                        Reason: {req.admin_notes}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {req.status.toLowerCase().includes('pending') ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleAccept(req.id, req.request_number, req.vendor_name, req.courier_name, req.cod_amount)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Check className="w-3.5 h-3.5" /> Accept & Send to Courier
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req.id, req.request_number)}
                                                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs px-3 py-1.5 rounded-xl transition border border-rose-200 dark:border-rose-800 flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <X className="w-3.5 h-3.5" /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-mono">Action Processed</span>
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

PickupRequestsPage.layout = (page: any) => <AdminLayout children={page} />;
