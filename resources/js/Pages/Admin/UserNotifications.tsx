import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Bell, Plus, Power, PowerOff, Trash2, CheckCircle2, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface NotificationItem {
    id: number;
    title: string;
    message: string;
    active: boolean;
    created_at: string;
}

export default function UserNotifications({ notifications, flash }: any) {
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newMessage, setNewMessage] = useState('');

    const totalCount = notifications.length;
    const activeCount = notifications.filter(n => n.active).length;
    const inactiveCount = notifications.filter(n => !n.active).length;

    const filteredList = notifications.filter(n => {
        if (filter === 'active') return n.active;
        if (filter === 'inactive') return !n.active;
        return true;
    });

    const handleEnableAll = () => {
        router.post(route('admin.users.notifications.toggle-all'), { active: true });
    };

    const handleDisableAll = () => {
        router.post(route('admin.users.notifications.toggle-all'), { active: false });
    };

    const toggleNotification = (id: number) => {
        router.put(route('admin.users.notifications.toggle', id));
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Delete Notification?',
            text: 'Are you sure you want to delete this notification?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'No, Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                router.delete(route('admin.users.notifications.destroy', id), {
                    onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Notification deleted.', showConfirmButton: false, timer: 3000, timerProgressBar: true }),
                });
            }
        });
    };

    const handleCreateNotification = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newMessage) return;

        router.post(route('admin.users.notifications.store'), {
            title: newTitle,
            message: newMessage
        }, {
            onSuccess: () => {
                setShowModal(false);
                setNewTitle('');
                setNewMessage('');
            }
        });
    };

    return (
        <>

            <Head title="User Notifications — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card matching screenshot */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Notifications</h1>
                        <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                            Send system notifications and offers. Toggle any notification On/Off anytime.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={handleEnableAll}
                            className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Power className="w-3.5 h-3.5" /> Enable all
                        </button>

                        <button
                            onClick={handleDisableAll}
                            className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <PowerOff className="w-3.5 h-3.5" /> Disable all
                        </button>

                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Add New
                        </button>
                    </div>
                </div>

                {/* Success Message Alert */}
                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {flash.success}
                    </div>
                )}

                {/* Stats & Filters Bar matching screenshot */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                            <Bell className="w-4 h-4 text-slate-400" /> Total: <strong className="text-slate-900 dark:text-white font-black">{totalCount}</strong>
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-600">
                            <Power className="w-3.5 h-3.5" /> On: <strong className="font-black">{activeCount}</strong>
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-500">
                            <PowerOff className="w-3.5 h-3.5" /> Off: <strong className="font-black">{inactiveCount}</strong>
                        </span>
                    </div>

                    {/* Filter Pills matching screenshot */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${filter === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${filter === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setFilter('inactive')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${filter === 'inactive' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                        >
                            Inactive
                        </button>
                    </div>
                </div>

                {/* Notifications List Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    {filteredList.length === 0 ? (
                        <div className="text-center py-16 text-slate-400 text-xs font-semibold">
                            No notifications found. Click "+ Add New" to broadcast a notification.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredList.map(item => (
                                <div key={item.id} className="py-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h3>
                                            <span className="text-[10px] font-mono text-slate-400">{item.created_at}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">{item.message}</p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={() => toggleNotification(item.id)}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${item.active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${item.active ? 'translate-x-5' : ''}`} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition"
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

            {/* Add Notification Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Bell className="w-5 h-5 text-purple-600" /> Send System Notification
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateNotification} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notification Title</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="Title (e.g. Special Discount)"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message Content</label>
                                <textarea
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Enter your message to all users..."
                                    rows={3}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs"
                                >
                                    Broadcast Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        
</>
    );
}
