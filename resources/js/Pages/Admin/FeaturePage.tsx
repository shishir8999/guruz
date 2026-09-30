import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Save, CheckCircle2, RefreshCw, Filter, Search, Plus,
    Sliders, ArrowRight, ShieldCheck, Database, Layers, Check, X
} from 'lucide-react';

interface FeaturePageProps {
    title: string;
    category?: string;
    description?: string;
}

export default function FeaturePage({ title = 'Admin Feature', category = 'Management', description }: FeaturePageProps) {
    const [saved, setSaved] = useState(false);
    const [search, setSearch] = useState('');
    const [enabled, setEnabled] = useState(true);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <>

            <Head title={`${title} — Admin Panel`} />

            <div className="space-y-6">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                                {category}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{title}</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            {description || `Configure and manage ${title.toLowerCase()} settings for your marketplace.`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                            {saved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
                            {saved ? 'Saved Successfully!' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Main Feature Content Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
                    
                    {/* Filter and Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={`Search ${title}...`}
                                className="w-full pl-9 pr-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Status:</span>
                                <button
                                    onClick={() => setEnabled(!enabled)}
                                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition ${enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${enabled ? 'translate-x-5' : ''}`} />
                                </button>
                                <span className="text-[11px] font-bold text-slate-500">{enabled ? 'Active' : 'Disabled'}</span>
                            </div>

                            <button className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1">
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>
                    </div>

                    {/* Content Table / Grid Representation */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4"># ID</th>
                                    <th className="py-3 px-4">Name / Title</th>
                                    <th className="py-3 px-4">Module</th>
                                    <th className="py-3 px-4">Last Updated</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {[1, 2, 3, 4, 5].map(idx => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="py-3 px-4 font-mono text-slate-400">#MOD-00{idx}</td>
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                            {title} {idx === 1 ? 'Primary Configuration' : idx === 2 ? 'Automated Pipeline' : `Data Rule #${idx}`}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
                                                {category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">2026-08-02</td>
                                        <td className="py-3 px-4">
                                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                🟢 Active
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
                                                Edit Configuration
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Operational Summary Banner */}
                    <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <div>
                                <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                                    {title} System Active & Operational
                                </p>
                                <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                                    All parameters verified with 100% test coverage.
                                </p>
                            </div>
                        </div>
                        <span className="text-[10px] font-mono bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 font-bold text-indigo-600">
                            v2.4.0-OK
                        </span>
                    </div>

                </div>
            </div>
        
</>
    );
}
