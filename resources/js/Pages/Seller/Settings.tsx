import React, { useState, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Settings as SettingsIcon, Save, Camera, Store, MapPin, Phone, Globe, Mail, CheckCircle2 } from 'lucide-react';
import SellerLayout from '@/Layouts/SellerLayout';
import Swal from 'sweetalert2';

export default function Settings({ shop }: any) {
    const [logoPreview, setLogoPreview] = useState(shop.logo_url || 'https://via.placeholder.com/150');
    const [coverPreview, setCoverPreview] = useState(shop.banner_url || 'https://via.placeholder.com/1200x300?text=Cover+Photo');
    const logoInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: shop.name || '',
        phone: shop.phone || '',
        email: shop.email || '',
        description: shop.description || '',
        address: shop.address || '',
        city: shop.city || '',
        website: shop.website || '',
        logo: null as File | null,
        cover: null as File | null,
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'cover') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData(type, file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                if (type === 'logo') setLogoPreview(e.target?.result as string);
                if (type === 'cover') setCoverPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name || '');
        formData.append('phone', data.phone || '');
        formData.append('email', data.email || '');
        formData.append('description', data.description || '');
        formData.append('address', data.address || '');
        formData.append('city', data.city || '');
        formData.append('website', data.website || '');

        if (data.logo instanceof File) {
            formData.append('logo', data.logo);
        }
        if (data.cover instanceof File) {
            formData.append('cover', data.cover);
        }

        router.post('/seller/settings', formData, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    position: 'center',
                    title: 'সফলভাবে সেভ হয়েছে! 🎉',
                    text: 'আপনার শপ সেটিংস, লোগো এবং প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে।',
                    icon: 'success',
                    showConfirmButton: true,
                    confirmButtonText: 'ঠিক আছে',
                    confirmButtonColor: '#4f46e5',
                    background: '#ffffff',
                    customClass: {
                        popup: 'rounded-3xl shadow-2xl p-8 max-w-md mx-auto text-center',
                        confirmButton: 'px-8 py-3 rounded-2xl font-bold text-sm shadow-md',
                    },
                    timer: 4000,
                    timerProgressBar: true,
                });
            },
            onError: (errs) => {
                const firstErr = Object.values(errs)[0] || 'তথ্যাদি সঠিকভাবে পূরণ করুন।';
                Swal.fire({
                    position: 'center',
                    title: 'সেভ করা যায়নি!',
                    text: String(firstErr),
                    icon: 'error',
                    confirmButtonText: 'ঠিক আছে',
                    confirmButtonColor: '#ef4444',
                    customClass: {
                        popup: 'rounded-3xl shadow-2xl p-8 max-w-md mx-auto text-center',
                        confirmButton: 'px-8 py-3 rounded-2xl font-bold text-sm shadow-md',
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Shop Settings" />

            <div className="max-w-5xl mx-auto space-y-6 pb-20">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <SettingsIcon className="w-7 h-7 text-indigo-600" />
                            Shop Settings
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Configure your public store profile and contact information</p>
                    </div>
                    <button 
                        type="button"
                        onClick={submit}
                        disabled={processing}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-70 shadow-sm shadow-indigo-200 cursor-pointer"
                    >
                        <Save className="w-4 h-4" />
                        {processing ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    
                    {/* Visuals Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        {/* Cover Image */}
                        <div className="relative h-64 bg-slate-100 group">
                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button 
                                    type="button" 
                                    onClick={() => coverInputRef.current?.click()}
                                    className="flex items-center gap-2 bg-white/90 backdrop-blur text-slate-800 px-4 py-2 rounded-lg font-medium hover:bg-white transition cursor-pointer"
                                >
                                    <Camera className="w-4 h-4" /> Change Cover Photo
                                </button>
                                <input 
                                    type="file" 
                                    ref={coverInputRef}
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'cover')}
                                />
                            </div>
                        </div>

                        {/* Logo & Basic Info */}
                        <div className="px-6 pb-8 sm:px-10 relative">
                            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 mb-6">
                                <div className="relative group w-32 h-32 rounded-2xl border-4 border-white shadow-md bg-white overflow-hidden shrink-0">
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                    <div 
                                        onClick={() => logoInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    >
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={logoInputRef}
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'logo')}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-slate-800">{data.name || 'Your Shop Name'}</h2>
                                    <p className="text-sm text-slate-500">Seller ID: #{shop?.id || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Shop Name *</label>
                                    <div className="relative">
                                        <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                        <input 
                                            type="text" 
                                            value={data.name} 
                                            onChange={e => setData('name', e.target.value)}
                                            className="w-full pl-10 border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium"
                                            placeholder="My Awesome Shop"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Email Address *</label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                        <input 
                                            type="email" 
                                            value={data.email} 
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full pl-10 border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium"
                                            placeholder="shop@example.com"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            {/* Contact Info */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <MapPin className="w-5 h-5 text-indigo-600" /> Location & Contact
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Phone Number *</label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                                            <input 
                                                type="text" 
                                                value={data.phone} 
                                                onChange={e => setData('phone', e.target.value)}
                                                className="w-full pl-10 border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium"
                                                placeholder="+8801700000000"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Address *</label>
                                        <textarea 
                                            value={data.address} 
                                            onChange={e => setData('address', e.target.value)}
                                            rows={2}
                                            className="w-full border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            placeholder="House / Shop No, Road Name, Area"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">City / District</label>
                                            <input 
                                                type="text" 
                                                value={data.city} 
                                                onChange={e => setData('city', e.target.value)}
                                                className="w-full border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium"
                                                placeholder="Dhaka, Chittagong, etc."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-slate-400" /> Website (Optional)
                                            </label>
                                            <input 
                                                type="text" 
                                                value={data.website} 
                                                onChange={e => setData('website', e.target.value)}
                                                className="w-full border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-indigo-500 text-sm font-medium"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">About Shop</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <textarea 
                                        value={data.description} 
                                        onChange={e => setData('description', e.target.value)}
                                        rows={6}
                                        className="w-full border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 resize-none text-sm"
                                        placeholder="Tell customers what your shop is about, your specialties, etc..."
                                    />
                                </div>
                                <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <p className="text-sm text-indigo-800 font-bold">Pro Tip 💡</p>
                                    <p className="text-xs text-indigo-600 mt-1 leading-relaxed">
                                        Shops with well-written descriptions and clear cover photos get 40% more trust from buyers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Prominent Save Button */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-slate-800 text-base">Save Changes</h4>
                            <p className="text-xs text-slate-500">Make sure all details are accurate before saving.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            {processing ? 'Saving Changes...' : 'Save Settings'}
                        </button>
                    </div>

                </form>
            </div>
        </>
    );
}

Settings.layout = (page: any) => <SellerLayout children={page} />;
