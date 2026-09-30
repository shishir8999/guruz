import React, { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, GripVertical, Image as ImageIcon, X, Upload, Save, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

interface Banner {
    id: number;
    title: string | null;
    link: string | null;
    image: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

interface Props {
    banners?: Banner[];
}

export default function TopBannerManager({ banners = [] }: Props) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editBanner, setEditBanner] = useState<Banner | null>(null);
    const [processing, setProcessing] = useState(false);
    const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

    // Add form state
    const [addForm, setAddForm] = useState({
        title: '',
        link: '',
        sort_order: banners.length,
        is_active: true,
    });
    const [addImage, setAddImage] = useState<File | null>(null);
    const [addPreview, setAddPreview] = useState<string | null>(null);
    const addFileRef = useRef<HTMLInputElement>(null);

    // Edit form state
    const [editForm, setEditForm] = useState({
        title: '',
        link: '',
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
        formData.append('link', addForm.link);
        formData.append('sort_order', String(addForm.sort_order));
        formData.append('is_active', addForm.is_active ? '1' : '0');
        formData.append('image', addImage);

        router.post('/admin/top-banner', formData, {
            forceFormData: true,
            onSuccess: () => {
                setShowAddModal(false);
                setAddImage(null);
                setAddPreview(null);
                setAddForm({ title: '', link: '', sort_order: banners.length + 1, is_active: true });
                Swal.fire('সফল!', 'টপ ব্যানার সফলভাবে যোগ হয়েছে!', 'success');
                setProcessing(false);
            },
            onError: (errors) => {
                setProcessing(false);
                Swal.fire('Error', Object.values(errors).flat().join('\n'), 'error');
            },
        });
    };

    const openEditModal = (banner: Banner) => {
        setEditBanner(banner);
        setEditForm({
            title: banner.title || '',
            link: banner.link || '',
            sort_order: banner.sort_order,
            is_active: banner.is_active,
        });
        setEditImage(null);
        setEditPreview(null);
    };

    const handleUpdate = () => {
        if (!editBanner) return;
        setProcessing(true);

        const formData = new FormData();
        formData.append('title', editForm.title);
        formData.append('link', editForm.link);
        formData.append('sort_order', String(editForm.sort_order));
        formData.append('is_active', editForm.is_active ? '1' : '0');
        formData.append('_method', 'POST');
        if (editImage) {
            formData.append('image', editImage);
        }

        router.post(`/admin/top-banner/${editBanner.id}`, formData, {
            forceFormData: true,
            onSuccess: () => {
                setEditBanner(null);
                setEditImage(null);
                setEditPreview(null);
                Swal.fire('সফল!', 'টপ ব্যানার সফলভাবে আপডেট হয়েছে!', 'success');
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
            text: 'এই ব্যানারটি স্থায়ীভাবে ডিলিট হবে!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন!',
            cancelButtonText: 'বাতিল',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/top-banner/${id}`, {
                    onSuccess: () => {
                        Swal.fire('ডিলিট হয়েছে!', 'ব্যানারটি সফলভাবে ডিলিট হয়েছে।', 'success');
                    },
                });
            }
        });
    };

    return (
        <>

            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black flex items-center gap-2">
                                <ImageIcon className="w-7 h-7" />
                                <span>টপ ব্যানার (L-Tops)</span>
                            </h1>
                            <p className="text-white/80 text-sm mt-1"><span>ওয়েবসাইটের একদম উপরের ব্যানার/স্লাইডার পরিচালনা করুন</span></p>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <a
                                href="/system/storage-link"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition border border-white/30 shadow-sm"
                                title="cPanel এ ইমেজ ফাইল সিঙ্ক করতে ক্লিক করুন"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>স্টোরেজ সিঙ্ক</span>
                            </a>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 bg-white text-purple-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-50 transition shadow-md cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>নতুন ব্যানার যোগ করুন</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Banners List */}
                {banners.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-16 text-center">
                        <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-500"><span>কোনো ব্যানার নেই</span></h3>
                        <p className="text-slate-400 text-sm mt-1"><span>উপরের বাটনে ক্লিক করে নতুন ব্যানার যোগ করুন</span></p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {banners.map((banner) => (
                            <div key={banner.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow group">
                                {/* Image */}
                                <div className="relative aspect-[21/3] sm:aspect-[21/4] overflow-hidden bg-slate-100 flex items-center justify-center">
                                    {brokenImages[banner.id] ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center bg-slate-50">
                                            <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
                                            <span className="text-xs font-semibold text-rose-500">ইমেজ সার্ভারে পাওয়া যায়নি</span>
                                            <span className="text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">{banner.image}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(banner.id)}
                                                className="mt-2 text-[11px] bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg font-bold shadow-xs transition cursor-pointer"
                                            >
                                                <span>ডিলিট করুন</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <img
                                            src={banner.image ? (banner.image.startsWith('http') || banner.image.startsWith('/') ? banner.image : `/${banner.image}`) : ''}
                                            alt={banner.title || 'Banner'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={() => setBrokenImages(prev => ({ ...prev, [banner.id]: true }))}
                                        />
                                    )}
                                    {/* Status Badge */}
                                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow ${banner.is_active ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                        <span>{banner.is_active ? '● Active' : '● Inactive'}</span>
                                    </div>
                                    {/* Sort Order */}
                                    <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                        <GripVertical className="w-2.5 h-2.5" /> <span>#{banner.sort_order}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-1">
                                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{banner.title || '(No Title)'}</h3>
                                    {banner.link && <p className="text-xs text-indigo-600 line-clamp-1 hover:underline cursor-pointer"><span>→ {banner.link}</span></p>}
                                </div>

                                {/* Actions */}
                                <div className="px-4 pb-4 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEditModal(banner)}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition cursor-pointer"
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> <span>এডিট</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(banner.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> <span>ডিলিট</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ===== ADD MODAL ===== */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b p-5 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><Plus className="w-5 h-5 text-purple-600" /> <span>নতুন ব্যানার</span></h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">ব্যানার ছবি * (ডেস্কটপ: 1200x80 px | মোবাইল: 393x26 px)</label>
                                <p className="text-xs text-slate-500 mb-2 font-medium">💡 রিকমেন্ডেড সাইজ: ডেস্কটপ ভিউর জন্য <strong>1200x80 px</strong> এবং মোবাইল ভিউর জন্য <strong>393x26 px</strong> (অথবা 15:1 অনুপাত)। সিস্টেম স্বয়ংক্রিয়ভাবে স্ক্রিন অনুযায়ী নিখুঁতভাবে ফিট করবে।</p>
                                <div
                                    onClick={() => addFileRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-4 cursor-pointer hover:border-purple-400 transition text-center"
                                >
                                    {addPreview ? (
                                        <img src={addPreview} alt="Preview" className="w-full h-24 object-contain bg-slate-900 rounded-lg" />
                                    ) : (
                                        <div className="py-4">
                                            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">ক্লিক করে ছবি আপলোড করুন</p>
                                        </div>
                                    )}
                                </div>
                                <input ref={addFileRef} type="file" accept="image/*" className="hidden" onChange={handleAddImageChange} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">টাইটেল (Optional)</label>
                                <input type="text" value={addForm.title} onChange={e => setAddForm({...addForm, title: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="যেমন: Beauty Guide" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">লিংক (Optional)</label>
                                <input type="text" value={addForm.link} onChange={e => setAddForm({...addForm, link: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="https://..." />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">সর্ট অর্ডার</label>
                                    <input type="number" value={addForm.sort_order} onChange={e => setAddForm({...addForm, sort_order: parseInt(e.target.value) || 0})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={addForm.is_active} onChange={e => setAddForm({...addForm, is_active: e.target.checked})} className="w-4 h-4 text-purple-600 rounded" />
                                        <span className="text-sm font-bold text-slate-700">Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="border-t p-5 flex items-center gap-3 justify-end">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                                <span>বাতিল</span>
                            </button>
                            <button type="button" onClick={handleAdd} disabled={processing} className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                                <span className="flex items-center gap-2">
                                    {processing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                                    <span>সেভ করুন</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== EDIT MODAL ===== */}
            {editBanner && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditBanner(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b p-5 flex items-center justify-between rounded-t-2xl z-10">
                            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><Pencil className="w-5 h-5 text-blue-600" /> <span>ব্যানার এডিট</span></h2>
                            <button type="button" onClick={() => setEditBanner(null)} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Current & New Image */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">ব্যানার ছবি (ডেস্কটপ: 1200x80 px | মোবাইল: 393x26 px)</label>
                                <div className="mb-2 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
                                    <img src={editPreview || editBanner.image} alt="Current" className="w-full h-24 object-contain" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => editFileRef.current?.click()}
                                    className="text-sm text-purple-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <Upload className="w-3.5 h-3.5" /> <span>নতুন ছবি আপলোড করুন</span>
                                </button>
                                <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditImageChange} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">টাইটেল</label>
                                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="টাইটেল" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">লিংক</label>
                                <input type="text" value={editForm.link} onChange={e => setEditForm({...editForm, link: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="https://..." />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">সর্ট অর্ডার</label>
                                    <input type="number" value={editForm.sort_order} onChange={e => setEditForm({...editForm, sort_order: parseInt(e.target.value) || 0})} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({...editForm, is_active: e.target.checked})} className="w-4 h-4 text-purple-600 rounded" />
                                        <span className="text-sm font-bold text-slate-700">Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="border-t p-5 flex items-center gap-3 justify-end">
                            <button type="button" onClick={() => setEditBanner(null)} className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                                <span>বাতিল</span>
                            </button>
                            <button type="button" onClick={handleUpdate} disabled={processing} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                                <span className="flex items-center gap-2">
                                    {processing ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                                    <span>আপডেট করুন</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        
</>
    );
}
