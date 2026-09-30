import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Users, 
    Plus, 
    Shield, 
    ShieldAlert, 
    Edit, 
    Trash2, 
    Mail, 
    Phone, 
    Lock, 
    Unlock,
    Search,
    X,
    Check,
    CheckCircle2,
    XCircle,
    UserCheck,
    ShieldCheck,
    Settings,
    Palette
} from 'lucide-react';
import Swal from 'sweetalert2';

interface StaffItem {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    last_login: string;
    permissions?: string[];
}

interface RoleDefinition {
    id?: number;
    name: string;
    description: string;
    color: string;
}

interface ModeratorProps {
    staffList?: StaffItem[];
    totalStaff?: number;
    activeCount?: number;
    rolesList?: RoleDefinition[];
}

export default function Moderator({
    staffList = [],
    totalStaff = 0,
    activeCount = 0,
    rolesList = []
}: ModeratorProps) {
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRolesModal, setShowRolesModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);
    const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
    const [showRoleForm, setShowRoleForm] = useState(false);

    // Form for Add & Edit Staff
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        role: rolesList.length > 0 ? rolesList[0].name : 'Store Manager',
        status: 'Active',
    });

    // Form for Add & Edit Role
    const roleForm = useForm({
        name: '',
        description: '',
        color: 'indigo',
    });

    const filteredStaff = staffList.filter(mod => 
        mod.name.toLowerCase().includes(search.toLowerCase()) ||
        mod.email.toLowerCase().includes(search.toLowerCase()) ||
        mod.role.toLowerCase().includes(search.toLowerCase()) ||
        mod.phone.toLowerCase().includes(search.toLowerCase())
    );

    const getRoleBadgeStyle = (role: string) => {
        const found = rolesList.find(r => r.name.toLowerCase() === role.toLowerCase());
        const color = found ? found.color : 'indigo';
        switch(color) {
            case 'indigo': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
            case 'emerald': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'amber': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            case 'purple': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case 'rose': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
            case 'sky': return 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
        }
    };

    const handleOpenAdd = () => {
        setEditingStaff(null);
        reset();
        if (rolesList.length > 0) {
            setData('role', rolesList[0].name);
        }
        setShowAddModal(true);
    };

    const handleOpenEdit = (mod: StaffItem) => {
        setEditingStaff(mod);
        setData({
            name: mod.name,
            email: mod.email,
            phone: mod.phone,
            role: mod.role,
            status: mod.status,
        });
        setShowAddModal(true);
    };

    const handleSubmitStaff = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingStaff) {
            put(`/seller/moderator/${editingStaff.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowAddModal(false);
                    reset();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Staff member updated successfully!',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                }
            });
        } else {
            post('/seller/moderator', {
                preserveScroll: true,
                onSuccess: () => {
                    setShowAddModal(false);
                    reset();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'New staff member added!',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                }
            });
        }
    };

    const handleToggleStatus = (id: number, currentStatus: string, name: string) => {
        const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        
        Swal.fire({
            title: `${nextStatus === 'Suspended' ? 'Suspend' : 'Activate'} ${name}?`,
            text: nextStatus === 'Suspended' 
                ? `Suspending will block ${name}'s access to seller dashboard.` 
                : `Activating will grant ${name} access back to seller portal.`,
            icon: nextStatus === 'Suspended' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: nextStatus === 'Suspended' ? '#ef4444' : '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: `Yes, ${nextStatus}`
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(`/seller/moderator/${id}/toggle`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'info',
                            title: `Status changed to ${nextStatus}`,
                            showConfirmButton: false,
                            timer: 2500,
                        });
                    }
                });
            }
        });
    };

    const handleDeleteStaff = (id: number, name: string) => {
        Swal.fire({
            title: 'Remove Staff Member?',
            text: `Are you sure you want to remove ${name}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Remove'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/moderator/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: `${name} removed.`,
                            showConfirmButton: false,
                            timer: 2500,
                        });
                    }
                });
            }
        });
    };

    // Role Management Handlers
    const handleOpenRoleForm = (role?: RoleDefinition) => {
        if (role) {
            setEditingRole(role);
            roleForm.setData({
                name: role.name,
                description: role.description,
                color: role.color || 'indigo',
            });
        } else {
            setEditingRole(null);
            roleForm.reset();
        }
        setShowRoleForm(true);
    };

    const handleSubmitRole = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingRole && editingRole.id) {
            roleForm.put(`/seller/moderator/roles/${editingRole.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRoleForm(false);
                    roleForm.reset();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Role definition updated!',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                }
            });
        } else {
            roleForm.post('/seller/moderator/roles', {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRoleForm(false);
                    roleForm.reset();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'New role created!',
                        showConfirmButton: false,
                        timer: 3000,
                    });
                }
            });
        }
    };

    const handleDeleteRole = (id?: number, name?: string) => {
        if (!id) return;
        Swal.fire({
            title: `Delete Role "${name}"?`,
            text: `Deleting this role will remove it from system options. Staff assigned will need a new role.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete Role'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/moderator/roles/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'info',
                            title: 'Role deleted.',
                            showConfirmButton: false,
                            timer: 2500,
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Staff & Moderator Management — Seller Portal" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                                Store Access & Role System Management
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Staff & Roles Management</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                আপনার স্টোরের জন্য কাস্টম রোল তৈরি ও সম্পাদন করুন এবং স্টাফদের অনুমতি সেট করুন।
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowRolesModal(true)}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition cursor-pointer"
                            >
                                <Settings className="w-4 h-4 text-indigo-300" /> Edit Roles & Options
                            </button>

                            <button 
                                onClick={handleOpenAdd}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs sm:text-sm transition shadow-lg shadow-indigo-600/30 shrink-0 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Add Staff Member
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Staff List */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or role..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                            <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                <UserCheck className="w-3.5 h-3.5" /> Active Staff: {activeCount}
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-xl">
                                Total Staff: {staffList.length}
                            </span>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Staff Member</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4">Role & Access</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No staff members found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((mod) => (
                                        <tr key={mod.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-black text-sm shrink-0">
                                                        {mod.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white">{mod.name}</div>
                                                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Last login: {mod.last_login}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 mb-0.5 font-medium">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {mod.email}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-xs">
                                                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {mod.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border ${getRoleBadgeStyle(mod.role)}`}>
                                                    <Shield className="w-3.5 h-3.5" /> {mod.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {mod.status === 'Active' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                                        <XCircle className="w-3.5 h-3.5 text-rose-500" /> Suspended
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Lock / Unlock Toggle Button */}
                                                    <button
                                                        onClick={() => handleToggleStatus(mod.id, mod.status, mod.name)}
                                                        className={`p-2 rounded-xl border transition cursor-pointer ${
                                                            mod.status === 'Active'
                                                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                                                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                                        }`}
                                                        title={mod.status === 'Active' ? 'Suspend Staff Access' : 'Activate Staff Access'}
                                                    >
                                                        {mod.status === 'Active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                                    </button>

                                                    {/* Edit Button */}
                                                    <button
                                                        onClick={() => handleOpenEdit(mod)}
                                                        className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition cursor-pointer"
                                                        title="Edit Staff Member & Role"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => handleDeleteStaff(mod.id, mod.name)}
                                                        className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-100 transition cursor-pointer"
                                                        title="Remove Staff Member"
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

                {/* Role Definitions & System Options Display */}
                <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 rounded-3xl p-6 sm:p-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-300 font-black text-base sm:text-lg">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" />
                            <span>Role System Options & Privileges</span>
                        </div>
                        <button
                            onClick={() => setShowRolesModal(true)}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 transition cursor-pointer flex items-center gap-1.5"
                        >
                            <Edit className="w-3.5 h-3.5" /> Edit Role Options
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                        {rolesList.map((role, idx) => (
                            <div key={role.id || idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2 relative group">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Shield className="w-4 h-4 text-indigo-500" />
                                        {role.name}
                                    </span>
                                    <button
                                        onClick={() => handleOpenRoleForm(role)}
                                        className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"
                                        title="Edit Role Name"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    {role.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Modal for Add / Edit Staff Member */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" /> 
                                {editingStaff ? 'Edit Staff Member & Role' : 'Add New Staff Member'}
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitStaff} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Full Name *
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. John Doe"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Email Address *
                                    </label>
                                    <input 
                                        type="email" 
                                        placeholder="john@shop.com"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Phone Number *
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="+8801700000005"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Assign Staff Role *
                                        </label>
                                        <button 
                                            type="button" 
                                            onClick={() => { setShowAddModal(false); setShowRolesModal(true); }}
                                            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                        >
                                            + Edit Roles
                                        </button>
                                    </div>
                                    <select 
                                        value={data.role}
                                        onChange={e => setData('role', e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    >
                                        {rolesList.map((r, i) => (
                                            <option key={r.id || i} value={r.name}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Account Status *
                                    </label>
                                    <select 
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddModal(false)} 
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Check className="w-3.5 h-3.5" /> 
                                    {editingStaff ? 'Save Changes' : 'Add Staff Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Managing Roles */}
            {showRolesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-indigo-600" /> Manage Staff Roles & Options
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">এখানে নতুন রোল যুক্ত করতে পারবেন এবং পুরনো রোলের নাম পরিবর্তন করতে পারবেন।</p>
                            </div>
                            <button onClick={() => setShowRolesModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Role Options ({rolesList.length})</span>
                                <button
                                    onClick={() => handleOpenRoleForm()}
                                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> + Add New Role
                                </button>
                            </div>

                            <div className="space-y-3">
                                {rolesList.map((role) => (
                                    <div key={role.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                                        <div>
                                            <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Shield className="w-4 h-4 text-indigo-500" /> {role.name}
                                            </span>
                                            <p className="text-xs text-slate-500 mt-0.5 font-medium">{role.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => handleOpenRoleForm(role)}
                                                className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition cursor-pointer"
                                                title="Edit Role Option"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRole(role.id, role.name)}
                                                className="p-2 bg-rose-50 text-rose-600 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition cursor-pointer"
                                                title="Delete Role"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950">
                            <button
                                onClick={() => setShowRolesModal(false)}
                                className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl transition"
                            >
                                Done & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Form for Add / Edit Single Role Option */}
            {showRoleForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                {editingRole ? 'Edit Role Option' : 'Create New Role Option'}
                            </h3>
                            <button onClick={() => setShowRoleForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitRole} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Role Name *
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Accounts Executive"
                                    value={roleForm.data.name}
                                    onChange={e => roleForm.setData('name', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Role Description & Access Summary *
                                </label>
                                <textarea 
                                    rows={3}
                                    placeholder="Describe what features this role can access..."
                                    value={roleForm.data.description}
                                    onChange={e => roleForm.setData('description', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                    <Palette className="w-3.5 h-3.5 text-indigo-500" /> Role Badge Color
                                </label>
                                <select
                                    value={roleForm.data.color}
                                    onChange={e => roleForm.setData('color', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold capitalize"
                                >
                                    <option value="indigo">Indigo (Blue-Purple)</option>
                                    <option value="emerald">Emerald (Green)</option>
                                    <option value="amber">Amber (Orange-Yellow)</option>
                                    <option value="purple">Purple</option>
                                    <option value="rose">Rose (Red)</option>
                                    <option value="sky">Sky Blue</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowRoleForm(false)} 
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={roleForm.processing}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Check className="w-3.5 h-3.5" /> 
                                    {editingRole ? 'Update Role Option' : 'Create Role Option'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Moderator.layout = (page: any) => <SellerLayout children={page} />;
