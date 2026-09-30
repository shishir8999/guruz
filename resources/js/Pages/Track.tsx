import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { TopNoticeBar } from '@/Components/TopNoticeBar';
import { NoticeMarquee } from '@/Components/NoticeMarquee';
import { Search, Package, Clock, CheckCircle2, Truck, RefreshCw, XCircle, MapPin, Phone, User, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';

interface TrackProps {
    order?: any;
    search?: string;
}

export default function Track({ order, search = '' }: TrackProps) {
    const [query, setQuery] = useState(search);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.get('/track', { search: query.trim() }, { preserveState: true });
    };

    const rawStatus = (order?.status || '').toLowerCase().trim();
    const isCancelled = ['cancelled', 'canceled'].includes(rawStatus);

    const getStepIndex = (status: string) => {
        if (['cancelled', 'canceled'].includes(status)) return 4;
        if (['delivered', 'completed'].includes(status)) return 3;
        if (['shipped', 'shipping', 'out_for_delivery', 'picked_up'].includes(status)) return 2;
        if (['processing', 'confirmed', 'in_progress'].includes(status)) return 1;
        return 0; // pending
    };

    const currentStepIndex = getStepIndex(rawStatus);

    const steps = [
        { key: 'pending', number: 1, label: 'Pending', label_bn: 'অপেক্ষমাণ', icon: Clock, desc: 'অর্ডার গ্রহণ করা হয়েছে' },
        { key: 'processing', number: 2, label: 'Processing', label_bn: 'প্রক্রিয়াধীন', icon: RefreshCw, desc: 'পণ্য প্রস্তুত ও প্যাকিং হচ্ছে' },
        { key: 'shipped', number: 3, label: 'Shipped', label_bn: 'শিপড', icon: Truck, desc: 'কুরিয়ারে হস্তান্তর করা হয়েছে' },
        { key: 'delivered', number: 4, label: 'Delivered', label_bn: 'ডেলিভার্ড', icon: CheckCircle2, desc: 'সফলভাবে ডেলিভারি সম্পন্ন' },
        { key: 'cancelled', number: 5, label: 'Cancel', label_bn: 'বাতিল', icon: XCircle, isCancel: true, desc: 'অর্ডারটি বাতিল করা হয়েছে' },
    ];

    const getStatusBadge = () => {
        if (isCancelled) {
            return (
                <span className="px-3.5 py-1.5 bg-red-100 border border-red-300 text-red-700 font-black text-xs rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                    <XCircle size={14} className="text-red-600" />
                    <span>CANCELLED (বাতিল)</span>
                </span>
            );
        }
        if (currentStepIndex === 3) {
            return (
                <span className="px-3.5 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-700 font-black text-xs rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>DELIVERED (ডেলিভার্ড)</span>
                </span>
            );
        }
        if (currentStepIndex === 2) {
            return (
                <span className="px-3.5 py-1.5 bg-purple-100 border border-purple-300 text-purple-700 font-black text-xs rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                    <Truck size={14} className="text-purple-600" />
                    <span>SHIPPED (শিপড)</span>
                </span>
            );
        }
        if (currentStepIndex === 1) {
            return (
                <span className="px-3.5 py-1.5 bg-blue-100 border border-blue-300 text-blue-700 font-black text-xs rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5 animate-pulse">
                    <RefreshCw size={14} className="text-blue-600 animate-spin" />
                    <span>PROCESSING (প্রক্রিয়াধীন)</span>
                </span>
            );
        }
        return (
            <span className="px-3.5 py-1.5 bg-amber-100 border border-amber-300 text-amber-700 font-black text-xs rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                <Clock size={14} className="text-amber-600" />
                <span>PENDING (অপেক্ষমাণ)</span>
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] text-slate-800 flex flex-col justify-between font-sans">
            <Head title="Order Tracking — Guruz" />
            
            <div>
                <TopNoticeBar />
                <NoticeMarquee />
                <Header />

                <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
                    {/* Header Title */}
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                            <Truck size={28} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Order Tracking</h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            আপনার অর্ডার নম্বর অথবা ফোন নম্বর লিখে ট্র্যাকিং স্ট্যাটাস চেক করুন
                        </p>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex gap-2 sm:gap-3 bg-white border border-slate-200 p-2 sm:p-3 rounded-2xl shadow-sm max-w-2xl mx-auto">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                required
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g. GZ-VNUBEQIU বা 017XXXXXXXX"
                                className="w-full pl-4 pr-4 py-3 sm:py-3.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black px-5 sm:px-8 py-3 rounded-xl text-sm sm:text-base flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer shrink-0"
                        >
                            <Search className="w-4 h-4 sm:w-5 sm:h-5" /> 
                            <span>Track</span>
                        </button>
                    </form>

                    {/* Order Result Card */}
                    {order ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-6 shadow-sm">
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-lg sm:text-xl text-slate-900">
                                            Order #{order.order_number}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                        <Calendar size={13} className="text-slate-400" />
                                        Placed on {new Date(order.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    {getStatusBadge()}
                                </div>
                            </div>

                            {/* ─── DYNAMIC STATUS STEPPER WITH PROGRESS BAR ─── */}
                            <div className="py-4">
                                <div className="relative">
                                    {/* Desktop & Tablet Progress Line (Points 1-4) */}
                                    <div className="hidden sm:block absolute left-8 right-8 top-5 h-1.5 bg-slate-100 rounded-full z-0">
                                        {/* Filled Line */}
                                        {!isCancelled && (
                                            <div 
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 shadow-xs"
                                                style={{ 
                                                    width: `${Math.min(100, (currentStepIndex / 3) * 75)}%` 
                                                }}
                                            />
                                        )}
                                        {/* If Cancelled, line from pending to red */}
                                        {isCancelled && (
                                            <div className="h-full bg-red-400 rounded-full w-full opacity-30" />
                                        )}
                                    </div>

                                    {/* 5 Step Points Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-2 text-center relative z-10">
                                        {steps.map((step, idx) => {
                                            const isStepCancel = step.isCancel;
                                            
                                            // Normal flow: steps 0 to 3
                                            const isCompleted = !isCancelled && currentStepIndex >= idx && !isStepCancel;
                                            const isCurrent = !isCancelled && currentStepIndex === idx;
                                            
                                            // Cancel flow: step 4 (Cancel)
                                            const isCancelActive = isCancelled && isStepCancel;

                                            const IconComp = step.icon;

                                            return (
                                                <div 
                                                    key={step.key} 
                                                    className={`p-3 sm:p-1 rounded-2xl sm:rounded-none border sm:border-0 transition-all ${
                                                        isCancelActive 
                                                            ? 'bg-red-50/80 border-red-200 sm:bg-transparent'
                                                            : isCurrent 
                                                                ? 'bg-emerald-50/80 border-emerald-200 sm:bg-transparent' 
                                                                : 'bg-slate-50/60 border-slate-100 sm:bg-transparent'
                                                    }`}
                                                >
                                                    {/* Circle Badge Point */}
                                                    <div 
                                                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full mx-auto flex items-center justify-center font-black text-sm sm:text-base transition-all duration-500 shadow-xs relative ${
                                                            isCancelActive
                                                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 ring-4 ring-red-100 scale-110'
                                                                : isStepCancel
                                                                    ? 'bg-slate-100 text-slate-400 border border-slate-200'
                                                                    : isCurrent
                                                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-100 scale-110 animate-pulse'
                                                                        : isCompleted
                                                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                                                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                                                        }`}
                                                    >
                                                        {isCancelActive ? (
                                                            <XCircle size={20} strokeWidth={2.5} />
                                                        ) : isCompleted ? (
                                                            <CheckCircle2 size={20} strokeWidth={2.5} />
                                                        ) : (
                                                            <IconComp size={18} strokeWidth={2.2} />
                                                        )}
                                                    </div>

                                                    {/* Step Label */}
                                                    <div className="mt-2.5 space-y-0.5">
                                                        <p className={`text-xs sm:text-sm font-extrabold ${
                                                            isCancelActive 
                                                                ? 'text-red-600' 
                                                                : isStepCancel
                                                                    ? 'text-slate-400'
                                                                    : isCurrent 
                                                                        ? 'text-emerald-700' 
                                                                        : isCompleted 
                                                                            ? 'text-slate-800' 
                                                                            : 'text-slate-400'
                                                        }`}>
                                                            {step.label}
                                                        </p>
                                                        <p className={`text-[10px] sm:text-[11px] font-bold ${
                                                            isCancelActive
                                                                ? 'text-red-500'
                                                                : isStepCancel
                                                                    ? 'text-slate-400'
                                                                    : isCurrent
                                                                        ? 'text-emerald-600'
                                                                        : isCompleted
                                                                            ? 'text-slate-500'
                                                                            : 'text-slate-400'
                                                        }`}>
                                                            ({step.label_bn})
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Alert / Notice Message */}
                            {isCancelled ? (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-xs sm:text-sm font-bold">
                                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                                    <span>এই অর্ডারটি বাতিল (Cancelled) করা হয়েছে। কোনো সহায়তার প্রয়োজন হলে আমাদের কাস্টমার সাপোর্টে যোগাযোগ করুন।</span>
                                </div>
                            ) : currentStepIndex === 1 ? (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-blue-800 text-xs sm:text-sm font-bold">
                                    <RefreshCw className="w-5 h-5 text-blue-600 shrink-0 animate-spin" />
                                    <span>আপনার অর্ডারটি বর্তমানে প্রসেসিং হচ্ছে। শীঘ্রই পণ্যটি প্যাক করে কুরিয়ারে হস্তান্তর করা হবে।</span>
                                </div>
                            ) : currentStepIndex === 2 ? (
                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-3 text-purple-800 text-xs sm:text-sm font-bold">
                                    <Truck className="w-5 h-5 text-purple-600 shrink-0" />
                                    <div>
                                        <span>আপনার অর্ডারটি কুরিয়ারে হস্তান্তর করা হয়েছে।</span>
                                        {order.courier_name && (
                                            <p className="mt-0.5 text-xs text-purple-700 font-medium">কুরিয়ার: <strong>{order.courier_name}</strong> {order.courier_tracking_id && `(ট্র্যাকিং আইডি: ${order.courier_tracking_id})`}</p>
                                        )}
                                    </div>
                                </div>
                            ) : currentStepIndex === 3 ? (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-bold">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <span>অভিনন্দন! আপনার অর্ডারটি সফলভাবে ডেলিভারি সম্পন্ন হয়েছে। Guruz-এর সাথে থাকার জন্য ধন্যবাদ!</span>
                                </div>
                            ) : (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs sm:text-sm font-bold">
                                    <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                                    <span>আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই এটি ভেরিফিকেশন ও প্রসেসিং শুরু হবে।</span>
                                </div>
                            )}

                            {/* Order Summary & Customer Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                {/* Customer Info */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                    <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">ডেলিভারি তথ্য</h4>
                                    <div className="space-y-1 text-xs sm:text-sm">
                                        <p className="font-bold text-slate-800 flex items-center gap-2">
                                            <User size={14} className="text-slate-400" />
                                            {order.customer_name || 'Customer'}
                                        </p>
                                        <p className="font-medium text-slate-600 flex items-center gap-2">
                                            <Phone size={14} className="text-slate-400" />
                                            {order.customer_phone}
                                        </p>
                                        <p className="font-medium text-slate-600 flex items-start gap-2">
                                            <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                            <span>{order.shipping_address || 'Address'}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Order Amount */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                    <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider">পেমেন্ট ও মূল্য</h4>
                                    <div className="space-y-1 text-xs sm:text-sm">
                                        <div className="flex justify-between font-medium text-slate-600">
                                            <span>পেমেন্ট মেথড:</span>
                                            <span className="font-bold uppercase text-slate-800">{order.payment_method || 'Cash on Delivery'}</span>
                                        </div>
                                        <div className="flex justify-between font-medium text-slate-600">
                                            <span>পেমেন্ট স্ট্যাটাস:</span>
                                            <span className={`font-bold capitalize ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {order.payment_status || 'Pending'}
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 space-y-1">
                                            <div className="flex justify-between font-medium text-slate-600">
                                                <span>পণ্যের মোট দাম:</span>
                                                <span className="font-bold text-slate-900">৳{Number(order.subtotal || order.total || 0).toLocaleString()}</span>
                                            </div>
                                            {Number(order.discount || 0) > 0 && (
                                                <div className="flex justify-between font-bold text-emerald-600">
                                                    <span className="flex items-center gap-1">
                                                        <span>🎟️ কুপন ছাড়:</span>
                                                        {order.coupon_code && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-mono">{order.coupon_code}</span>}
                                                    </span>
                                                    <span>-৳{Number(order.discount).toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between font-medium text-slate-600">
                                                <span>ডেলিভারি চার্জ:</span>
                                                <span className="font-semibold text-slate-900">
                                                    {Number(order.shipping_fee || 0) === 0 ? 'ফ্রি' : `৳${Number(order.shipping_fee).toLocaleString()}`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between font-black text-sm sm:text-base text-slate-900 pt-1 border-t border-slate-200">
                                            <span>সর্বমোট মূল্য:</span>
                                            <span className="text-emerald-600">৳{Number(order.total || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            {order.items && order.items.length > 0 && (
                                <div className="pt-2">
                                    <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider mb-3">অর্ডারকৃত পণ্যসমূহ</h4>
                                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                                        {order.items.map((item: any, idx: number) => (
                                            <div key={idx} className="p-3 bg-white flex items-center justify-between gap-3 text-xs sm:text-sm">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                                                        <Package size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 truncate">{item.product_name || item.name}</p>
                                                        <p className="text-slate-400 text-[11px]">পরিমাণ: {item.quantity || 1} টি</p>
                                                    </div>
                                                </div>
                                                <div className="font-black text-slate-900 shrink-0">
                                                    ৳{Number(item.subtotal || item.price * (item.quantity || 1)).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : search ? (
                        <div className="text-center py-12 bg-white border border-dashed border-slate-300 rounded-3xl p-8 max-w-2xl mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 text-base">কোনো অর্ডার পাওয়া যায়নি</h3>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                "{search}" নম্বরে কোনো তথ্য মেলেনি। অনুগ্রহ করে সঠিক অর্ডার নম্বর বা ফোন নম্বর লিখে পুনরায় চেষ্টা করুন।
                            </p>
                        </div>
                    ) : null}
                </main>
            </div>

            <Footer />
        </div>
    );
}
