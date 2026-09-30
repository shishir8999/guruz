import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { RefreshCw, Download, Trash2, Terminal, AlertTriangle, Info, AlertCircle, FileText, Search, Filter } from 'lucide-react';

export default function DebugLogs({ initialLogs }: { initialLogs?: any[] }) {
    const [activeLog, setActiveLog] = useState('laravel.log');
    
    // Log data
    const logs = initialLogs && initialLogs.length > 0 ? initialLogs : [
        { id: 1, type: 'error', time: '2026-08-07 10:23:14', message: 'SQLSTATE[HY000]: General error: 1364 Field "user_id" doesn\'t have a default value' },
        { id: 2, type: 'warning', time: '2026-08-07 09:15:02', message: 'Cache miss for key "product_categories_tree". Rebuilding...' },
        { id: 3, type: 'info', time: '2026-08-07 08:00:00', message: 'Scheduled task [App\\Console\\Commands\\SyncInventory] executed successfully.' },
        { id: 4, type: 'error', time: '2026-08-06 23:45:11', message: 'Stripe API Error: Request req_9xYz8s2 failed. Invalid API Key.' },
        { id: 5, type: 'info', time: '2026-08-06 20:10:05', message: 'User ID 459 logged in from IP 192.168.1.5' },
        { id: 6, type: 'warning', time: '2026-08-06 18:30:22', message: 'High memory usage detected in job App\\Jobs\\ProcessImageUploads' },
        { id: 7, type: 'error', time: '2026-08-06 15:12:09', message: 'cURL error 28: Operation timed out after 30001 milliseconds with 0 bytes received' },
    ];

    const logFiles = [
        { name: 'laravel.log', size: '2.4 MB', date: 'Today, 10:23 AM' },
        { name: 'worker.log', size: '845 KB', date: 'Today, 09:15 AM' },
        { name: 'scheduler.log', size: '1.2 MB', date: 'Yesterday, 11:59 PM' },
        { name: 'query-debug.log', size: '15.8 MB', date: 'Yesterday, 05:30 PM' },
    ];

    const getLogIcon = (type: string) => {
        switch(type) {
            case 'error': return <AlertCircle className="w-4 h-4 text-rose-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'info': return <Info className="w-4 h-4 text-blue-500" />;
            default: return <Terminal className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <>

            <Head title="Debug Logs — Admin" />

            <div className="space-y-6 max-w-full flex flex-col h-[calc(100vh-8rem)]">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded">
                                Developer Tools
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Feature Module</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Debug Logs</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Monitor system activity, errors, and debug output in real-time.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                        <button className="bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5">
                            <Trash2 className="w-4 h-4" /> Clear Logs
                        </button>
                        <button className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5">
                            <Download className="w-4 h-4" /> Download
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                    
                    {/* Log Files Sidebar */}
                    <div className="w-full lg:w-72 flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col h-full">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Log Files</h2>
                        </div>
                        <div className="overflow-y-auto p-3 space-y-1 flex-1">
                            {logFiles.map((file, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setActiveLog(file.name)}
                                    className={`w-full text-left p-3 rounded-xl transition ${activeLog === file.name ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${activeLog === file.name ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-sm font-bold truncate ${activeLog === file.name ? 'text-teal-700 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {file.name}
                                            </h3>
                                            <div className="flex items-center justify-between mt-0.5">
                                                <span className="text-[10px] text-slate-400 font-semibold">{file.size}</span>
                                                <span className="text-[10px] text-slate-400">{file.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Log Viewer */}
                    <div className="flex-1 bg-slate-950 dark:bg-black rounded-2xl border border-slate-800 shadow-xs overflow-hidden flex flex-col font-mono h-full">
                        
                        {/* Viewer Toolbar */}
                        <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Terminal className="w-4 h-4" />
                                <span className="text-sm font-bold text-slate-200">{activeLog}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Search logs..." 
                                        className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-teal-500 w-48"
                                    />
                                </div>
                                <button className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition">
                                    <Filter className="w-3.5 h-3.5" /> Filter
                                </button>
                            </div>
                        </div>

                        {/* Logs List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 text-[13px]">
                            {logs.map((log) => (
                                <div key={log.id} className="flex gap-3 items-start group hover:bg-slate-900/50 p-1.5 rounded">
                                    <div className="mt-0.5 flex-shrink-0">
                                        {getLogIcon(log.type)}
                                    </div>
                                    <div className="flex-shrink-0 text-slate-500">
                                        [{log.time}]
                                    </div>
                                    <div className="flex-shrink-0 uppercase font-bold text-xs mt-0.5">
                                        {log.type === 'error' && <span className="text-rose-400">ERROR:</span>}
                                        {log.type === 'warning' && <span className="text-amber-400">WARN:</span>}
                                        {log.type === 'info' && <span className="text-blue-400">INFO:</span>}
                                    </div>
                                    <div className="text-slate-300 break-words flex-1">
                                        {log.message}
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-3 items-start p-1.5 text-slate-500 animate-pulse mt-4">
                                <div><Terminal className="w-4 h-4" /></div>
                                <div>Waiting for new logs...</div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        
</>
    );
}