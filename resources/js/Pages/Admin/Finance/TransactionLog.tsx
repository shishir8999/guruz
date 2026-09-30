import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { 
    Search, Filter, Download, CreditCard, Wallet, Smartphone, 
    ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle2, 
    XCircle, Clock, FileText, ChevronLeft, ChevronRight, Activity
} from 'lucide-react';

const mockTransactions = [
    { id: 'TXN-909182A', date: '2026-08-06 14:30', user: 'Shishir Rahman', amount: 12500, type: 'Credit', method: 'bKash', status: 'Completed' },
    { id: 'TXN-882719B', date: '2026-08-06 12:15', user: 'John Doe', amount: 4500, type: 'Debit', method: 'Visa', status: 'Pending' },
    { id: 'TXN-771829C', date: '2026-08-05 18:45', user: 'Jane Smith', amount: 8900, type: 'Credit', method: 'Nagad', status: 'Failed' },
    { id: 'TXN-661928D', date: '2026-08-05 10:20', user: 'Alice Cooper', amount: 2100, type: 'Credit', method: 'Mastercard', status: 'Completed' },
    { id: 'TXN-552819E', date: '2026-08-04 16:55', user: 'Bob Marley', amount: 15600, type: 'Debit', method: 'Bank Transfer', status: 'Completed' },
    { id: 'TXN-443928F', date: '2026-08-04 09:10', user: 'Charlie Puth', amount: 3200, type: 'Credit', method: 'Upay', status: 'Refunded' },
];

interface TransactionLogProps {
    initialTransactions?: any[];
    stats?: {
        totalVolume: number;
        completed: number;
        pending: number;
        failed: number;
    };
}

export default function TransactionLog({ initialTransactions, stats }: TransactionLogProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const transactions = initialTransactions && initialTransactions.length > 0 ? initialTransactions : mockTransactions;

    const filteredTransactions = transactions.filter(txn => {
        const matchesSearch = !searchTerm || 
            (txn.id && txn.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (txn.user && txn.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (txn.method && txn.method.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'All' || txn.status?.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
            case 'Pending':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold"><Clock className="w-3 h-3" /> Pending</span>;
            case 'Failed':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold"><XCircle className="w-3 h-3" /> Failed</span>;
            case 'Refunded':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-bold"><RefreshCw className="w-3 h-3" /> Refunded</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 text-[10px] font-bold">{status}</span>;
        }
    };

    const getMethodIcon = (method: string) => {
        if (['Visa', 'Mastercard'].includes(method)) return <CreditCard className="w-4 h-4 text-indigo-500" />;
        if (['bKash', 'Nagad', 'Upay'].includes(method)) return <Smartphone className="w-4 h-4 text-pink-500" />;
        return <Wallet className="w-4 h-4 text-slate-500" />;
    };

    return (
        <>

            <Head title="Transaction Log — Admin Panel" />

            {/* Premium Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-indigo-500/20 dark:bg-indigo-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-2000"></div>
                <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-emerald-500/20 dark:bg-emerald-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
                            Transaction Log
                        </h1>
                        <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-indigo-500" />
                            Monitor all financial activities and settlements
                        </p>
                    </div>
                    
                    <button className="relative group overflow-hidden rounded-xl bg-slate-900 dark:bg-white px-5 py-2.5 shadow-lg shadow-slate-900/20 dark:shadow-white/20 transition-all hover:scale-105 active:scale-95">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative text-xs font-bold text-white dark:text-slate-900 flex items-center gap-2">
                            <Download className="w-4 h-4" /> Export Report
                        </span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { title: 'Total Volume', value: stats ? `৳ ${stats.totalVolume.toLocaleString()}` : '৳ 46,800', change: '+12.5%', isUp: true, icon: Wallet, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
                        { title: 'Completed', value: stats ? stats.completed.toLocaleString() : '3,492', change: '+5.2%', isUp: true, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
                        { title: 'Pending', value: stats ? stats.pending.toLocaleString() : '18', change: '-2.4%', isUp: false, icon: Clock, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
                        { title: 'Failed', value: stats ? stats.failed.toLocaleString() : '7', change: '-1.1%', isUp: false, icon: XCircle, color: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-500/20' },
                    ].map((stat, idx) => (
                        <div key={idx} className="relative group rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-5 shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:-translate-y-1 transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.title}</p>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stat.value}</h3>
                                </div>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} p-[1px] ${stat.shadow} shadow-lg`}>
                                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[11px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                                        <stat.icon className="w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1.5">
                                <span className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${stat.isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.change}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">vs last week</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Table Card */}
                <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
                    
                    {/* Toolbar */}
                    <div className="p-5 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-80">
                            <input 
                                type="text"
                                placeholder="Search by ID, User or Method..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            {['All', 'Completed', 'Pending', 'Failed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === status ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                >
                                    {status}
                                </button>
                            ))}
                            <button className="ml-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-500 hover:text-white transition-colors">
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 font-extrabold uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="py-4 px-5">Transaction ID & Date</th>
                                    <th className="py-4 px-5">User</th>
                                    <th className="py-4 px-5">Amount & Type</th>
                                    <th className="py-4 px-5">Method</th>
                                    <th className="py-4 px-5">Status</th>
                                    <th className="py-4 px-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold">
                                {filteredTransactions.map((txn, i) => (
                                    <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                                        <td className="py-4 px-5">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-bold text-slate-900 dark:text-white">{txn.id}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{txn.date}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                                                    {txn.user.charAt(0)}
                                                </div>
                                                <span className="font-bold">{txn.user}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex flex-col">
                                                <span className={`font-black ${txn.type === 'Credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                    {txn.type === 'Credit' ? '+' : '-'}৳ {txn.amount.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-slate-400 uppercase">{txn.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 w-fit px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                                {getMethodIcon(txn.method)}
                                                <span className="text-[11px] font-bold">{txn.method}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            {getStatusBadge(txn.status)}
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg inline-flex items-center justify-center" title="View Receipt">
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">Showing 1 to 6 of 12,490 entries</span>
                        <div className="flex gap-1">
                            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/20">1</button>
                            <button className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center">2</button>
                            <button className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center">3</button>
                            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        
</>
    );
}
