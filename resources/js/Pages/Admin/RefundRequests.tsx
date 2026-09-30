import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { RotateCcw, CheckCircle2, XCircle } from 'lucide-react';

export default function RefundRequests({ refunds }: any) {
    const [successMsg, setSuccessMsg] = useState('');

    const handleApprove = (id: number) => {
        // In a real app, this would send an Inertia POST request to approve the refund
        setSuccessMsg('Refund request approved and processed!');
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const handleReject = (id: number) => {
        // In a real app, this would send an Inertia POST request to reject the refund
        setSuccessMsg('Refund request rejected.');
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    return (
        <>

            <Head title="Refund Requests — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md">
                    <h1 className="text-2xl font-black tracking-tight">Refund Requests</h1>
                    <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                        Cancelled orders eligible for refund
                    </p>
                </div>

                {/* Alert Notification */}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {successMsg}
                    </div>
                )}

                {/* Refund Requests Table Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    {(!refunds.data || refunds.data.length === 0) ? (
                        <div className="text-center py-20 text-slate-400 text-xs font-bold">
                            No refund requests.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">ORDER #</th>
                                        <th className="py-3 px-4">CUSTOMER</th>
                                        <th className="py-3 px-4">AMOUNT</th>
                                        <th className="py-3 px-4">DATE</th>
                                        <th className="py-3 px-4">STATUS</th>
                                        <th className="py-3 px-4 text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                    {refunds.data.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{r.order_number}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{r.customer_name || 'Guest'}</td>
                                            <td className="py-3.5 px-4 font-bold text-rose-600">৳{Number(r.total).toLocaleString()}</td>
                                            <td className="py-3.5 px-4 font-mono text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                                    r.status === 'refunded' ? 'bg-emerald-100 text-emerald-800' :
                                                    r.status === 'returned' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {r.status === 'return_requested' ? 'Pending' : r.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                {r.status === 'return_requested' ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleApprove(r.id)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition"
                                                        >
                                                            Approve Refund
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(r.id)}
                                                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-mono">Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {refunds.links && refunds.links.length > 3 && (
                    <div className="flex justify-center gap-1 mt-4">
                        {refunds.links.map((link: any, index: number) => (
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
