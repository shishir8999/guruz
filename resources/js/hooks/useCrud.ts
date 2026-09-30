import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export function useCrud(resourcePath: string, initialData: any) {
    // 1. Separate States for Modals
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // 2. Form State
    const form = useForm(initialData);

    // 3. Modals Handlers
    const openAdd = () => {
        setSelectedItem(null);
        form.setData(initialData);
        form.clearErrors();
        setIsEditOpen(true);
    };

    const openEdit = (item: any) => {
        setSelectedItem(item);
        
        // Pre-fill existing data automatically
        const prefillData: any = {};
        Object.keys(initialData).forEach(key => {
            prefillData[key] = item[key] !== undefined ? item[key] : initialData[key];
        });
        
        form.setData(prefillData);
        form.clearErrors();
        setIsEditOpen(true);
    };

    const closeEdit = () => {
        setIsEditOpen(false);
        setTimeout(() => setSelectedItem(null), 200); // Wait for modal close animation
        form.reset();
        form.clearErrors();
    };

    const submitEdit = (e: React.FormEvent, customMethod = 'put') => {
        e.preventDefault();
        
        if (!selectedItem) {
            // CREATE MODE
            form.post(`/${resourcePath}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeEdit();
                    showToast('Created successfully!', 'success');
                },
                onError: () => {
                    showToast('Please fix the validation errors.', 'error');
                }
            });
        } else {
            // EDIT MODE
            form.transform((data) => ({
                ...data,
                _method: customMethod,
            })).post(`/${resourcePath}/${selectedItem.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeEdit();
                    showToast('Updated successfully!', 'success');
                },
                onError: () => {
                    showToast('Please fix the validation errors.', 'error');
                }
            });
        }
    };

    // 4. Delete Modal Handlers
    const openDelete = (item: any) => {
        setSelectedItem(item);
        setIsDeleteOpen(true);
    };

    const closeDelete = () => {
        setIsDeleteOpen(false);
        setTimeout(() => setSelectedItem(null), 200);
    };

    const confirmDelete = () => {
        if (!selectedItem) return;
        
        router.delete(`/${resourcePath}/${selectedItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeDelete();
                showToast('Deleted successfully!', 'success');
            },
            onError: () => {
                closeDelete();
                showToast('Failed to delete item.', 'error');
            }
        });
    };

    // Helper for Toast Notifications
    const showToast = (message: string, icon: 'success' | 'error') => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            title: message,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    return {
        form,
        isEditOpen,
        isDeleteOpen,
        selectedItem,
        openAdd,
        openEdit,
        closeEdit,
        submitEdit,
        openDelete,
        closeDelete,
        confirmDelete
    };
}
