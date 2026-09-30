import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { Search, ShieldAlert, ShieldCheck, AlertTriangle, AlertCircle, ShoppingBag, XCircle } from 'lucide-react';

interface FraudCheckProps {
    phone?: string;
    result?: {
        phone: string;
        total_orders: number;
        successful_orders: number;
        canceled_orders: number;
        trust_score: number;
    } | null;
}

export default function FraudCheck({ phone = '', result }: FraudCheckProps) {
    const [searchPhone, setSearchPhone] = useState(phone);
    const [loading, setLoading] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchPhone) return;
        
        setLoading(true);
        router.get('/seller/fraud-check', { phone: searchPhone }, {
            preserveState: true,
            onFinish: () => setLoading(false)
        });
    };

    // Calculate dynamic styles based on score
    const getScoreDetails = (score: number, total: number) => {
        if (total === 0) return { color: 'text-slate-500', bg: 'bg-slate-100', icon: AlertCircle, label: 'No Data', msg: 'No order history found for this customer.' };
        if (score >= 80) return { color: 'text-emerald-600', bg: 'bg-emerald-100', icon: ShieldCheck, label: 'Low Risk', msg: 'Customer has a good track record.' };
        if (score >= 40) return { color: 'text-amber-500', bg: 'bg-amber-100', icon: AlertTriangle, label: 'Moderate Risk', msg: 'Customer has some cancellations or returns.' };
        return { color: 'text-red-600', bg: 'bg-red-100', icon: ShieldAlert, label: 'High Risk', msg: 'Customer has a high rate of cancellations.' };
    };

    return (
        <>
            <Head title="Fraud Check" />
            
            <div className="p-6 max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Fraud Check</h1>
                    <p className="text-slate-500 text-sm mt-1">Investigate a customer's order history to determine their trustworthiness before shipping.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Enter customer phone number..."
                                value={searchPhone}
                                onChange={e => setSearchPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading || !searchPhone}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                        >
                            {loading ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : 'Check'}
                        </button>
                    </form>
                </div>

                {result && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50">
                            <h2 className="font-semibold text-slate-800">Results for: <span className="font-bold">{result.phone}</span></h2>
                        </div>
                        
                        <div className="p-6">
                            {(() => {
                                const details = getScoreDetails(result.trust_score, result.total_orders);
                                const Icon = details.icon;
                                
                                return (
                                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                        
                                        {/* Score Circle */}
                                        <div className="flex flex-col items-center justify-center shrink-0">
                                            <div className={`relative w-40 h-40 flex items-center justify-center rounded-full ${details.bg} border-4 ${details.color.replace('text', 'border')} shadow-inner`}>
                                                <div className="text-center">
                                                    <h3 className={`text-4xl font-black ${details.color}`}>{result.total_orders > 0 ? result.trust_score : '-'}</h3>
                                                    <span className={`text-sm font-semibold uppercase tracking-wider ${details.color}`}>Score</span>
                                                </div>
                                            </div>
                                            <div className={`mt-4 flex items-center gap-2 font-bold text-lg ${details.color}`}>
                                                <Icon size={24} />
                                                {details.label}
                                            </div>
                                            <p className="text-sm text-slate-500 mt-2 text-center max-w-[200px]">{details.msg}</p>
                                        </div>

                                        {/* Metrics Grid */}
                                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                    <ShoppingBag className="text-blue-600" size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">Total Orders</p>
                                                    <h3 className="text-xl font-bold text-slate-800">{result.total_orders}</h3>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                    <CheckCircle className="text-emerald-600" size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">Successful Deliveries</p>
                                                    <h3 className="text-xl font-bold text-slate-800">{result.successful_orders}</h3>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                                    <XCircle className="text-red-600" size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">Canceled / Returned</p>
                                                    <h3 className="text-xl font-bold text-slate-800">{result.canceled_orders}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
