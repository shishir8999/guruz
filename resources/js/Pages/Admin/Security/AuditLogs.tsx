import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Activity, Download, Eye, Search, Filter, X, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

interface AuditLogItem {
    id: number;
    user: string;
    action: string;
    module: string;
    ip_address: string;
    date: string;
    details?: string;
}

export default function AuditLogs({ logs = [] }: { logs: AuditLogItem[] }) {
    const [search, setSearch] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

    const handleExportCSV = () => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'অডিট লগ CSV ডাউনলোড শুরু হয়েছে...',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
        });
        window.location.href = '/admin/security/audit-logs/export';
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.user.toLowerCase().includes(search.toLowerCase()) ||
                              log.action.toLowerCase().includes(search.toLowerCase()) ||
                              log.ip_address.toLowerCase().includes(search.toLowerCase()) ||
                              (log.details || '').toLowerCase().includes(search.toLowerCase());
        const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
        return matchesSearch && matchesModule;
    });

    const uniqueModules = Array.from(new Set(logs.map(l => l.module).filter(Boolean)));

    return (
        <>
            <Head title="Audit Logs — Admin" />
            
            <div className="space-y-6 max-w-full">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                                Security
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Activity Trail</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">System Audit Logs</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Comprehensive record of user actions, system security triggers, and IP history.
                        </p>
                    </div>

                    <button 
                        type="button"
                        onClick={handleExportCSV}
                        className="bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-xs cursor-pointer"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>

                {/* Toolbar Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search user, action, IP..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl pl-9 pr-4 py-2 w-full focus:ring-2 focus:ring-purple-500 dark:text-white transition"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                            value={moduleFilter}
                            onChange={(e) => setModuleFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                            <option value="all">All Modules</option>
                            {uniqueModules.map(mod => (
                                <option key={mod} value={mod}>{mod}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-4">Time</th>
                                    <th className="py-3.5 px-4">User</th>
                                    <th className="py-3.5 px-4">Action</th>
                                    <th className="py-3.5 px-4">Module</th>
                                    <th className="py-3.5 px-4">IP Address</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400">
                                            কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                                            <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap">{log.date}</td>
                                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                <Activity className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                                {log.user}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-900 dark:text-white font-bold">{log.action}</td>
                                            <td className="py-3.5 px-4">
                                                <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-md text-[10px] font-bold">
                                                    {log.module}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 font-mono">{log.ip_address}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedLog(log)}
                                                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition cursor-pointer"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
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

            {/* Audit Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-purple-600" /> Audit Log Event Details
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-xs font-semibold">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div>
                                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">User Account</div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedLog.user}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Module</div>
                                    <div className="mt-0.5">
                                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                            {selectedLog.module}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Time Stamp</div>
                                    <div className="text-slate-700 dark:text-slate-300 font-mono mt-0.5">{selectedLog.date}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">IP Address</div>
                                    <div className="text-slate-700 dark:text-slate-300 font-mono mt-0.5">{selectedLog.ip_address}</div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Action Executed
                                </label>
                                <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                                    {selectedLog.action}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Details / Audit Event Payload
                                </label>
                                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] break-all leading-relaxed">
                                    {selectedLog.details || 'No additional payload record for this action.'}
                                </div>
                            </div>

                            <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLog(null)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
