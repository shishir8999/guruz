import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Crown, Plus, ShieldCheck, Key, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

interface SuperAdminUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    last_signin?: string;
    hash_id?: string;
}

interface SuperAdminsProps {
    admins?: SuperAdminUser[];
}

export default function SuperAdmins({ admins }: SuperAdminsProps) {
    const [emailToPromote, setEmailToPromote] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const { errors } = usePage().props as any;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowModal(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const superAdminList: SuperAdminUser[] = (admins && admins.length > 0) ? admins : [
        {
            id: 1,
            name: 'shishir89',
            email: 'shishirbarai019@gmail.com',
            phone: '—',
            last_signin: '8/2/2026, 7:11:55 AM',
            hash_id: 'd8ea3bdb..'
        }
    ];

    const handlePromote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailToPromote) return;

        router.post('/admin/super-admins/promote', { email: emailToPromote }, {
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `User ${emailToPromote} promoted to Super Admin!`,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
                setEmailToPromote('');
            }
        });
    };

    const handleCreateNewAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !newName || !newPassword) return;

        router.post('/admin/super-admins/create', {
            name: newName,
            email: newEmail,
            password: newPassword
        }, {
            onSuccess: () => {
                setShowModal(false);
                setNewName('');
                setNewEmail('');
                setNewPassword('');
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'New Super Admin created successfully!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleResetPassword = (userId: number, email: string) => {
        Swal.fire({
            title: `Reset Password for ${email}`,
            input: 'password',
            inputLabel: 'Enter new password',
            inputPlaceholder: 'New password...',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Update Password',
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#64748b',
            preConfirm: (pass) => {
                if (!pass) {
                    Swal.showValidationMessage('Please enter a new password');
                }
                return pass;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                router.post(`/admin/super-admins/${userId}/reset-password`, { password: result.value }, {
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: `Password updated for ${email}!`,
                            showConfirmButton: false,
                            timer: 3000,
                        });
                    }
                });
            }
        });
    };

    const handleRevoke = (userId: number, name: string) => {
        Swal.fire({
            title: 'Revoke Super Admin?',
            text: `Are you sure you want to revoke Super Admin privileges from ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, revoke',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/admin/super-admins/${userId}/revoke`, {}, { 
                    preserveState: false,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: `Super Admin privileges revoked from ${name}.`,
                            showConfirmButton: false,
                            timer: 3000,
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Super Admins — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                            <Crown className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-purple-100">
                                USER MANAGEMENT
                            </span>
                            <h1 className="text-2xl font-black tracking-tight mt-1">Super Admins</h1>
                            <p className="text-xs font-semibold text-purple-100 opacity-90 mt-0.5">
                                Manage platform Super Administrators.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-white hover:bg-slate-100 text-purple-700 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> New Super Admin
                    </button>
                </div>

                {/* Promote Existing User Form */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-600" /> Promote Existing User to Super Admin
                    </h2>
                    <form onSubmit={handlePromote} className="flex gap-3 max-w-lg">
                        <input
                            type="email"
                            value={emailToPromote}
                            onChange={e => setEmailToPromote(e.target.value)}
                            placeholder="Enter user email..."
                            required
                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                        >
                            Promote
                        </button>
                    </form>
                </div>

                {/* Super Admin List Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">NAME</th>
                                    <th className="py-3 px-4">EMAIL</th>
                                    <th className="py-3 px-4">LAST SIGNIN</th>
                                    <th className="py-3 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {superAdminList.map(admin => (
                                    <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                                            {admin.name}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono">{admin.email}</td>
                                        <td className="py-3.5 px-4 text-slate-500">{admin.last_signin || '—'}</td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleResetPassword(admin.id, admin.email)}
                                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer border border-indigo-200 dark:border-indigo-900/50"
                                                >
                                                    <Key className="w-3 h-3" /> Reset Password
                                                </button>
                                                <button
                                                    onClick={() => handleRevoke(admin.id, admin.name)}
                                                    className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 text-xs font-bold px-3 py-1 rounded-xl transition flex items-center gap-1 cursor-pointer border border-rose-200 dark:border-rose-900/50"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Revoke
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Create New Super Admin Modal */}
            {showModal && (
                <div 
                    onClick={() => setShowModal(false)}
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
                    >
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Crown className="w-5 h-5 text-purple-600" /> Create Super Admin
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateNewAdmin} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {errors?.name && <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {errors?.email && <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                {errors?.password && <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.password}</p>}
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
                                >
                                    Create Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
