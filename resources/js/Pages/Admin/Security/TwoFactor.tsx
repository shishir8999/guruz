import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ShieldCheck, ToggleLeft, ToggleRight, QrCode, Key, Copy, Check, Smartphone, Lock } from 'lucide-react';
import Swal from 'sweetalert2';

interface User2FA {
    id: number;
    name: string;
    email: string;
    phone?: string;
    two_factor_enabled: boolean;
    secret_key: string;
}

export default function TwoFactor({ users }: { users: User2FA[] }) {
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<User2FA | null>(null);

    const handleToggle = (id: number) => {
        router.post(`/admin/security/two-factor/${id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: '2FA Authenticator Status Updated!',
                    showConfirmButton: false,
                    timer: 2500,
                });
            }
        });
    };

    const copySecret = (id: number, secret: string) => {
        navigator.clipboard.writeText(secret);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <>
            <Head title="Google Authenticator (2FA) — Security Settings" />
            
            <div className="space-y-6">
                
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black flex items-center gap-2">
                            <ShieldCheck className="w-7 h-7 text-emerald-400" />
                            Google Authenticator (2FA) Security
                        </h1>
                        <p className="text-xs text-purple-200">
                            সুপার অ্যাডমিন ও অন্যান্য ব্যবহারকারীদের ২FA অথেন্টিকেটর অ্যাপ সিকিউরিটি নিয়ন্ত্রণ করুন।
                        </p>
                    </div>
                </div>

                {/* Users 2FA Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-purple-600" />
                            User Authenticator Accounts
                        </h3>
                        <span className="text-xs font-semibold text-slate-500">Total Users: {users.length}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-400 font-black uppercase text-[10px] border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-4">User Details</th>
                                    <th className="py-3.5 px-4">Email & Phone</th>
                                    <th className="py-3.5 px-4">Secret Key</th>
                                    <th className="py-3.5 px-4">2FA Status</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                                        <td className="py-3.5 px-4">
                                            <div className="font-extrabold text-slate-900 dark:text-white">{user.name}</div>
                                            <div className="text-[10px] text-slate-400">ID: #{user.id}</div>
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                                            <div>{user.email}</div>
                                            {user.phone && <div className="text-[11px] text-slate-400">{user.phone}</div>}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-1.5">
                                                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-[11px] font-mono text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-slate-700">
                                                    {user.secret_key}
                                                </code>
                                                <button
                                                    onClick={() => copySecret(user.id, user.secret_key)}
                                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                                                    title="Copy Secret Key"
                                                >
                                                    {copiedId === user.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            {user.two_factor_enabled ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-500/30">
                                                    <ShieldCheck className="w-3.5 h-3.5" /> Enabled
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-bold">
                                                    <Lock className="w-3.5 h-3.5" /> Disabled
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                                    title="Show QR Setup"
                                                >
                                                    <QrCode className="w-4 h-4 text-purple-600" /> QR Code
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(user.id)}
                                                    className="p-1 text-slate-500 hover:text-purple-600 transition cursor-pointer"
                                                    title={user.two_factor_enabled ? "Disable 2FA" : "Enable 2FA"}
                                                >
                                                    {user.two_factor_enabled ? (
                                                        <ToggleRight className="w-8 h-8 text-purple-600" />
                                                    ) : (
                                                        <ToggleLeft className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* QR Code Setup Modal */}
                {selectedUser && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center" onClick={e => e.stopPropagation()}>
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mx-auto">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Google Authenticator Setup</h3>
                                <p className="text-xs text-slate-500 mt-1">{selectedUser.name} ({selectedUser.email})</p>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                                <div className="p-3 bg-white rounded-xl inline-block shadow-xs border">
                                    {/* Generated QR visual placeholder with high precision */}
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`otpauth://totp/Guruz:${selectedUser.email}?secret=${selectedUser.secret_key}&issuer=Guruz`)}`} 
                                        alt="2FA QR Code" 
                                        className="w-40 h-40 mx-auto rounded-lg"
                                    />
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono font-bold break-all bg-purple-50 dark:bg-purple-950/40 p-2 rounded-lg border border-purple-200 dark:border-purple-800/50">
                                    Key: {selectedUser.secret_key}
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedUser(null)}
                                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
