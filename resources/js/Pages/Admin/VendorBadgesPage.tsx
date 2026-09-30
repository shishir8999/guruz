import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { RefreshCw, Search, CheckCircle2, Star, Rocket, ShieldCheck, Trophy, Truck, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface VendorBadgeItem {
    id: number;
    shop_name: string;
    shop_slug: string;
    rating: number;
    avatar: string;
    badges: { id: string; name: string; isManual: boolean; color: string; db_id: number }[];
}

interface Props {
    initialVendors: VendorBadgeItem[];
}

export default function VendorBadgesPage({ initialVendors }: Props) {
    const { flash } = usePage().props as any;

    const [search, setSearch] = useState('');
    const [recomputing, setRecomputing] = useState(false);

    const filteredVendors = initialVendors.filter(v =>
        v.shop_name.toLowerCase().includes(search.toLowerCase()) ||
        v.shop_slug.toLowerCase().includes(search.toLowerCase())
    );

    const handleRecomputeAll = () => {
        setRecomputing(true);
        router.post('/admin/vendor-badges/recompute', {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Badges recomputed for all vendors.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
            },
            onFinish: () => setRecomputing(false),
        });
    };

    const handleRecomputeSingle = (shopId: number) => {
        router.post(`/admin/vendor-badges/${shopId}/recompute`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Success!',
                    text: 'Badges recomputed for the vendor.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleGrantBadge = (vendorId: number, badgeType: string) => {
        if (!badgeType) return;

        const badgeMap: Record<string, { name: string; color: string }> = {
            rising_star: { name: 'রাইজিং স্টার', color: 'bg-pink-500 text-white' },
            top_rated: { name: 'টপ রেটেড', color: 'bg-amber-500 text-white' },
            rocket_delivery: { name: 'রকেট ডেলিভারি', color: 'bg-rose-500 text-white' },
            express_shipper: { name: 'এক্সপ্রেস শিপার', color: 'bg-blue-500 text-white' },
            trusted_seller: { name: 'ট্রাস্টেড সেলার', color: 'bg-emerald-500 text-white' },
            best_seller: { name: 'বেস্ট সেলার', color: 'bg-purple-500 text-white' },
        };

        const bInfo = badgeMap[badgeType];
        if (!bInfo) return;

        router.post(`/admin/vendor-badges/${vendorId}/grant`, {
            badge: badgeType,
            name: bInfo.name,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Saved!',
                    text: `Badge '${bInfo.name}' granted successfully.`,
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleRemoveBadge = (vendorId: number, badgeId: string) => {
        router.delete(`/admin/vendor-badges/${vendorId}/${badgeId}/remove`, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'Removed!',
                    text: 'Badge removed successfully.',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
            }
        });
    };

    return (
        <>

            <Head title="Vendor Badges — Admin Panel" />

            <div className="space-y-6">

                {/* Header Title + Subtitle + Recompute All Button matching screenshot #1 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Vendor Badges</h1>
                        <p className="text-xs font-semibold text-slate-500 mt-1">
                            Auto-computed by delivery speed, ratings & sales. Manually granted badges are locked from auto-revoke.
                        </p>
                    </div>

                    <button
                        onClick={handleRecomputeAll}
                        disabled={recomputing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <RefreshCw className={`w-4 h-4 ${recomputing ? 'animate-spin' : ''}`} /> {recomputing ? 'Recomputing...' : 'Recompute All'}
                    </button>
                </div>

                {/* Badge Legend Bar matching exact screenshot #1 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-pink-100 dark:bg-pink-950 text-pink-600 rounded-lg">
                            <Rocket className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Rising Star</div>
                            <div className="text-[10px] text-slate-400">New shop with 10+ delivered orders</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-lg">
                            <Star className="w-4 h-4 fill-amber-500" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Top Rated</div>
                            <div className="text-[10px] text-slate-400">4.5★+ with 20+ delivered orders</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-rose-100 dark:bg-rose-950 text-rose-600 rounded-lg">
                            <Rocket className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Rocket Delivery</div>
                            <div className="text-[10px] text-slate-400">Last 10 orders delivered in 24h</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-lg">
                            <Truck className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Express Shipper</div>
                            <div className="text-[10px] text-slate-400">Avg delivery under 48h</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-lg">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Trusted Seller</div>
                            <div className="text-[10px] text-slate-400">Verified + 4★ + 50 delivered</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-100 dark:bg-purple-950 text-purple-600 rounded-lg">
                            <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-[11px]">Best Seller</div>
                            <div className="text-[10px] text-slate-400">Top-5 shop by delivered orders</div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search shop by name or slug..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                {/* Alert Notification */}
                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {flash.success}
                    </div>
                )}

                {/* Vendor Badges Table Card matching exact screenshot #1 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Shop</th>
                                    <th className="py-3 px-4">Current Badges</th>
                                    <th className="py-3 px-4">Grant Badge</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {filteredVendors.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        
                                        {/* Shop */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <img src={v.avatar} alt={v.shop_name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-xs">{v.shop_name}</div>
                                                    <div className="text-[11px] text-slate-400 font-mono">
                                                        {v.shop_slug} · <span className="text-amber-500 font-bold">★{Number(v.rating || 5).toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Current Badges pills matching screenshot #1 */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {v.badges.map(b => (
                                                    <span key={b.id} className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-xs ${b.color}`}>
                                                        {b.name}
                                                        <button onClick={() => handleRemoveBadge(v.id, b.id)} className="hover:opacity-80">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                        {b.isManual && <span className="text-[9px] font-mono opacity-80">M</span>}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Grant Badge Dropdown */}
                                        <td className="py-3.5 px-4">
                                            <select
                                                onChange={e => { handleGrantBadge(v.id, e.target.value); e.target.value = ''; }}
                                                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="">+ Add badge...</option>
                                                <option value="rising_star">🌸 Rising Star</option>
                                                <option value="top_rated">⭐ Top Rated</option>
                                                <option value="rocket_delivery">🚀 Rocket Delivery</option>
                                                <option value="express_shipper">🚚 Express Shipper</option>
                                                <option value="trusted_seller">🛡️ Trusted Seller</option>
                                                <option value="best_seller">🏆 Best Seller</option>
                                            </select>
                                        </td>

                                        {/* Actions Recompute button */}
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                onClick={() => handleRecomputeSingle(v.id)}
                                                className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold px-3 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer ml-auto"
                                            >
                                                <RefreshCw className="w-3 h-3" /> Recompute
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        
</>
    );
}
