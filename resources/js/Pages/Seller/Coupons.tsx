import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Zap, Plus, Trash2, CheckCircle2, AlertCircle, X, 
    Tag, Percent, DollarSign, Calendar, RefreshCw
} from 'lucide-react';
import SellerLayout from '@/Layouts/SellerLayout';
import Swal from 'sweetalert2';

interface CouponProps {
    coupons?: Array<{
        id: number;
        code: string;
        type: 'fixed' | 'percentage';
        value: number;
        min_order_amount?: number;
        max_discount_amount?: number;
        usage_limit?: number;
        used_count?: number;
        expires_at?: string;
        is_active: boolean;
    }>;
}

export default function Coupons({ coupons = [] }: CouponProps) {
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        type: 'percentage',
        value: '',
        min_order_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        expires_at: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/seller/coupons', {
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                reset();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'নতুন কুপন সফলভাবে তৈরি হয়েছে!',
                    showConfirmButton: false,
                    timer: 2500
                });
            }
        });
    };

    const handleDelete = (id: number, code: string) => {
        Swal.fire({
            title: 'কুপনটি মুছে ফেলতে চান?',
            text: `কুপন কোড: "${code}" মুছে ফেলা হলে গ্রাহকরা এটি ব্যবহার করতে পারবে না।`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/coupons/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'কুপন সফলভাবে মোছা হয়েছে!',
                            showConfirmButton: false,
                            timer: 2000
                        });
                    }
                });
            }
        });
    };

    const handleToggle = (id: number) => {
        router.post(`/seller/coupons/${id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'কুপন স্ট্যাটাস পরিবর্তন করা হয়েছে!',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        });
    };

    return (
        <>
            <Head title="Coupon Discounts — Vendor Panel" />

            <div className="space-y-6">
                
                {/* ─── HEADER BANNER ─── */}
                <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                Promotional Discounts
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-white">
                            <Zap className="w-6 h-6 text-amber-400 shrink-0" />
                            কুপন ও প্রমোশনাল ডিসকাউন্ট (Coupons)
                        </h1>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl">
                            আপনার দোকানের অর্ডারের জন্য বিশেষ কুপন কোড তৈরি করুন এবং গ্রাহকদের ডিসকাউন্ট অফার দিন।
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        নতুন কুপন যোগ করুন
                    </button>
                </div>

                {/* ─── COUPONS GRID / LIST ─── */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    {coupons.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-500 flex items-center justify-center mx-auto mb-3 border border-purple-200 dark:border-purple-800">
                                <Tag className="w-8 h-8 stroke-1" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">কোনো কুপন পাওয়া যায়নি</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                আপনার শপে বিক্রয় বাড়াতে একটি নতুন প্রমো কুপন কোড যোগ করুন।
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition"
                            >
                                + প্রথম কুপন তৈরি করুন
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {coupons.map((c) => (
                                <div 
                                    key={c.id}
                                    className={`border rounded-2xl p-5 relative flex flex-col justify-between transition ${
                                        c.is_active 
                                            ? 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-purple-500' 
                                            : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm font-black text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/80 px-3 py-1 rounded-xl border border-purple-300 dark:border-purple-800 uppercase tracking-widest">
                                                    {c.code}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleToggle(c.id)}
                                                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border cursor-pointer transition ${
                                                    c.is_active 
                                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                                                        : 'bg-slate-500/10 text-slate-500 border-slate-500/30'
                                                }`}
                                            >
                                                {c.is_active ? '● Active' : '○ Inactive'}
                                            </button>
                                        </div>

                                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                                            <div className="flex justify-between items-center">
                                                <span>ডিসকাউন্ট পরিমাণ:</span>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {c.type === 'percentage' ? `${c.value}% OFF` : `৳${c.value} OFF`}
                                                </span>
                                            </div>
                                            {c.min_order_amount && (
                                                <div className="flex justify-between items-center text-slate-400">
                                                    <span>নূন্যতম অর্ডার:</span>
                                                    <span>৳{c.min_order_amount}</span>
                                                </div>
                                            )}
                                            {c.expires_at && (
                                                <div className="flex justify-between items-center text-slate-400">
                                                    <span>মেয়াদ শেষ:</span>
                                                    <span>{c.expires_at.split('T')[0]}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                        <span className="text-[11px] font-medium text-slate-400">
                                            ব্যবহৃত: <strong className="text-purple-600">{c.used_count || 0}</strong> বার
                                        </span>
                                        <button 
                                            onClick={() => handleDelete(c.id, c.code)}
                                            className="text-slate-400 hover:text-rose-500 p-1.5 transition"
                                            title="মুছে ফেলুন"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* ─── MODAL: CREATE NEW COUPON ─── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h3 className="font-extrabold text-sm flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" /> নতুন কুপন ডিসকাউন্ট তৈরি করুন
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-slate-300 font-bold mb-1">কুপন কোড (Coupon Code) *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase())}
                                    placeholder="Ex: EID500 or SUMMER20"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase tracking-wider"
                                />
                                {errors.code && <p className="text-rose-400 text-[11px] mt-1">{errors.code}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-300 font-bold mb-1">ডিসকাউন্ট টাইপ</label>
                                    <select 
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value as any)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
                                    >
                                        <option value="percentage">শতাংশ (%) Percentage</option>
                                        <option value="fixed">ফিক্সড টাকা (৳) Fixed Amount</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-bold mb-1">ডিসকাউন্ট মান (Value) *</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={data.value}
                                        onChange={e => setData('value', e.target.value)}
                                        placeholder={data.type === 'percentage' ? '10%' : '100 TK'}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-300 font-bold mb-1">নূন্যতম কেনাকাটা (Min Order)</label>
                                    <input 
                                        type="number" 
                                        value={data.min_order_amount}
                                        onChange={e => setData('min_order_amount', e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-bold mb-1">সর্বোচ্চ ব্যবহার (Limit)</label>
                                    <input 
                                        type="number" 
                                        value={data.usage_limit}
                                        onChange={e => setData('usage_limit', e.target.value)}
                                        placeholder="100"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-300 font-bold mb-1">মেয়াদ উত্তীর্ণের তারিখ (Expire Date)</label>
                                <input 
                                    type="date" 
                                    value={data.expires_at}
                                    onChange={e => setData('expires_at', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold"
                                />
                            </div>

                            <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-slate-800 rounded-xl font-bold text-slate-300 hover:bg-slate-700"
                                >বাতিল</button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white shadow-md disabled:opacity-50"
                                >
                                    {processing ? 'তৈরি হচ্ছে...' : 'কুপন সেভ করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Coupons.layout = (page: any) => <SellerLayout children={page} />;
