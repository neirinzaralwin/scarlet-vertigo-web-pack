'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Re-add the hardcoded getProductDetails function
const getProductDetails = (productId: string) => {
    console.log(`Fetching details for product: ${productId}`); // Keep console log for debugging
    return {
        id: productId,
        name: `Sample Product ${productId}`,
        description:
            'This is a detailed description of the sample product. It highlights key features and benefits, providing potential customers with all the information they need to make an informed decision.',
        price: 99.99,
        imageUrl: 'https://images.unsplash.com/photo-1736606355698-5efdb410fe93?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Sample image URL
        category: 'Sample Category',
        sizes: ['S', 'M', 'L', 'XL'],
    };
};

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.productId as string;

    // Call the hardcoded function directly
    const product = getProductDetails(productId);

    // Remove useState, useEffect, loading, and error states

    // Simplified check (though with hardcoded data, it should always exist)
    if (!product) {
        return (
            <div className="relative flex w-full items-center justify-center min-h-screen">
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset className="flex flex-col min-h-screen p-4 sm:p-8 items-center justify-center">
                        <p>Product not found.</p>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        );
    }

    // Render details using the hardcoded product data
    return (
        <div className="relative flex w-full items-center justify-center">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="flex flex-col min-h-screen p-4 sm:p-8">
                    <header className="flex items-center gap-2 mb-4">
                        <SidebarTrigger />
                        <h1 className="text-xl font-semibold">Product Details</h1>
                    </header>

                    <main className="flex flex-col md:flex-row gap-8 flex-grow items-start justify-center mt-8">
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <div className="relative aspect-square overflow-hidden rounded-lg border">
                                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                            </div>
                        </div>

                        <div className="w-full md:w-1/2 lg:w-2/3 flex flex-col gap-4">
                            <h2 className="text-3xl font-bold">{product.name}</h2>
                            <p className="text-muted-foreground">{product.category}</p>
                            <p className="text-lg">{product.description}</p>
                            <div className="text-2xl font-semibold">${product.price.toFixed(2)}</div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="size-select" className="font-medium">
                                    Select Size:
                                </label>
                                <select id="size-select" className="border rounded p-2 w-full max-w-xs">
                                    {product.sizes.map(
                                        (
                                            size: string, // Type size as string since it's hardcoded
                                        ) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <Button size="lg" className="mt-4 w-full max-w-xs">
                                Add to Cart
                            </Button>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
