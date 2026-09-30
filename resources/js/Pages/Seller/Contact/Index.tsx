import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Users, 
    Plus, 
    Search, 
    Trash2, 
    Edit2, 
    Eye, 
    EyeOff, 
    Phone, 
    Mail, 
    MapPin, 
    Building2, 
    UserCheck, 
    Truck, 
    X,
    DollarSign,
    CheckCircle2
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Contact {
    id: number;
    type: 'supplier' | 'customer';
    name: string;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    address: string | null;
    balance: number;
    is_active: boolean;
}

interface ContactProps {
    contacts?: Contact[];
    totalCount?: number;
    supplierCount?: number;
    customerCount?: number;
    filters?: {
        search?: string;
        type?: string;
    };
}

export default function ContactIndex({ 
    contacts = [], 
    totalCount = 0, 
    supplierCount = 0, 
    customerCount = 0,
    filters = {}
}: ContactProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.type || 'all');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    // Form states
    const [type, setType] = useState<'supplier' | 'customer'>('supplier');
    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState('0');
    const [isActive, setIsActive] = useState(true);

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.company_name && c.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.phone && c.phone.includes(searchTerm)) ||
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesTab = activeTab === 'all' ? true : c.type === activeTab;

        return matchesSearch && matchesTab;
    });

    // Instant Status Toggle
    const handleToggleStatus = (contact: Contact) => {
        const updatedStatus = !contact.is_active;

        router.put(`/seller/contact/${contact.id}`, {
            is_active: updatedStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Contact status set to ${updatedStatus ? 'Active' : 'Inactive'}!`,
                    showConfirmButton: false,
                    timer: 2000,
                });
            }
        });
    };

    // Open Add Modal
    const handleOpenAddModal = () => {
        setType('supplier');
        setName('');
        setCompanyName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setBalance('0');
        setIsActive(true);
        setIsAddModalOpen(true);
    };

    // Submit Add Contact
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        router.post('/seller/contact', {
            type,
            name,
            company_name: companyName,
            email,
            phone,
            address,
            balance: parseFloat(balance) || 0,
            is_active: isActive,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                Swal.fire({
                    title: 'Contact Created! 🎉',
                    text: `New ${type} "${name}" added successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Open Edit Modal
    const handleOpenEdit = (c: Contact) => {
        setEditingContact(c);
        setType(c.type);
        setName(c.name);
        setCompanyName(c.company_name || '');
        setEmail(c.email || '');
        setPhone(c.phone || '');
        setAddress(c.address || '');
        setBalance(String(c.balance || '0'));
        setIsActive(c.is_active);
    };

    // Submit Edit Contact
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingContact || !name.trim()) return;

        router.put(`/seller/contact/${editingContact.id}`, {
            type,
            name,
            company_name: companyName,
            email,
            phone,
            address,
            balance: parseFloat(balance) || 0,
            is_active: isActive,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingContact(null);
                Swal.fire({
                    title: 'Contact Updated!',
                    text: `Contact "${name}" updated successfully.`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5',
                });
            }
        });
    };

    // Delete Contact
    const handleDeleteContact = (c: Contact) => {
        Swal.fire({
            title: 'Delete Contact?',
            text: `Are you sure you want to delete "${c.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/seller/contact/${c.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            title: 'Deleted!',
                            text: 'Contact record deleted.',
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
            <Head title="Contact Directory — Suppliers & Customers" />

            <div className="max-w-7xl mx-auto space-y-6 pb-20">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                            Suppliers & Customers CRM
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Contact Directory</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            আপনার শপের সাপ্লায়ার (পাইকারি বিক্রেতা) এবং কাস্টমারদের তথ্য পরিচালনা করুন।
                        </p>
                    </div>

                    <button 
                        onClick={handleOpenAddModal}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 cursor-pointer shrink-0 z-10"
                    >
                        <Plus className="w-4 h-4" /> + Add New Contact
                    </button>
                </div>

                {/* Stat Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Total Directory Contacts
                            </span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                                {totalCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Registered Suppliers
                            </span>
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">
                                {supplierCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                            <Truck className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                                Registered Customers
                            </span>
                            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                                {customerCount}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <UserCheck className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl w-full sm:w-auto">
                        <button 
                            type="button"
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${activeTab === 'all' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' : 'text-slate-500'}`}
                        >
                            All Contacts ({contacts.length})
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('supplier')}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${activeTab === 'supplier' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs' : 'text-slate-500'}`}
                        >
                            Suppliers ({supplierCount})
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab('customer')}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${activeTab === 'customer' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs' : 'text-slate-500'}`}
                        >
                            Customers ({customerCount})
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input 
                            type="text"
                            placeholder="Search by name, company, phone, email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                    </div>
                </div>

                {/* Contacts Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 w-16">SL</th>
                                    <th className="px-6 py-4 w-32">Type</th>
                                    <th className="px-6 py-4">Contact / Company</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Address</th>
                                    <th className="px-6 py-4 text-right">Balance (৳)</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 w-28 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {filteredContacts.map((contact, index) => (
                                    <tr key={contact.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-950/50 transition">
                                        <td className="px-6 py-4 text-slate-500 font-mono">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            {contact.type === 'supplier' ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:text-blue-400 px-3 py-1 rounded-full">
                                                    <Truck className="w-3 h-3" /> Supplier
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 px-3 py-1 rounded-full">
                                                    <UserCheck className="w-3 h-3" /> Customer
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                {contact.name}
                                            </div>
                                            {contact.company_name && (
                                                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                                    <Building2 className="w-3 h-3" /> {contact.company_name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                                            {contact.phone ? (
                                                <a href={`tel:${contact.phone}`} className="hover:text-indigo-600 hover:underline flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {contact.phone}
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 font-sans italic text-xs">No Phone</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">
                                            {contact.email ? (
                                                <a href={`mailto:${contact.email}`} className="hover:text-indigo-600 hover:underline flex items-center gap-1">
                                                    <Mail className="w-3 h-3 text-slate-400" /> {contact.email}
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 font-sans italic text-xs">No Email</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                                            {contact.address || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                                            ৳{Number(contact.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>

                                        {/* Status Toggle Button */}
                                        <td className="px-6 py-4 text-center">
                                            {contact.is_active ? (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleToggleStatus(contact)}
                                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 shadow-2xs transition cursor-pointer"
                                                    title="Click to Disable"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-emerald-600" /> Active
                                                </button>
                                            ) : (
                                                <button 
                                                    type="button"
                                                    onClick={() => handleToggleStatus(contact)}
                                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-300 dark:bg-slate-950 dark:text-slate-400 shadow-2xs transition cursor-pointer"
                                                    title="Click to Enable"
                                                >
                                                    <EyeOff className="w-3.5 h-3.5 text-slate-400" /> Disabled
                                                </button>
                                            )}
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button 
                                                    type="button"
                                                    onClick={() => handleOpenEdit(contact)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition cursor-pointer"
                                                    title="Edit Contact"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => handleDeleteContact(contact)}
                                                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition cursor-pointer"
                                                    title="Delete Contact"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredContacts.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No contacts found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Add Contact Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-500" /> Add New Contact
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
                                    Contact Type *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setType('supplier')}
                                        className={`py-2.5 rounded-2xl font-bold text-xs border transition flex items-center justify-center gap-2 cursor-pointer ${type === 'supplier' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                    >
                                        <Truck className="w-4 h-4" /> Supplier
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setType('customer')}
                                        className={`py-2.5 rounded-2xl font-bold text-xs border transition flex items-center justify-center gap-2 cursor-pointer ${type === 'customer' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                    >
                                        <UserCheck className="w-4 h-4" /> Customer
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Full Name *
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Rahim Uddin"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Company / Business Name
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Beximco Group / Spark Co."
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Phone Number
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="+880 17xxxxxxxx"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <input 
                                        type="email"
                                        placeholder="name@domain.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Address
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Street, City, Zip Code..."
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox"
                                        id="active_chkk"
                                        checked={isActive}
                                        onChange={e => setIsActive(e.target.checked)}
                                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <label htmlFor="active_chkk" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                        Active Contact
                                    </label>
                                </div>
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
                                    Save Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Contact Modal */}
            {editingContact && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-indigo-500" /> Edit Contact Details
                            </h3>
                            <button 
                                onClick={() => setEditingContact(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Contact Type *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setType('supplier')}
                                        className={`py-2.5 rounded-2xl font-bold text-xs border transition flex items-center justify-center gap-2 cursor-pointer ${type === 'supplier' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                    >
                                        <Truck className="w-4 h-4" /> Supplier
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setType('customer')}
                                        className={`py-2.5 rounded-2xl font-bold text-xs border transition flex items-center justify-center gap-2 cursor-pointer ${type === 'customer' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                                    >
                                        <UserCheck className="w-4 h-4" /> Customer
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Full Name *
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
                                        Company / Business Name
                                    </label>
                                    <input 
                                        type="text"
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Phone Number
                                    </label>
                                    <input 
                                        type="text"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Address
                                </label>
                                <input 
                                    type="text"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button"
                                    onClick={() => setEditingContact(null)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                                >
                                    Update Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

ContactIndex.layout = (page: any) => <SellerLayout children={page} />;
