import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { RefreshCw, Save, Settings, ShieldAlert, Server, Database } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SystemConfig({ config }: { config?: Record<string, string> }) {
    const [activeTab, setActiveTab] = useState('general');
    const [optimizing, setOptimizing] = useState(false);

    const { data, setData, post, processing } = useForm({
        app_name: config?.app_name || 'Guruz E-Commerce',
        app_url: config?.app_url || 'http://127.0.0.1:8000',
        timezone: config?.timezone || 'Asia/Dhaka',
        app_debug: config?.app_debug === 'true' || config?.app_debug === '1',
        force_https: config?.force_https === 'true' || config?.force_https === '1',
        maintenance_mode: config?.maintenance_mode === 'true' || config?.maintenance_mode === '1',
        bypass_token: config?.bypass_token || 'secret-access-123',
        maintenance_message: config?.maintenance_message || 'We are currently undergoing scheduled maintenance. Please check back soon.',
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/system/config', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'System Config saved successfully!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            },
            onError: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Failed to save config.',
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        });
    };

    const handleOptimize = () => {
        setOptimizing(true);
        router.post('/admin/system/optimize', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setOptimizing(false);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'System Optimization completed successfully!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            },
            onError: () => {
                setOptimizing(false);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Optimization failed.',
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        });
    };

    return (
        <>
            <Head title="System Config — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                                System Settings
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">System Config</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage core application environment, caching, and maintenance parameters.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={processing}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : 'Save Config'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Sidebar Tabs */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                        <button 
                            type="button"
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition cursor-pointer ${activeTab === 'general' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
                        >
                            <Settings className="w-5 h-5" /> General Info
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('environment')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition cursor-pointer ${activeTab === 'environment' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
                        >
                            <Server className="w-5 h-5" /> Environment
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('database')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition cursor-pointer ${activeTab === 'database' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
                        >
                            <Database className="w-5 h-5" /> Database Optimization
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('maintenance')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition cursor-pointer ${activeTab === 'maintenance' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
                        >
                            <ShieldAlert className="w-5 h-5" /> Maintenance Mode
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden h-full">
                            
                            {activeTab === 'general' && (
                                <div>
                                    <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
                                        <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">General Info</h2>
                                    </div>
                                    <div className="p-6 space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                                    Application Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.app_name}
                                                    onChange={e => setData('app_name', e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:text-white transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                                    App URL
                                                </label>
                                                <input
                                                    type="url"
                                                    value={data.app_url}
                                                    onChange={e => setData('app_url', e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:text-white transition"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                                Timezone
                                            </label>
                                            <select
                                                value={data.timezone}
                                                onChange={e => setData('timezone', e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:text-white transition cursor-pointer"
                                            >
                                                <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                                                <option value="UTC">UTC (GMT+0)</option>
                                                <option value="America/New_York">America/New_York (GMT-5)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'environment' && (
                                <div>
                                    <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
                                        <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Environment Settings</h2>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">App Debug Mode</h3>
                                                <p className="text-xs font-semibold text-slate-500 mt-0.5">Show detailed error messages. Disable in production.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.app_debug}
                                                    onChange={e => setData('app_debug', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Force HTTPS</h3>
                                                <p className="text-xs font-semibold text-slate-500 mt-0.5">Automatically redirect all traffic to secure HTTPS.</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.force_https}
                                                    onChange={e => setData('force_https', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'database' && (
                                <div>
                                    <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
                                        <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Database Optimization</h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-4">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg h-fit">
                                                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clear Cache & Optimize</h3>
                                                <p className="text-xs font-semibold text-slate-500 mt-1 mb-3 leading-relaxed">
                                                    Running this command will clear application cache, route cache, config cache, and view cache. It also re-compiles routes and config files for optimal performance.
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={handleOptimize}
                                                    disabled={optimizing}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                                                >
                                                    {optimizing ? 'Running Optimization...' : 'Run Optimization'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'maintenance' && (
                                <div>
                                    <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
                                        <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Maintenance Mode</h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="border border-rose-200 dark:border-rose-900/50 rounded-xl overflow-hidden">
                                            <div className="p-5 flex justify-between items-center bg-white dark:bg-slate-900">
                                                <div className="flex gap-4">
                                                    <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg h-fit">
                                                        <ShieldAlert className="w-5 h-5 text-rose-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enable Maintenance Mode</h3>
                                                        <p className="text-xs font-semibold text-slate-500 mt-1 max-w-md">
                                                            When enabled, the application will display a custom maintenance page to all visitors. Admins can bypass this using a secret token.
                                                        </p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.maintenance_mode}
                                                        onChange={e => setData('maintenance_mode', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                                                </label>
                                            </div>
                                            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                                                <div>
                                                    <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                                        Bypass Secret Token
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.bypass_token}
                                                        onChange={e => setData('bypass_token', e.target.value)}
                                                        placeholder="e.g. secret-access-123"
                                                        className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 dark:text-white transition"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                                        Maintenance Message
                                                    </label>
                                                    <textarea
                                                        rows={3}
                                                        value={data.maintenance_message}
                                                        onChange={e => setData('maintenance_message', e.target.value)}
                                                        className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-rose-500 focus:border-rose-500 dark:text-white transition"
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>

                </div>
            </div>
        </>
    );
}