import React, { useState, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Wand2, RefreshCw, Plus, Upload, CheckCircle2, AlertTriangle, Save, X, Settings } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import WarrantySelector from '@/Components/WarrantySelector';

export default function EditProduct() {
    const { props } = usePage<any>();
    const { shops = [], categories = [], brands = [], units = [], product = {}, is_guruz_special = false, promotionalLabels: initialPromoLabels } = props;

    const [promoLabels, setPromoLabels] = useState<{ flash_sale: string; featured: string; special: string }>({
        flash_sale: initialPromoLabels?.flash_sale || props.siteSettings?.promo_label_flash_sale || '⚡ Flash Sale / ফ্ল্যাশ সেল সেকশনে যোগ করুন',
        featured: initialPromoLabels?.featured || props.siteSettings?.promo_label_featured || '⭐ Guruz Verified / Featured Product',
        special: initialPromoLabels?.special || props.siteSettings?.promo_label_special || '🎁 Guruz Special / গুরুজ স্পেশাল সেকশনে যোগ করুন',
    });
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [editPromoLabels, setEditPromoLabels] = useState(promoLabels);
    const [savingPromoLabels, setSavingPromoLabels] = useState(false);

    const handleSavePromoLabels = () => {
        setSavingPromoLabels(true);
        router.post('/admin/settings/promotional-labels', editPromoLabels, {
            preserveScroll: true,
            onSuccess: () => {
                setSavingPromoLabels(false);
                setPromoLabels(editPromoLabels);
                setShowPromoModal(false);
                Swal.fire({
                    icon: 'success',
                    title: 'টেক্সট সফলভাবে আপডেট হয়েছে!',
                    timer: 2000,
                    showConfirmButton: false,
                });
            },
            onError: (errs) => {
                setSavingPromoLabels(false);
                const msg = Object.values(errs).flat().join('\n') || 'টেক্সট সেভ করতে সমস্যা হয়েছে।';
                Swal.fire('ত্রুটি!', msg, 'error');
            }
        });
    };

    const [localUnits, setLocalUnits] = useState<{ id?: number; name: string }[]>(
        units && units.length > 0 ? units : [{ name: 'Pcs' }, { name: 'Kg' }, { name: 'Ltr' }]
    );

    const handleAddAdminUnit = async () => {
        const { value: unitName } = await Swal.fire({
            title: 'Add New Unit',
            input: 'text',
            inputLabel: 'Unit Name (e.g. Pcs, Kg, Box, Meter)',
            inputPlaceholder: 'Enter unit name...',
            showCancelButton: true,
            confirmButtonText: 'Add Unit',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return 'Unit name is required!';
                }
            }
        });

        if (unitName && unitName.trim()) {
            try {
                const res = await axios.post('/admin/units', {
                    name: unitName.trim(),
                    short_name: unitName.trim(),
                    is_active: true
                }, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    }
                });

                const newUnit = res.data?.unit || { name: unitName.trim() };
                setLocalUnits(prev => {
                    if (!prev.some(u => u.name.toLowerCase() === newUnit.name.toLowerCase())) {
                        return [...prev, newUnit];
                    }
                    return prev;
                });
                setUnit(newUnit.name);
                Swal.fire({
                    icon: 'success',
                    title: 'Unit Added!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.response?.data?.message || 'Could not add unit.'
                });
            }
        }
    };

    const [aiHint, setAiHint] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    const [productName, setProductName] = useState(product.name || '');
    const [description, setDescription] = useState(product.description || '');
    const [specification, setSpecification] = useState(product.specification || '');
    const [sku, setSku] = useState(product.sku || '');

    const [shop, setShop] = useState(product.shop_id || '');
    const [category, setCategory] = useState(product.category_id || '');
    const [brand, setBrand] = useState(product.brand_id || '');
    const [unit, setUnit] = useState(product.unit || '');

    const [productType, setProductType] = useState<'Single' | 'Variant'>('Single');
    const [purchasePrice, setPurchasePrice] = useState(product.purchase_price || '');
    const [isRetail, setIsRetail] = useState(true);
    const [isWholesale, setIsWholesale] = useState(false);
    const [isFlashSale, setIsFlashSale] = useState(Boolean(product.is_flash_sale));
    const [isFeatured, setIsFeatured] = useState(Boolean(product.is_featured));
    const [isGuruzSpecial, setIsGuruzSpecial] = useState(Boolean(is_guruz_special));
    const [regularPrice, setRegularPrice] = useState(product.price || '');
    const [discountedPrice, setDiscountedPrice] = useState(product.sale_price || '');

    const [stockQuantity, setStockQuantity] = useState(product.stock_quantity ?? 1);
    const [weight, setWeight] = useState(product.weight || '');
    const [minVipLevel, setMinVipLevel] = useState(product.min_vip_level || '');
    const [warranty, setWarranty] = useState<string>(product.warranty_type || 'No warranty');

    // Thumbnail Management
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(product.primary_image_url || null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [removePrimaryImage, setRemovePrimaryImage] = useState(false);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    // Gallery Management (Existing DB images + newly selected files)
    const [existingImages, setExistingImages] = useState<Array<{ id: number; url: string }>>(
        product.images?.map((img: any) => ({ id: img.id, url: img.url })) || []
    );
    const [deletedGalleryIds, setDeletedGalleryIds] = useState<number[]>([]);
    const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
    const [newGalleryUrls, setNewGalleryUrls] = useState<string[]>([]);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [successMsg, setSuccessMsg] = useState('');

    const handleAiGenerate = async () => {
        setIsAiGenerating(true);
        try {
            const prompt = aiHint || productName || 'Premium Wireless Bluetooth Earbuds';
            const response = await axios.post('/api/ai/generate-product', { prompt });
            
            if (response.data) {
                if (response.data.name) setProductName(response.data.name);
                if (response.data.description) setDescription(response.data.description);
                if (response.data.specification) setSpecification(response.data.specification);
                
                setSuccessMsg('AI generated product details successfully!');
                setTimeout(() => setSuccessMsg(''), 4000);
            }
        } catch (error: any) {
            console.error("AI Generation Error:", error);
            const msg = error?.response?.data?.error || 'Failed to generate details. Please ensure GEMINI_API_KEY is configured in Admin Integrations or .env.';
            Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: msg, showConfirmButton: false, timer: 5000, timerProgressBar: true });
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleRegenerateSku = () => {
        const rand = Math.random().toString(36).substring(2, 9).toUpperCase();
        setSku(`SKU-${rand}`);
    };

    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnailFile(file);
            setThumbnailUrl(URL.createObjectURL(file));
            setRemovePrimaryImage(false);
        }
    };

    const handleRemoveThumbnail = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setThumbnailUrl(null);
        setThumbnailFile(null);
        setRemovePrimaryImage(true);
        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = '';
        }
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const urls = files.map(f => URL.createObjectURL(f));
            setNewGalleryFiles(prev => [...prev, ...files]);
            setNewGalleryUrls(prev => [...prev, ...urls]);
            if (galleryInputRef.current) {
                galleryInputRef.current.value = '';
            }
        }
    };

    const handleRemoveExistingImage = (imageId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        setDeletedGalleryIds(prev => [...prev, imageId]);
    };

    const handleRemoveNewGalleryImage = (indexToRemove: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setNewGalleryUrls(prev => prev.filter((_, i) => i !== indexToRemove));
        setNewGalleryFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productName || !regularPrice) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Please fill out Product Name and Regular Price.', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            return;
        }

        const payload: any = {
            name: productName,
            description: description,
            specification: specification,
            sku: sku || null,
            shop_id: shop || null,
            category_id: category || null,
            brand_id: brand || null,
            price: regularPrice,
            sale_price: discountedPrice || null,
            stock_quantity: stockQuantity,
            min_vip_level: minVipLevel || null,
            weight: weight || null,
            is_flash_sale: isFlashSale ? 1 : 0,
            is_featured: isFeatured ? 1 : 0,
            is_guruz_special: isGuruzSpecial ? 1 : 0,
            warranty: warranty,
        };

        if (thumbnailFile) {
            payload.primary_image = thumbnailFile;
        } else if (removePrimaryImage) {
            payload.remove_primary_image = 1;
        }

        if (deletedGalleryIds.length > 0) {
            payload.deleted_gallery_ids = deletedGalleryIds;
        }

        if (newGalleryFiles.length > 0) {
            payload.gallery = newGalleryFiles;
        }

        router.post(`/admin/products/${product.id}`, payload, {
            forceFormData: true,
            onSuccess: () => {
                setSuccessMsg(`Product "${productName}" updated successfully!`);
                setTimeout(() => {
                    router.get('/admin/products');
                }, 1500);
            },
            onError: (err) => {
                console.error(err);
                const errorMsg = Object.values(err).join('\n');
                Swal.fire({ icon: 'error', title: 'Validation Error', text: errorMsg, confirmButtonColor: '#4f46e5' });
            }
        });
    };

    return (
        <>
            <Head title={`Edit Product - ${productName} — Admin`} />

            <div className="space-y-6 pb-12">
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md">
                    <h1 className="text-2xl font-black tracking-tight">Edit Product</h1>
                </div>

                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-5">
                        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                                <Wand2 className="w-4 h-4 text-emerald-600" /> Auto Generate
                            </div>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                                Type a short hint (e.g. "wireless bluetooth earbuds, noise cancelling") to auto fill the title & description.
                            </p>

                            <div className="flex gap-2 pt-1">
                                <input
                                    type="text"
                                    value={aiHint}
                                    onChange={e => setAiHint(e.target.value)}
                                    placeholder="Short product hint (or leave blank to use the name below)"
                                    className="flex-1 bg-white dark:bg-slate-950 border border-emerald-300 dark:border-emerald-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <button
                                    type="button"
                                    onClick={handleAiGenerate}
                                    disabled={isAiGenerating}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                    <Wand2 className="w-3.5 h-3.5" /> {isAiGenerating ? 'Generating...' : 'Generate'}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                                    PRODUCT NAME *
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={e => setProductName(e.target.value)}
                                    placeholder="Type product name here — AI will auto-fill description & specification"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                                    DESCRIPTION *
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Type description here"
                                    rows={4}
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                                    SPECIFICATION
                                </label>
                                <textarea
                                    value={specification}
                                    onChange={e => setSpecification(e.target.value)}
                                    placeholder="Type specifications here"
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">SKU</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={sku}
                                        onChange={e => setSku(e.target.value)}
                                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRegenerateSku}
                                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer border border-slate-200 dark:border-slate-700"
                                    >
                                        Regenerate
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">SHOP *</label>
                                    <select
                                        value={shop}
                                        onChange={e => setShop(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        <option value="">-- Select shop --</option>
                                        {shops.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">CATEGORY *</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">BRAND</label>
                                    <select
                                        value={brand}
                                        onChange={e => setBrand(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        <option value="">Select brand</option>
                                        {brands.map((b: any) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">UNIT</label>
                                    <div className="flex gap-2">
                                        <select
                                            value={unit}
                                            onChange={e => setUnit(e.target.value)}
                                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                                        >
                                            <option value="">Select unit</option>
                                            {localUnits.map((u: any, idx: number) => (
                                                <option key={u.id || idx} value={u.name}>{u.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAddAdminUnit}
                                            title="Add Unit"
                                            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 cursor-pointer transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-5">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">PRODUCT TYPE</label>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" name="productType" checked={productType === 'Single'} onChange={() => setProductType('Single')} className="text-purple-600 focus:ring-purple-500" /> Single
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" name="productType" checked={productType === 'Variant'} onChange={() => setProductType('Variant')} className="text-purple-600 focus:ring-purple-500" /> Variant
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">PURCHASE PRICE *</label>
                                <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="Purchase price" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">SELLING TYPE</label>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-800 dark:text-slate-200">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="checkbox" checked={isRetail} onChange={e => setIsRetail(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" /> Retail
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="checkbox" checked={isWholesale} onChange={e => setIsWholesale(e.target.checked)} className="rounded text-purple-600 focus:ring-purple-500" /> Wholesale
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">REGULAR PRICE *</label>
                                    <input type="number" value={regularPrice} onChange={e => setRegularPrice(e.target.value)} placeholder="Regular price" required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">DISCOUNTED PRICE</label>
                                    <input type="number" value={discountedPrice} onChange={e => setDiscountedPrice(e.target.value)} placeholder="Discounted price" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold" />
                                </div>
                            </div>

                            {/* PROMOTIONAL BADGES & FLASH SALE */}
                            <div className="bg-amber-50 dark:bg-slate-800/60 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3.5 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-[10px] font-black uppercase text-amber-800 dark:text-amber-400">PROMOTIONAL SECTIONS</label>
                                    <button
                                        type="button"
                                        onClick={() => { setEditPromoLabels(promoLabels); setShowPromoModal(true); }}
                                        className="text-[10px] font-bold text-amber-800 hover:text-amber-950 bg-amber-200/70 hover:bg-amber-200 dark:bg-amber-900/60 dark:text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1 transition cursor-pointer"
                                        title="সেকশনের নাম ও টেক্সট পরিবর্তন করুন"
                                    >
                                        <Settings className="w-3 h-3" /> টেক্সট এডিট
                                    </button>
                                </div>
                                
                                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-extrabold text-slate-800 dark:text-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={isFlashSale}
                                        onChange={e => setIsFlashSale(e.target.checked)}
                                        className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                                    />
                                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">{promoLabels.flash_sale}</span>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={isFeatured}
                                        onChange={e => setIsFeatured(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="flex items-center gap-1">{promoLabels.featured}</span>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                                    <input
                                        type="checkbox"
                                        checked={isGuruzSpecial}
                                        onChange={e => setIsGuruzSpecial(e.target.checked)}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <span className="flex items-center gap-1.5 font-extrabold text-purple-700 dark:text-purple-400">
                                        {promoLabels.special}
                                    </span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">VIP LEVEL RESTRICTION</label>
                                <select value={minVipLevel} onChange={e => setMinVipLevel(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold">
                                    <option value="">None (Available to all)</option>
                                    <option value="beginner">Beginner (1-5 Orders)</option>
                                    <option value="bronze">Bronze (6-10 Orders)</option>
                                    <option value="silver">Silver (11-20 Orders)</option>
                                    <option value="gold">Gold (21-40 Orders)</option>
                                    <option value="platinum">Platinum (41-70 Orders)</option>
                                    <option value="diamond">Diamond (71+ Orders)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">STOCK QUANTITY</label>
                                <input type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} placeholder="Stock quantity" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">WEIGHT (KG)</label>
                                <input type="number" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} placeholder="weight (kg)" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold" />
                            </div>

                            <WarrantySelector
                                value={warranty}
                                onChange={setWarranty}
                            />

                            {/* UPLOAD THUMBNAIL IMAGE (360 X 360) */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">UPLOAD THUMBNAIL IMAGE (360 X 360)</label>
                                <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-purple-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/50 group/thumb relative">
                                    {thumbnailUrl ? (
                                        <div className="relative">
                                            <img
                                                src={thumbnailUrl}
                                                alt="Thumbnail preview"
                                                className="w-28 h-28 object-contain bg-white rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-1"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    target.onerror = null;
                                                    target.src = 'https://placehold.co/200x200?text=Upload+Image';
                                                }}
                                            />
                                            {/* Red Round X Remove Button */}
                                            <button
                                                type="button"
                                                onClick={handleRemoveThumbnail}
                                                title="ইমেজ রিমুভ করুন"
                                                className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow-md transition-all hover:scale-110 cursor-pointer z-20"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
                                                <span className="text-[10px] text-white font-bold bg-black/60 px-2 py-1 rounded-md">ছবি পরিবর্তন করুন</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                            <span className="text-xs font-bold text-slate-500">Upload thumbnail image</span>
                                        </>
                                    )}
                                    <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                                </label>
                            </div>

                            {/* PRODUCT GALLERY */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                                    PRODUCT GALLERY (JPG, JPEG, PNG · MAX 10MB)
                                </label>
                                <p className="text-[10px] text-amber-600 font-bold mb-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Please use original product images.
                                </p>

                                <div className="flex flex-wrap gap-2.5">
                                    {/* Existing DB Images with Red X Button */}
                                    {existingImages.map((img) => (
                                        <div key={img.id} className="relative group/gal w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-white overflow-visible shadow-xs flex items-center justify-center">
                                            <img
                                                src={img.url}
                                                alt="Gallery item"
                                                className="w-full h-full object-contain rounded-xl p-1"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    target.onerror = null;
                                                    target.src = 'https://placehold.co/100x100?text=No+Img';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => handleRemoveExistingImage(img.id, e)}
                                                title="এই ছবি পার্মানেন্ট ডিলিট করুন"
                                                className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white p-0.5 rounded-full shadow-md transition-all hover:scale-110 cursor-pointer z-20"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Newly Uploaded Images with Red X Button */}
                                    {newGalleryUrls.map((url, i) => (
                                        <div key={`new-${i}`} className="relative group/gal w-16 h-16 rounded-xl border border-purple-300 dark:border-purple-800 bg-white overflow-visible shadow-xs flex items-center justify-center">
                                            <img
                                                src={url}
                                                alt={`New gallery ${i}`}
                                                className="w-full h-full object-contain rounded-xl p-1"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    target.onerror = null;
                                                    target.src = 'https://placehold.co/100x100?text=No+Img';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => handleRemoveNewGalleryImage(i, e)}
                                                title="এই ছবি রিমুভ করুন"
                                                className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white p-0.5 rounded-full shadow-md transition-all hover:scale-110 cursor-pointer z-20"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[8px] font-bold px-1 rounded-sm">New</span>
                                        </div>
                                    ))}

                                    <label className="w-16 h-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 bg-slate-50 dark:bg-slate-950 transition hover:bg-purple-50/50">
                                        <Upload className="w-4 h-4 text-slate-400 mb-0.5" />
                                        <span className="text-[9px] font-bold text-slate-400">+Add</span>
                                        <input ref={galleryInputRef} type="file" multiple accept="image/*" onChange={handleGalleryUpload} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button type="button" onClick={() => router.get('/admin/products')} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 cursor-pointer">
                                <Save className="w-5 h-5" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Modal for editing promotional labels */}
            {showPromoModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-amber-600" /> প্রমোশনাল সেকশন টেক্সট পরিবর্তন
                            </h3>
                            <button onClick={() => setShowPromoModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            নিচের টেক্সটগুলো এডিট করে আপনার মনের মতো নাম দিন। সংরক্ষণ করার পর প্রোডাক্ট ফর্মে এবং স্টোরফ্রন্টে এই নাম প্রদর্শিত হবে।
                        </p>

                        <div className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    ⚡ Flash Sale সেকশনের টেক্সট
                                </label>
                                <input
                                    type="text"
                                    value={editPromoLabels.flash_sale}
                                    onChange={e => setEditPromoLabels({ ...editPromoLabels, flash_sale: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="⚡ Flash Sale / ফ্ল্যাশ সেল সেকশনে যোগ করুন"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    ⭐ Guruz Verified / Featured সেকশনের টেক্সট
                                </label>
                                <input
                                    type="text"
                                    value={editPromoLabels.featured}
                                    onChange={e => setEditPromoLabels({ ...editPromoLabels, featured: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="⭐ Guruz Verified / Featured Product"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    🎁 Guruz Special সেকশনের টেক্সট
                                </label>
                                <input
                                    type="text"
                                    value={editPromoLabels.special}
                                    onChange={e => setEditPromoLabels({ ...editPromoLabels, special: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    placeholder="🎁 Guruz Special / গুরুজ স্পেশাল সেকশনে যোগ করুন"
                                />
                            </div>
                        </div>

                        <div className="pt-3 flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setShowPromoModal(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition"
                            >
                                বাতিল
                            </button>
                            <button
                                type="button"
                                disabled={savingPromoLabels}
                                onClick={handleSavePromoLabels}
                                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50"
                            >
                                {savingPromoLabels ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
