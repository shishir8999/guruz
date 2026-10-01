import React, { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function FlashMessages() {
    const { flash, errors } = usePage<any>().props;
    const lastShownSuccessRef = useRef<string | null>(null);
    const lastShownErrorRef = useRef<string | null>(null);
    const lastShownValidationRef = useRef<string | null>(null);

    useEffect(() => {
        // Only show success toast if it's genuinely new content and hasn't been shown yet
        if (flash?.success) {
            if (flash.success !== lastShownSuccessRef.current) {
                lastShownSuccessRef.current = flash.success;
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: flash.success,
                    timer: 3000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
        } else {
            lastShownSuccessRef.current = null;
        }

        // Only show error toast if it's genuinely new content
        if (flash?.error) {
            if (flash.error !== lastShownErrorRef.current) {
                lastShownErrorRef.current = flash.error;
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: flash.error,
                    timer: 4000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
        } else {
            lastShownErrorRef.current = null;
        }
        
        // Validation errors guard
        if (errors && Object.keys(errors).length > 0) {
            const errKey = JSON.stringify(errors);
            if (errKey !== lastShownValidationRef.current) {
                lastShownValidationRef.current = errKey;
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Please check the form for errors and try again.',
                    timer: 4000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
            }
        } else {
            lastShownValidationRef.current = null;
        }
    }, [flash, errors]);

    return null;
}
