import React, { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { User, Save, Upload, MapPin, Briefcase, Phone, Mail, Link as LinkIcon } from 'lucide-react';

export default function AdminProfile({ profile }: { profile: any }) {
    const { data, setData, post, processing } = useForm({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        designation: profile.designation,
        department: profile.department,
        address: profile.address,
        facebook: profile.facebook,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        avatar: null as File | null,
    });

    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('avatar', file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/profile/me', {
            preserveScroll: true
        });
    };

    return (
        <>

            <Head title="My Profile — Admin" />
            
            <div className="space-y-6 max-w-5xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <User className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Admin Profile</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Avatar & Quick Info */}
                    <div className="col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-center">
                            <div className="relative inline-block mb-4">
                                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-400 mx-auto overflow-hidden ring-4 ring-white dark:ring-slate-900 shadow-md">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        data.full_name.charAt(0)
                                    )}
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition transform hover:scale-110"
                                >
                                    <Upload className="w-4 h-4" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleImageChange} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{data.full_name}</h2>
                            <p className="text-sm text-slate-500 font-semibold">{data.designation}</p>
                            
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <Mail className="w-4 h-4 text-slate-400" /> {data.email}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <Phone className="w-4 h-4 text-slate-400" /> {data.phone}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <Briefcase className="w-4 h-4 text-slate-400" /> {data.department}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <MapPin className="w-4 h-4 text-slate-400" /> {data.address}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="col-span-1 lg:col-span-2">
                        <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Personal Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                                    <input type="text" value={data.full_name} onChange={e => setData('full_name', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                                    <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                                    <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Address</label>
                                    <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Professional Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Designation</label>
                                    <input type="text" value={data.designation} onChange={e => setData('designation', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
                                    <input type="text" value={data.department} onChange={e => setData('department', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Social Links</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5"/> Facebook</label>
                                    <input type="url" value={data.facebook} onChange={e => setData('facebook', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5"/> LinkedIn</label>
                                    <input type="url" value={data.linkedin} onChange={e => setData('linkedin', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end">
                                <button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-2">
                                    <Save className="w-4 h-4" /> Save Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        
</>
    );
}
