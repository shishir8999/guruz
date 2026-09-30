import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { RefreshCw, Search, Filter, Plus, Copy, Trash2, Key, ShieldOff, Eye, EyeOff, X, Check, ShieldAlert, Code, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface ApiKeyItem {
    id: number;
    key_id: string;
    name: string;
    key?: string;
    fullKey: string;
    permissions: string[];
    lastUsed: string;
    status: 'Active' | 'Revoked';
}

interface ApiKeysProps {
    apiKeys?: ApiKeyItem[];
}

export default function ApiKeys({ apiKeys = [] }: ApiKeysProps) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showKeyId, setShowKeyId] = useState<string | number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [configModalKey, setConfigModalKey] = useState<ApiKeyItem | null>(null);
    const [copiedKeyId, setCopiedKeyId] = useState<string | number | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        permissions: ['Read', 'Write'],
    });

    const openCopyConfigModal = (apiKey: ApiKeyItem) => {
        setConfigModalKey(apiKey);
    };

    const handleCopyToken = (text: string, id: string | number) => {
        navigator.clipboard.writeText(text);
        setCopiedKeyId(id);
        setTimeout(() => setCopiedKeyId(null), 3000);

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'API Key copied to clipboard!',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/api/keys', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'নতুন এপিআই কী সফলভাবে তৈরি হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleRevoke = (apiKey: ApiKeyItem) => {
        const actionText = apiKey.status === 'Active' ? 'Revoke' : 'Re-activate';
        Swal.fire({
            title: `${actionText} API Key?`,
            text: `Are you sure you want to ${actionText.toLowerCase()} key "${apiKey.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F59E0B',
            cancelButtonColor: '#6B7280',
            confirmButtonText: `Yes, ${actionText}`,
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/admin/api/keys/${apiKey.id}/revoke`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: `API Key ${apiKey.status === 'Active' ? 'Revoked' : 'Re-activated'}!`,
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const handleDelete = (apiKey: ApiKeyItem) => {
        Swal.fire({
            title: 'Delete API Key?',
            text: `Are you sure you want to permanently delete "${apiKey.name}"? External apps using this key will lose access immediately.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/api/keys/${apiKey.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (configModalKey?.id === apiKey.id) {
                            setConfigModalKey(null);
                        }
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'API Key deleted successfully!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const togglePermission = (perm: string) => {
        if (data.permissions.includes(perm)) {
            setData('permissions', data.permissions.filter(p => p !== perm));
        } else {
            setData('permissions', [...data.permissions, perm]);
        }
    };

    const filteredKeys = apiKeys.filter(k => {
        const matchesSearch = k.name.toLowerCase().includes(search.toLowerCase()) ||
                              k.key_id.toLowerCase().includes(search.toLowerCase()) ||
                              k.fullKey.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || k.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <Head title="API Keys — Admin" />

            <div className="space-y-6 max-w-full">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                API Management
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">API Keys</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage API keys for external integrations, mobile apps, and developer access.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => router.get('/admin/api/keys')}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Create New Key
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
                                placeholder="Search keys by name or prefix..."
                                className="w-full pl-9 pr-4 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-950 transition"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Revoked">Revoked</option>
                            </select>
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Key ID</th>
                                    <th className="py-3 px-4">Key Name</th>
                                    <th className="py-3 px-4">API Key Token</th>
                                    <th className="py-3 px-4">Permissions</th>
                                    <th className="py-3 px-4">Last Used</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {filteredKeys.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                                            <Key className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p className="font-bold text-sm">কোনো এপিআই কী পাওয়া যায়নি</p>
                                            <p className="text-xs mt-1">নতুন এপিআই কী তৈরি করতে "Create New Key" বাটনে ক্লিক করুন।</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredKeys.map((apiKey) => (
                                        <tr key={apiKey.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                                            <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 font-bold">{apiKey.key_id}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg shrink-0">
                                                        <Key className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                                    </div>
                                                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={apiKey.name}>
                                                        {apiKey.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 w-fit">
                                                    <span className="font-mono text-slate-600 dark:text-slate-400">
                                                        {showKeyId === apiKey.id ? apiKey.fullKey : (apiKey.key || apiKey.fullKey)}
                                                    </span>
                                                    <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-700 pl-2 ml-1">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setShowKeyId(showKeyId === apiKey.id ? null : apiKey.id)}
                                                            className="text-slate-400 hover:text-blue-600 transition cursor-pointer"
                                                            title={showKeyId === apiKey.id ? "Hide Key" : "Show Key"}
                                                        >
                                                            {showKeyId === apiKey.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                        </button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => openCopyConfigModal(apiKey)}
                                                            className="text-slate-400 hover:text-blue-600 transition cursor-pointer p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                                            title="Copy & View Key Configuration"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {(apiKey.permissions || []).map(p => (
                                                        <span key={p} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 dark:text-slate-300">
                                                            {p}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500">{apiKey.lastUsed || 'Never'}</td>
                                            <td className="py-3 px-4">
                                                {apiKey.status === 'Active' && <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Active</span>}
                                                {apiKey.status === 'Revoked' && <span className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400 text-[10px] px-2 py-0.5 rounded-full font-bold">Revoked</span>}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRevoke(apiKey)}
                                                        className={`p-1.5 rounded-lg transition cursor-pointer ${apiKey.status === 'Active' ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
                                                        title={apiKey.status === 'Active' ? "Revoke Key" : "Re-activate Key"}
                                                    >
                                                        <ShieldOff className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(apiKey)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition cursor-pointer"
                                                        title="Delete Key"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* API Key Configuration & Copy Popup Modal */}
            {configModalKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl">
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                                        API Key Configuration & Credentials
                                    </h2>
                                    <p className="text-[11px] font-semibold text-slate-500">
                                        Integration token details for {configModalKey.key_id}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setConfigModalKey(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 space-y-5">
                            {/* Key Info Header */}
                            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                                <div>
                                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Key Name</div>
                                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{configModalKey.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Status</div>
                                    {configModalKey.status === 'Active' ? (
                                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                                            Revoked
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Full Token Display Box */}
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Secret Key Token
                                </label>
                                <div className="relative flex items-center bg-slate-900 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-blue-400 break-all select-all">
                                    <span className="pr-12">{configModalKey.fullKey}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyToken(configModalKey.fullKey, configModalKey.id)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                                    >
                                        {copiedKeyId === configModalKey.id ? (
                                            <>
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3.5 h-3.5" /> Copy Key
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Permissions & Scopes */}
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Granted Access Permissions
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {(configModalKey.permissions || []).map(perm => (
                                        <span key={perm} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 px-2.5 py-1 rounded-lg text-xs font-bold font-mono">
                                            {perm}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Example HTTP Header Integration */}
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <Code className="w-3.5 h-3.5" /> Header Configuration Snippet
                                </label>
                                <div className="bg-slate-900 dark:bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                                    <span className="text-purple-400">Authorization:</span> Bearer {configModalKey.fullKey}
                                </div>
                            </div>

                            {/* Security Warning Alert */}
                            <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3 rounded-xl text-amber-800 dark:text-amber-300 text-xs">
                                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <span className="font-bold">Security Notice:</span> Keep this API key safe and confidential. Do not expose it in front-end code or public repositories.
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <button
                                type="button"
                                onClick={() => handleCopyToken(configModalKey.fullKey, configModalKey.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <Copy className="w-4 h-4" /> Copy & Close
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfigModalKey(null)}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Key className="w-4 h-4 text-blue-500" /> Create New API Key
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Key Name / Purpose <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g. Mobile App Integration"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                                    Permissions
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['Read', 'Write', 'Delete', 'Full Access'].map(perm => (
                                        <button
                                            type="button"
                                            key={perm}
                                            onClick={() => togglePermission(perm)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${data.permissions.includes(perm) ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
                                        >
                                            {data.permissions.includes(perm) && <Check className="w-3.5 h-3.5" />}
                                            {perm}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Generating...' : 'Generate API Key'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}