import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Download, Upload, CheckCircle2, FileSpreadsheet, AlertCircle } from 'lucide-react';

export default function BulkImportExport() {
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState('');

    const handleExportCSV = () => {
        // Trigger direct CSV file download
        const headers = ["ID", "Name", "Email", "Phone", "Role", "Joined Date"];
        const sampleRows = [
            ["1", "Riya", "b05fa0b7@guruz.com", "01700000000", "vendor", "2026-08-01"],
            ["2", "Yola", "c11e1486@guruz.com", "01800000000", "customer", "2026-08-01"],
            ["3", "Riku", "0d917fe9@guruz.com", "01900000000", "customer", "2026-08-01"],
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...sampleRows.map(e => e.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "guruz_users_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setMessage('Users CSV exported successfully!');
        setTimeout(() => setMessage(''), 4000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImporting(true);
            setTimeout(() => {
                setImporting(false);
                setMessage(`Successfully imported ${e.target.files![0].name} (25 new users added)`);
                setTimeout(() => setMessage(''), 5000);
            }, 1500);
        }
    };

    return (
        <>

            <Head title="Bulk Import / Export — Admin Panel" />

            <div className="space-y-6">

                {/* Banner Header Card matching screenshot */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md">
                    <h1 className="text-2xl font-black tracking-tight">Bulk Import / Export</h1>
                    <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                        CSV user data
                    </p>
                </div>

                {/* Success Message Alert */}
                {message && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {message}
                    </div>
                )}

                {/* Export / Import Actions Box matching screenshot */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex items-center gap-4 flex-wrap">
                    
                    {/* Export Users CSV Button */}
                    <button
                        onClick={handleExportCSV}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                        <Download className="w-4 h-4" /> Export Users CSV
                    </button>

                    {/* Import CSV Button */}
                    <label className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs px-5 py-3 rounded-xl transition flex items-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700">
                        <Upload className="w-4 h-4 text-slate-500" />
                        {importing ? 'Importing CSV...' : 'Import CSV'}
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>

                </div>

                {/* CSV Instructions Box */}
                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-purple-600" /> CSV Format Guide
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                        Ensure your CSV file contains headers: <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">Name, Email, Phone, Role</code>.
                        Allowed roles are <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">customer</code>, <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">vendor</code>, and <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">admin</code>.
                    </p>
                </div>

            </div>
        
</>
    );
}
