import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface CrudModalsProps {
    // Edit Props
    isEditOpen: boolean;
    closeEdit: () => void;
    submitEdit: (e: React.FormEvent) => void;
    editTitle?: string;
    isProcessingEdit: boolean;
    renderEditForm: () => React.ReactNode;

    // Delete Props
    isDeleteOpen: boolean;
    closeDelete: () => void;
    confirmDelete: () => void;
    deleteMessage?: string;
}

export default function CrudModals({
    isEditOpen, closeEdit, submitEdit, editTitle = "Edit Item", isProcessingEdit, renderEditForm,
    isDeleteOpen, closeDelete, confirmDelete, deleteMessage = "Are you sure you want to delete this item?"
}: CrudModalsProps) {

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isEditOpen) closeEdit();
                if (isDeleteOpen) closeDelete();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditOpen, isDeleteOpen, closeEdit, closeDelete]);

    return (
        <>
            {/* 1. EDIT MODAL */}
            {isEditOpen && (
                <div 
                    onClick={closeEdit}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    >
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{editTitle}</h3>
                            <button type="button" onClick={closeEdit} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={submitEdit}>
                            <div className="p-6 space-y-4">
                                {renderEditForm()}
                            </div>
                            
                            {/* Footer Actions */}
                            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button type="button" onClick={closeEdit} className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isProcessingEdit} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-sm cursor-pointer">
                                    {isProcessingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. DELETE WARNING MODAL */}
            {isDeleteOpen && (
                <div 
                    onClick={closeDelete}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Confirmation</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                            {deleteMessage}
                        </p>
                        
                        <div className="flex gap-3 justify-center">
                            <button type="button" onClick={closeDelete} className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition cursor-pointer">
                                No, Cancel
                            </button>
                            <button type="button" onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-600/20 cursor-pointer">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
