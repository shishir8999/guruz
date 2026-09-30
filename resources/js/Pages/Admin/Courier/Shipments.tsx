import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Package, Truck, Search, Filter, Eye, RefreshCw } from 'lucide-react';

export default function Shipments({ shipments = [] }: { shipments?: any[] }) {

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'In Transit': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Returned': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        }
    };

    const initialShipments = shipments && shipments.length > 0 ? shipments : [
        { id: 1, order_id: '#ORD-9912', courier: 'Steadfast', tracking_id: 'SF-123456789', date: 'Oct 15, 2026', status: 'In Transit' },
        { id: 2, order_id: '#ORD-9913', courier: 'Pathao', tracking_id: 'PT-987654321', date: 'Oct 14, 2026', status: 'Delivered' },
        { id: 3, order_id: '#ORD-9914', courier: 'RedX', tracking_id: 'RX-555666777', date: 'Oct 12, 2026', status: 'Returned' },
        { id: 4, order_id: '#ORD-9915', courier: 'Steadfast', tracking_id: 'SF-111222333', date: 'Oct 10, 2026', status: 'Pending' }
    ];

    const [shipmentList, setShipmentList] = React.useState(initialShipments);
    const [search, setSearch] = React.useState('');
    const [filterCourier, setFilterCourier] = React.useState('');
    const [isSyncing, setIsSyncing] = React.useState(false);

    const handleSync = () => {
        setIsSyncing(true);
        // Simulate sync
        setTimeout(() => {
            setIsSyncing(false);
            Swal.fire({
                title: 'Synced!',
                text: 'Shipment statuses have been successfully updated from couriers.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }, 1500);
    };

    const filteredShipments = shipmentList.filter(s => {
        const matchesSearch = s.tracking_id.toLowerCase().includes(search.toLowerCase()) || s.order_id.toLowerCase().includes(search.toLowerCase());
        const matchesCourier = filterCourier ? s.courier.toLowerCase() === filterCourier.toLowerCase() : true;
        return matchesSearch && matchesCourier;
    });

    return (
        <>
            <Head title="Shipments" />

            <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Shipments & Deliveries</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                Track and manage all outbound courier shipments.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm shadow-sm transition ${isSyncing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Syncing...' : 'Sync Status'}
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Tracking ID or Order..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select 
                            value={filterCourier}
                            onChange={(e) => setFilterCourier(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto"
                        >
                            <option value="">All Couriers</option>
                            <option value="steadfast">Steadfast</option>
                            <option value="pathao">Pathao</option>
                            <option value="redx">RedX</option>
                        </select>
                        <button className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Courier</th>
                                    <th className="px-6 py-4">Tracking ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredShipments.length > 0 ? filteredShipments.map((shipment) => (
                                    <tr key={shipment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {shipment.order_id}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {shipment.courier}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                            {shipment.tracking_id}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {shipment.date}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(shipment.status)}`}>
                                                {shipment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Link to actual admin order detail */}
                                            <Link href={`/admin/orders`} className="p-2 inline-block hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-purple-600 transition">
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                            No shipments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        
</>
    );
}
