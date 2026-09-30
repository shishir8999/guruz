import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Search, 
    Filter, 
    RotateCcw, 
    AlertCircle, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    SearchX, 
    Download, 
    Eye, 
    MessageSquare,
    MessageCircle,
    Phone,
    X,
    Package,
    DollarSign,
    Check
} from 'lucide-react';
import Swal from 'sweetalert2';

interface ReturnRecord {
    id: number;
    return_number: string;
    order_number: string;
    customer_name: string;
    customer_phone?: string | null;
    product_name: string;
    reason: string;
    amount: number;
    status: string;
    created_at?: string;
    notes?: string | null;
}

interface ReturnsProps {
    returns?: ReturnRecord[];
    totalCount?: number;
    pendingCount?: number;
    approvedAmount?: number;
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function Returns({ 
    returns = [], 
    totalCount = 0, 
    pendingCount = 0, 
    approvedAmount = 0,
    filters = {} 
}: ReturnsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.status || 'All Returns');

    const [selectedReturnDetails, setSelectedReturnDetails] = useState<ReturnRecord | null>(null);
    const [contactingReturn, setContactingReturn] = useState<ReturnRecord | null>(null);

    const tabs = ['All Returns', 'Pending', 'Approved', 'Rejected', 'Refunded'];

    const filteredReturns = returns.filter(item => {
        const query = search.toLowerCase();
        const retNo = (item.return_number || `RET-${item.id}`).toLowerCase();
        const ordNo = (item.order_number || '').toLowerCase();
        const custName = (item.customer_name || '').toLowerCase();
        const prod = (item.product_name || '').toLowerCase();

        const matchesSearch = 
            retNo.includes(query) || 
            ordNo.includes(query) || 
            custName.includes(query) || 
            prod.includes(query);

        let matchesTab = true;
        if (activeTab !== 'All Returns') {
            matchesTab = (item.status || '').toLowerCase() === activeTab.toLowerCase();
        }

        return matchesSearch && matchesTab;
    });

    const getStatusBadge = (status: string) => {
        const st = (status || '').toLowerCase();
        switch (st) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-400">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                );
            case 'refunded':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-300 dark:bg-purple-950 dark:text-purple-400">
                        <RotateCcw className="w-3.5 h-3.5" /> Refunded
                    </span>
                );
            default: // pending
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-400">
                        <Clock className="w-3.5 h-3.5" /> Pending
                    </span>
                );
        }
    };

    // Update Return Status
    const handleUpdateStatus = (id: number, newStatus: string) => {
        router.put(`/seller/returns/${id}`, {
            status: newStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Return request marked as ${newStatus}!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            }
        });
    };

    // WhatsApp Contact System
    const handleSendWhatsApp = (item: ReturnRecord) => {
        let phoneNum = (item.customer_phone || '').replace(/[^0-9]/g, '');
        if (!phoneNum) {
            Swal.fire({
                title: 'No Phone Number!',
                text: 'Customer has no recorded phone number for WhatsApp.',
                icon: 'error',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }

        if (phoneNum.startsWith('01')) {
            phoneNum = '88' + phoneNum;
        } else if (phoneNum.startsWith('1') && phoneNum.length === 10) {
            phoneNum = '880' + phoneNum;
        }

        const msg = 
`Hello ${item.customer_name},
Regarding your Return Request #${item.return_number} (Order #${item.order_number}) for "${item.product_name}":

Current Status: ${item.status.toUpperCase()}
Amount: ৳${Number(item.amount).toLocaleString()}

Please let us know how we can assist you further regarding your refund. Thank you!`;

        const encodedMsg = encodeURIComponent(msg);
        const waUrl = `https://wa.me/${phoneNum}?text=${encodedMsg}`;

        const win = window.open(waUrl, '_blank');
        if (!win) {
            window.location.href = waUrl;
        }
    };

    const handleExportCsv = () => {
        window.location.href = '/seller/returns/export';
    };

    return (
        <>
            <Head title="Return Requests — Manage Customer Refunds" />

            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                
                {/* Header Section */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-md mb-2">
                            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                            Customer Returns & Refunds Dashboard
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Return Requests</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            কাস্টমারদের রিটার্ন ও রিফান্ড রিকোয়েস্ট ম্যানেজ এবং স্ট্যাটাস আপডেট করুন।
                        </p>
                    </div>

                    <button 
                        onClick={handleExportCsv}
                        className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0 backdrop-blur-md z-10"
                    >
                        <Download className="w-4 h-4 text-emerald-400" /> Export CSV Report
                    </button>
                </div>

                {/* Stat Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Total Return Requests
                            </span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
                                {totalCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <RotateCcw className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Pending Action Returns
                            </span>
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block font-mono">
                                {pendingCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Approved / Refunded Value
                            </span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
                                ৳{Number(approvedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Status Tabs */}
                        <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                                        activeTab === tab
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        {/* Search Input */}
                        <div className="relative w-full md:w-72">
                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by ID, order, or product..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Returns List Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    {filteredReturns.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4">Return ID & Ref</th>
                                        <th className="px-6 py-4">Product & Reason</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4 text-right">Refund Amount</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center w-40">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                    {filteredReturns.map((item) => {
                                        const retNo = item.return_number || `RET-${item.id}`;
                                        const ordNo = item.order_number || 'N/A';

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                                                        #{retNo}
                                                    </div>
                                                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                                                        Order #{ordNo}
                                                    </div>
                                                    {item.created_at && (
                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900 dark:text-white max-w-[220px] truncate text-sm">
                                                        {item.product_name}
                                                    </div>
                                                    <div className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5" /> {item.reason}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900 dark:text-white">
                                                        {item.customer_name}
                                                    </div>
                                                    {item.customer_phone && (
                                                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                                            <Phone className="w-3 h-3" /> {item.customer_phone}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-right font-mono font-black text-slate-900 dark:text-white text-sm">
                                                    ৳{Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    {getStatusBadge(item.status)}
                                                </td>

                                                {/* Always Visible Action Buttons */}
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* Quick Approve Checkmark Button */}
                                                        {item.status.toLowerCase() === 'pending' && (
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(item.id, 'approved')}
                                                                className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 rounded-xl transition cursor-pointer border border-emerald-200 shadow-2xs" 
                                                                title="Quick Approve Return"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        {/* Eye Icon - View Details */}
                                                        <button 
                                                            type="button"
                                                            onClick={() => setSelectedReturnDetails(item)}
                                                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition cursor-pointer border border-indigo-100 dark:border-indigo-900/50 shadow-2xs" 
                                                            title="View Return Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>

                                                        {/* Chat / Contact Customer Button */}
                                                        <button 
                                                            type="button"
                                                            onClick={() => setContactingReturn(item)}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 rounded-xl transition cursor-pointer border border-purple-100 dark:border-purple-900/50 shadow-2xs" 
                                                            title="Contact Customer via WhatsApp / Phone"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-4">
                                <SearchX className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No return requests found</h3>
                            <p className="text-slate-500 max-w-sm mt-2 text-xs">You don't have any return requests matching the current filter.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Return Request Details Modal */}
            {selectedReturnDetails && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <RotateCcw className="w-5 h-5 text-indigo-500" /> Return Request Details
                            </h3>
                            <button 
                                onClick={() => setSelectedReturnDetails(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs font-medium">
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Return ID:</span>
                                    <span className="font-mono font-bold text-slate-900 dark:text-white">#{selectedReturnDetails.return_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Order Ref:</span>
                                    <span className="font-mono font-bold text-indigo-600">#{selectedReturnDetails.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Customer:</span>
                                    <span className="font-bold">{selectedReturnDetails.customer_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Product:</span>
                                    <span className="font-bold">{selectedReturnDetails.product_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Refund Amount:</span>
                                    <span className="font-mono font-bold text-emerald-600">৳{Number(selectedReturnDetails.amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Return Reason:</span>
                                    <span className="font-bold text-rose-500">{selectedReturnDetails.reason}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Update Status</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => { handleUpdateStatus(selectedReturnDetails.id, 'approved'); setSelectedReturnDetails(null); }}
                                        className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-300 transition cursor-pointer"
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { handleUpdateStatus(selectedReturnDetails.id, 'refunded'); setSelectedReturnDetails(null); }}
                                        className="py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-300 transition cursor-pointer"
                                    >
                                        Refund
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => { handleUpdateStatus(selectedReturnDetails.id, 'rejected'); setSelectedReturnDetails(null); }}
                                        className="py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-300 transition cursor-pointer"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button 
                                onClick={() => setSelectedReturnDetails(null)}
                                className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Customer Options Modal */}
            {contactingReturn && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-500" /> Contact Customer
                            </h3>
                            <button 
                                onClick={() => setContactingReturn(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                                <span className="font-bold text-slate-900 dark:text-white text-sm block">{contactingReturn.customer_name}</span>
                                <span className="text-slate-500 font-mono">{contactingReturn.customer_phone || 'No phone recorded'}</span>
                            </div>

                            <button 
                                type="button"
                                onClick={() => { handleSendWhatsApp(contactingReturn); setContactingReturn(null); }}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <MessageCircle className="w-4 h-4" /> Send WhatsApp Message
                            </button>

                            {contactingReturn.customer_phone && (
                                <a 
                                    href={`tel:${contactingReturn.customer_phone}`}
                                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Phone className="w-4 h-4 text-indigo-600" /> Call Phone ({contactingReturn.customer_phone})
                                </a>
                            )}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button 
                                onClick={() => setContactingReturn(null)}
                                className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Returns.layout = (page: any) => <SellerLayout children={page} />;
