import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

/**
 * Reusable Custom Hook for Inertia.js CRUD Operations
 * 
 * @param resourcePath The base URI path (e.g., 'admin/categories' or 'admin/marketing/coupons')
 * @param initialData The default empty state for your form
 */
export function useResource(resourcePath, initialData) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Initialize Inertia useForm
    const form = useForm(initialData);

    /**
     * Opens the modal and pre-fills the data for editing.
     * @param item The resource object from the database
     */
    const openEditModal = (item) => {
        setEditingItem(item);
        // We dynamically populate the form based on initialData keys
        const prefillData = {};
        Object.keys(initialData).forEach(key => {
            // Handle date parsing or null values appropriately if needed,
            // otherwise directly map item properties to form state.
            prefillData[key] = item[key] !== undefined ? item[key] : initialData[key];
        });
        
        form.setData(prefillData);
        form.clearErrors();
        setIsEditModalOpen(true);
    };

    /**
     * Closes the edit modal and resets the form.
     */
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingItem(null);
        form.reset();
        form.clearErrors();
    };

    /**
     * Handles the update action via PUT/PATCH.
     * @param e React FormEvent
     * @param onSuccess Callback for when update succeeds
     */
    const handleUpdate = (e, onSuccess = null) => {
        e.preventDefault();
        if (!editingItem) return;

        form.transform((data) => ({
            ...data,
            _method: 'put',
        })).post(`/${resourcePath}/${editingItem.id}`, {
            preserveScroll: true,
            onSuccess: (page) => {
                closeEditModal();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Updated successfully!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
                if (onSuccess) onSuccess(page);
            },
            onError: (errors) => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Please fix the validation errors.',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    /**
     * Handles the delete action with a SweetAlert2 confirmation.
     * @param id The ID of the resource to delete
     */
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this action!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444', // Tailwind red-500
            cancelButtonColor: '#64748b', // Tailwind slate-500
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/${resourcePath}/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'Deleted successfully!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    },
                    onError: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'error',
                            title: 'Something went wrong.',
                            showConfirmButton: false,
                            timer: 3000,
                        });
                    }
                });
            }
        });
    };

    return {
        form,
        isEditModalOpen,
        editingItem,
        openEditModal,
        closeEditModal,
        handleUpdate,
        handleDelete
    };
}
