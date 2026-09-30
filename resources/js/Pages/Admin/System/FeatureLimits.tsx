import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { RefreshCw, Save, Check, HardDrive, Users, Box } from 'lucide-react';
import Swal from 'sweetalert2';

interface FeatureLimitsProps {
    limits?: Record<string, string>;
}

export default function FeatureLimits({ limits }: FeatureLimitsProps) {
    const { data, setData, post, processing } = useForm({
        max_image_upload_size: limits?.max_image_upload_size || '5',
        max_video_upload_size: limits?.max_video_upload_size || '20',
        max_gallery_images: limits?.max_gallery_images || '10',
        max_products_per_vendor: limits?.max_products_per_vendor || '500',
        max_flash_sales_per_vendor: limits?.max_flash_sales_per_vendor || '5',
        allow_vendor_categories: limits?.allow_vendor_categories === 'true' || limits?.allow_vendor_categories === '1',
        category_depth_level: limits?.category_depth_level || '3',
        max_variants_per_product: limits?.max_variants_per_product || '50',
        auto_archive_out_of_stock: limits?.auto_archive_out_of_stock === 'true' || limits?.auto_archive_out_of_stock === '1' || limits?.auto_archive_out_of_stock === undefined,
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/system/feature-limits', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Feature Limits saved successfully!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            },
            onError: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Failed to save limits.',
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        });
    };

    return (
        <>
            <Head title="Feature Limits — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                                System Settings
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Feature Limits</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage global restrictions, file upload limits, and maximum entity counts.
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
                            onClick={handleSave}
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : 'Save Limits'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    
                    {/* Media & Upload Limits */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
                        <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <HardDrive className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-black text-slate-800 dark:text-white">Media & Uploads</h2>
                        </div>
                        <div className="p-5 space-y-5 flex-1">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Max Image Upload Size (MB)
                                </label>
                                <input
                                    type="number"
                                    value={data.max_image_upload_size}
                                    onChange={e => setData('max_image_upload_size', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Applies to all image uploads across the system.</p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Max Video Upload Size (MB)
                                </label>
                                <input
                                    type="number"
                                    value={data.max_video_upload_size}
                                    onChange={e => setData('max_video_upload_size', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Max Gallery Images per Product
                                </label>
                                <input
                                    type="number"
                                    value={data.max_gallery_images}
                                    onChange={e => setData('max_gallery_images', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vendor Limits */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
                        <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                <Users className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-black text-slate-800 dark:text-white">Vendor Restrictions</h2>
                        </div>
                        <div className="p-5 space-y-5 flex-1">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Default Max Products per Vendor
                                </label>
                                <input
                                    type="number"
                                    value={data.max_products_per_vendor}
                                    onChange={e => setData('max_products_per_vendor', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Can be overridden per vendor or subscription plan.</p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Max Flash Sales per Vendor
                                </label>
                                <input
                                    type="number"
                                    value={data.max_flash_sales_per_vendor}
                                    onChange={e => setData('max_flash_sales_per_vendor', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Allow Vendor Categories</h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Let vendors create their own categories</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.allow_vendor_categories}
                                        onChange={e => setData('allow_vendor_categories', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Catalog Limits */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
                        <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                <Box className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-black text-slate-800 dark:text-white">Catalog & Inventory</h2>
                        </div>
                        <div className="p-5 space-y-5 flex-1">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Category Depth Level
                                </label>
                                <select
                                    value={data.category_depth_level}
                                    onChange={e => setData('category_depth_level', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition cursor-pointer"
                                >
                                    <option value="2">2 Levels (Main &gt; Sub)</option>
                                    <option value="3">3 Levels (Main &gt; Sub &gt; Child)</option>
                                    <option value="4">4 Levels</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                    Max Variants per Product
                                </label>
                                <input
                                    type="number"
                                    value={data.max_variants_per_product}
                                    onChange={e => setData('max_variants_per_product', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Auto-archive out of stock</h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Hide products when qty reaches 0</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.auto_archive_out_of_stock}
                                        onChange={e => setData('auto_archive_out_of_stock', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </>
    );
}