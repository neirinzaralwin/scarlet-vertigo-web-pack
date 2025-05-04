'use client';
import React from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface ProductCardProps {
    productId: string | number;
}

const ProductCard: React.FC<ProductCardProps> = ({ productId }) => {
    return (
        <Link href={`/products/${productId}`}>
            <div>
                <Card className="relative overflow-hidden lg:w-[180px] md:w-[150px] w-[35vw] aspect-[3/5] py-0 transition-transform duration-200 ease-in-out hover:scale-105">
                    <img
                        src="https://images.unsplash.com/photo-1736606355698-5efdb410fe93?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="image placeholder"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </Card>

                <div className="mt-2">
                    <div className="text-lg font-semibold">Product Name</div>
                    <div className="text-sm text-muted-foreground">Category</div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
