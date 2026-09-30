import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { props } = usePage<any>();
    const siteLogo = props.siteSettings?.site_logo || null;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login - Guruz" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
                <div className="w-full max-w-md px-8 py-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                    <div className="text-center mb-8 notranslate" translate="no">
                        {siteLogo ? (
                            <img src={siteLogo} alt="Guruz" className="h-14 sm:h-16 mx-auto mb-4 object-contain notranslate" translate="no" />
                        ) : (
                            <div className="flex justify-center mb-4 notranslate" translate="no">
                                <span className="text-white font-black text-3xl tracking-tight notranslate" translate="no">
                                    guruz<span className="text-emerald-400">bd</span>
                                </span>
                            </div>
                        )}
                        <h1 className="text-3xl font-bold text-white mb-2 notranslate" translate="no">Welcome Back</h1>
                        <p className="text-slate-400 notranslate" translate="no">Sign in to your Guruz account</p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                                placeholder="you@example.com"
                                required
                            />
                            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition focus:outline-none"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-slate-400 text-sm cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="rounded"
                                />
                                Remember me
                            </label>
                            <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                        >
                            {processing ? 'Signing in...' : 'Sign In'}
                        </button>
                        
                        <div className="relative flex items-center my-6">
                            <div className="flex-grow border-t border-slate-700"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">Or</span>
                            <div className="flex-grow border-t border-slate-700"></div>
                        </div>

                        <a
                            href="/auth/google"
                            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-slate-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
                        >
                            <FcGoogle className="w-5 h-5" />
                            Sign in with Google
                        </a>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
