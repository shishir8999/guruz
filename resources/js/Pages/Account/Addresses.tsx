import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, Phone } from 'lucide-react';
import AccountLayout from '@/Layouts/CustomerLayout';

export default function Addresses() {
    // Dummy data for addresses
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            type: 'Home',
            name: 'John Doe',
            phone: '+880 1712 345678',
            street: 'House #12, Road #4, Block C, Banani',
            city: 'Dhaka',
            postalCode: '1213',
            isDefault: true,
        },
        {
            id: 2,
            type: 'Office',
            name: 'John Doe',
            phone: '+880 1819 987654',
            street: 'Level 5, Rahman Tower, Gulshan-1',
            city: 'Dhaka',
            postalCode: '1212',
            isDefault: false,
        }
    ]);

    const getIcon = (type: string) => {
        if (type.toLowerCase() === 'home') return <Home size={18} className="text-indigo-500" />;
        if (type.toLowerCase() === 'office') return <Briefcase size={18} className="text-amber-500" />;
        return <MapPin size={18} className="text-slate-500" />;
    };

    return (
        <>
            <Head title="Saved Addresses" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Saved Addresses</h1>
                        <p className="text-slate-500 text-sm mt-1">Manage your shipping and billing addresses for faster checkout.</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-rose-700 transition shadow-sm w-full sm:w-auto">
                        <Plus size={18} />
                        Add New Address
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div key={address.id} className={`bg-white rounded-xl shadow-sm border p-6 relative transition-all ${address.isDefault ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-200 hover:border-slate-300'}`}>
                            {address.isDefault && (
                                <span className="absolute -top-3 right-6 bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">
                                    DEFAULT
                                </span>
                            )}
                            
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-lg ${address.type.toLowerCase() === 'home' ? 'bg-indigo-50' : 'bg-amber-50'}`}>
                                        {getIcon(address.type)}
                                    </div>
                                    <h3 className="font-bold text-slate-800">{address.type}</h3>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition" title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-2.5">
                                <p className="font-semibold text-slate-800">{address.name}</p>
                                <div className="flex items-start gap-2 text-slate-600 text-sm">
                                    <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                    <p className="leading-relaxed">
                                        {address.street}<br />
                                        {address.city} - {address.postalCode}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <Phone size={16} className="text-slate-400 shrink-0" />
                                    <p>{address.phone}</p>
                                </div>
                            </div>

                            {!address.isDefault && (
                                <button className="mt-5 w-full py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
                                    Set as Default
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add New Placeholder Card */}
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center min-h-[280px] hover:bg-slate-100 hover:border-slate-400 transition cursor-pointer group">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-rose-600 group-hover:scale-110 transition mb-4">
                            <Plus size={24} />
                        </div>
                        <h3 className="font-bold text-slate-700 group-hover:text-slate-800 transition">Add New Address</h3>
                        <p className="text-slate-500 text-sm mt-1">Add a new delivery location</p>
                    </div>
                </div>
            </div>
        </>
    );
}
