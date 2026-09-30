import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Package, 
    Search, 
    Trash2, 
    Edit2, 
    Plus, 
    Minus, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle, 
    Layers, 
    X,
    Tag,
    Boxes
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Product {
    id: number;
    name: string;
    sku: string | null;
    price: number;
    sale_price: number | null;
    stock_quantity: number;
    primary_image_url: string | null;
    category?: { name: string };
}

interface StockProps {
    products?: Product[] | { data: Product[] };
    totalStockSum?: number;
    inStockCount?: number;
    lowStockCount?: number;
    outOfStockCount?: number;
    filters?: {
        search?: string;
        stock_status?: string;
    };
}

export default function StockIndex({ 
    products = [], 
    totalStockSum = 0, 
    inStockCount = 0, 
    lowStockCount = 0, 
    outOfStockCount = 0,
    filters = {}
}: StockProps) {
    const productList: Product[] = Array.isArray(products) 
        ? products 
        : (products && 'data' in products ? products.data : []);

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.stock_status || 'all');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Form inputs
    const [editName, setEditName] = useState('');
    const [editSku, setEditSku] = useState('');
    const [editStock, setEditStock] = useState<number>(0);
    const [editPrice, setEditPrice] = useState<string>('');
    const [editSalePrice, setEditSalePrice] = useState<string>('');

    const filteredProducts = productList.filter(p => {
        const matchesSearch = 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

        let matchesStatus = true;
        if (statusFilter === 'in') matchesStatus = p.stock_quantity > 10;
        else if (statusFilter === 'low') matchesStatus = p.stock_quantity > 0 && p.stock_quantity <= 10;
        else if (statusFilter === 'out') matchesStatus = p.stock_quantity <= 0;

        return matchesSearch && matchesStatus;
    });

    // Auto-generate SKU
    const handleGenerateSku = () => {
        const randomCode = Math.floor(10000 + Math.random() * 90000);
        setEditSku(`SKU-${randomCode}`);
    };

    // Quick +/- Stock adjustment
    const handleQuickStockAdjust = (product: Product, delta: number) => {
        const newStock = Math.max(0, product.stock_quantity + delta);

        router.put(`/seller/stock/${product.id}`, {
            stock_quantity: newStock
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Stock updated to ${newStock}!`,
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (p: Product) => {
        setEditingProduct(p);
        setEditName(p.name);
        setEditSku(p.sku || `SKU-${Math.floor(10000 + Math.random() * 90000)}`);
        setEditStock(p.stock_quantity);
        setEditPrice(String(p.price || ''));
        setEditSalePrice(String(p.sale_price || ''));
    };

    // Submit Edit Stock
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        router.put(`/seller/stock/${editingProduct.id}`, {
            stock_quantity: editStock,
            sku: editSku,
            price: parseFloat(editPrice) || 0,
            sale_price: editSalePrice ? parseFloat(editSalePrice) : null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingProduct(null);
                Swal.fire({
                    title: 'Stock Updated! 🎉',
                    text: `Inventory details for ${editName} saved.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Delete Product
    const handleDeleteProduct = (p: Product) => {
        Swal.fire({
            title: 'Remove Product from Stock?',
            text: `Are you sure you want to delete "${p.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/stock/${p.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Product removed from stock list.',
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
            <Head title="Stock Management — Inventory Control" />

            <div className="max-w-7xl mx-auto space-y-6 pb-20">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                            <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                            Live Stock Control & SKU Management
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Stock Management</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            আপনার শপের সমস্ত প্রোডাক্টের স্টক পরিমাণ এবং SKU রিয়েল-টাইমে নিয়ন্ত্রণ ও পরিচালনা করুন।
                        </p>
                    </div>
                </div>

                {/* Stat Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                    {/* Total Stock */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between hover:shadow-md transition">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Total Stock Units
                            </span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                                {totalStockSum}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-2xs">
                            <Layers className="w-6 h-6" />
                        </div>
                    </div>

                    {/* In Stock */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between hover:shadow-md transition">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                In Stock Items
                            </span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                                {inStockCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-2xs">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Low Stock */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between hover:shadow-md transition">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Low Stock (&le; 10)
                            </span>
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                                {lowStockCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-2xs">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Out of Stock */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between hover:shadow-md transition">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Out of Stock (0)
                            </span>
                            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                                {outOfStockCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs">
                            <XCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter & Controls Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select 
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Items</option>
                            <option value="in">In Stock (&gt; 10)</option>
                            <option value="low">Low Stock (&le; 10)</option>
                            <option value="out">Out of Stock (0)</option>
                        </select>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input 
                            type="text"
                            placeholder="Search by product name or SKU..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                    </div>
                </div>

                {/* Stock Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 w-16">SL</th>
                                    <th className="px-6 py-4">Product Name</th>
                                    <th className="px-6 py-4 w-40">SKU</th>
                                    <th className="px-6 py-4 w-32">Price (৳)</th>
                                    <th className="px-6 py-4 text-center w-48">Current Stock</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 w-28 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {filteredProducts.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/50 transition">
                                        <td className="px-6 py-4 text-slate-500 font-mono">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 font-bold text-indigo-600 dark:text-indigo-400 text-xs overflow-hidden shadow-2xs">
                                                    {product.primary_image_url ? (
                                                        <img src={product.primary_image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        product.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-900 dark:text-white text-sm block">
                                                        {product.name}
                                                    </span>
                                                    {product.category?.name && (
                                                        <span className="text-[10px] text-slate-400 font-medium block">
                                                            {product.category.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.sku ? (
                                                <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 font-mono font-bold text-indigo-700 dark:text-indigo-300 text-xs inline-block">
                                                    {product.sku}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">No SKU</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                                            ৳{Number(product.sale_price || product.price).toLocaleString()}
                                        </td>

                                        {/* Quick Adjustment Controls */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleQuickStockAdjust(product, -1)}
                                                    className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 hover:bg-rose-50 text-slate-600 dark:text-slate-300 hover:text-rose-600 flex items-center justify-center transition border border-slate-200 dark:border-slate-800 cursor-pointer shadow-2xs"
                                                    title="Decrease Stock by 1"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="font-mono font-black text-sm px-2 text-slate-900 dark:text-white min-w-[32px] text-center">
                                                    {product.stock_quantity}
                                                </span>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleQuickStockAdjust(product, 1)}
                                                    className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center justify-center transition border border-slate-200 dark:border-slate-800 cursor-pointer shadow-2xs"
                                                    title="Increase Stock by 1"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Stock Level Badge */}
                                        <td className="px-6 py-4 text-center">
                                            {product.stock_quantity > 10 ? (
                                                <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 whitespace-nowrap shadow-2xs">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> In Stock
                                                </span>
                                            ) : product.stock_quantity > 0 ? (
                                                <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800 whitespace-nowrap shadow-2xs">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Low Stock ({product.stock_quantity})
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800 whitespace-nowrap shadow-2xs">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Out of Stock
                                                </span>
                                            )}
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleOpenEdit(product)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition cursor-pointer"
                                                    title="Edit Stock & Details"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteProduct(product)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition cursor-pointer"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No stock items found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Edit Stock Modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-500" /> Edit Product Stock & SKU
                            </h3>
                            <button 
                                onClick={() => setEditingProduct(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Product Name
                                </label>
                                <input 
                                    type="text"
                                    value={editName}
                                    disabled
                                    className="w-full text-xs sm:text-sm bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-600 dark:text-slate-400 font-medium cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                    <span>Product SKU Code *</span>
                                    <button 
                                        type="button" 
                                        onClick={handleGenerateSku}
                                        className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                                    >
                                        Auto Generate
                                    </button>
                                </label>
                                <input 
                                    type="text"
                                    value={editSku}
                                    onChange={e => setEditSku(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Current Stock Quantity *
                                </label>
                                <input 
                                    type="number"
                                    min="0"
                                    value={editStock}
                                    onChange={e => setEditStock(parseInt(e.target.value) || 0)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-black text-lg text-indigo-600"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Regular Price (৳)
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={editPrice}
                                        onChange={e => setEditPrice(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Offer Price (৳)
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={editSalePrice}
                                        onChange={e => setEditSalePrice(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setEditingProduct(null)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                                >
                                    Save Stock Details
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

StockIndex.layout = (page: any) => <SellerLayout children={page} />;
