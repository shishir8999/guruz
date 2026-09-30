import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, Plus, Edit2, Trash2, X, Gift } from 'lucide-react';
import Swal from 'sweetalert2';

interface ProductItem {
    id: number;
    image?: string;
    primary_image_url?: string;
    name: string;
    sub_name?: string;
    slug?: string;
    price: number | string;
    stock?: number;
    stock_quantity?: number;
    status?: 'published' | 'draft';
    is_active?: boolean;
    is_featured?: boolean;
    is_flash_sale?: boolean;
    flags?: string;
    wishlist_count?: number;
}

interface AdminProductsProps {
    products?: {
        data: ProductItem[];
    };
    filters?: {
        search?: string;
    };
    guruz_special_product_ids?: number[];
}

export default function AdminProducts({ products, filters, guruz_special_product_ids = [] }: AdminProductsProps) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const productList: ProductItem[] = products?.data ?? [];

    const filteredProducts = productList.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sub_name || '').toLowerCase().includes(search.toLowerCase())
    );

    const toggleStatus = (id: number) => {
        router.post(`/admin/products/${id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Product status toggled!', showConfirmButton: false, timer: 2000, timerProgressBar: true });
            },
        });
    };

    const toggleGuruzSpecial = (id: number) => {
        router.post(`/admin/products/${id}/toggle-guruz-special`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'গুরুজ স্পেশাল স্ট্যাটাস আপডেট হয়েছে!', showConfirmButton: false, timer: 2000, timerProgressBar: true });
            }
        });
    };

    const handleDeleteProduct = (id: number, name: string) => {
        Swal.fire({
            title: 'Delete Product?',
            text: `Are you sure you want to delete "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'No, Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                router.delete(`/admin/products/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `"${name}" deleted.`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
                    },
                });
            }
        });
    };

    const openEdit = (p: ProductItem) => {
        router.get(`/admin/products/${p.id}/edit`);
    };

    return (
        <>

            <Head title="Products — Admin Panel" />

            <div className="space-y-6">

                {/* Top Header + Search Bar + Green + New Product Button matching screenshot */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Products</h1>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        <button
                            onClick={() => router.get('/admin/products/create')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" /> New Product
                        </button>
                    </div>
                </div>

                {/* Product List Table Card matching exact screenshot */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4 w-16">IMAGE</th>
                                    <th className="py-3 px-4">NAME</th>
                                    <th className="py-3 px-4">PRICE</th>
                                    <th className="py-3 px-4">STOCK</th>
                                    <th className="py-3 px-4">WISHLISTS</th>
                                    <th className="py-3 px-4">STATUS</th>
                                    <th className="py-3 px-4">FLAGS</th>
                                    <th className="py-3 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center text-slate-400 text-xs font-semibold">
                                            No products found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map(p => {
                                        const productImage = p.primary_image_url || p.image;
                                        const productStock = p.stock_quantity ?? p.stock ?? 0;
                                        const productStatus = p.is_active !== undefined ? (p.is_active ? 'published' : 'draft') : p.status;
                                        const productSubName = p.sub_name || p.slug || '';
                                        
                                        return (
                                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            
                                            {/* IMAGE */}
                                            <td className="py-3 px-4">
                                                {productImage ? (
                                                    <img
                                                        src={productImage}
                                                        alt={p.name}
                                                        className="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-xs"
                                                        onError={(e) => {
                                                            const target = e.currentTarget;
                                                            target.onerror = null;
                                                            target.src = 'https://placehold.co/100x100?text=No+Image';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs">
                                                        📦
                                                    </div>
                                                )}
                                            </td>

                                            {/* NAME */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-slate-900 dark:text-white text-xs">
                                                    {p.name}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                    {productSubName}
                                                </div>
                                            </td>

                                            {/* PRICE */}
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono">
                                                ৳{Number(p.price).toLocaleString()}
                                            </td>

                                            {/* STOCK */}
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                                                {productStock}
                                            </td>

                                            {/* WISHLIST COUNT */}
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                                                {p.wishlist_count ?? 0}
                                            </td>

                                            {/* STATUS pill matching green published pill in screenshot */}
                                            <td className="py-3.5 px-4">
                                                <button
                                                    onClick={() => toggleStatus(p.id)}
                                                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition cursor-pointer ${
                                                        productStatus === 'published'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}
                                                >
                                                    {productStatus}
                                                </button>
                                            </td>

                                            {/* FLAGS */}
                                            <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {guruz_special_product_ids.includes(p.id) && (
                                                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-2xs">
                                                            🎁 Special
                                                        </span>
                                                    )}
                                                    {p.is_featured && (
                                                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                            ⭐ Featured
                                                        </span>
                                                    )}
                                                    {p.is_flash_sale && (
                                                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                            ⚡ Flash
                                                        </span>
                                                    )}
                                                    {!guruz_special_product_ids.includes(p.id) && !p.is_featured && !p.is_flash_sale && (p.flags || '—')}
                                                </div>
                                            </td>

                                            {/* ACTIONS with quick Guruz Special toggle, edit and delete */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleGuruzSpecial(p.id)}
                                                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                                                            guruz_special_product_ids.includes(p.id)
                                                                ? 'text-purple-600 bg-purple-100/80 hover:bg-purple-200 dark:bg-purple-950 dark:text-purple-300'
                                                                : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800'
                                                        }`}
                                                        title={
                                                            guruz_special_product_ids.includes(p.id)
                                                                ? 'গুরুজ স্পেশাল থেকে সরান (Remove from Special)'
                                                                : 'গুরুজ স্পেশালে যোগ করুন (Add to Guruz Special)'
                                                        }
                                                    >
                                                        <Gift className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(p)}
                                                        className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(p.id, p.name)}
                                                        className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
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

        </>
    );
}
