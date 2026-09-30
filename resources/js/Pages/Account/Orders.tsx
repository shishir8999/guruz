import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import {
    ShoppingBag, ChevronRight, Eye, Truck, CheckCircle2, Clock, XCircle, ArrowLeft, RefreshCw, Package, Ban, AlertTriangle
} from 'lucide-react';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
    image?: string;
}

interface OrderData {
    id: number;
    order_number: string;
    status: string;
    total: number;
    payment_status?: string;
    created_at: string;
    delivered_at?: string;
    items_count?: number;
    can_cancel?: boolean;
    cancel_remaining_text?: string | null;
    is_past_12_hours?: boolean;
    items?: OrderItem[];
}

export default function Orders({ orders = [] }: { orders: OrderData[] }) {
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const statusParam = urlParams.get('status');
            if (statusParam && ['all', 'pending', 'shipped', 'delivered', 'cancelled'].includes(statusParam)) {
                return statusParam;
            }
        }
        return 'all';
    });

    const handleCancelOrder = (order: OrderData) => {
        Swal.fire({
            title: 'অর্ডার বাতিল করতে চান?',
            html: `
                <div style="text-align: left; font-size: 13px; line-height: 1.6; color: #475569;">
                    <p>আপনি কি নিশ্চিত যে <strong>অর্ডার #${order.order_number}</strong> বাতিল করতে চান?</p>
                    <p style="margin-top: 8px; font-size: 12px; color: #e11d48; font-weight: bold; background: #fff1f2; padding: 8px 12px; border-radius: 8px; border: 1px solid #fecdd3;">
                        ⚠️ অর্ডার বাতিল করার পর এটি আর ডেলিভারি বা প্রসেস করা হবে না। ওয়ালেট ব্যালেন্স ব্যবহার করা থাকলে তা স্বয়ংক্রিয়ভাবে রিফান্ড হয়ে যাবে।
                    </p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, অর্ডার বাতিল করুন',
            cancelButtonText: 'না, ফিরে যান',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/account/orders/${order.id}/cancel`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'অর্ডার বাতিল হয়েছে!',
                            text: `অর্ডার #${order.order_number} সফলভাবে বাতিল করা হয়েছে।`,
                            confirmButtonColor: '#16a34a',
                            confirmButtonText: 'ঠিক আছে',
                        });
                    },
                    onError: (errors: any) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'বাতিল করা সম্ভব হয়নি',
                            text: Object.values(errors).join(', ') || 'অর্ডার বাতিল করতে সমস্যা হয়েছে।',
                            confirmButtonColor: '#e11d48',
                        });
                    }
                });
            }
        });
    };

    const counts = {
        all: orders.length,
        pending: orders.filter(o => ['pending', 'processing', 'to pay', 'to accept'].includes((o.status || '').toLowerCase())).length,
        shipped: orders.filter(o => ['shipped', 'to ship', 'to receive'].includes((o.status || '').toLowerCase())).length,
        delivered: orders.filter(o => ['delivered', 'completed', 'complete'].includes((o.status || '').toLowerCase())).length,
        cancelled: orders.filter(o => ['cancelled', 'returned', 'rejected', 'failed'].includes((o.status || '').toLowerCase())).length,
    };

    const tabs = [
        { key: 'all',        label: 'সকল',        count: counts.all },
        { key: 'pending',    label: 'প্রসেসিং',    count: counts.pending },
        { key: 'shipped',    label: 'শিপিং',      count: counts.shipped },
        { key: 'delivered',  label: 'সম্পন্ন',      count: counts.delivered },
        { key: 'cancelled',  label: 'বাতিল',      count: counts.cancelled },
    ];

    const filteredOrders = orders.filter(order => {
        const status = order.status ? order.status.toLowerCase() : '';
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return ['pending', 'processing', 'to pay', 'to accept'].includes(status);
        if (activeTab === 'shipped') return ['shipped', 'to ship', 'to receive'].includes(status);
        if (activeTab === 'delivered') return ['delivered', 'completed', 'complete'].includes(status);
        if (activeTab === 'cancelled') return ['cancelled', 'returned', 'rejected', 'failed'].includes(status);
        return true;
    });

    const getStatusBadge = (status: string) => {
        const s = status ? status.toLowerCase() : 'pending';
        switch (s) {
            case 'delivered':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={13} /> Delivered
                    </span>
                );
            case 'shipped':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-700 border border-indigo-200">
                        <Truck size={13} /> Shipped
                    </span>
                );
            case 'processing':
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-700 border border-amber-200">
                        <Clock size={13} /> Processing
                    </span>
                );
            case 'cancelled':
            case 'returned':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700 border border-rose-200">
                        <XCircle size={13} /> {s}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                        {status}
                    </span>
                );
        }
    };

    const tabEmptyInfo: Record<string, { title: string; desc: string; icon: any; iconColor: string; bg: string; buttonText: string; buttonHref: string }> = {
        all: {
            title: 'কোনো অর্ডার পাওয়া যায়নি',
            desc: 'আপনি এখনো কোনো অর্ডার করেননি। আমাদের ওয়েবসাইট থেকে আপনার পছন্দের প্রোডাক্ট বেছে শপিং শুরু করুন!',
            icon: Package,
            iconColor: 'text-slate-400',
            bg: 'bg-slate-100',
            buttonText: 'শপিং শুরু করুন ➔',
            buttonHref: '/products'
        },
        pending: {
            title: 'কোনো অর্ডার প্রক্রিয়াধীন নেই',
            desc: 'বর্তমানে আপনার কোনো অর্ডার প্যাকেজিং বা প্রক্রিয়াকরণ হচ্ছে না। নতুন কোনো পছন্দের পণ্য অর্ডার করতে ওয়েবসাইট ভিজিট করুন!',
            icon: Clock,
            iconColor: 'text-amber-500',
            bg: 'bg-amber-50 border border-amber-200/60',
            buttonText: 'নতুন অর্ডার করুন ➔',
            buttonHref: '/products'
        },
        shipped: {
            title: 'কোনো অর্ডার শিপিং অবস্থায় নেই',
            desc: 'আপনার কোনো পণ্য বর্তমানে ডেলিভারির উদ্দেশ্যে বা কুরিয়ারে রানিং নেই। অর্ডার ট্র্যাকিং করতে ট্র্যাকিং পেজ চেক করুন!',
            icon: Truck,
            iconColor: 'text-blue-500',
            bg: 'bg-blue-50 border border-blue-200/60',
            buttonText: 'অর্ডার ট্র্যাক করুন ➔',
            buttonHref: '/account/track'
        },
        delivered: {
            title: 'কোনো ডেলিভারি সম্পন্ন অর্ডার নেই',
            desc: 'আপনার পূর্বে ডেলিভার্ড হওয়া সফল অর্ডারের তালিকা এখানে দেখতে পাবেন। এখনো পর্যন্ত আপনার কোনো অর্ডার ডেলিভারি সম্পন্ন হয়নি।',
            icon: CheckCircle2,
            iconColor: 'text-emerald-500',
            bg: 'bg-emerald-50 border border-emerald-200/60',
            buttonText: 'প্রোডাক্টস দেখুন ➔',
            buttonHref: '/products'
        },
        cancelled: {
            title: 'কোনো বাতিল অর্ডার নেই',
            desc: 'আপনার কোনো অর্ডার বাতিল বা রিটার্ন করা হয়নি। নির্ভয়ে আমাদের বিশ্বস্ত সেবা উপভোগ করুন!',
            icon: XCircle,
            iconColor: 'text-rose-500',
            bg: 'bg-rose-50 border border-rose-200/60',
            buttonText: 'শপিং কন্টিনিউ করুন ➔',
            buttonHref: '/products'
        },
    };

    return (
        <>
            <Head title="My Orders - আমার অর্ডারসমূহ" />
            
            <div className="space-y-4 md:space-y-6 max-w-5xl">
                {/* Header Banner (Desktop Only) */}
                <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <ShoppingBag className="w-6 h-6 text-emerald-600" />
                            <span>My Orders (আমার অর্ডারসমূহ)</span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold ml-1">
                                {orders.length} Total
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            আপনার সকল অর্ডার এবং প্রোডাক্ট ডেলিভারির বর্তমান স্টেটাস এখানে দেখতে পারবেন
                        </p>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-sm transition active:scale-95 shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-400" />
                        <span>Back to Website</span>
                    </Link>
                </div>

                {/* Filter Tabs (Full width 5-column grid with counts) */}
                <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60 shadow-2xs grid grid-cols-5 gap-1">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`py-2 px-1 text-[11px] sm:text-xs font-black text-center rounded-xl transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                    isActive
                                        ? 'bg-[#16a34a] text-white shadow-md shadow-emerald-600/25 scale-[1.02]'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Active Tab Helper Summary Banner */}
                <div className="flex items-center justify-between text-xs text-slate-700 bg-white px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                        <span>
                            <strong>{tabs.find(t => t.key === activeTab)?.label}</strong> ট্যাবে মোট <strong>{filteredOrders.length}টি অর্ডার</strong> রয়েছে
                            {filteredOrders.length > 0 && (
                                <span className="text-slate-500 font-medium"> (যার মধ্যে সর্বমোট {filteredOrders.reduce((acc, o) => acc + (o.items?.length || 1), 0)}টি প্রোডাক্ট রয়েছে)</span>
                            )}
                        </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-bold hidden sm:inline">
                        স্ট্যাটাস: {tabs.find(t => t.key === activeTab)?.label}
                    </span>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    (() => {
                        const empty = tabEmptyInfo[activeTab] || tabEmptyInfo.all;
                        const EmptyIcon = empty.icon;
                        return (
                            <div className="bg-white rounded-3xl border border-slate-100 p-8 sm:p-12 text-center shadow-xs space-y-3.5 transition-all duration-300">
                                <div className={`w-16 h-16 rounded-3xl ${empty.bg} ${empty.iconColor} flex items-center justify-center mx-auto mb-1 shadow-xs`}>
                                    <EmptyIcon className="w-8 h-8" />
                                </div>
                                <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                                    {empty.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
                                    {empty.desc}
                                </p>
                                <div className="pt-2">
                                    <Link
                                        href={empty.buttonHref}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#16a34a] hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition cursor-pointer"
                                    >
                                        <span>{empty.buttonText}</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 hover:border-emerald-300 transition">
                                {/* Order Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wider">
                                                ORDER #{order.order_number}
                                            </span>
                                            {getStatusBadge(order.status)}
                                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200/80">
                                                📦 {order.items?.length || 1}টি পণ্য অন্তর্ভুক্ত
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                                            অর্ডারের তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <span className="text-[11px] text-slate-400 font-medium block">Total Amount (সর্বমোট)</span>
                                        <span className="text-lg font-black text-emerald-600">
                                            ৳{Number(order.total).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items Section */}
                                {order.items && order.items.length > 0 && (
                                    <div className="space-y-2 pt-1">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                                            <span>এই অর্ডারের পণ্যসমূহ ({order.items.length}টি)</span>
                                            <span className="text-[11px] text-slate-400">অর্ডার #{order.order_number}</span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {order.items.map((item) => (
                                                <div 
                                                    key={item.id} 
                                                    className="group relative bg-slate-50/70 rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs hover:border-emerald-400 transition-all duration-200 flex flex-col justify-between h-full p-2.5"
                                                >
                                                    {/* Product Image Container */}
                                                    <div className="relative block aspect-square overflow-hidden bg-white rounded-lg border border-slate-100">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.product_name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 p-1"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-600 text-2xl font-black">
                                                                🛍️
                                                            </div>
                                                        )}

                                                        {/* Quantity Badge */}
                                                        <div className="absolute top-1.5 left-1.5 z-10 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                                                            {item.quantity}x
                                                        </div>
                                                    </div>

                                                    {/* Info & Pricing */}
                                                    <div className="pt-2 flex-1 flex flex-col justify-between gap-1">
                                                        <div>
                                                            <h4 className="text-xs font-bold line-clamp-2 text-slate-800 leading-snug" title={item.product_name}>
                                                                {item.product_name}
                                                            </h4>

                                                            <div className="flex items-center gap-1 mt-1">
                                                                <span className="inline-flex items-center gap-0.5 text-amber-500 text-[10px] font-bold">
                                                                    ⭐ 4.90
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-baseline justify-between gap-1 mt-1 pt-1 border-t border-slate-200/70">
                                                            <span className="font-black text-xs sm:text-sm text-emerald-700">
                                                                ৳{Number(item.subtotal || (item.price * item.quantity)).toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-medium">
                                                                (৳{Number(item.price).toLocaleString()})
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Card Footer Actions */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {order.can_cancel && (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                                                <Clock size={12} className="text-amber-600" />
                                                <span>বাতিল করার সময়সীমা: {order.cancel_remaining_text}</span>
                                            </span>
                                        )}
                                        {order.is_past_12_hours && (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/50">
                                                <Clock size={12} />
                                                <span>১২ ঘণ্টা পার হওয়ায় বাতিলের সুযোগ শেষ</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-2.5 flex-wrap">
                                        {order.can_cancel && (
                                            <button
                                                type="button"
                                                onClick={() => handleCancelOrder(order)}
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-black transition active:scale-95 cursor-pointer shadow-2xs"
                                            >
                                                <XCircle size={14} className="text-rose-600 stroke-[2.5]" />
                                                <span>Cancel Order (অর্ডার বাতিল)</span>
                                            </button>
                                        )}

                                        <Link
                                            href={`/account/orders/${order.id}`}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#16a34a] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer"
                                        >
                                            <Eye size={14} />
                                            <span>View Order Details (অর্ডারের বিস্তারিত দেখুন) ➔</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
