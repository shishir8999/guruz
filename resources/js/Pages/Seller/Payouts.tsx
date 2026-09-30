import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    CreditCard, ArrowRightLeft, DollarSign, Clock, CheckCircle2, 
    AlertCircle, TrendingUp, History, XCircle, Building2, 
    ChevronRight, Filter, Search, ArrowUpRight, ShieldCheck 
} from 'lucide-react';

export default function Payouts({ payouts = [], stats = {}, payoutNotice = '', payoutNoticeTitle = '' }: any) {
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submittedData, setSubmittedData] = useState<{ amount: string; method: string } | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const availableBalance = Number(stats.available_balance || 0);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_method: 'Bank Transfer',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const currentAmount = data.amount;
        const currentMethod = data.payment_method;

        post('/seller/payouts', {
            preserveScroll: true,
            onSuccess: () => {
                setShowRequestModal(false);
                setSubmittedData({ amount: currentAmount, method: currentMethod });
                reset();
                setShowSuccessModal(true);
            }
        });
    };

    const handleQuickAmount = (val: number) => {
        setData('amount', Math.min(val, availableBalance).toString());
    };

    const filteredPayouts = payouts.filter((payout: any) => {
        const matchesStatus = statusFilter === 'all' || payout.status?.toLowerCase() === statusFilter;
        const matchesSearch = !searchQuery || 
            payout.amount?.toString().includes(searchQuery) || 
            payout.payment_method?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" /> Pending
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Payouts & Withdrawals" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">
                
                {/* Top Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                            <CreditCard className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                Payouts & Withdrawals
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                    <ShieldCheck className="w-3 h-3" /> Verified
                                </span>
                            </h1>
                            <p className="text-slate-500 text-sm mt-0.5">Manage your store earnings, view payout history, and withdraw funds seamlessly.</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowRequestModal(true)}
                        className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 hover:scale-[1.01] active:scale-95 cursor-pointer shrink-0"
                    >
                        <ArrowRightLeft className="w-5 h-5" /> 
                        <span>Request Payout</span>
                    </button>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Available Balance Card */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-7 text-white border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between group">
                        {/* Background Decorative Graphic */}
                        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none">
                            <DollarSign className="w-48 h-48 text-indigo-400" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800/50">
                                    Available Balance
                                </span>
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
                                    <TrendingUp className="w-3.5 h-3.5" /> +12%
                                </span>
                            </div>

                            <div className="text-4xl font-black tracking-tight text-white mt-1">
                                ৳{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Cleared & ready for instant withdrawal request</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                            <button 
                                onClick={() => setShowRequestModal(true)}
                                className="text-xs font-bold text-indigo-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
                            >
                                Withdraw Now <ArrowUpRight className="w-4 h-4" />
                            </button>
                            <span className="text-[11px] text-slate-500">Min ৳100</span>
                        </div>
                    </div>

                    {/* Pending Payouts Card */}
                    <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Pending Processing
                                </span>
                                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                                    <Clock className="w-5 h-5 animate-pulse" />
                                </div>
                            </div>
                            
                            <div className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                                ৳{Number(stats.pending_payouts || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Currently undergoing admin review & approval</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                            <span>Processing Time</span>
                            <span className="font-bold text-slate-700">Within 24 Hours</span>
                        </div>
                    </div>

                    {/* Total Withdrawn Card */}
                    <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Total Withdrawn
                                </span>
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="text-3xl font-black text-slate-800 tracking-tight mt-1">
                                ৳{Number(stats.total_withdrawn || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Lifetime total revenue transferred to your account</p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                            <span>Status</span>
                            <span className="font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Transfer Success
                            </span>
                        </div>
                    </div>

                </div>

                {/* Receiving Account Quick Banner */}
                <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-100 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-white text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs shrink-0">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">Default Payout Method</h4>
                            <p className="text-xs text-slate-500">Bank Transfer / Mobile Banking (Configured in account settings)</p>
                        </div>
                    </div>

                    <Link 
                        href="/seller/banking"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition shadow-2xs shrink-0"
                    >
                        <span>Update Banking Details</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Payout History Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    
                    {/* Header & Filter Controls */}
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <History className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Payout History</h2>
                                <p className="text-xs text-slate-400">Track all your previous withdrawal requests & payments</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            {/* Search Box */}
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search by amount..." 
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 focus:outline-none transition"
                                />
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                                {['all', 'pending', 'approved', 'rejected'].map((st) => (
                                    <button
                                        key={st}
                                        onClick={() => setStatusFilter(st)}
                                        className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-bold rounded-lg transition capitalize cursor-pointer ${
                                            statusFilter === st 
                                                ? 'bg-white text-indigo-600 shadow-xs' 
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    {filteredPayouts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-50/80 text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Transaction ID / Date</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Method</th>
                                        <th className="px-6 py-4">Notes</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredPayouts.map((payout: any) => (
                                        <tr key={payout.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800">#PO-{1000 + payout.id}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">
                                                    {new Date(payout.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} at {new Date(payout.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-base font-black text-slate-800">
                                                    ৳{Number(payout.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">
                                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                    {payout.payment_method || 'Bank Transfer'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                                                {payout.notes || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(payout.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-500 border border-indigo-100">
                                <History className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">No payout records found</h3>
                            <p className="text-slate-500 text-sm mt-1 max-w-md">
                                {searchQuery || statusFilter !== 'all' 
                                    ? 'No payout requests match your search criteria. Try clearing the filters.' 
                                    : 'You have not requested any payouts yet. Once you submit a payout request, it will appear here.'}
                            </p>
                            {!searchQuery && statusFilter === 'all' && (
                                <button 
                                    onClick={() => setShowRequestModal(true)}
                                    className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                                >
                                    Submit Your First Request
                                </button>
                            )}
                        </div>
                    )}
                </div>

            </div>

            {/* Request Payout Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
                                    <ArrowRightLeft className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Request Payout</h3>
                                    <p className="text-xs text-indigo-100">Withdraw your available balance to your account</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowRequestModal(false)} 
                                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={submit} className="p-6 space-y-6">
                            
                            {/* Available Balance Box */}
                            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-4 text-white flex items-center justify-between shadow-xs">
                                <div>
                                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Available Balance</span>
                                    <span className="text-2xl font-black text-emerald-400">৳{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                                    Ready to Withdraw
                                </span>
                            </div>

                            {/* Amount Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Amount to Withdraw (৳) *</label>
                                <input 
                                    type="number" 
                                    value={data.amount} 
                                    onChange={e => setData('amount', e.target.value)}
                                    min="100"
                                    max={availableBalance}
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-3.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-2xl font-black text-slate-800 bg-slate-50/50 focus:bg-white transition"
                                    placeholder="0.00"
                                    required
                                />
                                {errors.amount && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.amount}</p>}
                                
                                {/* Quick Amount Chips */}
                                <div className="flex items-center gap-2 pt-1">
                                    <span className="text-[11px] font-bold text-slate-400">Quick Select:</span>
                                    {[1000, 2500, 5000].map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => handleQuickAmount(val)}
                                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-bold text-slate-600 transition cursor-pointer"
                                        >
                                            ৳{val.toLocaleString()}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setData('amount', availableBalance.toString())}
                                        className="px-2.5 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition cursor-pointer"
                                    >
                                        Max
                                    </button>
                                </div>
                            </div>

                            {/* Payment Method Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Receiving Method</label>
                                <select
                                    value={data.payment_method}
                                    onChange={e => setData('payment_method', e.target.value)}
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition cursor-pointer"
                                >
                                    <option value="Bank Transfer">Bank Transfer (Default)</option>
                                    <option value="bKash">bKash Merchant / Personal</option>
                                    <option value="Nagad">Nagad Wallet</option>
                                </select>
                            </div>

                            {/* Notes Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Notes (Optional)</label>
                                <textarea 
                                    value={data.notes} 
                                    onChange={e => setData('notes', e.target.value)}
                                    className="w-full border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-700 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
                                    placeholder="Add any specific instruction for admin..."
                                    rows={2}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="pt-2 flex items-center gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowRequestModal(false)}
                                    className="flex-1 px-5 py-3 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-indigo-200 disabled:opacity-70 cursor-pointer"
                                >
                                    {processing ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── PAYOUT SUCCESS NOTIFICATION POPUP MODAL ─── */}
            {showSuccessModal && (
                <div 
                    className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setShowSuccessModal(false)}
                >
                    <div 
                        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Top decorative gradient bar */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

                        {/* Animated Glowing Icon */}
                        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50 shadow-inner">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
                        </div>

                        {/* Modal Title */}
                        <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                            {payoutNoticeTitle || 'রিকোয়েস্ট সফলভাবে জমা হয়েছে!'}
                        </h3>

                        {/* Payout Summary Chip */}
                        {submittedData && (
                            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 mt-3 text-xs font-bold text-slate-700">
                                <span>উইথড্র পরিমাণ: <strong className="text-emerald-600">৳{Number(submittedData.amount).toLocaleString()}</strong></span>
                                <span>•</span>
                                <span>মাধ্যম: <strong>{submittedData.method}</strong></span>
                            </div>
                        )}

                        {/* Highlighted Notice Box (Configured by Super Admin) */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 border-2 border-amber-200/80 rounded-2xl p-5 text-left mt-5 shadow-xs">
                            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm mb-1.5">
                                <span className="text-base">📢</span>
                                <span>জরুরি নোটিশ / নির্দেশনা:</span>
                            </div>
                            <p className="text-xs sm:text-[13px] text-amber-950 font-medium leading-relaxed whitespace-pre-line">
                                {payoutNotice || 'আপনার পে-আউট রিকোয়েস্টটি সফলভাবে জমা হয়েছে। আমাদের ফাইন্যান্স টিম যাচাই-বাছাই শেষে আগামী ২৪ থেকে ৪৮ কর্মঘণ্টার মধ্যে আপনার অ্যাকাউন্টে টাকা পাঠিয়ে দেবে। যেকোনো তথ্যের জন্য আমাদের সাপোর্ট সেন্টারে যোগাযোগ করুন।'}
                            </p>
                        </div>

                        {/* Actions Button */}
                        <div className="mt-6 flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-sm font-black transition shadow-lg shadow-emerald-200 active:scale-98 cursor-pointer"
                            >
                                ঠিক আছে, বুঝেছি 👍
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
