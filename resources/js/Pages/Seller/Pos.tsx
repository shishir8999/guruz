import React, { useState, useMemo, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { 
    Search, Plus, Trash2, ShoppingCart, User, Printer, 
    CheckCircle2, AlertCircle, X, Store, CreditCard, DollarSign,
    RefreshCw, Filter
} from 'lucide-react';
import SellerLayout from '@/Layouts/SellerLayout';
import Swal from 'sweetalert2';

interface Product {
    id: number;
    name: string;
    sku?: string;
    price: number;
    sale_price?: number;
    stock_quantity?: number;
    primary_image_url?: string;
    image_url?: string;
    category?: { id: number; name: string; slug: string };
    brand?: { id: number; name: string; slug: string };
}

interface CartItem {
    id: number;
    name: string;
    sku?: string;
    price: number;
    qty: number;
    discountPercent: number;
    vatPercent: number;
    image?: string;
    maxStock: number;
}

export default function Pos({
    shop,
    products = [],
    categories = [],
    brands = [],
    customers = []
}: any) {
    const { flash }: any = usePage().props;

    // Filters & Search
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedBrand, setSelectedBrand] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cashDiscount, setCashDiscount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>('cash');
    const [paidAmountInput, setPaidAmountInput] = useState<string>('');

    // Customer Selection & Quick Create Modal
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walkin');
    const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
    const [isAddingCustomer, setIsAddingCustomer] = useState(false);

    // Receipt Modal state
    const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    // Listen for flash receipt
    useEffect(() => {
        if (flash?.posReceipt) {
            setReceiptData(flash.posReceipt);
            setShowReceiptModal(true);
            setCart([]);
            setCashDiscount(0);
            setPaidAmountInput('');
        }
    }, [flash]);

    // Filtered Product Catalog
    const filteredProducts = useMemo(() => {
        return products.filter((p: Product) => {
            // Category Filter
            if (selectedCategory !== 'All') {
                if (p.category?.name !== selectedCategory && String(p.category?.id) !== selectedCategory) {
                    return false;
                }
            }
            // Brand Filter
            if (selectedBrand !== 'All') {
                if (p.brand?.name !== selectedBrand && String(p.brand?.id) !== selectedBrand) {
                    return false;
                }
            }
            // Search Query
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const matchName = p.name?.toLowerCase().includes(q);
                const matchSku = p.sku?.toLowerCase().includes(q);
                if (!matchName && !matchSku) return false;
            }
            return true;
        });
    }, [products, selectedCategory, selectedBrand, searchQuery]);

    // Add product to cart
    const addToCart = (product: Product) => {
        const stock = product.stock_quantity ?? 999;
        if (stock <= 0) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'এই প্রোডাক্টটির স্টক খালি!',
                showConfirmButton: false,
                timer: 2000
            });
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.qty >= stock) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'warning',
                        title: `স্টক লিমিট (${stock} টি) অতিক্রম করা যাবে না!`,
                        showConfirmButton: false,
                        timer: 2000
                    });
                    return prev;
                }
                return prev.map(item =>
                    item.id === product.id ? { ...item, qty: item.qty + 1 } : item
                );
            } else {
                const unitPrice = Number(product.sale_price ?? product.price ?? 0);
                return [
                    ...prev,
                    {
                        id: product.id,
                        name: product.name,
                        sku: product.sku || 'N/A',
                        price: unitPrice,
                        qty: 1,
                        discountPercent: 0,
                        vatPercent: 0,
                        image: product.primary_image_url || product.image_url,
                        maxStock: stock,
                    }
                ];
            }
        });
    };

    // Update Item Quantity
    const updateQty = (id: number, delta: number) => {
        setCart(prev =>
            prev.map(item => {
                if (item.id === id) {
                    const newQty = item.qty + delta;
                    if (newQty <= 0) return item;
                    if (newQty > item.maxStock) {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'warning',
                            title: `স্টক সীমা (${item.maxStock}) অতিক্রম করবে!`,
                            showConfirmButton: false,
                            timer: 2000
                        });
                        return item;
                    }
                    return { ...item, qty: newQty };
                }
                return item;
            })
        );
    };

    // Update Item Price directly
    const updateItemPrice = (id: number, val: string) => {
        const p = parseFloat(val) || 0;
        setCart(prev => prev.map(item => item.id === id ? { ...item, price: p } : item));
    };

    // Update Item Discount %
    const updateItemDiscount = (id: number, val: string) => {
        const d = parseFloat(val) || 0;
        setCart(prev => prev.map(item => item.id === id ? { ...item, discountPercent: d } : item));
    };

    // Update Item VAT %
    const updateItemVat = (id: number, val: string) => {
        const v = parseFloat(val) || 0;
        setCart(prev => prev.map(item => item.id === id ? { ...item, vatPercent: v } : item));
    };

    // Remove Item from Cart
    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    // Clear entire cart
    const clearCart = () => {
        setCart([]);
        setCashDiscount(0);
        setPaidAmountInput('');
    };

    // Cart Financial Computations
    const { totalItemsCount, cartSubtotal, totalVat, totalDiscount, grandTotal } = useMemo(() => {
        let itemsCount = 0;
        let sub = 0;
        let vatSum = 0;
        let discSum = 0;

        cart.forEach(item => {
            itemsCount += item.qty;
            const itemBase = item.price * item.qty;
            const itemDisc = (itemBase * (item.discountPercent || 0)) / 100;
            const itemVat = ((itemBase - itemDisc) * (item.vatPercent || 0)) / 100;
            
            sub += itemBase;
            discSum += itemDisc;
            vatSum += itemVat;
        });

        const finalGrand = Math.max(0, sub + vatSum - discSum - (cashDiscount || 0));

        return {
            totalItemsCount: itemsCount,
            cartSubtotal: sub,
            totalVat: vatSum,
            totalDiscount: discSum,
            grandTotal: finalGrand,
        };
    }, [cart, cashDiscount]);

    const paidAmount = Number(paidAmountInput) || 0;
    const dueOrChange = paidAmount - grandTotal;

    // Handle Quick Add Customer Submit
    const handleAddCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCustomer.name) return;

        setIsAddingCustomer(true);
        router.post('/seller/pos/customer', newCustomer, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                setIsAddingCustomer(false);
                setShowAddCustomerModal(false);
                setNewCustomer({ name: '', phone: '', email: '' });
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'নতুন কাস্টমার সফলভাবে যুক্ত হয়েছে!',
                    showConfirmButton: false,
                    timer: 2000
                });
            },
            onError: () => {
                setIsAddingCustomer(false);
            }
        });
    };

    // Handle Sale Checkout Submission
    const handleCompleteSale = () => {
        if (cart.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'কার্ট খালি!',
                text: 'বিক্রি সম্পন্ন করার আগে অন্তত একটি পণ্য বেছে নিন।',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#10b981',
                customClass: { popup: 'rounded-3xl p-6 max-w-sm' }
            });
            return;
        }

        const selectedCustObj = customers.find((c: any) => String(c.id) === selectedCustomerId);
        const custName = selectedCustomerId === 'walkin' ? 'Walk-in Customer' : (selectedCustObj?.name || 'Customer');
        const custPhone = selectedCustomerId === 'walkin' ? 'N/A' : (selectedCustObj?.phone || 'N/A');

        const payload = {
            customer_name: custName,
            customer_phone: custPhone,
            cash_discount: cashDiscount,
            paid_amount: paidAmount > 0 ? paidAmount : grandTotal,
            payment_method: paymentMethod,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                qty: item.qty,
                price: item.price,
            }))
        };

        router.post('/seller/pos', payload, {
            preserveScroll: true,
            onError: (errs) => {
                const msg = Object.values(errs)[0] || 'বিক্রি সম্পন্ন করতে ব্যর্থ হয়েছে।';
                Swal.fire({
                    icon: 'error',
                    title: 'বিক্রি সম্পন্ন করা সম্ভব হয়নি!',
                    text: String(msg),
                    confirmButtonText: 'ঠিক আছে',
                    confirmButtonColor: '#ef4444',
                    customClass: { popup: 'rounded-3xl p-6 max-w-sm' }
                });
            }
        });
    };

    // Print Receipt Helper
    const handlePrintReceipt = () => {
        window.print();
    };

    return (
        <>
            <Head title="POS Terminal Counter Sale" />

            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-100px)] min-h-[650px] -m-2">
                
                {/* ─── LEFT PANEL: PRODUCT CATALOG & FILTERS ─── */}
                <div className="lg:w-7/12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col shadow-sm overflow-hidden">
                    
                    {/* Top Filters Header */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                <Filter className="w-3.5 h-3.5 text-emerald-500" /> Select Category
                            </label>
                            <select 
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                            >
                                <option value="All">All Categories ({categories.length})</option>
                                {categories.map((c: any) => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                                <Store className="w-3.5 h-3.5 text-purple-500" /> Select Brand
                            </label>
                            <select 
                                value={selectedBrand}
                                onChange={e => setSelectedBrand(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                            >
                                <option value="All">All Brands ({brands.length})</option>
                                {brands.map((b: any) => (
                                    <option key={b.id} value={b.name}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Instant Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="প্রোডাক্টের নাম অথবা SKU কোড লিখে খুঁজুন..."
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                        {filteredProducts.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-950/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2 stroke-1" />
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">কোনো প্রোডাক্ট পাওয়া যায়নি</p>
                                <p className="text-xs text-slate-400 mt-1">অন্য ক্যাটাগরি অথবা সার্চ কি-ওয়ার্ড পরিবর্তন করে দেখুন।</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                                {filteredProducts.map((p: Product) => {
                                    const unitPrice = Number(p.sale_price ?? p.price ?? 0);
                                    const stock = p.stock_quantity ?? 999;
                                    const isOutOfStock = stock <= 0;

                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => !isOutOfStock && addToCart(p)}
                                            className={`bg-slate-50 dark:bg-slate-950/80 border rounded-2xl p-2.5 flex flex-col justify-between transition group relative ${
                                                isOutOfStock
                                                    ? 'border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                                                    : 'border-slate-200 dark:border-slate-800/80 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md cursor-pointer active:scale-95'
                                            }`}
                                        >
                                            {/* Product Image */}
                                            <div className="relative w-full h-24 rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-2 flex items-center justify-center">
                                                {p.primary_image_url || p.image_url ? (
                                                    <img src={p.primary_image_url || p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <Store className="w-8 h-8 text-slate-300 dark:text-slate-700 stroke-1" />
                                                )}

                                                {/* Stock Pill Badge */}
                                                <span className={`absolute top-1.5 right-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs ${
                                                    isOutOfStock ? 'bg-red-500 text-white' : (stock < 10 ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white')
                                                }`}>
                                                    {isOutOfStock ? 'Out of Stock' : `Stock: ${stock}`}
                                                </span>
                                            </div>

                                            {/* Product Info */}
                                            <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-emerald-500 transition">
                                                    {p.name}
                                                </h4>
                                                <div className="flex items-center justify-between pt-1">
                                                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[70px]">
                                                        {p.sku || 'SKU-N/A'}
                                                    </span>
                                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                                        ৳{unitPrice.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── RIGHT PANEL: CART & CHECKOUT TERMINAL ─── */}
                <div className="lg:w-5/12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col shadow-sm overflow-hidden">
                    
                    {/* Customer Selection Bar */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                        <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-emerald-500" /> Customer <span className="text-red-500">*</span>
                            </span>
                            <span className="text-[10px] text-slate-400">ওয়াক-ইন কাস্টমার / রেজিস্ট্রার্ড গ্রাহক</span>
                        </label>
                        <div className="flex gap-2">
                            <select 
                                value={selectedCustomerId}
                                onChange={e => setSelectedCustomerId(e.target.value)}
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                            >
                                <option value="walkin">🛍️ Walk-in Customer (ডিফল্ট)</option>
                                {customers.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        👤 {c.name} {c.phone ? `(${c.phone})` : ''}
                                    </option>
                                ))}
                            </select>
                            <button 
                                onClick={() => setShowAddCustomerModal(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white w-9 h-9 rounded-xl flex items-center justify-center transition shadow-xs active:scale-95 cursor-pointer shrink-0"
                                title="নতুন কাস্টমার কুইক যুক্ত করুন"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Cart Items Table */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {cart.length === 0 ? (
                            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6">
                                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3 border border-slate-200 dark:border-slate-800">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">কার্ট সম্পূর্ণ খালি</p>
                                <p className="text-[11px] text-slate-400 mt-1">বাম পাশের ক্যাটালগ থেকে প্রোডাক্ট ক্লিক করে যুক্ত করুন।</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                                    <tr>
                                        <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500">Product</th>
                                        <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">Qty</th>
                                        <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Cost</th>
                                        <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Disc%</th>
                                        <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Subtotal</th>
                                        <th className="p-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                    {cart.map(item => {
                                        const itemBase = item.price * item.qty;
                                        const itemDisc = (itemBase * (item.discountPercent || 0)) / 100;
                                        const itemSubtotal = itemBase - itemDisc;

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition">
                                                <td className="p-2.5 min-w-[120px]">
                                                    <span className="font-bold text-slate-800 dark:text-slate-100 block line-clamp-1">{item.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                                                </td>
                                                <td className="p-2.5 text-center whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                                                        <button 
                                                            onClick={() => updateQty(item.id, -1)}
                                                            className="w-5 h-5 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition"
                                                        >-</button>
                                                        <span className="w-6 text-center font-bold text-xs">{item.qty}</span>
                                                        <button 
                                                            onClick={() => updateQty(item.id, 1)}
                                                            className="w-5 h-5 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded transition"
                                                        >+</button>
                                                    </div>
                                                </td>
                                                <td className="p-2.5 text-right whitespace-nowrap">
                                                    <input 
                                                        type="number" 
                                                        value={item.price}
                                                        onChange={e => updateItemPrice(item.id, e.target.value)}
                                                        className="w-16 p-1 text-right bg-transparent border border-slate-200 dark:border-slate-800 rounded text-xs font-bold text-slate-800 dark:text-slate-200"
                                                    />
                                                </td>
                                                <td className="p-2.5 text-right whitespace-nowrap">
                                                    <input 
                                                        type="number" 
                                                        value={item.discountPercent || ''}
                                                        onChange={e => updateItemDiscount(item.id, e.target.value)}
                                                        placeholder="0"
                                                        className="w-12 p-1 text-right bg-transparent border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold text-slate-800 dark:text-slate-200"
                                                    />
                                                </td>
                                                <td className="p-2.5 text-right font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                                    ৳{itemSubtotal.toLocaleString()}
                                                </td>
                                                <td className="p-2.5 text-center whitespace-nowrap">
                                                    <button 
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-slate-400 hover:text-red-500 transition p-1"
                                                        title="রিমুভ করুন"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Cart Computations & Settlement Footer */}
                    <div className="p-4 bg-slate-50/80 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between items-center text-slate-500">
                                <span>Total Items:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{totalItemsCount}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500">
                                <span>Cart Subtotal:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">৳{cartSubtotal.toLocaleString()}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between items-center text-rose-500 font-semibold">
                                    <span>Item Discounts:</span>
                                    <span>-৳{totalDiscount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-slate-500">
                                <span>Cash Discount (ফিক্সড ছাড়):</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-slate-400">৳</span>
                                    <input 
                                        type="number" 
                                        value={cashDiscount || ''} 
                                        onChange={e => setCashDiscount(parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                        className="w-20 p-1 text-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded font-bold text-xs"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 text-sm">
                                <span className="font-black text-slate-800 dark:text-slate-100">Grand Total:</span>
                                <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                                    ৳{grandTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Payment Method & Paid Amount */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Payment Method</label>
                                <select 
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                                >
                                    <option value="cash">💵 Cash (ক্যাশ)</option>
                                    <option value="bkash">📱 bKash / Nagad</option>
                                    <option value="card">💳 Card / POS Machine</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">Paid Amount (টাকা দিলেন)</label>
                                <input 
                                    type="number" 
                                    value={paidAmountInput}
                                    onChange={e => setPaidAmountInput(e.target.value)}
                                    placeholder={String(grandTotal)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-black text-slate-800 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        {/* Change / Net Summary Bar */}
                        <div className="flex items-center justify-between text-xs bg-slate-200/50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-300/40 dark:border-slate-800">
                            <div>
                                <span className="text-slate-500 font-semibold">ফেরত (Change): </span>
                                <span className={`font-black ${dueOrChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                    ৳{dueOrChange >= 0 ? dueOrChange.toLocaleString() : '0'}
                                </span>
                            </div>
                            {cart.length > 0 && (
                                <button onClick={clearCart} className="text-[10px] text-slate-400 hover:text-rose-500 underline font-bold">
                                    রিয়ালাউট / ক্লিয়ার কার্ট
                                </button>
                            )}
                        </div>

                        {/* Complete Sale Action Button */}
                        <button 
                            onClick={handleCompleteSale}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            বিক্রি সম্পন্ন করুন (SELL & PRINT RECEIPT)
                        </button>
                    </div>

                </div>

            </div>

            {/* ─── MODAL 1: QUICK ADD CUSTOMER ─── */}
            {showAddCustomerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="font-extrabold text-sm flex items-center gap-2">
                                <User className="w-4 h-4 text-emerald-400" /> নতুন কাস্টমার যুক্ত করুন
                            </h3>
                            <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-300 font-bold mb-1">কাস্টমার নাম *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    placeholder="Ex: Rahim Uddin"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 font-bold mb-1">মোবাইল নম্বর</label>
                                <input 
                                    type="text" 
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    placeholder="+8801700000000"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-300 font-bold mb-1">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                                <input 
                                    type="email" 
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    placeholder="customer@example.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowAddCustomerModal(false)}
                                    className="px-4 py-2 bg-slate-800 rounded-xl font-bold text-slate-300 hover:bg-slate-700"
                                >বাতিল</button>
                                <button 
                                    type="submit" 
                                    disabled={isAddingCustomer}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-white shadow-md disabled:opacity-50"
                                >
                                    {isAddingCustomer ? 'সংরক্ষণ হচ্ছে...' : 'সেভ করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── MODAL 2: PRINTABLE POS RECEIPT / INVOICE ─── */}
            {showReceiptModal && receiptData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white text-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 print:p-0 print:shadow-none print:w-full">
                        
                        {/* Printable Area */}
                        <div id="printable-pos-receipt" className="space-y-4 text-center border-b pb-4 border-dashed border-slate-300">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider">{shop?.name || 'SPARK CABLES STORE'}</h2>
                                <p className="text-xs text-slate-500">POS Sales Counter Receipt</p>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{receiptData.date}</p>
                            </div>

                            <div className="text-left text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-600">Order No:</span>
                                    <span className="font-mono font-black text-slate-900">{receiptData.order_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-600">Customer:</span>
                                    <span className="font-semibold text-slate-800">{receiptData.customer_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-slate-600">Payment:</span>
                                    <span className="font-bold text-emerald-600 uppercase">{receiptData.payment_method}</span>
                                </div>
                            </div>

                            {/* Itemized Table */}
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="border-b border-slate-300 text-[10px] font-black uppercase text-slate-500">
                                    <tr>
                                        <th className="py-1">Item</th>
                                        <th className="py-1 text-center">Qty</th>
                                        <th className="py-1 text-right">Price</th>
                                        <th className="py-1 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {receiptData.items?.map((it: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="py-1.5 font-semibold text-slate-800 line-clamp-1">{it.product_name}</td>
                                            <td className="py-1.5 text-center font-bold">{it.quantity}</td>
                                            <td className="py-1.5 text-right font-mono">৳{it.price}</td>
                                            <td className="py-1.5 text-right font-mono font-bold">৳{it.subtotal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Receipt Summary */}
                            <div className="space-y-1 text-xs border-t border-slate-200 pt-2">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal:</span>
                                    <span className="font-mono">৳{receiptData.subtotal}</span>
                                </div>
                                {receiptData.discount > 0 && (
                                    <div className="flex justify-between text-rose-600">
                                        <span>Discount:</span>
                                        <span className="font-mono">-৳{receiptData.discount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-300 pt-1">
                                    <span>Grand Total:</span>
                                    <span className="font-mono text-emerald-600">৳{receiptData.total}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 pt-1">
                                    <span>Paid:</span>
                                    <span className="font-mono font-bold">৳{receiptData.paid_amount}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Change / Return:</span>
                                    <span className="font-mono font-bold text-emerald-600">৳{receiptData.change_amount}</span>
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-400 pt-2 font-medium">আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ! 🛍️</p>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex gap-2 justify-end print:hidden">
                            <button
                                onClick={() => setShowReceiptModal(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                            >
                                বন্ধ করুন
                            </button>
                            <button
                                onClick={handlePrintReceipt}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <Printer className="w-4 h-4" /> 🖨️ প্রিন্ট রসিদ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Pos.layout = (page: any) => <SellerLayout children={page} />;
