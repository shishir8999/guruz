import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Activity, Search, Filter, AlertCircle, CheckCircle2, Clock, Terminal } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CourierLogs({ initialLogs }: { initialLogs?: any[] }) {
    const [search, setSearch] = useState('');
    const [filterCourier, setFilterCourier] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [logs, setLogs] = useState(initialLogs && initialLogs.length > 0 ? initialLogs : [
        { id: 1, courier: 'Steadfast', endpoint: 'POST /api/v1/create_order', status: 'Success', status_code: 200, time: '2 mins ago', date: 'Oct 15, 2026 14:30', payload: '{"order_id": 1234, "recipient": "John"}' },
        { id: 2, courier: 'Pathao', endpoint: 'GET /aladdin/api/v1/cities', status: 'Failed', status_code: 401, time: '15 mins ago', date: 'Oct 15, 2026 14:17', payload: '{"error": "Unauthorized Access"}' },
        { id: 3, courier: 'RedX', endpoint: 'POST /v1/parcel', status: 'Success', status_code: 200, time: '1 hour ago', date: 'Oct 15, 2026 13:30', payload: '{"status": "Success", "tracking_id": "RX9912"}' },
        { id: 4, courier: 'Steadfast', endpoint: 'GET /api/v1/status/SF-12345', status: 'Success', status_code: 200, time: '2 hours ago', date: 'Oct 15, 2026 12:30', payload: '{"tracking_code": "SF-12345", "status": "Delivered"}' },
    ]);

    const handleClearLogs = () => {
        Swal.fire({
            title: 'Clear all logs?',
            text: "This will permanently delete all API sync logs.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, clear them!'
        }).then((result) => {
            if (result.isConfirmed) {
                setLogs([]);
                Swal.fire('Cleared!', 'All logs have been cleared.', 'success');
            }
        });
    };

    const handleViewPayload = (payload: string) => {
        Swal.fire({
            title: 'API Payload',
            html: `<pre style="text-align: left; background: #f1f5f9; padding: 10px; border-radius: 8px; font-size: 12px; overflow-x: auto;">${payload}</pre>`,
            icon: 'info',
            confirmButtonText: 'Close'
        });
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.endpoint.toLowerCase().includes(search.toLowerCase()) || log.courier.toLowerCase().includes(search.toLowerCase());
        const matchesCourier = filterCourier ? log.courier.toLowerCase() === filterCourier.toLowerCase() : true;
        const matchesStatus = filterStatus ? log.status.toLowerCase() === filterStatus.toLowerCase() : true;
        return matchesSearch && matchesCourier && matchesStatus;
    });

    return (
        <>
            <Head title="API Sync Logs" />

            <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">API Sync Logs</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                Monitor courier API requests, responses, and connection errors.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={handleClearLogs} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition">
                            <Terminal className="w-4 h-4" /> Clear Logs
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search endpoint or courier..."
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
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto"
                        >
                            <option value="">All Statuses</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold text-xs border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Courier</th>
                                    <th className="px-6 py-4">Endpoint</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">
                                            No logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-slate-400" /> {log.time}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{log.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                                {log.courier}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 rounded p-1 inline-block mt-2 border border-slate-200 dark:border-slate-800">
                                                {log.endpoint}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                    log.status === 'Success' 
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                }`}>
                                                    {log.status === 'Success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                    {log.status_code} {log.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleViewPayload(log.payload)} className="text-purple-600 hover:text-purple-700 font-bold text-xs transition">
                                                    View Payload
                                                </button>
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
