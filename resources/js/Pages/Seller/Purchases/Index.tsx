import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    ShoppingBag, 
    Plus, 
    Search, 
    Trash2, 
    Edit2, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Calendar, 
    DollarSign, 
    Building2, 
    FileText, 
    X,
    Filter,
    ArrowUpRight,
    RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Purchase {
    id: number;
    po_number: string;
    supplier_name: string;
    purchase_date: string;
    total_amount: number;
    status: string;
}

interface PurchasesProps {
    purchases?: Purchase[];
    suppliers?: string[];
    filters?: {
        search?: string;
        supplier?: string;
        status?: string;
    };
}

export default function PurchasesIndex({ 
    purchases = [], 
    suppliers = [], 
    filters = {} 
}: PurchasesProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSupplier, setSelectedSupplier] = useState(filters.supplier || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'All');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

    // Form inputs
    const [supplierName, setSupplierName] = useState('');
    const [poNumber, setPoNumber] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('Pending');

    const filteredPurchases = purchases.filter(p => {
        const matchesSearch = 
            p.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSupplier = selectedSupplier ? p.supplier_name === selectedSupplier : true;
        const matchesStatus = (selectedStatus && selectedStatus !== 'All') ? p.status === selectedStatus : true;

        return matchesSearch && matchesSupplier && matchesStatus;
    });

    // Metrics
    const totalCount = purchases.length;
    const totalAmountSum = purchases.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
    
    const receivedPurchases = purchases.filter(p => p.status === 'Received');
    const receivedAmountSum = receivedPurchases.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);

    const pendingPurchases = purchases.filter(p => p.status === 'Pending');
    const pendingAmountSum = pendingPurchases.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);

    // Auto-generate PO Number
    const handleGeneratePo = () => {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setPoNumber(`PO-${dateStr}-${randomNum}`);
    };

    // Open Add Modal
    const handleOpenAddModal = () => {
        setSupplierName('');
        handleGeneratePo();
        setTotalAmount('');
        setPurchaseDate(new Date().toISOString().split('T')[0]);
        setStatus('Pending');
        setIsAddModalOpen(true);
    };

    // Submit Add Purchase
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierName.trim() || !poNumber.trim() || !totalAmount) return;

        router.post('/seller/purchase', {
            supplier_name: supplierName,
            po_number: poNumber,
            total_amount: parseFloat(totalAmount),
            purchase_date: purchaseDate,
            status: status,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                Swal.fire({
                    title: 'Purchase Order Created! 🎉',
                    text: `PO Number ${poNumber} for ${supplierName} recorded successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Open Edit Modal
    const handleOpenEditModal = (p: Purchase) => {
        setEditingPurchase(p);
        setSupplierName(p.supplier_name);
        setPoNumber(p.po_number);
        setTotalAmount(String(p.total_amount));
        setPurchaseDate(p.purchase_date.slice(0, 10));
        setStatus(p.status);
    };

    // Submit Edit Purchase
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPurchase) return;

        router.put(`/seller/purchase/${editingPurchase.id}`, {
            supplier_name: supplierName,
            po_number: poNumber,
            total_amount: parseFloat(totalAmount),
            purchase_date: purchaseDate,
            status: status,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingPurchase(null);
                Swal.fire({
                    title: 'Purchase Order Updated!',
                    text: `PO Number ${poNumber} updated successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Direct Status Change
    const handleStatusChange = (id: number, newStatus: string) => {
        router.put(`/seller/purchase/${id}`, {
            status: newStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Purchase status updated to ${newStatus}!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            }
        });
    };

    // Delete Purchase
    const handleDeletePurchase = (p: Purchase) => {
        Swal.fire({
            title: 'Delete Purchase Order?',
            text: `Are you sure you want to delete PO ${p.po_number} (${p.supplier_name})?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete Order',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/purchase/${p.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Purchase record deleted.',
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
            <Head title="Purchase List — Inventory Invoices & Suppliers" />

            <div className="max-w-7xl mx-auto space-y-6 pb-20">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                            Inventory & Wholesale Purchases
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Purchase Management</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            সাপ্লায়ারদের কাছ থেকে ক্রয়কৃত প্রোডাক্ট ইনভয়েস ও ক্রয়ের হিসাব পরিচালনা করুন।
                        </p>
                    </div>

                    <button 
                        onClick={handleOpenAddModal}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" /> + Add Purchase Order
                    </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Total Purchases Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                Total Purchases ({totalCount})
                            </span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                                ৳{totalAmountSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Received Purchases Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                Received Invoices ({receivedPurchases.length})
                            </span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                                ৳{receivedAmountSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Pending Purchases Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                Pending Orders ({pendingPurchases.length})
                            </span>
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                                ৳{pendingAmountSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                        {/* Supplier Filter */}
                        <select 
                            value={selectedSupplier}
                            onChange={e => setSelectedSupplier(e.target.value)}
                            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map((sup, idx) => (
                                <option key={idx} value={sup}>{sup}</option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select 
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e.target.value)}
                            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Received">Received</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input 
                            type="text"
                            placeholder="Search by PO number or supplier..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                    </div>
                </div>

                {/* Purchase List Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 w-16">SL</th>
                                    <th className="px-6 py-4">PO Number</th>
                                    <th className="px-6 py-4">Supplier Name</th>
                                    <th className="px-6 py-4">Purchase Date</th>
                                    <th className="px-6 py-4 text-right">Total Amount</th>
                                    <th className="px-6 py-4 w-36 text-center">Status</th>
                                    <th className="px-6 py-4 w-32 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {filteredPurchases.map((purchase, index) => (
                                    <tr key={purchase.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                                        <td className="px-6 py-4 text-slate-500 font-mono">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                                            {purchase.po_number}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {purchase.supplier_name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">
                                            {purchase.purchase_date.slice(0, 10)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                                            ৳{Number(purchase.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        
                                        {/* Status Dropdown */}
                                        <td className="px-6 py-4 text-center">
                                            <select 
                                                value={purchase.status}
                                                onChange={(e) => handleStatusChange(purchase.id, e.target.value)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none ${
                                                    purchase.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400' :
                                                    purchase.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-400' :
                                                    'bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-400'
                                                }`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Received">Received</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleOpenEditModal(purchase)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition cursor-pointer"
                                                    title="Edit Purchase Order"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeletePurchase(purchase)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition cursor-pointer"
                                                    title="Delete Purchase Order"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredPurchases.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No purchases found. Click "+ Add Purchase Order" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Add Purchase Order Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-500" /> Add New Purchase Order
                            </h3>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Supplier Name *
                                </label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Beximco Cables Ltd or Spark Wholesale"
                                    value={supplierName}
                                    onChange={e => setSupplierName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>PO Number *</span>
                                        <button 
                                            type="button" 
                                            onClick={handleGeneratePo} 
                                            className="text-[10px] text-indigo-600 font-bold hover:underline"
                                        >
                                            Auto Generate
                                        </button>
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="PO-20260815"
                                        value={poNumber}
                                        onChange={e => setPoNumber(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Total Amount (৳) *
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={totalAmount}
                                        onChange={e => setTotalAmount(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Purchase Date *
                                    </label>
                                    <input 
                                        type="date"
                                        value={purchaseDate}
                                        onChange={e => setPurchaseDate(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Order Status *
                                    </label>
                                    <select 
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Received">Received</option>
                                        <option value="Cancelled">Cancelled</option>
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
                                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition cursor-pointer"
                                >
                                    Save Purchase Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Purchase Modal */}
            {editingPurchase && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-500" /> Edit Purchase Order
                            </h3>
                            <button 
                                onClick={() => setEditingPurchase(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Supplier Name *
                                </label>
                                <input 
                                    type="text"
                                    value={supplierName}
                                    onChange={e => setSupplierName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        PO Number *
                                    </label>
                                    <input 
                                        type="text"
                                        value={poNumber}
                                        onChange={e => setPoNumber(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Total Amount (৳) *
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={totalAmount}
                                        onChange={e => setTotalAmount(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Purchase Date *
                                    </label>
                                    <input 
                                        type="date"
                                        value={purchaseDate}
                                        onChange={e => setPurchaseDate(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Order Status *
                                    </label>
                                    <select 
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Received">Received</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setEditingPurchase(null)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                                >
                                    Update Purchase Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

PurchasesIndex.layout = (page: any) => <SellerLayout children={page} />;
