import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Wand2, RefreshCw, Plus, Upload, X, Check, Image as ImageIcon, Type, DollarSign, CheckCircle2 } from 'lucide-react';
import SellerLayout from '@/Layouts/SellerLayout';
import WarrantySelector from '@/Components/WarrantySelector';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Category { id: number; name: string; }
interface Brand { id: number; name: string; }
interface Unit { id: number; name: string; }
interface Attribute { id: number; name: string; values: string[] }

export default function SellerProductCreate({
    categories = [],
    brands = [],
    units = [],
    attributes = []
}: {
    categories: Category[],
    brands: Brand[],
    units: Unit[],
    attributes: Attribute[]
}) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        specification: '',
        price: '',
        sale_price: '',
        purchase_price: '',
        stock_quantity: '',
        sku: '',
        category_id: '',
        brand_id: '',
        unit_id: '',
        weight: '',
        warranty: 'No warranty',
        is_retail: true,
        is_wholesale: false,
        min_order_qty: '1',
        max_order_qty: 'No limit',
        video_url: '',
        free_shipping: false,
        cash_on_delivery: true,
        replacement: false,
        meta_title: '',
        meta_description: '',
        is_active: true,
        is_featured: false,
        main_image: null as File | null,
        images: [] as File[],
        colors: [] as string[],
        sizes: [] as string[],
        materials: [] as string[],
        tags: [] as string[],
    });

    const [aiHint, setAiHint] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [mainPreview, setMainPreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [customSizeInput, setCustomSizeInput] = useState('');
    const [tagInput, setTagInput] = useState('');

    const mainImageRef = useRef<HTMLInputElement>(null);
    const galleryImageRef = useRef<HTMLInputElement>(null);

    // Color options state
    const [colorsList, setColorsList] = useState<{ name: string; hex: string }[]>([
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
        { name: 'Grey', hex: '#64748b' },
    ]);

    // Size options state
    const [sizesList, setSizesList] = useState<string[]>([
        'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'ফ্রি'
    ]);

    // Material options state
    const [materialsList, setMaterialsList] = useState<string[]>([
        'সুতি (Cotton)', 'পলিয়েস্টার', 'সিল্ক', 'ডেনিম', 'ভেলভেট', 'লেদার', 'উল', 'ধূপ', 'প্লাস্টিক', 'কাঠ', 'কাঁচ'
    ]);

    const [customColorHex, setCustomColorHex] = useState('#6366f1');
    const [customColorName, setCustomColorName] = useState('');
    const [customMaterialInput, setCustomMaterialInput] = useState('');
    const [showAddColorModal, setShowAddColorModal] = useState(false);

    const handleAddCustomColor = () => {
        const hex = customColorHex;
        const name = customColorName.trim() || customColorHex;
        if (!colorsList.some(c => c.hex.toLowerCase() === hex.toLowerCase())) {
            setColorsList(prev => [...prev, { name, hex }]);
        }
        if (!data.colors.includes(hex)) {
            setData('colors', [...data.colors, hex]);
        }
        setCustomColorName('');
        setShowAddColorModal(false);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'নতুন কালার যুক্ত করা হয়েছে!',
            showConfirmButton: false,
            timer: 2000
        });
    };

    const handleAddCustomMaterial = (e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && 'key' in e && e.key !== 'Enter') return;
        if (e) e.preventDefault();
        const mat = customMaterialInput.trim();
        if (mat) {
            if (!materialsList.includes(mat)) {
                setMaterialsList(prev => [...prev, mat]);
            }
            if (!data.materials.includes(mat)) {
                setData('materials', [...data.materials, mat]);
            }
            setCustomMaterialInput('');
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'নতুন ম্যাটেরিয়াল যুক্ত করা হয়েছে!',
                showConfirmButton: false,
                timer: 2000
            });
        }
    };

    const handleAddCustomSize = (e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && 'key' in e && e.key !== 'Enter') return;
        if (e) e.preventDefault();
        const sz = customSizeInput.trim();
        if (sz) {
            if (!sizesList.includes(sz)) {
                setSizesList(prev => [...prev, sz]);
            }
            if (!data.sizes.includes(sz)) {
                setData('sizes', [...data.sizes, sz]);
            }
            setCustomSizeInput('');
        }
    };

    const handleAiGenerate = async () => {
        setIsAiGenerating(true);
        try {
            const prompt = aiHint || data.name || 'Wireless Bluetooth Headphones';
            const response = await axios.post('/api/ai/generate-product', { prompt });

            if (response.data) {
                if (response.data.name) setData('name', response.data.name);
                if (response.data.description) setData('description', response.data.description);
                if (response.data.specification) setData('specification', response.data.specification);

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'AI জেনারেট সফল হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        } catch (error: any) {
            console.error('AI Error:', error);
            const msg = error?.response?.data?.error || 'AI তথ্য তৈরি করতে ব্যর্থ হয়েছে। Gemini API Key কনফিগার করা আছে কি না যাচাই করুন।';
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: msg,
                showConfirmButton: false,
                timer: 4000
            });
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleRegenerateSku = () => {
        const rand = Math.random().toString(36).substring(2, 9).toUpperCase();
        setData('sku', `SKU-${rand}`);
    };

    const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('main_image', file);
            setMainPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        setData('images', [...data.images, ...files]);
        setGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    };

    const removeGalleryImage = (i: number) => {
        setData('images', data.images.filter((_, idx) => idx !== i));
        setGalleryPreviews(prev => prev.filter((_, idx) => idx !== i));
    };

    const toggleColor = (colorHex: string) => {
        if (data.colors.includes(colorHex)) {
            setData('colors', data.colors.filter(c => c !== colorHex));
        } else {
            setData('colors', [...data.colors, colorHex]);
        }
    };

    const toggleSize = (size: string) => {
        if (data.sizes.includes(size)) {
            setData('sizes', data.sizes.filter(s => s !== size));
        } else {
            setData('sizes', [...data.sizes, size]);
        }
    };

    const toggleMaterial = (mat: string) => {
        if (data.materials.includes(mat)) {
            setData('materials', data.materials.filter(m => m !== mat));
        } else {
            setData('materials', [...data.materials, mat]);
        }
    };

    const addCustomSize = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && customSizeInput.trim()) {
            e.preventDefault();
            if (!data.sizes.includes(customSizeInput.trim())) {
                setData('sizes', [...data.sizes, customSizeInput.trim()]);
            }
            setCustomSizeInput('');
        }
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!data.tags.includes(tagInput.trim())) {
                setData('tags', [...data.tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/seller/products', {
            forceFormData: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        });
    };

    return (
        <>
            <Head title="Add Product - নতুন প্রোডাক্ট যুক্ত করুন" />

            <div className="max-w-7xl mx-auto space-y-6 pb-16">
                
                {/* ── 1. TOP PURPLE GRADIENT BANNER CARD ── */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white">
                            Add Product
                        </h1>
                        <p className="text-xs text-purple-100 font-medium mt-0.5">
                            নতুন প্রোডাক্ট যোগ করুন
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                            খসড়া হিসেবে সংরক্ষণ করুন
                        </button>
                        <button
                            type="button"
                            onClick={submit}
                            disabled={processing}
                            className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-violet-500/30 transition active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                            Add Product
                        </button>
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* ── LEFT COLUMN (8 / 12) ── */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* CARD 1: AI ASSISTANT & BASIC INFO */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-6">
                            
                            {/* AI Box */}
                            <div className="bg-emerald-50/70 border border-emerald-100/90 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 uppercase tracking-wide">
                                    <Wand2 size={16} className="text-emerald-600" />
                                    <span>AI সহায়তা</span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium">
                                    একটি ছোট ডেসক্রিপশন লিখুন এবং AI সাহায্যে আপনার প্রোডাক্টের নাম, বিবরণ পূরণ করুন:
                                </p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={aiHint}
                                        onChange={e => setAiHint(e.target.value)}
                                        placeholder="e.g. wireless bluetooth earbuds, noise cancelling"
                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAiGenerate}
                                        disabled={isAiGenerating}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-60 shrink-0"
                                    >
                                        <Wand2 size={14} />
                                        {isAiGenerating ? 'জেনারেট হচ্ছে...' : 'Generate'}
                                    </button>
                                </div>
                            </div>

                            {/* Product Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    প্রোডাক্টের নাম <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Type product name here"
                                    className="w-full bg-white border border-slate-200 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none transition shadow-2xs"
                                />
                                <p className="text-[11px] text-slate-400 font-medium mt-1">
                                    আমাদের সকল স্টক প্রোডাক্ট এর সাথে সাথে স্টক আপডেট লেবেল ব্যাকআউট হবে।
                                </p>
                                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    বিবরণ <span className="text-rose-500">*</span>
                                </label>
                                {/* Formatting toolbar mockup */}
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 text-xs text-slate-600 font-bold select-none">
                                        <span className="cursor-pointer hover:text-purple-600">B</span>
                                        <span className="cursor-pointer hover:text-purple-600 italic">I</span>
                                        <span className="cursor-pointer hover:text-purple-600 underline">U</span>
                                        <span className="cursor-pointer hover:text-purple-600 line-through">S</span>
                                        <span className="h-4 w-px bg-slate-300 mx-1" />
                                        <span className="cursor-pointer hover:text-purple-600">H1</span>
                                        <span className="cursor-pointer hover:text-purple-600">H2</span>
                                        <span className="cursor-pointer hover:text-purple-600">H3</span>
                                        <span className="h-4 w-px bg-slate-300 mx-1" />
                                        <span className="cursor-pointer hover:text-purple-600">• List</span>
                                        <span className="cursor-pointer hover:text-purple-600">1. List</span>
                                    </div>
                                    <textarea
                                        rows={4}
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Type description here"
                                        className="w-full p-4 text-sm font-medium text-slate-800 focus:outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* Specification */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    স্পেসিফিকেশন
                                </label>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center gap-2 text-xs text-slate-600 font-bold select-none">
                                        <span className="cursor-pointer hover:text-purple-600">B</span>
                                        <span className="cursor-pointer hover:text-purple-600 italic">I</span>
                                        <span className="cursor-pointer hover:text-purple-600 underline">U</span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        value={data.specification}
                                        onChange={e => setData('specification', e.target.value)}
                                        placeholder="Material, color, size, etc."
                                        className="w-full p-4 text-sm font-medium text-slate-800 focus:outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* SKU & Dropdowns */}
                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-bold text-slate-700">SKU</label>
                                        <button
                                            type="button"
                                            onClick={handleRegenerateSku}
                                            className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-1"
                                        >
                                            <RefreshCw size={12} /> SKU তৈরি করুন
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value)}
                                        placeholder="Product SKU"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">ক্যাটাগরি *</label>
                                        <select
                                            value={data.category_id}
                                            onChange={e => setData('category_id', e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                                        >
                                            <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Brand */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">ব্র্যান্ড</label>
                                        <select
                                            value={data.brand_id}
                                            onChange={e => setData('brand_id', e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                                        >
                                            <option value="">ব্র্যান্ড নির্বাচন করুন</option>
                                            {brands.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Unit */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">ইউনিট</label>
                                        <div className="flex gap-1.5">
                                            <select
                                                value={data.unit_id}
                                                onChange={e => setData('unit_id', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                                            >
                                                <option value="">ইউনিট নির্বাচন করুন</option>
                                                {units.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 rounded-xl hover:bg-emerald-100 transition"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: PRICE & STOCK */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
                            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                                মূল্য এবং স্টক
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">ক্রয় মূল্য</label>
                                    <input
                                        type="number"
                                        value={data.purchase_price}
                                        onChange={e => setData('purchase_price', e.target.value)}
                                        placeholder="Purchase Price"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">বিক্রয় মূল্য *</label>
                                    <input
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        placeholder="Regular Price"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">ছাড়ের মূল্য</label>
                                    <input
                                        type="number"
                                        value={data.sale_price}
                                        onChange={e => setData('sale_price', e.target.value)}
                                        placeholder="Discounted Price"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">স্টকের পরিমাণ</label>
                                    <input
                                        type="number"
                                        value={data.stock_quantity}
                                        onChange={e => setData('stock_quantity', e.target.value)}
                                        placeholder="Stock Quantity"
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pt-2 text-xs font-bold text-slate-700">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_retail}
                                        onChange={e => setData('is_retail', e.target.checked)}
                                        className="rounded text-purple-600 focus:ring-purple-500"
                                    />
                                    <span>খুচরা</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_wholesale}
                                        onChange={e => setData('is_wholesale', e.target.checked)}
                                        className="rounded text-purple-600 focus:ring-purple-500"
                                    />
                                    <span>পাইকারি</span>
                                </label>
                            </div>
                        </div>

                        {/* CARD 3: VARIANTS & ATTRIBUTES */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
                            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                                ভ্যারিয়েন্ট এবং অ্যাট্রিবিউট
                            </h2>

                            {/* Colors */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-slate-700">COLOR (কালার সিলেক্ট)</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAddColorModal(!showAddColorModal)}
                                        className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus size={14} /> + কাস্টম কালার যুক্ত করুন
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {colorsList.map(c => {
                                        const selected = data.colors.includes(c.hex);
                                        return (
                                            <button
                                                type="button"
                                                key={c.hex}
                                                onClick={() => toggleColor(c.hex)}
                                                style={{ backgroundColor: c.hex }}
                                                title={c.name}
                                                className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center cursor-pointer ${
                                                    selected ? 'border-purple-600 ring-2 ring-purple-400/50 scale-110' : 'border-slate-300'
                                                }`}
                                            >
                                                {selected && <Check size={12} className={c.hex.toLowerCase() === '#ffffff' ? 'text-slate-800 font-bold' : 'text-white'} />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom Color Input Inline Picker */}
                                {showAddColorModal && (
                                    <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 mt-2 flex flex-wrap items-center gap-3 animate-in fade-in zoom-in duration-150">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={customColorHex}
                                                onChange={e => setCustomColorHex(e.target.value)}
                                                className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                                            />
                                            <span className="text-xs font-mono font-bold text-purple-800">{customColorHex}</span>
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="কালারের নাম (e.g. Navy Blue)"
                                            value={customColorName}
                                            onChange={e => setCustomColorName(e.target.value)}
                                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 flex-1 min-w-[140px]"
                                        />
                                        <button 
                                            type="button"
                                            onClick={handleAddCustomColor}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus size={14} /> যোগ করুন
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Sizes */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-bold text-slate-700">SIZE (সাইজ সিলেক্ট)</label>
                                <div className="flex flex-wrap items-center gap-2">
                                    {sizesList.map(sz => {
                                        const selected = data.sizes.includes(sz);
                                        return (
                                            <button
                                                type="button"
                                                key={sz}
                                                onClick={() => toggleSize(sz)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                                    selected
                                                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                {sz}
                                            </button>
                                        );
                                    })}

                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="text"
                                            value={customSizeInput}
                                            onChange={e => setCustomSizeInput(e.target.value)}
                                            onKeyDown={handleAddCustomSize}
                                            placeholder="Custom size + Enter"
                                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 w-36"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCustomSize}
                                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition cursor-pointer flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Materials */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-bold text-slate-700">MATERIAL (ম্যাটেরিয়াল সিলেক্ট)</label>
                                <div className="flex flex-wrap items-center gap-2">
                                    {materialsList.map(mat => {
                                        const selected = data.materials.includes(mat);
                                        return (
                                            <button
                                                type="button"
                                                key={mat}
                                                onClick={() => toggleMaterial(mat)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                                                    selected
                                                        ? 'bg-purple-50 text-purple-700 border-purple-300 font-bold shadow-2xs'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                {mat}
                                            </button>
                                        );
                                    })}

                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="text"
                                            value={customMaterialInput}
                                            onChange={e => setCustomMaterialInput(e.target.value)}
                                            onKeyDown={handleAddCustomMaterial}
                                            placeholder="Custom material + Enter"
                                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-purple-500 w-44"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCustomMaterial}
                                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition cursor-pointer flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700">TAG (ট্যাগ সিলেক্ট)</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {data.tags.map(tg => (
                                        <span key={tg} className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                            {tg}
                                            <X size={12} className="cursor-pointer hover:text-purple-900" onClick={() => setData('tags', data.tags.filter(t => t !== tg))} />
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={addTag}
                                    placeholder="Adding tag + Enter"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        </div>

                        {/* CARD 4: SHIPPING & OTHERS */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
                            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                                শিপিং এবং আদার
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">সর্বনিম্ন অর্ডার পরিমাণ</label>
                                    <input
                                        type="text"
                                        value={data.min_order_qty}
                                        onChange={e => setData('min_order_qty', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">সর্বোচ্চ অর্ডার পরিমাণ</label>
                                    <input
                                        type="text"
                                        value={data.max_order_qty}
                                        onChange={e => setData('max_order_qty', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">ভিডিও লিঙ্ক (ইউটিউব)</label>
                                <input
                                    type="text"
                                    value={data.video_url}
                                    onChange={e => setData('video_url', e.target.value)}
                                    placeholder="https://youtube.com/..."
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-slate-700">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.free_shipping}
                                        onChange={e => setData('free_shipping', e.target.checked)}
                                        className="rounded text-purple-600 focus:ring-purple-500"
                                    />
                                    <span>ফ্রি শিপিং</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.cash_on_delivery}
                                        onChange={e => setData('cash_on_delivery', e.target.checked)}
                                        className="rounded text-purple-600 focus:ring-purple-500"
                                    />
                                    <span>ক্যাশ অন ডেলিভারি</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.replacement}
                                        onChange={e => setData('replacement', e.target.checked)}
                                        className="rounded text-purple-600 focus:ring-purple-500"
                                    />
                                    <span>রিপ্লেসমেন্ট</span>
                                </label>
                            </div>
                        </div>

                        {/* CARD 5: SEO (OPTIONAL) */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
                            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                                SEO (অপশনাল)
                            </h2>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">এসইও টাইটেল</label>
                                <input
                                    type="text"
                                    value={data.meta_title}
                                    onChange={e => setData('meta_title', e.target.value)}
                                    placeholder="Auto from product name if empty"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">এসইও বিবরণ</label>
                                <textarea
                                    rows={3}
                                    value={data.meta_description}
                                    onChange={e => setData('meta_description', e.target.value)}
                                    placeholder="Short SEO description"
                                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-800 resize-none"
                                />
                            </div>
                        </div>

                    </div>

                    {/* ── RIGHT COLUMN (4 / 12) ── */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* WEIGHT & WARRANTY */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-2">প্রোডাক্টের ওজন</label>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-700 mb-3">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" name="weight_type" defaultChecked className="text-purple-600" />
                                        <span>একক</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input type="radio" name="weight_type" className="text-purple-600" />
                                        <span>ভ্যারিয়েন্ট</span>
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    value={data.weight}
                                    onChange={e => setData('weight', e.target.value)}
                                    placeholder="Weight (kg)"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800"
                                />
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <WarrantySelector
                                    value={data.warranty}
                                    onChange={val => setData('warranty', val)}
                                />
                            </div>
                        </div>

                        {/* MEDIA UPLOAD CARD */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-5">
                            <label className="block text-xs font-bold text-slate-800">
                                প্রোডাক্টের ছবি বা ব্যানার আপলোড
                            </label>

                            {/* Main Thumbnail Upload */}
                            <div
                                onClick={() => mainImageRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-purple-50/30 transition cursor-pointer group"
                            >
                                <input type="file" ref={mainImageRef} onChange={handleMainImage} className="hidden" accept="image/*" />
                                {mainPreview ? (
                                    <div className="relative w-full aspect-square mx-auto">
                                        <img src={mainPreview} alt="Thumbnail" className="w-full h-full object-cover rounded-xl" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center text-white text-xs font-bold">
                                            Change Thumbnail
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                            <Upload size={20} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 mb-1">
                                            থাম্বনেইল (JPG, JPEG, PNG - সর্বোচ্চ 5MB)
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-medium">
                                            এখানে ড্র্যাগ করে আনুন অথবা ব্রাউজ করুন
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Gallery Images */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-700">অন্যান্য ছবি (Gallery)</span>
                                    <button
                                        type="button"
                                        onClick={() => galleryImageRef.current?.click()}
                                        className="text-xs font-bold text-purple-600 hover:underline"
                                    >
                                        + Add
                                    </button>
                                </div>
                                <input type="file" ref={galleryImageRef} onChange={handleGalleryImages} className="hidden" accept="image/*" multiple />

                                <div className="grid grid-cols-3 gap-2">
                                    {galleryPreviews.map((prev, i) => (
                                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                                            <img src={prev} alt="Gallery" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeGalleryImage(i)}
                                                className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    <div
                                        onClick={() => galleryImageRef.current?.click()}
                                        className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-purple-600 hover:border-purple-400 hover:bg-slate-50 cursor-pointer transition"
                                    >
                                        <Plus size={20} />
                                        <span className="text-[10px] font-bold mt-1">+ Add</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ── BOTTOM ACTIONS ── */}
                    <div className="lg:col-span-12 flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                        <Link
                            href="/seller/products"
                            className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="button"
                            className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                        >
                            খসড়া হিসেবে সংরক্ষণ করুন
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-7 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black shadow-lg shadow-violet-600/30 transition cursor-pointer disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Add Product'}
                        </button>
                    </div>

                </form>
            </div>
        </>
    );
}
