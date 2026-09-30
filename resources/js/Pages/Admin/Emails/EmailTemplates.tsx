import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { LayoutTemplate, Edit, CheckCircle2 } from 'lucide-react';

export default function EmailTemplates({ templates }: { templates: any[] }) {
    return (
        <>

            <Head title="Email Templates — Admin" />
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-6 shadow-md flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Email Templates</h1>
                        <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">Manage automated system emails</p>
                    </div>
                    <LayoutTemplate className="w-8 h-8 opacity-50" />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-100">
                            <tr>
                                <th className="py-3 px-4">Template Name</th>
                                <th className="py-3 px-4">Subject</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {templates.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 transition">
                                    <td className="py-3 px-4 font-bold">{t.name}</td>
                                    <td className="py-3 px-4 text-slate-500">{t.subject}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Link href={`/admin/email-templates/${t.id}/edit`} className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 justify-end w-full">
                                            <Edit className="w-3.5 h-3.5" /> Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        
</>
    );
}
