import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Tag, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Tags({ tags }: { tags: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        slug: '',
    });

    const openModal = (tag: any = null) => {
        if (tag) {
            setEditingId(tag.id);
            setData({
                name: tag.name,
                slug: tag.slug,
            });
        } else {
            setEditingId(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(route('admin.blogs.tags.update', editingId), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire('Success', 'Tag updated successfully', 'success');
                }
            });
        } else {
            post(route('admin.blogs.tags.store'), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire('Success', 'Tag created successfully', 'success');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Delete Tag?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Yes, delete it'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.blogs.tags.destroy', id), {
                    onSuccess: () => Swal.fire('Deleted!', 'Tag has been deleted.', 'success')
                });
            }
        });
    };

    return (
        <>

            <Head title="Blog Tags — Admin" />
            
            <div className="space-y-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Blog Tags</h1>
                    <button 
                        onClick={() => openModal()}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm shadow-xs"
                    >
                        <Plus className="w-4 h-4" /> Add New Tag
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-100">
                            <tr>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Slug</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {tags.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-8 text-center text-slate-400">No tags yet. Click "Add New Tag" to create one.</td>
                                </tr>
                            ) : (
                                tags.map(tag => (
                                    <tr key={tag.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-purple-500" />
                                            {tag.name}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">{tag.slug}</td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => openModal(tag)}
                                                    className="text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg tooltip" title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(tag.id)}
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

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editingId ? 'Edit Tag' : 'Add New Tag'}
                                </h2>
                                <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6">
                                <form id="tagForm" onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tag Name</label>
                                        <input 
                                            type="text" 
                                            value={data.name}
                                            onChange={e => {
                                                setData('name', e.target.value);
                                                if (!editingId) setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                                            }}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">URL Slug</label>
                                        <input 
                                            type="text" 
                                            value={data.slug}
                                            onChange={e => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                            required
                                        />
                                        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                                    </div>
                                </form>
                            </div>
                            
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2">
                                <button 
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    form="tagForm"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {editingId ? 'Save Changes' : 'Create Tag'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        
</>
    );
}
