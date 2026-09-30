import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    Search, 
    Award, 
    Upload, 
    Eye,
    EyeOff,
    X,
    Image as ImageIcon
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Brand {
    id: number;
    logo_url: string | null;
    name: string;
    is_featured: boolean;
    is_active?: boolean;
    shop_id: number | null;
}

export default function BrandPage({ brands = [] }: { brands: Brand[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [localBrands, setLocalBrands] = useState<Brand[]>(brands);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    // Form states
    const [brandName, setBrandName] = useState('');
    const [isFeatured, setIsFeatured] = useState(true);
    const [isActive, setIsActive] = useState(true);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLocalBrands(brands.map(b => ({ ...b, is_active: b.is_active ?? true })));
    }, [brands]);

    const filteredBrands = localBrands.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    // Instant Status Toggle
    const handleToggleStatus = (brand: Brand) => {
        const updatedStatus = !(brand.is_active ?? true);

        // Optimistic UI update
        setLocalBrands(prev => prev.map(b => b.id === brand.id ? { ...b, is_active: updatedStatus } : b));

        router.put(`/seller/brand/${brand.id}`, {
            is_active: updatedStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Brand status set to ${updatedStatus ? 'Active' : 'Inactive'}!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            },
            onError: () => {
                // Revert
                setLocalBrands(prev => prev.map(b => b.id === brand.id ? { ...b, is_active: brand.is_active } : b));
            }
        });
    };

    // Open Add Modal
    const handleOpenAddModal = () => {
        setBrandName('');
        setIsFeatured(true);
        setIsActive(true);
        setLogoFile(null);
        setLogoPreview(null);
        setIsAddModalOpen(true);
    };

    // Submit Add Brand
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandName.trim()) return;

        const formData = new FormData();
        formData.append('name', brandName);
        formData.append('is_featured', isFeatured ? '1' : '0');
        formData.append('is_active', isActive ? '1' : '0');
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        router.post('/seller/brand', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                setBrandName('');
                setLogoFile(null);
                setLogoPreview(null);
                Swal.fire({
                    title: 'Brand Created! 🎉',
                    text: `New brand "${brandName}" added successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Open Edit Modal
    const handleOpenEditModal = (brand: Brand) => {
        setEditingBrand(brand);
        setBrandName(brand.name);
        setIsFeatured(brand.is_featured);
        setIsActive(brand.is_active ?? true);
        setLogoFile(null);
        setLogoPreview(brand.logo_url);
    };

    // Submit Edit Brand
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand || !brandName.trim()) return;

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', brandName);
        formData.append('is_featured', isFeatured ? '1' : '0');
        formData.append('is_active', isActive ? '1' : '0');
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        router.post(`/seller/brand/${editingBrand.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingBrand(null);
                setLogoFile(null);
                setLogoPreview(null);
                Swal.fire({
                    title: 'Brand Updated!',
                    text: `Brand updated to "${brandName}".`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Delete Brand
    const handleDeleteBrand = (brand: Brand) => {
        Swal.fire({
            title: 'Delete Brand?',
            text: `Are you sure you want to delete brand "${brand.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/brand/${brand.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Brand deleted successfully.',
                            icon: 'success',
                            confirmButtonColor: '#4f46e5',
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Brand List — Authorized Brands & Logos" />

            <div className="max-w-6xl mx-auto space-y-6 pb-20">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                            <Award className="w-3.5 h-3.5 text-indigo-400" />
                            Authorized Brands & Logos
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Brand List</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            আপনার প্রোডাক্টের ব্র্যান্ডসমূহ অন/অফ করতে স্ট্যাটাস বাটনে চাপ দিন।
                        </p>
                    </div>

                    <button 
                        onClick={handleOpenAddModal}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Add New Brand
                    </button>
                </div>

                {/* Controls Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input 
                            type="text"
                            placeholder="Search brand by name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                            Total Brands: {localBrands.length}
                        </span>
                        <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            Active Brands: {localBrands.filter(b => b.is_active ?? true).length}
                        </span>
                    </div>
                </div>

                {/* Brand Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 w-16">SL</th>
                                    <th className="px-6 py-4 w-28 text-center">Brand Logo</th>
                                    <th className="px-6 py-4">Brand Name</th>
                                    <th className="px-6 py-4 w-32">Type</th>
                                    <th className="px-6 py-4 w-36 text-center">Status</th>
                                    <th className="px-6 py-4 w-32 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {filteredBrands.map((brand, index) => (
                                    <tr key={brand.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                                        <td className="px-6 py-4 text-slate-500 font-mono">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mx-auto overflow-hidden shadow-xs">
                                                {brand.logo_url ? (
                                                    <img 
                                                        src={brand.logo_url} 
                                                        alt={brand.name} 
                                                        className="w-full h-full object-contain p-1" 
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
                                                        {brand.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">
                                            {brand.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {brand.shop_id === null ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                                                    Global System
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                                    Shop Custom
                                                </span>
                                            )}
                                        </td>

                                        {/* Status Toggle Pill Badge Button */}
                                        <td className="px-6 py-4 text-center">
                                            {(brand.is_active ?? true) ? (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleToggleStatus(brand)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 transition cursor-pointer shadow-2xs"
                                                    title="Click to Disable"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Active
                                                </button>
                                            ) : (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleToggleStatus(brand)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 transition cursor-pointer shadow-2xs"
                                                    title="Click to Enable"
                                                >
                                                    <EyeOff className="w-3.5 h-3.5 text-slate-400" /> Disabled
                                                </button>
                                            )}
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleOpenEditModal(brand)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition cursor-pointer"
                                                    title="Edit Brand"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteBrand(brand)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition cursor-pointer"
                                                    title="Delete Brand"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredBrands.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No brands found. Click "Add New Brand" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Add Brand Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-500" /> Add New Brand
                            </h3>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            {/* Logo Upload Box */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Brand Logo Image
                                </label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition overflow-hidden relative bg-slate-50 dark:bg-slate-950"
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                                            <span className="text-xs text-slate-500 font-medium">Click to upload brand logo</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleImageChange} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Brand Name *
                                </label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Guruz, Spark, Samsung, Apple"
                                    value={brandName}
                                    onChange={e => setBrandName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition cursor-pointer"
                                >
                                    Save Brand
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Brand Modal */}
            {editingBrand && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-500" /> Edit Brand
                            </h3>
                            <button 
                                onClick={() => setEditingBrand(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            {/* Logo Upload Box */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Brand Logo Image
                                </label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition overflow-hidden relative bg-slate-50 dark:bg-slate-950"
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                                            <span className="text-xs text-slate-500 font-medium">Click to change brand logo</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleImageChange} 
                                        className="hidden" 
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Brand Name *
                                </label>
                                <input 
                                    type="text"
                                    value={brandName}
                                    onChange={e => setBrandName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setEditingBrand(null)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                                >
                                    Update Brand
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

BrandPage.layout = (page: any) => <SellerLayout children={page} />;
