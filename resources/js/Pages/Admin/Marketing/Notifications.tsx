import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { RefreshCw, Plus, Search, Filter, Edit, Trash2, Bell, Calendar, Send, Users, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface NotificationItem {
    id: number;
    title: string;
    message: string;
    target: string;
    status: 'sent' | 'active' | 'scheduled' | 'draft';
    sent_count: number;
    scheduled_for?: string;
}

interface NotificationsProps {
    notifications?: NotificationItem[];
}

export default function Notifications({ notifications = [] }: NotificationsProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState<NotificationItem | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        title: '',
        message: '',
        target: 'All App Users',
        status: 'draft' as 'sent' | 'active' | 'scheduled' | 'draft',
        scheduled_for: '',
    });

    const openCreateModal = () => {
        setEditingNotification(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (notification: NotificationItem) => {
        setEditingNotification(notification);
        setData({
            title: notification.title,
            message: notification.message,
            target: notification.target || 'All App Users',
            status: notification.status || 'draft',
            scheduled_for: notification.scheduled_for || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingNotification) {
            router.post(`/admin/marketing/notifications/${editingNotification.id}`, {
                ...data,
                _method: 'POST'
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'নোটিফিকেশন আপডেট সফল হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        } else {
            post('/admin/marketing/notifications', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'নতুন পুশ নোটিফিকেশন তৈরি সফল হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        }
    };

    const handleDelete = (notification: NotificationItem) => {
        Swal.fire({
            title: 'নোটিফিকেশন মুছে ফেলতে চান?',
            text: `"${notification.title}" নোটিফিকেশনটি চিরতরে মুছে ফেলা হবে।`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/marketing/notifications/${notification.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'নোটিফিকেশন ডিলিট হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                              n.message.toLowerCase().includes(search.toLowerCase()) ||
                              n.target.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Trigger
                    </span>
                );
            case 'sent':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        Sent
                    </span>
                );
            case 'scheduled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Scheduled
                    </span>
                );
            case 'draft':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Draft
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Head title="Notifications — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded">
                                Marketing
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Push Notifications</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage and schedule marketing push notifications for customers.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.get('/admin/marketing/notifications')}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> New Notification
                        </button>
                    </div>
                </div>

                {/* Toolbar & Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search notifications..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl pl-9 pr-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:text-white transition"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="sent">Sent</option>
                            <option value="active">Active Trigger</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </div>

                {/* Notifications Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredNotifications.length === 0 ? (
                        <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">কোনো নোটিফিকেশন পাওয়া যায়নি</h3>
                            <p className="text-xs text-slate-500 mt-1">নতুন একটি নোটিফিকেশন পাঠাতে "New Notification" বাটনে ক্লিক করুন।</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div key={notification.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl mt-0.5 shrink-0">
                                                <Bell className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-slate-900 dark:text-white">{notification.title}</h3>
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="shrink-0 ml-3">
                                            {getStatusBadge(notification.status)}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" /> Target Audience
                                            </div>
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{notification.target}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                <Send className="w-3.5 h-3.5" /> Sent Count
                                            </div>
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{(notification.sent_count || 0).toLocaleString()}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" /> Scheduled / Sent Date
                                            </div>
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                {notification.scheduled_for || <span className="italic text-slate-400">Not Scheduled</span>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button 
                                            type="button"
                                            onClick={() => openEditModal(notification)}
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleDelete(notification)}
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white">
                                {editingNotification ? 'Edit Push Notification' : 'New Push Notification'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Notification Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="e.g. Flash Sale Starts in 1 Hour!"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Message Body <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    value={data.message}
                                    onChange={e => setData('message', e.target.value)}
                                    placeholder="Write your push notification message..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                        Target Audience
                                    </label>
                                    <select
                                        value={data.target}
                                        onChange={e => setData('target', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition cursor-pointer"
                                    >
                                        <option value="All App Users">All App Users</option>
                                        <option value="Cart Abandoners">Cart Abandoners</option>
                                        <option value="Premium Members">Premium Members</option>
                                        <option value="Outdated App Versions">Outdated App Versions</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value as any)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition cursor-pointer"
                                    >
                                        <option value="sent">Send Immediately (Sent)</option>
                                        <option value="active">Active Trigger</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            {data.status === 'scheduled' && (
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                        Schedule Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.scheduled_for}
                                        onChange={e => setData('scheduled_for', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Saving...' : (editingNotification ? 'Update Notification' : 'Send / Create Notification')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}