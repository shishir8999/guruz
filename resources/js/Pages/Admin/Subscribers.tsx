import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Trash } from 'lucide-react';
import Swal from 'sweetalert2';

interface Subscriber {
    id: number;
    email: string;
    created_at: string;
}

export default function Subscribers({ subscribers }: { subscribers: any }) {
    const deleteSubscriber = (id: number) => {
        Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('subscribers.destroy', id));
            }
        });
    };

    return (
        <>

            <Head title="Subscribers" />
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">Newsletter Subscribers</h1>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-800 border-b">
                            <tr>
                                <th className="p-4 font-semibold">Email Address</th>
                                <th className="p-4 font-semibold">Subscribed On</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.data.map((sub: Subscriber) => (
                                <tr key={sub.id} className="border-b hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-800">{sub.email}</td>
                                    <td className="p-4">{new Date(sub.created_at).toLocaleDateString()}</td>
                                    <td className="p-4 flex justify-end">
                                        <button onClick={() => deleteSubscriber(sub.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded">
                                            <Trash size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {subscribers.data.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-500">
                                        No subscribers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    
                    {/* Pagination - Simple implementation */}
                    <div className="p-4 border-t flex justify-between items-center bg-slate-50">
                        <span className="text-sm text-slate-600">
                            Showing {subscribers.from || 0} to {subscribers.to || 0} of {subscribers.total}
                        </span>
                        <div className="flex gap-1">
                            {subscribers.links.map((link: any, index: number) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url || link.active}
                                    className={`px-3 py-1 rounded border text-sm ${link.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-100 disabled:opacity-50'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        
</>
    );
}
