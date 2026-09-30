import React, { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, GripVertical, Image as ImageIcon, Eye, EyeOff, X, Upload, Save, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

interface Slider {
    id: number;
    title: string | null;
    subtitle: string | null;
    button_text: string | null;
    button_link: string | null;
    image: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

interface Props {
    sliders: Slider[];
}

export default function HeroSliderManager({ sliders }: Props) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editSlider, setEditSlider] = useState<Slider | null>(null);
    const [processing, setProcessing] = useState(false);
    const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

    // Add form state
    const [addForm, setAddForm] = useState({
        title: '',
        subtitle: '',
        button_text: '',
        button_link: '',
        sort_order: sliders.length,
        is_active: true,
    });
    const [addImage, setAddImage] = useState<File | null>(null);
    const [addPreview, setAddPreview] = useState<string | null>(null);
    const addFileRef = useRef<HTMLInputElement>(null);

    // Edit form state
    const [editForm, setEditForm] = useState({
        title: '',
        subtitle: '',
        button_text: '',
        button_link: '',
        sort_order: 0,
        is_active: true,
    });
    const [editImage, setEditImage] = useState<File | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const editFileRef = useRef<HTMLInputElement>(null);

    const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAddImage(file);
            setAddPreview(URL.createObjectURL(file));
        }
    };

    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setEditImage(file);
            setEditPreview(URL.createObjectURL(file));
        }
    };

    const handleAdd = () => {
        if (!addImage) {
            Swal.fire('Error', 'অনুগ্রহ করে একটি ছবি আপলোড করুন!', 'error');
            return;
        }

        setProcessing(true);
        const formData = new FormData();
        formData.append('title', addForm.title);
        formData.append('subtitle', addForm.subtitle);
        formData.append('button_text', addForm.button_text);
        formData.append('button_link', addForm.button_link);
        formData.append('sort_order', String(addForm.sort_order));
        formData.append('is_active', addForm.is_active ? '1' : '0');
        formData.append('image', addImage);

        router.post('/admin/appearance/hero-slider', formData, {
            forceFormData: true,
            onSuccess: () => {
                setShowAddModal(false);
                setAddImage(null);
                setAddPreview(null);
                setAddForm({ title: '', subtitle: '', button_text: '', button_link: '', sort_order: sliders.length + 1, is_active: true });
                Swal.fire('সফল!', 'স্লাইডার সফলভাবে যোগ হয়েছে!', 'success');
                setProcessing(false);
            },
            onError: (errors) => {
                setProcessing(false);
                Swal.fire('Error', Object.values(errors).flat().join('\n'), 'error');
            },
        });
    };

    const openEditModal = (slider: Slider) => {
        setEditSlider(slider);
        setEditForm({
            title: slider.title || '',
            subtitle: slider.subtitle || '',
            button_text: slider.button_text || '',
            button_link: slider.button_link || '',
            sort_order: slider.sort_order,
            is_active: slider.is_active,
        });
        setEditImage(null);
        setEditPreview(null);
    };

    const handleUpdate = () => {
        if (!editSlider) return;
        setProcessing(true);

        const formData = new FormData();
        formData.append('title', editForm.title);
        formData.append('subtitle', editForm.subtitle);
        formData.append('button_text', editForm.button_text);
        formData.append('button_link', editForm.button_link);
        formData.append('sort_order', String(editForm.sort_order));
        formData.append('is_active', editForm.is_active ? '1' : '0');
        formData.append('_method', 'POST');
        if (editImage) {
            formData.append('image', editImage);
        }

        router.post(`/admin/appearance/hero-slider/${editSlider.id}`, formData, {
            forceFormData: true,
            onSuccess: () => {
                setEditSlider(null);
                setEditImage(null);
                setEditPreview(null);
                Swal.fire('সফল!', 'স্লাইডার সফলভাবে আপডেট হয়েছে!', 'success');
                setProcessing(false);
            },
            onError: (errors) => {
                setProcessing(false);
                Swal.fire('Error', Object.values(errors).flat().join('\n'), 'error');
            },
        });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: 'এই স্লাইডারটি স্থায়ীভাবে ডিলিট হবে!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/appearance/hero-slider/${id}`, {
                    onSuccess: () => {
                        Swal.fire('ডিলিট হয়েছে!', 'স্লাইডারটি সফলভাবে ডিলিট হয়েছে।', 'success');
                    },
                });
            }
        });
    };

    return (
        <div className="space-y-6 notranslate" translate="no">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black flex items-center gap-2">
                            <ImageIcon className="w-7 h-7" /> <span>হিরো স্লাইডার ম্যানেজার</span>
                        </h1>
                        <p className="text-white/80 text-sm mt-1"><span>হোম পেজের হিরো স্লাইডার যোগ, এডিট এবং ডিলিট করুন</span></p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <a
                            href="/system/storage-link"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition border border-white/30 shadow-sm"
                            title="cPanel এ ইমেজ ফাইল সিঙ্ক করতে ক্লিক করুন"
                        >
                            <RefreshCw className="w-4 h-4" /> <span>স্টোরেজ সিঙ্ক</span>
                        </a>
                        <button
                            type="button"
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition shadow-md cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> <span>নতুন স্লাইডার যোগ করুন</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sliders Grid */}
            {sliders.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-16 text-center">
                    <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-500"><span>কোনো স্লাইডার নেই</span></h3>
                    <p className="text-slate-400 text-sm mt-1"><span>উপরের বাটনে ক্লিক করে নতুন স্লাইডার যোগ করুন</span></p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {sliders.map((slider) => (
                        <div key={slider.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
                            {/* Image */}
                            <div className="relative aspect-[16/7] overflow-hidden bg-slate-100 flex items-center justify-center">
                                {brokenImages[slider.id] ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center bg-slate-50">
                                        <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
                                        <span className="text-xs font-semibold text-rose-500">ইমেজ সার্ভারে পাওয়া যায়নি</span>
                                        <span className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">{slider.image}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(slider.id)}
                                            className="mt-2 text-[11px] bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-bold shadow-xs transition cursor-pointer"
                                        >
                                            <span>ডিলিট করুন</span>
                                        </button>
                                    </div>
                                ) : (
                                    <img
                                        src={slider.image ? (slider.image.startsWith('http') || slider.image.startsWith('/') ? slider.image : `/${slider.image}`) : ''}
                                        alt={slider.title || 'Slider'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={() => setBrokenImages(prev => ({ ...prev, [slider.id]: true }))}
                                    />
                                )}
                                {/* Status Badge */}
                                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow ${slider.is_active ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                    <span>{slider.is_active ? '● Active' : '● Inactive'}</span>
                                </div>
                                {/* Sort Order */}
                                <div className="absolute top-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <GripVertical className="w-3 h-3" /> <span>#{slider.sort_order}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-2">
                                <h3 className="font-bold text-slate-900 text-base line-clamp-1"><span>{slider.title || '(No Title)'}</span></h3>
                                {slider.subtitle && <p className="text-xs text-slate-500 line-clamp-1"><span>{slider.subtitle}</span></p>}
                                {slider.button_text && (
                                    <div className="flex items-center gap-2 text-xs text-indigo-600">
                                        <span className="bg-indigo-50 px-2 py-0.5 rounded font-semibold">{slider.button_text}</span>
                                        {slider.button_link && <span className="text-slate-400 truncate max-w-[150px]">→ {slider.button_link}</span>}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="px-4 pb-4 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => openEditModal(slider)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition cursor-pointer"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> <span>এডিট</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(slider.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> <span>ডিলিট</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== ADD MODAL ===== */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 notranslate" translate="no" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b p-5 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-600" /> <span>নতুন স্লাইডার</span>
                            </h2>
                            <button type="button" onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5"><span>স্লাইডার ছবি * (যেকোনো সাইজ)</span></label>
                                <p className="text-xs text-slate-500 mb-2 font-medium">💡 <span>যেকোনো সাইজ বা রেশিওর ব্যানার ছবি আপলোড করতে পারবেন। অ্যাম্বিয়েন্ট ব্লার ব্যাকড্রপের মাধ্যমে সিস্টেম স্বয়ংক্রিয়ভাবে ডিসপ্লেতে নিখুঁতভাবে ফিট করে নিবে।</span></p>
                                <div
                                    onClick={() => addFileRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 cursor-pointer transition text-center group"
                                >
                                    {addPreview ? (
                                        <div className="relative">
                                            <img src={addPreview} alt="Preview" className="w-full aspect-[16/7] object-cover rounded-lg" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-xs font-bold gap-1.5">
                                                <Upload className="w-4 h-4" /> <span>অন্য ছবি নির্বাচন করুন</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <Upload className="w-10 h-10 text-slate-300 group-hover:text-indigo-500 mx-auto mb-2 transition-colors" />
                                            <p className="text-sm text-slate-500 font-semibold"><span>ক্লিক করে ছবি আপলোড করুন</span></p>
                                            <p className="text-xs text-slate-400 mt-1"><span>PNG, JPG, WEBP (যেকোনো ডাইমেনশন সাপোর্ট করে)</span></p>
                                        </div>
                                    )}
                                </div>
                                <input ref={addFileRef} type="file" accept="image/*" className="hidden" onChange={handleAddImageChange} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1"><span>টাইটেল (Title)</span></label>
                                <input type="text" value={addForm.title} onChange={e => setAddForm({...addForm, title: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="স্লাইডার টাইটেল লিখুন" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1"><span>সাবটাইটেল (Subtitle)</span></label>
                                <input type="text" value={addForm.subtitle} onChange={e => setAddForm({...addForm, subtitle: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="সাবটাইটেল লিখুন" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1"><span>বাটন টেক্সট</span></label>
                                    <input type="text" value={addForm.button_text} onChange={e => setAddForm({...addForm, button_text: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Shop Now" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1"><span>বাটন লিংক</span></label>
                                    <input type="text" value={addForm.button_link} onChange={e => setAddForm({...addForm, button_link: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="/products" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1"><span>সর্ট অর্ডার</span></label>
                                    <input type="number" value={addForm.sort_order} onChange={e => setAddForm({...addForm, sort_order: parseInt(e.target.value) || 0})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={addForm.is_active} onChange={e => setAddForm({...addForm, is_active: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                                        <span className="text-sm font-bold text-slate-700"><span>সক্রিয় (Active)</span></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="border-t p-5 flex items-center gap-3 justify-end">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                                <span>বাতিল</span>
                            </button>
                            <button type="button" onClick={handleAdd} disabled={processing} className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                                {processing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                                <span>সেভ করুন</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== EDIT MODAL ===== */}
            {editSlider && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 notranslate" translate="no" onClick={() => setEditSlider(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b p-5 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-blue-600" /> <span>স্লাইডার এডিট</span>
                            </h2>
                            <button type="button" onClick={() => setEditSlider(null)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Current & New Image */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-bold text-slate-700"><span>স্লাইডার ছবি</span></label>
                                    {editPreview && (
                                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            <span>✓ নতুন ছবি নির্বাচিত</span>
                                        </span>
                                    )}
                                </div>
                                <div
                                    onClick={() => editFileRef.current?.click()}
                                    className="mb-2 relative aspect-[16/7] overflow-hidden bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 flex items-center justify-center cursor-pointer group transition"
                                    title="ছবি পরিবর্তন করতে ক্লিক করুন"
                                >
                                    <img
                                        src={editPreview || (editSlider.image.startsWith('http') || editSlider.image.startsWith('/') ? editSlider.image : `/${editSlider.image}`)}
                                        alt="Current"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.currentTarget;
                                            target.style.display = 'none';
                                            const fallback = target.parentElement?.querySelector('.edit-modal-fallback') as HTMLElement;
                                            if (fallback) fallback.style.display = 'flex';
                                        }}
                                    />
                                    <div className="edit-modal-fallback hidden flex-col items-center justify-center text-slate-400 p-4 text-center">
                                        <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
                                        <span className="text-xs font-semibold text-slate-500"><span>পুরোনো ছবিটি সার্ভারে পাওয়া যায়নি</span></span>
                                        <span className="text-[10px] text-slate-400 mt-0.5"><span>ক্লিক করে নতুন ছবি আপলোড করুন</span></span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 p-2 text-center">
                                        <Upload className="w-5 h-5 mb-0.5" />
                                        <span>ছবি পরিবর্তন করতে ক্লিক করুন</span>
                                        <span className="text-[10px] text-white/80 font-normal">PNG, JPG, WEBP</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => editFileRef.current?.click()}
                                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <Upload className="w-3.5 h-3.5" /> <span>নতুন ছবি আপলোড করতে ক্লিক করুন</span>
                                </button>
                                <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditImageChange} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1"><span>টাইটেল (Title)</span></label>
                                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="স্লাইডার টাইটেল লিখুন" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1"><span>সাবটাইটেল (Subtitle)</span></label>
                                <input type="text" value={editForm.subtitle} onChange={e => setEditForm({...editForm, subtitle: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="সাবটাইটেল লিখুন" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1"><span>বাটন টেক্সট</span></label>
                                    <input type="text" value={editForm.button_text} onChange={e => setEditForm({...editForm, button_text: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Shop Now" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1"><span>বাটন লিংক</span></label>
                                    <input type="text" value={editForm.button_link} onChange={e => setEditForm({...editForm, button_link: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="/products" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1"><span>সর্ট অর্ডার</span></label>
                                    <input type="number" value={editForm.sort_order} onChange={e => setEditForm({...editForm, sort_order: parseInt(e.target.value) || 0})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({...editForm, is_active: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="text-sm font-bold text-slate-700"><span>সক্রিয় (Active)</span></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="border-t p-5 flex items-center gap-3 justify-end">
                            <button type="button" onClick={() => setEditSlider(null)} className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                                <span>বাতিল</span>
                            </button>
                            <button type="button" onClick={handleUpdate} disabled={processing} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                                {processing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                                <span>আপডেট করুন</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
