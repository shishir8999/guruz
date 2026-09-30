import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { RefreshCw, Plus, Search, Filter, Edit, Trash2, Megaphone, Calendar, Users, Eye, ArrowRight, X, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

interface CampaignItem {
    id: number;
    title: string;
    banner?: string;
    status: 'live' | 'scheduled' | 'draft' | 'completed';
    audience: string;
    views: number;
    conversion: string;
    start_date?: string;
    end_date?: string;
}

interface CampaignsProps {
    campaigns?: CampaignItem[];
}

export default function Campaigns({ campaigns = [] }: CampaignsProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        status: 'draft' as 'live' | 'scheduled' | 'draft' | 'completed',
        audience: 'All Customers',
        start_date: '',
        end_date: '',
        banner: null as File | string | null,
    });

    const openCreateModal = () => {
        setEditingCampaign(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (campaign: CampaignItem) => {
        setEditingCampaign(campaign);
        setData({
            title: campaign.title,
            status: campaign.status,
            audience: campaign.audience,
            start_date: campaign.start_date || '',
            end_date: campaign.end_date || '',
            banner: campaign.banner || null,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingCampaign) {
            router.post(`/admin/marketing/campaigns/${editingCampaign.id}`, {
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
                        title: 'ক্যাম্পেইন আপডেট সফল হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        } else {
            post('/admin/marketing/campaigns', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'নতুন ক্যাম্পেইন তৈরি সফল হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        }
    };

    const handleDelete = (campaign: CampaignItem) => {
        Swal.fire({
            title: 'ক্যাম্পেইন মুছে ফেলতে চান?',
            text: `"${campaign.title}" ক্যাম্পেইনটি চিরতরে মুছে ফেলা হবে।`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/marketing/campaigns/${campaign.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'ক্যাম্পেইন ডিলিট হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const filteredCampaigns = campaigns.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                              c.audience.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'live':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Now
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Draft
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Completed
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Head title="Campaigns — Admin" />

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
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Campaigns</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage promotional events, landing pages, and marketing campaigns.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Create Campaign
                        </button>
                    </div>
                </div>

                {/* Toolbar & Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search campaigns..." 
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
                            <option value="live">Live Now</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="draft">Draft</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Campaigns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {filteredCampaigns.length === 0 ? (
                        <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                            <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">কোনো ক্যাম্পেইন পাওয়া যায়নি</h3>
                            <p className="text-xs text-slate-500 mt-1">নতুন একটি ক্যাম্পেইন যুক্ত করতে "Create Campaign" বাটনে ক্লিক করুন।</p>
                        </div>
                    ) : (
                        filteredCampaigns.map((campaign) => (
                            <div key={campaign.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                {/* Banner */}
                                <div className="relative h-36 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <img 
                                        src={campaign.banner || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600'} 
                                        alt={campaign.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    />
                                    <div className="absolute top-3 right-3">
                                        {getStatusBadge(campaign.status)}
                                    </div>
                                </div>
                                
                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                                            <Megaphone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">{campaign.title}</h3>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-0.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {campaign.start_date || 'N/A'} - {campaign.end_date || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 mb-5 flex-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                                                <Users className="w-4 h-4" /> Target
                                            </span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{campaign.audience}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                                                <Eye className="w-4 h-4" /> Views
                                            </span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{(campaign.views || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-semibold">
                                                <ArrowRight className="w-4 h-4" /> Conv. Rate
                                            </span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{campaign.conversion || '0%'}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button 
                                            type="button"
                                            onClick={() => openEditModal(campaign)}
                                            className="flex-1 bg-slate-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Edit className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => handleDelete(campaign)}
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
                                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
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
                                    Campaign Title <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="e.g. Eid Mega Sale 2026"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value as any)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition cursor-pointer"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="live">Live Now</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                        Target Audience
                                    </label>
                                    <select
                                        value={data.audience}
                                        onChange={e => setData('audience', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition cursor-pointer"
                                    >
                                        <option value="All Customers">All Customers</option>
                                        <option value="Inactive Customers">Inactive Customers</option>
                                        <option value="Premium Members">Premium Members</option>
                                        <option value="New Registered Users">New Registered Users</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Campaign Banner (File or Image URL)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData('banner', e.target.files[0]);
                                        }
                                    }}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold dark:text-white transition cursor-pointer"
                                />
                                <input
                                    type="text"
                                    placeholder="Or paste image URL..."
                                    value={typeof data.banner === 'string' ? data.banner : ''}
                                    onChange={e => setData('banner', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-orange-500 dark:text-white transition mt-2"
                                />
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
                                    {processing ? 'Saving...' : (editingCampaign ? 'Update Campaign' : 'Create Campaign')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}