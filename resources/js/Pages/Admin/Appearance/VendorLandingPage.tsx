import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { RefreshCw, Search, Filter, Plus, Edit, Trash2, Layout, Users, Star, ArrowRight, ShieldCheck, X, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

interface VendorSectionItem {
    id: number;
    section_id: string;
    name: string;
    content_type: string;
    visibility: 'Visible' | 'Hidden';
    status: 'Active' | 'Draft';
    description?: string;
    position: number;
}

export default function VendorLandingPage({ sections = [], cms }: { sections: VendorSectionItem[], cms?: any }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<VendorSectionItem | null>(null);

    const [cmsForm, setCmsForm] = useState({
        hero_title: cms?.hero_title || 'আপনার পণ্য বিক্রি করুন প্রতিটি গ্রাহকের কাছে',
        hero_subtitle: cms?.hero_subtitle || 'একটি প্ল্যাটফর্ম যেখানে আপনি অনলাইনে, ইন-পারসন এবং সব জায়গায় বিক্রি করতে পারবেন। Guruz সেলার হয়ে আপনার ব্যবসা বাড়ান!',
        hero_bg_color: cms?.hero_bg_color || '#0a0a1a',
        hero_accent_color: cms?.hero_accent_color || '#10b981',
        button_text: cms?.button_text || 'সেলার হিসেবে যোগ দিন',
        logo_url: cms?.logo_url || '',
    });

    const [isSavingCms, setIsSavingCms] = useState(false);

    const handleSaveCms = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingCms(true);
        router.post('/admin/appearance/vendor-landing-page/cms', cmsForm, {
            preserveScroll: true,
            onFinish: () => setIsSavingCms(false),
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'ভেন্ডর ল্যান্ডিং পেজের কনটেন্ট ও ডিজাইন সংরক্ষিত হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        content_type: 'Text & Icons',
        visibility: 'Visible' as 'Visible' | 'Hidden',
        status: 'Active' as 'Active' | 'Draft',
        description: '',
        position: 1,
    });

    const openCreateModal = () => {
        setEditingSection(null);
        reset();
        setData({
            name: '',
            content_type: 'Text & Icons',
            visibility: 'Visible',
            status: 'Active',
            description: '',
            position: sections.length + 1,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (sec: VendorSectionItem) => {
        setEditingSection(sec);
        setData({
            name: sec.name,
            content_type: sec.content_type || 'Text & Icons',
            visibility: sec.visibility || 'Visible',
            status: sec.status || 'Active',
            description: sec.description || '',
            position: sec.position || 1,
        });
        setIsModalOpen(true);
    };

    const handleRefresh = () => {
        router.reload({
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'ভেন্ডর ল্যান্ডিং সেকশন রিফ্রেশ করা হয়েছে!',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleToggleStatus = (sec: VendorSectionItem) => {
        router.post(`/admin/appearance/vendor-landing-page/${sec.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'সেকশন স্ট্যাটাস পরিবর্তিত হয়েছে!',
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingSection) {
            router.post(`/admin/appearance/vendor-landing-page/${editingSection.id}`, {
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
                        title: 'সেকশন আপডেট সফল হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        } else {
            post('/admin/appearance/vendor-landing-page', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'নতুন ভেন্ডর ল্যান্ডিং সেকশন যুক্ত হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        }
    };

    const handleDelete = (sec: VendorSectionItem) => {
        Swal.fire({
            title: 'সেকশনটি মুছে ফেলতে চান?',
            text: `"${sec.name}" (${sec.section_id}) ল্যান্ডিং পেজ থেকে মুছে ফেলা হবে।`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/appearance/vendor-landing-page/${sec.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'সেকশন ডিলিট করা হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const getSectionIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'header block': return Layout;
            case 'feature grid': return Star;
            case 'testimonials': return Users;
            case 'steps process': return ArrowRight;
            default: return ShieldCheck;
        }
    };

    const filteredSections = sections.filter(sec => {
        const matchesSearch = sec.name.toLowerCase().includes(search.toLowerCase()) ||
                              sec.section_id.toLowerCase().includes(search.toLowerCase()) ||
                              sec.content_type.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sec.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <Head title="Vendor Landing Page — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                                Customization / Appearance
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Vendor Landing Page</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage the content sections and layout of the page where new vendors register.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleRefresh}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button 
                            type="button"
                            onClick={openCreateModal}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Add Section
                        </button>
                    </div>
                </div>

                {/* 🎨 CMS EDITOR CARD - Edit Text, Colors, Buttons & Logo */}
                <form onSubmit={handleSaveCms} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                🎨 ল্যান্ডিং পেজ কনটেন্ট ও কালার কাস্টমাইজার (CMS Editor)
                            </h2>
                            <p className="text-xs text-slate-500">ভেন্ডর ল্যান্ডিং পেজের টেক্সট, শিরোনাম, লোগো ও ব্যাকগ্রাউন্ড কালার এখান থেকে পরিবর্তন করুন।</p>
                        </div>
                        <button
                            type="submit"
                            disabled={isSavingCms}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                            {isSavingCms ? 'সংরক্ষণ হচ্ছে...' : '💾 সেভ করুন (Save Changes)'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                মূল শিরোনাম (Hero Main Title) *
                            </label>
                            <input
                                type="text"
                                value={cmsForm.hero_title}
                                onChange={e => setCmsForm({ ...cmsForm, hero_title: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                সাব-টাইটেল / বিবরণ (Hero Description) *
                            </label>
                            <input
                                type="text"
                                value={cmsForm.hero_subtitle}
                                onChange={e => setCmsForm({ ...cmsForm, hero_subtitle: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                বাটনের টেক্সট (Button Text) *
                            </label>
                            <input
                                type="text"
                                value={cmsForm.button_text}
                                onChange={e => setCmsForm({ ...cmsForm, button_text: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                লোগো URL (Logo Image Link)
                            </label>
                            <input
                                type="text"
                                value={cmsForm.logo_url}
                                onChange={e => setCmsForm({ ...cmsForm, logo_url: e.target.value })}
                                placeholder="/uploads/logo.png"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                হেডার ব্যাকগ্রাউন্ড কালার (Header Background Color)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={cmsForm.hero_bg_color}
                                    onChange={e => setCmsForm({ ...cmsForm, hero_bg_color: e.target.value })}
                                    className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200"
                                />
                                <input
                                    type="text"
                                    value={cmsForm.hero_bg_color}
                                    onChange={e => setCmsForm({ ...cmsForm, hero_bg_color: e.target.value })}
                                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                অ্যাক্সেন্ট / বাটন কালার (Accent Button Color)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={cmsForm.hero_accent_color}
                                    onChange={e => setCmsForm({ ...cmsForm, hero_accent_color: e.target.value })}
                                    className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200"
                                />
                                <input
                                    type="text"
                                    value={cmsForm.hero_accent_color}
                                    onChange={e => setCmsForm({ ...cmsForm, hero_accent_color: e.target.value })}
                                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Main Content Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
                    
                    {/* Filter and Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search sections..."
                                className="w-full pl-9 pr-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 dark:text-white transition"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-4">Section ID</th>
                                    <th className="py-3.5 px-4">Section Name</th>
                                    <th className="py-3.5 px-4">Content Type</th>
                                    <th className="py-3.5 px-4">Visibility</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {filteredSections.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-slate-400">
                                            কোনো সেকশন পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSections.map((section) => {
                                        const IconComp = getSectionIcon(section.content_type);
                                        return (
                                            <tr key={section.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition group">
                                                <td className="py-3.5 px-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{section.section_id}</td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shrink-0">
                                                            <IconComp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                        </div>
                                                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[250px]" title={section.name}>
                                                            {section.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-600 dark:text-slate-300">
                                                        {section.content_type}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500">
                                                    {section.visibility === 'Visible' ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Visible
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 flex items-center gap-1 font-bold">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Hidden
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(section)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer border ${
                                                            section.status === 'Active'
                                                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200'
                                                                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-200'
                                                        }`}
                                                        title="Click to toggle status"
                                                    >
                                                        {section.status}
                                                    </button>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            type="button"
                                                            onClick={() => openEditModal(section)}
                                                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition cursor-pointer" 
                                                            title="Edit Section"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleDelete(section)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition cursor-pointer" 
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create / Edit Section Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Layout className="w-4 h-4 text-indigo-600" />
                                {editingSection ? 'Edit Vendor Section' : 'Add Vendor Section'}
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
                                    Section Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Hero Banner Area, Why Sell With Us"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Content Type <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.content_type}
                                    onChange={e => setData('content_type', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 dark:text-white transition cursor-pointer"
                                >
                                    <option value="Header Block">Header Block</option>
                                    <option value="Feature Grid">Feature Grid</option>
                                    <option value="Testimonials">Testimonials</option>
                                    <option value="Steps Process">Steps Process</option>
                                    <option value="Text & Icons">Text & Icons</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                        Visibility
                                    </label>
                                    <select
                                        value={data.visibility}
                                        onChange={e => setData('visibility', e.target.value as any)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 dark:text-white transition cursor-pointer"
                                    >
                                        <option value="Visible">Visible</option>
                                        <option value="Hidden">Hidden</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value as any)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 dark:text-white transition cursor-pointer"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Position Order
                                </label>
                                <input
                                    type="number"
                                    value={data.position}
                                    onChange={e => setData('position', parseInt(e.target.value) || 1)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
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
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Saving...' : (editingSection ? 'Update Section' : 'Add Section')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}