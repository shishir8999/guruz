import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Webhook as WebhookIcon, Plus, Edit2, Trash2, X, Check, Search, Globe, Activity } from 'lucide-react';
import Swal from 'sweetalert2';

interface WebhookItem {
    id: number;
    name: string;
    url: string;
    events: string[];
    status: 'Active' | 'Inactive';
    last_triggered?: string;
}

const AVAILABLE_EVENTS = [
    'order.created',
    'order.updated',
    'order.cancelled',
    'product.created',
    'user.registered',
    'vendor.payout',
];

export default function Webhooks({ webhooks = [] }: { webhooks: WebhookItem[] }) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<WebhookItem | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        url: '',
        events: ['order.created'],
        status: 'Active' as 'Active' | 'Inactive',
    });

    const openCreateModal = () => {
        setEditingWebhook(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (hook: WebhookItem) => {
        setEditingWebhook(hook);
        setData({
            name: hook.name,
            url: hook.url,
            events: hook.events || ['order.created'],
            status: hook.status || 'Active',
        });
        setIsModalOpen(true);
    };

    const toggleEvent = (event: string) => {
        if (data.events.includes(event)) {
            setData('events', data.events.filter(e => e !== event));
        } else {
            setData('events', [...data.events, event]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingWebhook) {
            router.post(`/admin/security/webhooks/${editingWebhook.id}`, {
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
                        title: 'ওয়েবহুক আপডেট সফল হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        } else {
            post('/admin/security/webhooks', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'নতুন ওয়েবহুক তৈরি সফল হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        }
    };

    const handleDelete = (hook: WebhookItem) => {
        Swal.fire({
            title: 'Delete Webhook Endpoint?',
            text: `Are you sure you want to delete "${hook.name}" (${hook.url})?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/security/webhooks/${hook.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'ওয়েবহুক ডিলিট করা হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const filteredWebhooks = webhooks.filter(w => 
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.url.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Head title="Webhooks — Admin" />
            
            <div className="space-y-6 max-w-full">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
                                Security
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Webhook Endpoints</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage automated real-time event webhooks for external servers and microservices.
                        </p>
                    </div>

                    <button 
                        type="button"
                        onClick={openCreateModal}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-xs cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Webhook
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search webhooks by name or URL..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl pl-9 pr-4 py-2 w-full focus:ring-2 focus:ring-purple-500 dark:text-white transition"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-4">Name</th>
                                    <th className="py-3.5 px-4">URL</th>
                                    <th className="py-3.5 px-4">Subscribed Events</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Last Triggered</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                                {filteredWebhooks.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400">
                                            কোনো ওয়েবহুক এন্ডপয়েন্ট পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                ) : (
                                    filteredWebhooks.map(hook => (
                                        <tr key={hook.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                <WebhookIcon className="w-4 h-4 text-purple-500 shrink-0" />
                                                {hook.name}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] max-w-[220px] truncate" title={hook.url}>
                                                {hook.url}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500">
                                                <div className="flex gap-1 flex-wrap">
                                                    {(hook.events || []).map((ev: string) => (
                                                        <span key={ev} className="inline-block bg-slate-100 dark:bg-slate-800 text-[10px] px-2 py-0.5 rounded-lg font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                            {ev}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${hook.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'}`}>
                                                    {hook.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500">{hook.last_triggered || 'Never'}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => openEditModal(hook)}
                                                        className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 p-2 rounded-lg transition cursor-pointer"
                                                        title="Edit Webhook"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDelete(hook)}
                                                        className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 rounded-lg transition cursor-pointer"
                                                        title="Delete Webhook"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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

            {/* Create / Edit Webhook Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <WebhookIcon className="w-4 h-4 text-purple-600" />
                                {editingWebhook ? 'Edit Webhook Endpoint' : 'Add Webhook Endpoint'}
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
                                    Webhook Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Order Notification Service"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500 dark:text-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Payload URL <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={data.url}
                                    onChange={e => setData('url', e.target.value)}
                                    placeholder="https://api.example.com/webhook"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold font-mono text-xs focus:ring-2 focus:ring-purple-500 dark:text-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                                    Subscribe Events
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_EVENTS.map(event => (
                                        <button
                                            type="button"
                                            key={event}
                                            onClick={() => toggleEvent(event)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${data.events.includes(event) ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                                        >
                                            {data.events.includes(event) && <Check className="w-3.5 h-3.5" />}
                                            {event}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value as any)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500 dark:text-white transition cursor-pointer"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

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
                                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Saving...' : (editingWebhook ? 'Update Webhook' : 'Save Webhook')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
