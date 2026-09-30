import React, { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function FlashMessages() {
    const { flash, errors } = usePage<any>().props;
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
        }

        if (flash?.success) {
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

        if (flash?.error) {
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
        
        if (errors && Object.keys(errors).length > 0) {
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
    }, [flash, errors]);

    return null; // This component doesn't render any DOM elements
}
