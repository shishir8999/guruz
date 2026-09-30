import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Truck, 
    Plus, 
    Search, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Send, 
    Trash2, 
    MapPin, 
    Phone, 
    Package, 
    Weight, 
    X,
    ExternalLink,
    AlertCircle,
    Banknote,
    ArrowUpRight,
    ShieldCheck,
    Wallet
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

interface PickupRequestProps {
    pickupRequests?: PickupRequestItem[];
    totalRequests?: number;
    pendingCount?: number;
    acceptedCount?: number;
    rejectedCount?: number;
    totalCodDispatched?: number;
    totalCodPending?: number;
    shopAddress?: string;
    shopPhone?: string;
}

export default function PickupRequest({
    pickupRequests = [],
    totalRequests = 0,
    pendingCount = 0,
    acceptedCount = 0,
    rejectedCount = 0,
    totalCodDispatched = 0,
    totalCodPending = 0,
    shopAddress = 'House 42, Road 11, Block D, Banani, Dhaka',
    shopPhone = '01700000000'
}: PickupRequestProps) {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const { data, setData, post, processing, reset } = useForm({
        courier_name: 'Steadfast Courier',
        parcel_count: 5,
        estimated_weight: '3.5 kg',
        cod_amount: 15000,
        phone: shopPhone,
        pickup_address: shopAddress,
        notes: '',
    });

    const filteredRequests = pickupRequests.filter(req => {
        const matchesFilter = filterStatus === 'all'
            ? true
            : filterStatus === 'pending'
                ? req.status.toLowerCase().includes('pending')
                : filterStatus === 'accepted'
                    ? req.status.toLowerCase().includes('accepted')
                    : req.status.toLowerCase().includes('reject');

        const matchesSearch = req.request_number.toLowerCase().includes(search.toLowerCase()) ||
                              req.courier_name.toLowerCase().includes(search.toLowerCase()) ||
                              req.pickup_address.toLowerCase().includes(search.toLowerCase()) ||
                              req.notes?.toLowerCase().includes(search.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.pickup_address.trim() || !data.phone.trim() || data.cod_amount <= 0) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'Please fill in pickup address, phone and valid COD amount.',
                showConfirmButton: false,
                timer: 2500,
            });
            return;
        }

        post('/seller/pickup-request', {
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                reset();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Pickup request submitted to Super Admin!',
                    showConfirmButton: false,
                    timer: 3500,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleDeleteRequest = (id: number, reqNumber: string) => {
        Swal.fire({
            title: 'Cancel Pickup Request?',
            text: `Are you sure you want to cancel pickup request ${reqNumber}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/pickup-request/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'info',
                            title: 'Request canceled.',
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
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Dispatched to Courier
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
            <Head title="Courier Parcel Pickup & Payout Requests — Seller Portal" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Banner Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                                Courier Dispatch & Admin Vault Management
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Parcel Pickup & Fund Requests</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                পার্সেল পিকআপের রিকোয়েস্ট পাঠান। সুপার অ্যাডমিন অনুমোদন দিলে কুরিয়ারে যাবে এবং কুরিয়ারের সংগৃহীত COD টাকা সুপার অ্যাডমিন ভল্টে থাকবে। ভেন্ডর টাকা তোলার রিকোয়েস্ট পাঠালে অ্যাডমিন এপ্রুভ করলেই আপনার অ্যাকাউন্টে টাকা জমা হবে।
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/seller/payouts"
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition cursor-pointer"
                            >
                                <Banknote className="w-4 h-4 text-emerald-400" /> Request Payout
                            </Link>

                            <button 
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 shrink-0 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> New Pickup Request
                            </button>
                        </div>
                    </div>
                </div>

                {/* Admin Vault & Financial Summary Card */}
                <div className="bg-gradient-to-r from-emerald-900/90 via-teal-950 to-slate-900 text-white border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-bold shrink-0">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-white">Super Admin Vault COD Funds</h3>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                                    Protected & Held by Admin
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium mt-1">
                                কুরিয়ার মারফত কাস্টমার থেকে আসা টাকা সুপার অ্যাডমিন সিকিউর ভল্টে গ্যারান্টিসহ সংরক্ষিত আছে।
                            </p>
                            <div className="flex items-center gap-6 mt-3">
                                <div>
                                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Courier COD Collected & Held</span>
                                    <span className="text-xl sm:text-2xl font-black text-emerald-400">৳{(totalCodDispatched || 0).toLocaleString()}</span>
                                </div>
                                <div className="border-l border-white/10 pl-6">
                                    <span className="text-[11px] text-slate-400 font-bold uppercase block">Pending COD Dispatch</span>
                                    <span className="text-xl sm:text-2xl font-black text-amber-400">৳{(totalCodPending || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/seller/payouts"
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition shadow-lg shadow-emerald-500/20 shrink-0 cursor-pointer"
                    >
                        <Wallet className="w-4 h-4" /> Withdraw Funds to Account <ArrowUpRight className="w-4 h-4" />
                    </Link>
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
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Admin Approval</p>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</h3>
                            <p className="text-[11px] text-amber-600/90 font-bold mt-0.5">Pending super admin review</p>
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
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dispatched to Courier</p>
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{acceptedCount}</h3>
                            <p className="text-[11px] text-emerald-600/90 font-bold mt-0.5">Approved & sent to rider</p>
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
                            { id: 'pending', label: 'Pending Admin Review', count: pendingCount },
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
                            placeholder="Search ID, courier, address..."
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
                                    <th className="px-6 py-4">Courier Partner</th>
                                    <th className="px-6 py-4">Parcels & Weight</th>
                                    <th className="px-6 py-4">Collectable COD (৳)</th>
                                    <th className="px-6 py-4">Pickup Address</th>
                                    <th className="px-6 py-4">Status & Tracking</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No pickup requests found matching your filter.
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
                                                <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg">
                                                    {req.courier_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <Package className="w-3.5 h-3.5 text-indigo-500" />
                                                    {req.parcel_count} Parcels ({req.estimated_weight})
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                                    ৳{(req.cod_amount || 0).toLocaleString()}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">
                                                    Held in Admin Vault
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed font-medium">
                                                <div className="flex items-start gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                    <span>{req.pickup_address}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {req.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 space-y-1">
                                                <div>{getStatusBadge(req.status)}</div>
                                                {req.courier_consignment_id && (
                                                    <div className="text-[11px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                                                        <span>ID: {req.courier_consignment_id}</span>
                                                    </div>
                                                )}
                                                {req.admin_notes && (
                                                    <div className="text-[11px] text-rose-500 font-medium">
                                                        Note: {req.admin_notes}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteRequest(req.id, req.request_number)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                                    title="Cancel Pickup Request"
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

            {/* Modal for New Pickup Request */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Truck className="w-5 h-5 text-indigo-600" /> New Parcel Pickup Request
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Select Courier Partner *
                                </label>
                                <select 
                                    value={data.courier_name}
                                    onChange={e => setData('courier_name', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                >
                                    <option value="Steadfast Courier">Steadfast Courier (Fastest Delivery)</option>
                                    <option value="Pathao Courier">Pathao Courier</option>
                                    <option value="RedX Courier">RedX Courier</option>
                                    <option value="Paperfly Express">Paperfly Express</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Total Parcels *
                                    </label>
                                    <input 
                                        type="number" 
                                        min={1}
                                        value={data.parcel_count}
                                        onChange={e => setData('parcel_count', parseInt(e.target.value) || 1)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Est. Total Weight *
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 3.5 kg"
                                        value={data.estimated_weight}
                                        onChange={e => setData('estimated_weight', e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Total Collectable COD Amount (৳) *
                                </label>
                                <input 
                                    type="number" 
                                    min={100}
                                    step={100}
                                    value={data.cod_amount}
                                    onChange={e => setData('cod_amount', parseFloat(e.target.value) || 0)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-600 dark:text-emerald-400" 
                                    required
                                />
                                <span className="text-[11px] text-slate-400 block font-medium">
                                    কুরিয়ার রাইডার কাস্টমার থেকে মোট যে পরিমাণ ক্যাশ কালেকশন করবে।
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Contact Phone Number *
                                </label>
                                <input 
                                    type="text" 
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" 
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Pickup Address *
                                </label>
                                <textarea 
                                    rows={2} 
                                    value={data.pickup_address}
                                    onChange={e => setData('pickup_address', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Special Notes / Instructions
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Fragile items included. Please pick up after 2 PM." 
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200/60 dark:border-emerald-800 flex items-start gap-2">
                                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                                <span>রিকোয়েস্ট সাবমিট করার পর সুপার অ্যাডমিন যাচাই করে এপ্রুভ করলে কুরিয়ার রাইডার পৌঁছাবে। কুরিয়ারের সম্পূর্ণ টাকা সুপার অ্যাডমিন সিকিউর ভল্টে জমা থাকবে। পরবর্তীতে পে-আউট রিকোয়েস্ট পাঠালে ভেন্ডরের অ্যাকাউন্টে জমা হবে।</span>
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
                                    <Send className="w-3.5 h-3.5" /> Submit Request to Super Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

PickupRequest.layout = (page: any) => <SellerLayout children={page} />;
