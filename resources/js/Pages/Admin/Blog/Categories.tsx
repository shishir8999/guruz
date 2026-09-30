import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Folder, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Categories({ categories }: { categories: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        slug: '',
    });

    const openModal = (category: any = null) => {
        if (category) {
            setEditingId(category.id);
            setData({
                name: category.name,
                slug: category.slug,
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
            put(route('admin.blogs.categories.update', editingId), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire('Success', 'Category updated successfully', 'success');
                }
            });
        } else {
            post(route('admin.blogs.categories.store'), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire('Success', 'Category created successfully', 'success');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Delete Category?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Yes, delete it'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.blogs.categories.destroy', id), {
                    onSuccess: () => Swal.fire('Deleted!', 'Category has been deleted.', 'success')
                });
            }
        });
    };

    return (
        <>

            <Head title="Blog Categories — Admin" />
            
            <div className="space-y-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Blog Categories</h1>
                    <button 
                        onClick={() => openModal()}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm shadow-xs"
                    >
                        <Plus className="w-4 h-4" /> Add New Category
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-100">
                            <tr>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Slug</th>
                                <th className="py-3 px-4">Post Count</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-400">No categories yet. Click "Add New Category" to create one.</td>
                                </tr>
                            ) : (
                                categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                            <Folder className="w-4 h-4 text-purple-500" />
                                            {cat.name}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">{cat.slug}</td>
                                        <td className="py-3 px-4 text-slate-500 font-mono">{cat.post_count}</td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => openModal(cat)}
                                                    className="text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg tooltip" title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cat.id)}
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
                                    {editingId ? 'Edit Category' : 'Add New Category'}
                                </h2>
                                <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6">
                                <form id="categoryForm" onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
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
                                    form="categoryForm"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {editingId ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        
</>
    );
}
