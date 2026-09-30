import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Tag, CheckCircle2, MessageSquare, XCircle, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface BargainItem {
    id: number;
    date: string;
    customer: string;
    shop: string;
    product: string;
    list_price: number;
    offer_price: number;
    final_price?: number;
    status: 'Pending' | 'Accepted' | 'Rejected';
}

export default function BargainOffersPage({ initialOffers = [] }: { initialOffers?: BargainItem[] }) {
    const [offers, setOffers] = useState<BargainItem[]>(initialOffers);

    React.useEffect(() => {
        setOffers(initialOffers);
    }, [initialOffers]);

    const [search, setSearch] = useState('');

    const filteredOffers = offers.filter(o =>
        (o.customer || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.product || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.shop || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleAccept = (id: number) => {
        router.post(`/admin/bargain/${id}/accept`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'Accepted' } : o));
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'দামাদামি অফার গ্রহণ করা হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleReject = (id: number) => {
        router.post(`/admin/bargain/${id}/reject`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setOffers(prev => prev.map(o => o.id === id ? { ...o, status: 'Rejected' } : o));
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: 'দামাদামি অফার প্রত্যাখ্যান করা হয়েছে।',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('আপনি কি নিশ্চিত যে এই অফারটি মুছে ফেলতে চান?')) {
            router.delete(`/admin/bargain/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setOffers(prev => prev.filter(o => o.id !== id));
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'অফার মুছে ফেলা হয়েছে।',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        }
    };

    return (
        <>

            <Head title="দামাদামি অফার — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card matching screenshot #1 */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">দামাদামি অফার</h1>
                        <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                            'দামাদামি করুন' চ্যাট থেকে আসা কাস্টমার অফার।
                        </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="খুঁজুন..."
                            className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-white placeholder:text-purple-200 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-xs"
                        />
                        <Search className="w-4 h-4 text-purple-200 absolute left-3 top-2.5" />
                    </div>
                </div>

                {/* Alert Notification */}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {successMsg}
                    </div>
                )}

                {/* Bargain Offers Table Card matching screenshot #1 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">তারিখ</th>
                                    <th className="py-3 px-4">ক্রেতা</th>
                                    <th className="py-3 px-4">শপ</th>
                                    <th className="py-3 px-4">পণ্য</th>
                                    <th className="py-3 px-4">তালিকা</th>
                                    <th className="py-3 px-4">অফার</th>
                                    <th className="py-3 px-4">চূড়ান্ত</th>
                                    <th className="py-3 px-4">স্ট্যাটাস</th>
                                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {filteredOffers.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-16 text-center text-slate-400 text-xs font-semibold">
                                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md mx-auto">
                                                এখনো কোনো অফার নেই।
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOffers.map(o => (
                                        <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-4 font-mono">{o.date}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{o.customer}</td>
                                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{o.shop}</td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{o.product}</td>
                                            <td className="py-3.5 px-4 font-mono font-bold">৳{o.list_price}</td>
                                            <td className="py-3.5 px-4 font-mono font-bold text-purple-600">৳{o.offer_price}</td>
                                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">৳{o.final_price || o.offer_price}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                                    o.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                                    o.status === 'Rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                                    'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                }`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleAccept(o.id)}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(o.id)}
                                                        className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(o.id)}
                                                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-red-600 transition"
                                                        title="মুছুন"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        
</>
    );
}
