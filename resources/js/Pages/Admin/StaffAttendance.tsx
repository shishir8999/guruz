import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Calendar, Download, Search, ChevronLeft, ChevronRight, UserCheck, Clock, UserX, Plane, CheckCircle2 } from 'lucide-react';

interface AttendanceRecord {
    id: number;
    staff_name: string;
    department: string;
    status: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Unmarked';
    check_in: string;
    check_out: string;
    notes: string;
}

export default function StaffAttendance({ initialAttendance }: { initialAttendance?: AttendanceRecord[] }) {
    const [selectedDate, setSelectedDate] = useState('2026-08-02');
    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [successMsg, setSuccessMsg] = useState('');

    const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(initialAttendance && initialAttendance.length > 0 ? initialAttendance : [
        { id: 1, staff_name: 'আব্দুর রহমান', department: 'Finance', status: 'Present', check_in: '09:05 AM', check_out: '05:30 PM', notes: 'On time' },
        { id: 2, staff_name: 'শারমিন আক্তার', department: 'Customer Service', status: 'Late', check_in: '09:45 AM', check_out: '06:00 PM', notes: 'Traffic delay' },
        { id: 3, staff_name: 'তানজিল করিম', department: 'IT', status: 'Absent', check_in: '—', check_out: '—', notes: 'Uninformed' },
    ]);

    const totalCount = attendanceList.length;
    const presentCount = attendanceList.filter(a => a.status === 'Present').length;
    const lateCount = attendanceList.filter(a => a.status === 'Late').length;
    const absentCount = attendanceList.filter(a => a.status === 'Absent').length;
    const leaveCount = attendanceList.filter(a => a.status === 'Leave').length;
    const unmarkedCount = attendanceList.filter(a => a.status === 'Unmarked').length;

    const filteredRecords = attendanceList.filter(a => {
        const matchesSearch = a.staff_name.toLowerCase().includes(search.toLowerCase());
        const matchesDept = departmentFilter === 'All' || a.department === departmentFilter;
        return matchesSearch && matchesDept;
    });

    const updateStatus = (id: number, newStatus: 'Present' | 'Late' | 'Absent' | 'Leave') => {
        setAttendanceList(prev => prev.map(a => a.id === id ? {
            ...a,
            status: newStatus,
            check_in: (newStatus === 'Present' || newStatus === 'Late') ? '09:15 AM' : '—',
            check_out: (newStatus === 'Present' || newStatus === 'Late') ? '05:30 PM' : '—',
        } : a));

        setSuccessMsg('Attendance status updated!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleExportCSV = () => {
        const headers = ["Staff Name", "Department", "Status", "Check In", "Check Out", "Notes"];
        const rows = attendanceList.map(a => [a.staff_name, a.department, a.status, a.check_in, a.check_out, a.notes]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `attendance_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>

            <Head title="Staff Attendance — Admin Panel" />

            <div className="space-y-6">

                {/* Header Title + Subtitle + Export CSV matching screenshot #2 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-indigo-600" /> Attendance
                        </h1>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            প্রতিদিন প্রতিটি স্টাফের হাজিরা, চেক-ইন/চেক-আউট ও নোট এক জায়গায় ম্যানেজ করো।
                        </p>
                    </div>

                    <button
                        onClick={handleExportCSV}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-2 cursor-pointer self-start md:self-auto"
                    >
                        <Download className="w-4 h-4 text-slate-500" /> Export CSV
                    </button>
                </div>

                {/* Alert Notification */}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {successMsg}
                    </div>
                )}

                {/* Date Navigator + Search + Dept Filter Bar matching screenshot #2 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Date Picker Control */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200"
                        />
                        <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200">
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <button className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                            Today
                        </button>
                        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Sun, Aug 2, 2026</span>
                    </div>

                    {/* Search & Department Dropdown */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-60">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search staff..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>

                        <select
                            value={departmentFilter}
                            onChange={e => setDepartmentFilter(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                            <option value="All">All departments</option>
                            <option value="Finance">Finance</option>
                            <option value="Customer Service">Customer Service</option>
                            <option value="IT">IT</option>
                        </select>
                    </div>

                </div>

                {/* 6 Metric Status Cards matching screenshot #2 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl p-4 shadow-xs space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Total
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{totalCount}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 shadow-xs space-y-1">
                        <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Present
                        </div>
                        <div className="text-2xl font-black text-emerald-600">{presentCount}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 shadow-xs space-y-1">
                        <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-500" /> Late
                        </div>
                        <div className="text-2xl font-black text-amber-600">{lateCount}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 shadow-xs space-y-1">
                        <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
                            <UserX className="w-3.5 h-3.5 text-rose-500" /> Absent
                        </div>
                        <div className="text-2xl font-black text-rose-600">{absentCount}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 shadow-xs space-y-1">
                        <div className="text-[11px] font-bold text-blue-600 flex items-center gap-1.5">
                            <Plane className="w-3.5 h-3.5 text-blue-500" /> Leave
                        </div>
                        <div className="text-2xl font-black text-blue-600">{leaveCount}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> Unmarked
                        </div>
                        <div className="text-2xl font-black text-slate-700 dark:text-slate-300">{unmarkedCount}</div>
                    </div>
                </div>

                {/* Attendance Table Card matching screenshot #2 */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">STAFF</th>
                                    <th className="py-3 px-4">DEPARTMENT</th>
                                    <th className="py-3 px-4">STATUS</th>
                                    <th className="py-3 px-4">CHECK IN</th>
                                    <th className="py-3 px-4">CHECK OUT</th>
                                    <th className="py-3 px-4">NOTES</th>
                                    <th className="py-3 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                                {filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-slate-400 text-xs font-semibold">
                                            No staff match the current filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map(rec => (
                                        <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{rec.staff_name}</td>
                                            <td className="py-3.5 px-4 font-mono">{rec.department}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                                                    rec.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                                                    rec.status === 'Late' ? 'bg-amber-100 text-amber-800' :
                                                    rec.status === 'Absent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {rec.status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-mono">{rec.check_in}</td>
                                            <td className="py-3.5 px-4 font-mono">{rec.check_out}</td>
                                            <td className="py-3.5 px-4 text-slate-500">{rec.notes}</td>
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => updateStatus(rec.id, 'Present')}
                                                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg transition"
                                                    >
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(rec.id, 'Late')}
                                                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg transition"
                                                    >
                                                        Late
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(rec.id, 'Absent')}
                                                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg transition"
                                                    >
                                                        Absent
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

            </div>
        
</>
    );
}
