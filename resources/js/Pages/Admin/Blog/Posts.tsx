import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { FileText, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Posts({ posts, categories }: { posts: any[], categories: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        title: '',
        slug: '',
        category_id: '',
        content: '',
        is_published: true
    });

    const openModal = (postItem: any = null) => {
        if (postItem) {
            setEditingId(postItem.id);
            // We need to find category_id from the categories array based on category name, 
            // but the backend might just be sending category name in `post.category`.
            // Let's rely on backend changes if necessary, or just try to find it:
            const matchedCategory = categories.find(c => c.name === postItem.category);
            setData({
                title: postItem.title,
                slug: postItem.slug || '', // slug wasn't in the table but let's assume it might be needed, or we just pass empty string since it's required for update. Actually, the table doesn't have slug, but update requires it. Let's add it to the update endpoint later if missing, or just handle it. For now, empty if missing.
                category_id: matchedCategory ? matchedCategory.id : '',
                content: postItem.content || '',
                is_published: postItem.status === 'Published'
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
            put(route('admin.blogs.posts.update', editingId), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire('Success', 'Post updated successfully', 'success');
                }
            });
        } else {
            post(route('admin.blogs.posts.store'), {
                onSuccess: () => {
                    closeModal();
                    Swal.fire('Success', 'Post created successfully', 'success');
                }
            });
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Delete Post?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Yes, delete it'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('admin.blogs.posts.destroy', id), {
                    onSuccess: () => Swal.fire('Deleted!', 'Post has been deleted.', 'success')
                });
            }
        });
    };

    return (
        <>

            <Head title="Blog Posts — Admin" />
            
            <div className="space-y-6 relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Blog Posts</h1>
                    <button 
                        onClick={() => openModal()}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 text-sm shadow-xs"
                    >
                        <Plus className="w-4 h-4" /> Add New Post
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-100">
                            <tr>
                                <th className="py-3 px-4">Title</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Views</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400">No posts yet. Click "Add New Post" to create one.</td>
                                </tr>
                            ) : (
                                posts.map(postItem => (
                                    <tr key={postItem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{postItem.title}</td>
                                        <td className="py-3 px-4 text-slate-500">{postItem.category}</td>
                                        <td className="py-3 px-4 text-slate-500">{postItem.date}</td>
                                        <td className="py-3 px-4 text-slate-500 font-mono">{postItem.views}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${postItem.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {postItem.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => openModal(postItem)}
                                                    className="text-purple-600 hover:bg-purple-50 p-1.5 rounded-lg tooltip" title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(postItem.id)}
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
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editingId ? 'Edit Post' : 'Add New Post'}
                                </h2>
                                <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <form id="postForm" onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Post Title</label>
                                            <input 
                                                type="text" 
                                                value={data.title}
                                                onChange={e => {
                                                    setData('title', e.target.value);
                                                    if (!editingId) setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                                required
                                            />
                                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
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
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                        <select 
                                            value={data.category_id}
                                            onChange={e => setData('category_id', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                        >
                                            <option value="">-- Select a Category --</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Content</label>
                                        <textarea 
                                            value={data.content}
                                            onChange={e => setData('content', e.target.value)}
                                            rows={8}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <input 
                                            type="checkbox" 
                                            id="is_published"
                                            checked={data.is_published}
                                            onChange={e => setData('is_published', e.target.checked)}
                                            className="rounded text-purple-600 focus:ring-purple-500"
                                        />
                                        <label htmlFor="is_published" className="text-sm font-medium text-slate-700">Publish this post</label>
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
                                    form="postForm"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-70"
                                >
                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    {editingId ? 'Save Changes' : 'Create Post'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        
</>
    );
}
