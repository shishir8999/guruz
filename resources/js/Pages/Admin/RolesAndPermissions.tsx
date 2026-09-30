import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { ShieldCheck, Plus, Check, Save, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface RoleItem {
    id: number;
    name: string;
    description: string;
    permissions: string[];
}

export default function RolesAndPermissions({ initialRoles = [] }: { initialRoles?: RoleItem[] }) {
    const [roles, setRoles] = useState<RoleItem[]>(initialRoles);
    const [selectedRole, setSelectedRole] = useState<RoleItem | null>(() => initialRoles[0] || null);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDesc, setNewRoleDesc] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        setRoles(initialRoles);
        if (selectedRole) {
            const updated = initialRoles.find(r => r.id === selectedRole.id);
            if (updated) setSelectedRole(updated);
        } else if (initialRoles.length > 0) {
            setSelectedRole(initialRoles[0]);
        }
    }, [initialRoles]);

    const availablePermissions = [
        { id: 'dashboard', label: 'Dashboard & Analytics' },
        { id: 'users', label: 'User Management (All Users, Super Admins)' },
        { id: 'staff', label: 'Staff Management (List, Attendance, Salary)' },
        { id: 'roles', label: 'Role & Permissions' },
        { id: 'finance', label: 'Finance & Payments' },
        { id: 'commerce', label: 'E-Commerce & Vendor Management' },
        { id: 'cms', label: 'CMS & Customization' },
        { id: 'settings', label: 'System Settings & Integrations' },
    ];

    const handleAddRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRoleName) return;

        const newRole: RoleItem = {
            id: Date.now(),
            name: newRoleName,
            description: newRoleDesc || 'Custom admin role',
            permissions: ['dashboard'],
        };

        const updatedRoles = [...roles, newRole];
        setRoles(updatedRoles);
        setSelectedRole(newRole);
        setNewRoleName('');
        setNewRoleDesc('');

        router.post('/admin/roles/list', { roles: updatedRoles }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Role '${newRoleName}' created successfully!`, showConfirmButton: false, timer: 3000, timerProgressBar: true });
            }
        });
    };

    const togglePermission = (permId: string) => {
        if (!selectedRole) return;

        const exists = selectedRole.permissions.includes(permId);
        const updatedPerms = exists
            ? selectedRole.permissions.filter(p => p !== permId)
            : [...selectedRole.permissions, permId];

        const updatedRole = { ...selectedRole, permissions: updatedPerms };
        setSelectedRole(updatedRole);
        setRoles(roles.map(r => r.id === selectedRole.id ? updatedRole : r));
    };

    const handleSavePermissions = () => {
        router.post('/admin/roles/list', { roles }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Permissions saved for role '${selectedRole?.name}'!`,
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
                    title: 'Failed to save permissions.',
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        });
    };

    return (
        <>

            <Head title="Roles & Permissions — Admin Panel" />

            <div className="space-y-6">

                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Roles & Permissions</h1>

                {/* Alert Notification */}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {successMsg}
                    </div>
                )}

                {/* 2-Column Grid Layout matching screenshot #1 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left Column: Create Role Form & Role List matching screenshot #1 */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* Create New Role Box */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
                            <form onSubmit={handleAddRole} className="space-y-3">
                                <div>
                                    <input
                                        type="text"
                                        value={newRoleName}
                                        onChange={e => setNewRoleName(e.target.value)}
                                        placeholder="New role name"
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={newRoleDesc}
                                        onChange={e => setNewRoleDesc(e.target.value)}
                                        placeholder="Description (optional)"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Add Role
                                </button>
                            </form>
                        </div>

                        {/* Existing Roles Selector List */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2">
                            <h3 className="text-xs font-black uppercase text-slate-400 px-2">Existing Roles</h3>
                            <div className="space-y-1">
                                {roles.map(r => (
                                    <div
                                        key={r.id}
                                        onClick={() => setSelectedRole(r)}
                                        className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between ${
                                            selectedRole?.id === r.id
                                                ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                        }`}
                                    >
                                        <div>
                                            <p className="font-bold text-xs text-slate-900 dark:text-white">{r.name}</p>
                                            <p className="text-[11px] text-slate-400 font-semibold">{r.description}</p>
                                        </div>
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-mono">
                                            {r.permissions.length} perms
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Permission Matrix matching screenshot #1 */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs min-h-[300px]">
                        {!selectedRole ? (
                            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                                Select a role from the left to manage its permissions.
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                                    <div>
                                        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-purple-600" /> Permissions for {selectedRole.name}
                                        </h2>
                                        <p className="text-xs text-slate-500 font-semibold">{selectedRole.description}</p>
                                    </div>
                                    <button
                                        onClick={handleSavePermissions}
                                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" /> Save
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {availablePermissions.map(p => {
                                        const isChecked = selectedRole.permissions.includes(p.id);
                                        return (
                                            <div
                                                key={p.id}
                                                onClick={() => togglePermission(p.id)}
                                                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                                                    isChecked
                                                        ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800'
                                                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                                                }`}
                                            >
                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{p.label}</span>
                                                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition ${isChecked ? 'bg-purple-600 text-white' : 'border border-slate-300'}`}>
                                                    {isChecked && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        
</>
    );
}
