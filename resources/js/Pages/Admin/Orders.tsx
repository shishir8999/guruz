import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Search, Filter, Package, ChevronDown } from 'lucide-react';

interface Order {
    id: number; order_number: string; total: number; status: string;
    payment_method: string; created_at: string;
    user: { id: number; name: string; email: string };
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
    pending:    { label: 'অপেক্ষমান',  color: 'text-amber-700', bg: 'bg-amber-100' },
    processing: { label: 'প্রক্রিয়াধীন', color: 'text-blue-700',  bg: 'bg-blue-100' },
    shipped:    { label: 'শিপড',        color: 'text-purple-700', bg: 'bg-purple-100' },
    delivered:  { label: 'ডেলিভার্ড',  color: 'text-green-700',  bg: 'bg-green-100' },
    cancelled:  { label: 'বাতিল',       color: 'text-red-700',    bg: 'bg-red-100' },
};

export default function AdminOrders({
    orders, statusCounts, filters
}: {
    orders: { data: Order[]; current_page: number; last_page: number };
    statusCounts: Record<string, number>;
    filters: any;
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status ?? '');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const applyFilters = (status?: string) => {
        const s = status ?? selectedStatus;
        router.get('/admin/orders', { search, status: s }, { preserveState: true });
    };

    const updateStatus = (order: Order, status: string) => {
        setUpdatingId(order.id);
        router.put(`/admin/orders/${order.id}/status`, { status }, {
            preserveState: true,
            onFinish: () => setUpdatingId(null),
        });
    };

    return (
        <>
            <Head title="অর্ডার ম্যানেজমেন্ট — Admin" />

            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/admin" className="text-gray-400 hover:text-rose-500">ড্যাশবোর্ড</Link>
                            <span className="text-gray-300">/</span>
                            <span className="font-semibold">অর্ডার ম্যানেজমেন্ট</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Status Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                        <button
                            onClick={() => { setSelectedStatus(''); applyFilters(''); }}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                                !selectedStatus ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
                            }`}
                        >
                            সব ({Object.values(statusCounts).reduce((a, b) => a + b, 0)})
                        </button>
                        {Object.entries(STATUS).map(([key, cfg]) => (
                            <button
                                key={key}
                                onClick={() => { setSelectedStatus(key); applyFilters(key); }}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                                    selectedStatus === key ? `${cfg.bg} ${cfg.color} border-2 border-current` : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
                                }`}
                            >
                                {cfg.label} ({statusCounts[key] ?? 0})
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="flex gap-3 mb-6">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                placeholder="অর্ডার নম্বর খুঁজুন..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                        </div>
                        <button onClick={() => applyFilters()} className="bg-rose-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-rose-600 transition-colors">
                            খুঁজুন
                        </button>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                        {orders.data.length === 0 ? (
                            <div className="text-center py-20">
                                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">কোনো অর্ডার পাওয়া যায়নি।</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">অর্ডার নং</th>
                                        <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">গ্রাহক</th>
                                        <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">মোট</th>
                                        <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">পেমেন্ট</th>
                                        <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">স্ট্যাটাস</th>
                                        <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">তারিখ</th>
                                        <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">আপডেট</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.data.map(order => {
                                        const s = STATUS[order.status] ?? STATUS.pending;
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono font-semibold text-rose-600 text-sm">
                                                    {order.order_number}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="font-medium text-sm">{order.user.name}</p>
                                                    <p className="text-xs text-gray-400">{order.user.email}</p>
                                                </td>
                                                <td className="px-4 py-4 font-semibold">৳{order.total.toLocaleString()}</td>
                                                <td className="px-4 py-4 text-sm text-gray-600 uppercase">{order.payment_method}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${s.bg} ${s.color}`}>
                                                        {s.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString('bn-BD')}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={e => updateStatus(order, e.target.value)}
                                                        disabled={updatingId === order.id}
                                                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:opacity-50"
                                                    >
                                                        {Object.entries(STATUS).map(([key, cfg]) => (
                                                            <option key={key} value={key}>{cfg.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {orders.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {Array.from({ length: orders.last_page }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => router.get('/admin/orders', { page, search, status: selectedStatus }, { preserveState: true })}
                                    className={`w-10 h-10 rounded-xl font-semibold transition-colors ${
                                        page === orders.current_page ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
