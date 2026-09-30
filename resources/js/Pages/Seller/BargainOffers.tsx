import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Tag, 
    Plus, 
    Search, 
    Trash2, 
    Edit2, 
    Check, 
    X, 
    Gift, 
    DollarSign, 
    Percent, 
    Clock, 
    Phone, 
    Package, 
    CheckCircle2, 
    XCircle,
    User
} from 'lucide-react';
import Swal from 'sweetalert2';

interface OfferRecord {
    id: number;
    offer_type: 'bargain' | 'beginner';
    offer_title: string;
    product_id?: number | null;
    product?: { id: number; name: string; price: number } | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    original_price: number;
    offered_price: number;
    discount_percent: number;
    status: string;
    expires_at?: string | null;
}

interface BargainOffersProps {
    offers?: OfferRecord[];
    products?: Array<{ id: number; name: string; price: number }>;
    totalCount?: number;
    activeCount?: number;
    pendingCount?: number;
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function BargainOffers({ 
    offers = [], 
    products = [], 
    totalCount = 0, 
    activeCount = 0, 
    pendingCount = 0,
    filters = {} 
}: BargainOffersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.status || 'All Offers');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<OfferRecord | null>(null);

    // Form states
    const [offerType, setOfferType] = useState<'beginner' | 'bargain'>('beginner');
    const [offerTitle, setOfferTitle] = useState('');
    const [productId, setProductId] = useState<string>('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [originalPrice, setOriginalPrice] = useState('0');
    const [offeredPrice, setOfferedPrice] = useState('0');

    const tabs = ['All Offers', 'Beginner Offers', 'Bargain Deals', 'Pending', 'Active'];

    const filteredOffers = offers.filter(item => {
        const query = search.toLowerCase();
        const title = (item.offer_title || '').toLowerCase();
        const cust = (item.customer_name || '').toLowerCase();
        const prod = (item.product ? item.product.name : '').toLowerCase();

        const matchesSearch = title.includes(query) || cust.includes(query) || prod.includes(query);

        let matchesTab = true;
        if (activeTab === 'Beginner Offers') {
            matchesTab = item.offer_type === 'beginner';
        } else if (activeTab === 'Bargain Deals') {
            matchesTab = item.offer_type === 'bargain';
        } else if (activeTab === 'Pending') {
            matchesTab = item.status === 'pending';
        } else if (activeTab === 'Active') {
            matchesTab = item.status === 'active' || item.status === 'accepted';
        }

        return matchesSearch && matchesTab;
    });

    const handleProductSelect = (pId: string) => {
        setProductId(pId);
        const selProd = products.find(p => String(p.id) === pId);
        if (selProd) {
            setOriginalPrice(String(selProd.price));
            setOfferedPrice(String(roundPrice(selProd.price * 0.8))); // default 20% off
        }
    };

    const roundPrice = (val: number) => Math.round(val * 100) / 100;

    const handleOpenAddModal = () => {
        setOfferType('beginner');
        setOfferTitle('Beginner Special Discount (First Order Offer)');
        setProductId(products.length > 0 ? String(products[0].id) : '');
        setOriginalPrice(products.length > 0 ? String(products[0].price) : '1000');
        setOfferedPrice(products.length > 0 ? String(roundPrice(products[0].price * 0.8)) : '800');
        setCustomerName('New Customer Welcome');
        setCustomerPhone('');
        setIsAddModalOpen(true);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!offerTitle.trim()) return;

        router.post('/seller/bargain-offers', {
            offer_type: offerType,
            offer_title: offerTitle,
            product_id: productId ? parseInt(productId) : null,
            original_price: parseFloat(originalPrice) || 0,
            offered_price: parseFloat(offeredPrice) || 0,
            customer_name: customerName,
            customer_phone: customerPhone,
            status: 'active'
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                Swal.fire({
                    title: 'Offer Created! 🎉',
                    text: `New ${offerType === 'beginner' ? 'Beginner' : 'Bargain'} offer active.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    const handleUpdateStatus = (id: number, status: string) => {
        router.put(`/seller/bargain-offers/${id}`, {
            status
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Offer status set to ${status}!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            }
        });
    };

    const handleDeleteOffer = (id: number, title: string) => {
        Swal.fire({
            title: 'Delete Offer?',
            text: `Are you sure you want to delete "${title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/bargain-offers/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Offer deleted.',
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
            <Head title="Beginner & Bargain Offers Management" />

            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-md mb-2">
                            <Gift className="w-3.5 h-3.5 text-amber-400" />
                            Beginner Offers & Bargain Deals Center
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Beginner & Bargain Offers</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            নতুন ক্রেতাদের জন্য শিক্ষানবিস অফার (Beginner Offers) এবং কাস্টমারদের বার্গেনিং অফার পরিচালনা করুন।
                        </p>
                    </div>

                    <button 
                        onClick={handleOpenAddModal}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer shrink-0 z-10"
                    >
                        <Plus className="w-4 h-4" /> + Create Beginner / Bargain Offer
                    </button>
                </div>

                {/* Stat Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Total Offers & Deals
                            </span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
                                {totalCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <Tag className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Active Offers & Discounts
                            </span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
                                {activeCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <Gift className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Pending Negotiations
                            </span>
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block font-mono">
                                {pendingCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Status Tabs */}
                        <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto gap-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                                        activeTab === tab
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        {/* Search Input */}
                        <div className="relative w-full md:w-72">
                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by offer title, product, customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Offers List Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <table className="w-full text-left text-xs table-fixed">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800 text-[10px]">
                                <tr>
                                    <th className="px-3 py-3 w-[15%]">Offer Type</th>
                                    <th className="px-3 py-3 w-[25%]">Title & Product</th>
                                    <th className="px-3 py-3 w-[18%]">Customer Info</th>
                                    <th className="px-3 py-3 text-right w-[10%]">Original</th>
                                    <th className="px-3 py-3 text-right w-[10%]">Offered</th>
                                    <th className="px-3 py-3 text-center w-[8%]">Discount</th>
                                    <th className="px-3 py-3 text-center w-[10%]">Status</th>
                                    <th className="px-3 py-3 text-center w-[4%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {filteredOffers.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/50 transition">
                                        <td className="px-3 py-3">
                                            {item.offer_type === 'beginner' ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 dark:bg-purple-950 dark:text-purple-400 px-2 py-0.5 rounded-full truncate">
                                                    <Gift className="w-3 h-3 text-purple-600 shrink-0" /> Beginner
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-0.5 rounded-full truncate">
                                                    <Tag className="w-3 h-3 text-indigo-600 shrink-0" /> Bargain
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-3 py-3">
                                            <div className="font-bold text-slate-900 dark:text-white text-xs truncate" title={item.offer_title}>
                                                {item.offer_title}
                                            </div>
                                            {item.product && (
                                                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 truncate" title={item.product.name}>
                                                    <Package className="w-3 h-3 shrink-0" /> {item.product.name}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-3 py-3">
                                            <div className="font-bold text-slate-900 dark:text-white text-xs truncate" title={item.customer_name || 'All New Buyers'}>
                                                {item.customer_name || 'All New Buyers'}
                                            </div>
                                            {item.customer_phone && (
                                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5 truncate">
                                                    <Phone className="w-3 h-3 shrink-0" /> {item.customer_phone}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-3 py-3 text-right font-mono font-medium text-slate-400 line-through text-xs">
                                            ৳{Number(item.original_price).toLocaleString()}
                                        </td>

                                        <td className="px-3 py-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                                            ৳{Number(item.offered_price).toLocaleString()}
                                        </td>

                                        <td className="px-3 py-3 text-center font-mono">
                                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                                -{Number(item.discount_percent || 0).toFixed(0)}%
                                            </span>
                                        </td>

                                        <td className="px-3 py-3 text-center">
                                            {item.status === 'active' || item.status === 'accepted' ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3 shrink-0" /> Active
                                                </span>
                                            ) : item.status === 'rejected' ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-300 dark:bg-rose-950 dark:text-rose-400 px-2 py-0.5 rounded-full">
                                                    <XCircle className="w-3 h-3 shrink-0" /> Rejected
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-300 dark:bg-amber-950 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                                    <Clock className="w-3 h-3 shrink-0" /> Pending
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-3 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Accept/Activate Button */}
                                                {item.status !== 'active' && item.status !== 'accepted' && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleUpdateStatus(item.id, 'active')}
                                                        className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-md transition cursor-pointer border border-emerald-200" 
                                                        title="Activate / Accept Offer"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}

                                                {/* Delete Button */}
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteOffer(item.id, item.offer_title)}
                                                    className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-md transition cursor-pointer border border-rose-200" 
                                                    title="Delete Offer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredOffers.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No bargain or beginner offers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Create Offer Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Gift className="w-5 h-5 text-amber-500" /> Create Offer / Beginner Discount
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
                                    Offer Type *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setOfferType('beginner')}
                                        className={`py-2.5 rounded-2xl font-bold text-xs border transition flex items-center justify-center gap-2 cursor-pointer ${offerType === 'beginner' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                    >
                                        <Gift className="w-4 h-4" /> Beginner Offer
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setOfferType('bargain')}
                                        className={`py-2.5 rounded-2xl font-bold text-xs border transition flex items-center justify-center gap-2 cursor-pointer ${offerType === 'bargain' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                    >
                                        <Tag className="w-4 h-4" /> Bargain Deal
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Offer Title *
                                </label>
                                <input 
                                    type="text"
                                    placeholder="e.g. 20% First Time Buyer Offer"
                                    value={offerTitle}
                                    onChange={e => setOfferTitle(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    required
                                />
                            </div>

                            {products.length > 0 && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Select Target Product
                                    </label>
                                    <select
                                        value={productId}
                                        onChange={e => handleProductSelect(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    >
                                        <option value="">-- Choose Product --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (৳{Number(p.price).toLocaleString()})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Original Price (৳)
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={originalPrice}
                                        onChange={e => setOriginalPrice(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Offered Price (৳)
                                    </label>
                                    <input 
                                        type="number"
                                        step="0.01"
                                        value={offeredPrice}
                                        onChange={e => setOfferedPrice(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-emerald-600"
                                        required
                                    />
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
                                    Activate Offer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

BargainOffers.layout = (page: any) => <SellerLayout children={page} />;
