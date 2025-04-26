'use client';

import React from 'react';
import ProductForm from '@/app/products/components/ProductForm'; // Update import path
import { useRouter } from 'next/navigation';

export default function CreateProductPage() {
    const router = useRouter();

    // Optional: Callback for successful submission
    const handleSuccess = () => {
        console.log('Product created successfully, redirecting...');
        // Redirect is handled within ProductForm for now, but could be done here
        // router.push('/products');
    };

    return (
        <div className="p-6">
            {' '}
            {/* Add padding or layout container if needed */}
            <ProductForm
                // No initialData for create mode
                onSubmitSuccess={handleSuccess}
            />
        </div>
    );
}
