import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Globe, Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';
import Swal from 'sweetalert2';

interface LanguageItem {
    id: number;
    name: string;
    code: string;
    is_default: boolean;
    status: 'Active' | 'Inactive';
}

export default function LanguageManager({ languages = [] }: { languages: LanguageItem[] }) {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLanguage, setEditingLanguage] = useState<LanguageItem | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        code: '',
        status: 'Active' as 'Active' | 'Inactive',
        is_default: false,
    });

    const openCreateModal = () => {
        setEditingLanguage(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (lang: LanguageItem) => {
        setEditingLanguage(lang);
        setData({
            name: lang.name,
            code: lang.code,
            status: lang.status || 'Active',
            is_default: !!lang.is_default,
        });
        setIsModalOpen(true);
    };

    const handleToggleStatus = (lang: LanguageItem) => {
        if (lang.is_default) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'ডিফোল্ট ভাষা ইনঅ্যাক্টিভ করা যাবে না!',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            return;
        }

        router.post(`/admin/localization/languages/${lang.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `ভাষার স্ট্যাটাস পরিবর্তিত হয়েছে!`,
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingLanguage) {
            router.post(`/admin/localization/languages/${editingLanguage.id}`, {
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
                        title: 'ভাষা সেটিংস আপডেট সফল হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        } else {
            post('/admin/localization/languages', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'নতুন ভাষা সফলভাবে যুক্ত হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        }
    };

    const handleDelete = (lang: LanguageItem) => {
        if (lang.is_default) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'ডিফোল্ট ভাষা ডিলিট করা সম্ভব নয়!',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
            return;
        }

        Swal.fire({
            title: 'ভাষা মুছে ফেলতে চান?',
            text: `"${lang.name}" (${lang.code.toUpperCase()}) ভাষাটি মুছে ফেলা হবে।`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/localization/languages/${lang.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'ভাষা ডিলিট করা হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const filteredLanguages = languages.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Head title="Localization — Admin" />
            
            <div className="space-y-6 max-w-full">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
                                Customization
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">System Languages</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Language Settings</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage multilingual content and set default platform language.
                        </p>
                    </div>

                    <button 
                        type="button"
                        onClick={openCreateModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-xs cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Language
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search languages by name or code..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold rounded-xl pl-9 pr-4 py-2 w-full focus:ring-2 focus:ring-emerald-500 dark:text-white transition"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-4">Language</th>
                                    <th className="py-3.5 px-4">Code</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                                {filteredLanguages.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center text-slate-400">
                                            কোনো ভাষা পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLanguages.map(lang => (
                                        <tr key={lang.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                                            <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                                                {lang.name}
                                                {lang.is_default && (
                                                    <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                                        Default
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-500 font-mono uppercase font-bold">{lang.code}</td>
                                            <td className="py-3.5 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(lang)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer border ${lang.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'}`}
                                                    title="Click to toggle status"
                                                >
                                                    {lang.status}
                                                </button>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        type="button"
                                                        onClick={() => openEditModal(lang)}
                                                        className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 p-2 rounded-lg transition cursor-pointer"
                                                        title="Edit Language"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {!lang.is_default && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleDelete(lang)}
                                                            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-2 rounded-lg transition cursor-pointer"
                                                            title="Delete Language"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
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

            {/* Create / Edit Language Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Globe className="w-4 h-4 text-emerald-500" />
                                {editingLanguage ? 'Edit Language' : 'Add New Language'}
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
                                    Language Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. English, Bengali, Spanish"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Language Code (ISO) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={5}
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value)}
                                    placeholder="e.g. en, bn, ar, es"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold font-mono uppercase focus:ring-2 focus:ring-emerald-500 dark:text-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={e => setData('status', e.target.value as any)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white transition cursor-pointer"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={data.is_default}
                                        onChange={e => setData('is_default', e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Set as System Default Language</div>
                                        <div className="text-[10px] text-slate-500">Default language cannot be deleted or set to inactive.</div>
                                    </div>
                                </label>
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
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Saving...' : (editingLanguage ? 'Update Language' : 'Add Language')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
