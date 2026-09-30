import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Search, 
    Banknote, 
    TrendingUp, 
    ShieldCheck, 
    ArrowUpRight,
    Edit3,
    Megaphone,
    Save
} from 'lucide-react';
import Swal from 'sweetalert2';

interface PayoutItem {
    id: number;
    seller_name: string;
    amount: number;
    payment_method: string;
    account_details: string;
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export default function PayoutRequestsPage({ 
    payouts = [],
    payoutNotice = '',
    payoutNoticeTitle = '' 
}: { 
    payouts: PayoutItem[];
    payoutNotice?: string;
    payoutNoticeTitle?: string;
}) {
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [noticeTitle, setNoticeTitle] = useState(payoutNoticeTitle || 'রিকোয়েস্ট সফলভাবে জমা হয়েছে!');
    const [noticeText, setNoticeText] = useState(payoutNotice || 'আপনার পে-আউট রিকোয়েস্টটি সফলভাবে জমা হয়েছে। আমাদের ফাইন্যান্স টিম যাচাই-বাছাই শেষে আগামী ২৪ থেকে ৪৮ কর্মঘণ্টার মধ্যে আপনার অ্যাকাউন্টে টাকা পাঠিয়ে দেবে। যেকোনো তথ্যের জন্য আমাদের সাপোর্ট সেন্টারে যোগাযোগ করুন।');
    const [isEditingNotice, setIsEditingNotice] = useState(false);
    const [isSavingNotice, setIsSavingNotice] = useState(false);

    const handleSaveNotice = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingNotice(true);
        router.post('/admin/payout-notice', {
            payout_notice: noticeText,
            payout_notice_title: noticeTitle,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSavingNotice(false);
                setIsEditingNotice(false);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'পে-আউট সাকসেস নোটিশ সফলভাবে সংরক্ষণ করা হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            },
            onError: () => {
                setIsSavingNotice(false);
            }
        });
    };

    const totalAmount = payouts.reduce((acc, p) => acc + p.amount, 0);
    const pendingAmount = payouts.filter(p => p.status.toLowerCase() === 'pending').reduce((acc, p) => acc + p.amount, 0);
    const approvedAmount = payouts.filter(p => p.status.toLowerCase() === 'approved' || p.status.toLowerCase() === 'completed').reduce((acc, p) => acc + p.amount, 0);

    const filteredPayouts = payouts.filter(p => {
        const matchesStatus = filterStatus === 'all' 
            ? true 
            : filterStatus === 'approved' 
                ? (p.status.toLowerCase() === 'approved' || p.status.toLowerCase() === 'completed')
                : p.status.toLowerCase() === filterStatus;
                
        const matchesSearch = p.seller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.payment_method.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.amount.toString().includes(searchQuery);
                              
        return matchesStatus && matchesSearch;
    });

    const handleApprove = (id: number, name: string) => {
        Swal.fire({
            title: 'Approve Payout Request?',
            text: `Are you sure you want to approve the payout for ${name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Approve Payout'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/admin/payout-requests/${id}/status`, { status: 'approved' }, {
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: `Payout request for ${name} approved!`,
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const handleReject = (id: number, name: string) => {
        Swal.fire({
            title: 'Reject Payout Request?',
            text: `Please confirm rejection of payout request for ${name}:`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Reject Request'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/admin/payout-requests/${id}/status`, { status: 'rejected' }, {
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'info',
                            title: `Payout request for ${name} rejected.`,
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Vendor Payout Requests — Super Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                                    Super Admin Control
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Vendor Payout Management</h1>
                            <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1 max-w-xl">
                                সুপার অ্যাডমিন প্যানেল থেকে সমস্ত ভেন্ডরের উইথড্রয়াল রিকোয়েস্ট সরাসরি অনুমোদন বা রিজেক্ট করুন।
                            </p>
                        </div>
                    </div>
                </div>

                {/* 📢 Payout Success Notice Settings for Sellers */}
                <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                                <Megaphone className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    সেলার পে-আউট সাকসেস পপআপ নোটিশ
                                    <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-full">
                                        সেলার উইথড্র পপআপ
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    সেলার যখন পে-আউট রিকোয়েস্ট সাবমিট করবে, তখন যে পপআপ নোটিশটি দেখবে তা এখান থেকে পরিবর্তন করুন।
                                </p>
                            </div>
                        </div>

                        {!isEditingNotice ? (
                            <button
                                type="button"
                                onClick={() => setIsEditingNotice(true)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span>নোটিশ এডিট করুন</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditingNotice(false)}
                                className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer shrink-0"
                            >
                                বাতিল করুন
                            </button>
                        )}
                    </div>

                    {!isEditingNotice ? (
                        <div className="mt-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30 rounded-xl p-4">
                            <div className="text-xs font-black text-amber-900 dark:text-amber-300 mb-1">
                                শিরোনাম: {noticeTitle}
                            </div>
                            <p className="text-xs sm:text-[13px] text-amber-950 dark:text-amber-200/90 font-medium leading-relaxed whitespace-pre-line">
                                {noticeText}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveNotice} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    নোটিশের শিরোনাম (Title)
                                </label>
                                <input
                                    type="text"
                                    value={noticeTitle}
                                    onChange={e => setNoticeTitle(e.target.value)}
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                                    placeholder="রিকোয়েস্ট সফলভাবে জমা হয়েছে!"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    নোটিশের মূল বার্তা / নির্দেশনা (Notice Message)
                                </label>
                                <textarea
                                    value={noticeText}
                                    onChange={e => setNoticeText(e.target.value)}
                                    rows={3}
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition leading-relaxed"
                                    placeholder="আপনার পে-আউট রিকোয়েস্টটি সফলভাবে জমা হয়েছে..."
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingNotice(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingNotice}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{isSavingNotice ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requested</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">৳ {totalAmount.toLocaleString()}</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">{payouts.length} total withdrawal records</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                            <Banknote className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Action</p>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">৳ {pendingAmount.toLocaleString()}</h3>
                            <p className="text-[11px] text-amber-600/80 font-medium mt-0.5">
                                {payouts.filter(p => p.status.toLowerCase() === 'pending').length} pending admin review
                            </p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved & Paid</p>
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">৳ {approvedAmount.toLocaleString()}</h3>
                            <p className="text-[11px] text-emerald-600/80 font-medium mt-0.5">
                                {payouts.filter(p => p.status.toLowerCase() === 'approved' || p.status.toLowerCase() === 'completed').length} completed payouts
                            </p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map(st => {
                            const count = payouts.filter(p => {
                                if (st === 'all') return true;
                                if (st === 'approved') return p.status.toLowerCase() === 'approved' || p.status.toLowerCase() === 'completed';
                                return p.status.toLowerCase() === st;
                            }).length;
                            const isActive = filterStatus === st;
                            return (
                                <button
                                    key={st}
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer flex items-center gap-1.5 ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <span>{st}</span>
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search shop, method, amount..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Table list */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    {filteredPayouts.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-xs font-medium">
                            No payout requests found matching your filter criteria.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-6 py-4">Request Details</th>
                                        <th className="px-6 py-4">Shop / Vendor</th>
                                        <th className="px-6 py-4">Method & Account</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                    {filteredPayouts.map(p => {
                                        const isApproved = p.status.toLowerCase() === 'approved' || p.status.toLowerCase() === 'completed';
                                        const isRejected = p.status.toLowerCase() === 'rejected';
                                        const isPending = p.status.toLowerCase() === 'pending';

                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-slate-400 font-bold text-[11px]">#PO-{1000 + p.id}</span>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">{p.date}</p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{p.seller_name}</h4>
                                                    <span className="text-[10px] text-slate-400 font-medium">Verified Vendor</span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{p.payment_method}</span>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.account_details || 'Default Receiving Method'}</p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="font-black text-slate-900 dark:text-white font-mono text-sm">৳ {p.amount.toLocaleString()}</span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    {isApproved && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                            Approved
                                                        </span>
                                                    )}
                                                    {isRejected && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                                            Rejected
                                                        </span>
                                                    )}
                                                    {isPending && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                            <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    {isPending ? (
                                                        <div className="inline-flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleApprove(p.id, p.seller_name)}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(p.id, p.seller_name)}
                                                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] font-semibold text-slate-400 italic">No actions needed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}
