import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Zap, Trash2, Edit2, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface CampaignItem {
    id: number;
    title_en: string;
    title_bn?: string;
    ends_at?: string;
    end_date?: string;
    product_count?: number;
    is_active?: boolean;
    active?: boolean;
}

export default function FlashSalesPage({ initialCampaigns = [], campaigns: campaignsProp = [] }: { initialCampaigns?: CampaignItem[], campaigns?: CampaignItem[] }) {
    const campaigns: CampaignItem[] = (initialCampaigns.length > 0 ? initialCampaigns : campaignsProp);

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null);

    const [titleEn, setTitleEn] = useState('');
    const [titleBn, setTitleBn] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowAddModal(false);
                setEditingCampaign(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const resetForm = () => {
        setTitleEn('');
        setTitleBn('');
        setEndDate('');
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (c: CampaignItem) => {
        setEditingCampaign(c);
        setTitleEn(c.title_en);
        setTitleBn(c.title_bn);
        setEndDate('');
    };

    const handleAddCampaign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!titleEn.trim()) return;
        router.post('/admin/flash-sales', {
            title_en: titleEn.trim(),
            title_bn: titleBn.trim() || titleEn.trim(),
            ends_at: endDate || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddModal(false);
                resetForm();
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Flash Sale "${titleEn}" created!`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
            },
            onError: () => Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to create flash sale.', showConfirmButton: false, timer: 3000 }),
        });
    };

    const handleUpdateCampaign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCampaign || !titleEn.trim()) return;
        router.post(`/admin/flash-sales/${editingCampaign.id}/toggle`, {
            title_en: titleEn.trim(),
            title_bn: titleBn.trim() || titleEn.trim(),
            ends_at: endDate || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCampaign(null);
                resetForm();
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Flash sale updated successfully!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            },
        });
    };

    const toggleActive = (id: number) => {
        router.post(`/admin/flash-sales/${id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Campaign status updated!', showConfirmButton: false, timer: 2000 }),
        });
    };

    const handleDelete = (campaign: CampaignItem) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Are you sure you want to delete the campaign "${campaign.title_en}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/flash-sales/${campaign.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Campaign deleted successfully!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                    },
                });
            }
        });
    };

    return (
        <>
            <Head title="Flash Sales — Admin Panel" />

            <div className="space-y-6">

                {/* Header Title + Green + New Campaign Button */}
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Flash Sales</h1>

                    <button
                        onClick={openAddModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> New Campaign
                    </button>
                </div>

                {/* Flash Sales Campaign List Cards */}
                <div className="space-y-4">
                    {campaigns.map(c => (
                        <div
                            key={c.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-amber-600">
                                    <Zap className="w-6 h-6 fill-amber-400 text-amber-500" />
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                        {c.title_en}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-500">{c.title_bn}</p>
                                    <p className="text-[11px] text-slate-400 font-mono pt-1">
                                        Ends: {c.end_date} - {c.product_count} product(s)
                                    </p>
                                </div>
                            </div>

                            {/* Active checkbox + Edit & Delete buttons */}
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={c.active}
                                        onChange={() => toggleActive(c.id)}
                                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                                    />
                                    Active
                                </label>

                                <button
                                    onClick={() => openEditModal(c)}
                                    className="text-indigo-600 hover:text-indigo-800 p-1.5 hover:bg-indigo-50 rounded-lg transition"
                                    title="Edit Campaign"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => handleDelete(c)}
                                    className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition"
                                    title="Delete Campaign"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-slate-400 font-medium">
                    To feature a product in flash sales, edit the product from the Products page and enable the "Flash sale" flag.
                </p>

            </div>

            {/* New Campaign Modal */}
            {showAddModal && (
                <div 
                    onClick={() => setShowAddModal(false)}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
                    >
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500 fill-amber-400" /> Create Flash Sale Campaign
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCampaign} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Campaign Title (English)</label>
                                <input
                                    type="text"
                                    value={titleEn}
                                    onChange={e => setTitleEn(e.target.value)}
                                    placeholder="e.g. Flash Sale 🔥"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Campaign Title (Bangla)</label>
                                <input
                                    type="text"
                                    value={titleBn}
                                    onChange={e => setTitleBn(e.target.value)}
                                    placeholder="e.g. ফ্ল্যাশ সেল 🔥"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Campaign End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
                                >
                                    Create Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Campaign Modal */}
            {editingCampaign && (
                <div 
                    onClick={() => setEditingCampaign(null)}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
                    >
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-600" /> Edit Flash Sale Campaign
                            </h3>
                            <button onClick={() => setEditingCampaign(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCampaign} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Campaign Title (English)</label>
                                <input
                                    type="text"
                                    value={titleEn}
                                    onChange={e => setTitleEn(e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Campaign Title (Bangla)</label>
                                <input
                                    type="text"
                                    value={titleBn}
                                    onChange={e => setTitleBn(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New End Date & Time (Optional)</label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingCampaign(null)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
