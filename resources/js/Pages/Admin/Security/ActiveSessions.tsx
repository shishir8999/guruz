import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Monitor, Smartphone, Trash2, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';

interface SessionItem {
    id: string;
    user: string;
    ip_address: string;
    device: string;
    last_activity: string;
    is_current: boolean;
}

export default function ActiveSessions({ sessions = [] }: { sessions: SessionItem[] }) {

    const handleRevokeSession = (session: SessionItem) => {
        Swal.fire({
            title: 'Revoke Active Session?',
            text: `Are you sure you want to log out session on device "${session.device}" (${session.ip_address})?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Revoke',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/security/sessions/${session.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'সেশনটি রিভোক করা হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const handleRevokeAllOther = () => {
        Swal.fire({
            title: 'Revoke All Other Sessions?',
            text: 'Are you sure you want to log out all other active sessions across all devices?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Revoke All Other Sessions',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post('/admin/security/sessions/revoke-all', {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'অন্য সকল সেশন সফলভাবে বাতিল করা হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Active Sessions — Admin" />
            
            <div className="space-y-6 max-w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded">
                                Security
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Session Guard</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Active Sessions</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage and revoke active login sessions across devices and IP addresses.
                        </p>
                    </div>

                    <button 
                        type="button"
                        onClick={handleRevokeAllOther}
                        className="bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 font-bold px-4 py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                        <ShieldAlert className="w-4 h-4" /> Revoke All Other Sessions
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-4">Device</th>
                                    <th className="py-3.5 px-4">IP Address</th>
                                    <th className="py-3.5 px-4">User</th>
                                    <th className="py-3.5 px-4">Last Activity</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                                {sessions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center text-slate-400">
                                            কোনো সক্রিয় ডিভাইস সেস পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                ) : (
                                    sessions.map(session => (
                                        <tr key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                {session.device?.includes('iPhone') || session.device?.includes('Android') ? (
                                                    <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                                                ) : (
                                                    <Monitor className="w-4 h-4 text-slate-400 shrink-0" />
                                                )}
                                                {session.device}
                                                {session.is_current && (
                                                    <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                        Current Session
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 font-mono">{session.ip_address}</td>
                                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-bold">{session.user}</td>
                                            <td className="py-3.5 px-4 text-slate-500">{session.last_activity}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                {!session.is_current && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleRevokeSession(session)}
                                                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 rounded-lg transition cursor-pointer" 
                                                        title="Revoke Session"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
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
