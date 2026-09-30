import { router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ShieldCheck, Plus, Check, Save, CheckCircle2, User, KeyRound } from 'lucide-react';

interface StaffUser {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'staff';
    is_full_access: boolean;
    allowed_modules: string[];
}

export default function StaffPermissions({ staffUsers }: { staffUsers: StaffUser[] }) {
    const { errors, flash } = usePage().props as any;
    
    const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
    const [newEmail, setNewEmail] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [passwordPrompt, setPasswordPrompt] = useState<{ isOpen: boolean, action: Function | null, message: string }>({ isOpen: false, action: null, message: '' });
    const [adminPassword, setAdminPassword] = useState('');

    const systemModules = [
        { id: 'overview', label: 'OVERVIEW (Dashboard & Analytics)' },
        { id: 'management', label: 'MANAGEMENT (Users, Staff, Roles)' },
        { id: 'finance', label: 'FINANCE (Billing, Payment Gateway)' },
        { id: 'commerce', label: 'COMMERCE (E-Commerce, Vendors, Courier)' },
        { id: 'communication', label: 'COMMUNICATION (Forms, Submissions)' },
        { id: 'insights', label: 'INSIGHTS (Reports, Customer Analytics)' },
        { id: 'customization', label: 'CUSTOMIZATION (CMS, Appearance)' },
        { id: 'system', label: 'SYSTEM (Settings, API Keys)' },
        { id: 'growth', label: 'GROWTH (Promotions, Affiliates)' },
        { id: 'utilities', label: 'UTILITIES (Logs, Backup)' },
    ];

    const requirePassword = (message: string, action: Function) => {
        setAdminPassword('');
        setPasswordPrompt({ isOpen: true, message, action });
    };

    const confirmPasswordAction = () => {
        if (!adminPassword) return;
        if (passwordPrompt.action) {
            passwordPrompt.action(adminPassword);
        }
        setPasswordPrompt({ isOpen: false, action: null, message: '' });
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;

        requirePassword(`Adding ${newEmail} as staff requires password verification.`, (password: string) => {
            router.post(route('staff.add'), { email: newEmail, password }, {
                onSuccess: () => {
                    setNewEmail('');
                    setSuccessMsg(`Added ${newEmail} to admin-level staff!`);
                    setTimeout(() => setSuccessMsg(''), 4000);
                }
            });
        });
    };

    const toggleFullAccess = () => {
        if (!selectedUser) return;
        
        requirePassword(`Toggling full access for ${selectedUser.name} requires password verification.`, (password: string) => {
            router.post(route('staff.toggle-full-access', selectedUser.id), { password }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Update local state to reflect UI instantly
                    setSelectedUser({ ...selectedUser, is_full_access: !selectedUser.is_full_access });
                }
            });
        });
    };

    const toggleModule = (modId: string) => {
        if (!selectedUser) return;
        
        requirePassword(`Changing module access for ${selectedUser.name} requires password verification.`, (password: string) => {
            router.post(route('staff.toggle-module', selectedUser.id), { module: modId, password }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Update local state to reflect UI instantly
                    const exists = selectedUser.allowed_modules.includes(modId);
                    const updatedMods = exists
                        ? selectedUser.allowed_modules.filter(m => m !== modId)
                        : [...selectedUser.allowed_modules, modId];
                    setSelectedUser({ ...selectedUser, allowed_modules: updatedMods });
                }
            });
        });
    };

    const handleSaveRules = () => {
        setSuccessMsg(`Access permissions saved!`);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    return (
        <>

            <Head title="Staff Permissions — Admin Panel" />

            <div className="space-y-6">

                {/* Header Title + Subtitle matching screenshot #2 */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-purple-600" /> Staff Permissions
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed max-w-4xl">
                        Super admin এখান থেকে প্রতিটি এডমিন-স্তরের ব্যবহারকারীকে আলাদা করে কোন কোন সেকশনে access দিবে তা নির্ধারণ করতে পারবে। যাদের <strong className="text-slate-800 dark:text-slate-200 font-bold">Full access (*)</strong> দেয়া থাকবে তারা সব সেকশন দেখবে; নয়তো শুধু টিক দেওয়া সেকশনগুলোই দেখা যাবে।
                    </p>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {flash.success}
                    </div>
                )}
                {errors?.password && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-red-600" />
                        {errors.password}
                    </div>
                )}

                {/* Add Admin Staff Email Card matching screenshot #2 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                        Add an existing user as admin-level staff (by email)
                    </label>

                    <form onSubmit={handleAddUser} className="flex gap-3">
                        <input
                            type="email"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            placeholder="user@example.com"
                            required
                            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            type="submit"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" /> Add
                        </button>
                    </form>
                </div>

                {/* 2-Column Grid Layout matching screenshot #2 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column: Admin User List matching screenshot #2 */}
                    <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs max-h-[500px] overflow-y-auto space-y-2">
                        {staffUsers.map(u => {
                            const isSelected = selectedUser?.id === u.id;
                            const modCount = u.is_full_access ? 'Full access' : `${u.allowed_modules.length} modules`;

                            return (
                                <div
                                    key={u.id}
                                    onClick={() => setSelectedUser(u)}
                                    className={`p-3 rounded-xl cursor-pointer transition border ${
                                        isSelected
                                            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800'
                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-xs text-slate-900 dark:text-white">{u.name}</p>
                                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                            <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase ${
                                                u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {u.role}
                                            </span>

                                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                                u.is_full_access
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                            }`}>
                                                {modCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Column: Permission Config Matrix matching screenshot #2 */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs min-h-[400px] flex flex-col justify-between">
                        {!selectedUser ? (
                            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold py-20 text-center">
                                বামপাশ থেকে একজন অ্যাডমিন সিলেক্ট করো।
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                                    <div>
                                        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            <User className="w-5 h-5 text-purple-600" /> {selectedUser.name} ({selectedUser.email})
                                        </h2>
                                        <p className="text-xs text-slate-500 font-semibold mt-0.5">Select modules allowed for this user.</p>
                                    </div>

                                    <button
                                        onClick={handleSaveRules}
                                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" /> Save
                                    </button>
                                </div>

                                {/* Full Access Checkbox */}
                                <div
                                    onClick={toggleFullAccess}
                                    className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                                        selectedUser.is_full_access
                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                                    }`}
                                >
                                    <div>
                                        <p className="font-black text-xs text-slate-900 dark:text-white">Full Access (*)</p>
                                        <p className="text-[11px] text-slate-500 font-semibold">Grant unrestricted access to all 10 system categories</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition ${selectedUser.is_full_access ? 'bg-emerald-600 text-white' : 'border border-slate-300'}`}>
                                        {selectedUser.is_full_access && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                </div>

                                {/* Section Modules Checkboxes */}
                                {!selectedUser.is_full_access && (
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-black uppercase text-slate-400">Select Specific Modules:</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {systemModules.map(m => {
                                                const isChecked = selectedUser.allowed_modules.includes(m.id);
                                                return (
                                                    <div
                                                        key={m.id}
                                                        onClick={() => toggleModule(m.id)}
                                                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                                                            isChecked
                                                                ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800'
                                                                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                                                        }`}
                                                    >
                                                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{m.label}</span>
                                                        <div className={`w-4 h-4 rounded-md flex items-center justify-center transition ${isChecked ? 'bg-purple-600 text-white' : 'border border-slate-300'}`}>
                                                            {isChecked && <Check className="w-3 h-3" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* Password Verification Modal */}
            {passwordPrompt.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
                                <KeyRound className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Security Verification</h2>
                            <p className="text-xs text-center text-slate-500 font-semibold mb-6">{passwordPrompt.message}</p>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Admin Password</label>
                                    <input 
                                        type="password" 
                                        value={adminPassword}
                                        onChange={e => setAdminPassword(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Enter your password to confirm..."
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && confirmPasswordAction()}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => setPasswordPrompt({ isOpen: false, action: null, message: '' })}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-3 rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={confirmPasswordAction}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs"
                                    >
                                        Verify & Proceed
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        
</>
    );
}
