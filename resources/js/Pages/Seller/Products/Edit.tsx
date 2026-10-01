import React, { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Wand2, RefreshCw, Plus, Upload, X, Check, Image as ImageIcon, Type, DollarSign, CheckCircle2, ArrowLeft } from 'lucide-react';
import SellerLayout from '@/Layouts/SellerLayout';
import WarrantySelector from '@/Components/WarrantySelector';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Category { id: number; name: string; }
interface Brand { id: number; name: string; }
interface Unit { id: number; name: string; }
interface Attribute { id: number; name: string; values: string[] }
interface ProductImage { id: number; url: string; }

interface Product {
    id: number;
    name: string;
    description: string | null;
    specification: string | null;
    price: number;
    sale_price: number | null;
    purchase_price: number | null;
    stock_quantity: number;
    sku: string | null;
    category_id: number | null;
    brand_id: number | null;
    unit: string | null;
    unit_id?: number | null;
    weight: number | null;
    warranty_type: string | null;
    video_url: string | null;
    meta_title: string | null;
    meta_description: string | null;
    is_retail: boolean;
    is_wholesale: boolean;
    is_active: boolean;
    is_featured: boolean;
    primary_image_url: string | null;
    colors: string[] | null;
    sizes: string[] | null;
    materials: string[] | null;
    tags: string[] | null;
    images?: ProductImage[];
}

export default function SellerProductEdit({
    product,
    categories = [],
    brands = [],
    units = [],
    attributes = []
}: {
    product: Product;
    categories: Category[];
    brands: Brand[];
    units: Unit[];
    attributes: Attribute[];
}) {
    const initialUnit = product.unit_id 
        ? String(product.unit_id) 
        : (units.find(u => u.name.toLowerCase() === product.unit?.toLowerCase())?.id 
            ? String(units.find(u => u.name.toLowerCase() === product.unit?.toLowerCase())?.id) 
            : '');

    const [localUnits, setLocalUnits] = useState<Unit[]>(units);

    const { data, setData, processing, errors } = useForm({
        _method: 'PUT',
        name: product.name || '',
        description: product.description || '',
        specification: product.specification || '',
        price: product.price ? String(product.price) : '',
        sale_price: product.sale_price ? String(product.sale_price) : '',
        purchase_price: product.purchase_price ? String(product.purchase_price) : '',
        stock_quantity: product.stock_quantity ? String(product.stock_quantity) : '0',
        sku: product.sku || '',
        category_id: product.category_id ? String(product.category_id) : '',
        brand_id: product.brand_id ? String(product.brand_id) : '',
        unit_id: initialUnit,
        weight: product.weight ? String(product.weight) : '',
        warranty: product.warranty_type || 'No warranty',
        is_retail: product.is_retail ?? true,
        is_wholesale: product.is_wholesale ?? false,
        video_url: product.video_url || '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        main_image: null as File | null,
        images: [] as File[],
        colors: product.colors || [],
        sizes: product.sizes || [],
        materials: product.materials || [],
        tags: product.tags || [],
    });

    const [aiHint, setAiHint] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [mainPreview, setMainPreview] = useState<string | null>(product.primary_image_url || null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>(product.images ? product.images.map(img => img.url) : []);
    const [customSizeInput, setCustomSizeInput] = useState('');
    const [tagInput, setTagInput] = useState('');

    const mainImageRef = useRef<HTMLInputElement>(null);
    const galleryImageRef = useRef<HTMLInputElement>(null);

    const handleAddUnit = async () => {
        const { value: unitName } = await Swal.fire({
            title: 'নতুন ইউনিট যোগ করুন',
            input: 'text',
            inputLabel: 'ইউনিটের নাম (যেমন: Piece, Kg, Box, Meter)',
            inputPlaceholder: 'ইউনিটের নাম লিখুন...',
            showCancelButton: true,
            confirmButtonText: 'যোগ করুন',
            cancelButtonText: 'বাতিল',
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return 'ইউনিটের নাম আবশ্যক!';
                }
            }
        });

        if (unitName && unitName.trim()) {
            try {
                const res = await axios.post('/seller/unit', {
                    name: unitName.trim(),
                    short_name: unitName.trim(),
                    is_active: true
                }, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    }
                });

                if (res.data && res.data.unit) {
                    const newUnit = res.data.unit;
                    setLocalUnits(prev => {
                        if (!prev.some(u => u.id === newUnit.id)) {
                            return [...prev, newUnit];
                        }
                        return prev;
                    });
                    setData('unit_id', String(newUnit.id));
                    Swal.fire({
                        icon: 'success',
                        title: 'ইউনিট যোগ করা হয়েছে!',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            } catch (err: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'ভুল হয়েছে',
                    text: err.response?.data?.message || 'ইউনিট যোগ করা সম্ভব হয়নি।'
                });
            }
        }
    };

    const [colorsList] = useState<{ name: string; hex: string }[]>([
        { name: 'Black', hex: '#000000' },
        { name: 'Red', hex: '#ef4444' },
        { name: 'Orange', hex: '#f97316' },
        { name: 'Yellow', hex: '#eab308' },
        { name: 'Green', hex: '#22c55e' },
        { name: 'Cyan', hex: '#06b6d4' },
        { name: 'Blue', hex: '#3b82f6' },
        { name: 'Purple', hex: '#a855f7' },
        { name: 'Magenta', hex: '#ec4899' },
        { name: 'Brown', hex: '#78350f' },
        { name: 'White', hex: '#ffffff' },
    ]);

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('main_image', file);
            setMainPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setData('images', [...data.images, ...filesArray]);
            const newPreviews = filesArray.map(f => URL.createObjectURL(f));
            setGalleryPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const toggleColor = (colorName: string) => {
        if (data.colors.includes(colorName)) {
            setData('colors', data.colors.filter(c => c !== colorName));
        } else {
            setData('colors', [...data.colors, colorName]);
        }
    };

    const toggleSize = (sizeName: string) => {
        if (data.sizes.includes(sizeName)) {
            setData('sizes', data.sizes.filter(s => s !== sizeName));
        } else {
            setData('sizes', [...data.sizes, sizeName]);
        }
    };

    const addCustomSize = () => {
        if (customSizeInput.trim() && !data.sizes.includes(customSizeInput.trim())) {
            setData('sizes', [...data.sizes, customSizeInput.trim()]);
            setCustomSizeInput('');
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
            setData('tags', [...data.tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (t: string) => {
        setData('tags', data.tags.filter(tag => tag !== t));
    };

    const handleAiGenerate = async () => {
        if (!data.name) {
            Swal.fire('Warning', 'Please enter a product title first.', 'warning');
            return;
        }
        setIsAiGenerating(true);
        try {
            const res = await axios.post('/api/ai/generate-description', {
                title: data.name,
                hint: aiHint
            });
            if (res.data?.description) {
                setData('description', res.data.description);
                if (res.data.specification) setData('specification', res.data.specification);
                if (res.data.meta_title) setData('meta_title', res.data.meta_title);
                if (res.data.meta_description) setData('meta_description', res.data.meta_description);
                Swal.fire({
                    title: 'AI Description Updated!',
                    text: 'SEO optimized description generated successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            setData('description', `${data.name} is a high-grade product engineered for high performance, maximum durability, and long-lasting quality.`);
            setData('meta_title', `${data.name} - Buy Online at Best Price`);
            setData('meta_description', `Order ${data.name} online. 100% genuine quality product with fast home delivery and warranty.`);
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/seller/products/${product.id}`, {
            _method: 'PUT',
            ...data
        }, {
            forceFormData: true,
            onSuccess: () => {
                Swal.fire('Updated!', 'Product details updated successfully.', 'success');
            }
        });
    };

    return (
        <>
            <Head title={`Edit Product: ${product.name}`} />

            <div className="max-w-7xl mx-auto pb-16 space-y-8">
                {/* Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/seller/products"
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Edit Product: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{product.name}</span></h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Modify all details, pricing, inventory, variants and images.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/seller/products"
                            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {processing ? 'Saving Changes...' : 'Save Product Changes'}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left & Middle Column (2 Cols) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Product Info Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Basic Information</h2>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Product Name / Title <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Spark High Voltage Cable 1.5RM"
                                    className="w-full text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-3"
                                />
                                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                                    <select
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                        className="w-full text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Brand</label>
                                    <select
                                        value={data.brand_id}
                                        onChange={e => setData('brand_id', e.target.value)}
                                        className="w-full text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5"
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">SKU Code</label>
                                    <input
                                        type="text"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value)}
                                        placeholder="SPK-CBL-15RM"
                                        className="w-full text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Stock Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Pricing & Inventory</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Regular Price (৳) <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        placeholder="2500"
                                        className="w-full text-sm font-bold text-indigo-600 dark:text-indigo-400 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Sale Price (৳)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.sale_price}
                                        onChange={e => setData('sale_price', e.target.value)}
                                        placeholder="2220"
                                        className="w-full text-sm font-bold text-emerald-600 dark:text-emerald-400 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Purchase Cost Price (৳)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.purchase_price}
                                        onChange={e => setData('purchase_price', e.target.value)}
                                        placeholder="1800"
                                        className="w-full text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Stock Quantity <span className="text-rose-500">*</span></label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={data.stock_quantity}
                                        onChange={e => setData('stock_quantity', e.target.value)}
                                        placeholder="100"
                                        className="w-full text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Unit</label>
                                    <div className="flex gap-1.5">
                                        <select
                                            value={data.unit_id}
                                            onChange={e => setData('unit_id', e.target.value)}
                                            className="w-full text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5"
                                        >
                                            <option value="">Select Unit</option>
                                            {localUnits.map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAddUnit}
                                            title="Add Unit"
                                            className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 px-3 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer flex items-center justify-center shrink-0"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Weight (KG)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.weight}
                                        onChange={e => setData('weight', e.target.value)}
                                        placeholder="1.5"
                                        className="w-full text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2.5"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Description & AI Generator Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Description & Details</h2>
                                <button
                                    type="button"
                                    onClick={handleAiGenerate}
                                    disabled={isAiGenerating}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:opacity-90 transition"
                                >
                                    <Wand2 className="w-3.5 h-3.5" />
                                    {isAiGenerating ? 'Generating...' : 'Auto Generate Description'}
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Product Full Description</label>
                                <textarea
                                    rows={5}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Write full product description, key features, usage instructions..."
                                    className="w-full text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 p-3"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Technical Specifications</label>
                                <textarea
                                    rows={4}
                                    value={data.specification}
                                    onChange={e => setData('specification', e.target.value)}
                                    placeholder="Voltage, Ampere, Material Grade, Dimensions..."
                                    className="w-full text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 p-3"
                                />
                            </div>
                        </div>

                        {/* Variants & Attributes (Colors, Sizes, Tags) */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Variants & Attributes</h2>

                            {/* Color Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Available Colors</label>
                                <div className="flex flex-wrap gap-2">
                                    {colorsList.map(c => {
                                        const isSelected = data.colors.includes(c.name);
                                        return (
                                            <button
                                                key={c.name}
                                                type="button"
                                                onClick={() => toggleColor(c.name)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                                    isSelected ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs" style={{ backgroundColor: c.hex }} />
                                                {c.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Available Sizes</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {['1.5RM', '2.5RM', '4.0RM', '6.0RM', 'S', 'M', 'L', 'XL', 'XXL'].map(s => {
                                        const isSelected = data.sizes.includes(s);
                                        return (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => toggleSize(s)}
                                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                                                    isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={customSizeInput}
                                        onChange={e => setCustomSizeInput(e.target.value)}
                                        placeholder="Add custom size (e.g. 10RM)"
                                        className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 px-3 py-1.5 focus:ring-indigo-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomSize}
                                        className="px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs hover:bg-slate-900 dark:hover:bg-slate-600"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Search Tags</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {data.tags.map(t => (
                                        <span key={t} className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                                            {t}
                                            <button type="button" onClick={() => removeTag(t)} className="text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200"><X size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        placeholder="Type tag and press Enter"
                                        className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 px-3 py-1.5 focus:ring-indigo-500"
                                    />
                                    <button type="button" onClick={addTag} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">Add Tag</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (1 Col) */}
                    <div className="space-y-8">
                        {/* Status & Options Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Listing Status</h2>

                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Publish Status</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Active products are visible in customer store.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('is_active', !data.is_active)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-black transition ${
                                        data.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    {data.is_active ? 'Active' : 'Draft'}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Featured Product</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">Show on store homepage featured row.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('is_featured', !data.is_featured)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-black transition ${
                                        data.is_featured ? 'bg-purple-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                >
                                    {data.is_featured ? 'Featured' : 'Standard'}
                                </button>
                            </div>
                        </div>

                        {/* Warranty Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <WarrantySelector
                                value={data.warranty}
                                onChange={val => setData('warranty', val)}
                            />
                        </div>

                        {/* Product Main Image */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Main Cover Image</h2>

                            <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden flex flex-col items-center justify-center cursor-pointer group hover:border-indigo-500 transition" onClick={() => mainImageRef.current?.click()}>
                                {mainPreview ? (
                                    <img src={mainPreview} alt="Main Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-4">
                                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2 group-hover:text-indigo-600 transition" />
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to upload primary image</p>
                                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 2MB</p>
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={mainImageRef} onChange={handleMainImageChange} accept="image/*" className="hidden" />
                        </div>

                        {/* Gallery Images */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Gallery Images</h2>

                            <div className="grid grid-cols-3 gap-2">
                                {galleryPreviews.map((imgUrl, i) => (
                                    <div key={i} className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                                        <img src={imgUrl} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => galleryImageRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center hover:border-indigo-500 hover:bg-indigo-50/50 transition text-slate-500 hover:text-indigo-600"
                                >
                                    <Plus className="w-5 h-5 mb-1" />
                                    <span className="text-[10px] font-bold">Add</span>
                                </button>
                            </div>
                            <input type="file" ref={galleryImageRef} onChange={handleGalleryImagesChange} accept="image/*" multiple className="hidden" />
                        </div>

                        {/* SEO Options Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">Search Engine Optimization (SEO)</h2>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Meta Title</label>
                                <input
                                    type="text"
                                    value={data.meta_title}
                                    onChange={e => setData('meta_title', e.target.value)}
                                    placeholder="Product Google Search Title"
                                    className="w-full text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Meta Description</label>
                                <textarea
                                    rows={3}
                                    value={data.meta_description}
                                    onChange={e => setData('meta_description', e.target.value)}
                                    placeholder="Brief summary for search engine results..."
                                    className="w-full text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 p-2.5"
                                />
                            </div>
                        </div>

                        {/* Submit Action Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm transition shadow-xl flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            {processing ? 'Saving Changes...' : 'Save Product Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
