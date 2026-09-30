import React from 'react';
import { Head } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { PieChart, DollarSign, TrendingDown, TrendingUp, Truck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface OrderRow {
    order_number: string;
    gross: number;
    commission_rate: number;
    commission: number;
    courier_charge: number;
    net_earning: number;
    settled: boolean;
    date: string;
}

interface Props {
    totalRevenue?: number;
    totalOrders?: number;
    commission?: number;
    courierCharge?: number;
    netProfit?: number;
    commissionRate?: number;
    orderBreakdown?: OrderRow[];
}

export default function ProfitLoss({
    totalRevenue = 0,
    totalOrders = 0,
    commission = 0,
    courierCharge = 0,
    netProfit = 0,
    commissionRate = 10,
    orderBreakdown = [],
}: Props) {
    const fmt = (n: number) => '৳' + Number(n).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <>
            <Head title="Profit & Loss" />

            <div className="max-w-6xl mx-auto space-y-6 pb-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <PieChart className="w-6 h-6 text-indigo-600" />
                            Profit &amp; Loss Statement
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            আপনার মোট আয়, প্ল্যাটফর্ম কমিশন, কুরিয়ার চার্জ ও নেট আর্নিং দেখুন।
                        </p>
                    </div>
                </div>

                {/* 4 Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Gross Sales */}
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-28 h-28 bg-white/10 rounded-bl-full -mr-4 -mt-4" />
                        <div className="relative">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-indigo-100 font-medium text-xs uppercase tracking-wide">মোট বিক্রয় (Gross)</div>
                                <div className="p-1.5 bg-white/20 rounded-lg"><DollarSign className="w-4 h-4 text-white" /></div>
                            </div>
                            <div className="text-2xl font-black tracking-tight">{fmt(totalRevenue)}</div>
                            <div className="mt-2 text-xs text-indigo-200">{totalOrders} টি ডেলিভারি সম্পন্ন অর্ডার</div>
                        </div>
                    </div>

                    {/* Platform Commission */}
                    <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-slate-500 font-medium text-xs uppercase tracking-wide">প্ল্যাটফর্ম কমিশন</div>
                            <div className="p-1.5 bg-red-50 rounded-lg"><TrendingDown className="w-4 h-4 text-red-500" /></div>
                        </div>
                        <div className="text-2xl font-bold text-red-600 tracking-tight">-{fmt(commission)}</div>
                        <div className="mt-2 text-xs text-slate-400">{commissionRate}% প্রতিটি অর্ডার থেকে কাটা হয়</div>
                    </div>

                    {/* Courier Charge */}
                    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-slate-500 font-medium text-xs uppercase tracking-wide">কুরিয়ার চার্জ</div>
                            <div className="p-1.5 bg-amber-50 rounded-lg"><Truck className="w-4 h-4 text-amber-500" /></div>
                        </div>
                        <div className="text-2xl font-bold text-amber-600 tracking-tight">-{fmt(courierCharge)}</div>
                        <div className="mt-2 text-xs text-slate-400">ডেলিভারি পিকআপ / শিপিং চার্জ</div>
                    </div>

                    {/* Net Earning */}
                    <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5">
                            <DollarSign className="w-20 h-20 text-emerald-600" />
                        </div>
                        <div className="flex justify-between items-start mb-2 relative">
                            <div className="text-slate-600 font-bold text-xs uppercase tracking-wide">নেট আর্নিং</div>
                            <div className="p-1.5 bg-emerald-50 rounded-lg"><TrendingUp className="w-4 h-4 text-emerald-600" /></div>
                        </div>
                        <div className="text-2xl font-black text-emerald-600 tracking-tight relative">{fmt(netProfit)}</div>
                        <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 w-max px-2 py-0.5 rounded-md relative">পেআউটের জন্য প্রস্তুত</div>
                    </div>
                </div>

                {/* Calculation Formula */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm">
                    <div className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-indigo-500" /> হিসাব পদ্ধতি
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 font-mono">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">মোট বিক্রয়</span>
                        <span>−</span>
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">কমিশন ({commissionRate}%)</span>
                        <span>−</span>
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">কুরিয়ার চার্জ</span>
                        <span>=</span>
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">নেট আর্নিং</span>
                    </div>
                </div>

                {/* Per-Order Breakdown Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-800">অর্ডার-ওয়াইজ বিবরণ</h2>
                        <p className="text-xs text-slate-500 mt-0.5">প্রতিটি ডেলিভারি সম্পন্ন অর্ডারের কমিশন ও কুরিয়ার চার্জ</p>
                    </div>

                    {orderBreakdown.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm">কোনো ডেলিভারি সম্পন্ন অর্ডার নেই।</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">অর্ডার #</th>
                                        <th className="px-5 py-3 font-semibold">তারিখ</th>
                                        <th className="px-5 py-3 font-semibold text-right">মোট বিক্রয়</th>
                                        <th className="px-5 py-3 font-semibold text-right">কমিশন</th>
                                        <th className="px-5 py-3 font-semibold text-right">কুরিয়ার চার্জ</th>
                                        <th className="px-5 py-3 font-semibold text-right">নেট আর্নিং</th>
                                        <th className="px-5 py-3 font-semibold text-center">স্ট্যাটাস</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {orderBreakdown.map((row) => (
                                        <tr key={row.order_number} className="hover:bg-slate-50/60 transition">
                                            <td className="px-5 py-3.5 font-semibold text-indigo-600">#{row.order_number}</td>
                                            <td className="px-5 py-3.5 text-slate-500">{row.date}</td>
                                            <td className="px-5 py-3.5 text-right text-slate-700">{fmt(row.gross)}</td>
                                            <td className="px-5 py-3.5 text-right text-red-600">
                                                -{fmt(row.commission)}
                                                <span className="ml-1 text-xs text-slate-400">({row.commission_rate}%)</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-amber-600">
                                                {row.courier_charge > 0 ? `-${fmt(row.courier_charge)}` : '—'}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-bold text-emerald-600">{fmt(row.net_earning)}</td>
                                            <td className="px-5 py-3.5 text-center">
                                                {row.settled ? (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                        <CheckCircle2 className="w-3 h-3" /> Settled
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                        <Clock className="w-3 h-3" /> Estimated
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {/* Summary footer row */}
                                <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                                    <tr>
                                        <td className="px-5 py-3.5 font-bold text-slate-700" colSpan={2}>মোট ({totalOrders} অর্ডার)</td>
                                        <td className="px-5 py-3.5 text-right font-bold text-slate-800">{fmt(totalRevenue)}</td>
                                        <td className="px-5 py-3.5 text-right font-bold text-red-600">-{fmt(commission)}</td>
                                        <td className="px-5 py-3.5 text-right font-bold text-amber-600">
                                            {courierCharge > 0 ? `-${fmt(courierCharge)}` : '—'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black text-emerald-600">{fmt(netProfit)}</td>
                                        <td />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}
