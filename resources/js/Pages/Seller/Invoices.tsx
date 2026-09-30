import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    FileText, 
    Search, 
    Printer, 
    Share2, 
    Eye, 
    Download, 
    Calendar, 
    Phone, 
    Mail, 
    MapPin, 
    CheckCircle2, 
    Clock, 
    X, 
    MessageCircle,
    DollarSign,
    Package,
    Send
} from 'lucide-react';
import Swal from 'sweetalert2';

interface InvoiceRecord {
    id: number;
    invoice_number: string;
    order_number: string;
    customer_name: string;
    customer_phone?: string | null;
    customer_email?: string | null;
    shipping_address?: string | null;
    subtotal?: number;
    shipping_fee?: number;
    discount?: number;
    total: number;
    payment_method?: string;
    payment_status: string;
    status: string;
    created_at: string;
}

interface InvoicesProps {
    invoices?: InvoiceRecord[];
    totalInvoicesCount?: number;
    totalPaidRevenue?: number;
    pendingInvoicesCount?: number;
    shop?: any;
    filters?: {
        search?: string;
    };
}

export default function Invoices({ 
    invoices = [], 
    totalInvoicesCount = 0, 
    totalPaidRevenue = 0, 
    pendingInvoicesCount = 0,
    shop = null,
    filters = {} 
}: InvoicesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

    const filteredInvoices = invoices.filter(inv => {
        const query = search.toLowerCase();
        return (
            inv.invoice_number.toLowerCase().includes(query) ||
            inv.order_number.toLowerCase().includes(query) ||
            inv.customer_name.toLowerCase().includes(query) ||
            (inv.customer_phone && inv.customer_phone.includes(query))
        );
    });

    const getPaymentBadge = (status: string) => {
        const st = (status || '').toLowerCase();
        switch (st) {
            case 'paid':
                return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400';
            case 'failed':
                return 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950 dark:text-rose-400';
            default:
                return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:text-amber-400';
        }
    };

    const getStatusBadge = (status: string) => {
        const st = (status || '').toLowerCase();
        switch (st) {
            case 'delivered':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400';
            case 'processing':
                return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400';
            case 'shipped':
                return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400';
            case 'cancelled':
                return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400';
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400';
        }
    };

    // Send Invoice PDF via WhatsApp System
    const handleSendWhatsAppInvoice = (inv: InvoiceRecord) => {
        const defaultPhone = inv.customer_phone || '';
        const pdfDownloadUrl = `${window.location.origin}/invoices/${inv.order_number}/download?download=1`;

        Swal.fire({
            title: 'Send Invoice PDF via WhatsApp',
            html: `
                <div class="text-left space-y-3 font-sans">
                    <p class="text-xs text-slate-600">
                        Customer <b>${inv.customer_name}</b>'s WhatsApp Number:
                    </p>
                    <input id="swal_wa_phone" type="text" value="${defaultPhone}" class="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. +8801700000001" />
                    <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-800 space-y-1">
                        <p class="font-bold flex items-center gap-1">📄 PDF ইনভয়েস ডাউনলোড ও লিংক সেন্ড হবে:</p>
                        <p class="text-[10px] text-emerald-600 font-mono break-all">${pdfDownloadUrl}</p>
                    </div>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: '🟢 Send PDF via WhatsApp',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const phoneInput = (document.getElementById('swal_wa_phone') as HTMLInputElement)?.value || '';
                let phoneNum = phoneInput.replace(/[^0-9]/g, '');

                if (!phoneNum) {
                    Swal.showValidationMessage('Please enter a valid phone number!');
                    return false;
                }

                if (phoneNum.startsWith('01')) {
                    phoneNum = '88' + phoneNum;
                } else if (phoneNum.startsWith('1') && phoneNum.length === 10) {
                    phoneNum = '880' + phoneNum;
                }

                return phoneNum;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                const phoneNum = result.value;
                const shopName = shop?.name || 'Guruz E-Commerce Store';

                // Automatically trigger PDF file download on local machine for easy drag-and-drop attach
                const pdfLink = document.createElement('a');
                pdfLink.href = pdfDownloadUrl;
                pdfLink.download = `Invoice_${inv.order_number}.pdf`;
                document.body.appendChild(pdfLink);
                pdfLink.click();
                document.body.removeChild(pdfLink);

                const msg = 
`📄 *Official Order Invoice PDF — ${shopName}*
---------------------------------------
Hello *${inv.customer_name}*,
Thank you for your order! Here is your official invoice:

*Invoice Number:* ${inv.invoice_number}
*Order Reference:* #${inv.order_number}
*Total Amount:* ৳${Number(inv.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
*Payment Status:* ${inv.payment_status}
*Order Status:* ${(inv.status || 'Processing').toUpperCase()}

📥 *Direct Download PDF Invoice File:*
${pdfDownloadUrl}

Thank you for shopping with us! 🙏`;

                const encodedMsg = encodeURIComponent(msg);
                const waUrl = `https://wa.me/${phoneNum}?text=${encodedMsg}`;

                Swal.fire({
                    icon: 'success',
                    title: 'PDF ডাউনলোড হচ্ছে ও WhatsApp চালু হচ্ছে!',
                    text: 'ডাউনলোড হওয়া PDF ফাইলটি WhatsApp উইন্ডোতে ড্র্যাগ করে সরাসরি সেন্ড করতে পারেন।',
                    confirmButtonColor: '#10b981',
                    confirmButtonText: 'ঠিক আছে',
                });

                // Open in WhatsApp Web / App
                const win = window.open(waUrl, '_blank');
                if (!win) {
                    window.location.href = waUrl;
                }
            }
        });
    };

    return (
        <>
            <Head title="Order Invoices & WhatsApp Invoice Dispatch" />

            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md mb-2">
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            Dynamic Order Invoices & WhatsApp Integration
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Order Invoices</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            অর্ডার প্যানেলের সকল অর্ডারের উপর ভিত্তি করে স্বয়ংক্রিয় ইনভয়েস এবং ১-ক্লিকে কাস্টমারের হোয়াটসঅ্যাপে ইনভয়েস পাঠান।
                        </p>
                    </div>

                    <div className="flex items-center gap-2 z-10">
                        <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl font-mono font-bold text-xs">
                            🟢 WhatsApp Direct Sharing Active
                        </span>
                    </div>
                </div>

                {/* Stat Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Total Invoices Generated
                            </span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
                                {totalInvoicesCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Paid Billing Revenue
                            </span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
                                ৳{Number(totalPaidRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Pending Payment Invoices
                            </span>
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block font-mono">
                                {pendingInvoicesCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" /> All Order Invoices List
                    </h2>

                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by invoice #, order #, customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                        />
                    </div>
                </div>

                {/* Invoices List Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Invoice # & Order Ref</th>
                                    <th className="px-6 py-4">Customer Info</th>
                                    <th className="px-6 py-4">Issue Date</th>
                                    <th className="px-6 py-4 text-right">Invoice Amount</th>
                                    <th className="px-6 py-4 text-center">Payment Status</th>
                                    <th className="px-6 py-4 text-center">Order Status</th>
                                    <th className="px-6 py-4 text-center w-48">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-mono font-black text-slate-900 dark:text-white text-sm">
                                                {inv.invoice_number}
                                            </div>
                                            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                                                Ref: #{inv.order_number}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                {inv.customer_name}
                                            </div>
                                            {inv.customer_phone && (
                                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {inv.customer_phone}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-slate-400" /> {inv.created_at}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right font-mono font-black text-slate-900 dark:text-white text-sm">
                                            ৳{Number(inv.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${getPaymentBadge(inv.payment_status)}`}>
                                                {inv.payment_status}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border capitalize ${getStatusBadge(inv.status)}`}>
                                                {inv.status}
                                            </span>
                                        </td>

                                        {/* Action Column with Printer & WhatsApp Direct Button */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Web Invoice Preview Button */}
                                                <button 
                                                    type="button"
                                                    onClick={() => setSelectedInvoice(inv)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition cursor-pointer border border-indigo-100 dark:border-indigo-900/50 shadow-2xs" 
                                                    title="Web Invoice Preview & Print PDF"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>

                                                {/* WhatsApp Direct Share Button */}
                                                <button 
                                                    type="button"
                                                    onClick={() => handleSendWhatsAppInvoice(inv)}
                                                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
                                                    title="Send Invoice to Customer's WhatsApp"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                                                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center shadow-inner">
                                                    <FileText className="w-8 h-8 stroke-[1.5]" />
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-base text-slate-700 dark:text-slate-200">
                                                        এখনও কোনো ইনভয়েস তৈরি হয়নি
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                        অর্ডার নিশ্চিত হওয়ার পর স্বয়ংক্রিয়ভাবে ইনভয়েস তৈরি হয়ে এই তালিকায় যুক্ত হবে।
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Web Invoice Preview Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
                        
                        {/* Invoice Header */}
                        <div className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black">
                                    g
                                </div>
                                <div>
                                    <h2 className="font-black text-xl tracking-tight text-slate-900">
                                        {shop?.name || 'Guruz E-Commerce Store'}
                                    </h2>
                                    <p className="text-xs text-slate-500 font-mono">
                                        Invoice #{selectedInvoice.invoice_number} • (Order Ref: #{selectedInvoice.order_number})
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedInvoice(null)}
                                className="text-slate-400 hover:text-slate-700 p-1"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Customer & Billing Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Details</span>
                                <span className="font-bold text-slate-900 text-sm block mt-0.5">{selectedInvoice.customer_name}</span>
                                <span className="block text-slate-600 font-mono mt-0.5">{selectedInvoice.customer_phone}</span>
                                <span className="block text-slate-500 font-mono">{selectedInvoice.customer_email}</span>
                            </div>

                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Date</span>
                                <span className="font-mono font-bold text-slate-900 text-xs block mt-0.5">
                                    {selectedInvoice.created_at}
                                </span>
                                <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                    Payment: {selectedInvoice.payment_status} ({selectedInvoice.payment_method || 'Cash'})
                                </span>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Address</span>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-medium text-slate-700 flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                                <span>{selectedInvoice.shipping_address || 'Standard Delivery Location'}</span>
                            </div>
                        </div>

                        {/* Invoice Summary */}
                        <div className="border-t border-b py-4 space-y-2 text-xs font-mono">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Subtotal Amount:</span>
                                <span className="font-bold text-slate-900">৳{Number(selectedInvoice.subtotal || selectedInvoice.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>

                            {Number(selectedInvoice.shipping_fee || 0) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Shipping Charge:</span>
                                    <span className="font-bold text-slate-900">+৳{Number(selectedInvoice.shipping_fee).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}

                            {Number(selectedInvoice.discount || 0) > 0 && (
                                <div className="flex justify-between text-rose-600">
                                    <span>Discount Applied:</span>
                                    <span>-৳{Number(selectedInvoice.discount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-base font-black text-slate-900 border-t pt-3">
                                <span>Grand Total Payable:</span>
                                <span className="text-emerald-600">৳{Number(selectedInvoice.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        {/* Action Buttons inside Modal */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <button 
                                onClick={() => handleSendWhatsAppInvoice(selectedInvoice)}
                                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <MessageCircle className="w-4 h-4" /> Send Invoice via WhatsApp
                            </button>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <button 
                                    onClick={() => setSelectedInvoice(null)}
                                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                                >
                                    Close
                                </button>
                                <button 
                                    onClick={() => window.open(`/invoices/${selectedInvoice.order_number}/download`, '_blank')}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer active:scale-95"
                                    title="সুন্দর অফিসিয়াল PDF ইনভয়েস জেনারেট ও প্রিন্ট করুন"
                                >
                                    <Printer className="w-4 h-4" /> Print / Save PDF
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

Invoices.layout = (page: any) => <SellerLayout children={page} />;
