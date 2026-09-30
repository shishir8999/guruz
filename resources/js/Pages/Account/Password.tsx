import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { KeyRound, ShieldCheck, Eye, EyeOff, Save } from 'lucide-react';
import AccountLayout from '@/Layouts/CustomerLayout';
import { useState } from 'react';

export default function Password() {
    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const toggleVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/account/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="Change Password" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Change Password</h1>
                    <p className="text-slate-500 text-sm mt-1">Update your password to keep your account secure.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Information sidebar */}
                        <div className="lg:col-span-1 space-y-6 border-r-0 lg:border-r lg:border-slate-100 lg:pr-8">
                            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                                <KeyRound size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg mb-2">Password Requirements</h3>
                                <ul className="space-y-3 text-sm text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Minimum 8 characters long</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span>At least one uppercase and one lowercase letter</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span>At least one number or special character</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={submit} className="space-y-6 max-w-md">
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.current ? 'text' : 'password'}
                                            value={data.current_password}
                                            onChange={e => setData('current_password', e.target.value)}
                                            className="w-full border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-slate-800"
                                            placeholder="Enter your current password"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => toggleVisibility('current')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.current_password && <p className="text-rose-500 text-sm mt-1">{errors.current_password}</p>}
                                </div>

                                <hr className="border-slate-100" />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            className="w-full border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-slate-800"
                                            placeholder="Create a strong new password"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => toggleVisibility('new')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-rose-500 text-sm mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                            className="w-full border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-slate-800"
                                            placeholder="Confirm your new password"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => toggleVisibility('confirm')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && <p className="text-rose-500 text-sm mt-1">{errors.password_confirmation}</p>}
                                </div>

                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-rose-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-rose-700 transition shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <Save size={18} />
                                        {processing ? 'Saving Changes...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
