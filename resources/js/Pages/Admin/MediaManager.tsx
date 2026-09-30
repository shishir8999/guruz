import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Upload, Trash2, File as FileIcon } from 'lucide-react';
import Swal from 'sweetalert2';

interface MediaFile {
    name: string;
    path: string;
    url: string;
    size: number;
    last_modified: number;
    extension: string;
    is_image: boolean;
}

interface Props {
    files: MediaFile[];
}

export default function MediaManager({ files }: Props) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        
        setIsUploading(true);
        
        router.post('/admin/media', {
            file: file
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Uploaded!',
                    text: 'File has been uploaded successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
                setIsUploading(false);
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Upload Failed',
                    text: 'Something went wrong during upload.',
                });
                setIsUploading(false);
            },
            onFinish: () => setIsUploading(false)
        });
    };

    const handleDelete = (path: string) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete('/admin/media', {
                    data: { path },
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'File has been deleted.',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                });
            }
        });
    };

    return (
        <>

            <Head title="Media Manager" />
            
            <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Header Banner */}
                <div className="bg-[#8b5cf6] rounded-2xl p-6 md:p-8 text-white shadow-lg">
                    <h1 className="text-2xl md:text-3xl font-bold">Media Manager</h1>
                    <p className="mt-2 text-purple-100">Upload and manage site assets</p>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <input 
                            type="file" 
                            id="file-upload" 
                            className="hidden" 
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                        <label 
                            htmlFor="file-upload" 
                            className={`cursor-pointer inline-flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg font-medium transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isUploading ? 'Uploading...' : 'Upload File'}
                        </label>
                    </div>
                </div>

                {/* Files Grid */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    {files.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <FileIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <p>No media files found.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {files.map((file, index) => (
                                <div key={index} className="group relative border border-slate-200 rounded-xl p-3 flex flex-col transition-all bg-white hover:shadow-md">
                                    <div className="aspect-[4/3] bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                                        {file.is_image ? (
                                            <img 
                                                src={file.url} 
                                                alt={file.name} 
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="text-slate-400 flex flex-col items-center">
                                                <FileIcon className="w-8 h-8 mb-1" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-auto">
                                        <p className="text-xs text-slate-700 truncate font-medium mb-3" title={file.name}>
                                            {file.name}
                                        </p>
                                        <button 
                                            onClick={() => handleDelete(file.path)}
                                            className="w-fit bg-[#ef4444] hover:bg-red-600 text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
            </div>
        
</>
    );
}
