'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useParams and useRouter
import ProductForm from '@/app/products/components/ProductForm'; // Update import path
import { productService, Product } from '@/services/product.service'; // Import product service and type

export default function EditProductPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string; // Get product ID from URL

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('Product ID is missing.');
            setIsLoading(false);
            // Optionally redirect if ID is invalid/missing
            // router.push('/products');
            return;
        }

        const fetchProduct = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedProduct = await productService.getProductById(id);
                setProduct(fetchedProduct);
            } catch (err) {
                console.error('Failed to fetch product:', err);
                setError(err instanceof Error ? err.message : 'Failed to load product data.');
                // Optionally redirect if product not found
                // if (err.message.includes('not found')) router.push('/products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id, router]); // Depend on id and router

    // Optional: Callback for successful submission
    const handleSuccess = () => {
        console.log('Product updated successfully, redirecting...');
        // Redirect is handled within ProductForm for now, but could be done here
        // router.push('/products');
    };

    if (isLoading) {
        return <div className="p-6 text-center">Loading product details...</div>; // Or a spinner component
    }

    if (error) {
        return (
            <div className="p-6 space-y-4">
                <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded dark:bg-red-900 dark:text-red-300 dark:border-red-800" role="alert">
                    Error: {error}
                </div>
                <button onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Go Back
                </button>
            </div>
        );
    }

    if (!product) {
        // This case might be covered by the error state if fetch fails,
        // but added for robustness.
        return <div className="p-6 text-center">Product not found.</div>;
    }

    return (
        <div className="p-6">
            {' '}
            {/* Add padding or layout container if needed */}
            <ProductForm
                initialData={product}
                onSubmitSuccess={handleSuccess}
                // Pass loading/error states if you want the form to reflect page-level loading/errors
                // isLoading={isLoading}
                // apiError={error}
            />
        </div>
    );
}
