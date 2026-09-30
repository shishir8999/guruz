import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Shield, Save } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SecuritySettings({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        require_strong_password: settings?.require_strong_password ?? true,
        max_login_attempts: settings?.max_login_attempts ?? 5,
        session_timeout: settings?.session_timeout ?? 120,
        force_ssl: settings?.force_ssl ?? true,
        admin_url_prefix: settings?.admin_url_prefix ?? 'admin',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/security/settings', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'সিকিউরিটি সেটিংস সফলভাবে সেভ হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    return (
        <>
            <Head title="Security Settings — Admin" />
            
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Security Settings</h1>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Configure global security rules, login limits, and session policies.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Max Login Attempts</label>
                            <input 
                                type="number" 
                                value={data.max_login_attempts}
                                onChange={e => setData('max_login_attempts', parseInt(e.target.value) || 0)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-slate-500">Number of failed logins before IP lockout.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Session Timeout (Minutes)</label>
                            <input 
                                type="number" 
                                value={data.session_timeout}
                                onChange={e => setData('session_timeout', parseInt(e.target.value) || 0)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Admin URL Prefix</label>
                            <input 
                                type="text" 
                                value={data.admin_url_prefix}
                                onChange={e => setData('admin_url_prefix', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-[10px] text-slate-500">Change this to hide your admin panel from attackers (e.g. /my-secret-admin).</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={!!data.require_strong_password}
                                onChange={e => setData('require_strong_password', e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <div>
                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Require Strong Passwords</div>
                                <div className="text-xs text-slate-500">Enforce uppercase, numbers, and symbols for admin accounts.</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={!!data.force_ssl}
                                onChange={e => setData('force_ssl', e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <div>
                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Force SSL (HTTPS)</div>
                                <div className="text-xs text-slate-500">Redirect all traffic to secure HTTPS.</div>
                            </div>
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" disabled={processing} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50">
                            <Save className="w-4 h-4" /> {processing ? 'Saving...' : 'Save Security Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
