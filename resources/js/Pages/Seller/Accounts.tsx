import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Wallet, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    PlusCircle, 
    Search, 
    Filter, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Building2, 
    ShieldCheck, 
    FileText, 
    CheckCircle2, 
    X, 
    Save, 
    CreditCard,
    Receipt,
    PieChart,
    Layers,
    Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';

interface AccountTransaction {
    id: number;
    transaction_number: string;
    type: 'credit' | 'debit' | 'expense' | 'commission';
    category: 'sales' | 'payout' | 'admin_commission' | 'shop_expense' | 'refund';
    title: string;
    reference_id: string;
    amount: number;
    balance_after: number;
    status: string;
    notes?: string;
    created_at: string;
}

interface SummaryData {
    total_sales: number;
    total_commission: number;
    total_expenses: number;
    total_payouts: number;
    available_balance: number;
    net_profit: number;
}

interface AccountsProps {
    transactions?: AccountTransaction[];
    summary?: SummaryData;
    filters?: {
        type?: string;
        search?: string;
    };
}

export default function Accounts({
    transactions = [],
    summary = {
        total_sales: 0,
        total_commission: 0,
        total_expenses: 0,
        total_payouts: 0,
        available_balance: 0,
        net_profit: 0,
    },
    filters = {}
}: AccountsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeType, setActiveType] = useState(filters.type || 'all');
    const [showAddModal, setShowAddModal] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        type: 'expense',
        category: 'shop_expense',
        amount: '',
        reference_id: '',
        notes: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/seller/accounts', { search, type: activeType }, { preserveState: true });
    };

    const handleFilterType = (type: string) => {
        setActiveType(type);
        router.get('/seller/accounts', { search, type: type === 'all' ? '' : type }, { preserveState: true });
    };

    const handleAddEntry = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.title || !data.amount) return;

        post('/seller/accounts', {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddModal(false);
                reset();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Accounting entry recorded successfully!',
                    showConfirmButton: false,
                    timer: 3500,
                    timerProgressBar: true,
                });
            }
        });
    };

    const formatCurrency = (val: number) => {
        return '৳' + (val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <>
            <Head title="Accounts & Financial Ledger — Seller Portal" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Banner Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                                Real-Time Financial Ledger & Profit Tracker
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Accounts & Ledger</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                আপনার দোকানের বিক্রয় আয়, প্ল্যাটফর্ম কমিশন, পে-আউট এবং অপারেটিং খরচ হিসাব করুন।
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
                            >
                                <PlusCircle className="w-4 h-4" /> Record New Entry / Expense
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Metric Cards (5 Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    
                    {/* Available Balance */}
                    <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border border-indigo-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Available Balance</span>
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
                                {formatCurrency(summary.available_balance)}
                            </h3>
                            <span className="text-[10px] text-indigo-300 font-medium block mt-0.5">Ready for Payout</span>
                        </div>
                    </div>

                    {/* Gross Sales */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Sales</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-xl font-black font-mono text-slate-900 dark:text-white">
                                {formatCurrency(summary.total_sales)}
                            </h3>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">+ Total Completed Sales</span>
                        </div>
                    </div>

                    {/* Net Profit */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Profit</span>
                            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center">
                                <PieChart className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-xl font-black font-mono text-slate-900 dark:text-white">
                                {formatCurrency(summary.net_profit)}
                            </h3>
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block mt-0.5">Sales - Fees & Expenses</span>
                        </div>
                    </div>

                    {/* Admin Commission */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Platform Commission</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center">
                                <Receipt className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-xl font-black font-mono text-slate-900 dark:text-white">
                                {formatCurrency(summary.total_commission)}
                            </h3>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-0.5">Super Admin Service Fee</span>
                        </div>
                    </div>

                    {/* Shop Expenses */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operational Expenses</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center">
                                <TrendingDown className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <h3 className="text-xl font-black font-mono text-slate-900 dark:text-white">
                                {formatCurrency(summary.total_expenses)}
                            </h3>
                            <span className="text-[10px] text-rose-500 font-bold block mt-0.5">Packaging & Logistics</span>
                        </div>
                    </div>

                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                        {[
                            { id: 'all', label: 'All Transactions' },
                            { id: 'credit', label: 'Income / Sales' },
                            { id: 'debit', label: 'Payout Withdrawals' },
                            { id: 'expense', label: 'Shop Expenses' },
                            { id: 'commission', label: 'Admin Commission' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleFilterType(tab.id)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                                    activeType === tab.id
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="relative min-w-[240px]">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input 
                            type="text"
                            placeholder="Search Txn ID, reference..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                        />
                    </form>

                </div>

                {/* Financial Ledger Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-600" /> Financial Statement & Double-Entry Ledger
                        </h3>
                        <span className="text-xs text-slate-500 font-bold">
                            Showing {transactions.length} Entries
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Txn Ref & Date</th>
                                    <th className="px-6 py-4">Title / Description</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4 text-right">Amount (৳)</th>
                                    <th className="px-6 py-4 text-right">Balance After (৳)</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                                            No transactions recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                                            
                                            {/* Txn ID & Date */}
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                                                    {txn.transaction_number}
                                                </span>
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" /> {new Date(txn.created_at).toLocaleDateString()}
                                                </span>
                                            </td>

                                            {/* Title & Ref */}
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900 dark:text-white block">
                                                    {txn.title}
                                                </span>
                                                {txn.reference_id && (
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        Ref: {txn.reference_id}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Category Badge */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                                                    txn.category === 'sales'
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                        : txn.category === 'payout'
                                                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                                                        : txn.category === 'admin_commission'
                                                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                                        : 'bg-rose-50 text-rose-600 border border-rose-200'
                                                }`}>
                                                    {txn.category.replace('_', ' ')}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-6 py-4 text-right font-mono font-bold text-sm">
                                                <span className={
                                                    txn.type === 'credit'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-rose-600 dark:text-rose-400'
                                                }>
                                                    {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                                                </span>
                                            </td>

                                            {/* Balance After */}
                                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                                                {formatCurrency(txn.balance_after)}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Completed
                                                </span>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal for Recording New Entry / Expense */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <PlusCircle className="w-5 h-5 text-indigo-600" /> Record Accounting Entry
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddEntry} className="p-6 space-y-4">
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Entry Title / Description *
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Poly Bag & Packaging Supplies"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Type *
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value as any)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="expense">Shop Expense (-)</option>
                                        <option value="credit">Manual Income (+)</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Amount (৳) *
                                    </label>
                                    <input 
                                        type="number" 
                                        placeholder="0.00"
                                        value={data.amount}
                                        onChange={e => setData('amount', e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Category
                                </label>
                                <select
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value as any)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                >
                                    <option value="shop_expense">Packaging & Materials</option>
                                    <option value="shop_expense">Logistics & Transport</option>
                                    <option value="shop_expense">Warehouse & Rent</option>
                                    <option value="sales">Other Income</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Reference ID / Voucher Number
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. VOUCHER-9842"
                                    value={data.reference_id}
                                    onChange={e => setData('reference_id', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddModal(false)} 
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-3.5 h-3.5" /> Save Entry
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Accounts.layout = (page: any) => <SellerLayout children={page} />;
