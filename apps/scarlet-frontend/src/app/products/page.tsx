'use client';

import React from 'react';
import ProductCard from '@/components/Home/ProductCard';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SparklesText } from '@/components/magicui/sparkles-text';

// Placeholder data - replace with actual product fetching logic
const allProducts = Array.from({ length: 12 }, (_, i) => ({ id: i }));

export default function ProductsPage() {
    return (
        <div className="relative flex w-full items-center justify-center">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="flex flex-col min-h-screen p-4 sm:p-8">
                    <header className="flex items-center gap-2 mb-4">
                        <SidebarTrigger />
                    </header>

                    <main className="flex flex-col gap-8 flex-grow items-center">
                        <div className="flex flex-col">
                            {/* <div className="text-2xl font-bold text-start mb-4">Explore Our Products</div> */}
                            <SparklesText className="mb-4 mt-4 text-lg sm:text-2xl xl:text-4xl" colors={{ first: '#32CD32', second: '#006400' }}>
                                Our Products
                            </SparklesText>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-3xl">
                                {/* Example Product Card */}
                                <ProductCard />
                                <ProductCard />
                                <ProductCard />
                                <ProductCard />
                                <ProductCard />
                                <ProductCard />
                                <ProductCard />
                                <ProductCard />
                            </div>
                        </div>
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
