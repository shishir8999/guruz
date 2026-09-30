import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    TrendingUp, 
    Plus, 
    Search, 
    Trash2, 
    Edit2, 
    Printer, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    DollarSign, 
    UserCheck, 
    MapPin, 
    X,
    ShoppingCart,
    Phone,
    FileText
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Sale {
    id: number;
    created_at: string;
    customer_name: string;
    customer_phone?: string;
    order_number: string;
    invoice_no?: string;
    shipping_address?: string;
    payment_status: string;
    payment_method: string;
    status: string;
    subtotal?: number;
    shipping_fee?: number;
    discount?: number;
    total: number;
}

interface SalesIndexProps {
    recentSales?: Sale[];
    totalSales?: number;
    totalRevenue?: number;
    customers?: string[];
    filters?: {
        search?: string;
        customer?: string;
        status?: string;
        payment_status?: string;
    };
}

export default function SalesIndex({ 
    recentSales = [], 
    totalSales = 0, 
    totalRevenue = 0,
    customers = [],
    filters = {}
}: SalesIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCustomer, setSelectedCustomer] = useState(filters.customer || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'All');
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(filters.payment_status || 'All');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewInvoiceSale, setViewInvoiceSale] = useState<Sale | null>(null);
    const [editingSale, setEditingSale] = useState<Sale | null>(null);

    // New Sale Form
    const [custName, setCustName] = useState('');
    const [custPhone, setCustPhone] = useState('');
    const [custAddr, setCustAddr] = useState('');
    const [subtotal, setSubtotal] = useState('');
    const [discount, setDiscount] = useState('0');
    const [payMethod, setPayMethod] = useState('Cash');
    const [payStatus, setPayStatus] = useState('Paid');
    const [orderStatus, setOrderStatus] = useState('delivered');

    const filteredSales = recentSales.filter(s => {
        const invNo = s.order_number || s.invoice_no || `INV-${s.id}`;
        const name = s.customer_name || '';
        const phone = s.customer_phone || '';

        const matchesSearch = 
            invNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            phone.includes(searchTerm);

        const matchesCust = selectedCustomer ? name === selectedCustomer : true;
        const matchesStat = (selectedStatus && selectedStatus !== 'All') ? s.status === selectedStatus : true;
        const matchesPayStat = (selectedPaymentStatus && selectedPaymentStatus !== 'All') ? s.payment_status === selectedPaymentStatus : true;

        return matchesSearch && matchesCust && matchesStat && matchesPayStat;
    });

    const isPaid = (status?: string) => {
        const st = (status || '').toLowerCase();
        return st.includes('paid') || st === 'completed';
    };

    const isPending = (status?: string, payStat?: string) => {
        const st = (status || '').toLowerCase();
        const pst = (payStat || '').toLowerCase();
        return st === 'pending' || st === 'processing' || pst.includes('pending') || pst.includes('unpaid');
    };

    const paidSales = recentSales.filter(s => isPaid(s.payment_status) || s.status === 'delivered');
    const pendingSales = recentSales.filter(s => isPending(s.status, s.payment_status));

    // Submit Add Sale
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const sub = parseFloat(subtotal) || 0;
        const disc = parseFloat(discount) || 0;
        const grandTotal = Math.max(0, sub - disc);

        router.post('/seller/sales', {
            customer_name: custName,
            customer_phone: custPhone,
            shipping_address: custAddr,
            subtotal: sub,
            discount: disc,
            total: grandTotal,
            payment_method: payMethod,
            payment_status: payStatus,
            status: orderStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                setCustName('');
                setCustPhone('');
                setCustAddr('');
                setSubtotal('');
                setDiscount('0');
                Swal.fire({
                    title: 'Sale Created! 🎉',
                    text: 'New sale order recorded successfully.',
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Quick Status Update
    const handleStatusUpdate = (id: number, field: 'status' | 'payment_status', val: string) => {
        router.put(`/seller/sales/${id}`, {
            [field]: val
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Sale ${field.replace('_', ' ')} updated to ${val}!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            }
        });
    };

    // Delete Sale
    const handleDeleteSale = (sale: Sale) => {
        const invNo = sale.order_number || sale.invoice_no || `INV-${sale.id}`;
        Swal.fire({
            title: 'Delete Sale Record?',
            text: `Are you sure you want to delete sale ${invNo}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/sales/${sale.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Sale record deleted successfully.',
                            icon: 'success',
                            confirmButtonColor: '#4f46e5',
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Sale List — Sales Management & Invoices" />

            <div className="max-w-7xl mx-auto space-y-6 pb-20">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                            Sales & Revenue Analytics
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Sale List</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            কাস্টমারদের সমস্ত বিক্রয় ইনভয়েস ও সেলস অর্ডার ট্র্যাকিং করুন।
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> + Manual Sale
                        </button>
                        <Link 
                            href="/seller/pos"
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <ShoppingCart className="w-4 h-4" /> + Add Sale (POS)
                        </Link>
                    </div>
                </div>

                {/* Stat Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                Total Sales Revenue ({totalSales})
                            </span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                                ৳{Number(totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                Paid Orders ({paidSales.length})
                            </span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                                ৳{paidSales.reduce((s, x) => s + Number(x.total || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                In-Transit / Pending ({pendingSales.length})
                            </span>
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                                ৳{pendingSales.reduce((s, x) => s + Number(x.total || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter & Controls Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Customer Filter */}
                        <select 
                            value={selectedCustomer}
                            onChange={e => setSelectedCustomer(e.target.value)}
                            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Customers</option>
                            {customers.map((c, idx) => (
                                <option key={idx} value={c}>{c}</option>
                            ))}
                        </select>

                        {/* Order Status Filter */}
                        <select 
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e.target.value)}
                            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="All">All Order Statuses</option>
                            <option value="delivered">Delivered</option>
                            <option value="processing">Processing</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Payment Status Filter */}
                        <select 
                            value={selectedPaymentStatus}
                            onChange={e => setSelectedPaymentStatus(e.target.value)}
                            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="All">All Payment Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input 
                            type="text"
                            placeholder="Search invoice, customer, phone..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                    </div>
                </div>

                {/* Sales Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 w-16">SL</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Customer Details</th>
                                    <th className="px-6 py-4">Invoice No.</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4 w-32">Status</th>
                                    <th className="px-6 py-4 text-right">Grand Total</th>
                                    <th className="px-6 py-4 w-28 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {filteredSales.map((sale, index) => {
                                    const invNo = sale.order_number || sale.invoice_no || `INV-${sale.id}`;
                                    return (
                                        <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                                            <td className="px-6 py-4 text-slate-500 font-mono">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">
                                                {new Date(sale.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {sale.customer_name || 'Walk-in Customer'}
                                                </div>
                                                {sale.customer_phone && (
                                                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                                        <Phone className="w-3 h-3" /> {sale.customer_phone}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                {invNo}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[140px] truncate">
                                                {sale.shipping_address || 'In-store'}
                                            </td>

                                            {/* Payment Badge */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                                    sale.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400'
                                                }`}>
                                                    {sale.payment_status} ({sale.payment_method || 'Cash'})
                                                </span>
                                            </td>

                                            {/* Order Status Select */}
                                            <td className="px-6 py-4">
                                                <select 
                                                    value={sale.status}
                                                    onChange={(e) => handleStatusUpdate(sale.id, 'status', e.target.value)}
                                                    className={`text-xs font-bold px-3 py-1 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none ${
                                                        sale.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' :
                                                        sale.status === 'cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400' :
                                                        'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                                                    }`}
                                                >
                                                    <option value="delivered">Delivered</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>

                                            {/* Total */}
                                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                                                ৳{Number(sale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button 
                                                        type="button"
                                                        onClick={() => setViewInvoiceSale(sale)}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition cursor-pointer"
                                                        title="Print Invoice"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDeleteSale(sale)}
                                                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition cursor-pointer"
                                                        title="Delete Sale"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredSales.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No sales found. Click "+ Add Sale (POS)" or "+ Manual Sale" to add a transaction.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Manual Add Sale Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-500" /> Create Manual Sale Order
                            </h3>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Customer Name *
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Rahim Uddin"
                                        value={custName}
                                        onChange={e => setCustName(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Customer Phone *
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="017xxxxxxxx"
                                        value={custPhone}
                                        onChange={e => setCustPhone(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Delivery / Shipping Address
                                </label>
                                <input 
                                    type="text"
                                    placeholder="e.g. House 12, Road 4, Mirpur-10, Dhaka"
                                    value={custAddr}
                                    onChange={e => setCustAddr(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Subtotal Amount (৳) *
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={subtotal}
                                        onChange={e => setSubtotal(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Discount (৳)
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={discount}
                                        onChange={e => setDiscount(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Payment Method
                                    </label>
                                    <select 
                                        value={payMethod}
                                        onChange={e => setPayMethod(e.target.value)}
                                        className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-3 text-slate-900 dark:text-white font-bold"
                                    >
                                        <option value="Cash">Cash</option>
                                        <option value="bKash">bKash</option>
                                        <option value="Nagad">Nagad</option>
                                        <option value="Card">Card</option>
                                        <option value="COD">Cash on Delivery</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Payment Status
                                    </label>
                                    <select 
                                        value={payStatus}
                                        onChange={e => setPayStatus(e.target.value)}
                                        className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-3 text-slate-900 dark:text-white font-bold"
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Unpaid">Unpaid</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Order Status
                                    </label>
                                    <select 
                                        value={orderStatus}
                                        onChange={e => setOrderStatus(e.target.value)}
                                        className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-3 text-slate-900 dark:text-white font-bold"
                                    >
                                        <option value="delivered">Delivered</option>
                                        <option value="processing">Processing</option>
                                        <option value="pending">Pending</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                                >
                                    Save Sale Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Printable Invoice Modal */}
            {viewInvoiceSale && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150 border border-slate-200">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div>
                                <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" /> Sales Invoice
                                </h3>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                    {viewInvoiceSale.order_number || viewInvoiceSale.invoice_no || `INV-${viewInvoiceSale.id}`}
                                </p>
                            </div>
                            <button 
                                onClick={() => setViewInvoiceSale(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs font-medium">
                            <div className="flex justify-between border-b pb-3">
                                <div>
                                    <span className="text-slate-400 block font-bold uppercase">Customer</span>
                                    <span className="font-bold text-slate-900 text-sm">{viewInvoiceSale.customer_name || 'Walk-in Customer'}</span>
                                    <span className="block text-slate-500 font-mono">{viewInvoiceSale.customer_phone}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-400 block font-bold uppercase">Date</span>
                                    <span className="font-mono font-bold text-slate-900">{new Date(viewInvoiceSale.created_at).toLocaleDateString()}</span>
                                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                        {viewInvoiceSale.payment_status} ({viewInvoiceSale.payment_method || 'Cash'})
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-slate-400 block font-bold uppercase mb-1">Shipping Address</span>
                                <span className="text-slate-700 bg-slate-50 p-2.5 rounded-xl block border border-slate-100">
                                    {viewInvoiceSale.shipping_address || 'In-store POS Sale'}
                                </span>
                            </div>

                            <div className="border-t border-b py-3 space-y-2 font-mono">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Subtotal:</span>
                                    <span className="font-bold">৳{Number(viewInvoiceSale.subtotal || viewInvoiceSale.total).toLocaleString()}</span>
                                </div>
                                {Number(viewInvoiceSale.discount || 0) > 0 && (
                                    <div className="flex justify-between text-rose-600">
                                        <span>Discount:</span>
                                        <span>-৳{Number(viewInvoiceSale.discount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-black text-slate-900 border-t pt-2">
                                    <span>Grand Total:</span>
                                    <span className="text-indigo-600">৳{Number(viewInvoiceSale.total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button 
                                onClick={() => setViewInvoiceSale(null)}
                                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => window.print()}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" /> Print Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

SalesIndex.layout = (page: any) => <SellerLayout children={page} />;
