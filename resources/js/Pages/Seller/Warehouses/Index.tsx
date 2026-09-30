import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Building2, 
    Plus, 
    MapPin, 
    Phone, 
    Edit2, 
    Trash2, 
    Eye, 
    EyeOff, 
    X, 
    CheckCircle2, 
    Boxes,
    Search,
    ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Warehouse {
    id: number;
    name: string;
    address: string | null;
    contact_number: string | null;
    is_active: boolean;
}

export default function WarehousesIndex({ warehouses = [] }: { warehouses: Warehouse[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

    // Form inputs
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [isActive, setIsActive] = useState(true);

    const filteredWarehouses = warehouses.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.address && w.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeCount = warehouses.filter(w => w.is_active).length;

    // Instant Status Toggle
    const handleToggleStatus = (wh: Warehouse) => {
        const updatedStatus = !wh.is_active;

        router.put(`/seller/warehouse/${wh.id}`, {
            is_active: updatedStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Warehouse location set to ${updatedStatus ? 'Active' : 'Inactive'}!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            }
        });
    };

    // Open Add Modal
    const handleOpenAddModal = () => {
        setName('');
        setAddress('');
        setContactNumber('');
        setIsActive(true);
        setIsAddModalOpen(true);
    };

    // Submit Add Warehouse
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        router.post('/seller/warehouse', {
            name: name,
            address: address,
            contact_number: contactNumber,
            is_active: isActive,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                setName('');
                setAddress('');
                setContactNumber('');
                Swal.fire({
                    title: 'Warehouse Created! 🎉',
                    text: `New location "${name}" added successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (wh: Warehouse) => {
        setEditingWarehouse(wh);
        setName(wh.name);
        setAddress(wh.address || '');
        setContactNumber(wh.contact_number || '');
        setIsActive(wh.is_active);
    };

    // Submit Edit Warehouse
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingWarehouse || !name.trim()) return;

        router.put(`/seller/warehouse/${editingWarehouse.id}`, {
            name: name,
            address: address,
            contact_number: contactNumber,
            is_active: isActive,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingWarehouse(null);
                Swal.fire({
                    title: 'Warehouse Updated!',
                    text: `Location "${name}" updated successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Delete Warehouse
    const handleDeleteWarehouse = (wh: Warehouse) => {
        Swal.fire({
            title: 'Delete Warehouse Location?',
            text: `Are you sure you want to delete "${wh.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/warehouse/${wh.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Warehouse location deleted.',
                            icon: 'success',
                            confirmButtonColor: '#4f46e5',
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Warehouses — Physical Storage Locations & Branches" />

            <div className="max-w-7xl mx-auto space-y-6 pb-20">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                            Multi-Branch & Storage Hubs
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Warehouses & Depots</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            আপনার শপের শারীরিক গুদাম, স্টোরেজ হাব ও ব্রাঞ্চ লোকেশন পরিচালনা করুন।
                        </p>
                    </div>

                    <button 
                        onClick={handleOpenAddModal}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer shrink-0 z-10"
                    >
                        <Plus className="w-4 h-4" /> + Add Location
                    </button>
                </div>

                {/* Stat Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Total Warehouses
                            </span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                                {warehouses.length}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Active Storage Depots
                            </span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                                {activeCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Inactive Depots
                            </span>
                            <span className="text-2xl font-black text-slate-400 mt-1 block">
                                {warehouses.length - activeCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-950 text-slate-500 flex items-center justify-center font-bold">
                            <Boxes className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input 
                            type="text"
                            placeholder="Search warehouse by name or location..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                    </div>

                    <span className="text-xs font-bold text-slate-500">
                        Showing {filteredWarehouses.length} locations
                    </span>
                </div>

                {/* Warehouse Location Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWarehouses.map((wh) => (
                        <div 
                            key={wh.id} 
                            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:shadow-lg transition space-y-4 flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shrink-0 border border-indigo-100 dark:border-indigo-800 shadow-2xs">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-base">
                                                {wh.name}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Status Pill Badge Button */}
                                    {wh.is_active ? (
                                        <button 
                                            type="button"
                                            onClick={() => handleToggleStatus(wh)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 transition cursor-pointer shadow-2xs shrink-0"
                                            title="Click to Disable"
                                        >
                                            <Eye className="w-3.5 h-3.5 text-emerald-600" /> Active
                                        </button>
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={() => handleToggleStatus(wh)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300 dark:bg-slate-950 dark:text-slate-400 transition cursor-pointer shadow-2xs shrink-0"
                                            title="Click to Enable"
                                        >
                                            <EyeOff className="w-3.5 h-3.5 text-slate-400" /> Disabled
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-medium">
                                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                                        <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                        <span>{wh.address || 'Physical address not specified'}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="font-mono">{wh.contact_number || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Storage Hub ID #{wh.id}
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <button 
                                        type="button"
                                        onClick={() => handleOpenEdit(wh)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition cursor-pointer"
                                        title="Edit Warehouse"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleDeleteWarehouse(wh)}
                                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition cursor-pointer"
                                        title="Delete Location"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredWarehouses.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
                            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                            <p className="text-slate-400 font-medium text-sm">No warehouse locations configured yet.</p>
                            <button 
                                onClick={handleOpenAddModal}
                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/30 transition inline-flex items-center gap-2 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Add First Warehouse Location
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* Add Warehouse Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-500" /> Add Warehouse Location
                            </h3>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Warehouse / Branch Name *
                                </label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Uttara Main Hub, Chittagong Depot"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Physical Address
                                </label>
                                <textarea 
                                    rows={3}
                                    placeholder="Plot, Road, Sector, City..."
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Contact Phone Number
                                </label>
                                <input 
                                    type="text"
                                    placeholder="+880 17xxxxxxxx"
                                    value={contactNumber}
                                    onChange={e => setContactNumber(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox"
                                    id="is_active_chk"
                                    checked={isActive}
                                    onChange={e => setIsActive(e.target.checked)}
                                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                                />
                                <label htmlFor="is_active_chk" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                    Active Warehouse Location
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition cursor-pointer"
                                >
                                    Save Warehouse
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Warehouse Modal */}
            {editingWarehouse && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-500" /> Edit Warehouse Location
                            </h3>
                            <button 
                                onClick={() => setEditingWarehouse(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Warehouse / Branch Name *
                                </label>
                                <input 
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Physical Address
                                </label>
                                <textarea 
                                    rows={3}
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Contact Phone Number
                                </label>
                                <input 
                                    type="text"
                                    value={contactNumber}
                                    onChange={e => setContactNumber(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox"
                                    id="is_active_edit_chk"
                                    checked={isActive}
                                    onChange={e => setIsActive(e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                                />
                                <label htmlFor="is_active_edit_chk" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                    Active Warehouse Location
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setEditingWarehouse(null)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                                >
                                    Update Warehouse
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

WarehousesIndex.layout = (page: any) => <SellerLayout children={page} />;
