import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { RefreshCw, Plus, Search, Filter, Edit, Trash2, Megaphone, Calendar, Eye, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface NoticeItem {
    id: number;
    title: string;
    content?: string;
    type: string;
    target: string;
    status: 'published' | 'scheduled' | 'draft';
    views: number;
    published_at?: string;
}

interface SellerNoticesProps {
    notices?: NoticeItem[];
}

export default function SellerNotices({ notices = [] }: SellerNoticesProps) {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        title: '',
        content: '',
        type: 'Policy Update',
        target: 'All Sellers',
        status: 'published' as 'published' | 'scheduled' | 'draft',
    });

    const openCreateModal = () => {
        setEditingNotice(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (notice: NoticeItem) => {
        setEditingNotice(notice);
        setData({
            title: notice.title,
            content: notice.content || '',
            type: notice.type || 'Policy Update',
            target: notice.target || 'All Sellers',
            status: notice.status || 'published',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingNotice) {
            router.post(`/admin/marketing/seller-notices/${editingNotice.id}`, {
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
                        title: 'নোটিশ আপডেট সফল হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        } else {
            post('/admin/marketing/seller-notices', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'নতুন নোটিশ তৈরি সফল হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        }
    };

    const handleDelete = (notice: NoticeItem) => {
        Swal.fire({
            title: 'নোটিশ মুছে ফেলতে চান?',
            text: `"${notice.title}" নোটিশটি চিরতরে মুছে ফেলা হবে।`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/marketing/seller-notices/${notice.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'নোটিশ ডিলিট হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const filteredNotices = notices.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
                              n.target.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || n.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getTypeColor = (type: string) => {
        switch(type) {
            case 'Policy Update': return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800';
            case 'Promotion': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
            case 'System Alert': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
            default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
        }
    };

    return (
        <>
            <Head title="Seller Notices — Admin" />

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
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Seller Notices</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage announcements and notices sent to vendors' dashboards.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.get('/admin/marketing/seller-notices')}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Create Notice
                        </button>
                    </div>
                </div>

                {/* Toolbar & Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search notices..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl pl-9 pr-4 py-2 w-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:text-white transition"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                            <option value="all">All Notice Types</option>
                            <option value="Policy Update">Policy Update</option>
                            <option value="Promotion">Promotion</option>
                            <option value="System Alert">System Alert</option>
                            <option value="Guideline">Guideline</option>
                        </select>
                    </div>
                </div>

                {/* Notices Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notice Title</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Group</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Publish Date</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Views</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-4 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredNotices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                                            <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p className="font-bold text-sm">কোনো সেলার নোটিশ পাওয়া যায়নি</p>
                                            <p className="text-xs mt-1">নতুন একটি নোটিশ তৈরি করতে "Create Notice" বাটনে ক্লিক করুন।</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredNotices.map((notice) => (
                                        <tr key={notice.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-5 py-4 align-middle">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg mt-0.5 shrink-0">
                                                        <Megaphone className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{notice.title}</div>
                                                        <div className={`mt-1 inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getTypeColor(notice.type)}`}>
                                                            {notice.type}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {notice.target}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                {notice.published_at ? (
                                                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {notice.published_at}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-semibold text-slate-400 italic">Not set</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    <Eye className="w-4 h-4 text-slate-400" />
                                                    {notice.views || 0}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 align-middle">
                                                {notice.status === 'published' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        Published
                                                    </span>
                                                )}
                                                {notice.status === 'scheduled' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                        Scheduled
                                                    </span>
                                                )}
                                                {notice.status === 'draft' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => openEditModal(notice)}
                                                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition cursor-pointer"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDelete(notice)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition cursor-pointer"
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

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white">
                                {editingNotice ? 'Edit Seller Notice' : 'Create Seller Notice'}
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
                                    Notice Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="e.g. Important: Changes to Commission Rates"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                        Notice Type
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition cursor-pointer"
                                    >
                                        <option value="Policy Update">Policy Update</option>
                                        <option value="Promotion">Promotion</option>
                                        <option value="System Alert">System Alert</option>
                                        <option value="Guideline">Guideline</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                        Target Group
                                    </label>
                                    <select
                                        value={data.target}
                                        onChange={e => setData('target', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition cursor-pointer"
                                    >
                                        <option value="All Sellers">All Sellers</option>
                                        <option value="Top Rated Sellers">Top Rated Sellers</option>
                                        <option value="New Sellers">New Sellers</option>
                                    </select>
                                </div>
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
                                    <option value="published">Published</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Notice Content / Details
                                </label>
                                <textarea
                                    rows={4}
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    placeholder="Write full notice details for vendors..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition"
                                ></textarea>
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
                                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Saving...' : (editingNotice ? 'Update Notice' : 'Create Notice')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}