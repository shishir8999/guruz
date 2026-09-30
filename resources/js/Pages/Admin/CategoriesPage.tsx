import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, CheckCircle2, Check, FolderTree, X } from 'lucide-react';
import { useResource } from '@/hooks/useResource';

interface CategoryItem {
    id: number;
    icon: string;
    image_url?: string;
    name_en: string;
    name_bn: string;
    slug: string;
    order: number;
    active: boolean;
}

export default function CategoriesPage({ initialCategories }: { initialCategories: CategoryItem[] }) {
    const [categories, setCategories] = useState<CategoryItem[]>(initialCategories || []);

    const [showModal, setShowModal] = useState(false);
    const [nameEn, setNameEn] = useState('');
    const [nameBn, setNameBn] = useState('');
    const [slug, setSlug] = useState('');
    const [icon, setIcon] = useState('📦');
    const [successMsg, setSuccessMsg] = useState('');
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

    const { 
        form: { data, setData, errors, processing }, 
        isEditModalOpen, 
        editingItem, 
        openEditModal, 
        closeEditModal, 
        handleUpdate, 
        handleDelete: confirmDelete 
    } = useResource('admin/categories', {
        name_en: '',
        name_bn: '',
        slug: '',
        icon: '📦',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameEn) return;

        const formData = new FormData();
        formData.append('name_en', nameEn);
        if (nameBn) formData.append('name_bn', nameBn);
        if (slug) formData.append('slug', slug);
        if (icon) formData.append('icon', icon);
        if (imageFile) formData.append('image', imageFile);

        router.post('/admin/categories', formData, {
            onSuccess: () => {
                setShowModal(false);
                setNameEn('');
                setNameBn('');
                setSlug('');
                setImageFile(null);
                setSuccessMsg(`Category "${nameEn}" added successfully!`);
                setTimeout(() => setSuccessMsg(''), 4000);
            }
        });
    };

    React.useEffect(() => {
        setCategories(initialCategories || []);
    }, [initialCategories]);

    const toggleActive = (id: number) => {
        router.put(`/admin/categories/${id}/toggle`, {}, { preserveScroll: true });
    };

    const handleDelete = (id: number, name: string) => {
        confirmDelete(id);
    };

    return (
        <>

            <Head title="Categories — Admin Panel" />

            <div className="space-y-6">

                {/* Header Title + Green + New Category Button matching screenshot #2 */}
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Categories</h1>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> New Category
                    </button>
                </div>

                {/* Alert Notification */}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {successMsg}
                    </div>
                )}

                {/* Categories Table Card matching exact screenshot #2 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4 w-16">IMAGE / ICON</th>
                                    <th className="py-3 px-4">NAME (EN)</th>
                                    <th className="py-3 px-4">NAME (BN)</th>
                                    <th className="py-3 px-4">SLUG</th>
                                    <th className="py-3 px-4">ORDER</th>
                                    <th className="py-3 px-4">ACTIVE</th>
                                    <th className="py-3 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {categories.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        
                                        {/* IMAGE / ICON */}
                                        <td className="py-3 px-4">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-base overflow-hidden font-bold">
                                                {c.image_url && !brokenImages[c.id] ? (
                                                    <img 
                                                        src={c.image_url.startsWith('http') || c.image_url.startsWith('/') ? c.image_url : `/${c.image_url}`} 
                                                        alt={c.name_en} 
                                                        className="w-full h-full object-contain p-1" 
                                                        onError={() => setBrokenImages(prev => ({ ...prev, [c.id]: true }))}
                                                    />
                                                ) : (
                                                    <span>{c.icon || '📦'}</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* NAME (EN) */}
                                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{c.name_en}</td>

                                        {/* NAME (BN) */}
                                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{c.name_bn}</td>

                                        {/* SLUG */}
                                        <td className="py-3.5 px-4 font-mono text-slate-500">{c.slug}</td>

                                        {/* ORDER */}
                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">{c.order}</td>

                                        {/* ACTIVE Status Pill */}
                                        <td className="py-3.5 px-4">
                                            <button
                                                onClick={() => toggleActive(c.id)}
                                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition cursor-pointer ${
                                                    c.active
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}
                                            >
                                                {c.active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>

                                        {/* ACTIONS matching exact pencil edit and red trash icons in screenshot #2 */}
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(c)}
                                                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id, c.name_en)}
                                                    className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* New Category Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <FolderTree className="w-5 h-5 text-purple-600" /> Add Product Category
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCategory} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Icon (Emoji)</label>
                                <input
                                    type="text"
                                    value={icon}
                                    onChange={e => setIcon(e.target.value)}
                                    placeholder="e.g. 📱 or 👗"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name (English) *</label>
                                <input
                                    type="text"
                                    value={nameEn}
                                    onChange={e => setNameEn(e.target.value)}
                                    placeholder="e.g. Smart Watch"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name (Bangla)</label>
                                <input
                                    type="text"
                                    value={nameBn}
                                    onChange={e => setNameBn(e.target.value)}
                                    placeholder="e.g. স্মার্ট ওয়াচ"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    placeholder="e.g. smart-watch"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Image / Logo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setImageFile(e.target.files?.[0] || null)}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
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
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs"
                                >
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Category Modal from useResource */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-purple-600" /> Edit Category
                            </h3>
                            <button onClick={closeEditModal} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!editingItem) return;
                                const formData = new FormData();
                                formData.append('_method', 'put');
                                formData.append('name_en', data.name_en);
                                if (data.name_bn) formData.append('name_bn', data.name_bn);
                                if (data.slug) formData.append('slug', data.slug);
                                if (data.icon) formData.append('icon', data.icon);
                                if (editImageFile) formData.append('image', editImageFile);

                                router.post(`/admin/categories/${editingItem.id}`, formData, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        closeEditModal();
                                        setEditImageFile(null);
                                        setSuccessMsg('Category updated successfully!');
                                        setTimeout(() => setSuccessMsg(''), 4000);
                                    }
                                });
                            }} 
                            className="space-y-3"
                        >
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Icon (Emoji)</label>
                                <input
                                    type="text"
                                    value={data.icon}
                                    onChange={e => setData('icon', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {errors.icon && <p className="text-red-500 text-xs mt-1">{errors.icon}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name (English) *</label>
                                <input
                                    type="text"
                                    value={data.name_en}
                                    onChange={e => setData('name_en', e.target.value)}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {errors.name_en && <p className="text-red-500 text-xs mt-1">{errors.name_en}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name (Bangla)</label>
                                <input
                                    type="text"
                                    value={data.name_bn}
                                    onChange={e => setData('name_bn', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {errors.name_bn && <p className="text-red-500 text-xs mt-1">{errors.name_bn}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={data.slug}
                                    onChange={e => setData('slug', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Image / Logo (Optional)</label>
                                {editingItem?.image_url && (
                                    <div className="mb-2 flex items-center gap-2">
                                        <img src={editingItem.image_url} alt="" className="w-8 h-8 rounded-lg object-contain border p-0.5 bg-slate-50" />
                                        <span className="text-[11px] text-slate-500">Current Image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setEditImageFile(e.target.files?.[0] || null)}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Update Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        
</>
    );
}
