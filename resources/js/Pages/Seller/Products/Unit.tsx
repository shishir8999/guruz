import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    Search, 
    Scale, 
    Eye,
    EyeOff,
    X
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Unit {
    id: number;
    name: string;
    short_name?: string;
    is_active: boolean;
    shop_id: number | null;
}

export default function Unit({ units = [] }: { units: Unit[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [localUnits, setLocalUnits] = useState<Unit[]>(units);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    // Form inputs for Add/Edit
    const [unitName, setUnitName] = useState('');
    const [shortName, setShortName] = useState('');

    useEffect(() => {
        setLocalUnits(units);
    }, [units]);

    const filteredUnits = localUnits.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.short_name && u.short_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Instant Status Toggle
    const handleToggleStatus = (unit: Unit) => {
        const updatedStatus = !unit.is_active;

        // Optimistic UI update
        setLocalUnits(prev => prev.map(u => u.id === unit.id ? { ...u, is_active: updatedStatus } : u));

        router.put(`/seller/unit/${unit.id}`, {
            is_active: updatedStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Unit status set to ${updatedStatus ? 'Active' : 'Inactive'}!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            },
            onError: () => {
                // Revert on error
                setLocalUnits(prev => prev.map(u => u.id === unit.id ? { ...u, is_active: unit.is_active } : u));
            }
        });
    };

    // Open Add Modal
    const handleOpenAddModal = () => {
        setUnitName('');
        setShortName('');
        setIsAddModalOpen(true);
    };

    // Submit Add Unit
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!unitName.trim()) return;

        router.post('/seller/unit', {
            name: unitName,
            short_name: shortName || unitName,
            is_active: true
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                setUnitName('');
                setShortName('');
                Swal.fire({
                    title: 'Unit Created! 🎉',
                    text: `New unit "${unitName}" added successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Open Edit Modal
    const handleOpenEditModal = (unit: Unit) => {
        setEditingUnit(unit);
        setUnitName(unit.name);
        setShortName(unit.short_name || unit.name);
    };

    // Submit Edit Unit
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUnit || !unitName.trim()) return;

        router.put(`/seller/unit/${editingUnit.id}`, {
            name: unitName,
            short_name: shortName
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingUnit(null);
                Swal.fire({
                    title: 'Unit Updated!',
                    text: `Unit updated to "${unitName}".`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Delete Unit
    const handleDeleteUnit = (unit: Unit) => {
        Swal.fire({
            title: 'Delete Unit?',
            text: `Are you sure you want to delete unit "${unit.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/unit/${unit.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Unit deleted successfully.',
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
            <Head title="Unit List — Product Measurement Units" />

            <div className="max-w-6xl mx-auto space-y-6 pb-20">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                            <Scale className="w-3.5 h-3.5 text-indigo-400" />
                            Product Measurement Units
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Unit List</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            আপনার প্রোডাক্টের পরিমাপের ইউনিটসমূহ অন/অফ করতে স্ট্যাটাস বাটনে চাপ দিন।
                        </p>
                    </div>

                    <button 
                        onClick={handleOpenAddModal}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Add New Unit
                    </button>
                </div>

                {/* Controls Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input 
                            type="text"
                            placeholder="Search unit by name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                            Total Units: {localUnits.length}
                        </span>
                        <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            Active Units: {localUnits.filter(u => u.is_active).length}
                        </span>
                    </div>
                </div>

                {/* Unit Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 w-16">SL</th>
                                    <th className="px-6 py-4">Unit Name</th>
                                    <th className="px-6 py-4">Short Code / Symbol</th>
                                    <th className="px-6 py-4 w-32">Type</th>
                                    <th className="px-6 py-4 w-36 text-center">Status</th>
                                    <th className="px-6 py-4 w-32 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {filteredUnits.map((unit, index) => (
                                    <tr key={unit.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                                        <td className="px-6 py-4 text-slate-500 font-mono">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">
                                            {unit.name}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            {unit.short_name || unit.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {unit.shop_id === null ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                                                    Global System
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                                    Shop Custom
                                                </span>
                                            )}
                                        </td>
                                        
                                        {/* Status Toggle Pill Badge Button */}
                                        <td className="px-6 py-4 text-center">
                                            {unit.is_active ? (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleToggleStatus(unit)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 transition cursor-pointer shadow-2xs"
                                                    title="Click to Disable"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Active
                                                </button>
                                            ) : (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleToggleStatus(unit)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 transition cursor-pointer shadow-2xs"
                                                    title="Click to Enable"
                                                >
                                                    <EyeOff className="w-3.5 h-3.5 text-slate-400" /> Disabled
                                                </button>
                                            )}
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleOpenEditModal(unit)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition cursor-pointer"
                                                    title="Edit Unit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteUnit(unit)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition cursor-pointer"
                                                    title="Delete Unit"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredUnits.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No measurement units found. Click "Add New Unit" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Add Unit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-500" /> Add New Unit
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
                                    Unit Name *
                                </label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Kilogram, Litre, Piece, Box"
                                    value={unitName}
                                    onChange={e => setUnitName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Short Code / Symbol (Optional)
                                </label>
                                <input 
                                    type="text"
                                    placeholder="e.g. KG, Ltr, Pcs, Box"
                                    value={shortName}
                                    onChange={e => setShortName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                                />
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
                                    Save Unit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Unit Modal */}
            {editingUnit && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-500" /> Edit Unit
                            </h3>
                            <button 
                                onClick={() => setEditingUnit(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Unit Name *
                                </label>
                                <input 
                                    type="text"
                                    value={unitName}
                                    onChange={e => setUnitName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Short Code / Symbol
                                </label>
                                <input 
                                    type="text"
                                    value={shortName}
                                    onChange={e => setShortName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setEditingUnit(null)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                                >
                                    Update Unit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Unit.layout = (page: any) => <SellerLayout children={page} />;
