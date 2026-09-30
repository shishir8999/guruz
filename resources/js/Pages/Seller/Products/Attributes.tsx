import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Plus, 
    Trash2, 
    Edit2, 
    Search, 
    Sliders, 
    Eye,
    EyeOff,
    X,
    Tag
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Attribute {
    id: number;
    name: string;
    values: string[];
    is_active?: boolean;
    shop_id: number | null;
}

export default function Attributes({ attributes = [] }: { attributes: Attribute[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [localAttributes, setLocalAttributes] = useState<Attribute[]>(attributes);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);

    // Form inputs for Add/Edit
    const [attrName, setAttrName] = useState('');
    const [attrValuesStr, setAttrValuesStr] = useState('');
    const [pickerColor, setPickerColor] = useState('#ef4444');
    const [newValueInput, setNewValueInput] = useState('');
    const [editModeTab, setEditModeTab] = useState<'visual' | 'raw'>('visual');

    const sizePresets = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Free'];
    const materialPresets = ['Cotton', 'Polyester', 'Silk', 'Denim', 'Velvet', 'Leather', 'Wool', 'Linen', 'Georgette', 'Chiffon'];
    const colorPresets = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#78350f', '#64748b'];

    const handleAddSingleValue = () => {
        if (!newValueInput.trim()) return;
        const val = newValueInput.trim();
        const currentVals = attrValuesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (!currentVals.includes(val)) {
            currentVals.push(val);
            setAttrValuesStr(currentVals.join(', '));
        }
        setNewValueInput('');
    };

    const handleTogglePresetValue = (val: string) => {
        const currentVals = attrValuesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (currentVals.includes(val)) {
            const updated = currentVals.filter(v => v !== val);
            setAttrValuesStr(updated.join(', '));
        } else {
            currentVals.push(val);
            setAttrValuesStr(currentVals.join(', '));
        }
    };

    const handleAppendColor = (colorHex: string) => {
        const currentVals = attrValuesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (!currentVals.includes(colorHex)) {
            currentVals.push(colorHex);
            setAttrValuesStr(currentVals.join(', '));
        }
    };

    const handleRemoveColorVal = (valToRemove: string) => {
        const currentVals = attrValuesStr.split(',').map(s => s.trim()).filter(s => s.length > 0 && s !== valToRemove);
        setAttrValuesStr(currentVals.join(', '));
    };

    useEffect(() => {
        setLocalAttributes(attributes.map(a => ({ ...a, is_active: a.is_active ?? true })));
        
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const typeParam = params.get('type');
            if (typeParam) {
                setSearchTerm(typeParam);
            }
        }
    }, [attributes]);

    const filteredAttributes = localAttributes.filter(a => 
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.values && a.values.some(v => v.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const colors = [
        'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800', 
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800', 
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800', 
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800', 
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800', 
        'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
    ];

    // Instant Status Toggle
    const handleToggleStatus = (attr: Attribute) => {
        const updatedStatus = !(attr.is_active ?? true);

        // Optimistic UI update
        setLocalAttributes(prev => prev.map(a => a.id === attr.id ? { ...a, is_active: updatedStatus } : a));

        router.put(`/seller/attributes/${attr.id}`, {
            is_active: updatedStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Attribute status set to ${updatedStatus ? 'Active' : 'Inactive'}!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            },
            onError: () => {
                // Revert
                setLocalAttributes(prev => prev.map(a => a.id === attr.id ? { ...a, is_active: attr.is_active } : a));
            }
        });
    };

    // Open Add Modal
    const handleOpenAddModal = () => {
        setAttrName('');
        setAttrValuesStr('');
        setIsAddModalOpen(true);
    };

    // Submit Add Attribute
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!attrName.trim()) return;

        const values = attrValuesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

        router.post('/seller/attributes', {
            name: attrName,
            values: values.length > 0 ? values : ['Default'],
            is_active: true
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                setAttrName('');
                setAttrValuesStr('');
                Swal.fire({
                    title: 'Attribute Created! 🎉',
                    text: `New attribute "${attrName}" added successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Open Edit Modal
    const handleOpenEditModal = (attr: Attribute) => {
        setEditingAttribute(attr);
        setAttrName(attr.name);
        setAttrValuesStr((attr.values || []).join(', '));
    };

    // Submit Edit Attribute
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAttribute || !attrName.trim()) return;

        const values = attrValuesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

        router.put(`/seller/attributes/${editingAttribute.id}`, {
            name: attrName,
            values: values
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingAttribute(null);
                Swal.fire({
                    title: 'Attribute Updated!',
                    text: `Attribute updated to "${attrName}".`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Delete Attribute
    const handleDeleteAttribute = (attr: Attribute) => {
        Swal.fire({
            title: 'Delete Attribute?',
            text: `Are you sure you want to delete attribute "${attr.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/attributes/${attr.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Attribute deleted successfully.',
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
            <Head title="Attribute List — Product Attributes & Variations" />

            <div className="max-w-6xl mx-auto space-y-6 pb-20">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                            Product Attributes & Variations
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Attribute List</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            আপনার পণ্যের ভ্যারিয়েশন বা বৈশিষ্ট্যসমূহ অন/অফ করতে স্ট্যাটাস বাটনে চাপ দিন।
                        </p>
                    </div>

                    <button 
                        onClick={handleOpenAddModal}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Add New Attribute
                    </button>
                </div>

                {/* Controls Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input 
                            type="text"
                            placeholder="Search attribute by name or value..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800">
                            Total Attributes: {localAttributes.length}
                        </span>
                    </div>
                </div>

                {/* Attribute Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 w-16">SL</th>
                                    <th className="px-6 py-4 w-48">Attribute Name</th>
                                    <th className="px-6 py-4">Values / Variations</th>
                                    <th className="px-6 py-4 w-32">Type</th>
                                    <th className="px-6 py-4 w-36 text-center">Status</th>
                                    <th className="px-6 py-4 w-32 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {filteredAttributes.map((attr, index) => (
                                    <tr key={attr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                                        <td className="px-6 py-4 text-slate-500 font-mono">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">
                                            {attr.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {(attr.values || []).map((val, vIdx) => {
                                                    const trimmedVal = val.trim();
                                                    const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(trimmedVal);
                                                    const isColorAttr = attr.name.toLowerCase() === 'color';
                                                    
                                                    const colorMap: Record<string, string> = {
                                                        'red': '#ef4444',
                                                        'blue': '#3b82f6',
                                                        'green': '#22c55e',
                                                        'yellow': '#eab308',
                                                        'orange': '#f97316',
                                                        'purple': '#a855f7',
                                                        'pink': '#ec4899',
                                                        'black': '#000000',
                                                        'white': '#ffffff',
                                                        'slate': '#64748b',
                                                        'grey': '#64748b',
                                                        'gray': '#64748b',
                                                        'brown': '#78350f',
                                                        'cyan': '#06b6d4',
                                                        'navy': '#1e3a8a',
                                                        'gold': '#d97706',
                                                    };

                                                    const hexBg = isHex ? trimmedVal : (colorMap[trimmedVal.toLowerCase()] || null);

                                                    if (isColorAttr || isHex || hexBg) {
                                                        return (
                                                            <span 
                                                                key={vIdx}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-2xs"
                                                            >
                                                                <span 
                                                                    className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0 shadow-2xs" 
                                                                    style={{ backgroundColor: hexBg || '#94a3b8' }}
                                                                />
                                                                <span className="font-mono">{trimmedVal}</span>
                                                            </span>
                                                        );
                                                    }

                                                    return (
                                                        <span 
                                                            key={vIdx}
                                                            className={`px-3 py-1 text-xs border rounded-xl font-bold font-mono inline-flex items-center gap-1 ${colors[vIdx % colors.length]}`}
                                                        >
                                                            <Tag className="w-3 h-3 opacity-60" /> {trimmedVal}
                                                        </span>
                                                    );
                                                })}
                                                {(!attr.values || attr.values.length === 0) && (
                                                    <span className="text-slate-400 text-xs italic">No values defined</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {attr.shop_id === null ? (
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
                                            {(attr.is_active ?? true) ? (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleToggleStatus(attr)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800 transition cursor-pointer shadow-2xs"
                                                    title="Click to Disable"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Active
                                                </button>
                                            ) : (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleToggleStatus(attr)}
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
                                                    onClick={() => handleOpenEditModal(attr)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition cursor-pointer"
                                                    title="Edit Attribute"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteAttribute(attr)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition cursor-pointer"
                                                    title="Delete Attribute"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredAttributes.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No attributes found. Click "Add New Attribute" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Add Attribute Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-emerald-500" /> Add New Attribute
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">নতুন ভ্যারিয়েন্ট বা অ্যাট্রিবিউট অপশন যুক্ত করুন</p>
                            </div>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            {/* Attribute Name & Presets */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Attribute Name *
                                </label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Size, Color, Material, Weight"
                                    value={attrName}
                                    onChange={e => setAttrName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                    required
                                    autoFocus
                                />
                                {/* Quick Name Presets */}
                                <div className="flex items-center gap-2 pt-1">
                                    <span className="text-[11px] text-slate-400 font-medium">Quick Pick:</span>
                                    <button type="button" onClick={() => setAttrName('Color')} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${attrName.toLowerCase() === 'color' ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>🎨 Color</button>
                                    <button type="button" onClick={() => setAttrName('Size')} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${attrName.toLowerCase() === 'size' ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>📏 Size</button>
                                    <button type="button" onClick={() => setAttrName('Material')} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${attrName.toLowerCase() === 'material' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>🧵 Material</button>
                                </div>
                            </div>

                            {/* Color Picker Box when Attribute is Color */}
                            {attrName.toLowerCase().includes('color') && (
                                <div className="bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-3.5 space-y-3">
                                    <label className="text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>🎨 Color Picker (পিকার দিয়ে কালার যোগ করুন)</span>
                                        <span className="font-mono text-xs">{pickerColor}</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={pickerColor} 
                                            onChange={e => setPickerColor(e.target.value)} 
                                            className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 shrink-0" 
                                        />
                                        <input 
                                            type="text" 
                                            value={pickerColor} 
                                            onChange={e => setPickerColor(e.target.value)} 
                                            placeholder="#000000"
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 flex-1 focus:outline-none focus:border-purple-500" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => handleAppendColor(pickerColor)} 
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> + Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {colorPresets.map(preset => (
                                            <button
                                                type="button"
                                                key={preset}
                                                onClick={() => handleAppendColor(preset)}
                                                style={{ backgroundColor: preset }}
                                                title={`Add ${preset}`}
                                                className="w-5.5 h-5.5 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-125 transition cursor-pointer"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preset Pills for Size */}
                            {attrName.toLowerCase().includes('size') && (
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Quick Pick Sizes (ক্লিক করে সরাসরি সিলেক্ট করুন)
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {sizePresets.map(sz => {
                                            const isSelected = attrValuesStr.split(',').map(s => s.trim()).includes(sz);
                                            return (
                                                <button
                                                    type="button"
                                                    key={sz}
                                                    onClick={() => handleTogglePresetValue(sz)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {isSelected ? `✓ ${sz}` : sz}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Preset Pills for Material */}
                            {attrName.toLowerCase().includes('material') && (
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Quick Pick Materials (ক্লিক করে সিলেক্ট করুন)
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {materialPresets.map(mat => {
                                            const isSelected = attrValuesStr.split(',').map(s => s.trim()).includes(mat);
                                            return (
                                                <button
                                                    type="button"
                                                    key={mat}
                                                    onClick={() => handleTogglePresetValue(mat)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {isSelected ? `✓ ${mat}` : mat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Add Custom Single Value Chip Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                    <span>Add Custom Value (নতুন ভ্যালু ইনপুট)</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 4XL, Georgette, Free Size + Enter"
                                        value={newValueInput}
                                        onChange={e => setNewValueInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSingleValue(); } }}
                                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleAddSingleValue}
                                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> + Add
                                    </button>
                                </div>
                            </div>

                            {/* Mode Toggle & Raw Text Area */}
                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Active Options ({attrValuesStr.split(',').filter(s => s.trim().length > 0).length})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setEditModeTab(editModeTab === 'visual' ? 'raw' : 'visual')}
                                        className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                    >
                                        {editModeTab === 'visual' ? '📝 Raw Comma Text Edit' : '🏷️ Visual Chip View'}
                                    </button>
                                </div>

                                {editModeTab === 'visual' ? (
                                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[70px] max-h-40 overflow-y-auto">
                                        {attrValuesStr.split(',').map(s => s.trim()).filter(s => s.length > 0).map((v, i) => {
                                            const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(v);
                                            return (
                                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs animate-in zoom-in duration-100">
                                                    {(attrName.toLowerCase().includes('color') || isHex) && (
                                                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" style={{ backgroundColor: v }} />
                                                    )}
                                                    <span className="font-mono">{v}</span>
                                                    <button type="button" onClick={() => handleRemoveColorVal(v)} className="text-slate-400 hover:text-rose-500 font-bold ml-1 text-sm cursor-pointer">×</button>
                                                </span>
                                            );
                                        })}
                                        {attrValuesStr.trim().length === 0 && (
                                            <span className="text-slate-400 text-xs italic self-center">No options added yet. Pick from above or type a value.</span>
                                        )}
                                    </div>
                                ) : (
                                    <textarea 
                                        rows={3}
                                        placeholder="e.g. Red, Blue, Black, Green or S, M, L, XL, XXL"
                                        value={attrValuesStr}
                                        onChange={e => setAttrValuesStr(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                                        required
                                    />
                                )}
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
                                    Save Attribute
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Attribute Modal */}
            {editingAttribute && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-indigo-500" /> Edit Attribute
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">ভ্যারিয়েন্ট বা অ্যাট্রিবিউটের অপশন আপডেট করুন</p>
                            </div>
                            <button 
                                onClick={() => setEditingAttribute(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            {/* Attribute Name & Presets */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Attribute Name *
                                </label>
                                <input 
                                    type="text"
                                    value={attrName}
                                    onChange={e => setAttrName(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    required
                                />
                                <div className="flex items-center gap-2 pt-1">
                                    <span className="text-[11px] text-slate-400 font-medium">Quick Pick:</span>
                                    <button type="button" onClick={() => setAttrName('Color')} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${attrName.toLowerCase() === 'color' ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>🎨 Color</button>
                                    <button type="button" onClick={() => setAttrName('Size')} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${attrName.toLowerCase() === 'size' ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>📏 Size</button>
                                    <button type="button" onClick={() => setAttrName('Material')} className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${attrName.toLowerCase() === 'material' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>🧵 Material</button>
                                </div>
                            </div>

                            {/* Color Picker Box when Attribute is Color */}
                            {attrName.toLowerCase().includes('color') && (
                                <div className="bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl p-3.5 space-y-3">
                                    <label className="text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center justify-between">
                                        <span>🎨 Color Picker (পিকার দিয়ে কালার যোগ করুন)</span>
                                        <span className="font-mono text-xs">{pickerColor}</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={pickerColor} 
                                            onChange={e => setPickerColor(e.target.value)} 
                                            className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 shrink-0" 
                                        />
                                        <input 
                                            type="text" 
                                            value={pickerColor} 
                                            onChange={e => setPickerColor(e.target.value)} 
                                            placeholder="#000000"
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 flex-1 focus:outline-none focus:border-purple-500" 
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => handleAppendColor(pickerColor)} 
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> + Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {colorPresets.map(preset => (
                                            <button
                                                type="button"
                                                key={preset}
                                                onClick={() => handleAppendColor(preset)}
                                                style={{ backgroundColor: preset }}
                                                title={`Add ${preset}`}
                                                className="w-5.5 h-5.5 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-125 transition cursor-pointer"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Preset Pills for Size */}
                            {attrName.toLowerCase().includes('size') && (
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Quick Pick Sizes (ক্লিক করে সরাসরি সিলেক্ট করুন)
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {sizePresets.map(sz => {
                                            const isSelected = attrValuesStr.split(',').map(s => s.trim()).includes(sz);
                                            return (
                                                <button
                                                    type="button"
                                                    key={sz}
                                                    onClick={() => handleTogglePresetValue(sz)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {isSelected ? `✓ ${sz}` : sz}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Preset Pills for Material */}
                            {attrName.toLowerCase().includes('material') && (
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                        Quick Pick Materials (ক্লিক করে সিলেক্ট করুন)
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {materialPresets.map(mat => {
                                            const isSelected = attrValuesStr.split(',').map(s => s.trim()).includes(mat);
                                            return (
                                                <button
                                                    type="button"
                                                    key={mat}
                                                    onClick={() => handleTogglePresetValue(mat)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold'
                                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {isSelected ? `✓ ${mat}` : mat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Add Custom Single Value Chip Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                                    <span>Add Custom Value (নতুন ভ্যালু ইনপুট)</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 4XL, Georgette, Free Size + Enter"
                                        value={newValueInput}
                                        onChange={e => setNewValueInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSingleValue(); } }}
                                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleAddSingleValue}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> + Add
                                    </button>
                                </div>
                            </div>

                            {/* Mode Toggle & Active Options Chip View */}
                            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Active Options ({attrValuesStr.split(',').filter(s => s.trim().length > 0).length})
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setEditModeTab(editModeTab === 'visual' ? 'raw' : 'visual')}
                                        className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                    >
                                        {editModeTab === 'visual' ? '📝 Raw Comma Text Edit' : '🏷️ Visual Chip View'}
                                    </button>
                                </div>

                                {editModeTab === 'visual' ? (
                                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl min-h-[70px] max-h-40 overflow-y-auto">
                                        {attrValuesStr.split(',').map(s => s.trim()).filter(s => s.length > 0).map((v, i) => {
                                            const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(v);
                                            return (
                                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xs animate-in zoom-in duration-100">
                                                    {(attrName.toLowerCase().includes('color') || isHex) && (
                                                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" style={{ backgroundColor: v }} />
                                                    )}
                                                    <span className="font-mono">{v}</span>
                                                    <button type="button" onClick={() => handleRemoveColorVal(v)} className="text-slate-400 hover:text-rose-500 font-bold ml-1 text-sm cursor-pointer">×</button>
                                                </span>
                                            );
                                        })}
                                        {attrValuesStr.trim().length === 0 && (
                                            <span className="text-slate-400 text-xs italic self-center">No options added yet. Pick from above or type a value.</span>
                                        )}
                                    </div>
                                ) : (
                                    <textarea 
                                        rows={3}
                                        placeholder="e.g. Red, Blue, Black, Green or S, M, L, XL, XXL"
                                        value={attrValuesStr}
                                        onChange={e => setAttrValuesStr(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                        required
                                    />
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setEditingAttribute(null)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                                >
                                    Update Attribute
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Attributes.layout = (page: any) => <SellerLayout children={page} />;
