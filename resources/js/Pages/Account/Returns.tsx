import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { PackageX, Search, Filter, AlertCircle, RefreshCcw, CheckCircle2 } from 'lucide-react';
import AccountLayout from '@/Layouts/CustomerLayout';

export default function Returns() {
    // Dummy data for returns to show the beautiful UI
    const returns = [
        {
            id: 'RET-89234',
            order_id: '#ORD-78239',
            product: 'Wireless Noise-Cancelling Headphones',
            image: '/placeholder.png',
            status: 'Processing',
            date: '2026-08-10',
            amount: 5490,
            reason: 'Defective item',
        },
        {
            id: 'RET-89102',
            order_id: '#ORD-78110',
            product: 'Ergonomic Office Chair',
            image: '/placeholder.png',
            status: 'Completed',
            date: '2026-07-28',
            amount: 12500,
            reason: 'Item not as described',
        },
        {
            id: 'RET-88992',
            order_id: '#ORD-77980',
            product: 'Mechanical Keyboard (Blue Switches)',
            image: '/placeholder.png',
            status: 'Rejected',
            date: '2026-07-15',
            amount: 3200,
            reason: 'Changed my mind',
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Processing': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 size={16} />;
            case 'Processing': return <RefreshCcw size={16} />;
            case 'Rejected': return <AlertCircle size={16} />;
            default: return null;
        }
    };

    return (
        <>
            <Head title="My Returns" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">My Returns</h1>
                        <p className="text-slate-500 text-sm mt-1">Track and manage your returned items and refunds.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Return ID or Order ID..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm transition"
                        />
                    </div>
                    
                    <button className="w-full md:w-auto px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition flex items-center justify-center gap-2">
                        <Filter size={16} />
                        Filter Status
                    </button>
                </div>

                {/* Returns List */}
                <div className="space-y-4">
                    {returns.map((ret, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-rose-200 transition-colors">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">RETURN ID</p>
                                        <p className="font-semibold text-slate-800">{ret.id}</p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-xs text-slate-500 font-medium">ORDER ID</p>
                                        <Link href={`/account/orders/${ret.order_id.replace('#', '')}`} className="font-semibold text-rose-600 hover:underline">
                                            {ret.order_id}
                                        </Link>
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-xs text-slate-500 font-medium">DATE REQUESTED</p>
                                        <p className="font-semibold text-slate-800">{new Date(ret.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(ret.status)}`}>
                                    {getStatusIcon(ret.status)}
                                    {ret.status}
                                </div>
                            </div>
                            
                            <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="w-24 h-24 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                                    <img src={ret.image} alt={ret.product} className="w-full h-full object-cover" />
                                </div>
                                
                                <div className="flex-1 space-y-2 text-center md:text-left">
                                    <h3 className="font-semibold text-slate-800 text-lg">{ret.product}</h3>
                                    <p className="text-sm text-slate-500">Reason: <span className="text-slate-700 font-medium">{ret.reason}</span></p>
                                    <p className="text-sm text-slate-500">Refund Amount: <span className="text-rose-600 font-bold text-lg">৳{ret.amount.toLocaleString()}</span></p>
                                </div>
                                
                                <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                                    <button className="w-full md:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition shadow-sm">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Empty State
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PackageX size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No Returns Found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">You don't have any active or past return requests.</p>
                    <Link href="/products" className="inline-block bg-rose-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-rose-700 transition shadow-sm">
                        Continue Shopping
                    </Link>
                </div>
                */}
            </div>
        </>
    );
}
