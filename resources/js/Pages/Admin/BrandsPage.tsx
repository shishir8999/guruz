import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Tag, X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface BrandItem {
    id: number;
    name: string;
    slug?: string;
    logo_url?: string;
    logo?: string;
    is_featured?: boolean;
    active?: boolean;
}

export default function BrandsPage({ brands: initialBrands = [] }: { brands?: BrandItem[] }) {
    const brands: BrandItem[] = initialBrands;

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [addLogoPreview, setAddLogoPreview] = useState<string | null>(null);
    const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
    const [isFeatured, setIsFeatured] = useState<boolean>(true);
    const [processing, setProcessing] = useState<boolean>(false);

    const getLogoUrl = (url?: string | null) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
        if (url.startsWith('/storage/') || url.startsWith('/uploads/') || url.startsWith('/images/')) return url;
        if (url.startsWith('storage/')) return `/${url}`;
        if (url.startsWith('brands/')) return `/storage/${url}`;
        return url.startsWith('/') ? url : `/${url}`;
    };

    // Handle ESC key to close modals
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowAddModal(false);
                setEditingBrand(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const resetForm = () => {
        setName('');
        setSlug('');
        setLogoFile(null);
        setAddLogoPreview(null);
        setEditLogoPreview(null);
        setIsFeatured(true);
        setProcessing(false);
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (brand: BrandItem) => {
        setEditingBrand(brand);
        setName(brand.name || '');
        setSlug(brand.slug || '');
        setLogoFile(null);
        setAddLogoPreview(null);
        setEditLogoPreview(brand.logo_url || brand.logo || null);
        setIsFeatured(brand.is_featured ?? brand.active ?? true);
        setProcessing(false);
    };

    const handleAddLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setLogoFile(file);
        if (file) {
            setAddLogoPreview(URL.createObjectURL(file));
        } else {
            setAddLogoPreview(null);
        }
    };

    const handleEditLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setLogoFile(file);
        if (file) {
            setEditLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleAddBrand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || processing) return;

        setProcessing(true);
        const formData = new FormData();
        formData.append('name', name.trim());
        if (slug.trim()) formData.append('slug', slug.trim());
        if (logoFile) formData.append('logo', logoFile);
        formData.append('is_featured', isFeatured ? '1' : '0');

        router.post('/admin/brands', formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowAddModal(false);
                resetForm();
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'ব্র্যান্ড সফলভাবে যোগ হয়েছে!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            },
            onError: () => {
                setProcessing(false);
                Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'ব্র্যান্ড যোগ ব্যর্থ হয়েছে।', showConfirmButton: false, timer: 3000 });
            },
        });
    };

    const handleUpdateBrand = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand || !name.trim() || processing) return;

        setProcessing(true);
        const formData = new FormData();
        formData.append('_method', 'put');
        formData.append('name', name.trim());
        if (slug.trim()) formData.append('slug', slug.trim());
        if (logoFile) formData.append('logo', logoFile);
        formData.append('is_featured', isFeatured ? '1' : '0');

        router.post(`/admin/brands/${editingBrand.id}`, formData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setEditingBrand(null);
                resetForm();
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'ব্র্যান্ড সফলভাবে আপডেট হয়েছে!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            },
            onError: () => {
                setProcessing(false);
                Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'ব্র্যান্ড আপডেট ব্যর্থ হয়েছে।', showConfirmButton: false, timer: 3000 });
            },
        });
    };

    const toggleActive = (id: number) => {
        router.put(`/admin/brands/${id}`, { _toggle: true }, { preserveScroll: true });
    };

    const handleDelete = (brand: BrandItem) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Are you sure you want to delete the brand "${brand.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/brands/${brand.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Brand deleted successfully!', showConfirmButton: false, timer: 3000, timerProgressBar: true });
                    },
                });
            }
        });
    };

    return (
        <>
            <Head title="Brands — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Brands</h1>
                        <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                            Manage product brands
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> <span>New Brand</span>
                    </button>
                </div>

                {/* Brands Table Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4 w-16">LOGO</th>
                                    <th className="py-3 px-4">NAME</th>
                                    <th className="py-3 px-4">SLUG</th>
                                    <th className="py-3 px-4">ACTIVE</th>
                                    <th className="py-3 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {brands.map(b => (
                                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        <td className="py-3 px-4">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-400 overflow-hidden notranslate" translate="no">
                                                {b.logo_url || b.logo ? (
                                                    <img 
                                                        src={getLogoUrl(b.logo_url || b.logo) || ''} 
                                                        alt={b.name} 
                                                        className="w-full h-full object-contain p-1" 
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            if (e.currentTarget.parentElement) {
                                                                e.currentTarget.parentElement.innerHTML = '<span class="text-sm select-none">🏷️</span>';
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-sm select-none">🏷️</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white notranslate" translate="no"><span>{b.name}</span></td>
                                        <td className="py-3.5 px-4 font-mono text-slate-500 notranslate" translate="no"><span>{b.slug}</span></td>
                                        <td className="py-3.5 px-4">
                                            <button
                                                type="button"
                                                onClick={() => toggleActive(b.id)}
                                                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition cursor-pointer ${
                                                    (b.is_featured ?? b.is_active ?? b.active) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                <span>{(b.is_featured ?? b.is_active ?? b.active) ? 'Active' : 'Inactive'}</span>
                                            </button>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(b)}
                                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer border border-indigo-200 dark:border-indigo-900/50"
                                                >
                                                    <Edit2 className="w-3 h-3" /> <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(b)}
                                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 text-xs font-bold px-3 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900/50"
                                                >
                                                    <Trash2 className="w-3 h-3" /> <span>Delete</span>
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

            {/* New Brand Modal */}
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
                                <Tag className="w-5 h-5 text-purple-600" />
                                <span>Add Product Brand</span>
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => setShowAddModal(false)} 
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddBrand} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => {
                                        setName(e.target.value);
                                        if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-')) {
                                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                                        }
                                    }}
                                    placeholder="e.g. Digipod"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Slug</label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    placeholder="e.g. digipod"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Logo Image</label>
                                {addLogoPreview && (
                                    <div className="mb-2 flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-1 shrink-0">
                                            <img src={addLogoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{logoFile?.name}</p>
                                            <p className="text-[10px] text-slate-400">{logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : ''}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLogoFile(null);
                                                setAddLogoPreview(null);
                                            }}
                                            className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                            title="বাতিল করুন"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAddLogoChange}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-950/60 dark:file:text-purple-400 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={isFeatured} 
                                        onChange={e => setIsFeatured(e.target.checked)} 
                                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500" 
                                    />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                                </label>
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                                >
                                    <span>Cancel</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Brand</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Brand Modal */}
            {editingBrand && (
                <div 
                    onClick={() => setEditingBrand(null)}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
                    >
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Tag className="w-5 h-5 text-purple-600" />
                                <span>Edit Product Brand</span>
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => setEditingBrand(null)} 
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateBrand} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Digipod"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Slug</label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    placeholder="e.g. digipod"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Brand Logo Image</label>
                                {editLogoPreview && (
                                    <div className="mb-2 flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-1 shrink-0">
                                            <img 
                                                src={editLogoPreview.startsWith('blob:') ? editLogoPreview : (getLogoUrl(editLogoPreview) || '')} 
                                                alt="Current Logo" 
                                                className="w-full h-full object-contain" 
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                                {logoFile ? logoFile.name : 'বর্তমান লোগো'}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB (নতুন ছবি)` : 'নতুন ছবি সিলেক্ট করলে এটি পরিবর্তিত হবে'}
                                            </p>
                                        </div>
                                        {logoFile && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setLogoFile(null);
                                                    setEditLogoPreview(editingBrand?.logo_url || editingBrand?.logo || null);
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                                title="নতুন ছবি বাতিল করুন"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEditLogoChange}
                                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-950/60 dark:file:text-purple-400 cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={isFeatured} 
                                        onChange={e => setIsFeatured(e.target.checked)} 
                                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500" 
                                    />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                                </label>
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingBrand(null)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                                >
                                    <span>Cancel</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Brand</span>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
