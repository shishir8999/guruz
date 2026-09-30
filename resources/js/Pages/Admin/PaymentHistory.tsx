import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { CreditCard, DollarSign, Search, CheckCircle2 } from 'lucide-react';

export default function PaymentHistory({ payments, summary }: any) {
    return (
        <>

            <Head title="Payment History — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md">
                    <h1 className="text-2xl font-black tracking-tight">Payment History</h1>
                    <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                        All order payments
                    </p>
                </div>

                {/* Total Collected Summary Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Total collected: <strong className="text-slate-900 dark:text-white font-black text-base">৳{Number(summary.totalCollected || 0).toLocaleString()}</strong> from {summary.totalCount || 0} completed payments
                    </h2>
                </div>

                {/* Payments Table Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    {(!payments.data || payments.data.length === 0) ? (
                        <div className="text-center py-20 text-slate-400 text-xs font-bold">
                            No data yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">ORDER #</th>
                                        <th className="py-3 px-4">CUSTOMER</th>
                                        <th className="py-3 px-4">AMOUNT</th>
                                        <th className="py-3 px-4">GATEWAY</th>
                                        <th className="py-3 px-4">DATE</th>
                                        <th className="py-3 px-4 text-right">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                    {payments.data.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{p.order_number}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.customer_name}</td>
                                            <td className="py-3.5 px-4 font-bold text-emerald-600">৳{Number(p.amount).toLocaleString()}</td>
                                            <td className="py-3.5 px-4">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
                                                    {p.gateway}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-slate-500">{p.date}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                                    p.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {payments.links && payments.links.length > 3 && (
                    <div className="flex justify-center gap-1 mt-4">
                        {payments.links.map((link: any, index: number) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-1 text-xs font-bold rounded ${link.active ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

            </div>
        
</>
    );
}
