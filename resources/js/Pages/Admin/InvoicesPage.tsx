import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { FileText, Send, Download, CheckCircle2, Settings } from 'lucide-react';
import Swal from 'sweetalert2';

export default function InvoicesPage({ orders }: any) {
    const [successMsg, setSuccessMsg] = useState('');

    const handleSendWhatsApp = (inv: any) => {
        let phoneNum = (inv.customer_phone || '').replace(/[^0-9]/g, '');
        if (phoneNum.startsWith('01')) {
            phoneNum = '88' + phoneNum;
        } else if (phoneNum.startsWith('1') && phoneNum.length === 10) {
            phoneNum = '880' + phoneNum;
        }

        const pdfDownloadUrl = `${window.location.origin}/invoices/${inv.order_number}/download?download=1`;

        // Automatically trigger PDF file download on local machine for easy drag-and-drop attach
        const pdfLink = document.createElement('a');
        pdfLink.href = pdfDownloadUrl;
        pdfLink.download = `Invoice_${inv.order_number}.pdf`;
        document.body.appendChild(pdfLink);
        pdfLink.click();
        document.body.removeChild(pdfLink);

        const msg = 
`📄 *Official Order Invoice PDF — Guruz Store*
---------------------------------------
Hello *${inv.customer_name}*,
Thank you for your order! Here is your official invoice:

*Order Reference:* #${inv.order_number}
*Total Amount:* ৳${Number(inv.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
*Payment Status:* ${inv.payment_status || 'Pending'}
*Order Status:* ${(inv.status || 'Processing').toUpperCase()}

📥 *Direct Download PDF Invoice File:*
${pdfDownloadUrl}

Thank you for shopping with us! 🙏`;

        const encodedMsg = encodeURIComponent(msg);
        const waUrl = `https://wa.me/${phoneNum}?text=${encodedMsg}`;

        window.open(waUrl, '_blank');
        setSuccessMsg(`Invoice PDF downloaded & WhatsApp opened for ${inv.customer_name}!`);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const handleDownloadPDF = (invNo: string) => {
        window.open(`/invoices/${invNo}/download?download=1`, '_blank');
    };

    return (
        <>

            <Head title="Invoices — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Invoices</h1>
                        <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                            প্রত্যেক কাস্টমারকে WhatsApp-এ ইনভয়েস বা অফার পাঠান।
                        </p>
                    </div>
                    <Link
                        href="/admin/finance/invoices/settings"
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition"
                    >
                        <Settings className="w-4 h-4" />
                        Invoice Settings
                    </Link>
                </div>

                {/* Success Alert */}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {successMsg}
                    </div>
                )}

                {/* Invoices Table Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    {(!orders.data || orders.data.length === 0) ? (
                        <div className="text-center py-20 text-slate-400 text-xs font-bold">
                            No data yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">INVOICE #</th>
                                        <th className="py-3 px-4">CUSTOMER</th>
                                        <th className="py-3 px-4">PHONE</th>
                                        <th className="py-3 px-4">TOTAL</th>
                                        <th className="py-3 px-4">DATE</th>
                                        <th className="py-3 px-4 text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                    {orders.data.map((inv: any) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inv.order_number}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{inv.customer_name}</td>
                                            <td className="py-3.5 px-4 font-mono">{inv.customer_phone}</td>
                                            <td className="py-3.5 px-4 font-bold text-emerald-600">৳{Number(inv.total).toLocaleString()}</td>
                                            <td className="py-3.5 px-4 font-mono text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSendWhatsApp(inv)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Send className="w-3.5 h-3.5" /> WhatsApp
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadPDF(inv.order_number)}
                                                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                                                    >
                                                        <Download className="w-3.5 h-3.5" /> PDF
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {orders.links && orders.links.length > 3 && (
                    <div className="flex justify-center gap-1 mt-4">
                        {orders.links.map((link: any, index: number) => (
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
