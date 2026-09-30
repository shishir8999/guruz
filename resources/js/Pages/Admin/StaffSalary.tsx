import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { DollarSign, CheckCircle2, CreditCard, Receipt, Plus, Users, Wallet, Clock, Search, Filter } from 'lucide-react';
import Swal from 'sweetalert2';

interface StaffSalaryRecord {
    id: number;
    name: string;
    designation: string;
    department: string;
    salary: number;
    status: 'Paid' | 'Pending';
    paidAt?: string;
    paymentMethod?: string;
}

export default function StaffSalary({ initialSalaries }: { initialSalaries?: StaffSalaryRecord[] }) {
    const [salaries, setSalaries] = useState<StaffSalaryRecord[]>(initialSalaries && initialSalaries.length > 0 ? initialSalaries : [
        { id: 1, name: 'আব্দুর রহমান', designation: 'Senior Accountant', department: 'Finance', salary: 35000, status: 'Paid', paidAt: '14 Aug 2026', paymentMethod: 'Bank Transfer' },
        { id: 2, name: 'শারমিন আক্তার', designation: 'Support Executive', department: 'Customer Service', salary: 25000, status: 'Pending' },
        { id: 3, name: 'মেহেদী হাসান', designation: 'Warehouse Manager', department: 'Logistics', salary: 28000, status: 'Pending' },
        { id: 4, name: 'তানজিনা আহমেদ', designation: 'UI/UX Designer', department: 'Technology', salary: 42000, status: 'Paid', paidAt: '12 Aug 2026', paymentMethod: 'bKash Merchant' },
    ]);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

    const totalPayroll = salaries.reduce((acc, curr) => acc + curr.salary, 0);
    const totalPaid = salaries.filter(s => s.status === 'Paid').reduce((acc, curr) => acc + curr.salary, 0);
    const totalPending = salaries.filter(s => s.status === 'Pending').reduce((acc, curr) => acc + curr.salary, 0);

    const handlePaySalary = (record: StaffSalaryRecord) => {
        Swal.fire({
            title: `<strong>${record.name}-এর বেতন প্রদান করুন</strong>`,
            html: `
                <div style="text-align: left; font-size: 13px; margin-top: 10px;" class="space-y-3">
                    <p style="margin-bottom: 6px;">পদবী: <strong>${record.designation} (${record.department})</strong></p>
                    <p style="margin-bottom: 12px; font-size: 16px;">বেতনের পরিমাণ: <strong style="color: #10b981;">৳${record.salary.toLocaleString()}</strong></p>
                    <label style="display: block; font-weight: bold; margin-bottom: 4px;">পেমেন্ট মেথড নির্বাচন করুন:</label>
                    <select id="payment-method-select" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 600;">
                        <option value="bKash Merchant">📲 বিকাশ (bKash)</option>
                        <option value="Bank Transfer">🏦 ব্যাংক ট্রান্সফার (Bank Transfer)</option>
                        <option value="Nagad">📱 নগদ (Nagad)</option>
                        <option value="Cash">💵 ক্যাশ প্রদান (Cash)</option>
                    </select>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#9333ea',
            cancelButtonColor: '#64748b',
            confirmButtonText: '⚡ বেতন প্রদান নিশ্চিত করুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                const methodSelect = document.getElementById('payment-method-select') as HTMLSelectElement;
                const selectedMethod = methodSelect ? methodSelect.value : 'Bank Transfer';

                const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                setSalaries(prev => prev.map(s => s.id === record.id ? { 
                    ...s, 
                    status: 'Paid',
                    paidAt: currentDate,
                    paymentMethod: selectedMethod
                } : s));

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `৳${record.salary.toLocaleString()} বেতন সফলভাবে পরিশোধ করা হয়েছে!`,
                    showConfirmButton: false,
                    timer: 3500
                });
            }
        });
    };

    const handlePrintReceipt = (record: StaffSalaryRecord) => {
        Swal.fire({
            title: `📄 বেতন রসিদ — ${record.name}`,
            html: `
                <div style="text-align: left; font-size: 12px; border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; background: #f8fafc;" class="space-y-2">
                    <p style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 8px;">Guruz E-Commerce Ltd.</p>
                    <p>স্টাফ আইডি: #STF-${1000 + record.id}</p>
                    <p>নাম: <strong>${record.name}</strong></p>
                    <p>পদবী: <strong>${record.designation} (${record.department})</strong></p>
                    <hr style="margin: 8px 0;" />
                    <p style="font-size: 14px;">পরিশোধিত বেতন: <strong style="color: #059669;">৳${record.salary.toLocaleString()}</strong></p>
                    <p>পেমেন্ট মাধ্যম: <strong>${record.paymentMethod || 'Bank Transfer'}</strong></p>
                    <p>পরিশোধের তারিখ: <strong>${record.paidAt || 'Today'}</strong></p>
                    <p style="color: #10b981; font-weight: bold; margin-top: 8px;">স্ট্যাটাস: PAID ✔</p>
                </div>
            `,
            confirmButtonColor: '#4f46e5',
            confirmButtonText: '🖨️ রসিদ প্রিন্ট করুন'
        }).then((res) => {
            if (res.isConfirmed) {
                window.print();
            }
        });
    };

    const filteredSalaries = salaries.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                              s.designation.toLowerCase().includes(search.toLowerCase()) ||
                              s.department.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' ? true : s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <Head title="Staff Salary — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card matching screenshot */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1 z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold text-purple-100 mb-1 border border-white/20">
                            <Wallet className="w-3.5 h-3.5" />
                            <span>পেইরোল ও স্টাফ পে-আউট ম্যানেজমেন্ট</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Staff Salary Portal</h1>
                        <p className="text-xs sm:text-sm font-medium text-purple-100 opacity-90">
                            মাসিক স্টাফ বেতন ওভারভিউ ও পেমেন্ট ডিসবার্সমেন্ট সিস্টেম
                        </p>
                    </div>

                    <div className="flex items-center gap-3 z-10">
                        <button
                            onClick={() => {
                                const pendingList = salaries.filter(s => s.status === 'Pending');
                                if (pendingList.length === 0) {
                                    Swal.fire('সকল বেতন পরিশোধিত!', 'এই মাসের সকল স্টাফের বেতন ইতিমধ্যে পরিশোধ করা হয়েছে।', 'info');
                                    return;
                                }
                                Swal.fire({
                                    title: 'সব পেন্ডিং বেতন একসাথে পরিশোধ করবেন?',
                                    text: `মোট ${pendingList.length} জন স্টাফের ৳${totalPending.toLocaleString()} বেতন একসাথে পরিশোধ করা হবে।`,
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#9333ea',
                                    confirmButtonText: 'হ্যাঁ, সব পরিশোধ করুন'
                                }).then(res => {
                                    if (res.isConfirmed) {
                                        const currentDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                                        setSalaries(prev => prev.map(s => ({ ...s, status: 'Paid', paidAt: currentDate, paymentMethod: 'Auto Bank Transfer' })));
                                        Swal.fire('সফল!', 'সকল পেন্ডিং বেতন সফলভাবে পরিশোধ করা হয়েছে।', 'success');
                                    }
                                });
                            }}
                            className="px-4 py-2.5 bg-white text-purple-700 hover:bg-purple-50 font-extrabold text-xs rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
                        >
                            <CreditCard className="w-4 h-4 text-purple-600" />
                            <span>সকল পেন্ডিং বেতন দিন</span>
                        </button>
                    </div>
                </div>

                {/* Metrics Cards Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">মোট পে-রোল খরচ</p>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">৳{totalPayroll.toLocaleString()}</h3>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-slate-800 text-purple-600 flex items-center justify-center font-bold">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">পরিশোধিত (Paid)</p>
                            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">৳{totalPaid.toLocaleString()}</h3>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">বকেয়া (Pending)</p>
                            <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">৳{totalPending.toLocaleString()}</h3>
                        </div>
                        <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Header Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="স্টাফের নাম, পদবী বা বিভাগ খুঁজুন..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                        {(['All', 'Paid', 'Pending'] as const).map(st => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                                    statusFilter === st
                                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                            >
                                {st === 'All' ? 'সকলের বেতন' : st === 'Paid' ? 'Paid (পরিশোধিত)' : 'Pending (পেন্ডিং)'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Salary Table Card matching screenshot */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3.5 px-4">NAME</th>
                                    <th className="py-3.5 px-4">DESIGNATION</th>
                                    <th className="py-3.5 px-4">DEPARTMENT</th>
                                    <th className="py-3.5 px-4">SALARY</th>
                                    <th className="py-3.5 px-4">STATUS</th>
                                    <th className="py-3.5 px-4 text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {filteredSalaries.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                                            কোনো বেতন রেকর্ড খুঁজে পাওয়া যায়নি!
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSalaries.map(s => (
                                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div>{s.name}</div>
                                                        <span className="text-[10px] text-slate-400 font-normal">STF-100{s.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">{s.designation}</td>
                                            <td className="py-4 px-4 font-mono text-slate-500">{s.department}</td>
                                            <td className="py-4 px-4 font-bold text-emerald-600 text-sm">৳{s.salary.toLocaleString()}</td>
                                            <td className="py-4 px-4">
                                                <span className={`text-[10px] px-3 py-1 rounded-full font-extrabold inline-flex items-center gap-1.5 ${
                                                    s.status === 'Paid' 
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' 
                                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    {s.status}
                                                </span>
                                                {s.paidAt && (
                                                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                                        {s.paidAt} ({s.paymentMethod})
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                {s.status === 'Pending' ? (
                                                    <button
                                                        onClick={() => handlePaySalary(s)}
                                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-purple-600/20 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer ml-auto"
                                                    >
                                                        <CreditCard className="w-3.5 h-3.5" /> Pay Now
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePrintReceipt(s)}
                                                        className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-purple-600 flex items-center gap-1 ml-auto bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl hover:bg-purple-50 transition cursor-pointer"
                                                    >
                                                        <Receipt className="w-3.5 h-3.5 text-purple-600" /> স্লিপ দেখুন
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
}
