import { Head, useForm } from '@inertiajs/react';
import React, { useState, FormEventHandler } from 'react';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';

export default function ResetPassword({ token, email }: { token: string, email: string }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/reset-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Reset Password" />
            <div className="min-h-screen bg-[#060b19] flex items-center justify-center font-sans p-4">
                <div className="w-full max-w-md">
                    <div className="bg-[#0b1329] border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden text-white">
                        
                        {/* Glow Effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/20 rounded-full blur-[50px] -z-10"></div>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                                <span className="text-orange-500">Reset</span> Password
                            </h2>
                            <p className="text-slate-400 text-sm">
                                Enter your new password below.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-slate-300 text-[10px] font-bold uppercase mb-1.5">Email / Mobile Phone</label>
                                <input
                                    id="email"
                                    type="text"
                                    name="email"
                                    value={data.email || ''}
                                    className="w-full bg-slate-900/90 text-white border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition font-medium"
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter your email or phone"
                                    required
                                />
                                {errors.email && <div className="text-rose-400 text-xs mt-1 font-medium">{errors.email}</div>}
                            </div>

                            <div>
                                <label className="block text-slate-300 text-[10px] font-bold uppercase mb-1.5">New Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        className="w-full bg-slate-900/90 text-white border border-slate-700/80 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-orange-500 transition"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Min 8 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <div className="text-rose-400 text-xs mt-1 font-medium">{errors.password}</div>}
                            </div>

                            <div>
                                <label className="block text-slate-300 text-[10px] font-bold uppercase mb-1.5">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="w-full bg-slate-900/90 text-white border border-slate-700/80 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-orange-500 transition"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Re-enter new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password_confirmation && <div className="text-rose-400 text-xs mt-1 font-medium">{errors.password_confirmation}</div>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full mt-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Updating Password...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
