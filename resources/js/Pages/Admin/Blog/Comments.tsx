import React from 'react';
import { Head, router } from '@inertiajs/react';
import { MessageSquare, Check, X, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Comments({ comments }: { comments: any[] }) {

    const handleToggleStatus = (id: number) => {
        router.put(route('admin.blogs.comments.toggle', id), {}, {
            preserveScroll: true,
            onSuccess: () => Swal.fire('Updated', 'Comment status has been toggled.', 'success')
        });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Delete Comment?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Yes, delete it'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.blogs.comments.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire('Deleted!', 'Comment has been deleted.', 'success')
                });
            }
        });
    };

    return (
        <>

            <Head title="Blog Comments — Admin" />
            
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                        Blog Comments
                    </h1>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-100">
                            <tr>
                                <th className="py-3 px-4">Author</th>
                                <th className="py-3 px-4 w-2/5">Comment</th>
                                <th className="py-3 px-4">Post</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {comments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400">No comments yet.</td>
                                </tr>
                            ) : (
                                comments.map(comment => (
                                    <tr key={comment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{comment.author}</td>
                                        <td className="py-3 px-4 text-slate-600 line-clamp-2">{comment.content}</td>
                                        <td className="py-3 px-4 text-slate-500 font-semibold">{comment.post_title}</td>
                                        <td className="py-3 px-4 text-slate-500">{comment.date}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${comment.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {comment.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                {comment.status === 'Pending' ? (
                                                    <button 
                                                        onClick={() => handleToggleStatus(comment.id)}
                                                        className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg tooltip" title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleToggleStatus(comment.id)}
                                                        className="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg tooltip" title="Unapprove"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(comment.id)}
                                                    className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg tooltip" title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
        
</>
    );
}
